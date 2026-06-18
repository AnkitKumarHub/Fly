"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, Calendar03Icon } from "@hugeicons/core-free-icons"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { EventListItem } from "@/hooks/use-events"
import {
  EVENT_COLORS,
  getEventColorIndex,
} from "@/components/calendar/calendar-utils"
import {
  dashboardDuration,
  dashboardTransition,
  cardVariants,
} from "@/components/dashboard/dashboard-motion"
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
    <motion.section
      variants={cardVariants}
      className="flex min-h-[220px] flex-col rounded-2xl border border-[#b8d4f5]/40 bg-[#D6E9FF]/20 p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-[#D6E9FF] text-[#1e3a5f]">
            <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-4" />
          </span>
          <h2 className="text-sm font-semibold text-foreground">Today&apos;s schedule</h2>
        </div>
        {!isLoading && eventCount > 0 ? (
          <span className="rounded-full bg-[#D6E9FF] px-2 py-0.5 text-[11px] font-medium text-[#1e3a5f]">
            {eventCount}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-2">
        {isLoading ? (
          <>
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </>
        ) : todayEvents.length === 0 ? (
          <p className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Nothing scheduled today.
          </p>
        ) : (
          todayEvents.map((event) => {
            const color = EVENT_COLORS[getEventColorIndex(event.id)]

            return (
              <motion.div
                key={event.id}
                whileHover={reducedMotion ? undefined : { y: -1 }}
                transition={dashboardTransition(reducedMotion, dashboardDuration.fast)}
              >
                <Link
                  href="/dashboard/calendar"
                  className={cn(
                    "flex items-start gap-3 rounded-xl border border-transparent bg-card/60 px-3 py-2.5",
                    "transition-colors hover:bg-[#D6E9FF]/25",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                    color.border,
                    "border-l-2",
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {event.summary || "(no title)"}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {formatEventTimeRange(event.start, event.end)}
                    </span>
                  </span>
                </Link>
              </motion.div>
            )
          })
        )}
      </div>

      <Link
        href="/dashboard/calendar"
        className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        View calendar
        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-3.5" />
      </Link>
    </motion.section>
  )
}
