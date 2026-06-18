import { Router, type Router as RouterType } from "express";
import { restrictToAuthenticatedUser } from "../../middleware/auth-middleware.js";
import { aiAccessGuard } from "../../middleware/ai-access-guard.js";
import { createUserRateLimitMiddleware } from "../../middleware/rate-limit.js";
import { handleAgentChat } from "./controller.js";
import { AGENT_LIMITS } from "./config.js";

export const agentRouter: RouterType = Router();

// Health check — no auth required
agentRouter.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "agent" });
});

// POST /agent/chat — full middleware chain
// Order matters:
// 1. restrictToAuthenticatedUser — 401 if no valid JWT
// 2. aiAccessGuard              — global kill switch + suspension + daily cap (from DB)
// 3. per-minute burst limit     — BURST_RATE_PER_MINUTE req/min per user (from config.ts)
// 5. handleAgentChat            — validate → filter → stream → audit
agentRouter.post(
  "/chat",
  restrictToAuthenticatedUser(),
  aiAccessGuard(),
  createUserRateLimitMiddleware({
    max: AGENT_LIMITS.BURST_RATE_PER_MINUTE,
    windowMs: 60_000,
    namespace: "agent.chat.minute",
  }),
  handleAgentChat,
);
