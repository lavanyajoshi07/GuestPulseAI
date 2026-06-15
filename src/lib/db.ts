// Database Query Utilities for ReviewLens AI

import connectDB from './mongodb';
import Review from '@/models/Review';
import type { Sentiment, Category } from '@/types';

// Get all reviews with pagination
export async function getAllReviews(skip: number = 0, limit: number = 10) {
  await connectDB();

  const reviews = await Review.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Review.countDocuments();

  return {
    reviews,
    total,
    skip,
    limit,
    hasMore: skip + limit < total,
  };
}

// Get reviews by sentiment
export async function getReviewsBySentiment(sentiment: Sentiment) {
  await connectDB();

  const reviews = await Review.find({ sentiment })
    .sort({ createdAt: -1 })
    .lean();

  return reviews;
}

// Get reviews by category
export async function getReviewsByCategory(category: Category) {
  await connectDB();

  const reviews = await Review.find({ category })
    .sort({ createdAt: -1 })
    .lean();

  return reviews;
}

// Get single review by ID
export async function getReviewById(id: string) {
  await connectDB();

  const review = await Review.findById(id);

  return review;
}

// Get review count by sentiment
export async function getCountBySentiment() {
  await connectDB();

  const counts = await Review.aggregate([
    {
      $group: {
        _id: '$sentiment',
        count: { $sum: 1 },
      },
    },
  ]);

  return counts;
}

// Get review count by category
export async function getCountByCategory() {
  await connectDB();

  const counts = await Review.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  return counts;
}

// Calculate dashboard statistics
export async function getDashboardStats() {
  await connectDB();

  const totalReviews = await Review.countDocuments();

  if (totalReviews === 0) {
    return {
      totalReviews: 0,
      positiveReviews: 0,
      neutralReviews: 0,
      negativeReviews: 0,
      averageSentimentScore: 0,
      mostCommonCategory: 'other',
      categoryBreakdown: [],
      sentimentTrend: [],
    };
  }

  // Get sentiment breakdown
  const sentimentCounts = await Review.aggregate([
    {
      $group: {
        _id: '$sentiment',
        count: { $sum: 1 },
      },
    },
  ]);

  const sentimentMap: Record<string, number> = {};
  sentimentCounts.forEach(({ _id, count }: any) => {
    sentimentMap[_id] = count;
  });

  // Get category breakdown
  const categoryCounts = await Review.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  const categoryBreakdown = categoryCounts.map(({ _id, count }: any) => ({
    category: _id,
    count,
  }));

  // Calculate average sentiment score
  const avgScore = await Review.aggregate([
    {
      $group: {
        _id: null,
        average: { $avg: '$sentimentScore' },
      },
    },
  ]);

  const averageSentimentScore = avgScore[0]?.average || 0.75;

  // Get 7-day trend
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const trendData = await Review.aggregate([
    {
      $match: {
        createdAt: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sentiment: '$sentiment',
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.date': 1 },
    },
  ]);

  // Transform trend data
  const trendMap: Record<string, any> = {};

  trendData.forEach(({ _id, count }: any) => {
    const { date, sentiment } = _id;

    if (!trendMap[date]) {
      trendMap[date] = {
        date,
        positive: 0,
        neutral: 0,
        negative: 0,
      };
    }

    trendMap[date][sentiment] = count;
  });

  const sentimentTrend = Object.values(trendMap);

  // Get most common category
  const mostCommonCategory = categoryBreakdown[0]?.category || 'other';

  return {
    totalReviews,
    positiveReviews: sentimentMap['positive'] || 0,
    neutralReviews: sentimentMap['neutral'] || 0,
    negativeReviews: sentimentMap['negative'] || 0,
    averageSentimentScore,
    mostCommonCategory,
    categoryBreakdown,
    sentimentTrend,
  };
}
