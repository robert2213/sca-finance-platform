import { NextResponse, type NextRequest, type NextFetchEvent } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Authentication middleware.
 *
 * Backward compatible: when Clerk is NOT configured (no publishable + secret
 * key) this is a no-op pass-through — the platform runs as the original
 * single-tenant demo with every route public. When Clerk IS configured, all
 * application and API routes require authentication; only the public allowlist
 * (marketing + Clerk's own auth pages) stays open.
 */

const clerkEnabled = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
);

// Public routes that never require authentication.
const isPublicRoute = createRouteMatcher([
  "/architecture",        // static marketing/architecture walkthrough
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/db/test",         // unauthenticated infra health check only
]);

// Lazily construct the Clerk handler so nothing touches Clerk in demo mode.
let _handler: ((req: NextRequest, ev: NextFetchEvent) => unknown) | null = null;
function clerkHandler() {
  if (!_handler) {
    _handler = clerkMiddleware(async (auth, req) => {
      if (!isPublicRoute(req)) {
        await auth.protect();
      }
    }) as unknown as (req: NextRequest, ev: NextFetchEvent) => unknown;
  }
  return _handler;
}

export default function middleware(req: NextRequest, ev: NextFetchEvent) {
  if (!clerkEnabled) return NextResponse.next();
  return clerkHandler()(req, ev);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
