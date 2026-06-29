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
  },

  getReportData: (homestayId: string, month?: string, year?: string) => {
    const homestay = globalForMock.mockHomestays.find(h => h._id === homestayId);
    let reviews = globalForMock.mockReviews.filter(r => r.homestayId === homestayId);

    if (month && month !== 'all' && year && year !== 'all') {
      const targetMonth = parseInt(month, 10) - 1;
      const targetYear = parseInt(year, 10);
      reviews = reviews.filter(r => {
        const d = new Date(r.createdAt);
        return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
      });
    }

    const totalReviews = reviews.length;
    const positiveReviews = reviews.filter(r => r.sentiment === 'positive').length;
    const negativeReviews = reviews.filter(r => r.sentiment === 'negative').length;
    const guestSatisfactionRate = totalReviews > 0 ? Math.round((positiveReviews / totalReviews) * 100) : 100;

    // Category Frequency
    const categoryCounts: Record<string, number> = {};
    reviews.forEach(r => {
      categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    });

    const categoryBreakdown = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    const topComplaints = reviews
      .filter(r => r.sentiment === 'negative')
      .map(r => r.category);

    const mostAppreciated = reviews
      .filter(r => r.sentiment === 'positive')
      .map(r => r.category);

    // Monthly Trend
    const monthlyMap: Record<string, { month: string; positive: number; neutral: number; negative: number }> = {};
    reviews.forEach(r => {
      const d = new Date(r.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyMap[key]) {
        monthlyMap[key] = { month: key, positive: 0, neutral: 0, negative: 0 };
      }
      monthlyMap[key][r.sentiment]++;
    });

    const aiSummary = `### Operational Summary for ${homestay?.homestayName || 'Homestay'}
- **Positive Aspects**: Guests frequently appreciate the ${mostAppreciated[0] || 'cleanliness'} and overall comfortable ambiance.
- **Recurring Complaints**: Minor issues noted around ${topComplaints[0] || 'amenities'} and response promptness.
- **Actionable Improvement**: Prioritize routine maintenance checks and ensure key amenities are fully operational prior to guest arrival.`;

    return {
      homestayName: homestay?.homestayName || 'Sunset Paradise Villa',
      guestSatisfactionRate,
      totalReviews,
      monthlyTrend: Object.values(monthlyMap),
      topComplaints: Array.from(new Set(topComplaints)),
      mostAppreciated: Array.from(new Set(mostAppreciated)),
      categoryBreakdown,
      aiSummary,
    };
  },

  getPredictions: (homestayId: string) => {
    const homestay = globalForMock.mockHomestays.find(h => h._id === homestayId);
    return {
      homestayName: homestay?.homestayName || 'Sunset Paradise Villa',
      forecastPeriod: 'Upcoming Quarter (Q3/Q4)',
      predictedSatisfactionRate: 91,
      predictedRisingComplaints: ['check-in delays', 'wifi capacity'],
      predictedTrendingPositives: ['scenic views', 'host warmth'],
      seasonalInsights: 'High tourist inflow anticipated over the upcoming holiday weekend. Increase staff presence at arrival and verify Wi-Fi router stability.',
      proactiveActionCards: [
        {
          id: 'card-1',
          title: 'Check-in Bottleneck Risk',
          description: 'Expected arrival surge on Friday — assign dedicated greeting staff or share automated check-in PIN codes in advance.',
          severity: 'amber',
          category: 'host',
        },
        {
          id: 'card-2',
          title: 'High Wi-Fi Load Expected',
          description: 'Complaints tend to rise during high occupancy — test router bandwidth and reboot mesh extenders.',
          severity: 'amber',
          category: 'amenities',
        },
        {
          id: 'card-3',
          title: 'Positive Host Trend',
          description: 'Host friendliness mentions are up 20% this month — showcase guest compliments on your booking profile.',
          severity: 'green',
          category: 'host',
        },
      ],
      forecastTrend: [
        { period: 'May', actual: 82, predicted: 80 },
        { period: 'Jun', actual: 85, predicted: 84 },
        { period: 'Jul (Current)', actual: 88, predicted: 87 },
        { period: 'Aug (Forecast)', predicted: 91 },
        { period: 'Sep (Forecast)', predicted: 93 },
      ],
      accuracyScore: 94,
    };
  },

  getBenchmarking: (homestayId: string) => {
    const homestay = globalForMock.mockHomestays.find(h => h._id === homestayId);
    const homestayName = homestay?.homestayName || 'Sunset Paradise Villa';
    return {
      homestayName,
      industryAverageSatisfaction: 78,
      ownerSatisfaction: 88,
      regionalCleanlinessScore: 82,
      regionalHostScore: 85,
      competitiveInsights: [
        `Your property "${homestayName}" outperforms the regional industry average in guest satisfaction (88% vs 78%).`,
        `Cleanliness ratings for your property are 6% higher than neighboring listings in your region.`,
        `Wi-Fi responsiveness and check-in smoothness remain key areas where competitors are gaining guest praise.`,
      ],
      propertyComparisons: [
        { propertyName: homestayName, satisfactionRate: 88, topCategory: 'host', status: 'Best Performer' as const },
        { propertyName: 'Sunset Beachfront Villa B', satisfactionRate: 79, topCategory: 'location', status: 'Average' as const },
        { propertyName: 'Mountain View Cottage C', satisfactionRate: 71, topCategory: 'cleanliness', status: 'Needs Attention' as const },
      ],
    };
  },

  mockActions: [
    {
      _id: 'act-sample-1',
      homestayId: 'mock-homestay-id-1',
      title: 'Upgraded Wi-Fi Mesh Routers',
      category: 'amenities',
      notes: 'Installed dual-band Wi-Fi routers across guest rooms and common areas.',
      dateLogged: new Date(),
      complaintReductionPercent: 34,
      satisfactionImprovementPercent: 14,
      aiImpactSummary: 'Complaints regarding Wi-Fi speed dropped by 34% following mesh router installation.',
    },
    {
      _id: 'act-sample-2',
      homestayId: 'mock-homestay-id-1',
      title: 'Implemented Digital Self Check-in PIN Codes',
      category: 'host',
      notes: 'Automated guest arrival instructions via WhatsApp.',
      dateLogged: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      complaintReductionPercent: 28,
      satisfactionImprovementPercent: 12,
      aiImpactSummary: 'Check-in delays decreased by 28% after deploying automated PIN code arrival instructions.',
    },
  ],

  getLoggedActions: function(homestayId: string) {
    return this.mockActions.filter(a => a.homestayId === homestayId || true);
  },

  createLoggedAction: function(homestayId: string, data: { title: string; category: string; notes?: string }) {
    const newAction = {
      _id: `act-${Date.now()}`,
      homestayId,
      title: data.title,
      category: data.category,
      notes: data.notes || '',
      dateLogged: new Date(),
      complaintReductionPercent: 30,
      satisfactionImprovementPercent: 15,
      aiImpactSummary: `Logging operational change "${data.title}" improved guest sentiment in ${data.category}.`,
    };
    this.mockActions.unshift(newAction);
    return newAction;
  },

  getExperienceForecast: function(homestayId: string) {
    const homestay = globalForMock.mockHomestays.find(h => h._id === homestayId);
    return {
      homestayName: homestay?.homestayName || 'Sunset Paradise Villa',
      predictedNPS: 78,
      npsChange: 3,
      repeatBookingProbability: 72,
      loyaltyRiskLevel: 'green' as const,
      loyaltyInsights: [
        'Guests who praise staff friendliness are 40% more likely to return.',
        'Repeat bookings may rise by 18% during upcoming holiday seasons due to strong location appeal.',
      ],
      npsTrend: [
        { period: 'Q1', historicalNPS: 70, predictedNPS: 70 },
        { period: 'Q2', historicalNPS: 75, predictedNPS: 74 },
        { period: 'Q3 (Current)', historicalNPS: 78, predictedNPS: 78 },
        { period: 'Q4 (Forecast)', predictedNPS: 81 },
      ],
    };
  }
};

