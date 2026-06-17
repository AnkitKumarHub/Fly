import type { NextFunction, Request, Response } from "express";

import { ApiError, sendErrorResponse } from "../../common/utils/api-error.js";
import { hasActiveConnection } from "./service.js";
import type { IntegrationPlugin } from "./types.js";

export function requireConnection(plugin: IntegrationPlugin) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const connected = await hasActiveConnection(req.user!.id, plugin);

    if (!connected) {
      sendErrorResponse(
        res,
        ApiError.forbidden(
          "Please connect your account on the integrations page.",
          "integration_not_connected",
        ),
      );
      return;
    }

    next();
  };
}
