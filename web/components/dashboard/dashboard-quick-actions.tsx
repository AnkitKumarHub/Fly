"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiChat02Icon,
  Calendar03Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"

type DashboardQuickActionsProps = {
  unreadCount: number
  todayCount: number
}

export function DashboardQuickActions({
  unreadCount,
  todayCount,
}: DashboardQuickActionsProps) {
  const actions = [
    {
      href: "/dashboard/chat",
      label: "Ask Fly",
      icon: AiChat02Icon,
      badge: null as string | null,
      badgeClass: "",
    },
    {
      href: "/dashboard/mail",
      label: "Mail",
      icon: Mail01Icon,
      badge: unreadCount > 0 ? `${unreadCount} unread` : null,
      badgeClass: "bg-[#D1F8E1] text-[#1a3d2e]",
    },
    {
      href: "/dashboard/calendar",
      label: "Calendar",
      icon: Calendar03Icon,
      badge: todayCount > 0 ? `${todayCount} today` : null,
      badgeClass: "bg-[#D6E9FF] text-[#1e3a5f]",
    },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 text-sm font-medium text-foreground",
            "transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          )}
        >
          <HugeiconsIcon icon={action.icon} strokeWidth={2} className="size-4 text-muted-foreground" />
          <span>{action.label}</span>
          {action.badge ? (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium",
                action.badgeClass,
              )}
            >
              {action.badge}
            </span>
          ) : null}
        </Link>
      ))}
    </div>
  )
}
