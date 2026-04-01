import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const path = req.nextUrl.pathname;
  const role = token?.role as string | undefined;

  if (!token) {
    if (path.startsWith("/api/")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (path.startsWith("/api/admin/jobs") || path.startsWith("/admin/jobs")) {
    if (role === "ADMIN" || role === "STAFF") {
      return NextResponse.next();
    }
  } else if (path.startsWith("/api/admin") || path.startsWith("/admin")) {
    if (role === "ADMIN") {
      return NextResponse.next();
    }
  } else {
    return NextResponse.next();
  }

  if (path.startsWith("/api/")) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  return NextResponse.redirect(new URL("/dashboard", req.url));
}

export const config = {
  matcher: ["/api/admin/:path*", "/admin/:path*", "/dashboard/:path*", "/chat/:path*"],
};
