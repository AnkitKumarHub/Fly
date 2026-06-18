import "dotenv/config";

const nodeEnv = process.env.NODE_ENV ?? "development";
const isProd = nodeEnv === "production";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function urlEnv(name: string, devDefault: string): string {
  const value = process.env[name];
  if (value) return value;
  if (isProd) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return devDefault;
}

export const env = {
  databaseUrl: requireEnv("DATABASE_URL"),
  jwtSecretKey: requireEnv("JWT_SECRET_KEY"),
  frontendUrl: urlEnv("FRONTEND_URL", "http://localhost:3000"),
  appUrl: urlEnv("APP_URL", "http://localhost:8000"),
  nodeEnv,
  port: parseInt(process.env.PORT ?? "8000", 10),
  cookieSecure:
    process.env.COOKIE_SECURE === "true"
      ? true
      : process.env.COOKIE_SECURE === "false"
        ? false
        : isProd,
  cookieSameSite: (process.env.COOKIE_SAMESITE ?? "lax") as
    | "lax"
    | "none"
    | "strict",
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  googleClientId: requireEnv("GOOGLE_CLIENT_ID"),
  googleClientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
  googleCallbackUrl: urlEnv(
    "GOOGLE_CALLBACK_URL",
    "http://localhost:8000/auth/google/callback",
  ),
  corsairKek: requireEnv("CORSAIR_KEK"),
  gmailPubsubTopic: process.env.GMAIL_PUBSUB_TOPIC,

  // AI agent
  openaiApiKey: requireEnv("OPENAI_API_KEY"),
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  agentMaxSteps: parseInt(process.env.AGENT_MAX_STEPS ?? "5", 10),
};
