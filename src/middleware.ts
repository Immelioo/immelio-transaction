import { NextRequest, NextResponse } from "next/server";

const ADMIN_PATHS = /^\/admin(?!\/login)(\/|$)/;
const PRO_PATHS = /^\/pro(?!\/(login|setup))(\/|$)/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const needsAdminAuth = ADMIN_PATHS.test(pathname);
  const needsProAuth = PRO_PATHS.test(pathname);

  if (!needsAdminAuth && !needsProAuth) return NextResponse.next();

  const token = request.cookies.get("auth-token")?.value;

  if (!token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = needsAdminAuth ? "/admin/login" : "/pro/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/pro/:path*"],
};
