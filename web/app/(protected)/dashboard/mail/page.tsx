"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Mail01Icon,
  PencilEdit01Icon,
  RefreshIcon,
  SearchIcon,
  InboxIcon,
  SentIcon,
  File01Icon,
  AlertCircleIcon,
  Delete02Icon,
  StarIcon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ComposeSheet } from "@/components/compose-sheet"
import {
  IntegrationReconnectBanner,
  isIntegrationNotConnectedError,
} from "@/components/integration-reconnect-banner"
import {
  useEmail,
  useEmails,
  useSearchEmails,
  useSyncInbox,
  type EmailListItem,
} from "@/hooks/use-emails"

// ─── Label helpers ────────────────────────────────────────────────────────────

type Folder = "inbox" | "sent" | "drafts" | "spam" | "trash"
type Category = "all" | "primary" | "social" | "promotions" | "updates"

const FOLDER_LABEL: Record<Folder, string> = {
  inbox: "INBOX",
  sent: "SENT",
  drafts: "DRAFT",
  spam: "SPAM",
  trash: "TRASH",
}

const CATEGORY_LABEL: Record<Exclude<Category, "all">, string> = {
  primary: "CATEGORY_PRIMARY",
  social: "CATEGORY_SOCIAL",
  promotions: "CATEGORY_PROMOTIONS",
  updates: "CATEGORY_UPDATES",
}

function hasLabel(email: EmailListItem, label: string) {
  return email.labelIds?.includes(label) ?? false
}

function filterByFolder(emails: EmailListItem[], folder: Folder) {
  const label = FOLDER_LABEL[folder]
  return emails.filter((e) => hasLabel(e, label))
}

function filterByCategory(emails: EmailListItem[], category: Category) {
  if (category === "all") return emails
  return emails.filter((e) => hasLabel(e, CATEGORY_LABEL[category]))
}

function formatSender(raw?: string) {
  if (!raw) return "Unknown sender"
  const match = raw.match(/^(.*?)</)
  const name = match?.[1]?.trim().replace(/"/g, "")
  return name && name.length > 0 ? name : raw
}

function formatDate(internalDate?: string) {
  if (!internalDate) return ""
  const timestamp = Number(internalDate)
  if (Number.isNaN(timestamp)) return ""
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const FOLDERS: { id: Folder; label: string; icon: typeof InboxIcon }[] = [
  { id: "inbox", label: "Inbox", icon: InboxIcon },
  { id: "sent", label: "Sent", icon: SentIcon },
  { id: "drafts", label: "Drafts", icon: File01Icon },
  { id: "spam", label: "Spam", icon: AlertCircleIcon },
  { id: "trash", label: "Trash", icon: Delete02Icon },
]

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "primary", label: "Primary" },
  { id: "social", label: "Social" },
  { id: "promotions", label: "Promotions" },
  { id: "updates", label: "Updates" },
]

