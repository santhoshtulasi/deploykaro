import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Global Route Protection — DeployKaro
 *
 * All feature routes require authentication.
 * Public routes: / (landing), /onboarding, /api/auth/*
 * Protected routes: /dashboard, /mentor, /interview, /learning, /tracks
 */
export default withAuth(
  function middleware(req) {
    // Allow the request through — withAuth already checked the token
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/",   // Redirect unauthenticated users to the landing page
    },
  }
);

// Apply the middleware only to protected routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/mentor/:path*",
    "/interview/:path*",
    "/learning/:path*",
    "/tracks/:path*",
  ],
};
