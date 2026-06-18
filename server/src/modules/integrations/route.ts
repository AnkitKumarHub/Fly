import express, { type Router } from "express";
import { generateOAuthUrl, processOAuthCallback } from "corsair/oauth";

import { corsair } from "../../corsair.js";
import { ensureCorsairTenant } from "../../bootstrap-corsair.js";
import { env } from "../../config/env.js";
import { restrictToAuthenticatedUser } from "../../middleware/auth-middleware.js";
import { handleDisconnect, handleGetStatus } from "./controller.js";
import { markIntegrationActive } from "./connection-state.js";
import { renewWatchIfNeeded } from "./watches.js";

export const integrationsRouter: Router = express.Router();

const REDIRECT_URI = `${env.frontendUrl}/api/integrations/callback`;

integrationsRouter.get("/status", restrictToAuthenticatedUser(), handleGetStatus);

integrationsRouter.post("/disconnect", restrictToAuthenticatedUser(), handleDisconnect);

/**
 * GET /integrations/connect?plugin=gmail
 * GET /integrations/connect?plugin=googlecalendar
 *
 * Redirects the authenticated user to the Google consent screen.
 * The tenantId is embedded (HMAC-signed) inside the state param by Corsair —
 * so the callback route doesn't need the user's session to know who to save tokens for.
 */
integrationsRouter.get("/connect", restrictToAuthenticatedUser(), async (req, res) => {
  const plugin = req.query.plugin as string;

  if (!plugin) {
    return res.status(400).json({ success: false, message: "plugin query param is required" });
  }

  try {
    await ensureCorsairTenant(req.user!.id);

    const { url, state } = await generateOAuthUrl(corsair, plugin, {
      tenantId: req.user!.id,
      redirectUri: REDIRECT_URI,
    });

    res.cookie("oauth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      secure: env.cookieSecure,
      maxAge: 10 * 60 * 1000,
    });

    return res.redirect(url);
  } catch (error) {
    console.error("integrations.connect.failed:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to start integration OAuth",
    });
  }
});

/**
 * GET /integrations/callback?code=...&state=...
 *
 * Google redirects here after the user approves.
 * Corsair exchanges the code for tokens and stores them encrypted per tenant.
 * No auth middleware needed — tenantId is recovered from the signed state.
 */
integrationsRouter.get("/callback", async (req, res) => {
  const code = req.query.code as string;
  const state = req.query.state as string;

  if (!code || !state) {
    res.clearCookie("oauth_state");
    return res.status(400).json({ success: false, message: "Missing code or state" });
  }

  const storedState = req.cookies["oauth_state"] as string | undefined;
  if (!storedState || storedState !== state) {
    res.clearCookie("oauth_state");
    return res.status(400).json({ success: false, message: "Invalid state — possible CSRF attempt" });
  }

  try {
    const result = await processOAuthCallback(corsair, { code, state, redirectUri: REDIRECT_URI });
    res.clearCookie("oauth_state");

    const plugin = result.plugin as "gmail" | "googlecalendar";
    await markIntegrationActive(result.tenantId, plugin);
    void renewWatchIfNeeded(result.tenantId, plugin);

    return res.redirect(`${env.frontendUrl}/dashboard/integrations?connected=${plugin}`);
  } catch (error) {
    res.clearCookie("oauth_state");
    console.error("integrations.callback.failed:", error);
    const message =
      error instanceof Error ? error.message : "OAuth callback failed";
    return res.status(500).json({ success: false, message });
  }
});
