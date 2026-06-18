"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Mail01Icon,
  Calendar03Icon,
  PencilEdit01Icon,
  Add01Icon,
} from "@hugeicons/core-free-icons"
import { QUICK_PROMPTS } from "@/lib/agent-config"
import { cn } from "@/lib/utils"

const ICON_MAP = {
  mail: Mail01Icon,
  calendar: Calendar03Icon,
  compose: PencilEdit01Icon,
  event: Add01Icon,
}

interface ChatWelcomeProps {
  firstName: string
  onPromptClick: (prompt: string) => void
  disabled?: boolean
}

export function ChatWelcome({ firstName, onPromptClick, disabled }: ChatWelcomeProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Greeting */}
      <div className="text-center space-y-2 max-w-lg">
        <h1 className="text-3xl font-semibold tracking-tight">
          Hey, {firstName}{" "}
          <span
            className="inline-block animate-[wave_2s_ease-in-out_1]"
            style={{ transformOrigin: "70% 70%" }}
          >
            👋
          </span>
        </h1>
        <p className="text-muted-foreground text-base">
          How can I help you today?
        </p>
      </div>

      {/* Quick Prompt Grid */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
        {QUICK_PROMPTS.map((p) => {
          const Icon = ICON_MAP[p.icon]
          return (
            <button
              key={p.id}
              onClick={() => onPromptClick(p.prompt)}
              disabled={disabled}
              className={cn(
                "group flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4 text-left",
                "transition-all duration-200 hover:bg-card hover:border-primary/40 hover:shadow-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              <div className="shrink-0 mt-0.5 size-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <HugeiconsIcon icon={Icon} strokeWidth={2} className="size-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground leading-snug">{p.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Hint */}
      <p className="text-xs text-muted-foreground/60 text-center">
        You have {5} AI requests per day · connects to your Gmail &amp; Calendar
      </p>
    </div>
  )
}
