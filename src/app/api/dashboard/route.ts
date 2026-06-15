import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get total counts
    const totalReviews = await Review.countDocuments();
    const positiveReviews = await Review.countDocuments({ sentiment: 'positive' });
    const neutralReviews = await Review.countDocuments({ sentiment: 'neutral' });
    const negativeReviews = await Review.countDocuments({ sentiment: 'negative' });

    // Get average sentiment score
    const sentimentScores = await Review.aggregate([
      { $group: { _id: null, avg: { $avg: '$sentimentScore' } } },
    ]);
    const averageSentimentScore = sentimentScores[0]?.avg || 0;

    // Get category breakdown
    const categoryBreakdown = await Review.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { category: '$_id', count: 1, _id: 0 } },
    ]);

    const mostCommonCategory = categoryBreakdown[0]?.category || 'other';

    // Generate sentiment trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sentimentTrend = await Review.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          positive: {
            $sum: {
              $cond: [{ $eq: ['$sentiment', 'positive'] }, 1, 0],
            },
          },
          neutral: {
            $sum: {
              $cond: [{ $eq: ['$sentiment', 'neutral'] }, 1, 0],
            },
          },
          negative: {
            $sum: {
              $cond: [{ $eq: ['$sentiment', 'negative'] }, 1, 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          positive: 1,
          neutral: 1,
          negative: 1,
          _id: 0,
        },
      },
    ]);

    return NextResponse.json({
      totalReviews,
      positiveReviews,
      neutralReviews,
      negativeReviews,
      averageSentimentScore,
      mostCommonCategory,
      categoryBreakdown,
      sentimentTrend,
    });
  } catch (error) {
    console.error('[v0] Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
