import { NextRequest, NextResponse } from 'next/server';
import { analyzeReviewWithGemini } from '@/lib/gemini';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import { rateLimitMiddleware, RATE_LIMIT_CONFIGS, getClientIp } from '@/lib/rateLimit';
import { mockStore } from '@/lib/mockStore';
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

    const isMock = !process.env.MONGODB_URI || process.env.MONGODB_URI.includes('YOUR_USERNAME') || process.env.MONGODB_URI.includes('cluster-name');
    if (isMock) {
      const lowerReview = review.toLowerCase();
      let sentiment: 'positive' | 'neutral' | 'negative' = 'positive';
      let category: 'cleanliness' | 'communication' | 'location' | 'amenities' | 'host' | 'value' | 'other' = 'other';
      let keyPoints = ['Comfortable rooms', 'Decent service'];
      let responseText = 'Thank you for your feedback! We are glad you enjoyed your stay.';

      if (lowerReview.includes('dirty') || lowerReview.includes('cleanliness') || lowerReview.includes('spotless') || lowerReview.includes('clean')) {
        category = 'cleanliness';
        keyPoints = ['Spotless rooms', 'Very clean stay'];
      } else if (lowerReview.includes('location') || lowerReview.includes('close') || lowerReview.includes('market')) {
        category = 'location';
        keyPoints = ['Convenient location', 'Close to market'];
      } else if (lowerReview.includes('host') || lowerReview.includes('responsive') || lowerReview.includes('communication')) {
        category = 'communication';
        keyPoints = ['Responsive host', 'Excellent communication'];
      }

      if (lowerReview.includes('bad') || lowerReview.includes('poor') || lowerReview.includes('disappointing') || lowerReview.includes('terrible')) {
        sentiment = 'negative';
        responseText = 'We sincerely apologize for the issues you encountered. We are looking into this immediately.';
      } else if (lowerReview.includes('okay') || lowerReview.includes('average') || lowerReview.includes('decent')) {
        sentiment = 'neutral';
        responseText = 'Thank you for your review. We appreciate your feedback and will work to improve.';
      }

      const mockReview = mockStore.createReview(
        review,
        sentiment,
        category,
        0.85,
        keyPoints,
        responseText
      );

      const result: AnalysisResult = {
        _id: mockReview._id,
        sentiment: mockReview.sentiment,
        sentimentScore: mockReview.sentimentScore,
        category: mockReview.category,
        keyPoints: mockReview.keyPoints,
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
      const mockReview = mockStore.createReview(
        review,
        analysis.sentiment,
        analysis.category,
        analysis.sentimentScore || 0.75,
        analysis.keyPoints || [],
        analysis.response
      );

      const result: AnalysisResult = {
        _id: mockReview._id,
        sentiment: mockReview.sentiment,
        sentimentScore: mockReview.sentimentScore,
        category: mockReview.category,
        keyPoints: mockReview.keyPoints,
        suggestedResponse: mockReview.suggestedResponse,
        createdAt: mockReview.createdAt,
      };

      return NextResponse.json(result);
    }

    try {
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
