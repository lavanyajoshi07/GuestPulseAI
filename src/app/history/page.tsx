'use client';

import { useState, useEffect } from 'react';
import ReviewCard from '@/components/ReviewCard';
import ResultCard from '@/components/ResultCard';
import EmptyState from '@/components/EmptyState';
import ProtectedRoute from '@/components/ProtectedRoute';
import { History, Loader2, AlertCircle, X } from 'lucide-react';
import type { Review, AnalysisResult } from '@/types';

function HistoryContent() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSentiment, setFilterSentiment] = useState<string>('all');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/reviews');
      if (!response.ok) throw new Error('Failed to load reviews');
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSentiment = filterSentiment === 'all' || review.sentiment === filterSentiment;
    return matchesSearch && matchesSentiment;
  });

  const handleReviewClick = (review: Review) => {
    setSelectedReview(review);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Review History</h1>
          <p className="text-gray-600">
            Browse all analyzed reviews and view their analysis results.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={filterSentiment}
              onChange={(e) => setFilterSentiment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading reviews...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4 mb-8">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {!isLoading && !error && reviews.length === 0 && (
          <EmptyState
            icon={History}
            title="No reviews yet"
            description="Start by analyzing a review to see your history here."
            action={{ label: 'Go to Analyzer', href: '/analyzer' }}
          />
        )}

        {!isLoading && !error && reviews.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Reviews List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <p className="font-semibold text-gray-900">
                    Reviews ({filteredReviews.length})
                  </p>
                </div>
                <div className="divide-y max-h-96 overflow-y-auto">
                  {filteredReviews.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No reviews match your filters
                    </div>
                  ) : (
                    filteredReviews.map((review) => (
                      <div key={review._id} onClick={() => handleReviewClick(review)}>
                        <ReviewCard review={review} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="lg:col-span-2">
              {selectedReview ? (
                <div className="space-y-4">
                  {/* Original Review */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Review</h3>
                      <button
                        onClick={() => setSelectedReview(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedReview.text}
                    </p>
                  </div>

                  {/* Analysis */}
                  {selectedReview.analysis && (
                    <ResultCard result={selectedReview.analysis} />
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <p className="text-gray-500">Select a review to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <HistoryContent />
    </ProtectedRoute>
  );
}
