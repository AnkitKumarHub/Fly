"use client"

import { useReducedMotion } from "motion/react"
import { useAgentChat } from "@/hooks/use-agent-chat"
import { ChatWelcome } from "@/components/chat/chat-welcome"
import { ChatMessageList } from "@/components/chat/chat-message-list"
import { ChatInput } from "@/components/chat/chat-input"
import { ChatHeader } from "@/components/chat/chat-header"

export default function ChatPage() {
  const reducedMotion = useReducedMotion() ?? false
  const { messages, isStreaming, error, send, clearChat } = useAgentChat()

  const hasMessages = messages.length > 0

  return (
    <div className="flex h-[calc(100vh-var(--header-height))] min-h-0 flex-col overflow-hidden bg-muted/20">
      <ChatHeader
        hasMessages={hasMessages}
        isStreaming={isStreaming}
        error={error}
        onClear={clearChat}
      />

      <div className="flex min-h-0 flex-1 flex-col">
        {!hasMessages ? (
          <div className="flex flex-1 flex-col items-center justify-center p-4 md:p-6">
            <div className="flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
              <ChatWelcome
                onPromptClick={send}
                disabled={isStreaming}
                reducedMotion={reducedMotion}
              />
              <ChatInput
                onSend={send}
                disabled={false}
                isStreaming={isStreaming}
                reducedMotion={reducedMotion}
                variant="panel"
              />
            </div>
          </div>
        ) : (
          <>
            <ChatMessageList
              messages={messages}
              isStreaming={isStreaming}
              reducedMotion={reducedMotion}
            />
            <ChatInput
              onSend={send}
              disabled={false}
              isStreaming={isStreaming}
              reducedMotion={reducedMotion}
            />
          </>
        )}
      </div>
    </div>
  )
}
