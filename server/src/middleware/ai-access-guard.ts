import type { NextFunction, Request, Response } from "express";
import { pool } from "../db/index.js";
import { ApiError, sendErrorResponse } from "../common/utils/api-error.js";

interface AiConfig {
  isEnabled: boolean;
  dailyMaxRequestsPerUser: number;
}

// In-memory cache for global AI config — refreshed every 60 seconds
let aiConfigCache: AiConfig | null = null;
let aiConfigCacheTime = 0;
const AI_CONFIG_CACHE_TTL_MS = 60_000;

async function getAiConfig(): Promise<AiConfig> {
  const now = Date.now();
  if (aiConfigCache && now - aiConfigCacheTime < AI_CONFIG_CACHE_TTL_MS) {
    return aiConfigCache;
  }

  const result = await pool.query<{ value: AiConfig }>(
    "SELECT value FROM app_settings WHERE key = 'ai_config'",
  );

  aiConfigCache = result.rows[0]?.value ?? {
    isEnabled: true,
    dailyMaxRequestsPerUser: 5,
  };
  aiConfigCacheTime = now;
  return aiConfigCache;
}

/** Call this to immediately invalidate the in-memory AI config cache.
 *  Used by the admin route after updating app_settings. */
export function bustAiConfigCache(): void {
  aiConfigCache = null;
}

/** AI access guard — runs before rate limiters on all /agent/* routes.
 *
 *  Enforces three layers in order:
 *  1. Global kill switch (app_settings.ai_config.isEnabled)
 *  2. Per-user suspension  (users.is_suspended from JWT)
 *  3. Daily usage cap      (ai_usage_log count today)
 */
export function aiAccessGuard() {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 1. Global AI kill switch — cached, no per-request DB hit under normal conditions
      const config = await getAiConfig();
      if (!config.isEnabled) {
        sendErrorResponse(
          res,
          ApiError.forbidden(
            "AI assistant is temporarily unavailable. Please try again later.",
            "ai_disabled",
          ),
        );
        return;
      }

      // 2. Per-user suspension — reads from JWT (no DB hit)
      if (req.user?.isSuspended) {
        sendErrorResponse(
          res,
          ApiError.forbidden(
            "Your AI access has been suspended. Contact support if you believe this is a mistake.",
            "ai_user_suspended",
          ),
        );
        return;
      }

      // 3. Daily usage cap — one indexed DB query
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const usageResult = await pool.query<{ count: string }>(
        "SELECT COUNT(*) AS count FROM ai_usage_log WHERE user_id = $1 AND created_at >= $2",
        [req.user!.id, today],
      );

      const dailyCount = parseInt(usageResult.rows[0]?.count ?? "0", 10);

      if (dailyCount >= config.dailyMaxRequestsPerUser) {
        sendErrorResponse(
          res,
          ApiError.tooManyRequests(
            `Daily AI limit of ${config.dailyMaxRequestsPerUser} requests reached. Resets at midnight.`,
            "ai_daily_limit",
          ),
        );
        return;
      }

      next();
    } catch (err) {
      console.error("ai_access_guard_error", err);
      sendErrorResponse(
        res,
        ApiError.internal("AI access check failed. Please try again."),
      );
    }
  };
}
