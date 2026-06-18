"use client"

import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { SparklesIcon } from "@hugeicons/core-free-icons"
import { ChatQuickPrompts } from "./chat-quick-prompts"
import { chatDuration, chatTransition, welcomeIconVariants } from "./chat-motion"

interface ChatWelcomeProps {
  onPromptClick: (prompt: string) => void
  disabled?: boolean
  reducedMotion: boolean
}

export function ChatWelcome({ onPromptClick, disabled, reducedMotion }: ChatWelcomeProps) {
  return (
    <div className="flex flex-1 flex-col px-6 pt-10 pb-4 md:px-10 md:pt-12">
      <motion.div
        initial={reducedMotion ? false : "initial"}
        animate="animate"
        variants={welcomeIconVariants}
        className="mb-8 flex flex-col items-center gap-2.5 text-center"
      >
        <div className="flex size-10 items-center justify-center rounded-full border border-border/70 bg-muted/40 text-muted-foreground">
          <HugeiconsIcon icon={SparklesIcon} strokeWidth={1.75} className="size-[18px]" />
        </div>

        <h2 className="text-base font-medium tracking-tight text-foreground">
          How can I help you today?
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          Ask about your inbox, calendar, or let Fly draft and schedule for you.
        </p>
      </motion.div>

      <div className="mx-auto w-full max-w-xl flex-1">
        <ChatQuickPrompts
          onPromptClick={onPromptClick}
          disabled={disabled}
          reducedMotion={reducedMotion}
        />
      </div>
    </div>
  )
}
