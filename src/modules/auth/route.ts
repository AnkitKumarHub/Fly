import express, { type Router } from "express";

import {
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
authRouter.post("/refresh", handleRefresh);
authRouter.post("/sign-out", handleSignOut);

authRouter.get(
  "/me",
  restrictToAuthenticatedUser(),
  handleMe,
);
