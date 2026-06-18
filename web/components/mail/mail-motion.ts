import type { Transition, Variants } from "motion/react"

export const mailEase = [0.25, 0.1, 0.25, 1] as const

export const mailDuration = {
  fast: 0.15,
  normal: 0.22,
  empty: 0.25,
} as const

export const listStagger = 0.03

const instant: Transition = { duration: 0 }

export function transition(reduced: boolean, duration: number): Transition {
  return reduced ? instant : { duration, ease: mailEase }
}

export const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: listStagger },
  },
}

export const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0 },
}

export const detailVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
}

export const emptyVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
}

export const panelSlideVariants: Variants = {
  initial: (direction: number) => ({ opacity: 0, x: direction * 16 }),
  animate: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -16 }),
}
