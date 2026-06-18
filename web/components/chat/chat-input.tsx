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
  variant?: "default" | "hero"
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
  const isHero = variant === "hero"

  return (
    <div
      className={cn(
        "shrink-0",
        isHero ? "w-full" : "px-5 pb-5 pt-2 md:px-8 md:pb-6",
      )}
    >
      <div className={cn("mx-auto w-full", isHero ? "max-w-2xl" : "max-w-2xl")}>
        <div
          className={cn(
            "flex items-end gap-2 border bg-card transition-colors duration-150",
            isHero ? "rounded-full px-5 py-3.5 shadow-sm" : "rounded-2xl px-4 py-3",
            !isHero && "bg-card/60 backdrop-blur-sm",
            focused ? "border-primary/40 ring-2 ring-primary/10" : "border-border/60",
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
              "border-none outline-none focus:ring-0 leading-relaxed",
              isHero ? "py-0.5" : "py-0.5",
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
                "flex items-center justify-center transition-colors duration-150",
                isHero ? "size-9 rounded-full" : "size-8 rounded-lg",
                canSend
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground/50 cursor-not-allowed",
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

        {!isHero ? (
          <p className="mt-2 text-center text-[11px] text-muted-foreground/60">
            Enter to send · Shift+Enter for new line
          </p>
        ) : (
          <p className="mt-2.5 text-center text-[11px] text-muted-foreground/50">
            Enter to send · Shift+Enter for new line
          </p>
        )}
      </div>
    </div>
  )
}
