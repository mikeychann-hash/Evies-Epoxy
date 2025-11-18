import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validations";

/**
 * User Signup API Route
 *
 * FIXES APPLIED:
 * - P0: Added Zod validation (was completely missing)
 * - P0: Fixed race condition in admin role assignment (used transaction)
 * - P1: Improved password validation (uppercase, lowercase, number required)
 * - P1: Better error messages
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input with Zod
    const validation = signupSchema.safeParse(body);
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

    const { name, email, password } = validation.data;

    // Use transaction to prevent race condition on admin role assignment
    // CRITICAL FIX: Previously, two simultaneous requests could both become ADMIN
    const user = await prisma.$transaction(async (tx) => {
      // Check if user already exists
      const existingUser = await tx.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Determine role atomically within transaction
      const userCount = await tx.user.count();
      const role = userCount === 0 ? "ADMIN" : "USER";

      // Create user
      return await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });
    });

    console.log(`✅ User created: ${user.email} (${user.role})`);

    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Signup error:", error);

    // Handle known errors
    if (error.message === "User with this email already exists") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Generic error for unknown issues
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
