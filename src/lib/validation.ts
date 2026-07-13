// Input Validation Utilities for ReviewLens AI
import { z } from 'zod';

import { ValidationError } from './errors';

// Review text validation
export function validateReviewText(text: string): void {
  if (!text || typeof text !== 'string') {
    throw new ValidationError('Review text is required', 'text');
  }

  const trimmed = text.trim();

  if (trimmed.length < 10) {
    throw new ValidationError(
      'Review text must be at least 10 characters long',
      'text',
      'TEXT_TOO_SHORT'
    );
  }

  if (trimmed.length > 2000) {
    throw new ValidationError(
      'Review text must not exceed 2000 characters',
      'text',
      'TEXT_TOO_LONG'
    );
  }
}

// Sentiment validation
export const VALID_SENTIMENTS = ['positive', 'neutral', 'negative'] as const;

export function validateSentiment(sentiment: string): void {
  if (!sentiment || typeof sentiment !== 'string') {
    throw new ValidationError('Sentiment is required', 'sentiment');
  }

  const lowerSentiment = sentiment.toLowerCase();

  if (!VALID_SENTIMENTS.includes(lowerSentiment as any)) {
    throw new ValidationError(
      `Invalid sentiment. Must be one of: ${VALID_SENTIMENTS.join(', ')}`,
      'sentiment',
      'INVALID_SENTIMENT'
    );
  }
}

// Category validation
export const VALID_CATEGORIES = [
  'food',
  'cleanliness',
  'location',
  'host',
  'value',
  'experience',
] as const;

export function validateCategory(category: string): void {
  if (!category || typeof category !== 'string') {
    throw new ValidationError('Category is required', 'category');
  }

  const lowerCategory = category.toLowerCase();

  if (!VALID_CATEGORIES.includes(lowerCategory as any)) {
    throw new ValidationError(
      `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
      'category',
      'INVALID_CATEGORY'
    );
  }
}

// Query parameter validation
export function validatePaginationParams(skip?: string, limit?: string) {
  const parsedSkip = skip ? parseInt(skip, 10) : 0;
  const parsedLimit = limit ? parseInt(limit, 10) : 10;

  if (isNaN(parsedSkip) || parsedSkip < 0) {
    throw new ValidationError(
      'Skip must be a non-negative integer',
      'skip',
      'INVALID_SKIP'
    );
  }

  if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
    throw new ValidationError(
      'Limit must be between 1 and 100',
      'limit',
      'INVALID_LIMIT'
    );
  }

  return { skip: parsedSkip, limit: parsedLimit };
}

// Request body validation for analyze endpoint
export interface AnalyzeRequest {
  review: string;
}

export function validateAnalyzeRequest(body: any): AnalyzeRequest {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Request body is required');
  }

  const { review } = body;

  if (typeof review !== 'string') {
    throw new ValidationError('Review must be a string', 'review');
  }

  validateReviewText(review);

  return { review: review.trim() };
}

// Zod schemas for user authentication
export const RegisterSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  passwordConfirm: z.string()
    .min(1, 'Password confirmation is required'),
  name: z.string()
    .min(1, 'Name is required')
    .trim(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Passwords do not match",
  path: ["passwordConfirm"],
});

export const LoginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  password: z.string()
    .min(1, 'Password is required'),
});

export function validateRegisterRequest(body: any) {
  const result = RegisterSchema.safeParse(body);
  if (!result.success) {
    const error = result.error.issues[0];
    throw new ValidationError(error.message, error.path.join('.') || undefined);
  }
  return result.data;
}

export function validateLoginRequest(body: any) {
  const result = LoginSchema.safeParse(body);
  if (!result.success) {
    const error = result.error.issues[0];
    throw new ValidationError(error.message, error.path.join('.') || undefined);
  }
  return result.data;
}

