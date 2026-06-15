import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const sentiment = searchParams.get('sentiment');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '100');
    const skip = parseInt(searchParams.get('skip') || '0');

    // Build filter
    const filter: Record<string, any> = {};
    if (sentiment) filter.sentiment = sentiment;
    if (category) filter.category = category;

    // Fetch reviews
    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('[v0] Reviews API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
