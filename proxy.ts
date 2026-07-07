import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { SIGN_IN_URL } from "@/lib/clerk/config";

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
