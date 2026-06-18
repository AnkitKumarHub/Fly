import { Router, type Router as RouterType } from "express";
import { restrictToAuthenticatedUser } from "../../middleware/auth-middleware.js";
import { restrictToAdmin } from "../../middleware/admin-guard.js";
import { bustAiConfigCache } from "../../middleware/ai-access-guard.js";
import { pool } from "../../db/index.js";
import { ApiError, sendErrorResponse } from "../../common/utils/api-error.js";

export const adminRouter: RouterType = Router();

// All admin routes require: valid JWT + role === 'admin'
adminRouter.use(restrictToAuthenticatedUser(), restrictToAdmin());

// ── AI CONFIG ──────────────────────────────────────────────────────────────

/** GET /admin/settings/ai
 *  Returns the current global AI config from app_settings. */
adminRouter.get("/settings/ai", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT value, updated_at FROM app_settings WHERE key = 'ai_config'",
    );
    res.json(result.rows[0] ?? { error: "Config not found" });
  } catch (err) {
    console.error("admin_get_ai_config_error", err);
    sendErrorResponse(res, ApiError.internal("Failed to fetch AI config."));
  }
});

/** PATCH /admin/settings/ai
 *  Body: { isEnabled?: boolean, dailyMaxRequestsPerUser?: number }
 *  Merges the patch into the existing JSONB value.
 *
 *  Examples:
 *    { "isEnabled": false }              → disable AI globally
 *    { "isEnabled": true }              → re-enable AI
 *    { "dailyMaxRequestsPerUser": 10 }  → raise daily cap
 */
adminRouter.patch("/settings/ai", async (req, res) => {
  try {
    const patch: Record<string, unknown> = {};
    if (typeof req.body.isEnabled === "boolean") patch.isEnabled = req.body.isEnabled;
    if (typeof req.body.dailyMaxRequestsPerUser === "number") {
      patch.dailyMaxRequestsPerUser = req.body.dailyMaxRequestsPerUser;
    }

    if (Object.keys(patch).length === 0) {
      sendErrorResponse(res, ApiError.badRequest("No valid fields to update.", "no_fields"));
      return;
    }

    await pool.query(
      "UPDATE app_settings SET value = value || $1::jsonb, updated_at = NOW() WHERE key = 'ai_config'",
      [JSON.stringify(patch)],
    );

    // Bust in-memory 60s cache so changes take effect immediately
    bustAiConfigCache();

    res.json({ success: true, updated: patch });
  } catch (err) {
    console.error("admin_patch_ai_config_error", err);
    sendErrorResponse(res, ApiError.internal("Failed to update AI config."));
  }
});

// ── USER MANAGEMENT ────────────────────────────────────────────────────────

/** GET /admin/users/:userId
 *  Returns role + suspension status for a given user. */
adminRouter.get("/users/:userId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, role, is_suspended, suspended_at, suspended_reason
       FROM users WHERE id = $1`,
      [req.params.userId],
    );

    if (!result.rows[0]) {
      sendErrorResponse(res, ApiError.notFound("User not found.", "user_not_found"));
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("admin_get_user_error", err);
    sendErrorResponse(res, ApiError.internal("Failed to fetch user."));
  }
});

/** PATCH /admin/users/:userId/suspend
 *  Body: { isSuspended: boolean, reason?: string }
 *
 *  To suspend:   { "isSuspended": true,  "reason": "Sending spam via AI" }
 *  To unsuspend: { "isSuspended": false }
 *
 *  NOTE: The user must log out and log back in after suspension for the
 *  JWT to reflect the new isSuspended value. The DB flag is the source
 *  of truth; JWT is rechecked on next login. For immediate block, the
 *  ai-access-guard also does a fresh DB check if JWT says not-suspended
 *  but you need instant effect — consider adding a re-check there. */
adminRouter.patch("/users/:userId/suspend", async (req, res) => {
  try {
    const { isSuspended, reason } = req.body as {
      isSuspended?: boolean;
      reason?: string;
    };

    if (typeof isSuspended !== "boolean") {
      sendErrorResponse(
        res,
        ApiError.badRequest("isSuspended (boolean) is required.", "validation_error"),
      );
      return;
    }

    await pool.query(
      `UPDATE users
       SET is_suspended = $1,
           suspended_at = $2,
           suspended_reason = $3
       WHERE id = $4`,
      [
        isSuspended,
        isSuspended ? new Date() : null,
        isSuspended ? (reason ?? null) : null,
        req.params.userId,
      ],
    );

    res.json({ success: true, isSuspended });
  } catch (err) {
    console.error("admin_suspend_user_error", err);
    sendErrorResponse(res, ApiError.internal("Failed to update user suspension."));
  }
});

/** GET /admin/users/:userId/usage
 *  Returns today's AI usage for a specific user. */
adminRouter.get("/users/:userId/usage", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await pool.query(
      `SELECT COUNT(*) AS requests_today,
              COALESCE(SUM(total_tokens), 0) AS tokens_today
       FROM ai_usage_log
       WHERE user_id = $1 AND created_at >= $2`,
      [req.params.userId, today],
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("admin_get_usage_error", err);
    sendErrorResponse(res, ApiError.internal("Failed to fetch usage data."));
  }
});

/** GET /admin/usage/today
 *  Returns AI usage summary for ALL users today, sorted by requests. */
adminRouter.get("/usage/today", async (_req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await pool.query(
      `SELECT u.email,
              COUNT(*) AS requests_today,
              COALESCE(SUM(l.total_tokens), 0) AS tokens_today,
              ARRAY_AGG(DISTINCT tool) FILTER (WHERE tool IS NOT NULL) AS tools_used
       FROM ai_usage_log l
       JOIN users u ON u.id = l.user_id
       CROSS JOIN UNNEST(l.tools_called) AS tool
       WHERE l.created_at >= $1
       GROUP BY u.email
       ORDER BY requests_today DESC`,
      [today],
    );

    res.json(result.rows);
  } catch (err) {
    console.error("admin_get_today_usage_error", err);
    sendErrorResponse(res, ApiError.internal("Failed to fetch today's usage."));
  }
});

/** GET /admin/suspended-users
 *  Lists all users who are currently suspended. */
adminRouter.get("/suspended-users", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, suspended_at, suspended_reason
       FROM users
       WHERE is_suspended = true
       ORDER BY suspended_at DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error("admin_get_suspended_users_error", err);
    sendErrorResponse(res, ApiError.internal("Failed to fetch suspended users."));
  }
});
