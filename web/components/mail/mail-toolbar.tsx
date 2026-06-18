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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Category, Folder } from "@/components/mail/mail-utils"
import { CATEGORIES, FOLDERS, getFolderLabel, getInboxUnreadCount } from "@/components/mail/mail-utils"
import type { EmailListItem } from "@/hooks/use-emails"

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
  const folderLabel = isSearching ? "Search results" : getFolderLabel(activeFolder)
  const folderTriggerLabel =
    activeFolder === "inbox" && unreadCount > 0
      ? `${folderLabel} · ${unreadCount} unread`
      : folderLabel

  return (
    <div className="flex flex-col gap-3 border-b border-border/40 px-4 py-3 md:px-5">
      <div className="flex items-center gap-2">
        {showBack ? (
          <Button variant="ghost" size="icon-sm" onClick={onBack} aria-label="Back to list">
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4" />
          </Button>
        ) : null}

        <Select
          value={activeFolder}
          onValueChange={(value) => {
            if (value !== null) onFolderChange(value as Folder)
          }}
          disabled={isSearching}
        >
          <SelectTrigger size="sm" className="min-w-[140px]">
            <SelectValue>{folderTriggerLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {FOLDERS.map(({ id, label }) => (
              <SelectItem key={id} value={id}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <form onSubmit={onSearchSubmit} className="relative min-w-0 flex-1">
          <HugeiconsIcon
            icon={SearchIcon}
            strokeWidth={2}
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search emails..."
            className="h-8 pl-9 pr-14"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border/60 bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground md:inline">
            ⌘K
          </kbd>
        </form>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onSync}
            disabled={isSyncing}
            aria-label="Sync inbox"
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
            <Button size="sm" onClick={onCompose}>
              <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} className="size-4" />
              <span className="hidden sm:inline">Compose</span>
            </Button>
          </motion.div>
        </div>
      </div>

      {showCategories ? (
        <Tabs
          value={activeCategory}
          onValueChange={(value) => {
            if (value !== null) onCategoryChange(value as Category)
          }}
        >
          <TabsList variant="default" className="h-8 overflow-x-auto">
            {CATEGORIES.map(({ id, label }) => (
              <TabsTrigger key={id} value={id} className="text-xs">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      ) : null}
    </div>
  )
}
