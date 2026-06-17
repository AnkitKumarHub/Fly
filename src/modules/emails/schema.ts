import { z } from "zod";

const limitSchema = z.coerce.number().int().min(1).max(100).default(25);
const offsetSchema = z.coerce.number().int().min(0).default(0);

export const listEmailsQuerySchema = z.object({
  limit: limitSchema,
  offset: offsetSchema,
});

export const searchEmailsQuerySchema = z.object({
  q: z.string().trim().min(1, "Search query is required"),
  limit: limitSchema,
  offset: offsetSchema,
});

export const composeEmailSchema = z.object({
  to: z.string().trim().email("Invalid recipient email"),
  subject: z.string().trim().max(998).default(""),
  body: z.string().default(""),
});

export type ListEmailsQuery = z.infer<typeof listEmailsQuerySchema>;
export type SearchEmailsQuery = z.infer<typeof searchEmailsQuerySchema>;
export type ComposeEmailInput = z.infer<typeof composeEmailSchema>;
