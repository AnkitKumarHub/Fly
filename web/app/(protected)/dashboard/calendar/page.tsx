"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar03Icon,
  PencilEdit01Icon,
  RefreshIcon,
  SearchIcon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { EventSheet } from "@/components/event-sheet"
import {
  IntegrationReconnectBanner,
  isIntegrationNotConnectedError,
} from "@/components/integration-reconnect-banner"
import { useIntegrations } from "@/hooks/use-integrations"
import {
  useEvent,
  useEvents,
  useSearchEvents,
  useSyncEvents,
  type EventDateTime,
  type EventListItem,
} from "@/hooks/use-events"

function formatEventTime(dateTime?: EventDateTime) {
  if (!dateTime) return ""
  if (dateTime.date) {
    return new Date(`${dateTime.date}T00:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })
  }
  if (!dateTime.dateTime) return ""

  const parsed = new Date(dateTime.dateTime)
  if (Number.isNaN(parsed.getTime())) return ""

  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatEventRange(start?: EventDateTime, end?: EventDateTime) {
  const startLabel = formatEventTime(start)
  const endLabel = formatEventTime(end)
  if (!startLabel) return ""
  if (!endLabel) return startLabel
  return `${startLabel} – ${endLabel}`
}

const SEEN_EVENTS_KEY = "fly_seen_events"

function readSeenEventIds(): Set<string> {
  if (typeof window === "undefined") return new Set()

  try {
    const raw = sessionStorage.getItem(SEEN_EVENTS_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

function writeSeenEventIds(ids: Set<string>) {
  sessionStorage.setItem(SEEN_EVENTS_KEY, JSON.stringify([...ids]))
}

export default function CalendarPage() {
  const [search, setSearch] = useState("")
  const [activeQuery, setActiveQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<import("@/hooks/use-events").EventDetail | null>(
    null,
  )
  const [seenEventIds, setSeenEventIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    setSeenEventIds(readSeenEventIds())
  }, [])

  const { connectedPlugins, isStatusLoading } = useIntegrations()
  const isCalendarConnected = connectedPlugins.includes("googlecalendar")

  const isSearching = activeQuery.trim().length > 0
  const listQuery = useEvents()
  const searchQuery = useSearchEvents(activeQuery)
  const syncEvents = useSyncEvents()

  const { data: events, isLoading, error: listError } = isSearching ? searchQuery : listQuery
  const showReconnect = isIntegrationNotConnectedError(listError)
  const { data: selectedEvent, isLoading: isDetailLoading } = useEvent(selectedId)

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault()
    setActiveQuery(search)
  }

  function handleSync() {
    syncEvents.mutate(undefined, {
      onSuccess: () => toast.success("Calendar synced"),
      onError: () => toast.error("Failed to sync calendar"),
    })
  }

  function handleCreate() {
    setEditingEvent(null)
    setSheetOpen(true)
  }

  function handleEdit() {
    if (!selectedEvent) return
    setEditingEvent(selectedEvent)
    setSheetOpen(true)
  }

  function handleSelectEvent(eventId: string) {
    setSelectedId(eventId)
    setSeenEventIds((current) => {
      const next = new Set(current)
      next.add(eventId)
      writeSeenEventIds(next)
      return next
    })
  }

  if (isStatusLoading) {
    return <CalendarStatusSkeleton />
  }

  if (!isCalendarConnected) {
    return (
      <div className="flex h-[calc(100vh-var(--header-height))] flex-col items-center justify-center gap-3 px-6 text-center">
        <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-10 text-muted-foreground" />
        <h1 className="text-xl font-semibold tracking-tight">Connect Google Calendar</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Connect your Google Calendar account to view and manage events.
        </p>
        <Button render={<Link href="/dashboard/integrations" />}>Go to Integrations</Button>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-var(--header-height))] flex-col">
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">Calendar</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSync} disabled={syncEvents.isPending}>
            <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} className="size-4" />
            {syncEvents.isPending ? "Syncing..." : "Sync"}
          </Button>
          <Button size="sm" onClick={handleCreate}>
            <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} className="size-4" />
            New event
          </Button>
        </div>
      </div>

      {showReconnect ? (
        <div className="border-b border-border px-6 py-3">
          <IntegrationReconnectBanner message="Reconnect Google Calendar on the integrations page to continue." />
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1">
        <div className="flex w-full max-w-sm flex-col border-r border-border">
          <form onSubmit={handleSearchSubmit} className="border-b border-border p-3">
            <div className="relative">
              <HugeiconsIcon
                icon={SearchIcon}
                strokeWidth={2}
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search events..."
                className="pl-9"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  if (event.target.value === "") setActiveQuery("")
                }}
              />
            </div>
          </form>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col gap-2 p-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : !events || events.length === 0 ? (
              <EmptyList isSearching={isSearching} />
            ) : (
              <ul>
                {events.map((event) => (
                  <EventRow
                    key={event.id}
                    event={event}
                    active={event.id === selectedId}
                    isUnseen={!seenEventIds.has(event.id)}
                    onSelect={() => handleSelectEvent(event.id)}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1 overflow-y-auto">
          {!selectedId ? (
            <EmptyDetail />
          ) : isDetailLoading ? (
            <div className="flex flex-col gap-3 p-8">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="mt-4 h-32 w-full" />
            </div>
          ) : selectedEvent ? (
            <EventDetailView event={selectedEvent} onEdit={handleEdit} />
          ) : null}
        </div>
      </div>

      <EventSheet open={sheetOpen} onOpenChange={setSheetOpen} event={editingEvent} />
    </div>
  )
}

function EventRow({
  event,
  active,
  isUnseen,
  onSelect,
}: {
  event: EventListItem
  active: boolean
  isUnseen: boolean
  onSelect: () => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex w-full flex-col gap-1 border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-muted/50",
          isUnseen ? "bg-primary/5" : "bg-background",
          active && "bg-muted",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "truncate text-sm text-foreground",
              isUnseen ? "font-semibold" : "font-medium",
            )}
          >
            {event.summary || "(no title)"}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatEventTime(event.start)}
          </span>
        </div>
        <span className="truncate text-xs text-muted-foreground">
          {formatEventRange(event.start, event.end)}
        </span>
        {event.location ? (
          <span className="truncate text-xs text-muted-foreground">{event.location}</span>
        ) : null}
      </button>
    </li>
  )
}

function EventDetailView({
  event,
  onEdit,
}: {
  event: import("@/hooks/use-events").EventDetail
  onEdit: () => void
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-8 py-8">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          {event.summary || "(no title)"}
        </h2>
        <Button variant="outline" size="sm" onClick={onEdit}>
          Edit
        </Button>
      </div>

      <div className="flex flex-col gap-2 border-b border-border pb-4 text-sm">
        <span className="text-muted-foreground">
          {formatEventRange(event.start, event.end)}
        </span>
        {event.location ? (
          <span className="text-foreground">{event.location}</span>
        ) : null}
        {event.status ? (
          <span className="text-muted-foreground capitalize">Status: {event.status}</span>
        ) : null}
      </div>

      {event.attendees && event.attendees.length > 0 ? (
        <div className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">Attendees</span>
          <ul className="list-inside list-disc text-muted-foreground">
            {event.attendees.map((attendee, index) => (
              <li key={attendee.email ?? index}>
                {attendee.displayName ? `${attendee.displayName} (${attendee.email})` : attendee.email}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {event.description ? (
        <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground/90">
          {event.description}
        </pre>
      ) : null}

      {event.htmlLink ? (
        <a
          href={event.htmlLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          Open in Google Calendar
        </a>
      ) : null}
    </div>
  )
}

function CalendarStatusSkeleton() {
  return (
    <div className="flex h-[calc(100vh-var(--header-height))] flex-col">
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <Skeleton className="h-7 w-28" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="flex w-full max-w-sm flex-col border-r border-border">
          <div className="border-b border-border p-3">
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
          <div className="flex flex-col gap-2 p-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <div className="min-w-0 flex-1 p-8">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="mt-4 h-4 w-1/3" />
          <Skeleton className="mt-8 h-32 w-full" />
        </div>
      </div>
    </div>
  )
}

function EmptyList({ isSearching }: { isSearching: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-8 text-muted-foreground" />
      <p className="text-sm font-medium text-foreground">
        {isSearching ? "No matching events" : "No events yet"}
      </p>
      <p className="text-xs text-muted-foreground">
        {isSearching ? "Try a different search." : "Hit Sync to pull events from Google Calendar."}
      </p>
    </div>
  )
}

function EmptyDetail() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <HugeiconsIcon
        icon={Calendar03Icon}
        strokeWidth={2}
        className="size-10 text-muted-foreground/50"
      />
      <p className="text-sm text-muted-foreground">Select an event to view details</p>
    </div>
  )
}
