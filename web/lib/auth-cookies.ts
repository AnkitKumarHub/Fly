import type { NextResponse } from "next/server"

const ACCESS_TOKEN_MAX_AGE_S = 15 * 60
const REFRESH_TOKEN_MAX_AGE_S = 7 * 24 * 60 * 60

export function applyAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
): void {
  const secure = process.env.NODE_ENV === "production"

  response.cookies.set("access_token", accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE_S,
  })

  response.cookies.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_MAX_AGE_S,
  })
}
