// Review Analysis Types
export type Sentiment = 'positive' | 'neutral' | 'negative';

export type Category =
  | 'cleanliness'
  | 'communication'
  | 'location'
  | 'amenities'
  | 'host'
  | 'value'
  | 'other';

export interface ReviewAnalysis {
  sentiment: Sentiment;
  category: Category;
  response: string;
  keyPoints?: string[];
  sentimentScore?: number;
}

export interface AnalysisResult {
  _id?: string;
  sentiment: Sentiment;
  sentimentScore?: number;
  category: Category;
  keyPoints?: string[];
  suggestedResponse: string;
  createdAt: Date;
}

export interface Review {
  _id: string;
  text: string;
  sentiment: Sentiment;
  sentimentScore?: number;
  category: Category;
  keyPoints?: string[];
  suggestedResponse: string;
  analysis?: AnalysisResult;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ReviewDocument {
  _id?: string;
  text: string;
  sentiment: Sentiment;
  sentimentScore?: number;
  category: Category;
  keyPoints?: string[];
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
  mostCommonCategory: Category;
  categoryBreakdown: Array<{ category: Category; count: number }>;
  sentimentTrend: Array<{ date: string; positive: number; neutral: number; negative: number }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
