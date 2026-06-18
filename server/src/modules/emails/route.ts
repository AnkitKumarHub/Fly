import express, { type Router } from "express";

import { restrictToAuthenticatedUser } from "../../middleware/auth-middleware.js";
import { requireConnection } from "../integrations/require-connection.js";
import {
  handleCreateDraft,
  handleGetEmail,
  handleListEmails,
  handleSearchEmails,
  handleSendEmail,
  handleSyncInbox,
} from "./controller.js";

export const emailsRouter: Router = express.Router();

emailsRouter.use(restrictToAuthenticatedUser());
emailsRouter.use(requireConnection("gmail"));

emailsRouter.get("/", handleListEmails);
emailsRouter.get("/search", handleSearchEmails);
emailsRouter.post("/sync", handleSyncInbox);
emailsRouter.post("/send", handleSendEmail);
emailsRouter.post("/draft", handleCreateDraft);
emailsRouter.get("/:id", handleGetEmail);
