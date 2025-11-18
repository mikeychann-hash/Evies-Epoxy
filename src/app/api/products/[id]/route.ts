import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, RATE_LIMITS } from "@/lib/ratelimit";
import { productUpdateSchema, productIdSchema } from "@/lib/validations";

/**
 * GET /api/products/[id]
 *
 * P1-3 FIX: Added missing product detail endpoint
 * P1-1 FIX: Added rate limiting
 *
 * Get a single product by ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // P1-1: Apply rate limiting
    const rateLimit = await applyRateLimit(request, RATE_LIMITS.API_READ);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: rateLimit.headers }
      );
    }

    // Validate product ID
    const validation = productIdSchema.safeParse({ id: params.id });
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Only return active products to non-admin users
    const session = await getServerSession(authOptions);
    if (!product.isActive && session?.user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { product },
      { headers: rateLimit.headers }
    );
  } catch (error) {
    console.error("❌ Get product error:", error);

    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/products/[id]
 *
 * P1-3 FIX: Added missing product update endpoint
 * P1-1 FIX: Added rate limiting
 * P1-2 FIX: Proper validation, no `any` types
 *
 * Update a product (Admin only)
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // P1-1: Apply rate limiting
    const rateLimit = await applyRateLimit(
      request,
      RATE_LIMITS.API_WRITE,
      session.user.id
    );
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: rateLimit.headers }
      );
    }

    // Validate product ID
    const idValidation = productIdSchema.safeParse({ id: params.id });
    if (!idValidation.success) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // P1-2: Validate input with Zod
    const validation = productUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // If slug is being updated, check it's not taken
    if (data.slug && data.slug !== existing.slug) {
      const slugTaken = await prisma.product.findUnique({
        where: { slug: data.slug },
      });

      if (slugTaken) {
        return NextResponse.json(
          { error: "Product with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // If category is being updated, check it exists
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 400 }
        );
      }
    }

    const product = await prisma.product.update({
      where: { id: params.id },
      data,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    console.log(`✅ Product updated: ${product.name} (${product.id})`);

    return NextResponse.json(
      { product },
      { headers: rateLimit.headers }
    );
  } catch (error) {
    console.error("❌ Update product error:", error);

    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[id]
 *
 * P1-3 FIX: Added missing product delete endpoint
 * P1-1 FIX: Added rate limiting
 *
 * Delete a product (Admin only)
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // P1-1: Apply rate limiting (strictest for delete operations)
    const rateLimit = await applyRateLimit(
      request,
      RATE_LIMITS.API_DELETE,
      session.user.id
    );
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: rateLimit.headers }
      );
    }

    // Validate product ID
    const validation = productIdSchema.safeParse({ id: params.id });
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // Check if product exists
    const existing = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        orderItems: {
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if product has been ordered
    if (existing.orderItems.length > 0) {
      // Don't actually delete, just mark as inactive
      const product = await prisma.product.update({
        where: { id: params.id },
        data: { isActive: false },
      });

      console.log(
        `⚠️ Product deactivated (has orders): ${product.name} (${product.id})`
      );

      return NextResponse.json(
        {
          message:
            "Product has been ordered before and was deactivated instead of deleted",
          product,
        },
        { headers: rateLimit.headers }
      );
    }

    // Safe to delete
    await prisma.product.delete({
      where: { id: params.id },
    });

    console.log(`✅ Product deleted: ${existing.name} (${existing.id})`);

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { headers: rateLimit.headers }
    );
  } catch (error) {
    console.error("❌ Delete product error:", error);

    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
