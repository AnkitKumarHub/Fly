import type { Transition, Variants } from "motion/react"

export const calendarEase = [0.25, 0.1, 0.25, 1] as const

export const calendarDuration = {
  fast: 0.14,
  normal: 0.22,
  view: 0.28,
} as const

const instant: Transition = { duration: 0 }

export function calendarTransition(reduced: boolean, duration: number): Transition {
  return reduced ? instant : { duration, ease: calendarEase }
}

export const viewVariants: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
}

export const dayCardVariants: Variants = {
  idle: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.97 },
}

export const eventPillVariants: Variants = {
  idle: { scale: 1, y: 0 },
  hover: { scale: 1.01, y: -1 },
  tap: { scale: 0.98 },
}

export const gridStagger = 0.018

export const monthCellVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
}
