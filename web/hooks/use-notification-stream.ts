"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000"

export function useNotificationStream() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const source = new EventSource(`${backendUrl}/notifications/stream`, {
      withCredentials: true,
    })

    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as { type?: string }
        if (data.type === "init") return

        if (data.type === "email") {
          queryClient.invalidateQueries({ queryKey: ["emails"] })
        }

        if (data.type === "calendar") {
          queryClient.invalidateQueries({ queryKey: ["events"] })
        }
      } catch {
        // Ignore malformed SSE payloads
      }
    }

    return () => {
      source.close()
    }
  }, [queryClient])
}
