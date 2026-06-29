import { NextRequest, NextResponse } from 'next/server';
import { analyzeReviewWithGemini } from '@/lib/gemini';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { rateLimitMiddleware, RATE_LIMIT_CONFIGS, getClientIp } from '@/lib/rateLimit';
import { mockStore } from '@/lib/mockStore';
import {
  validateAnalyzeRequest,
} from '@/lib/validation';
import {
  ValidationError,
  DatabaseError,
  AIError,
  formatErrorResponse,
  getHttpStatus,
  logError,
} from '@/lib/errors';
import type { AnalysisResult, Category } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

export const POST = withAuth(async (request: AuthenticatedRequest) => {
  // Check if homestayId exists
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

  // Apply rate limiting
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

    const isMock = !process.env.MONGODB_URI || process.env.MONGODB_URI.includes('YOUR_USERNAME') || process.env.MONGODB_URI.includes('cluster-name');
    if (isMock) {
      const lowerReview = review.toLowerCase();
      let sentiment: 'positive' | 'neutral' | 'negative' = 'positive';
      let category: Category = 'experience';
      let keywords = ['Comfortable rooms', 'Decent service'];
      let responseText = 'Thank you for your feedback! We are glad you enjoyed your stay.';

      if (lowerReview.includes('dirty') || lowerReview.includes('cleanliness') || lowerReview.includes('spotless') || lowerReview.includes('clean')) {
        category = 'cleanliness';
        keywords = ['Spotless rooms', 'Very clean stay'];
      } else if (lowerReview.includes('location') || lowerReview.includes('close') || lowerReview.includes('market')) {
        category = 'location';
        keywords = ['Convenient location', 'Close to market'];
      } else if (lowerReview.includes('host') || lowerReview.includes('responsive') || lowerReview.includes('communication')) {
        category = 'host';
        keywords = ['Responsive host', 'Excellent communication'];
      } else if (lowerReview.includes('food') || lowerReview.includes('breakfast') || lowerReview.includes('meal')) {
        category = 'food';
        keywords = ['Delicious food', 'Great breakfast'];
      } else if (lowerReview.includes('price') || lowerReview.includes('value') || lowerReview.includes('worth')) {
        category = 'value';
        keywords = ['Good value'];
      }

      if (lowerReview.includes('bad') || lowerReview.includes('poor') || lowerReview.includes('disappointing') || lowerReview.includes('terrible')) {
        sentiment = 'negative';
        responseText = 'We sincerely apologize for the issues you encountered. We are looking into this immediately.';
      } else if (lowerReview.includes('okay') || lowerReview.includes('average') || lowerReview.includes('decent')) {
        sentiment = 'neutral';
        responseText = 'Thank you for your review. We appreciate your feedback and will work to improve.';
      }

      const summaryText = review.length > 80 ? review.substring(0, 80) + '...' : review;

      const mockReview = mockStore.createReview(
        homestayId,
        review,
        sentiment,
        category,
        0.85,
        keywords,
        responseText,
        summaryText
      );

      const result: AnalysisResult = {
        _id: mockReview._id,
        sentiment: mockReview.sentiment,
        sentimentScore: mockReview.sentimentScore,
        category: mockReview.category,
        keywords: mockReview.keywords,
        keyPoints: mockReview.keywords,
        summary: mockReview.summary,
        suggestedResponse: mockReview.suggestedResponse,
        createdAt: mockReview.createdAt,
      };

      return NextResponse.json(result);
    }

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
    let dbConn;
    try {
      dbConn = await connectDB();
    } catch (error) {
      logError(error, 'Database Connection');
      throw new DatabaseError('Failed to connect to database');
    }

    if (dbConn === null) {
      const summaryText = analysis.summary || (review.length > 80 ? review.substring(0, 80) + '...' : review);
      const mockReview = mockStore.createReview(
        homestayId,
        review,
        analysis.sentiment,
        analysis.category as Category,
        analysis.sentimentScore || 0.75,
        analysis.keywords || analysis.keyPoints || [],
        analysis.response || analysis.suggestedResponse || 'Thank you for your review.',
        summaryText
      );

      const result: AnalysisResult = {
        _id: mockReview._id,
        sentiment: mockReview.sentiment,
        sentimentScore: mockReview.sentimentScore,
        category: mockReview.category,
        keywords: mockReview.keywords,
        keyPoints: mockReview.keywords,
        summary: mockReview.summary,
        suggestedResponse: mockReview.suggestedResponse,
        createdAt: mockReview.createdAt,
      };

      return NextResponse.json(result);
    }

    try {
      const summaryText = analysis.summary || (review.length > 80 ? review.substring(0, 80) + '...' : review);
      const responseText = analysis.response || analysis.suggestedResponse || 'Thank you for your feedback.';
      const keywordsArr = analysis.keywords || analysis.keyPoints || [];

      const newReview = new Review({
        homestayId,
        platform: 'manual',
        reviewText: review,
        sentiment: analysis.sentiment,
        category: analysis.category,
        sentimentScore: analysis.sentimentScore || 0.75,
        keywords: keywordsArr,
        keyPoints: keywordsArr,
        summary: summaryText,
        suggestedResponse: responseText,
        analysis,
      });

      await newReview.save();

      // Return the analysis
      const result: AnalysisResult = {
        _id: newReview._id.toString(),
        sentiment: analysis.sentiment,
        sentimentScore: analysis.sentimentScore || 0.75,
        category: analysis.category,
        keywords: keywordsArr,
        keyPoints: keywordsArr,
        summary: summaryText,
        suggestedResponse: responseText,
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
});

