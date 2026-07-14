'use client';

import { useState } from 'react';
import { Sparkles, ThumbsUp, ThumbsDown, Award, AlertCircle, FileText, Check, Compass, Wifi, VolumeX } from 'lucide-react';
import { exportReportAsPDF, downloadFile, sanitizeFilename } from '@/lib/export';

interface ResultCardProps {
  result: any;
}

function parseAIInsight(rawText: any) {
  const result = {
    topAssets: [] as { title: string; description: string }[],
    operationalRisks: [] as { title: string; description: string }[],
    businessSummary: {
      plusPoints: [] as string[],
      problems: [] as string[],
      fixes: [] as string[]
    }
  };

  if (!rawText) return null;

  // Support pre-parsed objects
  if (typeof rawText === 'object') {
    return {
      topAssets: rawText.topAssets || [],
      operationalRisks: rawText.operationalRisks || [],
      businessSummary: rawText.businessSummary || { plusPoints: [], problems: [], fixes: [] }
    };
  }

  if (typeof rawText !== 'string') return null;

  // 1. Check if it's already a JSON string of businessSummary
  try {
    const cleanedText = rawText.trim().replace(/^```json\s*/i, '').replace(/```$/, '');
    const parsed = JSON.parse(cleanedText);
    
    // If it has topAssets/operationalRisks wrap structure
    if (parsed.topAssets || parsed.operationalRisks || parsed.businessSummary) {
      return {
        topAssets: parsed.topAssets || [],
        operationalRisks: parsed.operationalRisks || [],
        businessSummary: parsed.businessSummary || { plusPoints: [], problems: [], fixes: [] }
      };
    }

    // If it's a parsed businessSummary JSON directly
    if (Array.isArray(parsed.plusPoints) || Array.isArray(parsed.problems) || Array.isArray(parsed.fixes)) {
      result.businessSummary.plusPoints = parsed.plusPoints || [];
      result.businessSummary.problems = parsed.problems || [];
      result.businessSummary.fixes = parsed.fixes || [];
      return result;
    }
  } catch (e) {
    // Continue parsing as raw text
  }

  // 2. Fallback: Parse markdown sections on-the-fly
  const lines = rawText.split('\n');
  let currentSection: 'none' | 'plus' | 'problems' | 'fixes' = 'none';

  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine) continue;

    const lowerLine = cleanLine.toLowerCase();

    // Check if it's a section header line
    if (lowerLine.includes('positive') || lowerLine.includes('good things') || lowerLine.includes('plus point') || lowerLine.includes('asset')) {
      currentSection = 'plus';
      continue;
    } else if (lowerLine.includes('complaint') || lowerLine.includes('bad things') || lowerLine.includes('problem') || lowerLine.includes('risk')) {
      currentSection = 'problems';
      continue;
    } else if (lowerLine.includes('actionable') || lowerLine.includes('fix') || lowerLine.includes('improvement') || lowerLine.includes('recommendation')) {
      currentSection = 'fixes';
      continue;
    }

    // Extract item content (remove bullets, bold prefixes etc.)
    let content = cleanLine.replace(/^[*-\d.\s]+/, '').trim(); // Remove list bullet
    content = content.replace(/^\*\*(.*?)\*\*[:\s]*/, '$1: ').trim(); // Remove bold prefix formatting if any
    
    if (content) {
      if (currentSection === 'plus') {
        result.businessSummary.plusPoints.push(content);
      } else if (currentSection === 'problems') {
        result.businessSummary.problems.push(content);
      } else if (currentSection === 'fixes') {
        result.businessSummary.fixes.push(content);
      }
    }
  }

  // If fallback failed to extract anything, put the raw text in the fixes array as a single item
  if (result.businessSummary.plusPoints.length === 0 && result.businessSummary.problems.length === 0 && result.businessSummary.fixes.length === 0) {
    result.businessSummary.fixes.push(rawText);
  }

  return result;
}

