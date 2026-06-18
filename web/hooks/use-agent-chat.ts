"use client"

import { useCallback, useRef, useState } from "react"
import { AGENT_UI } from "@/lib/agent-config"
import { getApiBaseUrl } from "@/lib/backend-url"

// ─── Types ────────────────────────────────────────────────────────────────────

export type MessageRole = "user" | "assistant"

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAgentChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const appendToLastAssistant = useCallback((chunk: string) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1]
      if (!last || last.role !== "assistant") return prev
      return [
        ...prev.slice(0, -1),
        { ...last, content: last.content + chunk },
      ]
    })
  }, [])

  const send = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return

      setError(null)

      // Append user message
      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      }

      // Start empty AI message for streaming
      const aiMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
      }

      setMessages((prev) => {
        const history = [...prev, userMsg, aiMsg].slice(-(AGENT_UI.MAX_MESSAGES))
        return history
      })
      setIsStreaming(true)

      // Build history for request — only send user/assistant pairs, exclude empty AI stub
      const historyForRequest = [...messages, userMsg]
        .filter((m) => m.content.trim().length > 0)
        .map((m) => ({ role: m.role, content: m.content }))
        .slice(-20) // backend cap

      try {
        const backendUrl = getApiBaseUrl()
        abortControllerRef.current = new AbortController()

        const res = await fetch(`${backendUrl}${AGENT_UI.CHAT_ENDPOINT}`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: historyForRequest }),
          signal: abortControllerRef.current.signal,
        })

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          const msg =
            body?.message ??
            (res.status === 429
              ? "Daily AI usage limit reached. Resets at midnight."
              : res.status === 403
                ? "AI assistant is temporarily unavailable."
                : res.status === 401
                  ? "Session expired. Please log in again."
                  : "Something went wrong. Please try again.")
          setError(msg)
          setMessages((prev) => prev.filter((m) => m.id !== aiMsg.id))
          return
        }

        // Read stream
        const reader = res.body?.getReader()
        if (!reader) throw new Error("No readable stream")

        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          appendToLastAssistant(chunk)
        }
      } catch (err: unknown) {
        if ((err as { name?: string }).name === "AbortError") return
        setError("Connection lost. Please try again.")
        setMessages((prev) => prev.filter((m) => m.id !== aiMsg.id))
      } finally {
        setIsStreaming(false)
        abortControllerRef.current = null
      }
    },
    [messages, isStreaming, appendToLastAssistant],
  )

  const clearChat = useCallback(() => {
    abortControllerRef.current?.abort()
    setMessages([])
    setError(null)
    setIsStreaming(false)
  }, [])

  return {
    messages,
    isStreaming,
    error,
    send,
    clearChat,
  }
}
