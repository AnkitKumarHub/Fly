"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUp01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { AGENT_UI } from "@/lib/agent-config"

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  isStreaming?: boolean
}

export function ChatInput({ onSend, disabled, isStreaming }: ChatInputProps) {
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea up to 5 rows
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }, [value])

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled || isStreaming) return
    onSend(trimmed)
    setValue("")
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }, [value, disabled, isStreaming, onSend])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const canSend = value.trim().length > 0 && !disabled && !isStreaming
  const charsLeft = AGENT_UI.MAX_MESSAGE_LENGTH - value.length
  const nearLimit = charsLeft < 200

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-sm px-4 py-3">
      <div
        className={cn(
          "flex items-end gap-2 rounded-2xl border bg-card px-4 py-2.5 transition-all duration-200",
          "focus-within:border-primary/50 focus-within:shadow-sm focus-within:shadow-primary/10",
          disabled || isStreaming ? "opacity-60" : "border-border",
        )}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, AGENT_UI.MAX_MESSAGE_LENGTH))}
          onKeyDown={handleKeyDown}
          disabled={disabled || isStreaming}
          placeholder={isStreaming ? "Fly is responding…" : "Ask me anything about your emails & calendar…"}
          className={cn(
            "flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60",
            "outline-none border-none focus:ring-0 leading-relaxed py-0.5",
            "disabled:cursor-not-allowed",
          )}
          style={{ minHeight: "24px", maxHeight: "140px" }}
        />

        <div className="flex items-center gap-2 shrink-0 pb-0.5">
          {nearLimit && (
            <span className={cn("text-[10px] tabular-nums", charsLeft < 50 ? "text-destructive" : "text-muted-foreground/60")}>
              {charsLeft}
            </span>
          )}
          <button
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send message"
            className={cn(
              "size-8 rounded-xl flex items-center justify-center transition-all duration-200",
              canSend
                ? "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            )}
          >
            {isStreaming ? (
              <span className="size-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            ) : (
              <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2.5} className="size-4" />
            )}
          </button>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground/40 text-center mt-2">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  )
}
