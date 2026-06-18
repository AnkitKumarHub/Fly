import type { Request, Response } from "express";

import { subscribeSse, unsubscribeSse } from "./sse.js";

export function handleNotificationStream(req: Request, res: Response) {
  const tenantId = req.user!.id;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  res.write(": open\n\n");
  res.write(`data: ${JSON.stringify({ type: "init" })}\n\n`);

  subscribeSse(tenantId, res);

  const pingInterval = setInterval(() => {
    res.write(": ping\n\n");
  }, 15000);

  req.on("close", () => {
    clearInterval(pingInterval);
    unsubscribeSse(tenantId, res);
  });
}
