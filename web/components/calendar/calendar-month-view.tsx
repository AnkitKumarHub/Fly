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
      <div className="grid grid-cols-7 border-b border-border/50 px-3 py-2 md:px-4">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="px-1 text-center text-[11px] font-medium tracking-wider text-muted-foreground uppercase"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-7 gap-px overflow-y-auto bg-border/40 p-px">
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
                "flex min-h-[5.5rem] flex-col bg-background p-1.5 text-left transition-colors md:min-h-[6.5rem] md:p-2",
                "hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-inset",
                !inMonth && "bg-muted/10",
              )}
            >
              <span
                className={cn(
                  "mb-1 inline-flex size-7 items-center justify-center rounded-full text-sm font-medium tabular-nums",
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
