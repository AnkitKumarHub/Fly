"use client"

import { useState } from "react"
import { useReducedMotion } from "motion/react"
import { useAgentChat } from "@/hooks/use-agent-chat"
import { ChatWelcome } from "@/components/chat/chat-welcome"
import { ChatMessageList } from "@/components/chat/chat-message-list"
import { ChatInput } from "@/components/chat/chat-input"
import { ChatPanel } from "@/components/chat/chat-panel"

export default function ChatPage() {
  const reducedMotion = useReducedMotion() ?? false
  const [expanded, setExpanded] = useState(false)
  const { messages, isStreaming, error, send, clearChat } = useAgentChat()

  const hasMessages = messages.length > 0

  return (
    <div className="flex h-[calc(100vh-var(--header-height))] min-h-0 flex-col overflow-hidden bg-muted/15">
      <ChatPanel
        expanded={expanded}
        reducedMotion={reducedMotion}
        hasMessages={hasMessages}
        isStreaming={isStreaming}
        error={error}
        onToggleExpand={() => setExpanded((v) => !v)}
        onClear={clearChat}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          {!hasMessages ? (
            <ChatWelcome
              onPromptClick={send}
              disabled={isStreaming}
              reducedMotion={reducedMotion}
            />
          ) : (
            <ChatMessageList
              messages={messages}
              isStreaming={isStreaming}
              reducedMotion={reducedMotion}
            />
          )}

          <ChatInput
            onSend={send}
            disabled={false}
            isStreaming={isStreaming}
            reducedMotion={reducedMotion}
          />
        </div>
      </ChatPanel>
    </div>
  )
}
