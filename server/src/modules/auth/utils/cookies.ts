import type { CookieOptions, Request, Response } from "express";

import { env } from "../../../config/env.js";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function baseCookieOptions(maxAgeMs: number): CookieOptions {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    domain: env.cookieDomain,
    path: "/",
    maxAge: maxAgeMs,
  };
}

function clearCookieOptions(): CookieOptions {
  return {
    path: "/",
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    domain: env.cookieDomain,
  };
}

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
): void {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, baseCookieOptions(ACCESS_TOKEN_MAX_AGE_MS));
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, baseCookieOptions(REFRESH_TOKEN_MAX_AGE_MS));
}

export function clearAuthCookies(res: Response): void {
  const options = clearCookieOptions();
  res.clearCookie(ACCESS_TOKEN_COOKIE, options);
  res.clearCookie(REFRESH_TOKEN_COOKIE, options);
}

export function getAccessTokenFromRequest(req: Request): string | undefined {
  return req.cookies?.[ACCESS_TOKEN_COOKIE];
}

export function getRefreshTokenFromRequest(req: Request): string | undefined {
  return req.cookies?.[REFRESH_TOKEN_COOKIE];
}
