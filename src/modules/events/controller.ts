import type { Request, Response } from "express";

import { ApiError, sendErrorResponse } from "../../common/utils/api-error.js";
import { ApiResponse } from "../../common/utils/api-response.js";
import {
  createEventSchema,
  listEventsQuerySchema,
  searchEventsQuerySchema,
  syncEventsQuerySchema,
  updateEventSchema,
} from "./schema.js";
import {
  createEvent,
  deleteEvent,
  getEvent,
  listEvents,
  searchEvents,
  syncEvents,
  updateEvent,
} from "./service.js";

function handleError(res: Response, error: unknown) {
  if (error instanceof ApiError) {
    return sendErrorResponse(res, error);
  }

  console.error(error);
  return sendErrorResponse(res, ApiError.internal());
}

export async function handleListEvents(req: Request, res: Response) {
  const validationResult = listEventsQuerySchema.safeParse(req.query);

  if (!validationResult.success) {
    return sendErrorResponse(res, ApiError.badRequest("Invalid query parameters"), {
      error: validationResult.error.issues,
    });
  }

  try {
    const { limit, offset } = validationResult.data;
    const events = await listEvents(req.user!.id, limit, offset);

    return ApiResponse.ok(res, "Events fetched successfully", events);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function handleSearchEvents(req: Request, res: Response) {
  const validationResult = searchEventsQuerySchema.safeParse(req.query);

  if (!validationResult.success) {
    return sendErrorResponse(res, ApiError.badRequest("Invalid query parameters"), {
      error: validationResult.error.issues,
    });
  }

  try {
    const { q, limit, offset } = validationResult.data;
    const events = await searchEvents(req.user!.id, q, limit, offset);

    return ApiResponse.ok(res, "Events fetched successfully", events);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function handleSyncEvents(req: Request, res: Response) {
  const validationResult = syncEventsQuerySchema.safeParse(req.query);

  if (!validationResult.success) {
    return sendErrorResponse(res, ApiError.badRequest("Invalid query parameters"), {
      error: validationResult.error.issues,
    });
  }

  try {
    const result = await syncEvents(req.user!.id, validationResult.data);

    return ApiResponse.ok(res, "Events synced successfully", result);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function handleGetEvent(req: Request, res: Response) {
  const id = typeof req.params.id === "string" ? req.params.id : undefined;

  if (!id) {
    return sendErrorResponse(res, ApiError.badRequest("Event id is required"));
  }

  try {
    const event = await getEvent(req.user!.id, id);

    return ApiResponse.ok(res, "Event fetched successfully", event);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function handleCreateEvent(req: Request, res: Response) {
  const validationResult = createEventSchema.safeParse(req.body);

  if (!validationResult.success) {
    return sendErrorResponse(res, ApiError.badRequest("Body validation failed"), {
      error: validationResult.error.issues,
    });
  }

  try {
    const event = await createEvent(req.user!.id, validationResult.data);

    return ApiResponse.created(res, "Event created successfully", event);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function handleUpdateEvent(req: Request, res: Response) {
  const id = typeof req.params.id === "string" ? req.params.id : undefined;

  if (!id) {
    return sendErrorResponse(res, ApiError.badRequest("Event id is required"));
  }

  const validationResult = updateEventSchema.safeParse(req.body);

  if (!validationResult.success) {
    return sendErrorResponse(res, ApiError.badRequest("Body validation failed"), {
      error: validationResult.error.issues,
    });
  }

  try {
    const event = await updateEvent(req.user!.id, id, validationResult.data);

    return ApiResponse.ok(res, "Event updated successfully", event);
  } catch (error) {
    return handleError(res, error);
  }
}

export async function handleDeleteEvent(req: Request, res: Response) {
  const id = typeof req.params.id === "string" ? req.params.id : undefined;

  if (!id) {
    return sendErrorResponse(res, ApiError.badRequest("Event id is required"));
  }

  try {
    await deleteEvent(req.user!.id, id);

    return ApiResponse.noContent(res);
  } catch (error) {
    return handleError(res, error);
  }
}
