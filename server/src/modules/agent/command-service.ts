import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";

import { env } from "../../config/env.js";
import { ApiError } from "../../common/utils/api-error.js";
import { AGENT_LIMITS } from "./config.js";
import {
  type CommandIntent,
  type CommandPreview,
  type CommandResult,
  type ConfirmCommandResponse,
  type ConfirmationPayload,
  type ContinuationPayload,
  type MissingField,
  type ParsedCommand,
  type ResolveCommandInput,
  type ResolveCommandResponse,
  type SupportedParsedCommand,
  confirmationPayloadSchema,
  createEventAndSendEmailCommandSchema,
  createEventCommandSchema,
  draftEmailCommandSchema,
  parsedCommandSchema,
  resolvedCombinedCommandSchema,
  resolvedEmailCommandSchema,
  resolvedEventCommandSchema,
  searchEmailsCommandSchema,
  sendEmailCommandSchema,
} from "./command-schema.js";
import {
  createConfirmationToken,
  createContinuationToken,
  verifyConfirmationToken,
  verifyContinuationToken,
} from "./command-tokens.js";
import { createDraft, listEmails, searchEmails, sendEmail } from "../emails/service.js";
import { createEvent } from "../events/service.js";
import { getConnectionStatus } from "../integrations/service.js";

const ISO_WITH_TIMEZONE_PATTERN = /(Z|[+-]\d{2}:\d{2})$/i;
const MAX_PARTICIPANT_SCAN = 60;

type UsageSummary = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

type ResolvedParticipant =
  | { status: "resolved"; email: string }
  | { status: "missing"; message: string };

type CommandExecution =
  | {
      status: "needs_input";
      intent: CommandIntent;
      missingFields: MissingField[];
      message: string;
      command: SupportedParsedCommand;
      preview?: CommandPreview;
    }
  | {
      status: "needs_confirmation";
      intent: CommandIntent;
      message: string;
      preview: CommandPreview;
      payload: ConfirmationPayload;
    }
  | {
      status: "result";
      intent: CommandIntent;
      message: string;
      result: CommandResult;
    }
  | {
      status: "blocked";
      message: string;
      redirectPath?: string;
    };

type ParticipantCandidate = {
  email: string;
  label: string;
  name: string;
  haystack: string;
};

type ParserUsageResult = {
  response: ResolveCommandResponse;
  usage: UsageSummary;
};

