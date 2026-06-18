"use client"

import { motion } from "motion/react"

import { cn } from "@/lib/utils"
import type { EventListItem } from "@/hooks/use-events"
import {
  eventPillVariants,
  calendarDuration,
  calendarTransition,
} from "@/components/calendar/calendar-motion"
import {
  EVENT_COLORS,
  formatEventTimeLabel,
  getEventColorIndex,
  isAllDayEvent,
  parseEventDate,
} from "@/components/calendar/calendar-utils"

type CalendarEventPillProps = {
  event: EventListItem
  reducedMotion: boolean
  compact?: boolean
  className?: string
  style?: React.CSSProperties
  onSelect: (eventId: string) => void
}

export function CalendarEventPill({
  event,
  reducedMotion,
  compact = false,
  className,
  style,
  onSelect,
}: CalendarEventPillProps) {
  const color = EVENT_COLORS[getEventColorIndex(event.id)]
  const start = parseEventDate(event.start)
  const timeLabel = isAllDayEvent(event.start)
    ? "All day"
    : start
      ? start.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
      : ""

  return (
    <motion.button
      type="button"
      layout={!reducedMotion}
      variants={eventPillVariants}
      initial="idle"
      whileHover={reducedMotion ? undefined : "hover"}
      whileTap={reducedMotion ? undefined : "tap"}
      transition={calendarTransition(reducedMotion, calendarDuration.fast)}
      onClick={(clickEvent) => {
        clickEvent.stopPropagation()
        onSelect(event.id)
      }}
      style={style}
      className={cn(
        "group/event block w-full truncate rounded-lg border px-2 py-1 text-left",
        "shadow-[0_1px_1px_rgba(0,0,0,0.03)] transition-[box-shadow,transform] duration-150",
        "dark:shadow-none",
        color.bg,
        color.text,
        color.border,
        compact ? "text-[11px] leading-tight" : "text-xs",
        "hover:shadow-[0_3px_8px_rgba(0,0,0,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/20",
        className,
      )}
      title={`${event.summary || "(no title)"} · ${formatEventTimeLabel(event.start, event.end)}`}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        {!compact && timeLabel ? (
          <span className="shrink-0 font-medium opacity-80">{timeLabel}</span>
        ) : null}
        <span className="truncate font-medium">{event.summary || "(no title)"}</span>
      </span>
    </motion.button>
  )
}
