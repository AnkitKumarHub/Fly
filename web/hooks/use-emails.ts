"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "@/lib/api"

export interface EmailListItem {
  id: string
  threadId?: string
  snippet?: string
  subject?: string
  from?: string
  to?: string
  internalDate?: string
  labelIds?: string[]
  isUnread?: boolean
}

export interface EmailDetail {
  id?: string
  threadId?: string
  snippet?: string
  labelIds?: string[]
  subject: string
  from: string
  to: string
  date: string
  bodyText: string
  bodyHtml: string
}

export interface ComposeInput {
  to: string
  subject: string
  body: string
}

export function useEmails(limit = 25) {
  return useQuery({
    queryKey: ["emails", "list", limit],
    refetchOnWindowFocus: false,
    retry: false,
    queryFn: async () => {
      const { data } = await api.get("/emails", { params: { limit } })
      return data.data as EmailListItem[]
    },
  })
}

export function useSearchEmails(query: string, limit = 25) {
  return useQuery({
    queryKey: ["emails", "search", query, limit],
    enabled: query.trim().length > 0,
    refetchOnWindowFocus: false,
    retry: false,
    queryFn: async () => {
      const { data } = await api.get("/emails/search", {
        params: { q: query, limit },
      })
      return data.data as EmailListItem[]
    },
  })
}

export function useEmail(id: string | null) {
  return useQuery({
    queryKey: ["emails", "detail", id],
    enabled: Boolean(id),
    refetchOnWindowFocus: false,
    retry: false,
    queryFn: async () => {
      const { data } = await api.get(`/emails/${id}`)
      return data.data as EmailDetail
    },
  })
}

export function useSyncInbox() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/emails/sync")
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails", "list"] })
    },
  })
}

export function useSendEmail() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ComposeInput) => {
      const { data } = await api.post("/emails/send", input)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emails", "list"] })
    },
  })
}

export function useCreateDraft() {
  return useMutation({
    mutationFn: async (input: ComposeInput) => {
      const { data } = await api.post("/emails/draft", input)
      return data.data
    },
  })
}
