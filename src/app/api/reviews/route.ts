import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import { mockStore } from '@/lib/mockStore';
import {
  validatePaginationParams,
  validateSentiment,
  validateCategory,
  VALID_SENTIMENTS,
  VALID_CATEGORIES,
} from '@/lib/validation';
import {
  ValidationError,
  DatabaseError,
  formatErrorResponse,
  getHttpStatus,
  logError,
} from '@/lib/errors';
import type { Sentiment, Category } from '@/types';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const skip = searchParams.get('skip');
    const limit = searchParams.get('limit');
    const sentiment = searchParams.get('sentiment');
    const category = searchParams.get('category');

    // Validate pagination
    let parsedSkip = 0;
    let parsedLimit = 10;

    if (skip || limit) {
      try {
        const pagination = validatePaginationParams(skip || undefined, limit || undefined);
        parsedSkip = pagination.skip;
        parsedLimit = pagination.limit;
      } catch (error) {
        throw error;
      }
    }

    // Validate sentiment if provided
    if (sentiment) {
      const lowerSentiment = sentiment.toLowerCase();
      if (!VALID_SENTIMENTS.includes(lowerSentiment as any)) {
        throw new ValidationError(
          `Invalid sentiment. Must be one of: ${VALID_SENTIMENTS.join(', ')}`,
          'sentiment'
        );
      }
    }

    // Validate category if provided
    if (category) {
      const lowerCategory = category.toLowerCase();
      if (!VALID_CATEGORIES.includes(lowerCategory as any)) {
        throw new ValidationError(
          `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`,
          'category'
        );
      }
    }

    // Connect to database
    let dbConn;
    try {
      dbConn = await connectDB();
    } catch (error) {
      throw new DatabaseError('Failed to connect to database');
    }

    if (dbConn === null) {
      const filter: Record<string, any> = {};
      if (sentiment) filter.sentiment = sentiment.toLowerCase();
      if (category) filter.category = category.toLowerCase();

      const { reviews, total } = mockStore.getReviews(filter, parsedSkip, parsedLimit);

      return NextResponse.json({
        success: true,
        data: reviews,
        pagination: {
          skip: parsedSkip,
          limit: parsedLimit,
          total,
          hasMore: parsedSkip + parsedLimit < total,
        },
      });
    }

    // Build filter
    const filter: Record<string, any> = {};
    if (sentiment) filter.sentiment = sentiment.toLowerCase();
    if (category) filter.category = category.toLowerCase();

    // Fetch reviews
    try {
      const reviews = await Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(parsedSkip)
        .limit(parsedLimit)
        .lean();

      const total = await Review.countDocuments(filter);

      return NextResponse.json({
        success: true,
        data: reviews,
        pagination: {
          skip: parsedSkip,
          limit: parsedLimit,
          total,
          hasMore: parsedSkip + parsedLimit < total,
        },
      });
    } catch (error) {
      throw new DatabaseError('Failed to fetch reviews from database');
    }
  } catch (error) {
    logError(error, 'Reviews API');

    const errorResponse = formatErrorResponse(error);
    const httpStatus = getHttpStatus(error);

    return NextResponse.json(errorResponse, { status: httpStatus });
  }
}
