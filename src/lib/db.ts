// Database Query Utilities for GuestPulse AI

import connectDB from './mongodb';
import Review from '@/models/Review';
import type { Sentiment, Category } from '@/types';
import mongoose from 'mongoose';

// Get all reviews with pagination scoped by homestayId
export async function getAllReviews(homestayId: string, skip: number = 0, limit: number = 10) {
  await connectDB();

  const filter = { homestayId: new mongoose.Types.ObjectId(homestayId) };

  const reviews = await Review.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Review.countDocuments(filter);

  return {
    reviews,
    total,
    skip,
    limit,
    hasMore: skip + limit < total,
  };
}

// Get reviews by sentiment scoped by homestayId
export async function getReviewsBySentiment(homestayId: string, sentiment: Sentiment) {
  await connectDB();

  const reviews = await Review.find({
    homestayId: new mongoose.Types.ObjectId(homestayId),
    sentiment,
  })
    .sort({ createdAt: -1 })
    .lean();

  return reviews;
}

// Get reviews by category scoped by homestayId
export async function getReviewsByCategory(homestayId: string, category: Category) {
  await connectDB();

  const reviews = await Review.find({
    homestayId: new mongoose.Types.ObjectId(homestayId),
    category,
  })
    .sort({ createdAt: -1 })
    .lean();

  return reviews;
}

// Get single review by ID scoped by homestayId
export async function getReviewById(homestayId: string, id: string) {
  await connectDB();

  const review = await Review.findOne({
    _id: id,
    homestayId: new mongoose.Types.ObjectId(homestayId),
  });

  return review;
}

// Get review count by sentiment scoped by homestayId
export async function getCountBySentiment(homestayId: string) {
  await connectDB();

  const counts = await Review.aggregate([
    {
      $match: { homestayId: new mongoose.Types.ObjectId(homestayId) },
    },
    {
      $group: {
        _id: '$sentiment',
        count: { $sum: 1 },
      },
    },
  ]);

  return counts;
}

// Get review count by category scoped by homestayId
export async function getCountByCategory(homestayId: string) {
  await connectDB();

  const counts = await Review.aggregate([
    {
      $match: { homestayId: new mongoose.Types.ObjectId(homestayId) },
    },
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

// Calculate dashboard statistics scoped by homestayId
export async function getDashboardStats(homestayId: string) {
  await connectDB();

  const matchStage = {
    $match: { homestayId: new mongoose.Types.ObjectId(homestayId) },
  };

  const totalReviews = await Review.countDocuments({
    homestayId: new mongoose.Types.ObjectId(homestayId),
  });

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
    matchStage,
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
    matchStage,
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
    matchStage,
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
        homestayId: new mongoose.Types.ObjectId(homestayId),
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

  // Pre-populate last 7 days to ensure a complete chart trend even for empty dates
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    trendMap[dateStr] = {
      date: dateStr,
      positive: 0,
      neutral: 0,
      negative: 0,
    };
  }

  trendData.forEach(({ _id, count }: any) => {
    const { date, sentiment } = _id;
    if (trendMap[date]) {
      trendMap[date][sentiment] = count;
    }
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

