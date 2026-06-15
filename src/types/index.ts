// Review Analysis Types
export type Sentiment = 'Positive' | 'Neutral' | 'Negative';

export type Category =
  | 'Food'
  | 'Cleanliness'
  | 'Location'
  | 'Host'
  | 'Value'
  | 'Experience';

export interface ReviewAnalysis {
  sentiment: Sentiment;
  category: Category;
  response: string;
}

export interface ReviewDocument {
  _id?: string;
  reviewText: string;
  sentiment: Sentiment;
  category: Category;
  aiResponse: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface DashboardStats {
  totalReviews: number;
  positive: number;
  neutral: number;
  negative: number;
  sentimentBreakdown: {
    Positive: number;
    Neutral: number;
    Negative: number;
  };
  categoryBreakdown: {
    [key in Category]: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
