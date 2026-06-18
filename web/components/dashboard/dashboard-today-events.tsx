"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, Calendar03Icon } from "@hugeicons/core-free-icons"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { EventListItem } from "@/hooks/use-events"
import {
  dashboardDuration,
  dashboardTransition,
  cardVariants,
} from "@/components/dashboard/dashboard-motion"
import { dashboardTokens } from "@/components/dashboard/dashboard-tokens"
import {
  formatEventTimeRange,
  getTodayEvents,
} from "@/components/dashboard/dashboard-utils"

type DashboardTodayEventsProps = {
  events: EventListItem[]
  isLoading: boolean
  reducedMotion: boolean
}

export function DashboardTodayEvents({
  events,
  isLoading,
  reducedMotion,
}: DashboardTodayEventsProps) {
  const todayEvents = getTodayEvents(events)
  const eventCount = todayEvents.length

  return (
    <motion.section variants={cardVariants} className={dashboardTokens.card}>
      <div className="flex items-center justify-between gap-3 border-b border-border/30 pb-5">
        <div className="flex items-center gap-3">
          <span className={dashboardTokens.cardIcon}>
            <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-4" />
          </span>
          <div>
            <h2 className="text-base font-medium text-foreground">Today&apos;s schedule</h2>
            <p className="text-xs text-muted-foreground">Events on your calendar</p>
          </div>
        </div>
        {!isLoading ? (
          <span className={dashboardTokens.countBadge}>{eventCount}</span>
        ) : null}
      </div>

      <div className="mt-5 flex flex-1 flex-col gap-2.5">
        {isLoading ? (
          <>
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </>
        ) : todayEvents.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
            <p className="text-sm font-medium text-foreground/80">Clear calendar</p>
            <p className="max-w-[16rem] text-sm text-muted-foreground">
              Nothing scheduled for today.
            </p>
          </div>
        ) : (
          todayEvents.map((event) => (
            <motion.div
              key={event.id}
              whileHover={reducedMotion ? undefined : { y: -1 }}
              transition={dashboardTransition(reducedMotion, dashboardDuration.fast)}
            >
              <Link
                href="/dashboard/calendar"
                className={cn(
                  dashboardTokens.row,
                  "flex items-start gap-3 border-l-2 border-l-muted-foreground/25 pl-4",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {event.summary || "(no title)"}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {formatEventTimeRange(event.start, event.end)}
                  </span>
                </span>
              </Link>
            </motion.div>
          ))
        )}
      </div>

      <Link href="/dashboard/calendar" className={cn(dashboardTokens.footerLink, "mt-6")}>
        View calendar
        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-3.5" />
      </Link>
    </motion.section>
  )
}
