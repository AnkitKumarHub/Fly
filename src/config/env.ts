export const env = {
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecretKey: process.env.JWT_SECRET_KEY!,
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",
  nodeEnv: process.env.NODE_ENV ?? "development",
  cookieSecure:
    process.env.COOKIE_SECURE === "true"
      ? true
      : process.env.COOKIE_SECURE === "false"
        ? false
        : process.env.NODE_ENV === "production",
};
