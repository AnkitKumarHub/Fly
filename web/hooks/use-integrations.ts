"use client"

import { useCallback, useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter, useSearchParams } from "next/navigation"

import { api } from "@/lib/api"

interface IntegrationStatus {
  gmail: boolean
  googlecalendar: boolean
}

function toConnectedPlugins(status: IntegrationStatus): string[] {
  return (Object.entries(status) as [keyof IntegrationStatus, boolean][])
    .filter(([, connected]) => connected)
    .map(([plugin]) => plugin)
}

export function useIntegrations() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()

  const statusQuery = useQuery({
    queryKey: ["integrations", "status"],
    refetchOnWindowFocus: false,
    retry: false,
    queryFn: async () => {
      const { data } = await api.get("/integrations/status")
      return data.data as IntegrationStatus
    },
  })

  const disconnectMutation = useMutation({
    mutationFn: async (plugin: string) => {
      const { data } = await api.post("/integrations/disconnect", undefined, {
        params: { plugin },
      })
      return data.data as IntegrationStatus
    },
    onSuccess: (status) => {
      queryClient.setQueryData(["integrations", "status"], status)
      queryClient.invalidateQueries({ queryKey: ["emails"] })
      queryClient.invalidateQueries({ queryKey: ["events"] })
    },
  })

  useEffect(() => {
    const connected = searchParams.get("connected")
    if (!connected) return

    queryClient.invalidateQueries({ queryKey: ["integrations", "status"] })
    router.replace(window.location.pathname)
  }, [searchParams, router, queryClient])

  const connectPlugin = useCallback((plugin: string) => {
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/integrations/connect?plugin=${plugin}`
  }, [])

  const disconnectPlugin = useCallback(
    (plugin: string) => {
      disconnectMutation.mutate(plugin)
    },
    [disconnectMutation],
  )

  const connectedPlugins = statusQuery.data ? toConnectedPlugins(statusQuery.data) : []

  return {
    connectedPlugins,
    connectPlugin,
    disconnectPlugin,
    isLoading: statusQuery.isLoading,
    isDisconnecting: disconnectMutation.isPending,
  }
}
