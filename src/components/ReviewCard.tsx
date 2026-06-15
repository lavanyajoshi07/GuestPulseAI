'use client';

import { ChevronRight } from 'lucide-react';
import type { Review } from '@/types';

interface ReviewCardProps {
  review: Review;
  onClick?: () => void;
}

export default function ReviewCard({ review, onClick }: ReviewCardProps) {
  const sentimentBgColors: Record<string, string> = {
    positive: 'bg-green-100 text-green-800',
    neutral: 'bg-gray-100 text-gray-800',
    negative: 'bg-red-100 text-red-800',
  };

  const sentimentEmoji: Record<string, string> = {
    positive: '😊',
    neutral: '😐',
    negative: '😞',
  };

  return (
    <button
      onClick={onClick}
      className="w-full bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow text-left hover:border-gray-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${sentimentBgColors[review.sentiment]}`}>
              {sentimentEmoji[review.sentiment]} {review.sentiment}
            </span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {review.category}
            </span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>

      <p className="text-gray-700 text-sm line-clamp-2 mb-3">
        {review.text}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
        {review.sentimentScore !== undefined && (
          <span>Confidence: {(review.sentimentScore * 100).toFixed(0)}%</span>
        )}
      </div>
    </button>
  );
}
