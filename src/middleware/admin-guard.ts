import type { NextFunction, Request, Response } from "express";

import { ApiError, sendErrorResponse } from "../common/utils/api-error.js";

/** Blocks requests from non-admin users.
 *  Must be used AFTER restrictToAuthenticatedUser().
 *  Role is read from req.user.role which comes from the JWT.
 *
 *  To promote a user to admin:
 *    UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
 *  Then log out and log back in so a new JWT is issued with role='admin'.
 */
export function restrictToAdmin() {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== "admin") {
      sendErrorResponse(
        res,
        ApiError.forbidden("Admin access required.", "admin_required"),
      );
      return;
    }
    next();
  };
}
