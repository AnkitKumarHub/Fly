import { processWebhook } from "corsair";
import express, { type Router } from "express";

import { corsair } from "../corsair.js";
import { resolveWebhookTenantId } from "./webhook-tenant.js";

export const webhooksRouter: Router = express.Router();

webhooksRouter.post("/", async (req, res) => {
  const queryTenantId = req.query.tenantId as string | undefined;
  const tenantId = await resolveWebhookTenantId(queryTenantId, req.body);

  if (!tenantId) {
    return res.status(400).json({
      success: false,
      message:
        "Missing tenantId query param and could not resolve tenant from Gmail Pub/Sub emailAddress",
    });
  }

  const result = await processWebhook(
    corsair,
    req.headers as Record<string, string | string[] | undefined>,
    req.body,
    { tenantId },
  );

  if (result.responseHeaders) {
    for (const [key, value] of Object.entries(result.responseHeaders)) {
      res.setHeader(key, value);
    }
  }

  if (!result.response) {
    return res.status(404).json({
      success: false,
      message: "No matching webhook handler found",
    });
  }

  return res.status(200).json(result.response);
});

webhooksRouter.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Webhook endpoint is active" });
});
