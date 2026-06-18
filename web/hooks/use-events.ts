"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "@/lib/api"

export interface EventDateTime {
  date?: string
  dateTime?: string
  timeZone?: string
}

export interface EventAttendee {
  email?: string
  displayName?: string
  responseStatus?: string
}

export interface EventListItem {
  id: string
  corsairId?: string
  summary?: string
  description?: string
  location?: string
  start?: EventDateTime
  end?: EventDateTime
  htmlLink?: string
  status?: string
}

export interface EventDetail extends EventListItem {
  attendees?: EventAttendee[]
  hangoutLink?: string
}

export interface CreateEventInput {
  event: {
    summary: string
    description?: string
    location?: string
    start: EventDateTime
    end: EventDateTime
    attendees?: { email: string }[]
  }
  calendarId?: string
  sendUpdates?: "all" | "externalOnly" | "none"
}

export interface UpdateEventInput {
  event: Partial<CreateEventInput["event"]>
  calendarId?: string
  sendUpdates?: "all" | "externalOnly" | "none"
}

export function useEvents(limit = 25) {
  return useQuery({
    queryKey: ["events", "list", limit],
    refetchOnWindowFocus: false,
    retry: false,
    queryFn: async () => {
      const { data } = await api.get("/events", { params: { limit } })
      return data.data as EventListItem[]
    },
  })
}

export function useSearchEvents(query: string, limit = 25) {
  return useQuery({
    queryKey: ["events", "search", query, limit],
    enabled: query.trim().length > 0,
    refetchOnWindowFocus: false,
    retry: false,
    queryFn: async () => {
      const { data } = await api.get("/events/search", {
        params: { q: query, limit },
      })
      return data.data as EventListItem[]
    },
  })
}

export function useEvent(id: string | null) {
  return useQuery({
    queryKey: ["events", "detail", id],
    enabled: Boolean(id),
    refetchOnWindowFocus: false,
    retry: false,
    queryFn: async () => {
      const { data } = await api.get(`/events/${id}`)
      return data.data as EventDetail
    },
  })
}

export function useSyncEvents() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/events/sync")
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", "list"] })
    },
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateEventInput) => {
      const { data } = await api.post("/events", input)
      return data.data as EventDetail
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: UpdateEventInput }) => {
      const { data } = await api.patch(`/events/${id}`, input)
      return data.data as EventDetail
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
      queryClient.invalidateQueries({ queryKey: ["events", "detail", variables.id] })
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/events/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
    },
  })
}
