"use client"

import { useState } from "react"
import { toast } from "sonner"
import { isAxiosError } from "axios"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useCreateDraft, useSendEmail } from "@/hooks/use-emails"

interface ComposeSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ComposeSheet({ open, onOpenChange }: ComposeSheetProps) {
  const [to, setTo] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")

  const sendEmail = useSendEmail()
  const createDraft = useCreateDraft()

  function reset() {
    setTo("")
    setSubject("")
    setBody("")
  }

  function getError(error: unknown, fallback: string) {
    if (isAxiosError(error)) {
      return error.response?.data?.message ?? fallback
    }
    return fallback
  }

  function handleSend() {
    sendEmail.mutate(
      { to, subject, body },
      {
        onSuccess: () => {
          toast.success("Email sent")
          reset()
          onOpenChange(false)
        },
        onError: (error) => toast.error(getError(error, "Failed to send email")),
      },
    )
  }

  function handleSaveDraft() {
    createDraft.mutate(
      { to, subject, body },
      {
        onSuccess: () => {
          toast.success("Draft saved")
          reset()
          onOpenChange(false)
        },
        onError: (error) => toast.error(getError(error, "Failed to save draft")),
      },
    )
  }

  const isBusy = sendEmail.isPending || createDraft.isPending

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>New message</SheetTitle>
          <SheetDescription>Compose and send an email or save it as a draft.</SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="compose-to">To</Label>
            <Input
              id="compose-to"
              type="email"
              placeholder="recipient@example.com"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="compose-subject">Subject</Label>
            <Input
              id="compose-subject"
              placeholder="Subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="compose-body">Message</Label>
            <Textarea
              id="compose-body"
              placeholder="Write your message..."
              className="min-h-48 flex-1"
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />
          </div>
        </div>

        <SheetFooter className="flex-row justify-end gap-2">
          <Button variant="outline" onClick={handleSaveDraft} disabled={isBusy || !to}>
            {createDraft.isPending ? "Saving..." : "Save draft"}
          </Button>
          <Button onClick={handleSend} disabled={isBusy || !to}>
            {sendEmail.isPending ? "Sending..." : "Send"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
