import type { Request, Response } from "express";

import { ApiError, sendErrorResponse } from "../../common/utils/api-error.js";
import { ApiResponse } from "../../common/utils/api-response.js";
import {
  composeEmailSchema,
  listEmailsQuerySchema,
  searchEmailsQuerySchema,
} from "./schema.js";
import {
  createDraft,
  getEmail,
  listEmails,
  searchEmails,
  sendEmail,
  syncInbox,
} from "./service.js";

function handleError(res: Response, error: unknown) {
  if (error instanceof ApiError) {
    return sendErrorResponse(res, error);
  }

  console.error(error);
  return sendErrorResponse(res, ApiError.internal());
}

export async function handleListEmails(req: Request, res: Response) {
  const validationResult = listEmailsQuerySchema.safeParse(req.query);

  if (!validationResult.success) {
    return sendErrorResponse(res, ApiError.badRequest("Invalid query parameters"), {
      error: validationResult.error.issues,
    });
  }

  try {
    const { limit, offset } = validationResult.data;
    const messages = await listEmails(req.user!.id, limit, offset);

    return ApiResponse.ok(res, "Emails fetched successfully", messages);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function handleSearchEmails(req: Request, res: Response) {
  const validationResult = searchEmailsQuerySchema.safeParse(req.query);

  if (!validationResult.success) {
    return sendErrorResponse(res, ApiError.badRequest("Invalid query parameters"), {
      error: validationResult.error.issues,
    });
  }

  try {
    const { q, limit, offset } = validationResult.data;
    const messages = await searchEmails(req.user!.id, q, limit, offset);

    return ApiResponse.ok(res, "Emails fetched successfully", messages);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function handleSyncInbox(req: Request, res: Response) {
  try {
    const result = await syncInbox(req.user!.id);

    return ApiResponse.ok(res, "Inbox synced successfully", result);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function handleGetEmail(req: Request, res: Response) {
  const id = typeof req.params.id === "string" ? req.params.id : undefined;

  if (!id) {
    return sendErrorResponse(res, ApiError.badRequest("Email id is required"));
  }

  try {
    const email = await getEmail(req.user!.id, id);

    return ApiResponse.ok(res, "Email fetched successfully", email);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function handleSendEmail(req: Request, res: Response) {
  const validationResult = composeEmailSchema.safeParse(req.body);

  if (!validationResult.success) {
    return sendErrorResponse(res, ApiError.badRequest("Body validation failed"), {
      error: validationResult.error.issues,
    });
  }

  try {
    const result = await sendEmail(req.user!.id, validationResult.data);

    return ApiResponse.created(res, "Email sent successfully", result);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function handleCreateDraft(req: Request, res: Response) {
  const validationResult = composeEmailSchema.safeParse(req.body);

  if (!validationResult.success) {
    return sendErrorResponse(res, ApiError.badRequest("Body validation failed"), {
      error: validationResult.error.issues,
    });
  }

  try {
    const result = await createDraft(req.user!.id, validationResult.data);

    return ApiResponse.created(res, "Draft created successfully", result);
  } catch (error) {
    return handleError(res, error);
  }
}
