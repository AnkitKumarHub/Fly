"use client"

import { useCallback, useRef, useState } from "react"
import { api } from "@/lib/api"
import { AGENT_UI } from "@/lib/agent-config"
import { getApiBaseUrl } from "@/lib/backend-url"

// ─── Types ────────────────────────────────────────────────────────────────────

export type MessageRole = "user" | "assistant"

export interface ToolCallPreview {
  type: "send_email" | "create_event" | "update_event"
  confirmationRequired: true
  preview: Record<string, unknown>
}

export interface ChatMessage {
  id: string
  role: MessageRole
  /** Plain text content */
  content: string
  /** If the AI called a read tool (list/search), the raw results are here */
  toolResults?: ToolResult[]
  /** If the AI proposed a write action, the proposal is here */
  proposal?: ToolCallPreview
  /** Proposal state — undefined = pending, true = confirmed, false = cancelled */
  proposalState?: boolean
  timestamp: Date
}

export interface ToolResult {
  toolName: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
}

type ApiError = {
  response?: { data?: { message?: string; error?: string } }
  message?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function parseStreamChunks(raw: string): { text: string; toolResults: ToolResult[]; proposal?: ToolCallPreview } {
  // AI SDK v6 text stream sends plain text chunks with optional embedded tool data.
  // Tool results are embedded as JSON lines prefixed with specific markers.
  // For now we treat the entire stream as plain text and detect JSON blocks.
  const toolResults: ToolResult[] = []
  let proposal: ToolCallPreview | undefined
  let text = raw

  // Try to detect JSON blocks (tool results / proposals) in the streamed text.
  // Pattern: lines starting with a known JSON structure
  const jsonBlockRegex = /```json\n([\s\S]*?)```/g
  let match: RegExpExecArray | null

  while ((match = jsonBlockRegex.exec(raw)) !== null) {
    try {
      const parsed = JSON.parse(match[1]!)
      if (parsed.confirmationRequired === true && parsed.type) {
        proposal = parsed as ToolCallPreview
        // Remove the block from displayed text
        text = text.replace(match[0], "").trim()
      } else if (Array.isArray(parsed)) {
        toolResults.push({ toolName: "results", data: parsed })
        text = text.replace(match[0], "").trim()
      }
    } catch {
      // Not valid JSON — leave as text
    }
  }

  return { text, toolResults, proposal }
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

  const finalizeLastAssistant = useCallback(() => {
    setMessages((prev) => {
      const last = prev[prev.length - 1]
      if (!last || last.role !== "assistant") return prev
      const { text, toolResults, proposal } = parseStreamChunks(last.content)
      return [
        ...prev.slice(0, -1),
        {
          ...last,
          content: text,
          toolResults: toolResults.length > 0 ? toolResults : undefined,
          proposal,
        },
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
        // Keep last MAX_MESSAGES messages + new ones, respecting history limit
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
        // Use native fetch for streaming — axios doesn't support ReadableStream well
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
          // Parse structured error from backend
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
          // Remove the empty AI stub
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

        // Parse any embedded JSON blocks from the complete response
        finalizeLastAssistant()
      } catch (err: unknown) {
        if ((err as { name?: string }).name === "AbortError") return
        const message = (err as ApiError)?.response?.data?.message ?? "Connection lost. Please try again."
        setError(message)
        setMessages((prev) => prev.filter((m) => m.id !== aiMsg.id))
      } finally {
        setIsStreaming(false)
        abortControllerRef.current = null
      }
    },
    [messages, isStreaming, appendToLastAssistant, finalizeLastAssistant],
  )

  /** Called when user clicks "Confirm" on a proposal card */
  const confirmAction = useCallback(
    async (messageId: string, proposal: ToolCallPreview) => {
      // Mark proposal as confirmed immediately (optimistic)
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, proposalState: true } : m)),
      )

      try {
        if (proposal.type === "send_email") {
          const p = proposal.preview as { to: string; subject: string; bodyFull: string }
          await api.post("/emails/send", { to: p.to, subject: p.subject, body: p.bodyFull })
        } else if (proposal.type === "create_event") {
          const p = proposal.preview as {
            title: string
            startDateTime: string
            endDateTime: string
            attendees?: string[]
            description?: string
          }
          await api.post("/events", {
            summary: p.title,
            start: { dateTime: p.startDateTime },
            end: { dateTime: p.endDateTime },
            attendees: p.attendees?.map((email) => ({ email })),
            description: p.description,
          })
        } else if (proposal.type === "update_event") {
          const p = proposal.preview as { eventId: string; title?: string; startDateTime?: string; endDateTime?: string; description?: string }
          await api.patch(`/events/${p.eventId}`, {
            summary: p.title,
            start: p.startDateTime ? { dateTime: p.startDateTime } : undefined,
            end: p.endDateTime ? { dateTime: p.endDateTime } : undefined,
            description: p.description,
          })
        }
      } catch {
        // Revert on failure
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, proposalState: undefined } : m)),
        )
        setError("Action failed. Please try again.")
      }
    },
    [],
  )

  /** Called when user clicks "Cancel" on a proposal card */
  const rejectAction = useCallback((messageId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, proposalState: false } : m)),
    )
  }, [])

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
    confirmAction,
    rejectAction,
    clearChat,
  }
}
