import type { Transition, Variants } from "motion/react"

export const dashboardEase = [0.25, 0.1, 0.25, 1] as const

export const dashboardDuration = {
  fast: 0.14,
  normal: 0.22,
} as const

export const dashboardStagger = 0.04

const instant: Transition = { duration: 0 }

export function dashboardTransition(reduced: boolean, duration: number): Transition {
  return reduced ? instant : { duration, ease: dashboardEase }
}

export const greetingVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
}

export const cardContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: dashboardStagger, delayChildren: 0.06 },
  },
}

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}
