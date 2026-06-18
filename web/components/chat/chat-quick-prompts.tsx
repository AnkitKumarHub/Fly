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
import { PROMPT_ACCENTS } from "@/components/chat/chat-tokens"
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
      className="no-scrollbar flex flex-wrap justify-center gap-2 overflow-x-auto px-1 pb-1"
    >
      {QUICK_PROMPTS.map((p) => {
        const Icon = ICON_MAP[p.icon]
        const accent = PROMPT_ACCENTS[p.accent]

        return (
          <motion.button
            key={p.id}
            type="button"
            variants={promptItemVariants}
            initial={reducedMotion ? false : "hidden"}
            animate="show"
            whileHover={reducedMotion ? undefined : { y: -1 }}
            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
            transition={chatTransition(reducedMotion, chatDuration.fast)}
            onClick={() => onPromptClick(p.prompt)}
            disabled={disabled}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium",
              "transition-shadow duration-150 hover:shadow-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
              "disabled:pointer-events-none disabled:opacity-50",
              accent.bg,
              accent.text,
              accent.border,
            )}
          >
            <HugeiconsIcon icon={Icon} strokeWidth={2} className="size-3.5 opacity-80" />
            <span>{p.label}</span>
          </motion.button>
        )
      })}
    </motion.div>
  )
}
