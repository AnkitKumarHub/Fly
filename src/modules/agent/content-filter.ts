/** Pre-LLM content filter — runs BEFORE any token is sent to OpenAI.
 *  Catches obvious abuse patterns cheaply, without spending API budget. */

interface FilterResult {
  blocked: boolean;
  reason?: string;
}

const BLOCKED_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous\s+)?instructions/i,
  /you\s+are\s+(now\s+)?DAN/i,
  /forget\s+(all\s+)?previous\s+(instructions|rules|context)/i,
  /act\s+as\s+(if\s+you\s+are\s+)?a\s+different\s+(AI|model|assistant)/i,
  /jailbreak/i,
  /pretend\s+(you\s+are|to\s+be)\s+(a\s+)?different/i,
  /reveal\s+(your\s+)?(system\s+)?prompt/i,
  /what\s+are\s+your\s+instructions/i,
  /send\s+email\s+to\s+everyone/i,
  /send\s+(bulk|mass)\s+email/i,
  /send\s+\d{3,}\s+emails/i, // "send 500 emails"
  /delete\s+all\s+(emails?|events?|calendar)/i,
];

const SPAM_PATTERNS: RegExp[] = [
  /(.)\1{30,}/, // 30+ repeated chars e.g. "aaaaaaa..."
];

export function preFilterMessage(message: string): FilterResult {
  if (message.length > 1500) {
    return { blocked: true, reason: "Message exceeds maximum length of 1500 characters." };
  }

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(message)) {
      return { blocked: true, reason: "Message contains content that is not allowed." };
    }
  }

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(message)) {
      return { blocked: true, reason: "Message appears to be spam." };
    }
  }

  return { blocked: false };
}
