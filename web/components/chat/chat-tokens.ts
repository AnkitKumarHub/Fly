import type { QuickPromptAccent } from "@/lib/agent-config"

export const PROMPT_ACCENTS: Record<
  QuickPromptAccent,
  { bg: string; text: string; border: string }
> = {
  sky: {
    bg: "bg-[#D6E9FF]",
    text: "text-[#1e3a5f]",
    border: "border-[#b8d4f5]/80",
  },
  sage: {
    bg: "bg-[#D1F8E1]",
    text: "text-[#1a3d2e]",
    border: "border-[#b0e8c8]/80",
  },
  amber: {
    bg: "bg-[#FFEAD2]",
    text: "text-[#5c3d1e]",
    border: "border-[#f0d4b0]/80",
  },
  violet: {
    bg: "bg-[#EDE4F7]",
    text: "text-[#3d2e5c]",
    border: "border-[#d4c4eb]/80",
  },
}
