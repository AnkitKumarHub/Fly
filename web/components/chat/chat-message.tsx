"use client"

import { cn } from "@/lib/utils"
import { ChatTyping } from "./chat-typing"
import type { ChatMessage } from "@/hooks/use-agent-chat"

interface ChatMessageProps {
  message: ChatMessage
  isLastAssistant?: boolean
  isStreaming?: boolean
}

function formatTime(date: Date) {
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
}

export function ChatMessageBubble({
  message,
  isLastAssistant,
  isStreaming,
}: ChatMessageProps) {
  const isUser = message.role === "user"
  const isEmpty = !message.content.trim()
  const showTyping = isLastAssistant && isStreaming && isEmpty

  return (
    <div
      className={cn(
        "flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      {/* Avatar dot */}
      {!isUser && (
        <div className="shrink-0 mt-1 size-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
          <span className="text-[10px] font-semibold text-primary">AI</span>
        </div>
      )}

      <div className={cn("flex flex-col gap-1 max-w-[80%]", isUser && "items-end")}>
        {/* Bubble */}
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted/60 text-foreground rounded-tl-sm border border-border/50",
          )}
        >
          {showTyping ? (
            <ChatTyping />
          ) : (
            <span className="whitespace-pre-wrap break-words">{message.content}</span>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-muted-foreground/50 px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  )
}
