// Database Query Utilities for GuestPulse AI

import connectDB from './mongodb';
import Review from '@/models/Review';
import Homestay from '@/models/Homestay';
import MonthlySummary from '@/models/MonthlySummary';
import Prediction from '@/models/Prediction';
import Benchmark from '@/models/Benchmark';
import Action from '@/models/Action';
import Forecast from '@/models/Forecast';
import { generateBusinessSummary, generatePredictiveAnalytics as generateAIPredictions, generateCompetitiveInsights, generateActionImpactSummary, generateLoyaltyForecast } from './gemini';
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

export async function getReportAnalytics(
  homestayId: string,
  month?: string,
  year?: string,
  range?: string,
  forceRefresh: boolean = false
) {
  await connectDB();

  const homestayObjId = new mongoose.Types.ObjectId(homestayId);
  const homestayDoc = await Homestay.findById(homestayObjId).lean();
  const homestayName = homestayDoc?.homestayName || 'Homestay';

  const dateFilter: any = { homestayId: homestayObjId };
  const now = new Date();

  if (range && range !== 'all') {
    let startDate = new Date();
    if (range === 'daily') {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === 'weekly') {
      startDate.setDate(now.getDate() - 7);
    } else if (range === 'monthly') {
      startDate.setDate(now.getDate() - 30);
    } else if (range === 'yearly') {
      startDate.setDate(now.getDate() - 365);
    }
    dateFilter.createdAt = { $gte: startDate };
  } else if (month && month !== 'all' && year && year !== 'all') {
    const m = parseInt(month, 10) - 1;
    const y = parseInt(year, 10);
    const startDate = new Date(Date.UTC(y, m, 1));
    const endDate = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));
    dateFilter.createdAt = { $gte: startDate, $lte: endDate };
  }

  const totalReviews = await Review.countDocuments(dateFilter);

  if (totalReviews === 0) {
    return {
      homestayName,
      guestSatisfactionRate: 100,
      totalReviews: 0,
      monthlyTrend: [],
      topComplaints: [],
      mostAppreciated: [],
      categoryBreakdown: [],
      aiSummary: `### Executive Business Summary for ${homestayName}\nNo reviews found for the selected date window. Add reviews to generate automated AI feedback synthesis.`,
    };
  }

  // Sentiment Breakdown for Guest Satisfaction %
  const sentimentCounts = await Review.aggregate([
    { $match: dateFilter },
    { $group: { _id: '$sentiment', count: { $sum: 1 } } },
  ]);

  const sentimentMap: Record<string, number> = {};
  sentimentCounts.forEach(({ _id, count }: any) => {
    sentimentMap[_id] = count;
  });

  const positiveCount = sentimentMap['positive'] || 0;
  const guestSatisfactionRate = Math.round((positiveCount / totalReviews) * 100);

  // Category Breakdown
  const categoryCounts = await Review.aggregate([
    { $match: dateFilter },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const categoryBreakdown = categoryCounts.map(({ _id, count }: any) => ({
    category: _id,
    count,
  }));

  // Top Complaints (negative categories) & Most Appreciated (positive categories)
  const negativeCategories = await Review.aggregate([
    { $match: { ...dateFilter, sentiment: 'negative' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 3 },
  ]);

  const positiveCategories = await Review.aggregate([
    { $match: { ...dateFilter, sentiment: 'positive' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 3 },
  ]);

  const topComplaints = negativeCategories.map(c => c._id);
  const mostAppreciated = positiveCategories.map(c => c._id);

  // Monthly Sentiment Trend
  const monthlyTrendData = await Review.aggregate([
    { $match: { homestayId: homestayObjId } },
    {
      $group: {
        _id: {
          month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          sentiment: '$sentiment',
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.month': 1 } },
  ]);

  const monthlyTrendMap: Record<string, any> = {};
  monthlyTrendData.forEach(({ _id, count }: any) => {
    const { month: mKey, sentiment } = _id;
    if (!monthlyTrendMap[mKey]) {
      monthlyTrendMap[mKey] = { month: mKey, positive: 0, neutral: 0, negative: 0 };
    }
    monthlyTrendMap[mKey][sentiment] = count;
  });

  const monthlyTrend = Object.values(monthlyTrendMap);

  // AI Summary Caching & Generation
  const periodKey = range && range !== 'all' ? range : (month && month !== 'all' && year && year !== 'all') ? `${year}-${String(month).padStart(2, '0')}` : 'all';

  let cachedSummaryDoc = await MonthlySummary.findOne({
    homestayId: homestayObjId,
    yearMonth: periodKey,
  });

  let aiSummary = cachedSummaryDoc?.aiSummary || '';

  // Invalidate cache if review count delta >= 10 or older than 7 days (604800000 ms) or forceRefresh
  const reviewDelta = cachedSummaryDoc ? Math.abs(totalReviews - cachedSummaryDoc.reviewCount) : 999;
  const isExpired = cachedSummaryDoc ? (Date.now() - new Date(cachedSummaryDoc.lastGeneratedAt).getTime() > 7 * 24 * 60 * 60 * 1000) : true;

  if (!cachedSummaryDoc || forceRefresh || reviewDelta >= 10 || isExpired) {
    const sampleReviews = await Review.find(dateFilter)
      .sort({ createdAt: -1 })
      .limit(15)
      .select('reviewText')
      .lean();

    const reviewsCombinedText = sampleReviews.map(r => r.reviewText).join('\n---\n');
    aiSummary = await generateBusinessSummary(reviewsCombinedText);

    if (cachedSummaryDoc) {
      cachedSummaryDoc.aiSummary = aiSummary;
      cachedSummaryDoc.reviewCount = totalReviews;
      cachedSummaryDoc.lastGeneratedAt = new Date();
      await cachedSummaryDoc.save();
    } else {
      await MonthlySummary.create({
        homestayId: homestayObjId,
        yearMonth: periodKey,
        aiSummary,
        reviewCount: totalReviews,
        lastGeneratedAt: new Date(),
      });
    }
  }

  return {
    homestayName,
    guestSatisfactionRate,
    totalReviews,
    monthlyTrend,
    topComplaints,
    mostAppreciated,
    categoryBreakdown,
    aiSummary,
  };
}

export async function getPredictiveAnalytics(homestayId: string, forceRefresh: boolean = false) {
  await connectDB();

  const homestayObjId = new mongoose.Types.ObjectId(homestayId);
  const homestayDoc = await Homestay.findById(homestayObjId).lean();
  const homestayName = homestayDoc?.homestayName || 'Homestay';

  let cachedPrediction = await Prediction.findOne({ homestayId: homestayObjId }).sort({ createdAt: -1 });

  const isExpired = cachedPrediction ? (Date.now() - new Date(cachedPrediction.createdAt).getTime() > 7 * 24 * 60 * 60 * 1000) : true;

  if (!cachedPrediction || forceRefresh || isExpired) {
    const historicalSample = await Review.find({ homestayId: homestayObjId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('reviewText sentiment category')
      .lean();

    const sampleText = historicalSample.map(r => `[${r.sentiment.toUpperCase()} - ${r.category}] ${r.reviewText}`).join('\n');
    const aiData = await generateAIPredictions(sampleText, homestayName);

    cachedPrediction = await Prediction.create({
      homestayId: homestayObjId,
      forecastPeriod: aiData.forecastPeriod,
      predictedSatisfactionRate: aiData.predictedSatisfactionRate,
      predictedRisingComplaints: aiData.predictedRisingComplaints,
      predictedTrendingPositives: aiData.predictedTrendingPositives,
      seasonalInsights: aiData.seasonalInsights,
      proactiveActionCards: aiData.proactiveActionCards,
      forecastTrend: aiData.forecastTrend,
      accuracyScore: aiData.accuracyScore,
    });
  }

  return {
    homestayName,
    forecastPeriod: cachedPrediction.forecastPeriod,
    predictedSatisfactionRate: cachedPrediction.predictedSatisfactionRate,
    predictedRisingComplaints: cachedPrediction.predictedRisingComplaints,
    predictedTrendingPositives: cachedPrediction.predictedTrendingPositives,
    seasonalInsights: cachedPrediction.seasonalInsights,
    proactiveActionCards: cachedPrediction.proactiveActionCards,
    forecastTrend: cachedPrediction.forecastTrend,
    accuracyScore: cachedPrediction.accuracyScore,
  };
}

export async function getBenchmarkingData(homestayId: string, forceRefresh: boolean = false) {
  await connectDB();

  const homestayObjId = new mongoose.Types.ObjectId(homestayId);
  const homestayDoc = await Homestay.findById(homestayObjId).lean();
  const homestayName = homestayDoc?.homestayName || 'Homestay';

  let cachedBenchmark = await Benchmark.findOne({ homestayId: homestayObjId }).sort({ createdAt: -1 });

  const isExpired = cachedBenchmark ? (Date.now() - new Date(cachedBenchmark.createdAt).getTime() > 7 * 24 * 60 * 60 * 1000) : true;

  if (!cachedBenchmark || forceRefresh || isExpired) {
    const totalCount = await Review.countDocuments({ homestayId: homestayObjId });
    const positiveCount = await Review.countDocuments({ homestayId: homestayObjId, sentiment: 'positive' });
    const ownerSatisfaction = totalCount > 0 ? Math.round((positiveCount / totalCount) * 100) : 0;

    const insights = await generateCompetitiveInsights(homestayName, ownerSatisfaction);

    const defaultComparisons = [
      { propertyName: homestayName, satisfactionRate: ownerSatisfaction, topCategory: 'host', status: ownerSatisfaction >= 85 ? 'Best Performer' as const : 'Average' as const },
    ];

    cachedBenchmark = await Benchmark.create({
      homestayId: homestayObjId,
      industryAverageSatisfaction: 78,
      ownerSatisfaction,
      regionalCleanlinessScore: 82,
      regionalHostScore: 85,
      competitiveInsights: insights,
      propertyComparisons: defaultComparisons,
    });
  }

  const filteredComparisons = (cachedBenchmark.propertyComparisons || []).filter(
    (p: any) => p.propertyName === homestayName
  );
  if (filteredComparisons.length === 0) {
    filteredComparisons.push({
      propertyName: homestayName,
      satisfactionRate: cachedBenchmark.ownerSatisfaction,
      topCategory: 'host',
      status: cachedBenchmark.ownerSatisfaction >= 85 ? 'Best Performer' : 'Average',
    });
  }

  return {
    homestayName,
    industryAverageSatisfaction: cachedBenchmark.industryAverageSatisfaction,
    ownerSatisfaction: cachedBenchmark.ownerSatisfaction,
    regionalCleanlinessScore: cachedBenchmark.regionalCleanlinessScore,
    regionalHostScore: cachedBenchmark.regionalHostScore,
    competitiveInsights: cachedBenchmark.competitiveInsights,
    propertyComparisons: filteredComparisons,
  };
}

export async function getLoggedActions(homestayId: string) {
  await connectDB();
  const homestayObjId = new mongoose.Types.ObjectId(homestayId);
  const actions = await Action.find({ homestayId: homestayObjId }).sort({ createdAt: -1 }).lean();
  
  if (actions.length === 0) {
    return [];
  }

  return actions.map(a => ({
    _id: a._id.toString(),
    homestayId: a.homestayId.toString(),
    title: a.title,
    category: a.category,
    notes: a.notes,
    dateLogged: a.dateLogged,
    complaintReductionPercent: a.complaintReductionPercent,
    satisfactionImprovementPercent: a.satisfactionImprovementPercent,
    aiImpactSummary: a.aiImpactSummary,
  }));
}

export async function createLoggedAction(homestayId: string, data: { title: string; category: string; notes?: string }) {
  await connectDB();
  const homestayObjId = new mongoose.Types.ObjectId(homestayId);
  const impactSummary = await generateActionImpactSummary(data.title, data.category, data.notes || '');

  const newAction = new Action({
    homestayId: homestayObjId,
    title: data.title,
    category: data.category,
    notes: data.notes || '',
    dateLogged: new Date(),
    complaintReductionPercent: Math.floor(Math.random() * 20) + 20, // 20-40%
    satisfactionImprovementPercent: Math.floor(Math.random() * 10) + 10, // 10-20%
    aiImpactSummary: impactSummary,
  });

  await newAction.save();
  return {
    _id: newAction._id.toString(),
    homestayId,
    title: newAction.title,
    category: newAction.category,
    notes: newAction.notes,
    dateLogged: newAction.dateLogged,
    complaintReductionPercent: newAction.complaintReductionPercent,
    satisfactionImprovementPercent: newAction.satisfactionImprovementPercent,
    aiImpactSummary: newAction.aiImpactSummary,
  };
}

export async function getExperienceForecast(homestayId: string, forceRefresh: boolean = false) {
  await connectDB();
  const homestayObjId = new mongoose.Types.ObjectId(homestayId);
  const homestayDoc = await Homestay.findById(homestayObjId).lean();
  const homestayName = homestayDoc?.homestayName || 'Homestay';

  let cachedForecast = await Forecast.findOne({ homestayId: homestayObjId }).sort({ createdAt: -1 });
  const isExpired = cachedForecast ? (Date.now() - new Date(cachedForecast.createdAt).getTime() > 7 * 24 * 60 * 60 * 1000) : true;

  if (!cachedForecast || forceRefresh || isExpired) {
    const loyaltyInsights = await generateLoyaltyForecast(homestayName);

    const defaultTrend = [
      { period: 'Q1', historicalNPS: 70, predictedNPS: 70 },
      { period: 'Q2', historicalNPS: 75, predictedNPS: 74 },
      { period: 'Q3 (Current)', historicalNPS: 78, predictedNPS: 78 },
      { period: 'Q4 (Forecast)', predictedNPS: 81 },
    ];

    cachedForecast = await Forecast.create({
      homestayId: homestayObjId,
      predictedNPS: 78,
      npsChange: 3,
      repeatBookingProbability: 72,
      loyaltyRiskLevel: 'green',
      loyaltyInsights,
      npsTrend: defaultTrend,
    });
  }

  return {
    homestayName,
    predictedNPS: cachedForecast.predictedNPS,
    npsChange: cachedForecast.npsChange,
    repeatBookingProbability: cachedForecast.repeatBookingProbability,
    loyaltyRiskLevel: cachedForecast.loyaltyRiskLevel,
    loyaltyInsights: cachedForecast.loyaltyInsights,
    npsTrend: cachedForecast.npsTrend,
  };
}








