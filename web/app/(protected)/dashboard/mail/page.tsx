"use client"

import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { useReducedMotion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Mail01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ComposeSheet } from "@/components/compose-sheet"
import {
  IntegrationReconnectBanner,
  isIntegrationNotConnectedError,
} from "@/components/integration-reconnect-banner"
import { MailDetail } from "@/components/mail/mail-detail"
import { MailEmptyState } from "@/components/mail/mail-empty-state"
import { MailList } from "@/components/mail/mail-list"
import { MailPanels } from "@/components/mail/mail-panels"
import { MailToolbar } from "@/components/mail/mail-toolbar"
import {
  filterByFolder,
  getFolderLabel,
  type Folder,
} from "@/components/mail/mail-utils"
import { useIntegrations } from "@/hooks/use-integrations"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  useEmail,
  useEmails,
  useSearchEmails,
  useSyncInbox,
  type EmailListItem,
} from "@/hooks/use-emails"

export default function MailPage() {
  const queryClient = useQueryClient()
  const reducedMotion = useReducedMotion() ?? false
  const isMobile = useIsMobile()

  const [search, setSearch] = useState("")
  const [activeQuery, setActiveQuery] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [composeOpen, setComposeOpen] = useState(false)
  const [activeFolder, setActiveFolder] = useState<Folder>("inbox")

  const { connectedPlugins, isStatusLoading } = useIntegrations()
  const isGmailConnected = connectedPlugins.includes("gmail")

  const isSearching = activeQuery.trim().length > 0
  const listQuery = useEmails()
  const searchQuery = useSearchEmails(activeQuery)
  const syncInbox = useSyncInbox()

  const { data: allEmails = [], isLoading, error: listError } = isSearching
    ? searchQuery
    : listQuery
  const showReconnect = isIntegrationNotConnectedError(listError)
  const { data: selectedEmail, isLoading: isDetailLoading } = useEmail(selectedId)

  const folderEmails = isSearching ? allEmails : filterByFolder(allEmails, activeFolder)
  const visibleEmails = folderEmails

  const folderLabel = isSearching ? "Search results" : getFolderLabel(activeFolder)
  const listKey = `${activeFolder}-${isSearching ? activeQuery : "all"}`
  const mobileView = isMobile && selectedId ? "detail" : "list"

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
    queryClient.setQueriesData<EmailListItem[]>({ queryKey: ["emails", "search"] }, (current) =>
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

  function handleSearchChange(value: string) {
    setSearch(value)
    if (value === "") setActiveQuery("")
  }

  function handleSync() {
    syncInbox.mutate(undefined, {
      onSuccess: () => toast.success("Inbox synced"),
      onError: () => toast.error("Failed to sync inbox"),
    })
  }

  function handleFolderSelect(folder: Folder) {
    setActiveFolder(folder)
    setSelectedId(null)
    setSearch("")
    setActiveQuery("")
  }

  function handleBack() {
    setSelectedId(null)
  }

  function handleClearSearch() {
    setSearch("")
    setActiveQuery("")
  }

  if (isStatusLoading) {
    return <MailStatusSkeleton />
  }

  if (!isGmailConnected) {
    return (
      <div className="flex h-[calc(100vh-var(--header-height))] flex-col items-center justify-center gap-3 px-6 text-center">
        <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} className="size-10 text-muted-foreground" />
        <h1 className="text-xl font-semibold tracking-tight">Connect Gmail</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Connect your Gmail account to read, search, and send emails from the dashboard.
        </p>
        <Button render={<Link href="/dashboard/integrations" />}>Go to Integrations</Button>
      </div>
    )
  }

  const isListEmpty = !isLoading && visibleEmails.length === 0

  const listPanel = (
    <div className="flex min-h-0 flex-1 flex-col">
      <MailList
        emails={visibleEmails}
        selectedId={selectedId}
        isLoading={isLoading}
        listKey={listKey}
        reducedMotion={reducedMotion}
        onSelect={handleSelectEmail}
      />
    </div>
  )

  const detailPanel = (
    <MailDetail
      email={selectedEmail}
      emailId={selectedId}
      isLoading={isDetailLoading}
      reducedMotion={reducedMotion}
    />
  )

  return (
    <div className="flex h-[calc(100vh-var(--header-height))] flex-col overflow-hidden">
      <MailToolbar
        activeFolder={activeFolder}
        search={search}
        isSearching={isSearching}
        isSyncing={syncInbox.isPending}
        showBack={isMobile && !!selectedId}
        reducedMotion={reducedMotion}
        allEmails={allEmails}
        onFolderChange={handleFolderSelect}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        onSync={handleSync}
        onCompose={() => setComposeOpen(true)}
        onBack={handleBack}
      />

      {showReconnect ? (
        <div className="shrink-0 px-5 py-2 md:px-6">
          <IntegrationReconnectBanner message="Reconnect Gmail on the integrations page to continue." />
        </div>
      ) : null}

      {isListEmpty ? (
        <MailEmptyState
          folder={activeFolder}
          folderLabel={folderLabel}
          isSearching={isSearching}
          reducedMotion={reducedMotion}
          onSync={handleSync}
          onCompose={() => setComposeOpen(true)}
          onClearSearch={handleClearSearch}
        />
      ) : (
        <MailPanels
          mobileView={mobileView}
          reducedMotion={reducedMotion}
          listPanel={listPanel}
          detailPanel={detailPanel}
        />
      )}

      <ComposeSheet open={composeOpen} onOpenChange={setComposeOpen} />
    </div>
  )
}

function MailStatusSkeleton() {
  return (
    <div className="flex h-[calc(100vh-var(--header-height))] flex-col">
      <div className="flex items-center gap-3 border-b border-border/40 px-5 py-3">
        <Skeleton className="h-8 w-36 rounded-4xl" />
        <Skeleton className="h-8 flex-1 rounded-4xl" />
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-4xl" />
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="w-[360px] shrink-0 border-r border-border/40 p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="mb-2 h-14 w-full rounded-lg" />
          ))}
        </div>
        <div className="flex-1 p-10">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="mt-4 h-4 w-1/2" />
          <Skeleton className="mt-8 h-64 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}
