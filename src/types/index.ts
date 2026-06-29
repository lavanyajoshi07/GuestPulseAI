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
  response?: string; // Professional response suggestion
  suggestedResponse?: string;
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
  createdAt: Date;
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