function FolderNav({
  activeFolder,
  emails,
  onSelect,
}: {
  activeFolder: Folder
  emails: EmailListItem[]
  onSelect: (f: Folder) => void
}) {
  return (
    <div className="flex flex-col gap-0.5 p-2">
      {FOLDERS.map(({ id, label, icon }) => {
        const count = id === "inbox"
          ? emails.filter((e) => hasLabel(e, "INBOX") && e.isUnread).length
          : id === "spam"
          ? emails.filter((e) => hasLabel(e, "SPAM")).length
          : id === "drafts"
          ? emails.filter((e) => hasLabel(e, "DRAFT")).length
          : 0

        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors text-left",
              activeFolder === id
                ? "bg-muted text-foreground font-medium"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            <HugeiconsIcon icon={icon} strokeWidth={2} className="size-4 shrink-0" />
            <span className="flex-1">{label}</span>
            {count > 0 && (
              <span className="text-xs font-medium text-primary">{count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

function CategoryTabs({
  active,
  emails,
  onSelect,
}: {
  active: Category
  emails: EmailListItem[]
  onSelect: (c: Category) => void
}) {
  return (
    <div className="flex gap-1 border-b border-border px-3 pt-2 overflow-x-auto">
      {CATEGORIES.map(({ id, label }) => {
        const count = id === "all"
          ? emails.filter((e) => e.isUnread).length
          : emails.filter(
              (e) => hasLabel(e, CATEGORY_LABEL[id as Exclude<Category, "all">]) && e.isUnread,
            ).length

        return (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px",
              active === id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
            {count > 0 && (
              <span className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                active === id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MailPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [activeQuery, setActiveQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [composeOpen, setComposeOpen] = useState(false)
  const [activeFolder, setActiveFolder] = useState<Folder>("inbox")
  const [activeCategory, setActiveCategory] = useState<Category>("all")

  const isSearching = activeQuery.trim().length > 0
  const listQuery = useEmails()
  const searchQuery = useSearchEmails(activeQuery)
  const syncInbox = useSyncInbox()

  const { data: allEmails = [], isLoading, error: listError } = isSearching ? searchQuery : listQuery
  const showReconnect = isIntegrationNotConnectedError(listError)
  const { data: selectedEmail, isLoading: isDetailLoading } = useEmail(selectedId)

  // Apply folder + category filters
  const folderEmails = isSearching ? allEmails : filterByFolder(allEmails, activeFolder)
  const visibleEmails = activeFolder === "inbox" && !isSearching
    ? filterByCategory(folderEmails, activeCategory)
    : folderEmails

  const unreadCount = visibleEmails.filter((e) => e.isUnread).length

  function markEmailRead(emailId: string) {
    queryClient.setQueriesData<EmailListItem[]>({ queryKey: ["emails", "list"] }, (current) =>
      current?.map((email) =>
        email.id === emailId
          ? {
              ...email,
              isUnread: false,
              labelIds: email.labelIds?.filter((label) => label !== "UNREAD"),
            }
          : email,
      ),
    )
    queryClient.setQueriesData<EmailListItem[]>(
      { queryKey: ["emails", "search"] },
      (current) =>
        current?.map((email) =>
          email.id === emailId
            ? {
                ...email,
                isUnread: false,
                labelIds: email.labelIds?.filter((label) => label !== "UNREAD"),
              }
            : email,
        ),
    )
  }

  function handleSelectEmail(emailId: string) {
    setSelectedId(emailId)
    markEmailRead(emailId)
  }

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault()
    setActiveQuery(search)
  }

  function handleSync() {
    syncInbox.mutate(undefined, {
      onSuccess: () => toast.success("Inbox synced"),
      onError: () => toast.error("Failed to sync inbox"),
    })
  }

  function handleFolderSelect(folder: Folder) {
    setActiveFolder(folder)
    setActiveCategory("all")
    setSelectedId(null)
    setSearch("")
    setActiveQuery("")
  }

  const folderLabel = FOLDERS.find((f) => f.id === activeFolder)?.label ?? "Inbox"

  return (
    <div className="flex h-[calc(100vh-var(--header-height))] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">
          {isSearching ? "Search results" : folderLabel}
          {unreadCount > 0 ? (
            <span className="ml-2 text-sm font-medium text-muted-foreground">({unreadCount} unread)</span>
          ) : null}
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSync} disabled={syncInbox.isPending}>
            <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} className="size-4" />
            {syncInbox.isPending ? "Syncing..." : "Sync"}
          </Button>
          <Button size="sm" onClick={() => setComposeOpen(true)}>
            <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} className="size-4" />
            Compose
          </Button>
        </div>
      </div>

      {showReconnect ? (
        <div className="border-b border-border px-6 py-3">
          <IntegrationReconnectBanner message="Reconnect Gmail on the integrations page to continue." />
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1">
        {/* Left panel: folder nav + email list */}
        <div className="flex w-full max-w-sm flex-col border-r border-border">

          {/* Folder navigation */}
          <div className="border-b border-border">
            <FolderNav
              activeFolder={activeFolder}
              emails={allEmails}
              onSelect={handleFolderSelect}
            />
          </div>

          {/* Category tabs — only visible on inbox */}
          {activeFolder === "inbox" && !isSearching && (
            <CategoryTabs
              active={activeCategory}
              emails={folderEmails}
              onSelect={setActiveCategory}
            />
          )}

          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="border-b border-border p-3">
            <div className="relative">
              <HugeiconsIcon
                icon={SearchIcon}
                strokeWidth={2}
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search emails..."
                className="pl-9"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  if (event.target.value === "") setActiveQuery("")
                }}
              />
            </div>
          </form>

          {/* Email list */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col gap-2 p-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : !visibleEmails || visibleEmails.length === 0 ? (
              <EmptyList isSearching={isSearching} folder={folderLabel} />
            ) : (
              <ul>
                {visibleEmails.map((email) => (
                  <EmailRow
                    key={email.id}
                    email={email}
                    active={email.id === selectedId}
                    onSelect={() => handleSelectEmail(email.id)}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right panel: email detail */}
        <div className="min-w-0 flex-1 overflow-y-auto">
          {!selectedId ? (
            <EmptyDetail />
          ) : isDetailLoading ? (
            <div className="flex flex-col gap-3 p-8">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="mt-4 h-64 w-full" />
            </div>
          ) : selectedEmail ? (
            <EmailDetailView email={selectedEmail} />
          ) : null}
        </div>
      </div>

      <ComposeSheet open={composeOpen} onOpenChange={setComposeOpen} />
    </div>
  )
}

// ─── Email row ────────────────────────────────────────────────────────────────

function EmailRow({
  email,
  active,
  onSelect,
}: {
  email: EmailListItem
  active: boolean
  onSelect: () => void
}) {
  const isUnread = email.isUnread ?? email.labelIds?.includes("UNREAD")
  const isImportant = hasLabel(email, "IMPORTANT")
  const isStarred = hasLabel(email, "STARRED")

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex w-full flex-col gap-1 border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-muted/50",
          isUnread ? "bg-primary/5" : "bg-background",
          active && "bg-muted",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {/* Unread dot */}
            {isUnread && (
              <span className="size-1.5 shrink-0 rounded-full bg-primary" />
            )}
            <span
              className={cn(
                "truncate text-sm text-foreground",
                isUnread ? "font-semibold" : "font-medium",
              )}
            >
              {formatSender(email.from)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Starred */}
            {isStarred && (
              <HugeiconsIcon icon={StarIcon} strokeWidth={2} className="size-3 text-amber-400 fill-amber-400" />
            )}
            <span className="text-xs text-muted-foreground">
              {formatDate(email.internalDate)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Important badge */}
          {isImportant && (
            <span className="shrink-0 h-4 w-1 rounded-full bg-amber-400" title="Important" />
          )}
          <span
            className={cn(
              "truncate text-sm flex-1",
              isUnread ? "font-semibold text-foreground" : "text-foreground/90",
            )}
          >
            {email.subject || "(no subject)"}
          </span>
        </div>

        <span className="truncate text-xs text-muted-foreground">{email.snippet}</span>
      </button>
    </li>
  )
}

// ─── Email detail ─────────────────────────────────────────────────────────────

function EmailDetailView({
  email,
}: {
  email: import("@/hooks/use-emails").EmailDetail
}) {
  const isImportant = email.labelIds?.includes("IMPORTANT")
  const isStarred = email.labelIds?.includes("STARRED")

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-8 py-8">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          {email.subject || "(no subject)"}
        </h2>
        <div className="flex items-center gap-2 shrink-0 mt-1">
          {isImportant && (
            <Badge variant="secondary" className="text-xs bg-amber-400/10 text-amber-500 border-amber-400/30">
              Important
            </Badge>
          )}
          {isStarred && (
            <HugeiconsIcon icon={StarIcon} strokeWidth={2} className="size-4 text-amber-400 fill-amber-400" />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1 border-b border-border pb-4 text-sm">
        <span className="font-medium text-foreground">{email.from}</span>
        <span className="text-muted-foreground">to {email.to}</span>
        {email.date ? <span className="text-muted-foreground">{email.date}</span> : null}
      </div>

      {email.bodyHtml ? (
        <iframe
          title="email-body"
          sandbox=""
          className="min-h-[60vh] w-full rounded-lg border border-border bg-white"
          srcDoc={email.bodyHtml}
        />
      ) : (
        <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-foreground/90">
          {email.bodyText || email.snippet}
        </pre>
      )}
    </div>
  )
}

// ─── Empty states ─────────────────────────────────────────────────────────────

function EmptyList({ isSearching, folder }: { isSearching: boolean; folder: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} className="size-8 text-muted-foreground" />
      <p className="text-sm font-medium text-foreground">
        {isSearching ? "No matching emails" : `${folder} is empty`}
      </p>
      <p className="text-xs text-muted-foreground">
        {isSearching ? "Try a different search." : "Hit Sync to pull your inbox from Gmail."}
      </p>
    </div>
  )
}

function EmptyDetail() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} className="size-10 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">Select an email to read it</p>
    </div>
  )
}
