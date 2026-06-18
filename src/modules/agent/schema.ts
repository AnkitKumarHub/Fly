import { z } from "zod";
import { AGENT_LIMITS } from "./config.js";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(AGENT_LIMITS.MAX_MESSAGE_LENGTH),
});

export const chatInputSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1)
    .max(AGENT_LIMITS.MAX_MESSAGES_PER_REQUEST, "Too many messages in history"),
});

export type ChatInput = z.infer<typeof chatInputSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
