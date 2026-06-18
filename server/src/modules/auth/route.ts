import express, { type Router } from "express";

import { createRateLimitMiddleware } from "../../middleware/rate-limit.js";
import {
  handleGoogleCallback,
  handleGoogleExchange,
  handleGoogleRedirect,
  handleMe,
  handleRefresh,
  handleSignIn,
  handleSignOut,
  handleSignUp,
} from "./controller.js";
import { restrictToAuthenticatedUser } from "../../middleware/auth-middleware.js";

export const authRouter: Router = express.Router();

authRouter.post("/sign-up", handleSignUp);
authRouter.post("/sign-in", handleSignIn);
authRouter.get("/google", handleGoogleRedirect);
authRouter.post("/google/exchange", handleGoogleExchange);
authRouter.get("/google/callback", handleGoogleCallback);
authRouter.post(
  "/refresh",
  createRateLimitMiddleware({
    max: 30,
    namespace: "auth.refresh",
    windowMs: 60_000,
  }),
  handleRefresh,
);
authRouter.post("/sign-out", handleSignOut);

authRouter.get(
  "/me",
  restrictToAuthenticatedUser(),
  handleMe,
);
