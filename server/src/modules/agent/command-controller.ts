import type { Request, Response } from "express";

import { ApiError, sendErrorResponse } from "../../common/utils/api-error.js";
import { ApiResponse } from "../../common/utils/api-response.js";
import {
  confirmCommandInputSchema,
  resolveCommandInputSchema,
  type ConfirmCommandResponse,
  type ResolveCommandResponse,
} from "./command-schema.js";
import { preFilterMessage } from "./content-filter.js";
import { confirmAgentCommand, resolveAgentCommand } from "./command-service.js";
import { logAiAction, logAiUsage, type AuditAction } from "./audit.js";

function getClientIp(req: Request): string {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string") return fwd.split(",")[0]!.trim();
  return req.ip || "unknown";
}

function resolveAuditAction(response: ResolveCommandResponse): AuditAction {
  if (response.status === "blocked") return "command_blocked";
  if (response.status === "needs_input") return "command_needs_input";

  switch (response.intent) {
    case "draft_email":
      return response.status === "needs_confirmation" ? "propose_draft_email" : "draft_email";
    case "send_email":
      return response.status === "needs_confirmation" ? "propose_send_email" : "send_email";
    case "create_event":
      return response.status === "needs_confirmation" ? "propose_create_event" : "create_event";
    case "create_event_and_send_email":
      return response.status === "needs_confirmation"
        ? "propose_create_event_and_send_email"
        : "create_event_and_send_email";
    case "search_emails":
      return "search_emails";
  }
}

function confirmAuditAction(response: ConfirmCommandResponse): AuditAction {
  switch (response.intent) {
    case "draft_email":
      return "draft_email";
    case "send_email":
      return "send_email";
    case "create_event":
      return "create_event";
    case "create_event_and_send_email":
      return "create_event_and_send_email";
    case "search_emails":
      return "search_emails";
  }
}

export async function handleCommandResolve(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const ip = getClientIp(req);

  const parsed = resolveCommandInputSchema.safeParse(req.body);
  if (!parsed.success) {
    sendErrorResponse(
      res,
      ApiError.badRequest(
        parsed.error.issues[0]?.message ?? "Invalid request body",
        "validation_error",
      ),
    );
    return;
  }

  const filterResult = preFilterMessage(parsed.data.input);
  if (filterResult.blocked) {
    await logAiAction({
      userId,
      action: "input_blocked",
      payload: { reason: filterResult.reason },
      outcome: "rejected",
      ipAddress: ip,
    });
    sendErrorResponse(
      res,
      ApiError.badRequest(filterResult.reason ?? "Message not allowed.", "content_blocked"),
    );
    return;
  }

  try {
    const resolved = await resolveAgentCommand(userId, parsed.data);

    await logAiUsage({
      userId,
      promptTokens: resolved.usage.promptTokens,
      completionTokens: resolved.usage.completionTokens,
      totalTokens: resolved.usage.totalTokens,
      model: "gpt-4o-mini",
      toolsCalled: [resolveAuditAction(resolved.response)],
      durationMs: 0,
    });

    await logAiAction({
      userId,
      action: resolveAuditAction(resolved.response),
      payload: {
        status: resolved.response.status,
        ...(resolved.response.status !== "blocked" ? { intent: resolved.response.intent } : {}),
      },
      outcome: resolved.response.status === "blocked" ? "rejected" : "success",
      ipAddress: ip,
    });

    ApiResponse.ok(res, "Command resolved.", resolved.response);
  } catch (error) {
    if (error instanceof ApiError) {
      sendErrorResponse(res, error);
      return;
    }

    console.error("command_resolve_error", error);
    sendErrorResponse(res, ApiError.internal("Command resolution failed. Please try again."));
  }
}

export async function handleCommandConfirm(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const ip = getClientIp(req);

  const parsed = confirmCommandInputSchema.safeParse(req.body);
  if (!parsed.success) {
    sendErrorResponse(
      res,
      ApiError.badRequest(
        parsed.error.issues[0]?.message ?? "Invalid request body",
        "validation_error",
      ),
    );
    return;
  }

  try {
    const response = await confirmAgentCommand(userId, parsed.data.confirmationToken);

    await logAiAction({
      userId,
      action: confirmAuditAction(response),
      payload: {
        intent: response.intent,
        kind: response.result.kind,
      },
      outcome: response.result.kind === "create_event_and_send_email" && response.result.partialFailure
        ? "error"
        : "success",
      ipAddress: ip,
    });

    ApiResponse.ok(res, "Command completed.", response);
  } catch (error) {
    if (error instanceof ApiError) {
      sendErrorResponse(res, error);
      return;
    }

    console.error("command_confirm_error", error);
    sendErrorResponse(res, ApiError.internal("Command confirmation failed. Please try again."));
  }
}
