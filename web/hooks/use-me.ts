"use client"

import { useQuery } from "@tanstack/react-query"

import { api } from "@/lib/api"

export interface Me {
  firstName: string
  lastName: string | null
  email: string
}

export function useMe() {
  return useQuery<Me>({
    queryKey: ["me"],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { data } = await api.get("/auth/me")
      return data.data
    },
    retry: false,
  })
}
