import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, RATE_LIMITS } from "@/lib/ratelimit";
import { categoryUpdateSchema } from "@/lib/validations";

/**
 * PUT /api/categories/[id]
 *
 * P1-3 FIX: Added missing category update endpoint
 * P1-1 FIX: Added rate limiting
 * P1-2 FIX: Proper validation, no `any` types
 *
 * Update a category (Admin only)
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

    // Apply rate limiting
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

    // Check if category exists
    const existing = await prisma.category.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate input with Zod
    const validation = categoryUpdateSchema.safeParse(body);
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
      const slugTaken = await prisma.category.findUnique({
        where: { slug: data.slug },
      });

      if (slugTaken) {
        return NextResponse.json(
          { error: "Category with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data,
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    console.log(`✅ Category updated: ${category.name} (${category.id})`);

    return NextResponse.json(
      { category },
      { headers: rateLimit.headers }
    );
  } catch (error) {
    console.error("❌ Update category error:", error);

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
 * DELETE /api/categories/[id]
 *
 * P1-3 FIX: Added missing category delete endpoint
 * P1-1 FIX: Added rate limiting
 *
 * Delete a category (Admin only)
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

    // Apply rate limiting
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

    // Check if category exists
    const existing = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        products: {
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category has products
    if (existing.products.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete category with products. Please reassign or delete products first.",
        },
        { status: 400 }
      );
    }

    // Safe to delete
    await prisma.category.delete({
      where: { id: params.id },
    });

    console.log(`✅ Category deleted: ${existing.name} (${existing.id})`);

    return NextResponse.json(
      { message: "Category deleted successfully" },
      { headers: rateLimit.headers }
    );
  } catch (error) {
    console.error("❌ Delete category error:", error);

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
