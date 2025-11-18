/**
 * Stripe Webhook Handler
 *
 * CRITICAL P0 FIX: This was completely missing from the original codebase.
 * Without this webhook, orders remain in PENDING status forever and payment
 * verification never occurs - a critical security and functionality gap.
 *
 * This webhook handles:
 * - checkout.session.completed: Mark order as paid and update status
 * - payment_intent.succeeded: Confirm payment received
 * - payment_intent.payment_failed: Handle failed payments
 */

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = headers().get("stripe-signature");

    if (!signature) {
      console.error("❌ Missing Stripe signature header");
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    if (!webhookSecret) {
      console.error("❌ STRIPE_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    // Log webhook event
    console.log(`✅ Webhook received: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout session completion
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      console.error("❌ No orderId in session metadata");
      return;
    }

    console.log(`📦 Processing checkout completion for order: ${orderId}`);

    // Update order status to PROCESSING (payment confirmed)
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PROCESSING",
        paymentIntentId: session.payment_intent as string,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Decrement stock for each item
    for (const item of order.items) {
      if (item.product) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
        console.log(`✅ Decremented stock for product ${item.productId}: -${item.quantity}`);
      }
    }

    console.log(`✅ Order ${orderId} updated to PROCESSING and stock decremented`);

    // TODO: Send order confirmation email
    // TODO: Notify admin of new order
  } catch (error) {
    console.error("❌ Error handling checkout completion:", error);
    throw error;
  }
}

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log(`💰 Payment succeeded: ${paymentIntent.id}`);

    // Find order by payment intent ID
    const order = await prisma.order.findFirst({
      where: { paymentIntentId: paymentIntent.id },
    });

    if (!order) {
      console.warn(`⚠️ No order found for payment intent: ${paymentIntent.id}`);
      return;
    }

    // Ensure order is marked as PROCESSING
    if (order.status === "PENDING") {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "PROCESSING" },
      });
      console.log(`✅ Order ${order.id} status updated to PROCESSING`);
    }
  } catch (error) {
    console.error("❌ Error handling payment intent succeeded:", error);
    throw error;
  }
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log(`❌ Payment failed: ${paymentIntent.id}`);

    // Find order by payment intent ID
    const order = await prisma.order.findFirst({
      where: { paymentIntentId: paymentIntent.id },
    });

    if (!order) {
      console.warn(`⚠️ No order found for payment intent: ${paymentIntent.id}`);
      return;
    }

    // Mark order as CANCELLED
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });

    console.log(`✅ Order ${order.id} marked as CANCELLED due to payment failure`);

    // TODO: Send payment failure notification to customer
  } catch (error) {
    console.error("❌ Error handling payment intent failed:", error);
    throw error;
  }
}
