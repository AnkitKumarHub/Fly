"use client"

import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { StarIcon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import type { EmailListItem } from "@/hooks/use-emails"
import { formatDate, formatSender, getInitials, hasLabel } from "@/components/mail/mail-utils"
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
    <motion.li variants={reducedMotion ? undefined : listItemVariants}>
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "true" : undefined}
        className={cn(
          "w-full rounded-xl px-3 py-3 text-left transition-colors",
          active ? "bg-muted/60" : "hover:bg-muted/30",
        )}
      >
        <span className="flex items-start gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted/80 text-[11px] font-medium text-muted-foreground/90">
            {getInitials(sender)}
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1.5">
                {isUnread ? (
                  <span
                    className="size-1.5 shrink-0 rounded-full bg-foreground/35"
                    aria-hidden
                  />
                ) : null}
                <span
                  className={cn(
                    "truncate text-sm",
                    isUnread
                      ? "font-medium text-foreground/90"
                      : "font-normal text-foreground/65",
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
                    className="size-3 text-muted-foreground/70"
                  />
                ) : null}
                <span className="text-xs tabular-nums text-muted-foreground/70">
                  {formatDate(email.internalDate)}
                </span>
              </span>
            </span>

            <span
              className={cn(
                "mt-0.5 block truncate text-sm",
                isUnread ? "font-normal text-foreground/80" : "font-normal text-foreground/55",
              )}
            >
              {subject}
            </span>

            {snippet ? (
              <span className="mt-0.5 line-clamp-1 text-sm text-muted-foreground/65">
                {snippet}
              </span>
            ) : null}
          </span>
        </span>
      </button>
    </motion.li>
  )
}
