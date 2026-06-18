"use client"

import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { SparklesIcon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { ChatTyping } from "./chat-typing"
import type { ChatMessage } from "@/hooks/use-agent-chat"
import { chatTransition, messageVariants } from "./chat-motion"

interface ChatMessageProps {
  message: ChatMessage
  isLastAssistant?: boolean
  isStreaming?: boolean
  reducedMotion?: boolean
}

function formatTime(date: Date) {
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
}

export function ChatMessageBubble({
  message,
  isLastAssistant,
  isStreaming,
  reducedMotion = false,
}: ChatMessageProps) {
  const isUser = message.role === "user"
  const isEmpty = !message.content.trim()
  const showTyping = isLastAssistant && isStreaming && isEmpty

  return (
    <motion.div
      initial={reducedMotion ? false : "hidden"}
      animate="show"
      variants={messageVariants}
      transition={chatTransition(reducedMotion, 0.22)}
      className={cn("flex gap-2.5", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {!isUser ? (
        <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary/75 ring-1 ring-primary/15">
          <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="size-3.5" />
        </div>
      ) : null}

      <div className={cn("flex max-w-[min(80%,560px)] flex-col gap-1", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "rounded-tr-md bg-primary/90 text-primary-foreground"
              : "rounded-tl-md border border-border/40 bg-card/50 text-foreground/90",
          )}
        >
          {showTyping ? (
            <ChatTyping reducedMotion={reducedMotion} />
          ) : (
            <span className="whitespace-pre-wrap break-words">{message.content}</span>
          )}
        </div>

        <span className="px-1 text-[10px] text-muted-foreground/45">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </motion.div>
  )
}
