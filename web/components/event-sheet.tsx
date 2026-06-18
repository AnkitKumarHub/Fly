"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { isAxiosError } from "axios"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  useCreateEvent,
  useDeleteEvent,
  useUpdateEvent,
  type EventDetail,
} from "@/hooks/use-events"

interface EventSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: EventDetail | null
}

function toDatetimeLocalValue(dateTime?: { date?: string; dateTime?: string }) {
  if (!dateTime) return ""
  if (dateTime.date) return `${dateTime.date}T00:00`
  if (!dateTime.dateTime) return ""

  const parsed = new Date(dateTime.dateTime)
  if (Number.isNaN(parsed.getTime())) return ""

  const offset = parsed.getTimezoneOffset()
  const local = new Date(parsed.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

function fromDatetimeLocalValue(value: string) {
  if (!value) return undefined
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return undefined

  return {
    dateTime: parsed.toISOString(),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
}

function parseAttendees(raw: string) {
  const emails = raw
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean)

  return emails.length > 0 ? emails.map((email) => ({ email })) : undefined
}

function formatAttendees(attendees?: { email?: string }[]) {
  return attendees?.map((a) => a.email).filter(Boolean).join(", ") ?? ""
}

export function EventSheet({ open, onOpenChange, event }: EventSheetProps) {
  const isEdit = Boolean(event?.id)

  const [summary, setSummary] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [attendees, setAttendees] = useState("")

  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const deleteEvent = useDeleteEvent()

  useEffect(() => {
    if (!open) return

    if (event) {
      setSummary(event.summary ?? "")
      setDescription(event.description ?? "")
      setLocation(event.location ?? "")
      setStart(toDatetimeLocalValue(event.start))
      setEnd(toDatetimeLocalValue(event.end))
      setAttendees(formatAttendees(event.attendees))
    } else {
      setSummary("")
      setDescription("")
      setLocation("")
      setStart("")
      setEnd("")
      setAttendees("")
    }
  }, [open, event])

  function getError(error: unknown, fallback: string) {
    if (isAxiosError(error)) {
      return error.response?.data?.message ?? fallback
    }
    return fallback
  }

  function handleSubmit() {
    const startValue = fromDatetimeLocalValue(start)
    const endValue = fromDatetimeLocalValue(end)

    if (!summary.trim() || !startValue || !endValue) {
      toast.error("Title, start, and end are required")
      return
    }

    const payload = {
      event: {
        summary: summary.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        start: startValue,
        end: endValue,
        attendees: parseAttendees(attendees),
      },
      sendUpdates: "all" as const,
    }

    if (isEdit && event?.id) {
      updateEvent.mutate(
        { id: event.id, input: payload },
        {
          onSuccess: () => {
            toast.success("Event updated")
            onOpenChange(false)
          },
          onError: (error) => toast.error(getError(error, "Failed to update event")),
        },
      )
      return
    }

    createEvent.mutate(payload, {
      onSuccess: () => {
        toast.success("Event created")
        onOpenChange(false)
      },
      onError: (error) => toast.error(getError(error, "Failed to create event")),
    })
  }

  function handleDelete() {
    if (!event?.id) return

    deleteEvent.mutate(event.id, {
      onSuccess: () => {
        toast.success("Event deleted")
        onOpenChange(false)
      },
      onError: (error) => toast.error(getError(error, "Failed to delete event")),
    })
  }

  const isBusy = createEvent.isPending || updateEvent.isPending || deleteEvent.isPending

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit event" : "New event"}</SheetTitle>
          <SheetDescription>
            {isEdit ? "Update event details or delete the event." : "Create a calendar event."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="event-title">Title</Label>
            <Input
              id="event-title"
              placeholder="Meeting title"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="event-location">Location</Label>
            <Input
              id="event-location"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="event-start">Start</Label>
              <Input
                id="event-start"
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="event-end">End</Label>
              <Input
                id="event-end"
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="event-attendees">Attendees</Label>
            <Input
              id="event-attendees"
              placeholder="email1@example.com, email2@example.com"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="event-description">Description</Label>
            <Textarea
              id="event-description"
              placeholder="Event details..."
              className="min-h-24"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <SheetFooter className="flex-row justify-between gap-2">
          {isEdit ? (
            <Button variant="destructive" onClick={handleDelete} disabled={isBusy}>
              {deleteEvent.isPending ? "Deleting..." : "Delete"}
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isBusy}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isBusy || !summary.trim()}>
              {isBusy ? "Saving..." : isEdit ? "Save" : "Create"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
