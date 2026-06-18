"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Mail01Icon, Calendar03Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { dashboardDuration, dashboardTransition } from "@/components/dashboard/dashboard-motion"

type DashboardConnectCardProps = {
  plugin: "gmail" | "googlecalendar"
  reducedMotion: boolean
}

const COPY = {
  gmail: {
    title: "Connect Gmail",
    description: "See priority mail and unread counts on your dashboard.",
    icon: Mail01Icon,
    tint: "bg-[#D1F8E1]/25",
    border: "border-[#b0e8c8]/50",
  },
  googlecalendar: {
    title: "Connect Calendar",
    description: "See today's schedule and upcoming events at a glance.",
    icon: Calendar03Icon,
    tint: "bg-[#D6E9FF]/25",
    border: "border-[#b8d4f5]/50",
  },
}

export function DashboardConnectCard({ plugin, reducedMotion }: DashboardConnectCardProps) {
  const config = COPY[plugin]

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={dashboardTransition(reducedMotion, dashboardDuration.normal)}
      className={cn(
        "flex min-h-[220px] flex-col rounded-2xl border p-5",
        config.tint,
        config.border,
      )}
    >
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-card/80">
          <HugeiconsIcon icon={config.icon} strokeWidth={2} className="size-4" />
        </span>
        <h2 className="text-sm font-semibold text-foreground">{config.title}</h2>
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
        {config.description}
      </p>
      <Button
        render={<Link href="/dashboard/integrations" />}
        variant="outline"
        size="sm"
        className="mt-4 w-fit rounded-full"
      >
        Go to Integrations
      </Button>
    </motion.div>
  )
}
