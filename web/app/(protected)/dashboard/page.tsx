"use client"

import { useIntegrations } from "@/hooks/use-integrations"

export default function DashboardPage() {
  useIntegrations()

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 md:px-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome back. Select a section from the sidebar to get started.
        </p>
      </div>
    </div>
  )
}
