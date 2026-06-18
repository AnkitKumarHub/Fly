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
  variant?: "default" | "panel"
}

export function ChatInput({
  onSend,
  disabled,
  isStreaming,
  reducedMotion = false,
  variant = "default",
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
  const isPanel = variant === "panel"

  return (
    <div
      className={cn(
        "shrink-0",
        isPanel ? "border-t border-border/50 px-6 py-4 md:px-8" : "px-5 pb-5 pt-2 md:px-8 md:pb-6",
      )}
    >
      <div className={cn("mx-auto w-full", isPanel ? "max-w-xl" : "max-w-2xl")}>
        <div
          className={cn(
            "flex items-end gap-2 rounded-xl border px-3 py-2.5 transition-colors duration-150",
            isPanel ? "bg-muted/25" : "bg-card/60 backdrop-blur-sm",
            focused ? "border-border ring-1 ring-ring/20" : "border-border/60",
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
              "flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground",
              "border-none outline-none focus:ring-0 leading-relaxed py-1",
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
                "flex size-8 items-center justify-center rounded-lg transition-colors duration-150",
                canSend
                  ? "bg-foreground text-background hover:bg-foreground/90"
                  : "bg-muted text-muted-foreground/50 cursor-not-allowed",
              )}
            >
              {isStreaming ? (
                <span className="size-3.5 animate-spin rounded-full border-2 border-current/25 border-t-current" />
              ) : (
                <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2.5} className="size-3.5" />
              )}
            </motion.button>
          </div>
        </div>

        {!isPanel ? (
          <p className="mt-2 text-center text-[11px] text-muted-foreground/60">
            Enter to send · Shift+Enter for new line
          </p>
        ) : null}
      </div>
    </div>
  )
}
