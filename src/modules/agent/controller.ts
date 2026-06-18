import type { Request, Response } from "express";
import { ApiError, sendErrorResponse } from "../../common/utils/api-error.js";
import { chatInputSchema } from "./schema.js";
import { AGENT_LIMITS } from "./config.js";
import { preFilterMessage } from "./content-filter.js";
import { streamAgentChat } from "./service.js";
import { logAiAction, logAiUsage } from "./audit.js";

function getClientIp(req: Request): string {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string") return fwd.split(",")[0]!.trim();
  return req.ip || "unknown";
}

export async function handleAgentChat(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const userName = req.user!.firstName ?? "User";
  const ip = getClientIp(req);

  // 1. Validate input shape
  const parsed = chatInputSchema.safeParse(req.body);
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

  const { messages } = parsed.data;

  // 2. Validate last user message length
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUserMessage) {
    sendErrorResponse(res, ApiError.badRequest("No user message found.", "no_user_message"));
    return;
  }

  if (lastUserMessage.content.length > AGENT_LIMITS.MAX_MESSAGE_LENGTH) {
    await logAiAction({
      userId,
      action: "input_blocked",
      payload: { reason: "message_too_long", length: lastUserMessage.content.length },
      outcome: "rejected",
      ipAddress: ip,
    });
    sendErrorResponse(
      res,
      ApiError.badRequest(
        `Message too long. Maximum is ${AGENT_LIMITS.MAX_MESSAGE_LENGTH} characters.`,
        "message_too_long",
      ),
    );
    return;
  }

  // 3. Pre-LLM content filter — catches obvious abuse without spending tokens
  const filterResult = preFilterMessage(lastUserMessage.content);
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
      ApiError.badRequest(
        filterResult.reason ?? "Message not allowed.",
        "content_blocked",
      ),
    );
    return;
  }

  // 4. Stream agent response and collect usage
  const startMs = Date.now();
  try {
    const usage = await streamAgentChat(req, res, userId, userName, messages);
    const durationMs = Date.now() - startMs;

    // 5. Log usage (cost tracking)
    await logAiUsage({
      userId,
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      totalTokens: usage.totalTokens,
      model: "gpt-4o-mini",
      toolsCalled: usage.toolsCalled,
      durationMs,
    });

    // 6. Audit each tool call
    for (const toolName of usage.toolsCalled) {
      await logAiAction({
        userId,
        action: toolName as never,
        payload: {},
        outcome: "success",
        ipAddress: ip,
      });
    }
  } catch (err) {
    const durationMs = Date.now() - startMs;
    console.error("agent_chat_error", { userId, durationMs, err });

    await logAiAction({
      userId,
      action: "stream_error",
      payload: { error: err instanceof Error ? err.message : "unknown" },
      outcome: "error",
      ipAddress: ip,
    });

    if (!res.headersSent) {
      sendErrorResponse(res, ApiError.internal("AI assistant encountered an error. Please try again."));
    }
  }
}
