/**
 * Frontend display constants for the AI Agent chat.
 *
 * These are DISPLAY HINTS only — actual enforcement happens on the backend.
 * Keep in sync with server/src/modules/agent/config.ts when values change.
 */
export const AGENT_UI = {
  /** Daily request cap — shown in "X messages remaining" UI */
  DAILY_LIMIT: 5,

  /** Max characters the textarea accepts (mirrors backend MAX_MESSAGE_LENGTH) */
  MAX_MESSAGE_LENGTH: 2000,

  /** Max messages shown before "Start a new chat" suggestion appears */
  MAX_MESSAGES: 20,

  /** Backend streaming endpoint */
  CHAT_ENDPOINT: "/agent/chat",
} as const

/** The 4 quick-action prompts shown on the welcome screen */
export const QUICK_PROMPTS = [
  {
    id: "calendar-today",
    label: "What's on my calendar today?",
    hint: "See today's schedule at a glance",
    prompt: "What events do I have on my calendar today?",
    icon: "calendar",
    accent: "sky",
  },
  {
    id: "unread-emails",
    label: "Summarize unread emails",
    hint: "Focus on what needs your attention",
    prompt: "Summarize my most important unread emails",
    icon: "mail",
    accent: "sage",
  },
  {
    id: "draft-reply",
    label: "Draft a reply",
    hint: "Respond to your latest message",
    prompt: "Help me draft a reply to my latest email",
    icon: "compose",
    accent: "amber",
  },
  {
    id: "schedule-meeting",
    label: "Schedule a meeting",
    hint: "Book 30 minutes for tomorrow",
    prompt: "Help me schedule a 30-minute meeting tomorrow",
    icon: "event",
    accent: "violet",
  },
] as const

export type QuickPromptId = (typeof QUICK_PROMPTS)[number]["id"]
export type QuickPromptAccent = (typeof QUICK_PROMPTS)[number]["accent"]
