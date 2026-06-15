import type { Request, Response } from "express";

import { ApiError, sendErrorResponse } from "../../common/utils/api-error.js";
import { ApiResponse } from "../../common/utils/api-response.js";
import {
  clearAuthCookies,
  getRefreshTokenFromRequest,
  setAuthCookies,
} from "./utils/cookies.js";
import { signInPayloadSchema, signupPayloadSchema } from "./schema.js";
import { getAuthenticatedUser, signIn, signUp } from "./service.js";
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

export async function handleRefresh(req: Request, res: Response) {
  const refreshToken = getRefreshTokenFromRequest(req);

  if (!refreshToken) {
    clearAuthCookies(res);
    return sendErrorResponse(res, ApiError.unauthorized("Refresh token required"));
  }

  try {
    const session = await refreshAuthSession(refreshToken);
    setAuthCookies(res, session.accessToken, session.refreshToken);

    return ApiResponse.ok(res, "Session refreshed");
  } catch (error) {
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
    clearAuthCookies(res);
    return sendErrorResponse(res, ApiError.unauthorized("Authentication required"));
  }

  try {
    const user = await getAuthenticatedUser(req.user.id);

    return ApiResponse.ok(res, "User details fetched successfully", user);
  } catch (error) {
    return handleError(res, error);
  }
}
