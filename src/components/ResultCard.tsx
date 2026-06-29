'use client';

import { useState } from 'react';
import { Sparkles, ThumbsUp, ThumbsDown, Award, AlertCircle, FileText, Download, Check } from 'lucide-react';
import { exportReportAsPDF, exportReportAsCSV, downloadFile, sanitizeFilename } from '@/lib/export';

interface ResultCardProps {
  result: any;
}

export default function ResultCard({ result }: ResultCardProps) {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);

  // Extract values from owner analysis payload or single review fallback
  const sentimentOverview = result.sentimentOverview || {
    positive: result.sentiment === 'positive' ? 100 : 0,
    neutral: result.sentiment === 'neutral' ? 100 : 0,
    negative: result.sentiment === 'negative' ? 100 : 0,
  };

  const topComplaints = result.topComplaints || (result.sentiment === 'negative' ? [result.category] : []);
  const topAppreciated = result.topAppreciated || (result.sentiment === 'positive' ? [result.category] : []);
  const aiSuggestions = result.aiSuggestions || result.improvementSuggestion || 'Maintain high operational standards and conduct routine guest satisfaction check-ins.';

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const reportPayload = {
        homestayName: 'Homestay Review Dataset',
        guestSatisfactionRate: sentimentOverview.positive,
        totalReviews: result.totalReviews || 1,
        mostAppreciated: topAppreciated,
        topComplaints: topComplaints,
        aiSummary: aiSuggestions,
        categoryBreakdown: result.categoryBreakdown || [{ category: result.category || 'experience', count: 1 }],
      };
      const pdfBytes = await exportReportAsPDF(reportPayload, 'Review_Analysis');
      const filename = sanitizeFilename('Analyzed_Reviews', 'pdf');
      downloadFile(pdfBytes, filename, 'application/pdf');
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportCSV = async () => {
    setIsExportingCSV(true);
    try {
      const reportPayload = {
        guestSatisfactionRate: sentimentOverview.positive,
        totalReviews: result.totalReviews || 1,
        mostAppreciated: topAppreciated,
        topComplaints: topComplaints,
        categoryBreakdown: result.categoryBreakdown || [{ category: result.category || 'experience', count: 1 }],
      };
      const csvStr = await exportReportAsCSV(reportPayload, 'Review_Analysis');
      const filename = sanitizeFilename('Analyzed_Reviews', 'csv');
      downloadFile(csvStr, filename, 'text/csv');
    } catch (err) {
      console.error('CSV export failed:', err);
    } finally {
      setIsExportingCSV(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl shadow-sm">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Insights Summary for Owner
          </h3>
          <p className="text-xs text-muted-foreground">Owner-focused feedback analysis</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={isExportingCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5" />
            PDF
          </button>
        </div>
      </div>

      {/* Overall Sentiment Breakdown Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-center">
          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Positive</p>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{sentimentOverview.positive}%</p>
        </div>

        <div className="bg-gray-500/10 border border-gray-500/20 p-4 rounded-2xl text-center">
          <p className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">Neutral</p>
          <p className="text-2xl font-extrabold text-gray-600 dark:text-gray-400">{sentimentOverview.neutral}%</p>
        </div>

        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-center">
          <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">Negative</p>
          <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">{sentimentOverview.negative}%</p>
        </div>
      </div>

      {/* Actionable Improvement Suggestion for Owner (Highlighted in Amber/Yellow) */}
      <div className="bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-card border-2 border-amber-500/40 rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-bold text-sm mb-3">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
            💡
          </div>
          Actionable Improvement Suggestion for Owner
        </div>
        <div className="text-foreground/90 text-sm leading-relaxed font-medium whitespace-pre-line bg-card/80 p-4 rounded-xl border border-amber-500/20 backdrop-blur-sm">
          {aiSuggestions}
        </div>
      </div>

      {/* Appreciated Features & Top Complaints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs mb-3">
            <ThumbsUp className="w-4 h-4" />
            Top Appreciated Features
          </div>
          {topAppreciated.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {topAppreciated.map((feat: string, idx: number) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-medium capitalize">
                  ✓ {feat}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No specific features highlighted yet.</p>
          )}
        </div>

        <div className="bg-card border border-border p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-xs mb-3">
            <ThumbsDown className="w-4 h-4" />
            Top Complaint Categories
          </div>
          {topComplaints.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {topComplaints.map((comp: string, idx: number) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-medium capitalize">
                  ⚠ {comp}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">No recurring complaints!</p>
          )}
        </div>
      </div>
    </div>
  );
}
