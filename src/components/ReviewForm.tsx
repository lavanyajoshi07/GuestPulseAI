'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ReviewFormProps {
  onSubmit: (review: string) => Promise<void>;
  isLoading?: boolean;
}

export default function ReviewForm({ onSubmit, isLoading = false }: ReviewFormProps) {
  const [review, setReview] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!review.trim()) {
      setError('Please enter a review');
      return;
    }

    if (review.trim().length < 10) {
      setError('Review must be at least 10 characters');
      return;
    }

    try {
      await onSubmit(review);
      setReview('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze review');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="space-y-4">
        <div>
          <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
            Review Text
          </label>
          <textarea
            id="review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Paste a guest review here... (At least 10 characters)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={6}
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-2">
            {review.length} characters
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !review.trim()}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Analyze Review
            </>
          )}
        </button>
      </div>
    </form>
  );
}
