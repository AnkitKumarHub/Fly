"use client"

import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { SparklesIcon } from "@hugeicons/core-free-icons"
import { ChatQuickPrompts } from "./chat-quick-prompts"
import { chatDuration, welcomeIconVariants } from "./chat-motion"

interface ChatWelcomeProps {
  onPromptClick: (prompt: string) => void
  disabled?: boolean
  reducedMotion: boolean
}

export function ChatWelcome({ onPromptClick, disabled, reducedMotion }: ChatWelcomeProps) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-5 py-10 md:px-8 md:py-12">
      {/* Ambient wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_30%,var(--chat-glow)_0%,transparent_70%)]"
      />

      <motion.div
        initial={reducedMotion ? false : "initial"}
        animate="animate"
        variants={welcomeIconVariants}
        className="relative mb-8 flex flex-col items-center gap-3"
      >
        <motion.div
          animate={
            reducedMotion
              ? undefined
              : { opacity: [0.5, 0.85, 0.5], scale: [1, 1.03, 1] }
          }
          transition={
            reducedMotion
              ? undefined
              : { duration: chatDuration.breathe, repeat: Infinity, ease: "easeInOut" }
          }
          className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary/70 ring-1 ring-primary/15"
        >
          <HugeiconsIcon icon={SparklesIcon} strokeWidth={1.75} className="size-6" />
        </motion.div>

        <h2 className="text-lg font-medium tracking-tight text-foreground/90">
          How can I help you today?
        </h2>
        <p className="max-w-sm text-center text-sm text-muted-foreground/80">
          Ask about your inbox, calendar, or let Fly draft and schedule for you.
        </p>
      </motion.div>

      <div className="relative w-full flex justify-center">
        <ChatQuickPrompts
          onPromptClick={onPromptClick}
          disabled={disabled}
          reducedMotion={reducedMotion}
        />
      </div>
    </div>
  )
}
