import type { NextFunction, Request, Response } from "express";

import { getAccessTokenFromRequest } from "../modules/auth/utils/cookies.js";
import { verifyAccessToken } from "../modules/auth/utils/token.js";

/** Attaches `req.user` when a valid access-token cookie is present; does not block unauthenticated requests. */
export function authenticationMiddleware() {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const token = getAccessTokenFromRequest(req);
    if (!token) {
      next();
      return;
    }

    try {
      req.user = verifyAccessToken(token);
    } catch {
      // Expired or invalid access token — client should call POST /auth/refresh.
    }

    next();
  };
}

/** Returns 401 when `req.user` is missing. Use after `authenticationMiddleware()`. */
export function restrictToAuthenticatedUser() {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }
    next();
  };
}
