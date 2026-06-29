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
  const [benchmarking, setBenchmarking] = useState<any | null>(null);
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
      const [revRes, predRes, benchRes, actRes, foreRes] = await Promise.all([
        fetch('/api/reviews'),
        fetch('/api/predictions'),
        fetch('/api/benchmarking'),
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
      if (benchRes.ok) {
        const bData = await benchRes.json();
        setBenchmarking(bData.data || null);
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
    <main className="min-h-screen bg-gradient-to-b from-blue-50/50 via-background to-background dark:from-blue-950/15 dark:via-background dark:to-background transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Review History & Predictive Log</h1>
          <p className="text-muted-foreground">
            Browse all analyzed reviews, historical data, and AI forecast accuracy metrics.
          </p>
        </div>

        {/* Phase 6, 7 & 9: Forecast Accuracy, Benchmarking & Loyalty Banners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {predictions && (
            <div className="bg-gradient-to-r from-purple-900/20 via-card to-blue-900/20 border border-purple-500/30 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  Phase 6: AI Accuracy
                </div>
                <p className="text-xs text-muted-foreground truncate">Period: {predictions.forecastPeriod}</p>
              </div>
              <div className="px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center flex-shrink-0">
                <span className="text-lg font-extrabold text-purple-600 dark:text-purple-400">{predictions.accuracyScore || 94}%</span>
              </div>
            </div>
          )}

          {benchmarking && (
            <div className="bg-gradient-to-r from-blue-900/20 via-card to-emerald-900/20 border border-blue-500/30 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                  <Globe className="w-4 h-4" />
                  Phase 7: Benchmark
                </div>
                <p className="text-xs text-muted-foreground truncate">vs Industry Avg ({benchmarking.industryAverageSatisfaction}%)</p>
              </div>
              <div className="px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center flex-shrink-0">
                <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400">+{benchmarking.ownerSatisfaction - benchmarking.industryAverageSatisfaction}%</span>
              </div>
            </div>
          )}

          {forecastData && (
            <div className="bg-gradient-to-r from-emerald-900/20 via-card to-purple-900/20 border border-emerald-500/30 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <Heart className="w-4 h-4" />
                  Phase 9: Loyalty NPS
                </div>
                <p className="text-xs text-muted-foreground truncate">{forecastData.repeatBookingProbability}% Repeat Visits</p>
              </div>
              <div className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center flex-shrink-0">
                <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{forecastData.predictedNPS} NPS</span>
              </div>
            </div>
          )}
        </div>

        {/* Phase 8: Operational Action History Log */}
        {loggedActions.length > 0 && (
          <div className="mb-8 bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Operational Actions History Log & Impact Metrics (Phase 8)
            </h3>
            <div className="space-y-3">
              {loggedActions.map((act: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-xl bg-muted/30 border border-border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-foreground text-sm">{act.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-card border border-border capitalize">{act.category}</span>
                    </div>
                    <p className="text-muted-foreground">{act.aiImpactSummary}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 text-right">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
                      -{act.complaintReductionPercent}% Complaints
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
              <option value="positive">Positive Only</option>
              <option value="neutral">Neutral Only</option>
              <option value="negative">Negative Only</option>
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
            <div className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
              <button
                onClick={() => setSelectedReview(null)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="mb-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Review Text</span>
                <p className="text-foreground mt-1 text-sm bg-muted/50 p-3 rounded-lg border border-border">"{selectedReview.text}"</p>
              </div>
              <ResultCard
                result={{
                  sentimentOverview: {
                    positivePercent: selectedReview.sentiment === 'positive' ? 100 : 0,
                    neutralPercent: selectedReview.sentiment === 'neutral' ? 100 : 0,
                    negativePercent: selectedReview.sentiment === 'negative' ? 100 : 0,
                    satisfactionRate: selectedReview.sentiment === 'positive' ? 100 : selectedReview.sentiment === 'neutral' ? 50 : 0,
                  },
                  topComplaints: selectedReview.sentiment === 'negative' ? [selectedReview.category] : [],
                  topAppreciated: selectedReview.sentiment === 'positive' ? [selectedReview.category] : [],
                  aiSuggestions: ['Review guest feedback and maintain high hospitality standards.'],
                }}
              />
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
