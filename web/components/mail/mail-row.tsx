"use client"

import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { StarIcon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import type { EmailListItem } from "@/hooks/use-emails"
import {
  formatDate,
  formatSender,
  getAvatarColor,
  getInitials,
  hasLabel,
} from "@/components/mail/mail-utils"
import { listItemVariants } from "@/components/mail/mail-motion"

type MailRowProps = {
  email: EmailListItem
  active: boolean
  reducedMotion: boolean
  onSelect: () => void
}

export function MailRow({ email, active, reducedMotion, onSelect }: MailRowProps) {
  const isUnread = email.isUnread ?? email.labelIds?.includes("UNREAD")
  const isStarred = hasLabel(email, "STARRED")
  const sender = formatSender(email.from)
  const subject = email.subject || "(no subject)"
  const snippet = email.snippet?.trim()

  return (
    <motion.li
      variants={reducedMotion ? undefined : listItemVariants}
      whileHover={reducedMotion ? undefined : { scale: 1.005 }}
      transition={{ duration: 0.15 }}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "true" : undefined}
        className={cn(
          "w-full rounded-2xl px-4 py-3.5 text-left transition-colors",
          active
            ? "bg-muted shadow-sm ring-1 ring-border/50"
            : "bg-muted/25 hover:bg-muted/50",
        )}
      >
        <span className="flex items-start gap-3">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
              getAvatarColor(sender),
            )}
          >
            {getInitials(sender)}
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1.5">
                {isUnread ? (
                  <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                ) : null}
                <span
                  className={cn(
                    "truncate text-sm",
                    isUnread ? "font-semibold text-foreground" : "font-medium text-foreground/90",
                  )}
                >
                  {sender}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1">
                {isStarred ? (
                  <HugeiconsIcon
                    icon={StarIcon}
                    strokeWidth={2}
                    className="size-3 text-amber-400"
                  />
                ) : null}
                <span className="text-xs text-muted-foreground">
                  {formatDate(email.internalDate)}
                </span>
              </span>
            </span>

            <span
              className={cn(
                "mt-1 block truncate text-sm",
                isUnread ? "font-semibold text-foreground" : "font-medium text-foreground/80",
              )}
            >
              {subject}
            </span>

            {snippet ? (
              <span className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{snippet}</span>
            ) : null}
          </span>
        </span>
      </button>
    </motion.li>
  )
}
