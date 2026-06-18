import { NextRequest, NextResponse } from "next/server"

const PROTECTED = ["/dashboard"]
const AUTH_PAGES = ["/login", "/signup"]

export function proxy(req: NextRequest) {
  const hasSession =
    req.cookies.has("access_token") || req.cookies.has("refresh_token")
  const { pathname } = req.nextUrl

  if (PROTECTED.some((p) => pathname.startsWith(p)) && !hasSession) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (AUTH_PAGES.some((p) => pathname.startsWith(p)) && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
}
