import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const store: RateLimitStore = {};

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // in milliseconds
}

export const RATE_LIMIT_CONFIGS = {
  auth: { maxRequests: 100, windowMs: 15 * 60 * 1000 }, // Increased to 100 to prevent local testing blocks
  analyze: { maxRequests: 100, windowMs: 60 * 60 * 1000 },
  api: { maxRequests: 500, windowMs: 60 * 60 * 1000 },
};

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const key = identifier;

  // Clean up expired entries
  if (store[key] && store[key].resetTime < now) {
    delete store[key];
  }

  // Initialize or get existing record
  if (!store[key]) {
    store[key] = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }

  const record = store[key];
  const remaining = Math.max(0, config.maxRequests - record.count);

  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: record.resetTime - now,
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: remaining - 1,
    resetIn: record.resetTime - now,
  };
}

export function rateLimitMiddleware(config: RateLimitConfig) {
  return (request: NextRequest): NextResponse | null => {
    const ip = getClientIp(request);
    const { allowed, remaining, resetIn } = checkRateLimit(ip, config);

    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil(resetIn / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(resetIn / 1000).toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': (Date.now() + resetIn).toString(),
          },
        }
      );
    }

    return null;
  };
}

export function clearRateLimitStore() {
  Object.keys(store).forEach((key) => delete store[key]);
}
