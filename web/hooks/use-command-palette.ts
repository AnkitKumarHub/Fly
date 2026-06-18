"use client"

import { useCallback, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"

import { api } from "@/lib/api"
import type {
  CommandConfirmResponse,
  CommandResolveResponse,
  CommandResult,
  NavigationTarget,
} from "@/lib/command-types"

export type CommandPaletteStatus =
  | "idle"
  | "resolving"
  | "needs_input"
  | "needs_confirmation"
  | "result"
  | "error"

function currentClientContext() {
  return {
    now: new Date().toISOString(),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  }
}

function buildHref(target: NavigationTarget) {
  const params = new URLSearchParams(target.query)
  const suffix = params.toString()
  return suffix ? `${target.path}?${suffix}` : target.path
}

export function useCommandPalette() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<CommandPaletteStatus>("idle")
  const [response, setResponse] = useState<CommandResolveResponse | CommandConfirmResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const invalidateForResult = useCallback(
    async (result: CommandResult) => {
      switch (result.kind) {
        case "search_emails":
          await queryClient.invalidateQueries({ queryKey: ["emails"] })
          return
        case "draft_email":
        case "send_email":
          await queryClient.invalidateQueries({ queryKey: ["emails"] })
          return
        case "create_event":
        case "create_event_and_send_email":
          await queryClient.invalidateQueries({ queryKey: ["events"] })
          if (result.kind === "create_event_and_send_email") {
            await queryClient.invalidateQueries({ queryKey: ["emails"] })
          }
      }
    },
    [queryClient],
  )

  const submit = useCallback(
    async (input: string) => {
      const trimmed = input.trim()
      if (!trimmed) return

      setStatus("resolving")
      setError(null)

      try {
        const continuationToken =
          response?.status === "needs_input" ? response.continuationToken : undefined

        const { data } = await api.post("/agent/command/resolve", {
          input: trimmed,
          ...(continuationToken ? { continuationToken } : {}),
          clientContext: currentClientContext(),
        })

        const next = data.data as CommandResolveResponse
        setResponse(next)

        if (next.status === "blocked") {
          setStatus("error")
          setError(next.message)
          return next
        }

        if (next.status === "needs_input") {
          setStatus("needs_input")
          return next
        }

        if (next.status === "needs_confirmation") {
          setStatus("needs_confirmation")
          return next
        }

        await invalidateForResult(next.result)
        setStatus("result")
        return next
      } catch (requestError: unknown) {
        const message =
          requestError instanceof Error ? requestError.message : "Failed to resolve the command."
        setResponse(null)
        setStatus("error")
        setError(message)
        return null
      }
    },
    [invalidateForResult, response],
  )

  const confirm = useCallback(async () => {
    if (response?.status !== "needs_confirmation") return null

    setStatus("resolving")
    setError(null)

    try {
      const { data } = await api.post("/agent/command/confirm", {
        confirmationToken: response.confirmationToken,
      })

      const next = data.data as CommandConfirmResponse
      setResponse(next)
      await invalidateForResult(next.result)
      setStatus("result")
      return next
    } catch (requestError: unknown) {
      const message =
        requestError instanceof Error ? requestError.message : "Failed to complete the command."
      setStatus("error")
      setError(message)
      return null
    }
  }, [invalidateForResult, response])

  const reset = useCallback(() => {
    setStatus("idle")
    setResponse(null)
    setError(null)
  }, [])

  const openTarget = useCallback(
    (target?: NavigationTarget) => {
      if (!target) return
      router.push(buildHref(target))
    },
    [router],
  )

  const resultTarget = useMemo(() => {
    if (response?.status !== "result") return undefined
    return response.result.navigation
  }, [response])

  const redirectPath = useMemo(() => {
    if (response?.status !== "blocked") return undefined
    return response.redirectPath
  }, [response])

  return {
    status,
    response,
    error,
    resultTarget,
    redirectPath,
    isBusy: status === "resolving",
    submit,
    confirm,
    reset,
    openTarget,
  }
}
