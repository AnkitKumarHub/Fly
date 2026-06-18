import type { Response } from "express";

interface ApiErrorOptions {
  code?: string | undefined;
  clearCookies?: boolean | undefined;
}

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational = true;
  public readonly code?: string | undefined;
  public readonly clearCookies?: boolean | undefined;

  public constructor(statusCode: number, message: string, options?: ApiErrorOptions) {
    super(message);
    this.statusCode = statusCode;
    this.code = options?.code;
    this.clearCookies = options?.clearCookies;
    this.name = "ApiError";
    Error.captureStackTrace(this, this.constructor);
  }

  public static badRequest(message = "Bad request", code?: string): ApiError {
    return new ApiError(400, message, code ? { code } : undefined);
  }

  public static unauthorized(
    message = "You are not authorized for this",
    code?: string,
    clearCookies?: boolean,
  ): ApiError {
    const options: ApiErrorOptions = {};
    if (code) options.code = code;
    if (clearCookies) options.clearCookies = clearCookies;
    return new ApiError(401, message, Object.keys(options).length > 0 ? options : undefined);
  }

  public static forbidden(message = "Forbidden", code?: string): ApiError {
    return new ApiError(403, message, code ? { code } : undefined);
  }

  public static tooManyRequests(message = "Too many requests", code?: string): ApiError {
    return new ApiError(429, message, code ? { code } : undefined);
  }

  public static notFound(message = "Not found", code?: string): ApiError {
    return new ApiError(404, message, code ? { code } : undefined);
  }

  public static conflict(message = "Conflict - resource already exists", code?: string): ApiError {
    return new ApiError(409, message, code ? { code } : undefined);
  }

  public static internal(message = "Internal server error", code?: string): ApiError {
    return new ApiError(500, message, code ? { code } : undefined);
  }
}

export function sendErrorResponse(
  res: Response,
  error: ApiError,
  extra?: Record<string, unknown>,
) {
  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(error.code && { error: error.code }),
    ...extra,
  });
}
