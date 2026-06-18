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
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
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

export default function MailPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [activeQuery, setActiveQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [composeOpen, setComposeOpen] = useState(false)

  const isSearching = activeQuery.trim().length > 0
  const listQuery = useEmails()
  const searchQuery = useSearchEmails(activeQuery)
  const syncInbox = useSyncInbox()

  const { data: emails, isLoading, error: listError } = isSearching ? searchQuery : listQuery
  const showReconnect = isIntegrationNotConnectedError(listError)
  const { data: selectedEmail, isLoading: isDetailLoading } = useEmail(selectedId)

  const unreadCount = emails?.filter((email) => email.isUnread).length ?? 0

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

  return (
    <div className="flex h-[calc(100vh-var(--header-height))] flex-col">
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">
          Inbox
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
        <div className="flex w-full max-w-sm flex-col border-r border-border">
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

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col gap-2 p-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : !emails || emails.length === 0 ? (
              <EmptyList isSearching={isSearching} />
            ) : (
              <ul>
                {emails.map((email) => (
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
          <span
            className={cn(
              "truncate text-sm text-foreground",
              isUnread ? "font-semibold" : "font-medium",
            )}
          >
            {formatSender(email.from)}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatDate(email.internalDate)}
          </span>
        </div>
        <span
          className={cn(
            "truncate text-sm",
            isUnread ? "font-semibold text-foreground" : "text-foreground/90",
          )}
        >
          {email.subject || "(no subject)"}
        </span>
        <span className="truncate text-xs text-muted-foreground">{email.snippet}</span>
      </button>
    </li>
  )
}

function EmailDetailView({
  email,
}: {
  email: import("@/hooks/use-emails").EmailDetail
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-8 py-8">
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">
        {email.subject || "(no subject)"}
      </h2>
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

function EmptyList({ isSearching }: { isSearching: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} className="size-8 text-muted-foreground" />
      <p className="text-sm font-medium text-foreground">
        {isSearching ? "No matching emails" : "No emails yet"}
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
