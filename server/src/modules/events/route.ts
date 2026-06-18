import express, { type Router } from "express";

import { restrictToAuthenticatedUser } from "../../middleware/auth-middleware.js";
import { requireConnection } from "../integrations/require-connection.js";
import {
  handleCreateEvent,
  handleDeleteEvent,
  handleGetEvent,
  handleListEvents,
  handleSearchEvents,
  handleSyncEvents,
  handleUpdateEvent,
} from "./controller.js";

export const eventsRouter: Router = express.Router();

eventsRouter.use(restrictToAuthenticatedUser());
eventsRouter.use(requireConnection("googlecalendar"));

eventsRouter.get("/", handleListEvents);
eventsRouter.get("/search", handleSearchEvents);
eventsRouter.post("/sync", handleSyncEvents);
eventsRouter.post("/", handleCreateEvent);
eventsRouter.get("/:id", handleGetEvent);
eventsRouter.patch("/:id", handleUpdateEvent);
eventsRouter.delete("/:id", handleDeleteEvent);
