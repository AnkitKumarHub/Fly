"use client"

import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Delete02Icon,
  File01Icon,
  InboxIcon,
  SearchIcon,
  SentIcon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import type { Folder } from "@/components/mail/mail-utils"
import { emptyVariants, transition, mailDuration } from "@/components/mail/mail-motion"

type MailEmptyStateProps = {
  folder: Folder
  folderLabel: string
  isSearching: boolean
  reducedMotion: boolean
  onSync?: () => void
  onCompose?: () => void
  onClearSearch?: () => void
}

const FOLDER_META: Record<
  Folder,
  { icon: typeof InboxIcon; title: string; description: string }
> = {
  inbox: {
    icon: InboxIcon,
    title: "Inbox is clear",
    description: "New messages will appear here after you sync.",
  },
  sent: {
    icon: SentIcon,
    title: "Nothing sent yet",
    description: "Emails you send will show up in this folder.",
  },
  drafts: {
    icon: File01Icon,
    title: "No drafts",
    description: "Start writing and save a draft to pick up later.",
  },
  spam: {
    icon: Delete02Icon,
    title: "No spam",
    description: "Suspicious messages filtered by Gmail will land here.",
  },
  trash: {
    icon: Delete02Icon,
    title: "Trash is empty",
    description: "Deleted emails will stay here until removed permanently.",
  },
}

export function MailEmptyState({
  folder,
  folderLabel,
  isSearching,
  reducedMotion,
  onSync,
  onCompose,
  onClearSearch,
}: MailEmptyStateProps) {
  const meta = isSearching
    ? {
        icon: SearchIcon,
        title: "No matching emails",
        description: `Nothing found in ${folderLabel.toLowerCase()}. Try different words.`,
      }
    : FOLDER_META[folder]

  const Icon = meta.icon

  const showSync = !isSearching && folder === "inbox" && onSync
  const showCompose =
    !isSearching && (folder === "drafts" || folder === "inbox") && onCompose
  const showClearSearch = isSearching && onClearSearch

  return (
    <motion.div
      initial={reducedMotion ? false : "initial"}
      animate="animate"
      variants={reducedMotion ? undefined : emptyVariants}
      transition={transition(reducedMotion, mailDuration.empty)}
      className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-12 text-center"
    >
      <span className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-muted/30 ring-1 ring-border/30">
        <HugeiconsIcon
          icon={isSearching ? SearchIcon : Icon}
          strokeWidth={1.5}
          className="size-7 text-muted-foreground/70"
        />
      </span>

      <h2 className="text-base font-medium text-foreground/75">{meta.title}</h2>
      <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted-foreground/80">
        {meta.description}
      </p>

      {(showSync || showCompose || showClearSearch) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {showSync ? (
            <Button variant="outline" size="sm" onClick={onSync} className="rounded-full">
              Sync inbox
            </Button>
          ) : null}
          {showCompose ? (
            <Button size="sm" onClick={onCompose} className="rounded-full">
              Compose
            </Button>
          ) : null}
          {showClearSearch ? (
            <Button variant="outline" size="sm" onClick={onClearSearch} className="rounded-full">
              Clear search
            </Button>
          ) : null}
        </div>
      )}
    </motion.div>
  )
}
