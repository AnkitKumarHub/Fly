import { pool } from "../../db/index.js";

export type AuditAction =
  | "search_emails"
  | "list_events"
  | "propose_send_email"
  | "propose_create_event"
  | "propose_update_event"
  | "input_blocked"
  | "stream_error";

export type AuditOutcome = "success" | "error" | "rejected";

interface AuditEntry {
  userId: string;
  action: AuditAction;
  /** Sanitized payload — never include full email body */
  payload: Record<string, unknown>;
  outcome: AuditOutcome;
  ipAddress?: string;
}

function sanitizePayload(payload: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...payload };
  // Replace full body with length hint to avoid storing PII in audit log
  if (typeof sanitized.body === "string") {
    sanitized.body = `[${sanitized.body.length} chars]`;
  }
  if (typeof sanitized.content === "string") {
    sanitized.content = `[${sanitized.content.length} chars]`;
  }
  return sanitized;
}

/** Write one row to ai_audit_log. Failures are swallowed and logged
 *  to console — audit must never crash the main request. */
export async function logAiAction(entry: AuditEntry): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO ai_audit_log (user_id, action, payload, outcome, ip_address)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        entry.userId,
        entry.action,
        JSON.stringify(sanitizePayload(entry.payload)),
        entry.outcome,
        entry.ipAddress ?? null,
      ],
    );
  } catch (err) {
    console.error("ai_audit_log_write_error", err);
  }
}

/** Write one row to ai_usage_log after a successful LLM call. */
export async function logAiUsage(opts: {
  userId: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
  toolsCalled: string[];
  durationMs: number;
}): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO ai_usage_log
        (user_id, prompt_tokens, completion_tokens, total_tokens, model, tools_called, duration_ms)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        opts.userId,
        opts.promptTokens,
        opts.completionTokens,
        opts.totalTokens,
        opts.model,
        opts.toolsCalled,
        opts.durationMs,
      ],
    );
  } catch (err) {
    console.error("ai_usage_log_write_error", err);
  }
}
