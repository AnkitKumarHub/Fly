import { eq } from "drizzle-orm";
import { setupCorsair } from "corsair";
import { corsair } from "../../corsair.js";
import { ApiError } from "../../common/utils/api-error.js";
import { db } from "../../db/index.js";
import { usersTable } from "../../db/auth-schema.js";
import { hashPassword, verifyPassword } from "./password.js";
import type { SignInInput, SignUpInput } from "./schema.js";
import { issueAuthSession } from "./session.js";

interface DatabaseError {
  code?: string;
}

export interface AuthenticatedUser {
  firstName: string;
  lastName: string | null;
  email: string;
}

export async function signUp(input: SignUpInput): Promise<{ userId: string }> {
  const passwordHash = await hashPassword(input.password);

  try {
    const [createdUser] = await db
      .insert(usersTable)
      .values({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        password: passwordHash,
      })
      .returning({ id: usersTable.id });

    if (!createdUser) {
      throw new Error("User creation failed.");
    }

    await setupCorsair(corsair, { tenantId: createdUser.id });

    return { userId: createdUser.id };
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw ApiError.conflict("A user with this email already exists.", "duplicate_email");
    }

    throw error;
  }
}

export async function signIn(input: SignInInput) {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, input.email));

  if (!user?.password) {
    throw ApiError.unauthorized("Invalid email or password.", "invalid_credentials");
  }

  const isValidPassword = await verifyPassword(input.password, user.password);

  if (!isValidPassword) {
    throw ApiError.unauthorized("Invalid email or password.", "invalid_credentials");
  }

  return issueAuthSession(user.id);
}

export interface GoogleSignInInput {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string | null;
}

export async function googleSignIn(input: GoogleSignInInput) {
  const [userByGoogleId] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.googleId, input.googleId));

  if (userByGoogleId) {
    return issueAuthSession(userByGoogleId.id);
  }

  const [userByEmail] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, input.email));

  if (userByEmail) {
    const [linkedUser] = await db
      .update(usersTable)
      .set({
        googleId: input.googleId,
        emailVerified: true,
      })
      .where(eq(usersTable.id, userByEmail.id))
      .returning({ id: usersTable.id });

    if (!linkedUser) {
      throw new Error("Failed to link Google account.");
    }

    return issueAuthSession(linkedUser.id);
  }

  try {
    const [createdUser] = await db
      .insert(usersTable)
      .values({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        googleId: input.googleId,
        emailVerified: true,
      })
      .returning({ id: usersTable.id });

    if (!createdUser) {
      throw new Error("User creation failed.");
    }

    await setupCorsair(corsair, { tenantId: createdUser.id });

    return issueAuthSession(createdUser.id);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw ApiError.conflict("A user with this email already exists.", "duplicate_email");
    }

    throw error;
  }
}

export async function getAuthenticatedUser(userId: string): Promise<AuthenticatedUser> {
  const [user] = await db
    .select({
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      email: usersTable.email,
    })
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  if (!user) {
    throw ApiError.unauthorized("Authentication required", "user_not_found", true);
  }

  return user;
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object"
    && error !== null
    && "code" in error
    && (error as DatabaseError).code === "23505";
}
