import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyIdToken } from "./src/lib/firebase/verify-session";

const PROTECTED_PATHS = ["/dashboard"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PROTECTED_PATHS.some((path) => pathname.startsWith(path))) {
    const sessionCookie = request.cookies.get("firebaseSession")?.value;
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    try {
      await verifyIdToken(sessionCookie);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard"],
};
