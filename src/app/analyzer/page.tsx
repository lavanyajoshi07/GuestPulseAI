'use client';

import { useState } from 'react';
import ReviewForm from '@/components/ReviewForm';
import ResultCard from '@/components/ResultCard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { AnalysisResult } from '@/types';

function AnalyzerContent() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (review: string) => {
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to analyze review');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50/50 via-background to-background dark:from-blue-950/15 dark:via-background dark:to-background transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Review Analyzer</h1>
          <p className="text-muted-foreground">
            Paste a guest review below to get instant sentiment analysis and suggested responses.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-6 transition-colors duration-300">
            <h2 className="text-xl font-semibold text-foreground mb-6">New Analysis</h2>
            <ReviewForm onSubmit={handleAnalyze} isLoading={isLoading} />
          </div>

          {/* Results Section */}
          <div className="lg:col-span-1">
            {isLoading && (
              <div className="bg-card rounded-lg shadow-sm border border-border p-6 flex items-center justify-center h-full min-h-96 transition-colors duration-300">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Analyzing your review...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg p-6 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-950 dark:text-red-400 mb-1">Error</h3>
                  <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                </div>
              </div>
            )}

            {result && !isLoading && (
              <ResultCard result={result} />
            )}

            {!result && !isLoading && !error && (
              <div className="bg-card rounded-lg shadow-sm border border-border p-6 text-center transition-colors duration-300">
                <p className="text-muted-foreground">Results will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AnalyzerPage() {
  return (
    <ProtectedRoute>
      <AnalyzerContent />
    </ProtectedRoute>
  );
}
