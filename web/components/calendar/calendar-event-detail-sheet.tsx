"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { PencilEdit01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { EventDetail } from "@/hooks/use-events"
import { formatEventTimeLabel } from "@/components/calendar/calendar-utils"

type CalendarEventDetailSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: EventDetail | null
  isLoading: boolean
  onEdit: () => void
}

export function CalendarEventDetailSheet({
  open,
  onOpenChange,
  event,
  isLoading,
  onEdit,
}: CalendarEventDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        {isLoading ? (
          <div className="flex flex-col gap-3 pt-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="mt-4 h-24 w-full" />
          </div>
        ) : event ? (
          <>
            <SheetHeader className="border-b border-border/60 pb-4">
              <SheetTitle className="text-left text-xl leading-snug">
                {event.summary || "(no title)"}
              </SheetTitle>
              <SheetDescription className="text-left text-sm">
                {formatEventTimeLabel(event.start, event.end)}
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-5">
              {event.location ? (
                <div className="space-y-1">
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Location
                  </p>
                  <p className="text-sm text-foreground">{event.location}</p>
                </div>
              ) : null}

              {event.attendees && event.attendees.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Attendees
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {event.attendees.map((attendee, index) => (
                      <li key={attendee.email ?? index}>
                        {attendee.displayName
                          ? `${attendee.displayName} (${attendee.email})`
                          : attendee.email}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {event.description ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Notes
                  </p>
                  <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground/90">
                    {event.description}
                  </pre>
                </div>
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

            <div className="border-t border-border/60 p-4">
              <Button variant="outline" className="w-full rounded-xl" onClick={onEdit}>
                <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} className="size-4" />
                Edit event
              </Button>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
