import cors from "cors";
import cookieParser from "cookie-parser";
import express, { type Express } from "express";

import { env } from "./config/env.js";
import { authRouter } from "./modules/auth/route.js";
import { emailsRouter } from "./modules/emails/route.js";
import { eventsRouter } from "./modules/events/route.js";
import { integrationsRouter } from "./modules/integrations/route.js";
import { authenticationMiddleware } from "./middleware/auth-middleware.js";
import { webhooksRouter } from "./webhooks/route.js";


export function createApplication(): Express {
  const app = express();

  app.use(
    cors({
      origin: env.frontendUrl,
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(express.json());
  app.use(authenticationMiddleware());

  app.get("/", (_req, res) => {
    res.status(200).json({
      message: "Welcome to the fly",
    });
  });

  app.use("/auth", authRouter);
  app.use("/integrations", integrationsRouter);
  app.use("/emails", emailsRouter);
  app.use("/events", eventsRouter);
  app.use("/webhooks", webhooksRouter);

  return app;
}
