import { cookies } from "next/headers"

export interface CurrentUser {
  firstName: string
  lastName: string | null
  email: string
}

export async function hasAuthSession(): Promise<boolean> {
  const cookieStore = await cookies()

  return cookieStore.has("access_token") || cookieStore.has("refresh_token")
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.toString()

  if (!cookieHeader) return null

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, {
      headers: { Cookie: cookieHeader },
      cache: "no-store",
    })

    if (!res.ok) return null

    const data = await res.json()
    return data.data
  } catch {
    return null
  }
}
