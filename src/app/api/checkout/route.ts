import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items, shippingAddress, billingAddress } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    // Server-side price lookup: fetch actual products from DB
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // Build a map for quick lookup
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Validate all products exist
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }
    }

    // Stock validation: ensure every product has sufficient stock
    for (const item of items) {
      const product = productMap.get(item.productId)!;
      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}`,
          },
          { status: 400 }
        );
      }
    }

    // Calculate totals using server-side prices
    const subtotal = items.reduce((sum: number, item: any) => {
      const product = productMap.get(item.productId)!;
      return sum + Number(product.price) * item.quantity;
    }, 0);
    const shipping = subtotal > 50 ? 0 : 10;
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;

    // Create order and decrement stock in a transaction to prevent race conditions
    const order = await prisma.$transaction(async (tx) => {
      // Decrement stock for each product
      for (const item of items) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (updated.count === 0) {
          throw new Error(
            `Insufficient stock for "${productMap.get(item.productId)!.name}". Please refresh and try again.`
          );
        }
      }

      // Create the order with server-side prices
      return tx.order.create({
        data: {
          userId: session.user.id,
          total,
          status: "PENDING",
          shippingAddress: JSON.parse(JSON.stringify(shippingAddress)),
          billingAddress: billingAddress
            ? JSON.parse(JSON.stringify(billingAddress))
            : null,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: Number(productMap.get(item.productId)!.price),
            })),
          },
        },
      });
    });

    // Create Stripe checkout session using server-side prices and real product names
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: session.user.email || undefined,
      line_items: items.map((item: any) => {
        const product = productMap.get(item.productId)!;
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
            },
            unit_amount: Math.round(Number(product.price) * 100),
          },
          quantity: item.quantity,
        };
      }),
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: Math.round(shipping * 100),
              currency: "usd",
            },
            display_name: shipping === 0 ? "Free shipping" : "Standard shipping",
          },
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
      metadata: {
        orderId: order.id,
      },
    });

    // Update order with payment intent ID
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentIntentId: checkoutSession.id },
    });

    return NextResponse.json({ sessionId: checkoutSession.id });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