function hasText(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function sanitizeText(value: string | null | undefined): string | undefined {
  if (!hasText(value)) return undefined;
  return value.trim();
}

function coalesceText(
  first: string | null | undefined,
  second: string | null | undefined,
): string | null | undefined {
  return hasText(second) ? second.trim() : hasText(first) ? first.trim() : first ?? second;
}

function normalizeFreeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/["']/g, " ")
    .replace(/[^\w@.+-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractEmail(value: string): string | null {
  const match = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match?.[0]?.toLowerCase() ?? null;
}

function splitMailboxList(value: string): string[] {
  return value
    .split(/[;,]/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function parseMailbox(value: string): ParticipantCandidate | null {
  const email = extractEmail(value);
  if (!email) return null;

  const angleMatch = value.match(/^(.*)<([^>]+)>$/);
  const rawName = angleMatch?.[1]?.trim() ?? value.replace(email, "").replace(/[<>]/g, "").trim();
  const name = rawName.length > 0 ? rawName : email.split("@")[0] ?? email;
  const label = rawName.length > 0 ? `${rawName} <${email}>` : email;

  return {
    email,
    label,
    name,
    haystack: normalizeFreeText(`${label} ${name} ${email}`),
  };
}

function toUsageSummary(usage: {
  inputTokens?: number | undefined;
  outputTokens?: number | undefined;
  totalTokens?: number | undefined;
} | undefined): UsageSummary {
  return {
    promptTokens: usage?.inputTokens ?? 0,
    completionTokens: usage?.outputTokens ?? 0,
    totalTokens: usage?.totalTokens ?? 0,
  };
}

function normalizeDateTime(value: string | null | undefined): string | undefined {
  if (!hasText(value)) return undefined;

  const raw = value.trim();
  if (Number.isNaN(Date.parse(raw))) {
    return undefined;
  }

  return ISO_WITH_TIMEZONE_PATTERN.test(raw) ? raw : new Date(raw).toISOString();
}

function buildMissingField(key: string, label: string): MissingField {
  return { key, label };
}

function buildBlockedResponse(
  message: string,
  redirectPath = "/dashboard/chat",
): ResolveCommandResponse {
  return {
    status: "blocked",
    message,
    redirectPath,
  };
}

function buildResolvePrompt(input: {
  clientContext: ResolveCommandInput["clientContext"];
  commandText: string;
  continuation: ContinuationPayload | undefined;
}): string {
  const baseRules = [
    "You translate a keyboard command into one supported action object.",
    "Supported actions only: search_emails, draft_email, send_email, create_event, create_event_and_send_email.",
    "If the message is open-ended, conversational, unsupported, or unsafe, return intent=unsupported.",
    "Never invent missing facts. Leave missing strings null and missing arrays empty.",
    "Resolve relative dates using the supplied current time and timezone, and output ISO 8601 datetimes.",
    "For email recipients or attendees, preserve the raw person reference if the user gave a name instead of an email.",
    "For create_event_and_send_email, keep the email recipient in recipient and event attendees in attendees.",
    "Only parse what the user asked for. Do not add extra actions.",
  ];

  const continuationSection = input.continuation
    ? [
        "",
        "You are continuing a previously started command.",
        `Locked intent: ${input.continuation.command.intent}`,
        `Existing structured fields: ${JSON.stringify(input.continuation.command)}`,
        `Still missing: ${input.continuation.missingFields.map((field) => field.label).join(", ")}`,
        "Keep the same intent and fill only the missing pieces from the latest user message.",
      ].join("\n")
    : "";

  return [
    ...baseRules,
    "",
    `Current date/time: ${input.clientContext.now}`,
    `Current timezone: ${input.clientContext.timeZone}`,
    continuationSection,
    "",
    `Latest user message: ${input.commandText}`,
  ].join("\n");
}

function buildUnsupportedMessage(reason: ParsedCommand extends never ? never : string): string {
  switch (reason) {
    case "unsafe_request":
      return "That request is outside the safe scope of this command palette.";
    case "unclear_intent":
      return "I couldn't turn that into a one-step email or calendar action. Try Ask Fly for a broader request.";
    default:
      return "This palette only handles one-shot Gmail and Calendar actions. Use Ask Fly for open-ended questions.";
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function getRequiredIntegration(intent: CommandIntent): "gmail" | "googlecalendar" | "both" {
  switch (intent) {
    case "search_emails":
    case "draft_email":
    case "send_email":
      return "gmail";
    case "create_event":
      return "googlecalendar";
    case "create_event_and_send_email":
      return "both";
  }
}

function ensureIntegrationConnected(
  intent: CommandIntent,
  status: Awaited<ReturnType<typeof getConnectionStatus>>,
): ResolveCommandResponse | null {
  const requirement = getRequiredIntegration(intent);

  if (requirement === "gmail" && !status.gmail) {
    return buildBlockedResponse("Connect Gmail on the Integrations page before using this command.");
  }

  if (requirement === "googlecalendar" && !status.googlecalendar) {
    return buildBlockedResponse("Connect Google Calendar on the Integrations page before using this command.");
  }

  if (requirement === "both" && (!status.gmail || !status.googlecalendar)) {
    return buildBlockedResponse(
      "Connect both Gmail and Google Calendar on the Integrations page before running this combined command.",
    );
  }

  return null;
}

async function getParticipantCandidates(tenantId: string): Promise<ParticipantCandidate[]> {
  const emails = await listEmails(tenantId, MAX_PARTICIPANT_SCAN, 0);
  const byEmail = new Map<string, ParticipantCandidate>();

  for (const item of emails) {
    for (const source of [item.from, item.to]) {
      if (!hasText(source)) continue;

      for (const entry of splitMailboxList(source)) {
        const candidate = parseMailbox(entry);
        if (!candidate || byEmail.has(candidate.email)) continue;
        byEmail.set(candidate.email, candidate);
      }
    }
  }

  return [...byEmail.values()];
}

async function resolveParticipantReference(
  tenantId: string,
  reference: string | null | undefined,
  cache: { candidates?: ParticipantCandidate[] },
): Promise<ResolvedParticipant> {
  if (!hasText(reference)) {
    return { status: "missing", message: "Please provide the recipient email address." };
  }

  const directEmail = extractEmail(reference);
  if (directEmail) {
    return { status: "resolved", email: directEmail };
  }

  if (!cache.candidates) {
    cache.candidates = await getParticipantCandidates(tenantId);
  }

  const query = normalizeFreeText(reference);
  const matches = cache.candidates.filter(
    (candidate) =>
      candidate.haystack.includes(query) ||
      query.includes(candidate.email) ||
      query.includes(normalizeFreeText(candidate.name)),
  );

  if (matches.length === 1) {
    const singleMatch = matches[0];
    if (!singleMatch) {
      return { status: "missing", message: "Please provide the recipient email address." };
    }
    return { status: "resolved", email: singleMatch.email };
  }

  if (matches.length > 1) {
    return {
      status: "missing",
      message: `I found multiple matches for "${reference.trim()}". Please provide the exact email address.`,
    };
  }

  return {
    status: "missing",
    message: `I couldn't find an email address for "${reference.trim()}". Please provide the full email address.`,
  };
}

function mergeParticipants(existing: string[], incoming: string[]): string[] {
  if (incoming.length === 0) return existing;

  const seen = new Set<string>();
  const merged: string[] = [];

  for (const value of [...existing, ...incoming]) {
    const normalized = normalizeFreeText(value);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    merged.push(value);
  }

  return merged;
}

function mergeParsedCommand(
  existing: SupportedParsedCommand | undefined,
  incoming: SupportedParsedCommand,
): SupportedParsedCommand {
  if (!existing || existing.intent !== incoming.intent) {
    return incoming;
  }

  switch (incoming.intent) {
    case "search_emails": {
      const existingSearch = existing as Extract<SupportedParsedCommand, { intent: "search_emails" }>;
      return {
        intent: "search_emails",
        query: coalesceText(existingSearch.query, incoming.query),
      };
    }
    case "draft_email":
    case "send_email": {
      const existingEmail = existing as Extract<
        SupportedParsedCommand,
        { intent: "draft_email" | "send_email" }
      >;
      return {
        intent: incoming.intent,
        recipient: coalesceText(existingEmail.recipient, incoming.recipient),
        subject: coalesceText(existingEmail.subject, incoming.subject),
        body: coalesceText(existingEmail.body, incoming.body),
      };
    }
    case "create_event": {
      const existingEvent = existing as Extract<SupportedParsedCommand, { intent: "create_event" }>;
      return {
        intent: "create_event",
        title: coalesceText(existingEvent.title, incoming.title),
        startDateTime: coalesceText(existingEvent.startDateTime, incoming.startDateTime),
        endDateTime: coalesceText(existingEvent.endDateTime, incoming.endDateTime),
        durationMinutes: incoming.durationMinutes ?? existingEvent.durationMinutes ?? null,
        attendees: mergeParticipants(existingEvent.attendees, incoming.attendees),
        description: coalesceText(existingEvent.description, incoming.description),
      };
    }
    case "create_event_and_send_email": {
      const existingCombined = existing as Extract<
        SupportedParsedCommand,
        { intent: "create_event_and_send_email" }
      >;
      return {
        intent: "create_event_and_send_email",
        recipient: coalesceText(existingCombined.recipient, incoming.recipient),
        subject: coalesceText(existingCombined.subject, incoming.subject),
        body: coalesceText(existingCombined.body, incoming.body),
        title: coalesceText(existingCombined.title, incoming.title),
        startDateTime: coalesceText(
          existingCombined.startDateTime,
          incoming.startDateTime,
        ),
        endDateTime: coalesceText(existingCombined.endDateTime, incoming.endDateTime),
        durationMinutes: incoming.durationMinutes ?? existingCombined.durationMinutes ?? null,
        attendees: mergeParticipants(existingCombined.attendees, incoming.attendees),
        description: coalesceText(existingCombined.description, incoming.description),
      };
    }
  }
}

function schemaForIntent(intent: CommandIntent) {
  switch (intent) {
    case "search_emails":
      return searchEmailsCommandSchema;
    case "draft_email":
      return draftEmailCommandSchema;
    case "send_email":
      return sendEmailCommandSchema;
    case "create_event":
      return createEventCommandSchema;
    case "create_event_and_send_email":
      return createEventAndSendEmailCommandSchema;
  }
}

async function parseCommand(
  input: ResolveCommandInput,
  continuation: ContinuationPayload | undefined,
): Promise<{ command: ParsedCommand; usage: UsageSummary }> {
  const schema = continuation ? schemaForIntent(continuation.command.intent) : parsedCommandSchema;

  const parsed = await generateObject({
    model: openai(env.openaiModel),
    schema,
    system: buildResolvePrompt({
      clientContext: input.clientContext,
      commandText: input.input,
      continuation,
    }),
    prompt: input.input,
    abortSignal: AbortSignal.timeout(AGENT_LIMITS.STREAM_TIMEOUT_MS),
  });

  const command = continuation
    ? mergeParsedCommand(continuation.command, parsed.object as SupportedParsedCommand)
    : (parsed.object as ParsedCommand);

  return {
    command,
    usage: toUsageSummary(parsed.usage),
  };
}

function buildContinuationResponse(
  userId: string,
  clientContext: ResolveCommandInput["clientContext"],
  execution: Extract<CommandExecution, { status: "needs_input" }>,
): ResolveCommandResponse {
  const continuationToken = createContinuationToken({
    purpose: "command.continuation",
    userId,
    clientContext,
    command: execution.command,
    missingFields: execution.missingFields,
  });

  return {
    status: "needs_input",
    intent: execution.intent,
    title: "More details needed",
    message: execution.message,
    missingFields: execution.missingFields,
    continuationToken,
    ...(execution.preview ? { preview: execution.preview } : {}),
  };
}

function buildConfirmationResponse(
  userId: string,
  execution: Extract<CommandExecution, { status: "needs_confirmation" }>,
): ResolveCommandResponse {
  const confirmationToken = createConfirmationToken({
    ...execution.payload,
    userId,
  });

  return {
    status: "needs_confirmation",
    intent: execution.intent,
    title: "Ready to run",
    message: execution.message,
    preview: execution.preview,
    confirmationToken,
  };
}

function buildResultResponse(
  execution: Extract<CommandExecution, { status: "result" }>,
): ResolveCommandResponse {
  return {
    status: "result",
    intent: execution.intent,
    title: "Done",
    message: execution.message,
    result: execution.result,
  };
}

function buildEmailNavigation(query?: Record<string, string>): { path: string; query?: Record<string, string> } {
  return query ? { path: "/dashboard/mail", query } : { path: "/dashboard/mail" };
}

function buildCalendarNavigation(query?: Record<string, string>): { path: string; query?: Record<string, string> } {
  return query ? { path: "/dashboard/calendar", query } : { path: "/dashboard/calendar" };
}

async function prepareExecution(
  tenantId: string,
  command: SupportedParsedCommand,
): Promise<CommandExecution> {
  const participantCache: { candidates?: ParticipantCandidate[] } = {};

  switch (command.intent) {
    case "search_emails": {
      const query = sanitizeText(command.query);
      if (!query) {
        return {
          status: "needs_input",
          intent: "search_emails",
          message: "Tell me what email terms to search for.",
          missingFields: [buildMissingField("query", "Search query")],
          command,
        };
      }

      const items = await searchEmails(tenantId, query, 5, 0);
      const navigationQuery: Record<string, string> = { q: query };
      const firstId = items[0]?.id;
      if (firstId) {
        navigationQuery.selected = firstId;
      }

      return {
        status: "result",
        intent: "search_emails",
        message:
          items.length > 0
            ? `Found ${items.length} matching email${items.length === 1 ? "" : "s"}.`
            : "No matching emails found.",
        result: {
          kind: "search_emails",
          query,
          items,
          navigation: buildEmailNavigation(navigationQuery),
        },
      };
    }

    case "draft_email":
    case "send_email": {
      const recipientResolution = await resolveParticipantReference(
        tenantId,
        command.recipient,
        participantCache,
      );

      const missingFields: MissingField[] = [];
      const notes: string[] = [];

      if (recipientResolution.status !== "resolved") {
        missingFields.push(buildMissingField("recipient", "Recipient email"));
        notes.push(recipientResolution.message);
      }

      const body = sanitizeText(command.body);
      if (!body) {
        missingFields.push(buildMissingField("body", "Email body"));
      }

      const subject = sanitizeText(command.subject) ?? "";
      const preview =
        recipientResolution.status === "resolved" && body
          ? ({
              kind: "email",
              action: command.intent,
              to: recipientResolution.email,
              subject,
              body,
            } satisfies CommandPreview)
          : undefined;

      if (missingFields.length > 0 || recipientResolution.status !== "resolved" || !body) {
        return {
          status: "needs_input",
          intent: command.intent,
          message:
            notes[0] ??
            `I need ${missingFields.map((field) => field.label.toLowerCase()).join(" and ")} before I can continue.`,
          missingFields,
          command,
          ...(preview ? { preview } : {}),
        };
      }

      const to = recipientResolution.email;
      const payload = {
        purpose: "command.confirmation" as const,
        userId: tenantId,
        command: {
          intent: command.intent,
          to,
          subject,
          body,
        },
      };

      return {
        status: "needs_confirmation",
        intent: command.intent,
        message:
          command.intent === "draft_email"
            ? `Ready to save a draft to ${to}.`
            : `Ready to send an email to ${to}.`,
        preview: {
          kind: "email",
          action: command.intent,
          to,
          subject,
          body,
        },
        payload: {
          ...payload,
          command: resolvedEmailCommandSchema.parse(payload.command),
        },
      };
    }

    case "create_event": {
      const missingFields: MissingField[] = [];
      const notes: string[] = [];
      const title = sanitizeText(command.title);

      if (!title) {
        missingFields.push(buildMissingField("title", "Event title"));
      }

      const startDateTime = normalizeDateTime(command.startDateTime);
      if (!startDateTime) {
        missingFields.push(buildMissingField("startDateTime", "Event start time"));
      }

      let endDateTime = normalizeDateTime(command.endDateTime);
      if (!endDateTime && startDateTime && command.durationMinutes) {
        endDateTime = new Date(
          new Date(startDateTime).getTime() + command.durationMinutes * 60_000,
        ).toISOString();
      }
      if (!endDateTime) {
        missingFields.push(buildMissingField("endDateTime", "Event end time or duration"));
      }

      if (startDateTime && endDateTime) {
        const startMs = new Date(startDateTime).getTime();
        const endMs = new Date(endDateTime).getTime();
        if (!(endMs > startMs)) {
          missingFields.push(buildMissingField("endDateTime", "Event end time after the start"));
          notes.push("The end time must be after the start time.");
        }
      }

      const attendees: string[] = [];
      for (const rawAttendee of command.attendees) {
        const attendeeResolution = await resolveParticipantReference(
          tenantId,
          rawAttendee,
          participantCache,
        );
        if (attendeeResolution.status === "resolved") {
          attendees.push(attendeeResolution.email);
          continue;
        }

        missingFields.push(buildMissingField("attendees", "Attendee email"));
        notes.push(attendeeResolution.message);
        break;
      }

      const description = sanitizeText(command.description);
      const preview =
        title && startDateTime && endDateTime
          ? ({
              kind: "event",
              title,
              startDateTime,
              endDateTime,
              attendees,
              ...(description ? { description } : {}),
            } satisfies CommandPreview)
          : undefined;

      if (missingFields.length > 0 || !title || !startDateTime || !endDateTime) {
        return {
          status: "needs_input",
          intent: "create_event",
          message:
            notes[0] ??
            `I need ${missingFields.map((field) => field.label.toLowerCase()).join(" and ")} before I can continue.`,
          missingFields,
          command,
          ...(preview ? { preview } : {}),
        };
      }

      return {
        status: "needs_confirmation",
        intent: "create_event",
        message: `Ready to create "${title}" on your calendar.`,
        preview: {
          kind: "event",
          title,
          startDateTime,
          endDateTime,
          attendees,
          ...(description ? { description } : {}),
        },
        payload: {
          purpose: "command.confirmation",
          userId: tenantId,
          command: resolvedEventCommandSchema.parse({
            intent: "create_event",
            title,
            startDateTime,
            endDateTime,
            attendees,
            ...(description ? { description } : {}),
          }),
        },
      };
    }

    case "create_event_and_send_email": {
      const missingFields: MissingField[] = [];
      const notes: string[] = [];
      const title = sanitizeText(command.title);
      const startDateTime = normalizeDateTime(command.startDateTime);
      let endDateTime = normalizeDateTime(command.endDateTime);

      if (!title) {
        missingFields.push(buildMissingField("title", "Event title"));
      }

      if (!startDateTime) {
        missingFields.push(buildMissingField("startDateTime", "Event start time"));
      }

      if (!endDateTime && startDateTime && command.durationMinutes) {
        endDateTime = new Date(
          new Date(startDateTime).getTime() + command.durationMinutes * 60_000,
        ).toISOString();
      }
      if (!endDateTime) {
        missingFields.push(buildMissingField("endDateTime", "Event end time or duration"));
      }

      const recipientResolution = await resolveParticipantReference(
        tenantId,
        command.recipient,
        participantCache,
      );
      if (recipientResolution.status !== "resolved") {
        missingFields.push(buildMissingField("recipient", "Recipient email"));
        notes.push(recipientResolution.message);
      }

      const rawAttendees = command.attendees.length > 0 ? command.attendees : hasText(command.recipient) ? [command.recipient] : [];
      const attendees: string[] = [];
      for (const rawAttendee of rawAttendees) {
        const attendeeResolution =
          recipientResolution.status === "resolved" &&
          hasText(command.recipient) &&
          normalizeFreeText(rawAttendee) === normalizeFreeText(command.recipient)
            ? recipientResolution
            : await resolveParticipantReference(tenantId, rawAttendee, participantCache);

        if (attendeeResolution.status === "resolved") {
          attendees.push(attendeeResolution.email);
          continue;
        }

        missingFields.push(buildMissingField("attendees", "Attendee email"));
        notes.push(attendeeResolution.message);
        break;
      }

      const body = sanitizeText(command.body);
      if (!body) {
        missingFields.push(buildMissingField("body", "Email body"));
      }

      if (startDateTime && endDateTime) {
        const startMs = new Date(startDateTime).getTime();
        const endMs = new Date(endDateTime).getTime();
        if (!(endMs > startMs)) {
          missingFields.push(buildMissingField("endDateTime", "Event end time after the start"));
          notes.push("The end time must be after the start time.");
        }
      }

      const description = sanitizeText(command.description);
      const subject = sanitizeText(command.subject) ?? (title ? `About ${title}` : "");
      const to = recipientResolution.status === "resolved" ? recipientResolution.email : undefined;
      const preview =
        title && startDateTime && endDateTime && to && body
          ? ({
              kind: "combined",
              event: {
                kind: "event",
                title,
                startDateTime,
                endDateTime,
                attendees,
                ...(description ? { description } : {}),
              },
              email: {
                to,
                subject,
                body,
              },
            } satisfies CommandPreview)
          : undefined;

      if (missingFields.length > 0 || !title || !startDateTime || !endDateTime || !to || !body) {
        return {
          status: "needs_input",
          intent: "create_event_and_send_email",
          message:
            notes[0] ??
            `I need ${missingFields.map((field) => field.label.toLowerCase()).join(" and ")} before I can continue.`,
          missingFields,
          command,
          ...(preview ? { preview } : {}),
        };
      }

      return {
        status: "needs_confirmation",
        intent: "create_event_and_send_email",
        message: `Ready to create "${title}" and send the follow-up email to ${to}.`,
        preview: {
          kind: "combined",
          event: {
            kind: "event",
            title,
            startDateTime,
            endDateTime,
            attendees,
            ...(description ? { description } : {}),
          },
          email: {
            to,
            subject,
            body,
          },
        },
        payload: {
          purpose: "command.confirmation",
          userId: tenantId,
          command: resolvedCombinedCommandSchema.parse({
            intent: "create_event_and_send_email",
            title,
            startDateTime,
            endDateTime,
            attendees,
            to,
            subject,
            body,
            ...(description ? { description } : {}),
          }),
        },
      };
    }
  }
}

export async function resolveAgentCommand(
  userId: string,
  input: ResolveCommandInput,
): Promise<ParserUsageResult> {
  const continuation = input.continuationToken
    ? verifyContinuationToken(input.continuationToken, userId)
    : undefined;

  const parseResult = await parseCommand(input, continuation);
  const { command, usage } = parseResult;

  if (command.intent === "unsupported") {
    return {
      response: buildBlockedResponse(buildUnsupportedMessage(command.reason)),
      usage,
    };
  }

  const connectionStatus = await getConnectionStatus(userId);
  const blocked = ensureIntegrationConnected(command.intent, connectionStatus);
  if (blocked) {
    return { response: blocked, usage };
  }

  const execution = await prepareExecution(userId, command);

  if (execution.status === "blocked") {
    return {
      response: {
        status: "blocked",
        message: execution.message,
        ...(execution.redirectPath ? { redirectPath: execution.redirectPath } : {}),
      },
      usage,
    };
  }

  if (execution.status === "needs_input") {
    return {
      response: buildContinuationResponse(userId, input.clientContext, execution),
      usage,
    };
  }

  if (execution.status === "needs_confirmation") {
    return {
      response: buildConfirmationResponse(userId, execution),
      usage,
    };
  }

  return {
    response: buildResultResponse(execution),
    usage,
  };
}

function getResultMessage(response: ConfirmCommandResponse): string {
  if (response.result.kind === "create_event_and_send_email" && response.result.partialFailure) {
    return `The event was created, but the email could not be sent: ${response.result.partialFailure.message}`;
  }

  return response.message;
}

export async function confirmAgentCommand(
  userId: string,
  confirmationToken: string,
): Promise<ConfirmCommandResponse> {
  const payload = verifyConfirmationToken(confirmationToken, userId);

  switch (payload.command.intent) {
    case "draft_email": {
      const created = await createDraft(userId, {
        to: payload.command.to,
        subject: payload.command.subject,
        body: payload.command.body,
      });
      const createdRecord = asRecord(created);
      const createdMessage = asRecord(createdRecord?.message);

      const result: ConfirmCommandResponse = {
        status: "result",
        intent: "draft_email",
        title: "Draft saved",
        message: `Saved a draft for ${payload.command.to}.`,
        result: {
          kind: "draft_email",
          to: payload.command.to,
          subject: payload.command.subject,
          draftId: typeof createdRecord?.id === "string" ? createdRecord.id : undefined,
          messageId:
            typeof createdMessage?.id === "string"
              ? createdMessage.id
              : undefined,
          navigation: buildEmailNavigation(),
        },
      };

      return {
        ...result,
        message: getResultMessage(result),
      };
    }

    case "send_email": {
      const sent = await sendEmail(userId, {
        to: payload.command.to,
        subject: payload.command.subject,
        body: payload.command.body,
      });
      const sentRecord = asRecord(sent);

      const result: ConfirmCommandResponse = {
        status: "result",
        intent: "send_email",
        title: "Email sent",
        message: `Sent the email to ${payload.command.to}.`,
        result: {
          kind: "send_email",
          to: payload.command.to,
          subject: payload.command.subject,
          messageId: typeof sentRecord?.id === "string" ? sentRecord.id : undefined,
          navigation: buildEmailNavigation(),
        },
      };

      return {
        ...result,
        message: getResultMessage(result),
      };
    }

    case "create_event": {
      const created = await createEvent(userId, {
        event: {
          summary: payload.command.title,
          start: { dateTime: payload.command.startDateTime },
          end: { dateTime: payload.command.endDateTime },
          ...(payload.command.description ? { description: payload.command.description } : {}),
          ...(payload.command.attendees.length > 0
            ? {
                attendees: payload.command.attendees.map((email) => ({ email })),
              }
            : {}),
        },
        ...(payload.command.attendees.length > 0 ? { sendUpdates: "all" as const } : {}),
      });

      const result: ConfirmCommandResponse = {
        status: "result",
        intent: "create_event",
        title: "Event created",
        message: `Created "${payload.command.title}" on your calendar.`,
        result: {
          kind: "create_event",
          eventId: created.id,
          title: payload.command.title,
          startDateTime: payload.command.startDateTime,
          endDateTime: payload.command.endDateTime,
          navigation: buildCalendarNavigation({
            selected: created.id,
            view: "day",
          }),
        },
      };

      return {
        ...result,
        message: getResultMessage(result),
      };
    }

    case "create_event_and_send_email": {
      const created = await createEvent(userId, {
        event: {
          summary: payload.command.title,
          start: { dateTime: payload.command.startDateTime },
          end: { dateTime: payload.command.endDateTime },
          ...(payload.command.description ? { description: payload.command.description } : {}),
          ...(payload.command.attendees.length > 0
            ? {
                attendees: payload.command.attendees.map((email) => ({ email })),
              }
            : {}),
        },
        ...(payload.command.attendees.length > 0 ? { sendUpdates: "all" as const } : {}),
      });

      let messageId: string | undefined;
      let partialFailure: { stage: "email"; message: string } | undefined;

      try {
        const sent = await sendEmail(userId, {
          to: payload.command.to,
          subject: payload.command.subject,
          body: payload.command.body,
        });
        const sentRecord = asRecord(sent);
        if (typeof sentRecord?.id === "string") {
          messageId = sentRecord.id;
        }
      } catch (error) {
        partialFailure = {
          stage: "email",
          message: error instanceof Error ? error.message : "Unknown error",
        };
      }

      const result: ConfirmCommandResponse = {
        status: "result",
        intent: "create_event_and_send_email",
        title: partialFailure ? "Event created, email failed" : "Event and email completed",
        message: partialFailure
          ? `Created "${payload.command.title}", but the email to ${payload.command.to} failed.`
          : `Created "${payload.command.title}" and sent the email to ${payload.command.to}.`,
        result: {
          kind: "create_event_and_send_email",
          eventId: created.id,
          title: payload.command.title,
          to: payload.command.to,
          subject: payload.command.subject,
          ...(messageId ? { messageId } : {}),
          ...(partialFailure ? { partialFailure } : {}),
          navigation: buildCalendarNavigation({
            selected: created.id,
            view: "day",
          }),
        },
      };

      return {
        ...result,
        message: getResultMessage(result),
      };
    }
  }
}
