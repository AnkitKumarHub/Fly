"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Mail01Icon, Calendar03Icon, CheckmarkCircle01Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ToolCallPreview } from "@/hooks/use-agent-chat"

interface ChatConfirmCardProps {
  messageId: string
  proposal: ToolCallPreview
  /** undefined = pending, true = confirmed, false = cancelled */
  state?: boolean
  onConfirm: (messageId: string, proposal: ToolCallPreview) => Promise<void>
  onCancel: (messageId: string) => void
}

const TYPE_LABELS = {
  send_email: { label: "Send Email", icon: Mail01Icon, confirmLabel: "Send Email" },
  create_event: { label: "Create Event", icon: Calendar03Icon, confirmLabel: "Create Event" },
  update_event: { label: "Update Event", icon: Calendar03Icon, confirmLabel: "Update Event" },
}

export function ChatConfirmCard({
  messageId,
  proposal,
  state,
  onConfirm,
  onCancel,
}: ChatConfirmCardProps) {
  const [loading, setLoading] = useState(false)
  const meta = TYPE_LABELS[proposal.type]
  const preview = proposal.preview
  const isDone = state !== undefined

  async function handleConfirm() {
    setLoading(true)
    try {
      await onConfirm(messageId, proposal)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={cn(
        "mt-2 rounded-xl border bg-card overflow-hidden transition-all duration-200",
        isDone ? "border-border opacity-75" : "border-primary/30",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
        <HugeiconsIcon icon={meta.icon} strokeWidth={2} className="size-4 text-primary" />
        <span className="text-sm font-medium">{meta.label}</span>
        {state === true && (
          <span className="ml-auto flex items-center gap-1 text-xs text-green-500 dark:text-green-400">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} className="size-3.5" />
            Done
          </span>
        )}
        {state === false && (
          <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3.5" />
            Cancelled
          </span>
        )}
      </div>

      {/* Preview fields */}
      <div className="px-4 py-3 space-y-2 text-sm">
        {proposal.type === "send_email" && (
          <>
            <Row label="To" value={String(preview.to ?? "")} />
            <Row label="Subject" value={String(preview.subject ?? "")} />
            <Row label="Body" value={String(preview.bodyPreview ?? "").slice(0, 200) + (String(preview.bodyPreview ?? "").length > 200 ? "…" : "")} multiline />
          </>
        )}
        {(proposal.type === "create_event" || proposal.type === "update_event") && (
          <>
            {preview.title && <Row label="Title" value={String(preview.title)} />}
            {preview.startDateTime && <Row label="Start" value={formatDateTime(String(preview.startDateTime))} />}
            {preview.endDateTime && <Row label="End" value={formatDateTime(String(preview.endDateTime))} />}
            {Array.isArray(preview.attendees) && preview.attendees.length > 0 && (
              <Row label="Attendees" value={(preview.attendees as string[]).join(", ")} />
            )}
            {preview.description && <Row label="Notes" value={String(preview.description)} multiline />}
          </>
        )}
      </div>

      {/* Actions */}
      {!isDone && (
        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border bg-muted/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCancel(messageId)}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={loading}
            className="gap-1.5"
          >
            {loading ? (
              <span className="size-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} className="size-3.5" />
            )}
            {meta.confirmLabel}
          </Button>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className={cn("flex gap-2", multiline ? "flex-col" : "items-baseline")}>
      <span className="shrink-0 text-xs text-muted-foreground font-medium w-16">{label}</span>
      <span className={cn("text-foreground/90 text-xs", multiline ? "whitespace-pre-wrap" : "truncate")}>
        {value || "—"}
      </span>
    </div>
  )
}

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    })
  } catch {
    return iso
  }
}
