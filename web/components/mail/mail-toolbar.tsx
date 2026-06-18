"use client"

import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  PencilEdit01Icon,
  RefreshIcon,
  SearchIcon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { Category, Folder } from "@/components/mail/mail-utils"
import {
  CATEGORIES,
  FOLDERS,
  getFolderLabel,
  getInboxUnreadCount,
} from "@/components/mail/mail-utils"
import type { EmailListItem } from "@/hooks/use-emails"

const INBOX_CATEGORIES = CATEGORIES.filter((c) => c.id !== "all")

type MailToolbarProps = {
  activeFolder: Folder
  activeCategory: Category
  search: string
  isSearching: boolean
  isSyncing: boolean
  showCategories: boolean
  showBack: boolean
  reducedMotion: boolean
  allEmails: EmailListItem[]
  onFolderChange: (folder: Folder) => void
  onCategoryChange: (category: Category) => void
  onSearchChange: (value: string) => void
  onSearchSubmit: (event: React.FormEvent) => void
  onSync: () => void
  onCompose: () => void
  onBack: () => void
}

export function MailToolbar({
  activeFolder,
  activeCategory,
  search,
  isSearching,
  isSyncing,
  showCategories,
  showBack,
  reducedMotion,
  allEmails,
  onFolderChange,
  onCategoryChange,
  onSearchChange,
  onSearchSubmit,
  onSync,
  onCompose,
  onBack,
}: MailToolbarProps) {
  const unreadCount = getInboxUnreadCount(allEmails)
  const title = isSearching ? "Search" : getFolderLabel(activeFolder)

  return (
    <div className="shrink-0 space-y-4 px-5 pb-4 pt-5 md:px-6">
      <div className="flex items-center gap-3">
        {showBack ? (
          <Button variant="ghost" size="icon-sm" onClick={onBack} aria-label="Back to list">
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4" />
          </Button>
        ) : null}

        <div className="min-w-0 shrink-0">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
          {activeFolder === "inbox" && unreadCount > 0 && !isSearching ? (
            <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
          ) : null}
        </div>

        <form onSubmit={onSearchSubmit} className="relative mx-auto hidden min-w-0 max-w-md flex-1 md:block">
          <HugeiconsIcon
            icon={SearchIcon}
            strokeWidth={2}
            className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search emails..."
            className="h-9 rounded-full border-border/50 bg-muted/40 pl-10 shadow-none"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onSync}
            disabled={isSyncing}
            aria-label="Sync inbox"
            className="rounded-full"
          >
            <motion.span
              animate={isSyncing && !reducedMotion ? { rotate: 360 } : { rotate: 0 }}
              transition={
                isSyncing
                  ? { repeat: Infinity, duration: 1, ease: "linear" }
                  : { duration: 0 }
              }
              className="inline-flex"
            >
              <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} className="size-4" />
            </motion.span>
          </Button>
          <motion.div whileTap={reducedMotion ? undefined : { scale: 0.97 }}>
            <Button size="sm" onClick={onCompose} className="rounded-full px-4">
              <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} className="size-4" />
              Compose
            </Button>
          </motion.div>
        </div>
      </div>

      <form onSubmit={onSearchSubmit} className="relative md:hidden">
        <HugeiconsIcon
          icon={SearchIcon}
          strokeWidth={2}
          className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Search emails..."
          className="h-9 rounded-full border-border/50 bg-muted/40 pl-10 shadow-none"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </form>

      {!isSearching ? (
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {FOLDERS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => onFolderChange(id)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                activeFolder === id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      {showCategories ? (
        <div className="no-scrollbar flex gap-5 overflow-x-auto border-b border-border/30">
          <button
            type="button"
            onClick={() => onCategoryChange("all")}
            className={cn(
              "shrink-0 border-b-2 pb-2.5 text-sm font-medium transition-colors",
              activeCategory === "all"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            All
          </button>
          {INBOX_CATEGORIES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => onCategoryChange(id)}
              className={cn(
                "shrink-0 border-b-2 pb-2.5 text-sm font-medium transition-colors",
                activeCategory === id
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
