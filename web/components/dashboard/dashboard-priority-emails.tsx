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
import { dashboardTokens } from "@/components/dashboard/dashboard-tokens"
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
      className={dashboardTokens.card}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/30 pb-5">
        <div className="flex items-center gap-3">
          <span className={dashboardTokens.cardIcon}>
            <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} className="size-4" />
          </span>
          <div>
            <h2 className="text-base font-medium text-foreground">Priority mail</h2>
            <p className="text-xs text-muted-foreground">Unread in your inbox</p>
          </div>
        </div>
        {!isLoading ? (
          <span className={dashboardTokens.countBadge}>{unreadCount}</span>
        ) : null}
      </div>

      <div className="mt-5 flex flex-1 flex-col gap-2.5">
        {isLoading ? (
          <>
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </>
        ) : priorityEmails.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
            <p className="text-sm font-medium text-foreground/80">You&apos;re caught up</p>
            <p className="max-w-[16rem] text-sm text-muted-foreground">
              No unread mail in your inbox right now.
            </p>
          </div>
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
                  dashboardTokens.row,
                  "flex items-start gap-3",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                )}
              >
                <span className={cn(dashboardTokens.rowDot, "mt-2")} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {email.subject || "(no subject)"}
                  </span>
                  <span className="mt-1 block truncate text-xs text-muted-foreground">
                    {formatSender(email.from)}
                    {email.internalDate ? ` · ${formatDate(email.internalDate)}` : ""}
                  </span>
                </span>
              </Link>
            </motion.div>
          ))
        )}
      </div>

      <Link href="/dashboard/mail" className={cn(dashboardTokens.footerLink, "mt-6")}>
        View all mail
        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-3.5" />
      </Link>
    </motion.section>
  )
}
