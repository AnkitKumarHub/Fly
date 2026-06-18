export type CommandIntent =
  | "search_emails"
  | "draft_email"
  | "send_email"
  | "create_event"
  | "create_event_and_send_email"

export interface NavigationTarget {
  path: string
  query?: Record<string, string>
}

export interface MissingField {
  key: string
  label: string
}

export type CommandPreview =
  | {
      kind: "email"
      action: "draft_email" | "send_email"
      to: string
      subject: string
      body: string
    }
  | {
      kind: "event"
      title: string
      startDateTime: string
      endDateTime: string
      attendees: string[]
      description?: string
    }
  | {
      kind: "combined"
      event: {
        kind: "event"
        title: string
        startDateTime: string
        endDateTime: string
        attendees: string[]
        description?: string
      }
      email: {
        to: string
        subject: string
        body: string
      }
    }

export type CommandResult =
  | {
      kind: "search_emails"
      query: string
      items: Array<{
        id: string
        from?: string
        subject?: string
        snippet?: string
        isUnread?: boolean
      }>
      navigation?: NavigationTarget
    }
  | {
      kind: "draft_email"
      to: string
      subject: string
      draftId?: string
      messageId?: string
      navigation?: NavigationTarget
    }
  | {
      kind: "send_email"
      to: string
      subject: string
      messageId?: string
      navigation?: NavigationTarget
    }
  | {
      kind: "create_event"
      eventId: string
      title: string
      startDateTime: string
      endDateTime: string
      navigation?: NavigationTarget
    }
  | {
      kind: "create_event_and_send_email"
      eventId: string
      title: string
      to: string
      subject: string
      messageId?: string
      partialFailure?: {
        stage: "email"
        message: string
      }
      navigation?: NavigationTarget
    }

export type CommandResolveResponse =
  | {
      status: "blocked"
      message: string
      redirectPath?: string
    }
  | {
      status: "needs_input"
      intent: CommandIntent
      title: string
      message: string
      missingFields: MissingField[]
      continuationToken: string
      preview?: CommandPreview
    }
  | {
      status: "needs_confirmation"
      intent: CommandIntent
      title: string
      message: string
      preview: CommandPreview
      confirmationToken: string
    }
  | {
      status: "result"
      intent: CommandIntent
      title: string
      message: string
      result: CommandResult
    }

export interface CommandConfirmResponse {
  status: "result"
  intent: CommandIntent
  title: string
  message: string
  result: CommandResult
}
