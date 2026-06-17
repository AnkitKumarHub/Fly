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

export function createRateLimitMiddleware(options: RateLimitOptions) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const clientIp = getClientIp(req);
    const key = `${options.namespace}:${clientIp}`;

    pruneExpiredBuckets(now);

    const existingBucket = rateLimitBuckets.get(key);
    if (!existingBucket || existingBucket.resetAt <= now) {
      rateLimitBuckets.set(key, {
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
      console.warn("auth.rate_limit_exceeded", {
        ip: clientIp,
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
  };
}
