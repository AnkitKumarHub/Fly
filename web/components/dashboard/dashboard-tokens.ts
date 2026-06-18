/** Muted dashboard surfaces — neutral base, accent only on small details */
export const dashboardTokens = {
  page: "flex min-h-0 flex-1 flex-col overflow-y-auto",
  header: "shrink-0 border-b border-border/40 px-6 py-8 md:px-10 md:py-10 lg:px-12",
  body: "flex flex-1 flex-col px-6 py-8 md:px-10 md:py-10 lg:px-12",
  grid: "grid min-h-0 flex-1 gap-6 lg:grid-cols-2 lg:gap-8",
  card: "flex min-h-[min(22rem,52vh)] flex-col rounded-2xl border border-border/50 bg-card/30 p-6 lg:p-8",
  cardIcon: "flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground",
  countBadge:
    "rounded-md bg-muted/70 px-2.5 py-1 text-xs font-medium tabular-nums text-muted-foreground",
  row: "rounded-xl border border-border/40 bg-background/40 px-4 py-3.5 transition-colors hover:border-border hover:bg-muted/20",
  rowDot: "size-1.5 shrink-0 rounded-full bg-muted-foreground/50",
  footerLink: "inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
  actionPill:
    "inline-flex items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-border/50 hover:bg-muted/30 hover:text-foreground",
  statText: "text-sm text-muted-foreground",
} as const
