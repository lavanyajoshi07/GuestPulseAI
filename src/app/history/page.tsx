'use client';

import { useState, useEffect } from 'react';
import ReviewCard from '@/components/ReviewCard';
import ResultCard from '@/components/ResultCard';
import EmptyState from '@/components/EmptyState';
import ProtectedRoute from '@/components/ProtectedRoute';
import { History, Loader2, AlertCircle, X, Sparkles, Globe, Activity, Heart } from 'lucide-react';
import type { Review, AnalysisResult } from '@/types';

function HistoryContent() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [predictions, setPredictions] = useState<any | null>(null);
  const [loggedActions, setLoggedActions] = useState<any[]>([]);
  const [forecastData, setForecastData] = useState<any | null>(null);
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
      const [revRes, predRes, actRes, foreRes] = await Promise.all([
        fetch('/api/reviews'),
        fetch('/api/predictions'),
        fetch('/api/actions'),
        fetch('/api/forecasting'),
      ]);

      if (revRes.ok) {
        const data = await revRes.json();
        setReviews(data.data || []);
      }
      if (predRes.ok) {
        const pData = await predRes.json();
        setPredictions(pData.data || null);
      }
      if (actRes.ok) {
        const aData = await actRes.json();
        setLoggedActions(aData.data || []);
      }
      if (foreRes.ok) {
        const fData = await foreRes.json();
        setForecastData(fData.data || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.text ? review.text.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    const matchesSentiment = filterSentiment === 'all' || review.sentiment === filterSentiment;
    return matchesSearch && matchesSentiment;
  });

  const handleReviewClick = (review: Review) => {
    setSelectedReview(review);
  };

  return (
    <main className="min-h-screen bg-[#f4f2ee] dark:bg-[#0B1220] transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Review History</h1>
          <p className="text-muted-foreground">
            Browse all analyzed reviews and historical data.
          </p>
        </div>


        {/* Search and Filter */}
        <div className="bg-card dark:bg-[#16212E] rounded-lg shadow-sm border border-border dark:border-[#1E2D3D] p-6 mb-8 transition-colors duration-300">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 bg-background dark:bg-[#0B1220] border border-border dark:border-[#1E2D3D] text-foreground dark:text-[#E9F1F3] rounded-lg focus:ring-2 focus:ring-[#00C2A9] focus:border-transparent transition-colors"
            />
            <select
              value={filterSentiment}
              onChange={(e) => setFilterSentiment(e.target.value)}
              className="px-4 py-2 bg-background dark:bg-[#0B1220] border border-border dark:border-[#1E2D3D] text-foreground dark:text-[#E9F1F3] rounded-lg focus:ring-2 focus:ring-[#00C2A9] focus:border-transparent transition-colors cursor-pointer"
            >
              <option value="all" className="dark:bg-[#16212E]">All Sentiments</option>
              <option value="positive" className="dark:bg-[#16212E]">Positive Only</option>
              <option value="neutral" className="dark:bg-[#16212E]">Neutral Only</option>
              <option value="negative" className="dark:bg-[#16212E]">Negative Only</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-950 dark:text-red-400 mb-1">Error</h3>
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredReviews.length === 0 && (
          <EmptyState
            icon={History}
            title="No reviews found"
            description={reviews.length === 0 ? "You haven't analyzed any reviews yet." : "No reviews match your filter criteria."}
            action={{ label: 'Go to Analyzer', href: '/analyzer' }}
          />
        )}

        {/* Reviews Grid */}
        {!isLoading && !error && filteredReviews.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((review) => (
              <div
                key={review._id}
                onClick={() => handleReviewClick(review)}
                className="cursor-pointer transition-transform hover:scale-[1.02]"
              >
                <ReviewCard review={review} />
              </div>
            ))}
          </div>
        )}

        {/* Selected Review Modal */}
        {selectedReview && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#f4f2ee] dark:bg-[#16212E] border border-border dark:border-[#1E2D3D] rounded-2xl max-w-2xl w-full p-8 relative shadow-xl">
              <button
                onClick={() => setSelectedReview(null)}
                className="absolute top-6 right-6 text-muted-foreground dark:text-slate-400 hover:text-foreground dark:hover:text-slate-200 p-1.5 rounded-lg transition-colors border border-transparent hover:border-border dark:hover:border-[#1E2D3D] hover:bg-muted/50 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="space-y-4">
                <span className="text-xs font-bold text-muted-foreground dark:text-slate-400 uppercase tracking-widest">Review Text</span>
                <p className="text-foreground dark:text-slate-800 text-base leading-relaxed bg-[#f4f2ee] dark:bg-[#E2E8F0] p-5 rounded-xl border border-border dark:border-slate-300 font-medium">
                  "{selectedReview.text}"
                </p>
              </div>
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
