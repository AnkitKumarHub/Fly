"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import { api } from "@/lib/api"

export function useSignOut() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/sign-out")
    },
    onSettled: () => {
      queryClient.clear()
      router.replace("/login")
    },
  })
}
