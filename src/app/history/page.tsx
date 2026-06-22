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
      setReviews(data.data || []);
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
    <main className="min-h-screen bg-gradient-to-b from-blue-50/50 via-background to-background dark:from-blue-950/15 dark:via-background dark:to-background transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Review History</h1>
          <p className="text-muted-foreground">
            Browse all analyzed reviews and view their analysis results.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-8 transition-colors duration-300">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 bg-background border border-border text-foreground rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
            <select
              value={filterSentiment}
              onChange={(e) => setFilterSentiment(e.target.value)}
              className="px-4 py-2 bg-background border border-border text-foreground rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
              <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading reviews...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg p-6 flex items-start gap-4 mb-8">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-950 dark:text-red-400 mb-1">Error</h3>
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
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
              <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden transition-colors duration-300">
                <div className="p-4 border-b border-border bg-muted/40">
                  <p className="font-semibold text-foreground">
                    Reviews ({filteredReviews.length})
                  </p>
                </div>
                <div className="divide-y divide-border max-h-96 overflow-y-auto">
                  {filteredReviews.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      No reviews match your filters
                    </div>
                  ) : (
                    filteredReviews.map((review) => (
                      <div key={review._id} className="cursor-pointer" onClick={() => handleReviewClick(review)}>
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
                  <div className="bg-card rounded-lg shadow-sm border border-border p-6 transition-colors duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground">Review</h3>
                      <button
                        onClick={() => setSelectedReview(null)}
                        className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-accent transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {selectedReview.text}
                    </p>
                  </div>

                  {/* Analysis */}
                  {selectedReview.analysis && (
                    <ResultCard result={selectedReview.analysis} />
                  )}
                </div>
              ) : (
                <div className="bg-card rounded-lg shadow-sm border border-border p-12 text-center transition-colors duration-300">
                  <p className="text-muted-foreground">Select a review to view details</p>
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
