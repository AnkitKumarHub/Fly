import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

import { getBackendUrl } from "@/lib/backend-url"

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "te",
  "trailer",
  "upgrade",
])

const SKIP_RESPONSE_HEADERS = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
])

function stripCookieDomain(setCookie: string): string {
  return setCookie.replace(/;\s*Domain=[^;]*/gi, "")
}

function getSetCookies(headers: Headers): string[] {
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie()
  }

  const raw = headers.get("set-cookie")
  return raw ? [raw] : []
}

export async function proxyToBackend(
  req: NextRequest,
  backendPath: string,
): Promise<NextResponse> {
  try {
    const backendUrl = `${getBackendUrl()}/${backendPath}${req.nextUrl.search}`

    const headers = new Headers()
    req.headers.forEach((value, key) => {
      const lower = key.toLowerCase()
      if (lower === "host" || HOP_BY_HOP_HEADERS.has(lower)) return
      headers.set(key, value)
    })

    const init: RequestInit = {
      method: req.method,
      headers,
      redirect: "manual",
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      init.body = await req.arrayBuffer()
    }

    const backendRes = await fetch(backendUrl, init)

    const responseHeaders = new Headers()
    backendRes.headers.forEach((value, key) => {
      const lower = key.toLowerCase()
      if (lower === "set-cookie" || SKIP_RESPONSE_HEADERS.has(lower)) return
      responseHeaders.set(key, value)
    })

    const response = new NextResponse(backendRes.body, {
      status: backendRes.status,
      headers: responseHeaders,
    })

    for (const cookie of getSetCookies(backendRes.headers)) {
      response.headers.append("set-cookie", stripCookieDomain(cookie))
    }

    return response
  } catch (error) {
    console.error("backend-proxy.failed:", backendPath, error)
    return NextResponse.json(
      { success: false, message: "API proxy failed" },
      { status: 500 },
    )
  }
}
