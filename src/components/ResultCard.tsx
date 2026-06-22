'use client';

import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { AnalysisResult } from '@/types';

interface ResultCardProps {
  result: AnalysisResult;
}

export default function ResultCard({ result }: ResultCardProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sentimentColors = {
    positive: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400',
    neutral: 'bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300',
    negative: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400',
  };

  const sentimentBgColors = {
    positive: 'bg-green-100 dark:bg-green-900/30',
    neutral: 'bg-gray-100 dark:bg-zinc-800',
    negative: 'bg-red-100 dark:bg-red-900/30',
  };

  const categoryIcons: Record<string, string> = {
    cleanliness: '🧹',
    communication: '💬',
    location: '📍',
    amenities: '🏠',
    host: '👋',
    value: '💰',
    other: '📝',
  };

  return (
    <div className="space-y-4">
      {/* Sentiment Section */}
      <div className="bg-card border border-border rounded-lg p-6 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-foreground mb-4">Analysis Results</h3>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Sentiment Badge */}
          <div className={`p-4 rounded-lg border ${sentimentColors[result.sentiment]}`}>
            <p className="text-xs font-medium opacity-75 mb-1">Sentiment</p>
            <p className="text-2xl font-bold capitalize">{result.sentiment}</p>
            {result.sentimentScore !== undefined && (
              <p className="text-xs opacity-60 mt-1">{(result.sentimentScore * 100).toFixed(0)}% confidence</p>
            )}
          </div>

          {/* Category Badge */}
          <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400">
            <p className="text-xs font-medium opacity-75 mb-1">Category</p>
            <p className="text-lg font-bold">
              {categoryIcons[result.category] || '📝'} {result.category}
            </p>
          </div>
        </div>

        {/* Key Points */}
        {result.keyPoints && result.keyPoints.length > 0 && (
          <div className="bg-muted/40 dark:bg-muted/20 rounded-lg p-4 mb-6 transition-colors duration-300">
            <h4 className="font-semibold text-foreground mb-3 text-sm">Key Points</h4>
            <ul className="space-y-2">
              {result.keyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-foreground/90">
                  <span className="text-blue-600 dark:text-blue-400 font-bold mt-0.5">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Suggested Response */}
      <div className="bg-card border border-border rounded-lg p-6 transition-colors duration-300">
        <h3 className="text-lg font-semibold text-foreground mb-4">Suggested Response</h3>

        <div className="bg-blue-50/50 dark:bg-blue-950/15 border border-blue-200/50 dark:border-blue-900/20 rounded-lg p-4 mb-4 relative">
          <p className="text-foreground/90 leading-relaxed text-sm whitespace-pre-wrap">
            {result.suggestedResponse}
          </p>

          <button
            onClick={() => copyToClipboard(result.suggestedResponse)}
            className="absolute top-2 right-2 p-2 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-blue-600 dark:text-blue-400"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Tip: Feel free to customize this response before posting to your listing.
        </p>
      </div>

      {/* Metadata */}
      <div className="bg-muted/30 dark:bg-muted/10 rounded-lg p-4">
        <p className="text-xs text-muted-foreground">
          Analyzed on {new Date(result.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
