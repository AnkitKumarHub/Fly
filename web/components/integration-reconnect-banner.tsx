"use client"

import Link from "next/link"
import { isAxiosError } from "axios"

import { Button } from "@/components/ui/button"

export function isIntegrationNotConnectedError(error: unknown) {
  if (!isAxiosError(error)) return false

  return (
    error.response?.status === 403 &&
    error.response.data?.error === "integration_not_connected"
  )
}

export function IntegrationReconnectBanner({ message }: { message?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
      <p className="text-sm text-foreground">
        {message ?? "Your account connection expired or was revoked."}
      </p>
      <Button render={<Link href="/dashboard/integrations" />} size="sm" variant="outline">
        Reconnect
      </Button>
    </div>
  )
}
