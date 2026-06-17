interface MessageHeader {
  name?: string;
  value?: string;
}

interface MessagePart {
  mimeType?: string;
  filename?: string;
  headers?: MessageHeader[];
  body?: { data?: string; size?: number };
  parts?: MessagePart[];
}

interface GmailMessage {
  id?: string;
  threadId?: string;
  snippet?: string;
  labelIds?: string[];
  internalDate?: string | number | Date | null;
  payload?: MessagePart;
}

export interface ParsedEmail {
  id?: string | undefined;
  threadId?: string | undefined;
  snippet?: string | undefined;
  labelIds?: string[] | undefined;
  subject: string;
  from: string;
  to: string;
  date: string;
  bodyText: string;
  bodyHtml: string;
}

function decodeBase64Url(data: string): string {
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
}

function findHeader(headers: MessageHeader[] | undefined, name: string): string {
  const match = headers?.find((header) => header.name?.toLowerCase() === name.toLowerCase());
  return match?.value ?? "";
}

function extractBodies(part: MessagePart | undefined): { text: string; html: string } {
  if (!part) {
    return { text: "", html: "" };
  }

  let text = "";
  let html = "";

  const data = part.body?.data;
  if (data && !part.filename) {
    if (part.mimeType === "text/plain") {
      text += decodeBase64Url(data);
    } else if (part.mimeType === "text/html") {
      html += decodeBase64Url(data);
    }
  }

  for (const child of part.parts ?? []) {
    const nested = extractBodies(child);
    text += nested.text;
    html += nested.html;
  }

  return { text, html };
}

/** Normalizes a raw Gmail message (nested MIME parts, base64url bodies) into a flat shape the UI can render directly. */
export function parseGmailMessage(message: GmailMessage): ParsedEmail {
  const headers = message.payload?.headers;
  const { text, html } = extractBodies(message.payload);

  return {
    id: message.id,
    threadId: message.threadId,
    snippet: message.snippet,
    labelIds: message.labelIds,
    subject: findHeader(headers, "Subject"),
    from: findHeader(headers, "From"),
    to: findHeader(headers, "To"),
    date: findHeader(headers, "Date"),
    bodyText: text,
    bodyHtml: html,
  };
}
