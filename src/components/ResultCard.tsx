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
    positive: 'bg-green-50 border-green-200 text-green-700',
    neutral: 'bg-gray-50 border-gray-200 text-gray-700',
    negative: 'bg-red-50 border-red-200 text-red-700',
  };

  const sentimentBgColors = {
    positive: 'bg-green-100',
    neutral: 'bg-gray-100',
    negative: 'bg-red-100',
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
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Results</h3>

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
          <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 text-blue-700">
            <p className="text-xs font-medium opacity-75 mb-1">Category</p>
            <p className="text-lg font-bold">
              {categoryIcons[result.category] || '📝'} {result.category}
            </p>
          </div>
        </div>

        {/* Key Points */}
        {result.keyPoints && result.keyPoints.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-3 text-sm">Key Points</h4>
            <ul className="space-y-2">
              {result.keyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Suggested Response */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested Response</h3>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 relative">
          <p className="text-gray-800 leading-relaxed text-sm whitespace-pre-wrap">
            {result.suggestedResponse}
          </p>

          <button
            onClick={() => copyToClipboard(result.suggestedResponse)}
            className="absolute top-2 right-2 p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Tip: Feel free to customize this response before posting to your listing.
        </p>
      </div>

      {/* Metadata */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-xs text-gray-500">
          Analyzed on {new Date(result.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
