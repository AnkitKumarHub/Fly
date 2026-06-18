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
import { CalendarViewSwitcher } from "@/components/calendar/calendar-view-switcher"
import type { CalendarView } from "@/components/calendar/calendar-utils"
import {
  calendarDuration,
  calendarTransition,
  navButtonTap,
} from "@/components/calendar/calendar-motion"

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
    <div className="shrink-0 border-b border-border/60 px-4 pb-4 pt-5 md:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <header className="min-w-0 space-y-0.5">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Calendar</h1>
          <motion.p
            key={title}
            initial={reducedMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={calendarTransition(reducedMotion, calendarDuration.normal)}
            className="text-sm text-muted-foreground"
          >
            {title}
          </motion.p>
          {isLoading ? (
            <motion.p
              animate={reducedMotion ? undefined : { opacity: [0.4, 0.85, 0.4] }}
              transition={
                reducedMotion
                  ? undefined
                  : { repeat: Infinity, duration: 1.8, ease: "easeInOut" }
              }
              className="text-xs text-muted-foreground"
            >
              Loading events…
            </motion.p>
          ) : isSearching ? (
            <p className="text-xs text-muted-foreground">Showing search results</p>
          ) : null}
        </header>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-0.5 rounded-xl bg-muted/50 p-0.5">
            <motion.div whileTap={reducedMotion ? undefined : navButtonTap}>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onPrevious}
                aria-label="Previous"
                className="rounded-lg text-muted-foreground hover:bg-card hover:text-foreground"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4" />
              </Button>
            </motion.div>
            <motion.div whileTap={reducedMotion ? undefined : navButtonTap}>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToday}
                className="rounded-lg px-3 text-muted-foreground hover:bg-card hover:text-foreground"
              >
                Today
              </Button>
            </motion.div>
            <motion.div whileTap={reducedMotion ? undefined : navButtonTap}>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onNext}
                aria-label="Next"
                className="rounded-lg text-muted-foreground hover:bg-card hover:text-foreground"
              >
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
              </Button>
            </motion.div>
          </div>

          <motion.div whileTap={reducedMotion ? undefined : navButtonTap}>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={onSync}
              disabled={isSyncing}
              aria-label={isSyncing ? "Syncing calendar" : "Sync calendar"}
              className="rounded-xl border-border/60 text-muted-foreground hover:text-foreground"
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
            </Button>
          </motion.div>

          <motion.div whileTap={reducedMotion ? undefined : { scale: 0.98 }}>
            <Button size="sm" onClick={onCreate} className="rounded-xl px-4">
              <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
              Add event
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={onSearchSubmit} className="relative min-w-0 flex-1 sm:max-w-sm">
          <HugeiconsIcon
            icon={SearchIcon}
            strokeWidth={2}
            className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search events..."
            className="h-9 rounded-full border-border/50 bg-muted/30 pl-10 shadow-none dark:bg-muted/20"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </form>

        <div className="shrink-0 sm:ml-auto">
          <CalendarViewSwitcher
            view={view}
            reducedMotion={reducedMotion}
            onViewChange={onViewChange}
          />
        </div>
      </div>
    </div>
  )
}
