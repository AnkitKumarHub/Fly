"use client"

import { useIntegrations } from "@/hooks/use-integrations"

export function IntegrationsPrefetch() {
  useIntegrations()
  return null
}
