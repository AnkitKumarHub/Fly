"use client"

import { useReducedMotion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar01Icon, Mail01Icon } from "@hugeicons/core-free-icons"

import { IntegrationCard } from "@/components/integration-card"
import { Skeleton } from "@/components/ui/skeleton"
import { useIntegrations } from "@/hooks/use-integrations"

function IntegrationCardSkeleton() {
  return (
    <div className="flex min-h-[220px] flex-col rounded-2xl border border-border/70 bg-card p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="size-11 rounded-xl" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="mt-auto flex justify-end pt-6">
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>
    </div>
  )
}

export default function IntegrationsPage() {
  const reducedMotion = useReducedMotion() ?? false
  const {
    connectedPlugins,
    connectPlugin,
    disconnectPlugin,
    isDisconnecting,
    isStatusLoading,
  } = useIntegrations()

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8 md:px-10 md:py-10">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Integrations</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Manage the third-party services Fly uses to act on your behalf.
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        {isStatusLoading ? (
          <>
            <IntegrationCardSkeleton />
            <IntegrationCardSkeleton />
          </>
        ) : (
          <>
            <IntegrationCard
              name="Gmail"
              description="Read, search, and send email from your inbox without leaving the dashboard."
              plugin="gmail"
              scopes="Read and send mail, manage drafts and labels"
              icon={
                <HugeiconsIcon
                  icon={Mail01Icon}
                  strokeWidth={2}
                  className="size-5 text-foreground/80"
                />
              }
              connected={connectedPlugins.includes("gmail")}
              onConnect={connectPlugin}
              onDisconnect={disconnectPlugin}
              isDisconnecting={isDisconnecting}
              reducedMotion={reducedMotion}
            />
            <IntegrationCard
              name="Google Calendar"
              description="View events, create meetings, and keep your schedule in sync with Google Calendar."
              plugin="googlecalendar"
              scopes="View and manage calendar events"
              icon={
                <HugeiconsIcon
                  icon={Calendar01Icon}
                  strokeWidth={2}
                  className="size-5 text-foreground/80"
                />
              }
              connected={connectedPlugins.includes("googlecalendar")}
              onConnect={connectPlugin}
              onDisconnect={disconnectPlugin}
              isDisconnecting={isDisconnecting}
              reducedMotion={reducedMotion}
            />
          </>
        )}
      </div>
    </div>
  )
}
