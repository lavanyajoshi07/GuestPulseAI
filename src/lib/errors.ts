// Custom Error Classes for ReviewLens AI

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code: string = 'VALIDATION_ERROR'
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends Error {
  constructor(
    message: string,
    public code: string = 'DATABASE_ERROR'
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class AIError extends Error {
  constructor(
    message: string,
    public code: string = 'AI_ERROR'
  ) {
    super(message);
    this.name = 'AIError';
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string = 'Rate limit exceeded',
    public retryAfter: number = 60
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

// Error Response Formatter
export interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  field?: string;
  timestamp: string;
}

export function formatErrorResponse(error: unknown): ErrorResponse {
  const timestamp = new Date().toISOString();

  if (error instanceof ValidationError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      field: error.field,
      timestamp,
    };
  }

  if (error instanceof DatabaseError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      timestamp,
    };
  }

  if (error instanceof AIError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      timestamp,
    };
  }

  if (error instanceof RateLimitError) {
    return {
      success: false,
      error: error.message,
      code: 'RATE_LIMIT_ERROR',
      timestamp,
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
      code: 'INTERNAL_ERROR',
      timestamp,
    };
  }

  return {
    success: false,
    error: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    timestamp,
  };
}

// HTTP Status Code Mapping
export function getHttpStatus(error: unknown): number {
  if (error instanceof ValidationError) return 400;
  if (error instanceof RateLimitError) return 429;
  if (error instanceof DatabaseError) return 500;
  if (error instanceof AIError) return 503;
  if (error instanceof Error) return 500;
  return 500;
}

// Error Logger
export function logError(error: unknown, context: string = 'API'): void {
  const timestamp = new Date().toISOString();

  if (error instanceof Error) {
    console.error(`[${timestamp}] [${context}] ${error.name}: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
  } else {
    console.error(`[${timestamp}] [${context}] Unknown error:`, error);
  }
}
