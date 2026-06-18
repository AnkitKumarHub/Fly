"use client"

import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { SparklesIcon } from "@hugeicons/core-free-icons"
import { chatDuration, chatTransition, welcomeIconVariants } from "./chat-motion"

interface ChatWelcomeProps {
  reducedMotion: boolean
}

export function ChatWelcome({ reducedMotion }: ChatWelcomeProps) {
  return (
    <motion.div
      initial={reducedMotion ? false : "initial"}
      animate="animate"
      variants={welcomeIconVariants}
      className="relative flex flex-col items-center gap-2.5 text-center"
    >
      <div className="flex size-10 items-center justify-center rounded-full border border-border/60 bg-card text-primary">
        <HugeiconsIcon icon={SparklesIcon} strokeWidth={1.75} className="size-[18px]" />
      </div>

      <h2 className="text-xl font-medium tracking-tight text-foreground">
        How can I help you today?
      </h2>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        Ask about your inbox, calendar, or let Fly draft and schedule for you.
      </p>
    </motion.div>
  )
}