export default function ResultCard({ result }: ResultCardProps) {
  const [isExportingPDF, setIsExportingPDF] = useState(false);

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

  const parsedInsights = parseAIInsight(aiSuggestions);

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-[#E2E8F0] border border-slate-200 dark:border-slate-200/60 rounded-2xl shadow-sm">
        <div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Insights Summary for Owner
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-500">Owner-focused feedback analysis</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5" />
            PDF
          </button>
        </div>
      </div>

      {/* Overall Sentiment Breakdown Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-[#E2E8F0] border-2 border-emerald-500/20 p-4 rounded-2xl text-center shadow-sm">
          <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">Positive</p>
          <p className="text-2xl font-extrabold text-emerald-600">{sentimentOverview.positive}%</p>
        </div>

        <div className="bg-white dark:bg-[#E2E8F0] border-2 border-slate-200/80 p-4 rounded-2xl text-center shadow-sm">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Neutral</p>
          <p className="text-2xl font-extrabold text-slate-600">{sentimentOverview.neutral}%</p>
        </div>

        <div className="bg-white dark:bg-[#E2E8F0] border-2 border-rose-500/20 p-4 rounded-2xl text-center shadow-sm">
          <p className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider mb-1">Negative</p>
          <p className="text-2xl font-extrabold text-rose-600">{sentimentOverview.negative}%</p>
        </div>
      </div>

      {/* Actionable Improvement Suggestion for Owner (Highlighted in Emerald/Green Brand theme, matching mockup layout) */}
      {parsedInsights && (
        <div className="bg-white dark:bg-[#E2E8F0] border-2 border-emerald-500/20 rounded-2xl p-6 shadow-md space-y-6">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-900 font-bold text-sm">
            <Sparkles className="w-5 h-5 text-slate-900 dark:text-slate-900" />
            Actionable Improvement Suggestion for Owner
          </div>

          {/* 1. TOP BRAND ASSET (Positive) */}
          {parsedInsights.topAssets.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                ✨ TOP BRAND ASSET (Positive)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parsedInsights.topAssets.map((asset, index) => (
                  <div key={index} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-50 border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-800">
                      <span>{index === 0 ? '✨' : '🍳'}</span>
                      <span>{asset.title}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed">{asset.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. OPERATIONAL RISKS (recurring complaints) */}
          {parsedInsights.operationalRisks.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                ⚠️ OPERATIONAL RISKS (recurring complaints)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parsedInsights.operationalRisks.map((risk, index) => {
                  const lowerTitle = risk.title.toLowerCase();
                  const lowerDesc = risk.description.toLowerCase();
                  let IconComponent = AlertCircle;
                  if (lowerTitle.includes('clean') || lowerDesc.includes('clean') || lowerTitle.includes('maintenance')) {
                    IconComponent = AlertCircle;
                  } else if (lowerTitle.includes('wi-fi') || lowerTitle.includes('wifi') || lowerTitle.includes('infra') || lowerDesc.includes('water') || lowerDesc.includes('geyser') || lowerDesc.includes('power')) {
                    IconComponent = Wifi;
                  } else if (lowerTitle.includes('noise') || lowerDesc.includes('noise') || lowerTitle.includes('sound')) {
                    IconComponent = VolumeX;
                  }

                  return (
                    <div key={index} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-50 border border-slate-200/80 flex gap-3">
                      <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 self-start">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="font-bold text-xs text-slate-800 dark:text-slate-800">{risk.title}</h5>
                        <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed">{risk.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actionable Improvement Suggestions for Owner - Three Frames */}
          {parsedInsights.businessSummary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Plus Points Frame */}
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 space-y-3">
                <h4 className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                  <ThumbsUp className="w-4 h-4" />
                  Plus Points
                </h4>
                <div className="space-y-2">
                  {parsedInsights.businessSummary.plusPoints.length > 0 ? (
                    parsedInsights.businessSummary.plusPoints.map((item, idx) => (
                      <div key={idx} className="px-4.5 py-3 rounded-xl bg-white border border-emerald-500/10 text-xs text-slate-800 flex items-start gap-2.5 shadow-sm leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                        <span>{item}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No specific strengths listed.</p>
                  )}
                </div>
              </div>

              {/* Problems Frame */}
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5 space-y-3">
                <h4 className="text-[10px] font-bold text-rose-600 dark:text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
                  <ThumbsDown className="w-4 h-4" />
                  Problems
                </h4>
                <div className="space-y-2">
                  {parsedInsights.businessSummary.problems.length > 0 ? (
                    parsedInsights.businessSummary.problems.map((item, idx) => (
                      <div key={idx} className="px-4.5 py-3 rounded-xl bg-white border border-rose-500/10 text-xs text-slate-800 flex items-start gap-2.5 shadow-sm leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0 mt-1.5" />
                        <span>{item}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No active problems reported.</p>
                  )}
                </div>
              </div>

              {/* Fix Frame */}
              <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-5 space-y-3">
                <h4 className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-4 h-4" />
                  Fixes / Solutions
                </h4>
                <div className="space-y-2">
                  {parsedInsights.businessSummary.fixes.length > 0 ? (
                    parsedInsights.businessSummary.fixes.map((item, idx) => (
                      <div key={idx} className="px-4.5 py-3 rounded-xl bg-white border border-purple-500/10 text-xs text-slate-800 flex items-start gap-2.5 shadow-sm leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0 mt-1.5" />
                        <span>{item}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No immediate fixes needed.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Appreciated Features & Top Complaints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#E2E8F0] border border-slate-200 dark:border-slate-200/80 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs mb-3">
            <ThumbsUp className="w-4 h-4" />
            Top Appreciated Features
          </div>
          {topAppreciated.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {topAppreciated.map((feat: string, idx: number) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-medium capitalize">
                  ✓ {feat}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-500">No specific features highlighted yet.</p>
          )}
        </div>

        <div className="bg-white dark:bg-[#E2E8F0] border border-slate-200 dark:border-slate-200/80 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-rose-600 font-semibold text-xs mb-3">
            <ThumbsDown className="w-4 h-4" />
            Top Complaint Categories
          </div>
          {topComplaints.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {topComplaints.map((comp: string, idx: number) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 border border-rose-500/20 text-xs font-medium capitalize">
                  ⚠ {comp}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-600 font-medium">No recurring complaints!</p>
          )}
        </div>
      </div>
    </div>
  );
}
