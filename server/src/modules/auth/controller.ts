import type { Request, Response } from "express";

import { ApiError, sendErrorResponse } from "../../common/utils/api-error.js";
import { ApiResponse } from "../../common/utils/api-response.js";
import { env } from "../../config/env.js";
import {
  clearAuthCookies,
  getRefreshTokenFromRequest,
  setAuthCookies,
} from "./utils/cookies.js";
import { getGoogleAuthUrl, getGoogleProfileFromCode } from "./google.js";
import {
  googleExchangePayloadSchema,
  signInPayloadSchema,
  signupPayloadSchema,
} from "./schema.js";
import { getAuthenticatedUser, googleSignIn, signIn, signUp } from "./service.js";
import {
  refreshAuthSession,
  revokeAuthSession,
} from "./session.js";

function handleError(res: Response, error: unknown) {
  if (error instanceof ApiError) {
    if (error.clearCookies) {
      clearAuthCookies(res);
    }

    return sendErrorResponse(res, error);
  }

  console.error(error);

  return sendErrorResponse(res, ApiError.internal());
}

export async function handleSignUp(req: Request, res: Response) {
  const validationResult = signupPayloadSchema.safeParse(req.body);

  if (!validationResult.success) {
    return sendErrorResponse(res, ApiError.badRequest("Body validation failed"), {
      error: validationResult.error.issues,
    });
  }

  try {
    const { userId } = await signUp(validationResult.data);
    const { accessToken, refreshToken } = await signIn({
      email: validationResult.data.email,
      password: validationResult.data.password,
    });

    setAuthCookies(res, accessToken, refreshToken);

    return ApiResponse.created(res, "User created successfully", { id: userId });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function handleSignIn(req: Request, res: Response) {
  const validationResult = signInPayloadSchema.safeParse(req.body);

  if (!validationResult.success) {
    return sendErrorResponse(res, ApiError.badRequest("Body validation failed"), {
      error: validationResult.error.issues,
    });
  }

  try {
    const { accessToken, refreshToken } = await signIn(validationResult.data);

    setAuthCookies(res, accessToken, refreshToken);

    return ApiResponse.ok(res, "User signed in successfully");
  } catch (error) {
    return handleError(res, error);
  }
}

export function handleGoogleRedirect(_req: Request, res: Response) {
  return res.redirect(getGoogleAuthUrl());
}

/** Returns tokens in JSON for the frontend BFF to set same-origin cookies. */
export async function handleGoogleExchange(req: Request, res: Response) {
  const validationResult = googleExchangePayloadSchema.safeParse(req.body);

  if (!validationResult.success) {
    return sendErrorResponse(res, ApiError.badRequest("Body validation failed"), {
      error: validationResult.error.issues,
    });
  }

  try {
    const profile = await getGoogleProfileFromCode(validationResult.data.code);
    const { accessToken, refreshToken } = await googleSignIn(profile);

    return ApiResponse.ok(res, "Google sign-in successful", {
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function handleGoogleCallback(req: Request, res: Response) {
  const code = typeof req.query.code === "string" ? req.query.code : undefined;

  if (!code) {
    return res.redirect(`${env.frontendUrl}/signup?error=google_auth_failed`);
  }

  try {
    const profile = await getGoogleProfileFromCode(code);
    const { accessToken, refreshToken } = await googleSignIn(profile);

    setAuthCookies(res, accessToken, refreshToken);

    return res.redirect(`${env.frontendUrl}/dashboard`);
  } catch (error) {
    console.error("Google auth failed:", error);
    return res.redirect(`${env.frontendUrl}/signup?error=google_auth_failed`);
  }
}

export async function handleRefresh(req: Request, res: Response) {
  const refreshToken = getRefreshTokenFromRequest(req);

  if (!refreshToken) {
    clearAuthCookies(res);
    return sendErrorResponse(
      res,
      ApiError.unauthorized("Refresh token required", "refresh_token_required", true),
    );
  }

  try {
    const session = await refreshAuthSession(refreshToken);
    console.info("auth.refresh.success", {
      ip: req.ip,
      path: req.originalUrl,
    });
    setAuthCookies(res, session.accessToken, session.refreshToken);

    return ApiResponse.ok(res, "Session refreshed");
  } catch (error) {
    if (error instanceof ApiError) {
      console.warn("auth.refresh.failed", {
        code: error.code ?? "unknown_error",
        ip: req.ip,
        path: req.originalUrl,
        statusCode: error.statusCode,
      });
    }

    return handleError(res, error);
  }
}

export async function handleSignOut(req: Request, res: Response) {
  await revokeAuthSession(getRefreshTokenFromRequest(req));
  clearAuthCookies(res);

  return ApiResponse.ok(res, "Signed out successfully");
}

export async function handleMe(req: Request, res: Response) {
  if (!req.user) {
    return sendErrorResponse(
      res,
      ApiError.unauthorized("Authentication required", "authentication_required"),
    );
  }

  try {
    const user = await getAuthenticatedUser(req.user.id);

    return ApiResponse.ok(res, "User details fetched successfully", user);
  } catch (error) {
    return handleError(res, error);
  }
}
