import type { Transition, Variants } from "motion/react"

export const calendarEase = [0.25, 0.1, 0.25, 1] as const

export const calendarDuration = {
  fast: 0.14,
  normal: 0.22,
  view: 0.28,
  breathe: 0.9,
} as const

const instant: Transition = { duration: 0 }

export function calendarTransition(reduced: boolean, duration: number): Transition {
  return reduced ? instant : { duration, ease: calendarEase }
}

export const viewVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
}

export const dayCardVariants: Variants = {
  idle: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -1 },
  tap: { scale: 0.98, y: 0 },
}

export const eventPillVariants: Variants = {
  idle: { scale: 1, y: 0 },
  hover: { scale: 1.015, y: -1 },
  tap: { scale: 0.985 },
}

export const monthCellVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0 },
  hover: { y: -2 },
  tap: { scale: 0.99, y: 0 },
}

export const todayRingVariants: Variants = {
  initial: { scale: 0.92, opacity: 0.5 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { duration: calendarDuration.breathe, ease: calendarEase },
  },
}

export const gridStagger = 0.012

export const navButtonTap = { scale: 0.94 }
