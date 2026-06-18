"use client"

import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  SparklesIcon,
  ArrowExpand01Icon,
  Minimize01Icon,
  Delete02Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { chatDuration, chatTransition } from "./chat-motion"

type ChatPanelProps = {
  expanded: boolean
  reducedMotion: boolean
  hasMessages: boolean
  isStreaming: boolean
  error: string | null
  onToggleExpand: () => void
  onClear: () => void
  children: React.ReactNode
}

export function ChatPanel({
  expanded,
  reducedMotion,
  hasMessages,
  isStreaming,
  error,
  onToggleExpand,
  onClear,
  children,
}: ChatPanelProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col transition-[padding] duration-300 ease-out",
        expanded ? "p-0" : "p-4 md:p-6",
      )}
    >
      <motion.div
        layout={!reducedMotion}
        transition={chatTransition(reducedMotion, chatDuration.normal)}
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden border border-border/50 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.03)]",
          expanded ? "rounded-none" : "rounded-2xl md:rounded-3xl",
        )}
      >
        {/* Panel header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/40 px-4 py-3 md:px-5">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/8 text-primary/80">
              <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="size-3.5" />
            </div>
            <span className="text-sm font-medium tracking-tight text-foreground/90">
              Fly AI
            </span>
          </div>

          <div className="flex items-center gap-1">
            {hasMessages ? (
              <button
                type="button"
                onClick={onClear}
                disabled={isStreaming}
                title="Clear conversation"
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground",
                  "transition-colors hover:bg-muted/60 hover:text-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                  "disabled:pointer-events-none disabled:opacity-40",
                )}
              >
                <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            ) : null}

            <button
              type="button"
              onClick={onToggleExpand}
              title={expanded ? "Exit expanded view" : "Expand"}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground",
                "transition-colors hover:bg-muted/60 hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
              )}
            >
              <HugeiconsIcon
                icon={expanded ? Minimize01Icon : ArrowExpand01Icon}
                strokeWidth={2}
                className="size-3.5"
              />
              <span className="hidden sm:inline">{expanded ? "Collapse" : "Expand"}</span>
            </button>
          </div>
        </div>

        {error ? (
          <div className="flex shrink-0 items-center gap-2 border-b border-destructive/15 bg-destructive/5 px-4 py-2.5 text-sm text-destructive/90 md:px-5">
            <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {children}
      </motion.div>
    </div>
  )
}
