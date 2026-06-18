/**
 * Single source of truth for all agent-related limits and constants.
 *
 * ─── TIER 1 (This file) ───────────────────────────────────────────────────
 * Structural/code-level constants — require a redeploy to change.
 * Import these wherever you need a limit instead of hardcoding magic numbers.
 *
 * ─── TIER 2 (DB: app_settings → ai_config) ───────────────────────────────
 * Runtime-configurable values (isEnabled, dailyMaxRequestsPerUser).
 * Change via: PATCH /admin/settings/ai  (no redeploy needed).
 */
export const AGENT_LIMITS = {
  /**
   * Max conversation history messages the client may send per request.
   * Prevents oversized payloads and context injection attacks.
   */
  MAX_MESSAGES_PER_REQUEST: 20,

  /**
   * Max characters per individual user message.
   */
  MAX_MESSAGE_LENGTH: 2000,

  /**
   * Burst rate limit per user per minute.
   * Must be ≤ dailyMaxRequestsPerUser to be meaningful.
   * With 5/day cap, 3/min allows quick back-and-forth without burning the daily quota instantly.
   */
  BURST_RATE_PER_MINUTE: 3,

  /**
   * Max tool-calling steps per single AI turn.
   * Prevents infinite agent loops (e.g. tool → tool → tool → ...).
   */
  MAX_AGENT_STEPS: 5,

  /**
   * Max tokens the AI may generate in a single response.
   */
  MAX_OUTPUT_TOKENS: 1024,

  /**
   * Hard timeout for the streaming connection (ms).
   * After this, the connection is aborted and an error is returned.
   */
  STREAM_TIMEOUT_MS: 45_000,
} as const;
