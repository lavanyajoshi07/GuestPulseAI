'use client';

import { useState } from 'react';
import ReviewForm from '@/components/ReviewForm';
import ResultCard from '@/components/ResultCard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AlertCircle, Loader2, Sparkles, FileSearch } from 'lucide-react';
import ShaderBackground from '@/components/ShaderBackground';

function AnalyzerContent() {
  const [result, setResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async (payload: { review?: string; reviews?: string[]; filename?: string }) => {
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to analyze review dataset');
      }

      const resData = await response.json();
      setResult(resData.data || resData);
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f2ee] dark:bg-[#0B1220] text-foreground dark:text-[#B6C7C9] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="pb-6 border-b border-border dark:border-[#1E2D3D]">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-[#00C2A9] font-semibold text-sm mb-1">
            <Sparkles className="w-4 h-4" />
            GuestPulse AI Review Intelligence
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-[#E9F1F3]">
            Review Analyzer
          </h1>
          <p className="text-muted-foreground dark:text-[#B6C7C9] text-sm mt-1">
            Upload CSV, PDF, or PNG review data to extract operational insights and actionable business improvements.
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Panel: Upload & Analyze Section (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-[#16212E] rounded-2xl shadow-md border border-slate-200 dark:border-[#1E2D3D] p-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-850 dark:text-[#E9F1F3] font-bold text-base mb-2">
              <FileSearch className="w-5 h-5 text-emerald-600 dark:text-[#00C2A9]" />
              Upload & Analyze Reviews
            </div>
            <ReviewForm onSubmit={handleAnalyze} isLoading={isLoading} />
          </div>

          {/* Right Panel: Analysis Results & Owner Suggestions (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {isLoading && (
              <div className="bg-white dark:bg-[#16212E] rounded-2xl shadow-md border border-slate-200 dark:border-[#1E2D3D] p-12 flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-emerald-600 dark:text-[#00C2A9] animate-spin mb-4" />
                <p className="text-sm font-semibold text-slate-800 dark:text-[#E9F1F3]">Synthesizing Feedback Dataset...</p>
                <p className="text-xs text-slate-500 dark:text-[#B6C7C9] mt-1">Extracting sentiment breakdown and Gemini owner insights</p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-3 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm mb-1">Analysis Error</h3>
                  <p className="text-xs">{error}</p>
                </div>
              </div>
            )}

            {result && !isLoading && (
              <ResultCard result={result} />
            )}

            {!result && !isLoading && !error && (
              <div className="bg-white dark:bg-[#16212E] border border-slate-200 dark:border-[#1E2D3D] rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 mb-4">
                  <Sparkles className="w-8 h-8 opacity-50 text-slate-400" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-[#E9F1F3] mb-1">No Dataset Analyzed Yet</h3>
                <p className="text-xs text-slate-500 dark:text-[#B6C7C9] max-w-sm">
                  Upload a CSV, PDF, or PNG review file on the left panel to generate actionable operational suggestions for your homestay.
                </p>
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
