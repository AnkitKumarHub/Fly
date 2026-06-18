"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, Mail01Icon } from "@hugeicons/core-free-icons"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { EmailListItem } from "@/hooks/use-emails"
import { formatDate, formatSender } from "@/components/mail/mail-utils"
import {
  dashboardDuration,
  dashboardTransition,
  cardVariants,
} from "@/components/dashboard/dashboard-motion"
import { getPriorityEmails } from "@/components/dashboard/dashboard-utils"

type DashboardPriorityEmailsProps = {
  emails: EmailListItem[]
  isLoading: boolean
  reducedMotion: boolean
}

export function DashboardPriorityEmails({
  emails,
  isLoading,
  reducedMotion,
}: DashboardPriorityEmailsProps) {
  const priorityEmails = getPriorityEmails(emails)
  const unreadCount = priorityEmails.length

  return (
    <motion.section
      variants={cardVariants}
      className="flex min-h-[220px] flex-col rounded-2xl border border-[#b0e8c8]/40 bg-[#D1F8E1]/20 p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-[#D1F8E1] text-[#1a3d2e]">
            <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} className="size-4" />
          </span>
          <h2 className="text-sm font-semibold text-foreground">Priority mail</h2>
        </div>
        {!isLoading && unreadCount > 0 ? (
          <span className="rounded-full bg-[#D1F8E1] px-2 py-0.5 text-[11px] font-medium text-[#1a3d2e]">
            {unreadCount}
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-2">
        {isLoading ? (
          <>
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </>
        ) : priorityEmails.length === 0 ? (
          <p className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            You&apos;re caught up — no unread mail in your inbox.
          </p>
        ) : (
          priorityEmails.map((email) => (
            <motion.div
              key={email.id}
              whileHover={reducedMotion ? undefined : { y: -1 }}
              transition={dashboardTransition(reducedMotion, dashboardDuration.fast)}
            >
              <Link
                href="/dashboard/mail"
                className={cn(
                  "flex items-start gap-2 rounded-xl border border-transparent bg-card/60 px-3 py-2.5",
                  "transition-colors hover:border-[#b0e8c8]/50 hover:bg-[#D1F8E1]/25",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                )}
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#1a3d2e]" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {email.subject || "(no subject)"}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {formatSender(email.from)}
                    {email.internalDate ? ` · ${formatDate(email.internalDate)}` : ""}
                  </span>
                </span>
              </Link>
            </motion.div>
          ))
        )}
      </div>

      <Link
        href="/dashboard/mail"
        className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        View all mail
        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-3.5" />
      </Link>
    </motion.section>
  )
}
