"use client"

import { motion } from "motion/react"

import {
  dashboardDuration,
  dashboardTransition,
  greetingVariants,
} from "@/components/dashboard/dashboard-motion"
import { formatDashboardDate, getGreeting } from "@/components/dashboard/dashboard-utils"

type DashboardGreetingProps = {
  name?: string | null
  reducedMotion: boolean
}

export function DashboardGreeting({ name, reducedMotion }: DashboardGreetingProps) {
  const greeting = getGreeting()
  const dateLabel = formatDashboardDate()

  return (
    <motion.div
      initial={reducedMotion ? false : "initial"}
      animate="animate"
      variants={greetingVariants}
      transition={dashboardTransition(reducedMotion, dashboardDuration.normal)}
      className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end"
    >
      <div className="max-w-xl space-y-2">
        <p className="text-sm text-muted-foreground">{dateLabel}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          {greeting}
          {name ? `, ${name}` : ""}
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          Here&apos;s what needs your attention today.
        </p>
      </div>
    </motion.div>
  )
}
