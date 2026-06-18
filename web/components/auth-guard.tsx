"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useMe } from "@/hooks/use-me"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isLoading, isError } = useMe()

  useEffect(() => {
    if (!isLoading && isError) {
      router.replace("/login")
    }
  }, [isLoading, isError, router])

  if (isLoading || isError) {
    return null
  }

  return <>{children}</>
}
