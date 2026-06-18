"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiChat02Icon,
  Calendar03Icon,
  CommandIcon,
  Mail01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { useCommandPalette } from "@/hooks/use-command-palette"
import type {
  CommandPreview,
  CommandResult,
  MissingField,
  NavigationTarget,
} from "@/lib/command-types"
import { cn } from "@/lib/utils"

type CommandPaletteContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  openPalette: () => void
  closePalette: () => void
}

const CommandPaletteContext = React.createContext<CommandPaletteContextValue | null>(null)

const QUICK_ACTIONS = [
  {
    id: "search",
    label: "Search invoices from last month",
    description: "Run an inbox search immediately",
    prompt: "Show invoices from last month",
    icon: Mail01Icon,
  },
  {
    id: "draft",
    label: "Draft a follow-up email",
    description: "Prepare a Gmail draft from one sentence",
    prompt: "Draft an email to rahul@example.com saying I can meet at 4 PM tomorrow",
    icon: Mail01Icon,
  },
  {
    id: "event",
    label: "Create a calendar event",
    description: "Schedule a meeting with natural language",
    prompt: "Create a meeting called Product sync tomorrow at 4 PM for 30 minutes",
    icon: Calendar03Icon,
  },
  {
    id: "combined",
    label: "Create event and email",
    description: "Book the event and send the follow-up note",
    prompt:
      "Create a meeting with friend@corsair.dev next Thursday at 9 AM for 30 minutes and send an email saying I look forward to it",
    icon: AiChat02Icon,
  },
] as const

function shouldIgnoreShortcutTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false

  const tagName = target.tagName
  return (
    target.isContentEditable ||
    tagName === "INPUT" ||
    tagName === "TEXTAREA" ||
    tagName === "SELECT" ||
    target.getAttribute("role") === "textbox"
  )
}

