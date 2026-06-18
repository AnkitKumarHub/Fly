import { z } from "zod";

export const commandIntentSchema = z.enum([
  "search_emails",
  "draft_email",
  "send_email",
  "create_event",
  "create_event_and_send_email",
]);

export type CommandIntent = z.infer<typeof commandIntentSchema>;

const optionalTextSchema = z
  .string()
  .trim()
  .min(1)
  .max(5000)
  .nullable()
  .optional();

const optionalShortTextSchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .nullable()
  .optional();

const participantListSchema = z
  .array(z.string().trim().min(1).max(320))
  .max(10)
  .default([]);

export const searchEmailsCommandSchema = z.object({
  intent: z.literal("search_emails"),
  query: optionalShortTextSchema,
});

export const draftEmailCommandSchema = z.object({
  intent: z.literal("draft_email"),
  recipient: optionalShortTextSchema,
  subject: optionalShortTextSchema,
  body: optionalTextSchema,
});

export const sendEmailCommandSchema = z.object({
  intent: z.literal("send_email"),
  recipient: optionalShortTextSchema,
  subject: optionalShortTextSchema,
  body: optionalTextSchema,
});

export const createEventCommandSchema = z.object({
  intent: z.literal("create_event"),
  title: optionalShortTextSchema,
  startDateTime: optionalShortTextSchema,
  endDateTime: optionalShortTextSchema,
  durationMinutes: z.number().int().min(1).max(1_440).nullable().optional(),
  attendees: participantListSchema,
  description: optionalTextSchema,
});

export const createEventAndSendEmailCommandSchema = z.object({
  intent: z.literal("create_event_and_send_email"),
  recipient: optionalShortTextSchema,
  subject: optionalShortTextSchema,
  body: optionalTextSchema,
  title: optionalShortTextSchema,
  startDateTime: optionalShortTextSchema,
  endDateTime: optionalShortTextSchema,
  durationMinutes: z.number().int().min(1).max(1_440).nullable().optional(),
  attendees: participantListSchema,
  description: optionalTextSchema,
});

export const unsupportedCommandSchema = z.object({
  intent: z.literal("unsupported"),
  reason: z
    .enum(["unsupported_scope", "unclear_intent", "unsafe_request"])
    .default("unsupported_scope"),
  message: optionalShortTextSchema,
});

/** OpenAI-compatible intent classifier (no oneOf). Used before per-intent parsing. */
export const intentClassificationSchema = z.object({
  intent: z.enum([
    "search_emails",
    "draft_email",
    "send_email",
    "create_event",
    "create_event_and_send_email",
    "unsupported",
  ]),
  reason: z.enum(["unsupported_scope", "unclear_intent", "unsafe_request"]).optional(),
  message: optionalShortTextSchema,
});

export type IntentClassification = z.infer<typeof intentClassificationSchema>;

export const parsedCommandSchema = z.discriminatedUnion("intent", [
  searchEmailsCommandSchema,
  draftEmailCommandSchema,
  sendEmailCommandSchema,
  createEventCommandSchema,
  createEventAndSendEmailCommandSchema,
  unsupportedCommandSchema,
]);

export type ParsedCommand = z.infer<typeof parsedCommandSchema>;
export type SupportedParsedCommand = Exclude<
  ParsedCommand,
  z.infer<typeof unsupportedCommandSchema>
>;

export const resolveCommandInputSchema = z.object({
  input: z.string().trim().min(1).max(2_000),
  continuationToken: z.string().trim().min(1).optional(),
  clientContext: z.object({
    now: z.string().trim().min(1),
    timeZone: z.string().trim().min(1),
  }),
});

export type ResolveCommandInput = z.infer<typeof resolveCommandInputSchema>;

export const confirmCommandInputSchema = z.object({
  confirmationToken: z.string().trim().min(1),
});

export type ConfirmCommandInput = z.infer<typeof confirmCommandInputSchema>;

export const missingFieldSchema = z.object({
  key: z.string().trim().min(1).max(100),
  label: z.string().trim().min(1).max(200),
});

export type MissingField = z.infer<typeof missingFieldSchema>;

export const navigationTargetSchema = z.object({
  path: z.string().trim().min(1),
  query: z.record(z.string(), z.string()).optional(),
});

export type NavigationTarget = z.infer<typeof navigationTargetSchema>;

export const emailPreviewSchema = z.object({
  kind: z.literal("email"),
  action: z.enum(["draft_email", "send_email"]),
  to: z.string().trim().email(),
  subject: z.string(),
  body: z.string(),
});

export const eventPreviewSchema = z.object({
  kind: z.literal("event"),
  title: z.string().trim().min(1),
  startDateTime: z.string().trim().min(1),
  endDateTime: z.string().trim().min(1),
  attendees: z.array(z.string().trim().email()).max(10),
  description: z.string().optional(),
});

export const combinedPreviewSchema = z.object({
  kind: z.literal("combined"),
  event: eventPreviewSchema,
  email: z.object({
    to: z.string().trim().email(),
    subject: z.string(),
    body: z.string(),
  }),
});

export const commandPreviewSchema = z.discriminatedUnion("kind", [
  emailPreviewSchema,
  eventPreviewSchema,
  combinedPreviewSchema,
]);

