import { NextRequest, NextResponse } from 'next/server';
import { analyzeReviewWithGemini } from '@/lib/gemini';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import { rateLimitMiddleware, RATE_LIMIT_CONFIGS, getClientIp } from '@/lib/rateLimit';
import {
  validateAnalyzeRequest,
  validateReviewText,
} from '@/lib/validation';
import {
  ValidationError,
  DatabaseError,
  AIError,
  formatErrorResponse,
  getHttpStatus,
  logError,
} from '@/lib/errors';
import type { AnalysisResult } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const ip = getClientIp(request);
  const rateLimitError = rateLimitMiddleware(RATE_LIMIT_CONFIGS.analyze)(request);
  if (rateLimitError) return rateLimitError;
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      throw new ValidationError('Invalid JSON in request body');
    }

    // Validate request
    const { review } = validateAnalyzeRequest(body);

    // Analyze with Gemini
    let analysis;
    try {
      analysis = await analyzeReviewWithGemini(review);
    } catch (error) {
      logError(error, 'Gemini Analysis');
      throw new AIError(
        error instanceof Error
          ? error.message
          : 'Failed to analyze review with AI'
      );
    }

    // Connect to database and save
    try {
      await connectDB();

      const newReview = new Review({
        text: review,
        sentiment: analysis.sentiment,
        category: analysis.category,
        sentimentScore: analysis.sentimentScore || 0.75,
        keyPoints: analysis.keyPoints || [],
        suggestedResponse: analysis.response,
        analysis,
      });

      await newReview.save();

      // Return the analysis
      const result: AnalysisResult = {
        _id: newReview._id.toString(),
        sentiment: analysis.sentiment,
        sentimentScore: analysis.sentimentScore || 0.75,
        category: analysis.category,
        keyPoints: analysis.keyPoints || [],
        suggestedResponse: analysis.response,
        createdAt: newReview.createdAt,
      };

      return NextResponse.json(result);
    } catch (error) {
      logError(error, 'Database Operation');
      throw new DatabaseError(
        'Failed to save review to database'
      );
    }
  } catch (error) {
    logError(error, 'Analyze API');

    const errorResponse = formatErrorResponse(error);
    const httpStatus = getHttpStatus(error);

    return NextResponse.json(errorResponse, { status: httpStatus });
  }
}
