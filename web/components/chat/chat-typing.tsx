"use client"

export function ChatTyping() {
  return (
    <div className="flex items-center gap-1 px-1 py-2">
      <span className="text-xs text-muted-foreground mr-1">Fly is thinking</span>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-primary/60 animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: "900ms" }}
        />
      ))}
    </div>
  )
}
