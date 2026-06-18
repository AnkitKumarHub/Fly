"use client"

import { useNotificationStream } from "@/hooks/use-notification-stream"

export function DashboardRealtime() {
  useNotificationStream()
  return null
}
