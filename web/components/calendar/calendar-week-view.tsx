"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"
import type { EventListItem } from "@/hooks/use-events"
import { CalendarDayStrip } from "@/components/calendar/calendar-day-strip"
import { CalendarEventPill } from "@/components/calendar/calendar-event-pill"
import {
  HOUR_HEIGHT,
  HOURS,
  getEventDurationMinutes,
  getEventMinutesFromMidnight,
  getEventsForDay,
  getWeekDays,
  isAllDayEvent,
  isToday,
} from "@/components/calendar/calendar-utils"

type CalendarWeekViewProps = {
  focusDate: Date
  events: EventListItem[]
  reducedMotion: boolean
  onSelectDay: (date: Date) => void
  onSelectEvent: (eventId: string) => void
}

export function CalendarWeekView({
  focusDate,
  events,
  reducedMotion,
  onSelectDay,
  onSelectEvent,
}: CalendarWeekViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const days = getWeekDays(focusDate)

  useEffect(() => {
    if (!scrollRef.current) return
    const now = new Date()
    const scrollTop = Math.max(0, (now.getHours() - 2) * HOUR_HEIGHT)
    scrollRef.current.scrollTop = scrollTop
  }, [focusDate])

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <CalendarDayStrip
        days={days}
        focusDate={focusDate}
        reducedMotion={reducedMotion}
        onSelectDay={onSelectDay}
      />

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))]">
          <div className="border-r border-border/40">
            {HOURS.map((hour) => (
              <div
                key={hour}
                style={{ height: HOUR_HEIGHT }}
                className="relative border-b border-border/30 pr-2 text-right"
              >
                <span className="absolute -top-2 right-2 text-[10px] text-muted-foreground">
                  {new Date(2000, 0, 1, hour).toLocaleTimeString(undefined, {
                    hour: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>

          {days.map((day) => {
            const dayEvents = getEventsForDay(events, day).filter(
              (event) => !isAllDayEvent(event.start),
            )
            const today = isToday(day)

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "relative border-r border-border/30",
                  today && "bg-muted/10",
                )}
              >
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    style={{ height: HOUR_HEIGHT }}
                    className="border-b border-border/20"
                  />
                ))}

                {dayEvents.map((event) => {
                  const top = (getEventMinutesFromMidnight(event.start) / 60) * HOUR_HEIGHT
                  const height =
                    (getEventDurationMinutes(event.start, event.end) / 60) * HOUR_HEIGHT

                  return (
                    <div
                      key={event.id}
                      className="absolute right-1 left-1 z-10"
                      style={{ top, height: Math.max(height, 28) }}
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
            )
          })}
        </div>
      </div>
    </div>
  )
}
