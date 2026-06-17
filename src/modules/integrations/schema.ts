import { z } from "zod";

const pluginSchema = z.enum(["gmail", "googlecalendar"]);

export const disconnectQuerySchema = z.object({
  plugin: pluginSchema,
});

export type DisconnectQuery = z.infer<typeof disconnectQuerySchema>;
