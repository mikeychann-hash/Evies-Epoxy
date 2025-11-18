import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, RATE_LIMITS } from "@/lib/ratelimit";
import { categorySchema } from "@/lib/validations";

/**
 * GET /api/categories
 *
 * P1-3 FIX: Added missing category endpoints
 * P1-1 FIX: Added rate limiting
 *
 * Get all categories
 */
export async function GET(request: Request) {
  try {
    // Apply rate limiting
    const rateLimit = await applyRateLimit(request, RATE_LIMITS.API_READ);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: rateLimit.headers }
      );
    }

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(
      { categories },
      { headers: rateLimit.headers }
    );
  } catch (error) {
    console.error("❌ Get categories error:", error);

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
 * POST /api/categories
 *
 * P1-3 FIX: Added missing category create endpoint
 * P1-1 FIX: Added rate limiting
 * P1-2 FIX: Proper validation, no `any` types
 *
 * Create a new category (Admin only)
 */
export async function POST(request: Request) {
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

    const body = await request.json();

    // Validate input with Zod
    const validation = categorySchema.safeParse(body);
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

    // Check if slug already exists
    const existing = await prisma.category.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Category with this slug already exists" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        image: data.image,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    console.log(`✅ Category created: ${category.name} (${category.id})`);

    return NextResponse.json(
      { category },
      { status: 201, headers: rateLimit.headers }
    );
  } catch (error) {
    console.error("❌ Create category error:", error);

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
