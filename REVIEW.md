# Codebase Review: Evie's Epoxy

**Project:** Next.js 14 e-commerce platform for epoxy resin products
**Stack:** TypeScript, Next.js App Router, Prisma/PostgreSQL, Stripe, Zustand, TailwindCSS
**Reviewed:** 2026-02-06

---

## CRITICAL SECURITY ISSUES

### 1. Client-trusted pricing in checkout
**File:** `src/app/api/checkout/route.ts:26-28`

The checkout API trusts `item.price` sent from the client. An attacker can modify the price in the request body to pay any amount they want. The server must look up prices from the database using `item.productId` and ignore client-supplied prices entirely. The same issue affects the Stripe line items at line 64.

### 2. No stock validation during checkout
**File:** `src/app/api/checkout/route.ts:34-52`

Orders are created without checking if products have sufficient stock, and stock is never decremented. Overselling is possible and stock counts are meaningless.

### 3. Race condition in first-user-is-admin
**File:** `src/app/api/auth/signup/route.ts:40-41`

Two concurrent signup requests can both see `userCount === 0` and both become ADMIN. Should use a database transaction with a lock, or reference the `ADMIN_EMAIL` env var that is defined in `.env.example` but never used.

### 4. No input validation on product creation
**File:** `src/app/api/products/route.ts:44-60`

The POST endpoint accepts raw JSON and passes it to Prisma without schema validation. Missing fields produce 500 errors. Negative prices, empty names, etc. are all accepted.

### 5. Error message leakage in checkout
**File:** `src/app/api/checkout/route.ts:97`

Raw Stripe/Prisma error messages are returned to the client via `error.message`, potentially exposing internal details.

---

## SIGNIFICANT BUGS

### 6. Product detail page uses hardcoded mock data
**File:** `src/app/products/[slug]/page.tsx:6-33`

The `params.slug` is received but never used to fetch from the database. Always renders the same "Ocean Wave Coaster Set" regardless of URL.

### 7. ProductsGrid and FeaturedProducts use mock data
**Files:** `src/components/products/ProductsGrid.tsx:9-23`, `src/components/home/FeaturedProducts.tsx:10-69`

The products API (`/api/products`) exists but these components never call it. Sort dropdown and pagination in ProductsGrid are non-functional UI.

### 8. Admin dashboard shows all zeros
**File:** `src/app/admin/page.tsx:15-20`

Stats state initialized with zeros, never populated via API call. The dashboard is a non-functional shell.

### 9. Cart clears unconditionally on success page
**File:** `src/app/checkout/success/page.tsx:18-21`

Cart clears when the success page loads regardless of payment status. Navigating directly to `/checkout/success` empties the cart.

### 10. `toast.info()` does not exist in react-hot-toast
**Files:** `src/app/login/page.tsx:144,165`

`toast.info()` is not part of the react-hot-toast API and will throw at runtime. Use `toast()` or `toast.success()` instead.

### 11. Checkout email field doesn't update with session
**File:** `src/app/checkout/page.tsx:32`

Session loads async, so email always starts empty. `useState` initial value doesn't update when session arrives.

---

## ARCHITECTURAL CONCERNS

### 12. `images.domains` is deprecated in Next.js 14
**File:** `next.config.mjs:4`

Should use `remotePatterns` instead of the deprecated `domains` configuration.

### 13. `experimental.optimizeCss` requires critters
**File:** `next.config.mjs:11`

The `critters` package is not in `package.json`. CSS optimization will silently fail or error.

### 14. No middleware for route protection
**File:** `src/app/admin/page.tsx:22-28`

Admin page uses client-side redirect, meaning the full page HTML is served to unauthorized users before JavaScript redirects them. Should use Next.js `middleware.ts`.

### 15. Cart store performance
**File:** `src/store/cartStore.ts:67-76`

`getTotal()` and `getItemCount()` trigger re-renders on every store change, not just when computed values change. These should be proper derived selectors.

### 16. `Float` for monetary values
**File:** `prisma/schema.prisma:93,95,116,136`

Using `Float` for prices introduces floating-point precision errors. Use `Decimal` or store cents as `Int`.

### 17. Docker Compose uses `prisma db push`
**File:** `docker-compose.yml:45`

`prisma db push` is for prototyping. Production should use `prisma migrate deploy` with migration history.

---

## INCOMPLETE FEATURES

- **Dead nav links:** `/categories`, `/about`, `/contact`, `/forgot-password`, `/terms`, `/privacy`, `/account/orders` have no pages
- **Search button** in Navbar has no handler
- **"Remember me"** checkbox is not wired to state
- **Social login** buttons show "Coming soon!" toasts
- **Admin action buttons** have no routing
- **Wishlist** toasts show "Added to wishlist!" with no backing functionality
- **`ADMIN_EMAIL` env var** is defined but never referenced in code

---

## DATA & TYPE ISSUES

- Duplicate `CartItem` type in `src/types/index.ts` and `src/store/cartStore.ts`
- Multiple `as any` casts to bypass mock data / `Product` interface mismatches
- Mock products missing required `category` field from `Product` interface
- `version: '3.8'` in docker-compose.yml is deprecated

---

## SUMMARY

| Category | Count |
|----------|-------|
| Critical Security | 5 |
| Significant Bugs | 6 |
| Architectural | 6 |
| Incomplete Features | 7 |
| Data/Type Issues | 4 |

### Top Priorities
1. **Server-side price validation** in checkout - prices must come from database
2. **Stock checking and decrement** during order creation
3. **Race condition fix** for admin role assignment
4. **Replace mock data** with actual database queries
5. **Add Zod validation** on all API route inputs
