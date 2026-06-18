import { setupCorsair } from "corsair";

import { corsair } from "./corsair.js";
import { env } from "./config/env.js";

const INTEGRATIONS_CALLBACK_URL = `${env.frontendUrl}/api/integrations/callback`;

/** Ensures corsair_integrations rows exist with Google OAuth client credentials. */
export async function bootstrapCorsairIntegrations(): Promise<void> {
  const output = await setupCorsair(corsair, {
    credentials: {
      gmail: {
        client_id: env.googleClientId,
        client_secret: env.googleClientSecret,
        redirect_url: INTEGRATIONS_CALLBACK_URL,
      },
      googlecalendar: {
        client_id: env.googleClientId,
        client_secret: env.googleClientSecret,
        redirect_url: INTEGRATIONS_CALLBACK_URL,
      },
    },
  });

  if (output.trim()) {
    console.info(output);
  }
}

export async function ensureCorsairTenant(tenantId: string): Promise<void> {
  await setupCorsair(corsair, { tenantId });
}
