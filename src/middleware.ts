/**
 * Next.js Middleware
 *
 * Server-side route protection and request handling.
 * This provides security at the edge before requests reach API routes.
 *
 * CRITICAL P0 FIX: Admin routes were only protected client-side (easily bypassed).
 * This middleware provides server-side protection.
 */

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Protect admin routes - require ADMIN role
    if (path.startsWith("/admin")) {
      if (!token) {
        // Not authenticated - redirect to login
        return NextResponse.redirect(new URL("/login", req.url));
      }

      if (token.role !== "ADMIN") {
        // Authenticated but not admin - redirect to home
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Protect account routes - require authentication
    if (path.startsWith("/account")) {
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    // Protect checkout - require authentication
    if (path.startsWith("/checkout")) {
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Always allow access to public routes
        if (
          path === "/" ||
          path.startsWith("/products") ||
          path.startsWith("/login") ||
          path.startsWith("/signup") ||
          path.startsWith("/api/auth") ||
          path.startsWith("/api/webhooks") || // Webhooks must be public
          path.startsWith("/_next") ||
          path.startsWith("/favicon")
        ) {
          return true;
        }

        // For protected routes, require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
