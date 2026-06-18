"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUp01Icon, VoiceIcon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { AGENT_UI } from "@/lib/agent-config"
import { chatTransition, sendButtonTap } from "./chat-motion"

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  isStreaming?: boolean
  reducedMotion?: boolean
}

export function ChatInput({
  onSend,
  disabled,
  isStreaming,
  reducedMotion = false,
}: ChatInputProps) {
  const [value, setValue] = useState("")
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [value])

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || disabled || isStreaming) return
    onSend(trimmed)
    setValue("")
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
    <div className="shrink-0 border-t border-border/40 bg-muted/20 px-4 py-3 md:px-5 md:py-4">
      <div
        className={cn(
          "flex items-end gap-2 rounded-2xl border bg-background px-3 py-2.5 transition-all duration-200 md:px-4",
          focused
            ? "border-border shadow-[0_0_0_3px_rgba(0,0,0,0.03)]"
            : "border-border/60",
          (disabled || isStreaming) && "opacity-60",
        )}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value.slice(0, AGENT_UI.MAX_MESSAGE_LENGTH))}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled || isStreaming}
          placeholder={isStreaming ? "Fly is responding…" : "Ask Fly…"}
          className={cn(
            "flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50",
            "border-none outline-none focus:ring-0 leading-relaxed py-1",
            "disabled:cursor-not-allowed",
          )}
          style={{ minHeight: "24px", maxHeight: "120px" }}
        />

        <div className="flex shrink-0 items-center gap-1.5 pb-0.5">
          {nearLimit ? (
            <span
              className={cn(
                "text-[10px] tabular-nums",
                charsLeft < 50 ? "text-destructive/80" : "text-muted-foreground/50",
              )}
            >
              {charsLeft}
            </span>
          ) : null}

          <button
            type="button"
            disabled
            title="Voice input coming soon"
            aria-label="Voice input coming soon"
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground/40 transition-colors"
          >
            <HugeiconsIcon icon={VoiceIcon} strokeWidth={2} className="size-4" />
          </button>

          <motion.button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send message"
            whileTap={reducedMotion || !canSend ? undefined : sendButtonTap}
            transition={chatTransition(reducedMotion, 0.12)}
            className={cn(
              "flex size-8 items-center justify-center rounded-full transition-colors duration-200",
              canSend
                ? "bg-muted-foreground/15 text-foreground/80 hover:bg-muted-foreground/25"
                : "bg-muted/60 text-muted-foreground/40 cursor-not-allowed",
            )}
          >
            {isStreaming ? (
              <span className="size-3.5 animate-spin rounded-full border-2 border-current/25 border-t-current" />
            ) : (
              <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2.5} className="size-4" />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
