import bcryptjs from 'bcryptjs';
import { generateMockReviews } from './mockData';
import type { Sentiment, Category, Review, AnalysisResult } from '@/types';

// Simple in-memory database fallback when MongoDB is not available
interface MockUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

interface MockHomestay {
  _id: string;
  ownerId: string;
  homestayName: string;
  location: string;
  propertyType: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface InMemReview {
  _id: string;
  homestayId: string;
  platform: string;
  reviewText: string;
  text: string; // virtual field getter/setter simulated
  sentiment: Sentiment;
  sentimentScore: number;
  category: Category;
  keywords: string[];
  keyPoints?: string[]; // for backward compatibility
  summary: string;
  suggestedResponse: string;
  createdAt: Date;
  updatedAt: Date;
}

// Global declaration to persist mock data across Next.js hot-reloads in dev
const globalForMock = global as unknown as {
  mockUsers: MockUser[];
  mockHomestays: MockHomestay[];
  mockReviews: InMemReview[];
};

if (!globalForMock.mockUsers) {
  // Add a default user: john@example.com / Password123
  const salt = bcryptjs.genSaltSync(10);
  const passwordHash = bcryptjs.hashSync('Password123', salt);
  
  globalForMock.mockUsers = [
    {
      _id: 'mock-user-1',
      name: 'John Doe',
      email: 'john@example.com',
      passwordHash,
      createdAt: new Date(),
    }
  ];
}

if (!globalForMock.mockHomestays) {
  // Add a default homestay for the default user john@example.com
  globalForMock.mockHomestays = [
    {
      _id: 'mock-homestay-1',
      ownerId: 'mock-user-1',
      homestayName: 'Sunset Paradise Villa',
      location: 'Bali, Indonesia',
      propertyType: 'Villa',
      description: 'A beautiful beachside property overlooking the sunset.',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];
}

if (!globalForMock.mockReviews) {
  const generated = generateMockReviews();
  globalForMock.mockReviews = generated.map((r, index) => {
    // Map old categories to spec categories
    let category = r.category as string;
    if (category === 'communication') category = 'host';
    else if (category === 'amenities' || category === 'other') category = 'experience';

    return {
      _id: `mock-review-${index + 1}`,
      homestayId: 'mock-homestay-1', // Default reviews belong to John's homestay
      platform: 'Manual',
      reviewText: r.text,
      text: r.text,
      sentiment: r.sentiment as Sentiment,
      sentimentScore: 0.75, // Default mock score
      category: category as Category,
      keywords: r.keyPoints,
      keyPoints: r.keyPoints,
      summary: r.text.substring(0, 60) + '...',
      suggestedResponse: r.suggestedResponse,
      createdAt: r.createdAt,
      updatedAt: r.createdAt,
    };
  });
}

export const mockStore = {
  getUsers: () => globalForMock.mockUsers,
  getHomestays: () => globalForMock.mockHomestays,
  getReviewsList: () => globalForMock.mockReviews,

  findUserByEmail: (email: string) => {
    return globalForMock.mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  createUser: (name: string, email: string, password: string) => {
    const salt = bcryptjs.genSaltSync(10);
    const passwordHash = bcryptjs.hashSync(password, salt);
    const newUser: MockUser = {
      _id: `mock-user-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      passwordHash,
      createdAt: new Date(),
    };
    globalForMock.mockUsers.push(newUser);
    return newUser;
  },

  getHomestayByOwnerId: (ownerId: string) => {
    return globalForMock.mockHomestays.find(h => h.ownerId === ownerId);
  },

  createHomestay: (
    ownerId: string,
    homestayName: string,
    location: string,
    propertyType: string,
    description?: string
  ) => {
    const newHomestay: MockHomestay = {
      _id: `mock-homestay-${Date.now()}`,
      ownerId,
      homestayName,
      location,
      propertyType,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    globalForMock.mockHomestays.push(newHomestay);
    return newHomestay;
  },

  createReview: (
    homestayId: string,
    reviewText: string,
    sentiment: Sentiment,
    category: Category,
    sentimentScore: number,
    keywords: string[],
    suggestedResponse: string,
    summary?: string
  ) => {
    const newReview: InMemReview = {
      _id: `mock-review-${Date.now()}`,
      homestayId,
      platform: 'Manual',
      reviewText,
      text: reviewText,
      sentiment,
      sentimentScore,
      category,
      keywords,
      keyPoints: keywords,
      summary: summary || reviewText.substring(0, 60) + '...',
      suggestedResponse,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    globalForMock.mockReviews.unshift(newReview); // Add to beginning of history
    return newReview;
  },

  getReviews: (homestayId: string, filter: { sentiment?: string; category?: string }, skip = 0, limit = 10) => {
    // Filter reviews strictly belonging to the given homestayId
    let list = globalForMock.mockReviews.filter(r => r.homestayId === homestayId);

    if (filter.sentiment) {
      list = list.filter(r => r.sentiment === filter.sentiment);
    }
    if (filter.category) {
      list = list.filter(r => r.category === filter.category);
    }

    const total = list.length;
    const paginated = list.slice(skip, skip + limit);

    return {
      reviews: paginated,
      total,
    };
  },

  getDashboardStats: (homestayId: string) => {
    // Scope stats strictly to reviews of the given homestayId
    const reviews = globalForMock.mockReviews.filter(r => r.homestayId === homestayId);
    const totalReviews = reviews.length;

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

    const positiveReviews = reviews.filter(r => r.sentiment === 'positive').length;
    const neutralReviews = reviews.filter(r => r.sentiment === 'neutral').length;
    const negativeReviews = reviews.filter(r => r.sentiment === 'negative').length;
    
    let totalScore = 0;
    reviews.forEach(r => {
      totalScore += r.sentimentScore;
    });
    const averageSentimentScore = totalReviews > 0 ? Number((totalScore / totalReviews).toFixed(2)) : 0.75;

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    reviews.forEach(r => {
      categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    });

    const categoryBreakdown = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    const mostCommonCategory = categoryBreakdown[0]?.category || 'other';

    // Sentiment Trend (last 7 days)
    const trendMap: Record<string, { date: string; positive: number; neutral: number; negative: number }> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      trendMap[dateString] = {
        date: dateString,
        positive: 0,
        neutral: 0,
        negative: 0,
      };
    }

    reviews.forEach(r => {
      const dateString = r.createdAt.toISOString().split('T')[0];
      if (trendMap[dateString]) {
        trendMap[dateString][r.sentiment]++;
      }
    });

    const sentimentTrend = Object.values(trendMap);

    return {
      totalReviews,
      positiveReviews,
      neutralReviews,
      negativeReviews,
      averageSentimentScore,
      mostCommonCategory,
      categoryBreakdown,
      sentimentTrend,
    };
  }
};

