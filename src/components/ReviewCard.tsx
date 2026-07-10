'use client';

import { ChevronRight } from 'lucide-react';
import type { Review } from '@/types';

interface ReviewCardProps {
  review: Review;
  onClick?: () => void;
}

export default function ReviewCard({ review, onClick }: ReviewCardProps) {
  const sentimentBgColors: Record<string, string> = {
    positive: 'bg-green-50 dark:bg-green-100 border border-green-200 dark:border-green-300 text-green-700 dark:text-green-800',
    neutral: 'bg-gray-50 dark:bg-slate-200 border border-gray-200 dark:border-slate-300 text-gray-700 dark:text-slate-800',
    negative: 'bg-red-50 dark:bg-red-100 border border-red-200 dark:border-red-300 text-red-700 dark:text-red-800',
  };

  const sentimentEmoji: Record<string, string> = {
    positive: '😊',
    neutral: '😐',
    negative: '😞',
  };

  return (
    <button
      onClick={onClick}
      className="w-full bg-card dark:bg-[#E2E8F0] border border-border dark:border-slate-300/80 rounded-lg p-4 hover:shadow-md transition-all text-left hover:border-muted-foreground/30 dark:hover:border-slate-400 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${sentimentBgColors[review.sentiment]}`}>
              {sentimentEmoji[review.sentiment]} {review.sentiment}
            </span>
            <span className="text-xs text-muted-foreground dark:text-slate-700 bg-muted dark:bg-slate-300/60 px-2 py-1 rounded font-medium border border-transparent dark:border-slate-300/40">
              {review.category}
            </span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground dark:text-slate-600" />
      </div>

      <p className="text-foreground/90 dark:text-slate-800 text-sm line-clamp-2 mb-3 leading-relaxed">
        {review.text || review.reviewText || ''}
      </p>

      <div className="flex items-center justify-between text-xs text-muted-foreground dark:text-slate-600">
        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
        {review.sentimentScore !== undefined && (
          <span>Confidence: {(review.sentimentScore * 100).toFixed(0)}%</span>
        )}
      </div>
    </button>
  );
}
