import type { ComposeEmailInput } from "./schema.js";

function toBase64Url(value: string): string {
  return Buffer.from(value, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Builds a base64url-encoded RFC 2822 message — the only format gmail.api.messages.send / drafts.create accept. */
export function buildRawEmail(input: ComposeEmailInput): string {
  const headers = [
    `To: ${input.to}`,
    `Subject: ${input.subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
  ];

  const message = `${headers.join("\r\n")}\r\n\r\n${input.body}`;
  return toBase64Url(message);
}
