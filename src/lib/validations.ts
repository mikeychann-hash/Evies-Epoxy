/**
 * Zod Validation Schemas
 *
 * Centralized validation schemas for API routes and forms.
 * This addresses the critical P0 issue: "Zod installed but completely unused"
 */

import { z } from "zod";

// ============================================================================
// Authentication Schemas
// ============================================================================

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ============================================================================
// Product Schemas
// ============================================================================

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000),
  price: z.number().positive("Price must be positive").max(999999),
  compareAtPrice: z.number().positive().max(999999).optional().nullable(),
  stock: z.number().int().min(0, "Stock cannot be negative").max(999999),
  categoryId: z.string().uuid("Invalid category ID"),
  images: z.array(z.string().url()).min(1, "At least one image is required").max(10),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
});

export const productUpdateSchema = productSchema.partial();

export const productIdSchema = z.object({
  id: z.string().uuid("Invalid product ID"),
});

// ============================================================================
// Order & Checkout Schemas
// ============================================================================

export const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  address: z.string().min(5, "Address is required").max(200),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(2, "State is required").max(50),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),
  country: z.string().min(2, "Country is required").max(2).default("US"),
});

export const checkoutItemSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  quantity: z.number().int().positive("Quantity must be positive").max(100),
  // NOTE: Price is intentionally NOT included here - it should be fetched from DB
  // to prevent price manipulation attacks
});

export const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "Cart cannot be empty"),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
});

export const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

// ============================================================================
// Category Schemas
// ============================================================================

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().max(500).optional().nullable(),
  image: z.string().url("Invalid image URL").optional().nullable(),
});

export const categoryUpdateSchema = categorySchema.partial();

// ============================================================================
// Query Parameter Schemas
// ============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const productFilterSchema = paginationSchema.extend({
  categoryId: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  isFeatured: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(["price", "name", "createdAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Validates data against a schema and returns typed result
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown) {
  return schema.safeParse(data);
}

/**
 * Validates data or throws a formatted error
 */
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(
      result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")
    );
  }
  return result.data;
}

// ============================================================================
// Type Exports
// ============================================================================

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductFilter = z.infer<typeof productFilterSchema>;
