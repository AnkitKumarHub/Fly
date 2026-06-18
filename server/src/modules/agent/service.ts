import { streamText, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { env } from "../../config/env.js";
import { buildSystemPrompt } from "./system-prompt.js";
import { buildTools } from "./tools.js";
import { getConnectionStatus } from "../integrations/service.js";
import { AGENT_LIMITS } from "./config.js";
import type { ChatMessage } from "./schema.js";
import type { Request, Response } from "express";

/** Streams the agent response directly to the Express Response object.
 *  Collects usage + tool call metadata for audit/cost logging. */
export async function streamAgentChat(
  _req: Request,
  res: Response,
  userId: string,
  userName: string,
  messages: ChatMessage[],
): Promise<{ promptTokens: number; completionTokens: number; totalTokens: number; toolsCalled: string[] }> {
  // 1. Check which integrations are connected
  const { gmail: gmailConnected, googlecalendar: calendarConnected } =
    await getConnectionStatus(userId);

  // 2. Build context-aware system prompt
  const systemPrompt = buildSystemPrompt({
    userName,
    gmailConnected,
    calendarConnected,
    now: new Date().toISOString(),
  });

  // 3. Track which tools were actually called this turn
  const toolsCalled: string[] = [];

  // 4. Stream — AI SDK v6 API surface
  const result = streamText({
    model: openai(env.openaiModel),
    system: systemPrompt,
    messages,
    tools: buildTools(userId),
    stopWhen: stepCountIs(AGENT_LIMITS.MAX_AGENT_STEPS),
    maxOutputTokens: AGENT_LIMITS.MAX_OUTPUT_TOKENS,
    abortSignal: AbortSignal.timeout(AGENT_LIMITS.STREAM_TIMEOUT_MS),
    onStepFinish({ toolCalls }) {
      for (const call of toolCalls ?? []) {
        toolsCalled.push(call.toolName);
      }
    },
  });

  // 5. Pipe stream to Express response (AI SDK v6 method name)
  result.pipeTextStreamToResponse(res);

  // 6. Await usage after streaming completes
  const usage = await result.usage;

  return {
    promptTokens: usage.inputTokens ?? 0,
    completionTokens: usage.outputTokens ?? 0,
    totalTokens: usage.totalTokens ?? 0,
    toolsCalled,
  };
}
