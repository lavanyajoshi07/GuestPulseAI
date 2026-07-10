import { NextRequest, NextResponse } from 'next/server';
import { analyzeReviewWithGemini, generateBusinessSummary, extractReviewsFromDocument } from '@/lib/gemini';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { rateLimitMiddleware, RATE_LIMIT_CONFIGS } from '@/lib/rateLimit';
import {
  ValidationError,
  DatabaseError,
  AIError,
  formatErrorResponse,
  getHttpStatus,
  logError,
} from '@/lib/errors';
import type { Category } from '@/types';

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
    let body;
    try {
      body = await request.json();
    } catch (e) {
      throw new ValidationError('Invalid JSON in request body');
    }

    // Extract input reviews (could be single `review` string, `reviews` array, or rich fileData base64)
    let reviewsList: string[] = [];
    if (body.fileData && body.mimeType) {
      try {
        const extracted = await extractReviewsFromDocument(body.fileData, body.mimeType);
        reviewsList = extracted.filter((r: any) => typeof r === 'string' && r.trim().length >= 5);
      } catch (err: any) {
        throw new AIError(`Failed to parse document with AI: ${err.message}`);
      }
    } else if (body.reviews && Array.isArray(body.reviews)) {
      reviewsList = body.reviews.filter((r: any) => typeof r === 'string' && r.trim().length >= 5);
    } else if (body.review && typeof body.review === 'string') {
      // Split multi-line reviews or CSV text rows if user uploaded text/file content into `review`
      const rawText = body.review.trim();
      if (rawText.includes('\n') && (rawText.includes(',') || rawText.length > 300)) {
        reviewsList = rawText.split('\n').map((line: string) => line.trim()).filter((line: string) => line.length >= 10);
      } else {
        reviewsList = [rawText];
      }
    }

    if (reviewsList.length === 0) {
      throw new ValidationError('Please provide valid review text or file content for analysis.');
    }

    // Connect to DB
    try {
      await connectDB();
    } catch (err) {
      throw new DatabaseError('Failed to connect to database');
    }

    let positiveCount = 0;
    let neutralCount = 0;
    let negativeCount = 0;

    const complaintsSet = new Set<string>();
    const appreciatedSet = new Set<string>();
    let lastAnalysis: any = null;

    for (const textItem of reviewsList.slice(0, 50)) { // limit batch processing size
      let analysisResult;
      try {
        analysisResult = await analyzeReviewWithGemini(textItem);
      } catch (err) {
        // Fallback sentiment heuristics if AI service fails
        const lower = textItem.toLowerCase();
        let sentiment: 'positive' | 'neutral' | 'negative' = 'positive';
        let category: Category = 'experience';

        if (lower.includes('bad') || lower.includes('dirty') || lower.includes('delay') || lower.includes('poor') || lower.includes('terrible')) {
          sentiment = 'negative';
          category = lower.includes('dirty') ? 'cleanliness' : lower.includes('delay') ? 'host' : 'experience';
        } else if (lower.includes('okay') || lower.includes('average')) {
          sentiment = 'neutral';
        }

        analysisResult = {
          sentiment,
          category,
          summary: textItem.substring(0, 80),
          keywords: ['feedback'],
          keyPoints: ['guest review'],
          improvementSuggestion: sentiment === 'negative' ? `Improve operational quality in ${category}.` : `Maintain high standards in ${category}.`,
          sentimentScore: 0.75,
        };
      }

      lastAnalysis = analysisResult;

      if (analysisResult.sentiment === 'positive') {
        positiveCount++;
        appreciatedSet.add(analysisResult.category);
      } else if (analysisResult.sentiment === 'negative') {
        negativeCount++;
        complaintsSet.add(analysisResult.category);
      } else {
        neutralCount++;
      }

      // Save review to DB for homestay history persistence
      try {
        await Review.create({
          homestayId,
          platform: body.filename ? 'file_upload' : 'manual',
          reviewText: textItem,
          sentiment: analysisResult.sentiment,
          category: analysisResult.category,
          sentimentScore: analysisResult.sentimentScore || 0.85,
          keywords: analysisResult.keywords || [],
          keyPoints: analysisResult.keyPoints || [],
          summary: analysisResult.summary || textItem.substring(0, 80),
          improvementSuggestion: analysisResult.improvementSuggestion || '',
          analysis: analysisResult,
        });
      } catch (e) {
        console.error('[DB] Failed to persist analyzed review:', e);
      }
    }

    const total = reviewsList.length;
    const posPct = Math.round((positiveCount / total) * 100) || (positiveCount > 0 ? 100 : 0);
    const neuPct = Math.round((neutralCount / total) * 100);
    const negPct = Math.max(0, 100 - posPct - neuPct);

    // Generate Owner Business Summary Actionable Advice using Gemini
    const combinedSampleText = reviewsList.slice(0, 15).join('\n---\n');
    let aiSuggestions = '';
    try {
      aiSuggestions = await generateBusinessSummary(combinedSampleText);
    } catch (e) {
      aiSuggestions = lastAnalysis?.improvementSuggestion || `Focus on addressing recurring guest comments in ${Array.from(complaintsSet)[0] || 'amenities'} to enhance guest satisfaction.`;
    }

    const ownerData = {
      sentimentOverview: {
        positive: posPct,
        neutral: neuPct,
        negative: negPct,
      },
      topComplaints: Array.from(complaintsSet).slice(0, 3),
      topAppreciated: Array.from(appreciatedSet).slice(0, 3),
      aiSuggestions: aiSuggestions.replace(/###/g, '').trim(),
      totalReviews: total,
      // Backward compatibility fields for single review views
      sentiment: lastAnalysis?.sentiment || 'positive',
      category: lastAnalysis?.category || 'experience',
      summary: lastAnalysis?.summary || 'Review analyzed',
      keywords: lastAnalysis?.keywords || [],
      keyPoints: lastAnalysis?.keyPoints || [],
      improvementSuggestion: lastAnalysis?.improvementSuggestion || aiSuggestions,
    };

    return NextResponse.json({
      success: true,
      data: ownerData,
      ...ownerData, // flattened top-level for direct compatibility
    });
  } catch (error) {
    logError(error, 'Analyze API');
    const errorResponse = formatErrorResponse(error);
    const httpStatus = getHttpStatus(error);
    return NextResponse.json(errorResponse, { status: httpStatus });
  }
});
