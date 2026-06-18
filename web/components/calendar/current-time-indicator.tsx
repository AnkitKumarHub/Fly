"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"

import { HOUR_HEIGHT } from "@/components/calendar/calendar-utils"
import { calendarDuration, calendarTransition } from "@/components/calendar/calendar-motion"

type CurrentTimeIndicatorProps = {
  reducedMotion: boolean
}

export function CurrentTimeIndicator({ reducedMotion }: CurrentTimeIndicatorProps) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(interval)
  }, [])

  const top = ((now.getHours() * 60 + now.getMinutes()) / 60) * HOUR_HEIGHT

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute right-0 left-0 z-20 flex items-center"
      style={{ top }}
      initial={reducedMotion ? false : { opacity: 0, scaleX: 0.6 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={calendarTransition(reducedMotion, calendarDuration.normal)}
    >
      <motion.span
        className="ml-[-4px] size-2 shrink-0 rounded-full bg-emerald-600/90 dark:bg-emerald-500/90"
        animate={reducedMotion ? undefined : { scale: [1, 1.15, 1] }}
        transition={
          reducedMotion
            ? undefined
            : { repeat: Infinity, duration: 2.4, ease: "easeInOut" }
        }
      />
      <span className="h-px flex-1 bg-emerald-600/55 dark:bg-emerald-500/45" />
    </motion.div>
  )
}
