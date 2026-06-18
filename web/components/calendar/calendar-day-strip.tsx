"use client"

import { motion } from "motion/react"

import { cn } from "@/lib/utils"
import {
  calendarDuration,
  calendarTransition,
  dayCardVariants,
} from "@/components/calendar/calendar-motion"
import { isSameDay, isToday } from "@/components/calendar/calendar-utils"

type CalendarDayStripProps = {
  days: Date[]
  focusDate: Date
  reducedMotion: boolean
  onSelectDay: (date: Date) => void
}

export function CalendarDayStrip({
  days,
  focusDate,
  reducedMotion,
  onSelectDay,
}: CalendarDayStripProps) {
  return (
    <div className="grid grid-cols-7 gap-2 px-4 pb-3 md:gap-3 md:px-6">
      {days.map((day) => {
        const selected = isSameDay(day, focusDate)
        const today = isToday(day)

        return (
          <motion.button
            key={day.toISOString()}
            type="button"
            variants={dayCardVariants}
            initial="idle"
            whileHover={reducedMotion ? undefined : "hover"}
            whileTap={reducedMotion ? undefined : "tap"}
            transition={calendarTransition(reducedMotion, calendarDuration.fast)}
            onClick={() => onSelectDay(day)}
            className={cn(
              "flex flex-col items-center justify-center rounded-2xl px-2 py-3 text-center transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
              selected
                ? "bg-foreground text-background shadow-sm"
                : today
                  ? "bg-muted/80 text-foreground ring-1 ring-border/60"
                  : "bg-muted/40 text-foreground hover:bg-muted/70",
            )}
          >
            <span
              className={cn(
                "text-[11px] font-medium tracking-wide",
                selected ? "text-background/70" : "text-muted-foreground",
              )}
            >
              {day.toLocaleDateString(undefined, { weekday: "short" })}
            </span>
            <span className="mt-0.5 text-xl font-semibold tabular-nums tracking-tight">
              {day.getDate()}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
