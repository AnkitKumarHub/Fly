"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUp01Icon } from "@hugeicons/core-free-icons"
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
    <div className="shrink-0 px-5 pb-5 pt-2 md:px-8 md:pb-6">
      <div className="mx-auto w-full max-w-2xl">
        <div
          className={cn(
            "flex items-end gap-2 rounded-2xl border bg-card/60 px-4 py-3 backdrop-blur-sm transition-all duration-200",
            focused
              ? "border-primary/30 ring-2 ring-primary/10"
              : "border-border/50",
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
              "flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/55",
              "border-none outline-none focus:ring-0 leading-relaxed py-0.5",
              "disabled:cursor-not-allowed",
            )}
            style={{ minHeight: "24px", maxHeight: "120px" }}
          />

          <div className="flex shrink-0 items-center gap-2 pb-0.5">
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

            <motion.button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              aria-label="Send message"
              whileTap={reducedMotion || !canSend ? undefined : sendButtonTap}
              transition={chatTransition(reducedMotion, 0.12)}
              className={cn(
                "flex size-9 items-center justify-center rounded-xl transition-all duration-200",
                canSend
                  ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                  : "bg-muted/80 text-muted-foreground/45 cursor-not-allowed",
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

        <p className="mt-2 text-center text-[11px] text-muted-foreground/45">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
