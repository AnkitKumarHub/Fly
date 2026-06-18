import { OAuth2Client } from "google-auth-library";

import { env } from "../../config/env.js";

export const googleOAuthClient = new OAuth2Client(
  env.googleClientId,
  env.googleClientSecret,
  env.googleCallbackUrl,
);

export function getGoogleAuthUrl(): string {
  return googleOAuthClient.generateAuthUrl({
    access_type: "offline",
    prompt: "select_account",
    scope: ["openid", "email", "profile"],
  });
}

export interface GoogleProfile {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string | null;
}

export async function getGoogleProfileFromCode(code: string): Promise<GoogleProfile> {
  const { tokens } = await googleOAuthClient.getToken({
    code,
    redirect_uri: env.googleCallbackUrl,
  });

  if (!tokens.id_token) {
    throw new Error("Google did not return an ID token.");
  }

  const ticket = await googleOAuthClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: env.googleClientId,
  });

  const payload = ticket.getPayload();

  if (!payload?.sub || !payload.email) {
    throw new Error("Google profile is missing required fields.");
  }

  const firstName = payload.given_name?.trim() || payload.name?.trim() || "User";
  const lastName = payload.family_name?.trim() || null;

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    firstName,
    lastName,
  };
}
