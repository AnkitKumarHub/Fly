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
    <div className="grid grid-cols-7 gap-2 border-b border-border/50 bg-[#F7F7F6]/60 px-4 py-3 dark:bg-muted/10 md:gap-2.5 md:px-6">
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
              "relative flex flex-col items-center justify-center rounded-2xl border px-2 py-2.5 text-center",
              "shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/25",
              selected
                ? "border-foreground/15 bg-foreground text-background shadow-sm"
                : today
                  ? "border-emerald-600/25 bg-card text-foreground ring-1 ring-emerald-600/15"
                  : "border-border/55 bg-card text-foreground hover:border-border hover:bg-card/90",
            )}
          >
            <span
              className={cn(
                "text-[11px] font-medium tracking-wide",
                selected ? "text-background/75" : "text-muted-foreground",
              )}
            >
              {day.toLocaleDateString(undefined, { weekday: "short" })}
            </span>
            <span className="mt-0.5 text-lg font-semibold tabular-nums tracking-tight">
              {day.getDate()}
            </span>
            {today && !selected ? (
              <span className="mt-1 size-1 rounded-full bg-emerald-600/80" />
            ) : null}
          </motion.button>
        )
      })}
    </div>
  )
}
