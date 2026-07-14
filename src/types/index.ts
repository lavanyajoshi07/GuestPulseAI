// Review Analysis Types
export type Sentiment = 'positive' | 'neutral' | 'negative';

export type Category =
  | 'food'
  | 'cleanliness'
  | 'location'
  | 'host'
  | 'value'
  | 'experience';

export interface ReviewAnalysis {
  sentiment: Sentiment;
  category: Category;
  summary: string;
  keywords: string[];
  keyPoints?: string[]; // for backward compatibility
  response?: string; // Professional response suggestion
  suggestedResponse?: string;
  improvementSuggestion?: string; // Owner-centric actionable improvement advice
  sentimentScore?: number;
}

export interface AnalysisResult {
  _id?: string;
  sentiment: Sentiment;
  sentimentScore?: number;
  category: Category;
  keywords?: string[];
  keyPoints?: string[]; // for backward compatibility
  summary: string;
  suggestedResponse: string;
  improvementSuggestion?: string;
  createdAt: Date;
}

export interface OwnerAnalysisResult {
  sentimentOverview: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topComplaints: string[];
  topAppreciated: string[];
  aiSuggestions: string;
  totalReviews: number;
  categoryBreakdown?: Array<{ category: string; count: number }>;
}

export interface ProactiveActionCard {
  id: string;
  title: string;
  description: string;
  severity: 'green' | 'amber' | 'red';
  category: string;
  actionTaken?: boolean;
}

export interface PredictiveAnalytics {
  homestayName: string;
  forecastPeriod: string;
  predictedSatisfactionRate: number;
  predictedRisingComplaints: string[];
  predictedTrendingPositives: string[];
  seasonalInsights: string;
  proactiveActionCards: ProactiveActionCard[];
  forecastTrend: Array<{ period: string; actual?: number; predicted: number }>;
  accuracyScore: number;
}


export interface LoggedAction {
  _id?: string;
  homestayId?: string;
  title: string;
  category: string;
  notes?: string;
  dateLogged: Date | string;
  complaintReductionPercent: number;
  satisfactionImprovementPercent: number;
  aiImpactSummary: string;
}

export interface GuestExperienceForecast {
  homestayName: string;
  predictedNPS: number;
  npsChange: number;
  repeatBookingProbability: number;
  loyaltyRiskLevel: 'green' | 'amber' | 'red';
  loyaltyInsights: string[];
  npsTrend: Array<{ period: string; historicalNPS?: number; predictedNPS: number }>;
}

export interface Review {
  _id: string;
  homestayId: string;
  platform?: string;
  reviewText: string;
  text: string; // virtual/backward compatibility
  sentiment: Sentiment;
  sentimentScore?: number;
  category: Category;
  keywords?: string[];
  keyPoints?: string[]; // for backward compatibility
  summary: string;
  suggestedResponse: string;
  improvementSuggestion?: string;
  analysis?: AnalysisResult;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ReviewDocument {
  _id?: string;
  homestayId: string;
  platform?: string;
  reviewText: string;
  text: string;
  sentiment: Sentiment;
  sentimentScore?: number;
  category: Category;
  keywords?: string[];
  keyPoints?: string[];
  summary: string;
  suggestedResponse: string;
  analysis?: AnalysisResult;
  createdAt: Date;
  updatedAt?: Date;
}

export interface DashboardStats {
  totalReviews: number;
  positiveReviews: number;
  neutralReviews: number;
  negativeReviews: number;
  averageSentimentScore: number;
  mostCommonCategory: Category | 'other';
  categoryBreakdown: Array<{ category: Category | string; count: number }>;
  sentimentTrend: Array<{ date: string; positive: number; neutral: number; negative: number }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  hasHomestay?: boolean;
}
