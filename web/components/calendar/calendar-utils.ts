import type { EventDateTime, EventListItem } from "@/hooks/use-events"

export type CalendarView = "month" | "week" | "day"

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const

export const EVENT_COLORS = [
  {
    bg: "bg-[#ECECEA] dark:bg-[#2a2a28]",
    text: "text-[#3D3D3B] dark:text-[#D4D4D2]",
    border: "border-[#D8D8D6]/90 dark:border-[#3A3A38]",
  },
  {
    bg: "bg-[#E8F0EB] dark:bg-[#243028]",
    text: "text-[#2F4A38] dark:text-[#B8D4C4]",
    border: "border-[#C8DDD0]/90 dark:border-[#345040]",
  },
  {
    bg: "bg-[#EEEAE6] dark:bg-[#302C28]",
    text: "text-[#4A4038] dark:text-[#D8CEC4]",
    border: "border-[#DDD4CA]/90 dark:border-[#4A4038]",
  },
  {
    bg: "bg-[#EAE8EE] dark:bg-[#2A2830]",
    text: "text-[#3E3848] dark:text-[#CEC8D8]",
    border: "border-[#D4D0DC]/90 dark:border-[#403A4A]",
  },
  {
    bg: "bg-[#ECE8EA] dark:bg-[#30282C]",
    text: "text-[#48343C] dark:text-[#D8C4CC]",
    border: "border-[#DCD0D4]/90 dark:border-[#4A3840]",
  },
] as const

export const HOUR_HEIGHT = 56
export const HOURS = Array.from({ length: 24 }, (_, index) => index)

export function getEventColorIndex(id: string) {
  let hash = 0
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash + id.charCodeAt(index)) % EVENT_COLORS.length
  }
  return hash
}

export function parseEventDate(dateTime?: EventDateTime) {
  if (!dateTime) return null
  if (dateTime.dateTime) {
    const parsed = new Date(dateTime.dateTime)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }
  if (dateTime.date) {
    const parsed = new Date(`${dateTime.date}T00:00:00`)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }
  return null
}

export function isAllDayEvent(start?: EventDateTime) {
  return Boolean(start?.date && !start?.dateTime)
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function isToday(date: Date) {
  return isSameDay(date, new Date())
}

export function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function addMonths(date: Date, count: number) {
  return new Date(date.getFullYear(), date.getMonth() + count, 1)
}

export function addDays(date: Date, count: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + count)
  return next
}

export function startOfWeek(date: Date, weekStartsOn: 0 | 1 = 0) {
  const next = new Date(date)
  const day = next.getDay()
  const diff = (day - weekStartsOn + 7) % 7
  next.setDate(next.getDate() - diff)
  next.setHours(0, 0, 0, 0)
  return next
}

export function getMonthGrid(focusDate: Date) {
  const first = startOfMonth(focusDate)
  const start = startOfWeek(first, 0)
  return Array.from({ length: 42 }, (_, index) => addDays(start, index))
}

export function getWeekDays(focusDate: Date) {
  const start = startOfWeek(focusDate, 0)
  return Array.from({ length: 7 }, (_, index) => addDays(start, index))
}

export function formatMonthYear(date: Date) {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" })
}

export function formatWeekRange(date: Date) {
  const days = getWeekDays(date)
  const start = days[0]
  const end = days[6]

  if (start.getMonth() === end.getMonth()) {
    return `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${end.getDate()}, ${end.getFullYear()}`
  }

  return `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${end.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`
}

export function formatDayTitle(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function formatShortWeekday(date: Date) {
  return date.toLocaleDateString(undefined, { weekday: "long" })
}

export function formatTime(date: Date) {
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
}

export function formatEventTimeLabel(start?: EventDateTime, end?: EventDateTime) {
  const startDate = parseEventDate(start)
  const endDate = parseEventDate(end)
  if (!startDate) return ""

  if (isAllDayEvent(start)) {
    return "All day"
  }

  const startLabel = formatTime(startDate)
  if (!endDate) return startLabel
  return `${startLabel} – ${formatTime(endDate)}`
}

export function getEventsForDay(events: EventListItem[], day: Date) {
  return events
    .filter((event) => eventOverlapsDay(event, day))
    .sort((left, right) => {
      const leftStart = parseEventDate(left.start)?.getTime() ?? 0
      const rightStart = parseEventDate(right.start)?.getTime() ?? 0
      return leftStart - rightStart
    })
}

export function eventOverlapsDay(event: EventListItem, day: Date) {
  const start = parseEventDate(event.start)
  const end = parseEventDate(event.end) ?? start
  if (!start || !end) return false

  const dayStart = new Date(day)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(day)
  dayEnd.setHours(23, 59, 59, 999)

  return start <= dayEnd && end >= dayStart
}

export function getEventMinutesFromMidnight(dateTime?: EventDateTime) {
  const parsed = parseEventDate(dateTime)
  if (!parsed || isAllDayEvent(dateTime)) return 0
  return parsed.getHours() * 60 + parsed.getMinutes()
}

export function getEventDurationMinutes(
  start?: EventDateTime,
  end?: EventDateTime,
  minimum = 30,
) {
  const startMinutes = getEventMinutesFromMidnight(start)
  const endMinutes = getEventMinutesFromMidnight(end)
  if (!end || isAllDayEvent(start)) return 60
  const duration = endMinutes - startMinutes
  return Math.max(duration, minimum)
}

export function filterEventsByQuery(events: EventListItem[], query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return events

  return events.filter((event) => {
    const haystack = [event.summary, event.description, event.location]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
    return haystack.includes(normalized)
  })
}

export function getCalendarTitle(view: CalendarView, focusDate: Date) {
  if (view === "month") return formatMonthYear(focusDate)
  if (view === "week") return formatWeekRange(focusDate)
  return formatDayTitle(focusDate)
}
