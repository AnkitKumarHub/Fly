import type { NextFunction, Request, Response } from "express";

import { ApiError, sendErrorResponse } from "../common/utils/api-error.js";

interface RateLimitOptions {
  max: number;
  namespace: string;
  windowMs: number;
}

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const rateLimitBuckets = new Map<string, RateLimitBucket>();

function getClientIp(req: Request): string {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string") {
    return forwardedFor.split(",")[0]!.trim();
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0]!.trim();
  }

  return req.ip || "unknown";
}

function pruneExpiredBuckets(now: number) {
  if (rateLimitBuckets.size < 1000) {
    return;
  }

  for (const [key, bucket] of rateLimitBuckets.entries()) {
    if (bucket.resetAt <= now) {
      rateLimitBuckets.delete(key);
    }
  }
}

function applyRateLimit(
  req: Request,
  res: Response,
  next: NextFunction,
  options: RateLimitOptions,
  bucketKey: string,
): void {
  const now = Date.now();

  pruneExpiredBuckets(now);

  const existingBucket = rateLimitBuckets.get(bucketKey);
  if (!existingBucket || existingBucket.resetAt <= now) {
    rateLimitBuckets.set(bucketKey, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    next();
    return;
  }

  if (existingBucket.count >= options.max) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((existingBucket.resetAt - now) / 1000),
    );

    res.setHeader("Retry-After", retryAfterSeconds.toString());
    console.warn("rate_limit_exceeded", {
      key: bucketKey,
      max: options.max,
      namespace: options.namespace,
      path: req.originalUrl,
    });
    sendErrorResponse(
      res,
      ApiError.tooManyRequests("Too many requests", "rate_limit_exceeded"),
    );
    return;
  }

  existingBucket.count += 1;
  next();
}

/** IP-based rate limiter — for public/unauthenticated routes */
export function createRateLimitMiddleware(options: RateLimitOptions) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIp = getClientIp(req);
    const key = `${options.namespace}:${clientIp}`;
    applyRateLimit(req, res, next, options, key);
  };
}

/** User-ID-based rate limiter — for authenticated routes (AI agent).
 *  Keying on userId means rotating IPs don't bypass limits, and shared
 *  NAT users each get their own independent bucket. */
export function createUserRateLimitMiddleware(options: RateLimitOptions) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userId = req.user?.id;
    if (!userId) {
      // No user means auth middleware should have blocked — fail safe
      sendErrorResponse(res, ApiError.unauthorized("Authentication required", "authentication_required"));
      return;
    }
    const key = `${options.namespace}:${userId}`;
    applyRateLimit(req, res, next, options, key);
  };
}

