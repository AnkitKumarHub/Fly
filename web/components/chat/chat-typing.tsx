"use client"

import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { SparklesIcon } from "@hugeicons/core-free-icons"
import { chatDuration } from "./chat-motion"

type ChatTypingProps = {
  reducedMotion?: boolean
}

export function ChatTyping({ reducedMotion = false }: ChatTypingProps) {
  return (
    <div className="flex items-center gap-2.5 py-1">
      <motion.div
        animate={
          reducedMotion
            ? undefined
            : { opacity: [0.4, 0.85, 0.4], scale: [0.96, 1, 0.96] }
        }
        transition={
          reducedMotion
            ? undefined
            : { duration: chatDuration.breathe, repeat: Infinity, ease: "easeInOut" }
        }
        className="text-muted-foreground/50"
      >
        <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="size-3.5" />
      </motion.div>
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={reducedMotion ? undefined : { opacity: [0.3, 0.7, 0.3], y: [0, -2, 0] }}
            transition={
              reducedMotion
                ? undefined
                : { duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }
            }
            className="size-1 rounded-full bg-muted-foreground/40"
          />
        ))}
      </div>
    </div>
  )
}
