import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const pathname = req.nextUrl.pathname;

        // Admin routes require ADMIN role
        if (pathname.startsWith("/admin")) {
          return token !== null && token.role === "ADMIN";
        }

        // Other protected routes just require authentication
        return token !== null;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/checkout"],
};
