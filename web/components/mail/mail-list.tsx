"use client"

import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Mail01Icon } from "@hugeicons/core-free-icons"

import { Skeleton } from "@/components/ui/skeleton"
import type { EmailListItem } from "@/hooks/use-emails"
import { MailRow } from "@/components/mail/mail-row"
import { listContainerVariants } from "@/components/mail/mail-motion"

type MailListProps = {
  emails: EmailListItem[]
  selectedId: string | null
  isLoading: boolean
  listKey: string
  reducedMotion: boolean
  onSelect: (id: string) => void
}

export function MailList({
  emails,
  selectedId,
  isLoading,
  listKey,
  reducedMotion,
  onSelect,
}: MailListProps) {
  if (isLoading) {
    return (
      <div className="no-scrollbar flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-[72px] w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <motion.ul
      key={listKey}
      initial={reducedMotion ? false : "hidden"}
      animate="show"
      variants={reducedMotion ? undefined : listContainerVariants}
      className="no-scrollbar flex flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-2"
    >
      {emails.map((email) => (
        <MailRow
          key={email.id}
          email={email}
          active={email.id === selectedId}
          reducedMotion={reducedMotion}
          onSelect={() => onSelect(email.id)}
        />
      ))}
    </motion.ul>
  )
}
