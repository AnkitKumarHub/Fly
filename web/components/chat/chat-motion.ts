import type { Transition, Variants } from "motion/react"

export const chatEase = [0.25, 0.1, 0.25, 1] as const

export const chatDuration = {
  fast: 0.14,
  normal: 0.22,
  welcome: 0.32,
  breathe: 1.2,
} as const

const instant: Transition = { duration: 0 }

export function chatTransition(reduced: boolean, duration: number): Transition {
  return reduced ? instant : { duration, ease: chatEase }
}

export const promptStagger = 0.06

export const promptContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: promptStagger, delayChildren: 0.08 },
  },
}

export const promptItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
}

export const welcomeIconVariants: Variants = {
  initial: { opacity: 0, scale: 0.92 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: chatDuration.welcome, ease: chatEase },
  },
}

export const messageVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
}

export const promptCardMotion = {
  idle: { y: 0, boxShadow: "0 0 0 rgba(0,0,0,0)" },
  hover: { y: -2, boxShadow: "0 4px 14px rgba(0,0,0,0.04)" },
  tap: { scale: 0.985, y: 0 },
}

export const sendButtonTap = { scale: 0.92 }
