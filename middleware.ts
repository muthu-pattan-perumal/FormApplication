import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCurrentUser } from "./lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip auth for /submit/* routes
  if (pathname.startsWith("/submit")) {
    return NextResponse.next();
  }

  // Protect /dashboard/*
  if (pathname.startsWith("/dashboard")) {
    const user = await getCurrentUser();
    if (!user) {
      const url = req.nextUrl.clone();
      url.pathname = "/sign-in";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/submit/:path*"], // still match /submit to let middleware pass
};
