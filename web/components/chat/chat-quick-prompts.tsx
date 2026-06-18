"use client"

import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Mail01Icon,
  Calendar03Icon,
  PencilEdit01Icon,
  Add01Icon,
} from "@hugeicons/core-free-icons"
import { QUICK_PROMPTS } from "@/lib/agent-config"
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
    <motion.div
      initial={reducedMotion ? false : "hidden"}
      animate="show"
      variants={promptContainerVariants}
      className="grid grid-cols-1 gap-2 sm:grid-cols-2"
    >
      {QUICK_PROMPTS.map((p) => {
        const Icon = ICON_MAP[p.icon]

        return (
          <motion.button
            key={p.id}
            type="button"
            variants={promptItemVariants}
            initial={reducedMotion ? false : "hidden"}
            animate="show"
            whileHover={reducedMotion ? undefined : { y: -1 }}
            whileTap={reducedMotion ? undefined : { scale: 0.99 }}
            transition={chatTransition(reducedMotion, chatDuration.fast)}
            onClick={() => onPromptClick(p.prompt)}
            disabled={disabled}
            className={cn(
              "group flex items-center gap-3 rounded-xl border border-border/60 bg-background px-4 py-3.5 text-left",
              "transition-colors duration-150 hover:border-border hover:bg-muted/30",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
              "disabled:pointer-events-none disabled:opacity-50",
            )}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground transition-colors group-hover:bg-muted group-hover:text-foreground">
              <HugeiconsIcon icon={Icon} strokeWidth={2} className="size-4" />
            </span>
            <span className="min-w-0 text-sm leading-snug text-foreground/90">{p.label}</span>
          </motion.button>
        )
      })}
    </motion.div>
  )
}
