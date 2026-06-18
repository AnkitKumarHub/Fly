"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Mail01Icon,
  Calendar03Icon,
  UserIcon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"

interface EmailItem {
  id: string
  from?: string
  subject?: string
  snippet?: string
  isUnread?: boolean
}

interface EventItem {
  id: string
  title?: string
  start?: { dateTime?: string; date?: string }
  end?: { dateTime?: string; date?: string }
  attendees?: { email: string }[]
}

interface ChatToolCardProps {
  toolName: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
}

function formatTime(dt?: string) {
  if (!dt) return ""
  try {
    return new Date(dt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
  } catch {
    return dt
  }
}

function formatDate(dt?: string) {
  if (!dt) return ""
  try {
    return new Date(dt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
  } catch {
    return dt
  }
}

function EmailCard({ email }: { email: EmailItem }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-background/60 p-3">
      <div className="shrink-0 size-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
        <HugeiconsIcon icon={UserIcon} strokeWidth={2} className="size-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium truncate">{email.from ?? "Unknown"}</p>
          {email.isUnread && (
            <Badge variant="default" className="shrink-0 text-[10px] px-1.5 py-0">
              New
            </Badge>
          )}
        </div>
        <p className="text-sm text-foreground/90 truncate mt-0.5">{email.subject ?? "(no subject)"}</p>
        {email.snippet && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{email.snippet}</p>
        )}
      </div>
    </div>
  )
}

function EventCard({ event }: { event: EventItem }) {
  const start = event.start?.dateTime ?? event.start?.date
  const end = event.end?.dateTime ?? event.end?.date
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-background/60 p-3">
      <div className="shrink-0 size-8 rounded-lg bg-primary/10 flex items-center justify-center mt-0.5">
        <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{event.title ?? "Untitled event"}</p>
        {start && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatDate(start)} · {formatTime(start)}
            {end ? ` – ${formatTime(end)}` : ""}
          </p>
        )}
        {event.attendees && event.attendees.length > 0 && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {event.attendees.slice(0, 3).map((a) => a.email).join(", ")}
            {event.attendees.length > 3 ? ` +${event.attendees.length - 3} more` : ""}
          </p>
        )}
      </div>
    </div>
  )
}

export function ChatToolCard({ toolName, data }: ChatToolCardProps) {
  const isEmailTool = toolName.includes("email") || toolName === "results" && data?.[0]?.from !== undefined
  const isEventTool = toolName.includes("event") || toolName === "results" && data?.[0]?.title !== undefined

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
        <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="size-3.5" />
        No results found
      </div>
    )
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        <HugeiconsIcon
          icon={isEmailTool ? Mail01Icon : Calendar03Icon}
          strokeWidth={2}
          className="size-3.5"
        />
        <span>{data.length} result{data.length !== 1 ? "s" : ""}</span>
      </div>
      {isEmailTool
        ? data.map((email: EmailItem) => <EmailCard key={email.id} email={email} />)
        : isEventTool
          ? data.map((event: EventItem) => <EventCard key={event.id} event={event} />)
          : null}
    </div>
  )
}
