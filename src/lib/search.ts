import type { Sentiment, Category } from '@/types';

export interface SearchParams {
  query?: string;
  sentiment?: Sentiment | 'all';
  category?: Category | 'all';
  dateFrom?: string;
  dateTo?: string;
  skip?: number;
  limit?: number;
}

export interface SearchResult {
  id: string;
  text: string;
  sentiment: Sentiment;
  category: Category;
  createdAt: Date;
  score?: number;
}

export function buildSearchQuery(params: SearchParams): Record<string, any> {
  const query: Record<string, any> = {};

  // Text search
  if (params.query && params.query.trim()) {
    query.$text = { $search: params.query };
  }

  // Sentiment filter
  if (params.sentiment && params.sentiment !== 'all') {
    query.sentiment = params.sentiment;
  }

  // Category filter
  if (params.category && params.category !== 'all') {
    query.category = params.category;
  }

  // Date range filter
  if (params.dateFrom || params.dateTo) {
    query.createdAt = {};

    if (params.dateFrom) {
      const fromDate = new Date(params.dateFrom);
      fromDate.setHours(0, 0, 0, 0);
      query.createdAt.$gte = fromDate;
    }

    if (params.dateTo) {
      const toDate = new Date(params.dateTo);
      toDate.setHours(23, 59, 59, 999);
      query.createdAt.$lte = toDate;
    }
  }

  return query;
}

export function buildSearchSort(params: SearchParams): Record<string, any> {
  if (params.query && params.query.trim()) {
    // If searching text, sort by relevance score first
    return { score: { $meta: 'textScore' }, createdAt: -1 };
  }

  // Default sort by creation date descending
  return { createdAt: -1 };
}

export function highlightSearchResult(text: string, query: string): string {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

export function validateSearchParams(params: any): SearchParams {
  const validated: SearchParams = {};

  if (params.query && typeof params.query === 'string') {
    validated.query = params.query.trim();
  }

  if (params.sentiment && typeof params.sentiment === 'string') {
    const sentiment = params.sentiment.toLowerCase();
    if (['positive', 'neutral', 'negative', 'all'].includes(sentiment)) {
      validated.sentiment = sentiment as any;
    }
  }

  if (params.category && typeof params.category === 'string') {
    const category = params.category.toLowerCase();
    if (['cleanliness', 'communication', 'location', 'amenities', 'host', 'value', 'other', 'all'].includes(category)) {
      validated.category = category as any;
    }
  }

  if (params.dateFrom && typeof params.dateFrom === 'string') {
    try {
      new Date(params.dateFrom);
      validated.dateFrom = params.dateFrom;
    } catch (e) {
      // Invalid date, skip
    }
  }

  if (params.dateTo && typeof params.dateTo === 'string') {
    try {
      new Date(params.dateTo);
      validated.dateTo = params.dateTo;
    } catch (e) {
      // Invalid date, skip
    }
  }

  if (params.skip && !isNaN(parseInt(params.skip))) {
    validated.skip = Math.max(0, parseInt(params.skip));
  }

  if (params.limit && !isNaN(parseInt(params.limit))) {
    validated.limit = Math.min(100, Math.max(1, parseInt(params.limit)));
  }

  return validated;
}
