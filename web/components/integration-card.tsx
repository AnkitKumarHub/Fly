"use client"

import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface IntegrationCardProps {
  name: string
  description: string
  plugin: string
  icon: React.ReactNode
  scopes?: string
  connected: boolean
  onConnect: (plugin: string) => void
  onDisconnect?: (plugin: string) => void
  isDisconnecting?: boolean
  reducedMotion?: boolean
}

const cardEase = [0.25, 0.1, 0.25, 1] as const

export function IntegrationCard({
  name,
  description,
  plugin,
  icon,
  scopes,
  connected,
  onConnect,
  onDisconnect,
  isDisconnecting = false,
  reducedMotion = false,
}: IntegrationCardProps) {
  return (
    <motion.article
      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.32, ease: cardEase }}
      whileHover={reducedMotion ? undefined : { y: -3 }}
      className={cn(
        "flex min-h-[220px] flex-col rounded-2xl border border-border/70 bg-card p-6",
        "shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow duration-200",
        "hover:border-border hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted/70 text-foreground">
            {icon}
          </div>
          <h3 className="text-base font-medium tracking-tight text-foreground">
            {connected ? name : `Connect ${name}`}
          </h3>
        </div>

        {connected ? (
          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800/60">
            Connected
          </span>
        ) : null}
      </div>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">{description}</p>

      {connected && scopes ? (
        <div className="mt-5 space-y-1">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            Scopes
          </p>
          <p className="text-xs leading-relaxed text-foreground/75">{scopes}</p>
        </div>
      ) : null}

      <div className="mt-6 flex items-center justify-end gap-3">
        {connected ? (
          <>
            <button
              type="button"
              disabled={isDisconnecting}
              onClick={() => onDisconnect?.(plugin)}
              className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline disabled:opacity-50"
            >
              {isDisconnecting ? "Disconnecting…" : "Disconnect"}
            </button>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="pointer-events-none rounded-full border-emerald-200/80 bg-emerald-50 px-4 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-300"
            >
              <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={2} className="size-4" />
              Connected
            </Button>
          </>
        ) : (
          <motion.div whileTap={reducedMotion ? undefined : { scale: 0.97 }}>
            <Button
              size="sm"
              onClick={() => onConnect(plugin)}
              className="rounded-full bg-foreground px-5 text-background hover:bg-foreground/90"
            >
              Connect
            </Button>
          </motion.div>
        )}
      </div>
    </motion.article>
  )
}
