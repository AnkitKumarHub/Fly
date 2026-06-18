"use client"

import { useReducedMotion } from "motion/react"
import { useAgentChat } from "@/hooks/use-agent-chat"
import { ChatWelcome } from "@/components/chat/chat-welcome"
import { ChatMessageList } from "@/components/chat/chat-message-list"
import { ChatInput } from "@/components/chat/chat-input"
import { ChatHeader } from "@/components/chat/chat-header"
import { ChatQuickPrompts } from "@/components/chat/chat-quick-prompts"

export default function ChatPage() {
  const reducedMotion = useReducedMotion() ?? false
  const { messages, isStreaming, error, send, clearChat } = useAgentChat()

  const hasMessages = messages.length > 0

  return (
    <div className="flex h-[calc(100vh-var(--header-height))] min-h-0 flex-col overflow-hidden bg-background">
      <ChatHeader
        hasMessages={hasMessages}
        isStreaming={isStreaming}
        error={error}
        onClear={clearChat}
      />

      <div className="flex min-h-0 flex-1 flex-col">
        {!hasMessages ? (
          <div className="chat-canvas relative flex flex-1 flex-col">
            <div className="flex flex-1 flex-col items-center justify-center px-5 py-8 md:px-8">
              <ChatWelcome reducedMotion={reducedMotion} />

              <div className="relative mt-8 w-full max-w-2xl space-y-3">
                <ChatInput
                  onSend={send}
                  disabled={false}
                  isStreaming={isStreaming}
                  reducedMotion={reducedMotion}
                  variant="hero"
                />
                <ChatQuickPrompts
                  onPromptClick={send}
                  disabled={isStreaming}
                  reducedMotion={reducedMotion}
                />
              </div>
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
