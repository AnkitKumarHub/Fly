"use client"

import { useEffect, useRef } from "react"
import { ChatMessageBubble } from "./chat-message"
import type { ChatMessage } from "@/hooks/use-agent-chat"

interface ChatMessageListProps {
  messages: ChatMessage[]
  isStreaming: boolean
  reducedMotion?: boolean
}

export function ChatMessageList({
  messages,
  isStreaming,
  reducedMotion = false,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" })
  }, [messages, isStreaming, reducedMotion])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6">
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        {messages.map((msg, i) => {
          const isLastAssistant = msg.role === "assistant" && i === messages.length - 1

          return (
            <ChatMessageBubble
              key={msg.id}
              message={msg}
              isLastAssistant={isLastAssistant}
              isStreaming={isStreaming}
              reducedMotion={reducedMotion}
            />
          )
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
