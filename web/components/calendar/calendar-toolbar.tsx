"use client"

import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  RefreshIcon,
  SearchIcon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { CalendarViewSwitcher } from "@/components/calendar/calendar-view-switcher"
import type { CalendarView } from "@/components/calendar/calendar-utils"
import { calendarDuration, calendarTransition } from "@/components/calendar/calendar-motion"

type CalendarToolbarProps = {
  title: string
  view: CalendarView
  search: string
  isSearching: boolean
  isLoading: boolean
  isSyncing: boolean
  reducedMotion: boolean
  onViewChange: (view: CalendarView) => void
  onSearchChange: (value: string) => void
  onSearchSubmit: (event: React.FormEvent) => void
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
  onSync: () => void
  onCreate: () => void
}

export function CalendarToolbar({
  title,
  view,
  search,
  isSearching,
  isLoading,
  isSyncing,
  reducedMotion,
  onViewChange,
  onSearchChange,
  onSearchSubmit,
  onPrevious,
  onNext,
  onToday,
  onSync,
  onCreate,
}: CalendarToolbarProps) {
  return (
    <div className="shrink-0 space-y-3 border-b border-border/60 px-4 pb-4 pt-5 md:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="min-w-0">
          <motion.h1
            key={title}
            initial={reducedMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={calendarTransition(reducedMotion, calendarDuration.normal)}
            className="text-2xl font-semibold tracking-tight text-foreground"
          >
            {title}
          </motion.h1>
          {isLoading ? (
            <motion.p
              animate={reducedMotion ? undefined : { opacity: [0.45, 1, 0.45] }}
              transition={
                reducedMotion
                  ? undefined
                  : { repeat: Infinity, duration: 1.8, ease: "easeInOut" }
              }
              className="mt-1 text-xs text-muted-foreground"
            >
              Loading your calendar...
            </motion.p>
          ) : isSearching ? (
            <p className="mt-1 text-xs text-muted-foreground">Showing search results</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <CalendarViewSwitcher
            view={view}
            reducedMotion={reducedMotion}
            onViewChange={onViewChange}
          />

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onPrevious}
              aria-label="Previous"
              className="rounded-xl bg-muted/50 text-muted-foreground hover:bg-muted"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToday}
              className="rounded-xl bg-muted/50 px-3 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onNext}
              aria-label="Next"
              className="rounded-xl bg-muted/50 text-muted-foreground hover:bg-muted"
            >
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
            </Button>
          </div>

          <motion.div whileTap={reducedMotion ? undefined : { scale: 0.98 }}>
            <Button size="sm" onClick={onCreate} className="rounded-xl px-4">
              <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
              Add event
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <form onSubmit={onSearchSubmit} className="relative min-w-0 flex-1 sm:max-w-sm">
          <HugeiconsIcon
            icon={SearchIcon}
            strokeWidth={2}
            className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search events..."
            className="h-9 rounded-full border-border/40 bg-muted/30 pl-10 shadow-none"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </form>

        <Button
          variant="ghost"
          size="sm"
          onClick={onSync}
          disabled={isSyncing}
          className={cn("rounded-full text-muted-foreground", "sm:ml-auto")}
        >
          <motion.span
            animate={isSyncing && !reducedMotion ? { rotate: 360 } : { rotate: 0 }}
            transition={
              isSyncing ? { repeat: Infinity, duration: 1, ease: "linear" } : { duration: 0 }
            }
            className="inline-flex"
          >
            <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} className="size-4" />
          </motion.span>
          {isSyncing ? "Syncing..." : "Sync"}
        </Button>
      </div>
    </div>
  )
}