function formatDateTime(value: string) {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  return parsed.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

function missingFieldSummary(fields: MissingField[]) {
  return fields.map((field) => field.label).join(" · ")
}

function renderPreview(preview: CommandPreview) {
  if (preview.kind === "email") {
    return (
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Email Preview</p>
        <div className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">To:</span> {preview.to}
          </p>
          <p>
            <span className="text-muted-foreground">Subject:</span>{" "}
            {preview.subject || "No subject"}
          </p>
          <p className="line-clamp-4 whitespace-pre-wrap text-muted-foreground">{preview.body}</p>
        </div>
      </div>
    )
  }

  if (preview.kind === "event") {
    return (
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Event Preview</p>
        <div className="space-y-1 text-sm">
          <p className="font-medium">{preview.title}</p>
          <p className="text-muted-foreground">
            {formatDateTime(preview.startDateTime)} to {formatDateTime(preview.endDateTime)}
          </p>
          {preview.attendees.length > 0 ? (
            <p className="text-muted-foreground">Attendees: {preview.attendees.join(", ")}</p>
          ) : null}
          {preview.description ? (
            <p className="line-clamp-4 whitespace-pre-wrap text-muted-foreground">
              {preview.description}
            </p>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {renderPreview(preview.event)}
      <div className="h-px bg-border/60" />
      {renderPreview({
        kind: "email",
        action: "send_email",
        to: preview.email.to,
        subject: preview.email.subject,
        body: preview.email.body,
      })}
    </div>
  )
}

function renderResult(result: CommandResult) {
  switch (result.kind) {
    case "search_emails":
      return (
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Search Results</p>
            <p className="text-sm text-muted-foreground">
              Query: <span className="text-foreground">{result.query}</span>
            </p>
          </div>
          <div className="space-y-2">
            {result.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No matching emails found.</p>
            ) : (
              result.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border/60 bg-background/70 px-3 py-2.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium">{item.subject || "No subject"}</p>
                    {item.isUnread ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                        Unread
                      </span>
                    ) : null}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{item.from || "Unknown sender"}</p>
                  {item.snippet ? (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.snippet}</p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      )
    case "draft_email":
    case "send_email":
      return renderPreview({
        kind: "email",
        action: result.kind,
        to: result.to,
        subject: result.subject,
        body:
          result.kind === "draft_email"
            ? "The draft has been saved to Gmail."
            : "The email has been sent successfully.",
      })
    case "create_event":
      return renderPreview({
        kind: "event",
        title: result.title,
        startDateTime: result.startDateTime,
        endDateTime: result.endDateTime,
        attendees: [],
      })
    case "create_event_and_send_email":
      return (
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Combined Result</p>
            <p className="text-sm font-medium">{result.title}</p>
            <p className="text-xs text-muted-foreground">Email recipient: {result.to}</p>
          </div>
          {result.partialFailure ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
              {result.partialFailure.message}
            </div>
          ) : (
            <div className="rounded-2xl border border-border/60 bg-background/70 px-3 py-2.5 text-sm text-muted-foreground">
              Event created and email sent with subject “{result.subject}”.
            </div>
          )}
        </div>
      )
  }
}

function ResultActions({
  target,
  onOpenTarget,
  onClose,
  label = "Open result",
}: {
  target?: NavigationTarget
  onOpenTarget: (target?: NavigationTarget) => void
  onClose: () => void
  label?: string
}) {
  if (!target) return null

  return (
    <Button
      size="sm"
      onClick={() => {
        onOpenTarget(target)
        onClose()
      }}
    >
      {label}
    </Button>
  )
}

function CommandPaletteDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [value, setValue] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const {
    status,
    response,
    error,
    resultTarget,
    redirectPath,
    isBusy,
    submit,
    confirm,
    reset,
    openTarget,
  } = useCommandPalette()

  const closeAndReset = React.useCallback(() => {
    onOpenChange(false)
    setValue("")
    reset()
  }, [onOpenChange, reset])

  React.useEffect(() => {
    if (!open) {
      setValue("")
      reset()
      return
    }

    const timer = window.setTimeout(() => {
      inputRef.current?.focus()
    }, 10)
    return () => window.clearTimeout(timer)
  }, [open, reset])

  const handleSubmit = React.useCallback(async () => {
    const trimmed = value.trim()
    if (!trimmed || isBusy) return

    const next = await submit(trimmed)
    if (next) {
      setValue("")
    }
  }, [isBusy, submit, value])

  const blockedMessage =
    response?.status === "blocked" ? response.message : error

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <DialogPrimitive.Popup className="fixed inset-x-4 top-[10vh] z-50 mx-auto w-full max-w-3xl overflow-hidden rounded-[28px] border border-border/60 bg-card shadow-2xl transition duration-200 ease-out data-ending-style:translate-y-4 data-ending-style:opacity-0 data-starting-style:translate-y-4 data-starting-style:opacity-0">
          <DialogPrimitive.Title className="sr-only">Command palette</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Run one-shot Gmail and Google Calendar commands.
          </DialogPrimitive.Description>

          <Command shouldFilter={false} className="max-h-[72vh]">
            <CommandInput
              ref={inputRef}
              value={value}
              onValueChange={setValue}
              placeholder={
                status === "needs_input"
                  ? "Add the missing detail…"
                  : "Send email, create event, or search mail…"
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault()
                  handleSubmit()
                }
              }}
            />

            <CommandList>
              {status === "idle" && value.trim().length === 0 ? (
                <>
                  <CommandGroup heading="Quick actions">
                    {QUICK_ACTIONS.map((action) => (
                      <CommandItem
                        key={action.id}
                        value={action.prompt}
                        onSelect={async () => {
                          setValue(action.prompt)
                          const next = await submit(action.prompt)
                          if (next) setValue("")
                        }}
                      >
                        <div className="flex size-10 items-center justify-center rounded-2xl bg-muted text-foreground">
                          <HugeiconsIcon icon={action.icon} strokeWidth={2} className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{action.label}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                        <CommandShortcut>Run</CommandShortcut>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup heading="Scope">
                    <div className="px-3 py-4 text-sm text-muted-foreground">
                      This palette is for one-shot Gmail and Calendar actions. Use Ask Fly for open-ended requests.
                    </div>
                  </CommandGroup>
                </>
              ) : null}

              {blockedMessage ? (
                <CommandGroup heading="Unavailable">
                  <div className="space-y-4 px-3 py-4">
                    <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                      {blockedMessage}
                    </div>
                    {redirectPath ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          openTarget({ path: redirectPath })
                          closeAndReset()
                        }}
                      >
                        Open Ask Fly
                      </Button>
                    ) : null}
                  </div>
                </CommandGroup>
              ) : null}

              {response?.status === "needs_input" ? (
                <CommandGroup heading={response.title}>
                  <div className="space-y-4 px-3 py-4">
                    <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
                      <p className="text-sm text-foreground">{response.message}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Missing: {missingFieldSummary(response.missingFields)}
                      </p>
                    </div>
                    {response.preview ? (
                      <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
                        {renderPreview(response.preview)}
                      </div>
                    ) : null}
                  </div>
                </CommandGroup>
              ) : null}

              {response?.status === "needs_confirmation" ? (
                <CommandGroup heading={response.title}>
                  <div className="space-y-4 px-3 py-4">
                    <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
                      <p className="mb-4 text-sm text-foreground">{response.message}</p>
                      {renderPreview(response.preview)}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        onClick={async () => {
                          const next = await confirm()
                          if (next) {
                            setValue("")
                          }
                        }}
                        disabled={isBusy}
                      >
                        {response.intent === "draft_email"
                          ? "Save draft"
                          : response.intent === "send_email"
                            ? "Send email"
                            : response.intent === "create_event"
                              ? "Create event"
                              : "Run both"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          inputRef.current?.focus()
                        }}
                      >
                        Revise command
                      </Button>
                    </div>
                  </div>
                </CommandGroup>
              ) : null}

              {response?.status === "result" ? (
                <CommandGroup heading={response.title}>
                  <div className="space-y-4 px-3 py-4">
                    <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">
                      <p className="mb-4 text-sm text-foreground">{response.message}</p>
                      {renderResult(response.result)}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <ResultActions
                        target={resultTarget}
                        onOpenTarget={openTarget}
                        onClose={closeAndReset}
                        label={response.result.kind === "search_emails" ? "Open in Mail" : "Open result"}
                      />
                      <Button size="sm" variant="outline" onClick={closeAndReset}>
                        Close
                      </Button>
                    </div>
                  </div>
                </CommandGroup>
              ) : null}

              {status === "resolving" ? (
                <CommandGroup heading="Working">
                  <div className="px-3 py-10 text-center text-sm text-muted-foreground">
                    Resolving command…
                  </div>
                </CommandGroup>
              ) : null}

              {status !== "idle" && !response && !blockedMessage && status !== "resolving" ? (
                <CommandEmpty>No command state available.</CommandEmpty>
              ) : null}
            </CommandList>

            <div className="flex items-center justify-between border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
              <span>Enter to run · Shift not needed</span>
              <span>Cmd/Ctrl+K</span>
            </div>
          </Command>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

export function CommandPaletteProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)

  const openPalette = React.useCallback(() => setOpen(true), [])
  const closePalette = React.useCallback(() => setOpen(false), [])

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") {
        return
      }

      if (shouldIgnoreShortcutTarget(event.target)) {
        return
      }

      event.preventDefault()
      setOpen((current) => !current)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const value = React.useMemo<CommandPaletteContextValue>(
    () => ({
      open,
      setOpen,
      openPalette,
      closePalette,
    }),
    [closePalette, open, openPalette],
  )

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
      <CommandPaletteDialog open={open} onOpenChange={setOpen} />
    </CommandPaletteContext.Provider>
  )
}

export function useCommandPaletteDialog() {
  const context = React.useContext(CommandPaletteContext)
  if (!context) {
    throw new Error("useCommandPaletteDialog must be used within CommandPaletteProvider.")
  }

  return context
}

export function CommandPaletteTrigger({
  className,
}: {
  className?: string
}) {
  const { openPalette } = useCommandPaletteDialog()

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={openPalette}
      className={cn("rounded-full px-3", className)}
    >
      <HugeiconsIcon icon={CommandIcon} strokeWidth={2} className="size-4" />
      Command
      <span className="hidden text-xs text-muted-foreground sm:inline">⌘/Ctrl+K</span>
    </Button>
  )
}
