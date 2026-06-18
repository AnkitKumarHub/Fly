"use client"

import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Mail01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { EmailListItem } from "@/hooks/use-emails"
import { MailRow } from "@/components/mail/mail-row"
import {
  listContainerVariants,
  emptyVariants,
  transition,
  mailDuration,
} from "@/components/mail/mail-motion"

type MailListProps = {
  emails: EmailListItem[]
  selectedId: string | null
  isLoading: boolean
  isSearching: boolean
  folderLabel: string
  listKey: string
  reducedMotion: boolean
  onSelect: (id: string) => void
  onSync?: () => void
  onCompose?: () => void
}

export function MailList({
  emails,
  selectedId,
  isLoading,
  isSearching,
  folderLabel,
  listKey,
  reducedMotion,
  onSelect,
  onSync,
  onCompose,
}: MailListProps) {
  if (isLoading) {
    return (
      <div className="no-scrollbar flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-[88px] w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  if (emails.length === 0) {
    return (
      <MailEmptyList
        isSearching={isSearching}
        folderLabel={folderLabel}
        reducedMotion={reducedMotion}
        onSync={onSync}
        onCompose={onCompose}
      />
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

function MailEmptyList({
  isSearching,
  folderLabel,
  reducedMotion,
  onSync,
  onCompose,
}: {
  isSearching: boolean
  folderLabel: string
  reducedMotion: boolean
  onSync?: () => void
  onCompose?: () => void
}) {
  return (
    <motion.div
      initial={reducedMotion ? false : "initial"}
      animate="animate"
      variants={reducedMotion ? undefined : emptyVariants}
      transition={transition(reducedMotion, mailDuration.empty)}
      className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center"
    >
      <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} className="size-8 text-muted-foreground" />
      <p className="text-sm font-medium text-foreground">
        {isSearching ? "No matching emails" : `${folderLabel} is empty`}
      </p>
      {!isSearching && onSync ? (
        <Button variant="outline" size="sm" onClick={onSync} className="rounded-full">
          Sync inbox
        </Button>
      ) : null}
      {!isSearching && onCompose ? (
        <Button size="sm" onClick={onCompose} className="rounded-full">
          Compose
        </Button>
      ) : null}
    </motion.div>
  )
}
