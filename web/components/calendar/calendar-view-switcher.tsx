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
    <div className="relative flex rounded-full border border-border/60 bg-card/80 p-1 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {VIEWS.map((item) => {
        const active = view === item.id

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onViewChange(item.id)}
            className={cn(
              "relative z-10 min-w-[4.25rem] rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/20",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground/80",
            )}
          >
            {active ? (
              <motion.span
                layoutId={reducedMotion ? undefined : "calendar-view-pill"}
                transition={calendarTransition(reducedMotion, calendarDuration.normal)}
                className="absolute inset-0 rounded-full bg-muted/70 shadow-sm ring-1 ring-border/40"
              />
            ) : null}
            <span className="relative">{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
