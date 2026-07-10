import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import mongoose from 'mongoose';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
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

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  if (!request.homestayId) {
    return NextResponse.json(
      {
        success: false,
        error: 'Onboarding required. Please setup your homestay first.',
        code: 'ONBOARDING_REQUIRED',
      },
      { status: 403 }
    );
  }

  const homestayId = request.homestayId;

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
    try {
      await connectDB();
    } catch (error) {
      throw new DatabaseError('Failed to connect to database');
    }

    // Build filter scoped strictly by homestayId
    const filter: Record<string, any> = {
      homestayId: new mongoose.Types.ObjectId(homestayId),
    };
    if (sentiment) filter.sentiment = sentiment.toLowerCase();
    if (category) filter.category = category.toLowerCase();

    // Fetch reviews
    try {
      const rawReviews = await Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(parsedSkip)
        .limit(parsedLimit)
        .lean();

      const reviews = rawReviews.map((r: any) => ({
        ...r,
        text: r.text || r.reviewText || '',
      }));

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
});

