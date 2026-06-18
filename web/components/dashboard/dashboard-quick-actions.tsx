"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiChat02Icon,
  Calendar03Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { dashboardTokens } from "@/components/dashboard/dashboard-tokens"

type DashboardQuickActionsProps = {
  unreadCount: number
  todayCount: number
}

export function DashboardQuickActions({
  unreadCount,
  todayCount,
}: DashboardQuickActionsProps) {
  const actions = [
    { href: "/dashboard/chat", label: "Ask Fly", icon: AiChat02Icon },
    { href: "/dashboard/mail", label: "Mail", icon: Mail01Icon },
    { href: "/dashboard/calendar", label: "Calendar", icon: Calendar03Icon },
  ]

  return (
    <div className="flex flex-col gap-4 border-t border-border/30 pt-6 sm:flex-row sm:items-center sm:justify-between">
      <nav className="flex flex-wrap items-center gap-1" aria-label="Quick navigation">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              dashboardTokens.actionPill,
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            )}
          >
            <HugeiconsIcon icon={action.icon} strokeWidth={2} className="size-4" />
            <span>{action.label}</span>
          </Link>
        ))}
      </nav>

      <p className={dashboardTokens.statText}>
        {unreadCount > 0 ? (
          <span>{unreadCount} unread</span>
        ) : (
          <span>Inbox clear</span>
        )}
        <span className="mx-2 text-border">·</span>
        {todayCount > 0 ? (
          <span>{todayCount} on your calendar today</span>
        ) : (
          <span>No events today</span>
        )}
      </p>
    </div>
  )
}
