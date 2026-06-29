'use client';

import { ChevronRight } from 'lucide-react';
import type { Review } from '@/types';

interface ReviewCardProps {
  review: Review;
  onClick?: () => void;
}

export default function ReviewCard({ review, onClick }: ReviewCardProps) {
  const sentimentBgColors: Record<string, string> = {
    positive: 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400',
    neutral: 'bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300',
    negative: 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400',
  };

  const sentimentEmoji: Record<string, string> = {
    positive: '😊',
    neutral: '😐',
    negative: '😞',
  };

  return (
    <button
      onClick={onClick}
      className="w-full bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all text-left hover:border-muted-foreground/30 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${sentimentBgColors[review.sentiment]}`}>
              {sentimentEmoji[review.sentiment]} {review.sentiment}
            </span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded font-medium">
              {review.category}
            </span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
      </div>

      <p className="text-foreground/90 text-sm line-clamp-2 mb-3 leading-relaxed">
        {review.text || review.reviewText || ''}
      </p>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
        {review.sentimentScore !== undefined && (
          <span>Confidence: {(review.sentimentScore * 100).toFixed(0)}%</span>
        )}
      </div>
    </button>
  );
}