export type CommandPreview = z.infer<typeof commandPreviewSchema>;

const searchResultItemSchema = z.object({
  id: z.string().trim().min(1),
  from: z.string().optional(),
  subject: z.string().optional(),
  snippet: z.string().optional(),
  isUnread: z.boolean().optional(),
});

export const commandResultSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("search_emails"),
    query: z.string().trim().min(1),
    items: z.array(searchResultItemSchema),
    navigation: navigationTargetSchema.optional(),
  }),
  z.object({
    kind: z.literal("draft_email"),
    to: z.string().trim().email(),
    subject: z.string(),
    draftId: z.string().optional(),
    messageId: z.string().optional(),
    navigation: navigationTargetSchema.optional(),
  }),
  z.object({
    kind: z.literal("send_email"),
    to: z.string().trim().email(),
    subject: z.string(),
    messageId: z.string().optional(),
    navigation: navigationTargetSchema.optional(),
  }),
  z.object({
    kind: z.literal("create_event"),
    eventId: z.string().trim().min(1),
    title: z.string().trim().min(1),
    startDateTime: z.string().trim().min(1),
    endDateTime: z.string().trim().min(1),
    navigation: navigationTargetSchema.optional(),
  }),
  z.object({
    kind: z.literal("create_event_and_send_email"),
    eventId: z.string().trim().min(1),
    title: z.string().trim().min(1),
    to: z.string().trim().email(),
    subject: z.string(),
    messageId: z.string().optional(),
    partialFailure: z
      .object({
        stage: z.enum(["email"]),
        message: z.string().trim().min(1),
      })
      .optional(),
    navigation: navigationTargetSchema.optional(),
  }),
]);

export type CommandResult = z.infer<typeof commandResultSchema>;

export const resolveCommandResponseSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("blocked"),
    message: z.string().trim().min(1),
    redirectPath: z.string().trim().min(1).optional(),
  }),
  z.object({
    status: z.literal("needs_input"),
    intent: commandIntentSchema,
    title: z.string().trim().min(1),
    message: z.string().trim().min(1),
    missingFields: z.array(missingFieldSchema).min(1),
    continuationToken: z.string().trim().min(1),
    preview: commandPreviewSchema.optional(),
  }),
  z.object({
    status: z.literal("needs_confirmation"),
    intent: commandIntentSchema,
    title: z.string().trim().min(1),
    message: z.string().trim().min(1),
    preview: commandPreviewSchema,
    confirmationToken: z.string().trim().min(1),
  }),
  z.object({
    status: z.literal("result"),
    intent: commandIntentSchema,
    title: z.string().trim().min(1),
    message: z.string().trim().min(1),
    result: commandResultSchema,
  }),
]);

export type ResolveCommandResponse = z.infer<typeof resolveCommandResponseSchema>;

export const confirmCommandResponseSchema = z.object({
  status: z.literal("result"),
  intent: commandIntentSchema,
  title: z.string().trim().min(1),
  message: z.string().trim().min(1),
  result: commandResultSchema,
});

export type ConfirmCommandResponse = z.infer<typeof confirmCommandResponseSchema>;

export const resolvedEmailCommandSchema = z.discriminatedUnion("intent", [
  z.object({
    intent: z.literal("draft_email"),
    to: z.string().trim().email(),
    subject: z.string(),
    body: z.string().min(1),
  }),
  z.object({
    intent: z.literal("send_email"),
    to: z.string().trim().email(),
    subject: z.string(),
    body: z.string().min(1),
  }),
]);

export const resolvedEventCommandSchema = z.object({
  intent: z.literal("create_event"),
  title: z.string().trim().min(1),
  startDateTime: z.string().trim().min(1),
  endDateTime: z.string().trim().min(1),
  attendees: z.array(z.string().trim().email()).max(10),
  description: z.string().optional(),
});

export const resolvedCombinedCommandSchema = z.object({
  intent: z.literal("create_event_and_send_email"),
  title: z.string().trim().min(1),
  startDateTime: z.string().trim().min(1),
  endDateTime: z.string().trim().min(1),
  attendees: z.array(z.string().trim().email()).max(10),
  description: z.string().optional(),
  to: z.string().trim().email(),
  subject: z.string(),
  body: z.string().min(1),
});

export const continuationPayloadSchema = z.object({
  purpose: z.literal("command.continuation"),
  userId: z.string().trim().min(1),
  clientContext: resolveCommandInputSchema.shape.clientContext,
  command: z.discriminatedUnion("intent", [
    searchEmailsCommandSchema,
    draftEmailCommandSchema,
    sendEmailCommandSchema,
    createEventCommandSchema,
    createEventAndSendEmailCommandSchema,
  ]),
  missingFields: z.array(missingFieldSchema).min(1),
});

export type ContinuationPayload = z.infer<typeof continuationPayloadSchema>;

export const confirmationPayloadSchema = z.object({
  purpose: z.literal("command.confirmation"),
  userId: z.string().trim().min(1),
  command: z.discriminatedUnion("intent", [
    resolvedEmailCommandSchema,
    resolvedEventCommandSchema,
    resolvedCombinedCommandSchema,
  ]),
});

export type ConfirmationPayload = z.infer<typeof confirmationPayloadSchema>;
