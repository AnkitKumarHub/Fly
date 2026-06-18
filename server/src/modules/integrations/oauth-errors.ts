import { AuthMissingError } from "corsair";

import { ApiError } from "../../common/utils/api-error.js";
import { disconnectIntegration } from "./service.js";
import type { IntegrationPlugin } from "./types.js";

function errorText(error: unknown): string {
  if (error instanceof Error) {
    return `${error.message} ${error.cause ?? ""}`;
  }

  return String(error);
}

export function isOAuthRevokedError(error: unknown): boolean {
  if (error instanceof AuthMissingError) {
    return true;
  }

  const text = errorText(error).toLowerCase();
  return (
    text.includes("invalid_grant") ||
    text.includes("unauthorized_client") ||
    text.includes("token has been expired or revoked")
  );
}

export async function handleIntegrationApiError(
  error: unknown,
  tenantId: string,
  plugin: IntegrationPlugin,
): Promise<never> {
  if (error instanceof ApiError) {
    throw error;
  }

  if (isOAuthRevokedError(error)) {
    try {
      await disconnectIntegration(tenantId, plugin);
    } catch (disconnectError) {
      console.error(`[integrations] Failed to clear revoked ${plugin} connection:`, disconnectError);
    }

    throw ApiError.forbidden(
      "Your connection expired. Reconnect on the integrations page.",
      "integration_not_connected",
    );
  }

  throw error;
}
