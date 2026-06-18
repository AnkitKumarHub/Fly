"use client"

import { motion } from "motion/react"

import { cn } from "@/lib/utils"
import type { EventListItem } from "@/hooks/use-events"
import { CalendarEventPill } from "@/components/calendar/calendar-event-pill"
import {
  gridStagger,
  monthCellVariants,
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="grid shrink-0 grid-cols-7 px-3 py-2 md:px-4">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="px-1 text-center text-[11px] font-medium tracking-wider text-muted-foreground uppercase"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-7 grid-rows-6 gap-1.5 overflow-hidden p-2 md:gap-2 md:p-3">
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
              transition={{
                ...calendarTransition(reducedMotion, calendarDuration.normal),
                delay: reducedMotion ? 0 : index * gridStagger,
              }}
              onClick={() => onSelectDay(day)}
              className={cn(
                "flex min-h-0 flex-col rounded-2xl p-1.5 text-left transition-colors md:p-2",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
                inMonth
                  ? "bg-muted/40 hover:bg-muted/55 dark:bg-muted/25 dark:hover:bg-muted/35"
                  : "bg-muted/20 text-muted-foreground hover:bg-muted/30 dark:bg-muted/10",
              )}
            >
              <span
                className={cn(
                  "mb-1 inline-flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-medium tabular-nums",
                  today && "bg-foreground text-background",
                  !today && inMonth && "text-foreground",
                  !inMonth && "text-muted-foreground/60",
                )}
              >
                {day.getDate()}
              </span>

              <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden">
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
                  <span className="px-1 text-[10px] font-medium text-muted-foreground">
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
