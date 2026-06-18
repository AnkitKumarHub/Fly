"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Mail01Icon, Calendar03Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { dashboardDuration, dashboardTransition } from "@/components/dashboard/dashboard-motion"
import { dashboardTokens } from "@/components/dashboard/dashboard-tokens"

type DashboardConnectCardProps = {
  plugin: "gmail" | "googlecalendar"
  reducedMotion: boolean
}

const COPY = {
  gmail: {
    title: "Connect Gmail",
    description: "See priority mail and unread counts on your dashboard.",
    icon: Mail01Icon,
  },
  googlecalendar: {
    title: "Connect Calendar",
    description: "See today's schedule and upcoming events at a glance.",
    icon: Calendar03Icon,
  },
}

export function DashboardConnectCard({ plugin, reducedMotion }: DashboardConnectCardProps) {
  const config = COPY[plugin]

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={dashboardTransition(reducedMotion, dashboardDuration.normal)}
      className={dashboardTokens.card}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6 text-center">
        <span className={dashboardTokens.cardIcon}>
          <HugeiconsIcon icon={config.icon} strokeWidth={2} className="size-4" />
        </span>
        <div className="max-w-xs space-y-2">
          <h2 className="text-base font-medium text-foreground">{config.title}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{config.description}</p>
        </div>
        <Button
          render={<Link href="/dashboard/integrations" />}
          variant="outline"
          size="sm"
          className="mt-2 rounded-lg"
        >
          Go to Integrations
        </Button>
      </div>
    </motion.div>
  )
}
