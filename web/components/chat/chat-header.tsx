"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon, AlertCircleIcon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

type ChatHeaderProps = {
  hasMessages: boolean
  isStreaming: boolean
  error: string | null
  onClear: () => void
}

export function ChatHeader({ hasMessages, isStreaming, error, onClear }: ChatHeaderProps) {
  return (
    <>
      {hasMessages ? (
        <div className="flex shrink-0 items-center justify-end px-5 py-2 md:px-8">
          <button
            type="button"
            onClick={onClear}
            disabled={isStreaming}
            title="Clear conversation"
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted-foreground",
              "transition-colors hover:bg-muted/50 hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
              "disabled:pointer-events-none disabled:opacity-40",
            )}
          >
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-3.5" />
            Clear chat
          </button>
        </div>
      ) : null}

      {error ? (
        <div className="flex shrink-0 items-center gap-2 border-b border-destructive/15 bg-destructive/5 px-5 py-2.5 text-sm text-destructive/90 md:px-8">
          <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}
    </>
  )
}
