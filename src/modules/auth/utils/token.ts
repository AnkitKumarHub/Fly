import Jwt from "jsonwebtoken";

import { env } from "../../../config/env.js";

export interface UserTokenPayload {
  id: string;
}

const ACCESS_TOKEN_TTL = "15m";

export function createAccessToken(payload: UserTokenPayload): string {
  return Jwt.sign({ ...payload, type: "access" }, env.jwtSecretKey, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

export function verifyAccessToken(token: string): UserTokenPayload {
  const decoded = Jwt.verify(token, env.jwtSecretKey) as UserTokenPayload & {
    type?: string;
  };

  if (decoded.type !== "access") {
    throw new Error("Invalid token type");
  }

  return { id: decoded.id };
}
