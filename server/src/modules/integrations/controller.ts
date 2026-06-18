import type { Request, Response } from "express";

import { ApiError, sendErrorResponse } from "../../common/utils/api-error.js";
import { ApiResponse } from "../../common/utils/api-response.js";
import { disconnectQuerySchema } from "./schema.js";
import { disconnectIntegration, getConnectionStatus } from "./service.js";
import { renewWatchesIfNeeded } from "./watches.js";

export async function handleGetStatus(req: Request, res: Response) {
  try {
    const tenantId = req.user!.id;
    const status = await getConnectionStatus(tenantId);

    void renewWatchesIfNeeded(tenantId);

    return ApiResponse.ok(res, "Integration status fetched successfully", status);
  } catch (error) {
    console.error(error);
    return sendErrorResponse(res, ApiError.internal());
  }
}

export async function handleDisconnect(req: Request, res: Response) {
  const validationResult = disconnectQuerySchema.safeParse(req.query);

  if (!validationResult.success) {
    return sendErrorResponse(res, ApiError.badRequest("Invalid query parameters"), {
      error: validationResult.error.issues,
    });
  }

  try {
    const status = await disconnectIntegration(req.user!.id, validationResult.data.plugin);

    return ApiResponse.ok(res, "Integration disconnected successfully", status);
  } catch (error) {
    console.error(error);
    return sendErrorResponse(res, ApiError.internal());
  }
}
