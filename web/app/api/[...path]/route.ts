import type { NextRequest } from "next/server"

import { proxyToBackend } from "@/lib/backend-proxy"

type RouteContext = { params: Promise<{ path: string[] }> }

async function handler(req: NextRequest, context: RouteContext) {
  const { path } = await context.params
  return proxyToBackend(req, path.join("/"))
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
export const OPTIONS = handler
