import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { SIGN_IN_URL } from "@/lib/clerk/config";

/**
 * CSRF PROTECTION NOTE
 *
 * This application relies on two complementary mechanisms for CSRF protection:
 *
 * 1. SameSite=Lax cookies — Clerk sets session cookies with `SameSite=Lax`
 *    and `HttpOnly` by default. Lax prevents cross-origin POST/PUT/DELETE
 *    requests from automatically including the session cookie, neutralising
 *    classic CSRF attacks against mutation endpoints.
 *
 * 2. Authorization header requirement — all authenticated mutations require a
 *    valid Clerk session token sent in the `Authorization` header (via
 *    `auth()` inside the route handler). Cross-origin requests cannot set
 *    arbitrary headers (blocked by the browser's Same-Origin Policy and the
 *    CORS preflight mechanism), so a forged cross-origin request cannot
 *    supply the session token header even if it somehow bypassed the cookie
 *    restriction.
 *
 * Together these two defences make a dedicated CSRF token unnecessary for
 *    this application's current threat model. No additional `SameSite` or
 *    CSRF-token configuration is required.
 *
 * IMPORTANT: Do NOT override `SameSite=None` in any `Set-Cookie` header
 *    without also setting `Secure`. A `SameSite=None` cookie without
 *    `Secure` is rejected by modern browsers and would also re-expose the
 *    application to CSRF if somehow accepted.
 */

const isProtected = createRouteMatcher([
  "/(admin)(.*)",
  "/(shop)/cart",
  "/(shop)/checkout",
  "/(shop)/orders(.*)",
  "/(shop)/account",
  "/(shop)/messages(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) {
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL(SIGN_IN_URL, req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
