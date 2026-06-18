import type { EmailListItem } from "@/hooks/use-emails"

export type Folder = "inbox" | "sent" | "drafts" | "spam" | "trash"
export type Category = "all" | "primary" | "social" | "promotions" | "updates"

export const FOLDER_LABEL: Record<Folder, string> = {
  inbox: "INBOX",
  sent: "SENT",
  drafts: "DRAFT",
  spam: "SPAM",
  trash: "TRASH",
}

export const CATEGORY_LABEL: Record<Exclude<Category, "all">, string> = {
  primary: "CATEGORY_PRIMARY",
  social: "CATEGORY_SOCIAL",
  promotions: "CATEGORY_PROMOTIONS",
  updates: "CATEGORY_UPDATES",
}

export const FOLDERS: { id: Folder; label: string }[] = [
  { id: "inbox", label: "Inbox" },
  { id: "sent", label: "Sent" },
  { id: "drafts", label: "Drafts" },
  { id: "spam", label: "Spam" },
  { id: "trash", label: "Trash" },
]

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "primary", label: "Primary" },
  { id: "social", label: "Social" },
  { id: "promotions", label: "Promotions" },
  { id: "updates", label: "Updates" },
]

export function hasLabel(email: EmailListItem, label: string) {
  return email.labelIds?.includes(label) ?? false
}

export function filterByFolder(emails: EmailListItem[], folder: Folder) {
  const label = FOLDER_LABEL[folder]
  return emails.filter((e) => hasLabel(e, label))
}

export function filterByCategory(emails: EmailListItem[], category: Category) {
  if (category === "all") return emails
  return emails.filter((e) => hasLabel(e, CATEGORY_LABEL[category]))
}

export function formatSender(raw?: string) {
  if (!raw) return "Unknown sender"
  const match = raw.match(/^(.*?)</)
  const name = match?.[1]?.trim().replace(/"/g, "")
  return name && name.length > 0 ? name : raw
}

export function formatDate(internalDate?: string) {
  if (!internalDate) return ""
  const timestamp = Number(internalDate)
  if (Number.isNaN(timestamp)) return ""
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function getFolderLabel(folder: Folder) {
  return FOLDERS.find((f) => f.id === folder)?.label ?? "Inbox"
}

export function getInboxUnreadCount(emails: EmailListItem[]) {
  return emails.filter((e) => hasLabel(e, "INBOX") && e.isUnread).length
}
