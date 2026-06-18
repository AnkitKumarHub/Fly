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
} as const;

/** The 4 quick-action prompts shown on the welcome screen */
export const QUICK_PROMPTS = [
  {
    id: "unread-emails",
    label: "Show my unread emails",
    description: "See your latest inbox",
    prompt: "Show me my latest unread emails",
    icon: "mail",
  },
  {
    id: "schedule-today",
    label: "What's on today?",
    description: "Check your calendar",
    prompt: "What events do I have on my calendar today?",
    icon: "calendar",
  },
  {
    id: "draft-email",
    label: "Draft an email",
    description: "Write & send a message",
    prompt: "Help me draft and send an email",
    icon: "compose",
  },
  {
    id: "schedule-meeting",
    label: "Schedule a meeting",
    description: "Create a calendar event",
    prompt: "Help me create a new calendar event",
    icon: "event",
  },
] as const;

export type QuickPromptId = (typeof QUICK_PROMPTS)[number]["id"];
