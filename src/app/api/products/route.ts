import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, RATE_LIMITS } from "@/lib/ratelimit";
import { productFilterSchema, productSchema } from "@/lib/validations";

/**
 * GET /api/products
 *
 * P1-4 FIX: Added pagination to prevent memory exhaustion
 * P1-1 FIX: Added rate limiting
 * P1-2 FIX: Replaced `any` with proper types
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - category: string (category slug)
 * - featured: boolean
 * - search: string
 * - minPrice: number
 * - maxPrice: number
 * - sortBy: "price" | "name" | "createdAt"
 * - sortOrder: "asc" | "desc"
 */
export async function GET(request: Request) {
  try {
    // P1-1: Apply rate limiting
    const rateLimit = await applyRateLimit(request, RATE_LIMITS.API_READ);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: rateLimit.headers }
      );
    }

    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const queryParams = {
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      category: searchParams.get("category"),
      featured: searchParams.get("featured"),
      search: searchParams.get("search"),
      minPrice: searchParams.get("minPrice"),
      maxPrice: searchParams.get("maxPrice"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
    };

    const validation = productFilterSchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const {
      page,
      limit,
      category,
      featured,
      search,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
    } = validation.data;

    // Build where clause
    const where = {
      isActive: true,
      ...(featured !== undefined && { isFeatured: featured }),
      ...(category && { category: { slug: category } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...((minPrice !== undefined || maxPrice !== undefined) && {
        price: {
          ...(minPrice !== undefined && { gte: minPrice }),
          ...(maxPrice !== undefined && { lte: maxPrice }),
        },
      }),
    };

    // P1-4: Implement pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination metadata
    const total = await prisma.product.count({ where });

    // Get paginated products
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: sortBy
        ? { [sortBy]: sortOrder }
        : { createdAt: "desc" },
      skip,
      take: limit,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json(
      {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
      },
      { headers: rateLimit.headers }
    );
  } catch (error) {
    console.error("❌ Get products error:", error);

    // P1-5: Don't leak error details in production
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
 * POST /api/products
 *
 * P1-1 FIX: Added rate limiting
 * P1-2 FIX: Replaced `any` with proper validation
 * P1-5 FIX: Improved error handling
 *
 * Creates a new product (Admin only)
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // P1-1: Apply rate limiting (stricter for write operations)
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

    // P1-2: Validate input with Zod (no more `any` types)
    const validation = productSchema.safeParse(body);
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
    const existing = await prisma.product.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Product with this slug already exists" },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        images: data.images,
        categoryId: data.categoryId,
        stock: data.stock,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
      },
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

    console.log(`✅ Product created: ${product.name} (${product.id})`);

    return NextResponse.json(
      { product },
      { status: 201, headers: rateLimit.headers }
    );
  } catch (error) {
    console.error("❌ Create product error:", error);

    // P1-5: Don't leak error details in production
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
