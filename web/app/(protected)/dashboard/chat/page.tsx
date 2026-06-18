"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon, AlertCircleIcon } from "@hugeicons/core-free-icons"
import { useMe } from "@/hooks/use-me"
import { useAgentChat } from "@/hooks/use-agent-chat"
import { ChatWelcome } from "@/components/chat/chat-welcome"
import { ChatMessageList } from "@/components/chat/chat-message-list"
import { ChatInput } from "@/components/chat/chat-input"

export default function ChatPage() {
  const { data: me } = useMe()
  const {
    messages,
    isStreaming,
    error,
    send,
    clearChat,
  } = useAgentChat()

  const hasMessages = messages.length > 0
  const firstName = me?.firstName ?? "there"

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Page header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <div>
          <h1 className="text-base font-semibold text-foreground">Fly</h1>
          <p className="text-xs text-muted-foreground">
            Your AI assistant for Gmail &amp; Calendar
          </p>
        </div>

        {hasMessages && (
          <button
            onClick={clearChat}
            disabled={isStreaming}
            title="Clear chat"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 px-2 py-1 rounded-lg hover:bg-muted"
          >
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-destructive/10 border-b border-destructive/20 text-sm text-destructive shrink-0">
          <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Chat body */}
      <div className="flex flex-col flex-1 min-h-0">
        {!hasMessages ? (
          <ChatWelcome
            firstName={firstName}
            onPromptClick={send}
            disabled={isStreaming}
          />
        ) : (
          <ChatMessageList
            messages={messages}
            isStreaming={isStreaming}
          />
        )}

        {/* Input — always at bottom */}
        <ChatInput
          onSend={send}
          disabled={false}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  )
}
