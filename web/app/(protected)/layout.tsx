import { redirect } from "next/navigation"

import { hasAuthSession } from "@/lib/auth"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const hasSession = await hasAuthSession()

  if (!hasSession) {
    redirect("/login")
  }

  return <>{children}</>
}
