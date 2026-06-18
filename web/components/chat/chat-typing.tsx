"use client"

import { motion } from "motion/react"

type ChatTypingProps = {
  reducedMotion?: boolean
}

export function ChatTyping({ reducedMotion = false }: ChatTypingProps) {
  return (
    <div className="flex items-center gap-1 py-1">
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
  )
}
