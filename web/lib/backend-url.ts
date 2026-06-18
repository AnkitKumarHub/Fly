/** Client-visible API base — same-origin `/api` proxy in production, direct backend in local dev. */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL ?? "/api"
}

/** Server-only Railway/backend origin for the Next.js BFF proxy. */
export function getBackendUrl(): string {
  const url = process.env.BACKEND_URL
  if (!url) {
    throw new Error("BACKEND_URL is not configured")
  }
  return url.replace(/\/$/, "")
}
