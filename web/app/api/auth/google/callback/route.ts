import { NextRequest, NextResponse } from "next/server"

import { applyAuthCookies } from "@/lib/auth-cookies"
import { getBackendUrl } from "@/lib/backend-url"

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(new URL("/signup?error=google_auth_failed", req.url))
  }

  const backendRes = await fetch(`${getBackendUrl()}/auth/google/exchange`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  })

  if (!backendRes.ok) {
    return NextResponse.redirect(new URL("/signup?error=google_auth_failed", req.url))
  }

  const body = (await backendRes.json()) as {
    data?: { accessToken?: string; refreshToken?: string }
  }

  const accessToken = body.data?.accessToken
  const refreshToken = body.data?.refreshToken

  if (!accessToken || !refreshToken) {
    return NextResponse.redirect(new URL("/signup?error=google_auth_failed", req.url))
  }

  const response = NextResponse.redirect(new URL("/dashboard", req.url))
  applyAuthCookies(response, accessToken, refreshToken)
  return response
}
