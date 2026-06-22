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

interface InMemReview {
  _id: string;
  text: string;
  sentiment: Sentiment;
  sentimentScore: number;
  category: Category;
  keyPoints: string[];
  suggestedResponse: string;
  createdAt: Date;
  updatedAt: Date;
}

// Global declaration to persist mock data across Next.js hot-reloads in dev
const globalForMock = global as unknown as {
  mockUsers: MockUser[];
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

if (!globalForMock.mockReviews) {
  const generated = generateMockReviews();
  globalForMock.mockReviews = generated.map((r, index) => ({
    _id: `mock-review-${index + 1}`,
    text: r.text,
    sentiment: r.sentiment as Sentiment,
    sentimentScore: 0.75, // Default mock score
    category: r.category as Category,
    keyPoints: r.keyPoints,
    suggestedResponse: r.suggestedResponse,
    createdAt: r.createdAt,
    updatedAt: r.createdAt,
  }));
}

export const mockStore = {
  getUsers: () => globalForMock.mockUsers,
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

  createReview: (
    text: string,
    sentiment: Sentiment,
    category: Category,
    sentimentScore: number,
    keyPoints: string[],
    suggestedResponse: string
  ) => {
    const newReview: InMemReview = {
      _id: `mock-review-${Date.now()}`,
      text,
      sentiment,
      sentimentScore,
      category,
      keyPoints,
      suggestedResponse,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    globalForMock.mockReviews.unshift(newReview); // Add to beginning of history
    return newReview;
  },

  getReviews: (filter: { sentiment?: string; category?: string }, skip = 0, limit = 10) => {
    let list = [...globalForMock.mockReviews];

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

  getDashboardStats: () => {
    const reviews = globalForMock.mockReviews;
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
    const averageSentimentScore = 0.82; // Mock avg score

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
