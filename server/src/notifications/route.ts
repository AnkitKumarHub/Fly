import express, { type Router } from "express";

import { restrictToAuthenticatedUser } from "../middleware/auth-middleware.js";
import { handleNotificationStream } from "./controller.js";

export const notificationsRouter: Router = express.Router();

notificationsRouter.get("/stream", restrictToAuthenticatedUser(), handleNotificationStream);
