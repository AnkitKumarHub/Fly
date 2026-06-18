"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar03Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EventSheet } from "@/components/event-sheet"
import { CalendarDayView } from "@/components/calendar/calendar-day-view"
import { CalendarEventDetailSheet } from "@/components/calendar/calendar-event-detail-sheet"
import { CalendarMonthView } from "@/components/calendar/calendar-month-view"
import { CalendarToolbar } from "@/components/calendar/calendar-toolbar"
import { CalendarWeekView } from "@/components/calendar/calendar-week-view"
import {
  IntegrationReconnectBanner,
  isIntegrationNotConnectedError,
} from "@/components/integration-reconnect-banner"
import {
  calendarDuration,
  calendarTransition,
  viewVariants,
} from "@/components/calendar/calendar-motion"
import {
  addDays,
  addMonths,
  filterEventsByQuery,
  getCalendarTitle,
  type CalendarView,
} from "@/components/calendar/calendar-utils"
import { useIntegrations } from "@/hooks/use-integrations"
import {
  useEvent,
  useEvents,
  useSearchEvents,
  useSyncEvents,
  type EventDetail,
} from "@/hooks/use-events"

export default function CalendarPage() {
  const reducedMotion = useReducedMotion() ?? false

  const [view, setView] = useState<CalendarView>("month")
  const [focusDate, setFocusDate] = useState(() => new Date())
  const [search, setSearch] = useState("")
  const [activeQuery, setActiveQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventDetail | null>(null)

  const { connectedPlugins, isStatusLoading } = useIntegrations()
  const isCalendarConnected = connectedPlugins.includes("googlecalendar")

  const isSearching = activeQuery.trim().length > 0
  const listQuery = useEvents(100)
  const searchQuery = useSearchEvents(activeQuery, 100)
  const syncEvents = useSyncEvents()

  const { data: events = [], isLoading, error: listError } = isSearching ? searchQuery : listQuery
  const showReconnect = isIntegrationNotConnectedError(listError)
  const { data: selectedEvent, isLoading: isDetailLoading } = useEvent(selectedId)

  const visibleEvents = isSearching ? filterEventsByQuery(events, activeQuery) : events
  const title = getCalendarTitle(view, focusDate)

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault()
    setActiveQuery(search)
  }

  function handleSearchChange(value: string) {
    setSearch(value)
    if (value === "") setActiveQuery("")
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
    setDetailOpen(false)
    setSheetOpen(true)
  }

  function handleSelectEvent(eventId: string) {
    setSelectedId(eventId)
    setDetailOpen(true)
  }

  function handleSelectDay(date: Date) {
    setFocusDate(date)
    if (view === "month") {
      setView("day")
    }
  }

  function handlePrevious() {
    if (view === "month") {
      setFocusDate((current) => addMonths(current, -1))
      return
    }
    if (view === "week") {
      setFocusDate((current) => addDays(current, -7))
      return
    }
    setFocusDate((current) => addDays(current, -1))
  }

  function handleNext() {
    if (view === "month") {
      setFocusDate((current) => addMonths(current, 1))
      return
    }
    if (view === "week") {
      setFocusDate((current) => addDays(current, 7))
      return
    }
    setFocusDate((current) => addDays(current, 1))
  }

  function handleToday() {
    setFocusDate(new Date())
  }

  useEffect(() => {
    if (!detailOpen) {
      const timeout = window.setTimeout(() => setSelectedId(null), 220)
      return () => window.clearTimeout(timeout)
    }
    return undefined
  }, [detailOpen])

  if (isStatusLoading) {
    return <CalendarPageSkeleton />
  }

  if (!isCalendarConnected) {
    return (
      <div className="flex h-[calc(100vh-var(--header-height))] flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl border border-border/60 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-7 text-muted-foreground" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight">Connect Google Calendar</h1>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Link your calendar on the integrations page to view and manage events here.
          </p>
        </div>
        <Button
          render={<Link href="/dashboard/integrations" />}
          className="rounded-full bg-foreground px-5 text-background hover:bg-foreground/90"
        >
          Go to integrations
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-var(--header-height))] min-h-0 flex-col">
      <CalendarToolbar
        title={title}
        view={view}
        search={search}
        isSearching={isSearching}
        isLoading={isLoading}
        isSyncing={syncEvents.isPending}
        reducedMotion={reducedMotion}
        onViewChange={setView}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
        onSync={handleSync}
        onCreate={handleCreate}
      />

      {showReconnect ? (
        <div className="border-b border-border/60 px-4 py-3 md:px-6">
          <IntegrationReconnectBanner message="Reconnect Google Calendar on the integrations page to continue." />
        </div>
      ) : null}

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {isLoading ? (
          <CalendarGridSkeleton view={view} />
        ) : visibleEvents.length === 0 && !isSearching ? (
          <CalendarEmptyState onCreate={handleCreate} onSync={handleSync} />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              variants={viewVariants}
              initial={reducedMotion ? false : "initial"}
              animate="animate"
              exit={reducedMotion ? undefined : "exit"}
              transition={calendarTransition(reducedMotion, calendarDuration.view)}
              className="h-full"
            >
              {view === "month" ? (
                <CalendarMonthView
                  focusDate={focusDate}
                  events={visibleEvents}
                  reducedMotion={reducedMotion}
                  onSelectDay={handleSelectDay}
                  onSelectEvent={handleSelectEvent}
                />
              ) : null}
              {view === "week" ? (
                <CalendarWeekView
                  focusDate={focusDate}
                  events={visibleEvents}
                  reducedMotion={reducedMotion}
                  onSelectDay={setFocusDate}
                  onSelectEvent={handleSelectEvent}
                />
              ) : null}
              {view === "day" ? (
                <CalendarDayView
                  focusDate={focusDate}
                  events={visibleEvents}
                  reducedMotion={reducedMotion}
                  onSelectEvent={handleSelectEvent}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <CalendarEventDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        event={selectedEvent}
        isLoading={isDetailLoading}
        onEdit={handleEdit}
      />

      <EventSheet open={sheetOpen} onOpenChange={setSheetOpen} event={editingEvent} />
    </div>
  )
}

function CalendarEmptyState({
  onCreate,
  onSync,
}: {
  onCreate: () => void
  onSync: () => void
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-border/60 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-7 text-muted-foreground/80" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">No events on your calendar</p>
        <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
          Sync from Google Calendar or add your first event to get started.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onSync} className="rounded-full">
          Sync calendar
        </Button>
        <Button size="sm" onClick={onCreate} className="rounded-full bg-foreground text-background hover:bg-foreground/90">
          Add event
        </Button>
      </div>
    </div>
  )
}

function CalendarPageSkeleton() {
  return (
    <div className="flex h-[calc(100vh-var(--header-height))] flex-col">
      <div className="space-y-3 border-b border-border/60 px-6 py-5">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-full max-w-sm rounded-full" />
      </div>
      <CalendarGridSkeleton view="month" />
    </div>
  )
}

function CalendarGridSkeleton({ view }: { view: CalendarView }) {
  if (view === "month") {
    return (
      <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-7 gap-2 overflow-hidden bg-[#F7F7F6] p-3 dark:bg-muted/10 md:gap-2.5 md:p-5">
        {Array.from({ length: 35 }).map((_, index) => (
          <Skeleton key={index} className="min-h-[5.5rem] rounded-2xl bg-card md:min-h-[6.75rem]" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 bg-[#F7F7F6] p-6 dark:bg-muted/10">
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-16 rounded-2xl bg-card" />
        ))}
      </div>
      <Skeleton className="min-h-0 flex-1 rounded-2xl bg-card" />
    </div>
  )
}
