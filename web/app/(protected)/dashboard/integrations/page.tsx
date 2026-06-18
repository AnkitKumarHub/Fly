"use client"

import { IntegrationCard } from "@/components/integration-card"
import { useIntegrations } from "@/hooks/use-integrations"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar01Icon, Mail01Icon } from "@hugeicons/core-free-icons"

export default function IntegrationsPage() {
  const { connectedPlugins, connectPlugin, disconnectPlugin, isDisconnecting } = useIntegrations()

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
      </div>
    </div>
  )
}
