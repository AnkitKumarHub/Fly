"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"
import type { EventListItem } from "@/hooks/use-events"
import { CalendarEventPill } from "@/components/calendar/calendar-event-pill"
import { CurrentTimeIndicator } from "@/components/calendar/current-time-indicator"
import {
  HOUR_HEIGHT,
  HOURS,
  formatShortWeekday,
  getEventDurationMinutes,
  getEventMinutesFromMidnight,
  getEventsForDay,
  isAllDayEvent,
  isToday,
} from "@/components/calendar/calendar-utils"

type CalendarDayViewProps = {
  focusDate: Date
  events: EventListItem[]
  reducedMotion: boolean
  onSelectEvent: (eventId: string) => void
}

export function CalendarDayView({
  focusDate,
  events,
  reducedMotion,
  onSelectEvent,
}: CalendarDayViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const allDayEvents = getEventsForDay(events, focusDate).filter((event) =>
    isAllDayEvent(event.start),
  )
  const timedEvents = getEventsForDay(events, focusDate).filter(
    (event) => !isAllDayEvent(event.start),
  )
  const today = isToday(focusDate)

  useEffect(() => {
    if (!scrollRef.current) return
    const now = new Date()
    const scrollTop = Math.max(0, (now.getHours() - 2) * HOUR_HEIGHT)
    scrollRef.current.scrollTop = scrollTop
  }, [focusDate])

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="border-b border-border/50 px-6 py-4">
        <p className="text-sm text-muted-foreground">{formatShortWeekday(focusDate)}</p>
        <p
          className={cn(
            "mt-1 inline-flex size-12 items-center justify-center rounded-2xl text-3xl font-semibold tabular-nums",
            today ? "bg-foreground text-background" : "text-foreground",
          )}
        >
          {focusDate.getDate()}
        </p>
      </div>

      {allDayEvents.length > 0 ? (
        <div className="space-y-1.5 border-b border-border/50 bg-card/50 px-4 py-3 md:px-6">
          <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            All day
          </p>
          {allDayEvents.map((event) => (
            <CalendarEventPill
              key={event.id}
              event={event}
              reducedMotion={reducedMotion}
              onSelect={onSelectEvent}
            />
          ))}
        </div>
      ) : null}

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="grid grid-cols-[3.25rem_minmax(0,1fr)]">
          <div className="border-r border-border/40 bg-[#F7F7F6]/80 dark:bg-muted/15">
            {HOURS.map((hour) => (
              <div
                key={hour}
                style={{ height: HOUR_HEIGHT }}
                className="relative border-b border-border/25 pr-2 text-right"
              >
                <span className="absolute -top-2 right-2 text-[10px] text-muted-foreground/70">
                  {new Date(2000, 0, 1, hour).toLocaleTimeString(undefined, {
                    hour: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>

          <div
            className={cn(
              "relative bg-card/50",
              today && "bg-emerald-50/35 dark:bg-emerald-950/15",
            )}
          >
            {HOURS.map((hour) => (
              <div
                key={hour}
                style={{ height: HOUR_HEIGHT }}
                className="border-b border-border/15"
              />
            ))}

            {today ? <CurrentTimeIndicator reducedMotion={reducedMotion} /> : null}

            {timedEvents.map((event) => {
              const top = (getEventMinutesFromMidnight(event.start) / 60) * HOUR_HEIGHT
              const height =
                (getEventDurationMinutes(event.start, event.end) / 60) * HOUR_HEIGHT

              return (
                <div
                  key={event.id}
                  className="absolute right-3 left-2 z-10"
                  style={{ top, height: Math.max(height, 32) }}
                >
                  <CalendarEventPill
                    event={event}
                    reducedMotion={reducedMotion}
                    className="h-full"
                    onSelect={onSelectEvent}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
