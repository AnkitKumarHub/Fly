"use client"

import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Mail01Icon,
  Calendar03Icon,
  PencilEdit01Icon,
  Add01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import { QUICK_PROMPTS, type QuickPromptAccent } from "@/lib/agent-config"
import { cn } from "@/lib/utils"
import {
  chatDuration,
  chatTransition,
  promptContainerVariants,
  promptItemVariants,
} from "./chat-motion"

const ICON_MAP = {
  mail: Mail01Icon,
  calendar: Calendar03Icon,
  compose: PencilEdit01Icon,
  event: Add01Icon,
}

const ACCENT_STYLES: Record<
  QuickPromptAccent,
  { icon: string; ring: string; hover: string }
> = {
  sky: {
    icon: "bg-sky-500/12 text-sky-600 dark:bg-sky-400/12 dark:text-sky-300/90",
    ring: "group-hover:ring-sky-500/20 dark:group-hover:ring-sky-400/25",
    hover: "group-hover:border-sky-500/25 dark:group-hover:border-sky-400/30",
  },
  sage: {
    icon: "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/12 dark:text-emerald-300/90",
    ring: "group-hover:ring-emerald-500/20 dark:group-hover:ring-emerald-400/25",
    hover: "group-hover:border-emerald-500/25 dark:group-hover:border-emerald-400/30",
  },
  amber: {
    icon: "bg-amber-500/12 text-amber-700 dark:bg-amber-400/12 dark:text-amber-300/90",
    ring: "group-hover:ring-amber-500/20 dark:group-hover:ring-amber-400/25",
    hover: "group-hover:border-amber-500/25 dark:group-hover:border-amber-400/30",
  },
  violet: {
    icon: "bg-violet-500/12 text-violet-700 dark:bg-violet-400/12 dark:text-violet-300/90",
    ring: "group-hover:ring-violet-500/20 dark:group-hover:ring-violet-400/25",
    hover: "group-hover:border-violet-500/25 dark:group-hover:border-violet-400/30",
  },
}

type ChatQuickPromptsProps = {
  onPromptClick: (prompt: string) => void
  disabled?: boolean
  reducedMotion: boolean
}

export function ChatQuickPrompts({
  onPromptClick,
  disabled,
  reducedMotion,
}: ChatQuickPromptsProps) {
  return (
    <div className="w-full max-w-2xl">
      <p className="mb-3 text-center text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">
        Try asking
      </p>

      <motion.div
        initial={reducedMotion ? false : "hidden"}
        animate="show"
        variants={promptContainerVariants}
        className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3"
      >
        {QUICK_PROMPTS.map((p) => {
          const Icon = ICON_MAP[p.icon]
          const accent = ACCENT_STYLES[p.accent]

          return (
            <motion.button
              key={p.id}
              type="button"
              variants={promptItemVariants}
              initial={reducedMotion ? false : "hidden"}
              animate="show"
              whileHover={reducedMotion ? undefined : { y: -3 }}
              whileTap={reducedMotion ? undefined : { scale: 0.98 }}
              transition={chatTransition(reducedMotion, chatDuration.normal)}
              onClick={() => onPromptClick(p.prompt)}
              disabled={disabled}
              className={cn(
                "group relative flex w-full flex-col gap-3 rounded-2xl border border-border/50 bg-card/40 p-4 text-left",
                "ring-1 ring-transparent transition-all duration-200",
                "hover:bg-card/70 hover:shadow-sm",
                accent.hover,
                accent.ring,
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                "disabled:pointer-events-none disabled:opacity-50",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
                    accent.icon,
                  )}
                >
                  <HugeiconsIcon icon={Icon} strokeWidth={2} className="size-4" />
                </div>

                <span
                  className={cn(
                    "mt-1 flex size-6 items-center justify-center rounded-full",
                    "text-muted-foreground/30 transition-all duration-200",
                    "group-hover:translate-x-0.5 group-hover:text-muted-foreground/70",
                  )}
                >
                  <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-3.5" />
                </span>
              </div>

              <div className="space-y-0.5">
                <p className="text-[13px] font-medium leading-snug text-foreground/90">
                  {p.label}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground/75">{p.hint}</p>
              </div>
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}
