"use client"

import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Mail01Icon,
  Calendar03Icon,
  PencilEdit01Icon,
  Add01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"
import { QUICK_PROMPTS } from "@/lib/agent-config"
import { cn } from "@/lib/utils"
import {
  chatDuration,
  chatTransition,
  promptContainerVariants,
  promptItemVariants,
  welcomeIconVariants,
} from "./chat-motion"

const ICON_MAP = {
  mail: Mail01Icon,
  calendar: Calendar03Icon,
  compose: PencilEdit01Icon,
  event: Add01Icon,
}

interface ChatWelcomeProps {
  onPromptClick: (prompt: string) => void
  disabled?: boolean
  reducedMotion: boolean
}

export function ChatWelcome({ onPromptClick, disabled, reducedMotion }: ChatWelcomeProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 md:px-8 md:py-14">
      {/* Sparkle + greeting */}
      <motion.div
        initial={reducedMotion ? false : "initial"}
        animate="animate"
        variants={welcomeIconVariants}
        className="mb-5 flex flex-col items-center gap-4"
      >
        <motion.div
          animate={
            reducedMotion
              ? undefined
              : {
                  opacity: [0.35, 0.55, 0.35],
                  scale: [1, 1.04, 1],
                }
          }
          transition={
            reducedMotion
              ? undefined
              : {
                  duration: chatDuration.breathe,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
          className="flex size-14 items-center justify-center rounded-2xl bg-muted/40 text-muted-foreground/50"
        >
          <HugeiconsIcon icon={SparklesIcon} strokeWidth={1.5} className="size-7" />
        </motion.div>

        <p className="text-center text-[15px] text-muted-foreground/80">
          How can I help you today?
        </p>
      </motion.div>

      {/* Suggestion cards */}
      <motion.div
        initial={reducedMotion ? false : "hidden"}
        animate="show"
        variants={promptContainerVariants}
        className="grid w-full max-w-xl grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3"
      >
        {QUICK_PROMPTS.map((p) => {
          const Icon = ICON_MAP[p.icon]
          return (
            <motion.button
              key={p.id}
              type="button"
              variants={promptItemVariants}
              initial={reducedMotion ? false : "hidden"}
              animate="show"
              whileHover={reducedMotion ? undefined : { y: -2 }}
              whileTap={reducedMotion ? undefined : { scale: 0.985 }}
              transition={chatTransition(reducedMotion, chatDuration.normal)}
              onClick={() => onPromptClick(p.prompt)}
              disabled={disabled}
              className={cn(
                "group flex items-center gap-3 rounded-xl border border-border/60 bg-background/50 px-4 py-3.5 text-left",
                "transition-colors duration-200 hover:border-border hover:bg-muted/30",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
                "disabled:pointer-events-none disabled:opacity-50",
              )}
            >
              <div className="flex w-full items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground transition-colors group-hover:bg-muted/80 group-hover:text-foreground/70">
                  <HugeiconsIcon icon={Icon} strokeWidth={2} className="size-3.5" />
                </div>
                <span className="text-[13px] leading-snug text-foreground/75 group-hover:text-foreground/90">
                  {p.label}
                </span>
              </div>
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}
