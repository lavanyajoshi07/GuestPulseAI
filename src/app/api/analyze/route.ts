import { NextRequest, NextResponse } from 'next/server';
import { analyzeReviewWithGemini } from '@/lib/gemini';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import type { AnalysisResult } from '@/types';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { review } = await request.json();

    if (!review || typeof review !== 'string') {
      return NextResponse.json(
        { error: 'Review text is required' },
        { status: 400 }
      );
    }

    if (review.trim().length < 10) {
      return NextResponse.json(
        { error: 'Review must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Analyze with Gemini
    const analysis = await analyzeReviewWithGemini(review);

    // Connect to database
    await connectDB();

    // Save to database
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
    console.error('[v0] Analyze API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze review' },
      { status: 500 }
    );
  }
}
