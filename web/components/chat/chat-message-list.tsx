"use client"

import { useEffect, useRef } from "react"
import { ChatMessageBubble } from "./chat-message"
import type { ChatMessage } from "@/hooks/use-agent-chat"

interface ChatMessageListProps {
  messages: ChatMessage[]
  isStreaming: boolean
}

export function ChatMessageList({
  messages,
  isStreaming,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom whenever messages update or streaming produces new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isStreaming])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {messages.map((msg, i) => {
        const isLastAssistant =
          msg.role === "assistant" && i === messages.length - 1

        return (
          <ChatMessageBubble
            key={msg.id}
            message={msg}
            isLastAssistant={isLastAssistant}
            isStreaming={isStreaming}
          />
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
