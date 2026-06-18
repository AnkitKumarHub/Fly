import { setupCorsair } from "corsair";

import { corsair } from "./corsair.js";
import { env } from "./config/env.js";

/** Ensures corsair_integrations rows exist with Google OAuth client credentials. */
export async function bootstrapCorsairIntegrations(): Promise<void> {
  const output = await setupCorsair(corsair, {
    credentials: {
      gmail: {
        client_id: env.googleClientId,
        client_secret: env.googleClientSecret,
      },
      googlecalendar: {
        client_id: env.googleClientId,
        client_secret: env.googleClientSecret,
      },
    },
  });

  if (output.trim()) {
    console.info(output);
  }
}
