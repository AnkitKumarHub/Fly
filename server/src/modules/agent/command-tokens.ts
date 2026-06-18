import Jwt from "jsonwebtoken";

import { env } from "../../config/env.js";
import { ApiError } from "../../common/utils/api-error.js";
import {
  confirmationPayloadSchema,
  continuationPayloadSchema,
  type ConfirmationPayload,
  type ContinuationPayload,
} from "./command-schema.js";

const CONTINUATION_TTL = "10m";
const CONFIRMATION_TTL = "10m";

function verifyToken<T>(token: string, schema: { safeParse: (value: unknown) => { success: true; data: T } | { success: false } }): T {
  let decoded: unknown;

  try {
    decoded = Jwt.verify(token, env.jwtSecretKey);
  } catch {
    throw ApiError.unauthorized("Command token is invalid or expired.", "invalid_command_token");
  }

  const parsed = schema.safeParse(decoded);
  if (!parsed.success) {
    throw ApiError.unauthorized("Command token is invalid or expired.", "invalid_command_token");
  }

  return parsed.data;
}

export function createContinuationToken(payload: ContinuationPayload): string {
  return Jwt.sign(payload, env.jwtSecretKey, {
    expiresIn: CONTINUATION_TTL,
  });
}

export function verifyContinuationToken(token: string, userId: string): ContinuationPayload {
  const payload = verifyToken(token, continuationPayloadSchema);

  if (payload.userId !== userId) {
    throw ApiError.forbidden("This command token belongs to another user.", "command_token_user_mismatch");
  }

  return payload;
}

export function createConfirmationToken(payload: ConfirmationPayload): string {
  return Jwt.sign(payload, env.jwtSecretKey, {
    expiresIn: CONFIRMATION_TTL,
  });
}

export function verifyConfirmationToken(token: string, userId: string): ConfirmationPayload {
  const payload = verifyToken(token, confirmationPayloadSchema);

  if (payload.userId !== userId) {
    throw ApiError.forbidden("This command token belongs to another user.", "command_token_user_mismatch");
  }

  return payload;
}
