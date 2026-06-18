import type { EventDateTime, EventListItem } from "@/hooks/use-events"
import type { EmailListItem } from "@/hooks/use-emails"
import { filterByFolder, hasLabel } from "@/components/mail/mail-utils"
import {
  formatEventTimeLabel,
  getEventsForDay,
} from "@/components/calendar/calendar-utils"

export function getGreeting(date = new Date()) {
  const hour = date.getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export function formatDashboardDate(date = new Date()) {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

export function getPriorityEmails(emails: EmailListItem[], limit = 3) {
  return filterByFolder(emails, "inbox")
    .filter((email) => hasLabel(email, "INBOX") && email.isUnread)
    .sort((left, right) => {
      const leftTime = Number(left.internalDate ?? 0)
      const rightTime = Number(right.internalDate ?? 0)
      return rightTime - leftTime
    })
    .slice(0, limit)
}

export function getTodayEvents(events: EventListItem[], limit = 3, day = new Date()) {
  return getEventsForDay(events, day).slice(0, limit)
}

export function formatEventTimeRange(start?: EventDateTime, end?: EventDateTime) {
  return formatEventTimeLabel(start, end)
}

export function getTodayEventCount(events: EventListItem[], day = new Date()) {
  return getEventsForDay(events, day).length
}

export function getUnreadInboxCount(emails: EmailListItem[]) {
  return filterByFolder(emails, "inbox").filter(
    (email) => hasLabel(email, "INBOX") && email.isUnread,
  ).length
}
