"use client"

import { Button } from "@/components/ui/button"

interface IntegrationCardProps {
  name: string
  category: string
  description: string
  plugin: string
  icon: React.ReactNode
  iconBg: string
  connected: boolean
  onConnect: (plugin: string) => void
  onDisconnect?: (plugin: string) => void
  isDisconnecting?: boolean
}

export function IntegrationCard({
  name,
  category,
  description,
  plugin,
  icon,
  iconBg,
  connected,
  onConnect,
  onDisconnect,
  isDisconnecting = false,
}: IntegrationCardProps) {
  return (
    <div className="flex flex-col rounded-[12px] border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-4">
        <div
          className={`flex size-10 items-center justify-center rounded-lg ${iconBg}`}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-base font-medium text-foreground">{name}</h3>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {category}
          </p>
        </div>
      </div>
      <p className="mb-8 flex-1 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="mt-auto flex items-center justify-between border-t border-border/40 pt-4">
        {connected ? (
          <Button
            variant="outline"
            disabled={isDisconnecting}
            onClick={() => onDisconnect?.(plugin)}
          >
            {isDisconnecting ? "Disconnecting..." : "Disconnect"}
          </Button>
        ) : (
          <Button onClick={() => onConnect(plugin)}>Connect {name}</Button>
        )}
        <div className="flex items-center space-x-2">
          <div
            className={`h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-muted-foreground/30"}`}
          />
          <span className="text-xs font-medium text-muted-foreground">
            {connected ? "Connected" : "Not connected"}
          </span>
        </div>
      </div>
    </div>
  )
}
