import type { EventDateTime, EventListItem } from "@/hooks/use-events"

export type CalendarView = "month" | "week" | "day"

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const

export const EVENT_COLORS = [
  { bg: "bg-[#D6E9FF]", text: "text-[#1e3a5f]", border: "border-[#b8d4f5]/80" },
  { bg: "bg-[#D1F8E1]", text: "text-[#1a3d2e]", border: "border-[#b0e8c8]/80" },
  { bg: "bg-[#FFEAD2]", text: "text-[#5c3d1e]", border: "border-[#f0d4b0]/80" },
  { bg: "bg-[#EDE4F7]", text: "text-[#3d2e5c]", border: "border-[#d4c4eb]/80" },
  { bg: "bg-[#F5E6E8]", text: "text-[#5c2e35]", border: "border-[#e8c8cc]/80" },
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
