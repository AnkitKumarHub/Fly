"use client"

import { motion } from "motion/react"

import { cn } from "@/lib/utils"
import type { EventListItem } from "@/hooks/use-events"
import { CalendarEventPill } from "@/components/calendar/calendar-event-pill"
import {
  gridStagger,
  monthCellVariants,
  todayRingVariants,
  calendarDuration,
  calendarTransition,
} from "@/components/calendar/calendar-motion"
import {
  WEEKDAY_LABELS,
  getEventsForDay,
  getMonthGrid,
  isSameMonth,
  isToday,
} from "@/components/calendar/calendar-utils"

type CalendarMonthViewProps = {
  focusDate: Date
  events: EventListItem[]
  reducedMotion: boolean
  onSelectDay: (date: Date) => void
  onSelectEvent: (eventId: string) => void
}

const MAX_VISIBLE_EVENTS = 3

export function CalendarMonthView({
  focusDate,
  events,
  reducedMotion,
  onSelectDay,
  onSelectEvent,
}: CalendarMonthViewProps) {
  const days = getMonthGrid(focusDate)

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#F7F7F6] dark:bg-muted/10">
      <div className="grid grid-cols-7 px-4 py-3 md:px-6">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="px-1 text-center text-[11px] font-medium tracking-[0.08em] text-muted-foreground/80 uppercase"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-7 gap-2 overflow-y-auto px-3 pb-3 md:gap-2.5 md:px-5 md:pb-5">
        {days.map((day, index) => {
          const inMonth = isSameMonth(day, focusDate)
          const today = isToday(day)
          const dayEvents = getEventsForDay(events, day)
          const hiddenCount = Math.max(0, dayEvents.length - MAX_VISIBLE_EVENTS)

          return (
            <motion.button
              key={day.toISOString()}
              type="button"
              variants={monthCellVariants}
              initial={reducedMotion ? false : "hidden"}
              animate="show"
              whileHover={reducedMotion ? undefined : "hover"}
              whileTap={reducedMotion ? undefined : "tap"}
              transition={{
                ...calendarTransition(reducedMotion, calendarDuration.normal),
                delay: reducedMotion ? 0 : index * gridStagger,
              }}
              onClick={() => onSelectDay(day)}
              className={cn(
                "relative flex min-h-[5.5rem] flex-col rounded-2xl border p-2 text-left md:min-h-[6.75rem] md:p-2.5",
                "shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-[border-color,box-shadow] duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/25",
                inMonth
                  ? "border-border/60 bg-card hover:border-border hover:shadow-[0_6px_18px_rgba(0,0,0,0.05)]"
                  : "border-border/35 bg-card/50 text-muted-foreground hover:bg-card/70",
                today && "border-emerald-600/25 ring-1 ring-emerald-600/15",
              )}
            >
              {today ? (
                <motion.span
                  variants={todayRingVariants}
                  initial={reducedMotion ? false : "initial"}
                  animate="animate"
                  className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-emerald-600/20"
                />
              ) : null}

              <span
                className={cn(
                  "relative mb-1.5 inline-flex size-7 items-center justify-center rounded-full text-sm font-medium tabular-nums",
                  today &&
                    "bg-emerald-700 text-white shadow-sm dark:bg-emerald-600",
                  !today && inMonth && "text-foreground",
                  !inMonth && "text-muted-foreground/60",
                )}
              >
                {day.getDate()}
              </span>

              <div className="relative flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden">
                {dayEvents.slice(0, MAX_VISIBLE_EVENTS).map((event) => (
                  <CalendarEventPill
                    key={event.id}
                    event={event}
                    compact
                    reducedMotion={reducedMotion}
                    onSelect={onSelectEvent}
                  />
                ))}
                {hiddenCount > 0 ? (
                  <span className="px-1 text-[10px] font-medium text-muted-foreground/80">
                    +{hiddenCount} more
                  </span>
                ) : null}
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
