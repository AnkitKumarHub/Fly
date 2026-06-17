import type { Request, Response } from "express";

import { ApiError, sendErrorResponse } from "../../common/utils/api-error.js";
import { ApiResponse } from "../../common/utils/api-response.js";
import { getConnectionStatus } from "./service.js";

export async function handleGetStatus(req: Request, res: Response) {
  try {
    const status = await getConnectionStatus(req.user!.id);

    return ApiResponse.ok(res, "Integration status fetched successfully", status);
  } catch (error) {
    console.error(error);
    return sendErrorResponse(res, ApiError.internal());
  }
}
