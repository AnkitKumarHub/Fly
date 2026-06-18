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
    <div className="shrink-0 border-b border-border/60 bg-[#F7F7F6]/80 px-4 pb-5 pt-6 dark:bg-muted/15 md:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <header className="min-w-0 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Calendar</h1>
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
              className="text-xs text-muted-foreground/80"
            >
              Loading events…
            </motion.p>
          ) : isSearching ? (
            <p className="text-xs text-muted-foreground/80">Showing search results</p>
          ) : null}
        </header>

        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <CalendarViewSwitcher
            view={view}
            reducedMotion={reducedMotion}
            onViewChange={onViewChange}
          />

          <div className="flex items-center gap-0.5 rounded-full border border-border/60 bg-card/80 p-0.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <motion.div whileTap={reducedMotion ? undefined : navButtonTap}>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onPrevious}
                aria-label="Previous"
                className="rounded-full text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4" />
              </Button>
            </motion.div>
            <motion.div whileTap={reducedMotion ? undefined : navButtonTap}>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToday}
                className="rounded-full px-3 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
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
                className="rounded-full text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              >
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4" />
              </Button>
            </motion.div>
          </div>

          <div className="flex items-center gap-1.5">
            <motion.div whileTap={reducedMotion ? undefined : navButtonTap}>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={onSync}
                disabled={isSyncing}
                aria-label={isSyncing ? "Syncing calendar" : "Sync calendar"}
                className="rounded-full border-border/60 bg-card text-muted-foreground hover:bg-muted/40 hover:text-foreground"
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

            <motion.div whileTap={reducedMotion ? undefined : { scale: 0.97 }}>
              <Button
                size="sm"
                onClick={onCreate}
                className="rounded-full bg-foreground px-4 text-background hover:bg-foreground/90"
              >
                <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-4" />
                Add event
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      <form onSubmit={onSearchSubmit} className="relative mt-4 max-w-sm">
        <HugeiconsIcon
          icon={SearchIcon}
          strokeWidth={2}
          className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70"
        />
        <Input
          placeholder="Search events…"
          className="h-9 rounded-full border-border/50 bg-card pl-10 shadow-[0_1px_2px_rgba(0,0,0,0.03)] focus-visible:ring-emerald-600/20"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </form>
    </div>
  )
}
