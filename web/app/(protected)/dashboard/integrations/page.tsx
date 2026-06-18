"use client"

import { IntegrationCard } from "@/components/integration-card"
import { Skeleton } from "@/components/ui/skeleton"
import { useIntegrations } from "@/hooks/use-integrations"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar01Icon, Mail01Icon } from "@hugeicons/core-free-icons"

function IntegrationCardSkeleton() {
  return (
    <div className="flex flex-col rounded-[12px] border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-4">
        <Skeleton className="size-10 rounded-lg" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
      <div className="mb-8 flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-border/40 pt-4">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  )
}

export default function IntegrationsPage() {
  const {
    connectedPlugins,
    connectPlugin,
    disconnectPlugin,
    isDisconnecting,
    isStatusLoading,
  } = useIntegrations()

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 md:px-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Integrations
        </h1>
        <p className="text-sm text-muted-foreground">
          Connect your favorite tools to supercharge your workflow.
        </p>
      </div>

      <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isStatusLoading ? (
          <>
            <IntegrationCardSkeleton />
            <IntegrationCardSkeleton />
          </>
        ) : (
          <>
            <IntegrationCard
              name="Gmail"
              category="Communication"
              description="Connect your Gmail account to manage emails and automate communication workflows directly from the dashboard."
              plugin="gmail"
              icon={
                <HugeiconsIcon
                  icon={Mail01Icon}
                  strokeWidth={2}
                  className="size-5 text-red-600 dark:text-red-400"
                />
              }
              iconBg="bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
              connected={connectedPlugins.includes("gmail")}
              onConnect={connectPlugin}
              onDisconnect={disconnectPlugin}
              isDisconnecting={isDisconnecting}
            />
            <IntegrationCard
              name="Google Calendar"
              category="Productivity"
              description="Sync your calendar to schedule meetings, track events, and manage your time seamlessly across your team."
              plugin="googlecalendar"
              icon={
                <HugeiconsIcon
                  icon={Calendar01Icon}
                  strokeWidth={2}
                  className="size-5 text-blue-600 dark:text-blue-400"
                />
              }
              iconBg="bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
              connected={connectedPlugins.includes("googlecalendar")}
              onConnect={connectPlugin}
              onDisconnect={disconnectPlugin}
              isDisconnecting={isDisconnecting}
            />
          </>
        )}
      </div>
    </div>
  )
}
