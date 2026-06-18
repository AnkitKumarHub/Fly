import { z } from "zod";

const firstNameSchema = z
  .string()
  .trim()
  .min(2, "First name must be at least 2 characters long")
  .max(45, "First name must be at most 45 characters long");

const lastNameSchema = z
  .string()
  .trim()
  .max(45, "Last name must be at most 45 characters long");

const emailSchema = z
  .string()
  .trim()
  .email("Invalid email address")
  .max(322, "Email must be at most 322 characters long")
  .transform((email) => email.toLowerCase());

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters long");

export const signupPayloadSchema = z.object({
  firstName: firstNameSchema,
  lastName: z
    .union([lastNameSchema, z.null()])
    .optional()
    .transform((value) => {
      if (value == null) {
        return null;
      }

      return value.length > 0 ? value : null;
    }),
  email: emailSchema,
  password: passwordSchema,
});

export const signInPayloadSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const googleExchangePayloadSchema = z.object({
  code: z.string().min(1, "Authorization code is required"),
});

export type SignUpInput = z.infer<typeof signupPayloadSchema>;
export type SignInInput = z.infer<typeof signInPayloadSchema>;
export type GoogleExchangeInput = z.infer<typeof googleExchangePayloadSchema>;
