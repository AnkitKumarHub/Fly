import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";

import { ApiError } from "../../common/utils/api-error.js";
import { db } from "../../db/index.js";
import { refreshTokensTable, usersTable } from "../../db/auth-schema.js";
import { createAccessToken } from "./utils/token.js";

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function createOpaqueRefreshToken(): string {
  return randomBytes(32).toString("hex");
}

async function buildAuthSession(userId: string) {
  // Fetch role, suspension status, and firstName for the JWT payload
  const [user] = await db
    .select({
      firstName: usersTable.firstName,
      role: usersTable.role,
      isSuspended: usersTable.isSuspended,
    })
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  const accessToken = createAccessToken({
    id: userId,
    firstName: user?.firstName ?? "",
    role: (user?.role ?? "user") as "user" | "admin",
    isSuspended: user?.isSuspended ?? false,
  });
  const refreshToken = createOpaqueRefreshToken();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  return {
    accessToken,
    refreshToken,
    expiresAt,
  };
}

export async function issueAuthSession(userId: string): Promise<AuthSession> {
  const session = await buildAuthSession(userId);

  await db.insert(refreshTokensTable).values({
    userId,
    tokenHash: hashToken(session.refreshToken),
    expiresAt: session.expiresAt,
  });

  return {
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
  };
}

export async function refreshAuthSession(refreshToken: string): Promise<AuthSession> {
  const tokenHash = hashToken(refreshToken);
  const now = new Date();

  return db.transaction(async (tx) => {
    const [revokedToken] = await tx
      .delete(refreshTokensTable)
      .where(and(eq(refreshTokensTable.tokenHash, tokenHash), gt(refreshTokensTable.expiresAt, now)))
      .returning({ userId: refreshTokensTable.userId });

    if (!revokedToken) {
      throw ApiError.unauthorized(
        "Invalid or expired refresh token.",
        "invalid_refresh_token",
        true,
      );
    }

    const nextSession = await buildAuthSession(revokedToken.userId);

    await tx.insert(refreshTokensTable).values({
      userId: revokedToken.userId,
      tokenHash: hashToken(nextSession.refreshToken),
      expiresAt: nextSession.expiresAt,
    });

    return {
      accessToken: nextSession.accessToken,
      refreshToken: nextSession.refreshToken,
    };
  });
}

export async function revokeAuthSession(refreshToken: string | undefined): Promise<void> {
  if (refreshToken) {
    await db
      .delete(refreshTokensTable)
      .where(eq(refreshTokensTable.tokenHash, hashToken(refreshToken)));
  }
}
