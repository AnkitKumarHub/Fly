import axios, { isAxiosError, type InternalAxiosRequestConfig } from "axios"

import { getApiBaseUrl } from "@/lib/backend-url"

const API_BASE_URL = getApiBaseUrl()
const AUTH_REFRESH_EVENT = "auth:session-expired"
const AUTH_EXCLUDED_PATHS = new Set(["/auth/refresh", "/auth/sign-in", "/auth/sign-out"])
const AUTH_REDIRECT_PATHS = ["/login", "/signup"]

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
  skipAuthRefresh?: boolean
}

let refreshPromise: Promise<void> | null = null
let authRedirectInFlight = false

function getRequestPath(url?: string) {
  if (!url) return ""
  if (url.startsWith("/")) return url.split("?")[0]

  try {
    return new URL(url).pathname
  } catch {
    return url
  }
}

function shouldSkipAuthRefresh(config?: RetryableRequestConfig) {
  if (!config) return true
  if (config.skipAuthRefresh) return true

  return AUTH_EXCLUDED_PATHS.has(getRequestPath(config.url))
}

function handleExpiredSession() {
  if (typeof window === "undefined") return

  window.dispatchEvent(new Event(AUTH_REFRESH_EVENT))

  if (
    authRedirectInFlight ||
    AUTH_REDIRECT_PATHS.some((path) => window.location.pathname.startsWith(path))
  ) {
    return
  }

  authRedirectInFlight = true
  window.location.assign("/login")
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = api
      .post("/auth/refresh", undefined, {
        skipAuthRefresh: true,
      } as RetryableRequestConfig)
      .then(() => undefined)
      .catch((error) => {
        handleExpiredSession()
        throw error
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!isAxiosError(error)) {
      return Promise.reject(error)
    }

    const originalRequest = error.config as RetryableRequestConfig | undefined

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      shouldSkipAuthRefresh(originalRequest)
    ) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      await refreshAccessToken()
      return api(originalRequest)
    } catch (refreshError) {
      return Promise.reject(refreshError)
    }
  },
)
