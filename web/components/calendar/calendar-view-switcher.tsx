"use client"

import { motion } from "motion/react"

import { cn } from "@/lib/utils"
import type { CalendarView } from "@/components/calendar/calendar-utils"
import { calendarDuration, calendarTransition } from "@/components/calendar/calendar-motion"

const VIEWS: { id: CalendarView; label: string }[] = [
  { id: "month", label: "Month" },
  { id: "week", label: "Week" },
  { id: "day", label: "Day" },
]

type CalendarViewSwitcherProps = {
  view: CalendarView
  reducedMotion: boolean
  onViewChange: (view: CalendarView) => void
}

export function CalendarViewSwitcher({
  view,
  reducedMotion,
  onViewChange,
}: CalendarViewSwitcherProps) {
  return (
    <div className="relative flex rounded-full bg-muted/50 p-1 dark:bg-muted/30">
      {VIEWS.map((item) => {
        const active = view === item.id

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onViewChange(item.id)}
            className={cn(
              "relative z-10 min-w-[4.25rem] rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active ? (
              <motion.span
                layoutId={reducedMotion ? undefined : "calendar-view-pill"}
                transition={calendarTransition(reducedMotion, calendarDuration.normal)}
                className="absolute inset-0 rounded-full bg-card shadow-sm ring-1 ring-border/50"
              />
            ) : null}
            <span className="relative">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
