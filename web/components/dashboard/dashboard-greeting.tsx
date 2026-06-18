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
      className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {greeting}
          {name ? `, ${name}` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what needs your attention today.
        </p>
      </div>
      <p className="text-sm text-muted-foreground">{dateLabel}</p>
    </motion.div>
  )
}
