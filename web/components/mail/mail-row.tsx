"use client"

import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { StarIcon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import type { EmailListItem } from "@/hooks/use-emails"
import { formatDate, formatSender, getInitials, hasLabel } from "@/components/mail/mail-utils"
import { listItemVariants, transition, mailDuration } from "@/components/mail/mail-motion"

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
          "relative flex w-full items-start gap-3 border-b border-border/30 px-4 py-3.5 text-left transition-colors hover:bg-muted/40",
          active && "bg-muted",
        )}
      >
        {active ? (
          <motion.span
            layoutId="mail-active-row"
            className="absolute inset-y-0 left-0 w-0.5 bg-primary"
            transition={transition(reducedMotion, mailDuration.fast)}
          />
        ) : null}

        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-medium text-muted-foreground">
          {getInitials(sender)}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "truncate text-sm text-foreground",
                isUnread ? "font-semibold" : "font-medium",
              )}
            >
              {sender}
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
          <span className="mt-0.5 block truncate text-sm text-muted-foreground">
            <span className={cn(isUnread && "font-medium text-foreground")}>{subject}</span>
            {snippet ? ` — ${snippet}` : null}
          </span>
        </span>
      </button>
    </motion.li>
  )
}
