export const env = {
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecretKey: process.env.JWT_SECRET_KEY!,
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",
  appUrl: process.env.APP_URL ?? "http://localhost:8000",
  nodeEnv: process.env.NODE_ENV ?? "development",
  cookieSecure:
    process.env.COOKIE_SECURE === "true"
      ? true
      : process.env.COOKIE_SECURE === "false"
        ? false
        : process.env.NODE_ENV === "production",
  cookieSameSite: (process.env.COOKIE_SAMESITE ?? "lax") as
    | "lax"
    | "none"
    | "strict",
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  googleClientId: process.env.GOOGLE_CLIENT_ID!,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  googleCallbackUrl:
    process.env.GOOGLE_CALLBACK_URL ?? "http://localhost:8000/auth/google/callback",
};
