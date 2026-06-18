"use client"

import { AnimatePresence, motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Mail01Icon, StarIcon } from "@hugeicons/core-free-icons"

import { Skeleton } from "@/components/ui/skeleton"
import type { EmailDetail } from "@/hooks/use-emails"
import { detailVariants, emptyVariants, transition, mailDuration } from "@/components/mail/mail-motion"

type MailDetailProps = {
  email: EmailDetail | null | undefined
  emailId: string | null
  isLoading: boolean
  reducedMotion: boolean
}

export function MailDetail({ email, emailId, isLoading, reducedMotion }: MailDetailProps) {
  if (!emailId) {
    return <MailEmptyDetail reducedMotion={reducedMotion} />
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 px-8 py-10">
        <Skeleton className="h-7 w-2/3 rounded-lg" />
        <Skeleton className="h-4 w-1/2 rounded-lg" />
        <Skeleton className="mt-6 h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (!email) return null

  const isStarred = email.labelIds?.includes("STARRED")

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={email.id ?? emailId}
        initial={reducedMotion ? false : "initial"}
        animate="animate"
        exit="exit"
        variants={reducedMotion ? undefined : detailVariants}
        transition={transition(reducedMotion, mailDuration.normal)}
        className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-8 md:px-10 md:py-10"
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-medium tracking-tight text-foreground/85 md:text-2xl">
              {email.subject || "(no subject)"}
            </h2>
            {isStarred ? (
              <HugeiconsIcon
                icon={StarIcon}
                strokeWidth={2}
                className="mt-1 size-4 shrink-0 text-muted-foreground"
              />
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground/75">
            {email.from}
            {email.to ? ` · to ${email.to}` : null}
            {email.date ? ` · ${email.date}` : null}
          </p>
        </div>

        <div className="rounded-2xl bg-muted/20 p-1">
          {email.bodyHtml ? (
            <iframe
              title="email-body"
              sandbox=""
              className="min-h-[55vh] w-full rounded-xl bg-card"
              srcDoc={email.bodyHtml}
            />
          ) : (
            <pre className="whitespace-pre-wrap break-words px-4 py-5 font-sans text-sm leading-relaxed text-foreground/90">
              {email.bodyText || email.snippet}
            </pre>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

function MailEmptyDetail({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <motion.div
      initial={reducedMotion ? false : "initial"}
      animate="animate"
      variants={reducedMotion ? undefined : emptyVariants}
      transition={transition(reducedMotion, mailDuration.empty)}
      className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center"
    >
      <span className="flex size-14 items-center justify-center rounded-2xl bg-muted/40">
        <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} className="size-6 text-muted-foreground/60" />
      </span>
      <p className="text-sm text-muted-foreground/70">Select an email to read it</p>
    </motion.div>
  )
}
