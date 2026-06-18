"use client"

import { AnimatePresence, motion } from "motion/react"
import type { ReactNode } from "react"

import { panelSlideVariants, transition, mailDuration } from "@/components/mail/mail-motion"

type MailPanelsProps = {
  mobileView: "list" | "detail"
  reducedMotion: boolean
  listPanel: ReactNode
  detailPanel: ReactNode
}

export function MailPanels({
  mobileView,
  reducedMotion,
  listPanel,
  detailPanel,
}: MailPanelsProps) {
  return (
    <>
      <div className="hidden min-h-0 flex-1 md:flex">
        <div className="flex w-[360px] shrink-0 flex-col border-r border-border/40 bg-card/40">
          {listPanel}
        </div>
        <div className="min-w-0 flex-1 overflow-y-auto">{detailPanel}</div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden md:hidden">
        <AnimatePresence mode="wait" initial={false}>
          {mobileView === "list" ? (
            <motion.div
              key="list"
              custom={1}
              initial={reducedMotion ? false : "initial"}
              animate="animate"
              exit="exit"
              variants={reducedMotion ? undefined : panelSlideVariants}
              transition={transition(reducedMotion, mailDuration.normal)}
              className="absolute inset-0 flex flex-col bg-card/40"
            >
              {listPanel}
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              custom={-1}
              initial={reducedMotion ? false : "initial"}
              animate="animate"
              exit="exit"
              variants={reducedMotion ? undefined : panelSlideVariants}
              transition={transition(reducedMotion, mailDuration.normal)}
              className="absolute inset-0 overflow-y-auto"
            >
              {detailPanel}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
