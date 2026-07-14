'use client';

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  FileText, 
  Download, 
  RefreshCw, 
  Loader2, 
  AlertCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Award, 
  Calendar,
  Sparkles,
  BarChart2,
  BarChart3,
  Globe,
  Activity,
  Heart,
  Compass,
  Wifi,
  VolumeX
} from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  exportReportAsPDF, 
  downloadFile, 
  sanitizeFilename 
} from '@/lib/export';

interface ReportData {
  homestayName: string;
  guestSatisfactionRate: number;
  totalReviews: number;
  monthlyTrend: Array<{ month: string; positive: number; neutral: number; negative: number }>;
  topComplaints: string[];
  mostAppreciated: string[];
  categoryBreakdown: Array<{ category: string; count: number }>;
  aiSummary: string;
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

function ReportsContent() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [error, setError] = useState('');

  const [selectedRange, setSelectedRange] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const [predictionData, setPredictionData] = useState<any | null>(null);
  const [actionsData, setActionsData] = useState<any[]>([]);
  const [forecastData, setForecastData] = useState<any | null>(null);

  const fetchReports = useCallback(async (refresh: boolean = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError('');

    try {
      const queryParams = new URLSearchParams({
        range: selectedRange,
        month: selectedMonth,
        year: selectedYear,
      });
      if (refresh) queryParams.append('refresh', 'true');

      const [repRes, predRes, actRes, foreRes] = await Promise.all([
        fetch(`/api/reports?${queryParams.toString()}`),
        fetch(`/api/predictions${refresh ? '?refresh=true' : ''}`),
        fetch('/api/actions'),
        fetch(`/api/forecasting${refresh ? '?refresh=true' : ''}`),
      ]);

      if (!repRes.ok) {
        const errJson = await repRes.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to fetch report analytics');
      }

      const resData = await repRes.json();
      setReportData(resData.data || null);

      if (predRes.ok) {
        const predJson = await predRes.json();
        setPredictionData(predJson.data || null);
      }

      if (actRes.ok) {
        const aJson = await actRes.json();
        setActionsData(aJson.data || []);
      }

      if (foreRes.ok) {
        const fJson = await foreRes.json();
        setForecastData(fJson.data || null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load report data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedRange, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleExportPDF = async () => {
    if (!reportData) return;
    setIsExportingPDF(true);
    try {
      const pdfBytes = await exportReportAsPDF(reportData, reportData.homestayName);
      const filename = sanitizeFilename(reportData.homestayName, 'pdf');
      downloadFile(pdfBytes, filename, 'application/pdf');
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExportingPDF(false);
    }
  };


  const yearsOptions = ['all', '2026', '2025', '2024'];
  const monthsOptions = [
    { label: 'All Months', value: 'all' },
    { label: 'January', value: '1' },
    { label: 'February', value: '2' },
    { label: 'March', value: '3' },
    { label: 'April', value: '4' },
    { label: 'May', value: '5' },
    { label: 'June', value: '6' },
    { label: 'July', value: '7' },
    { label: 'August', value: '8' },
    { label: 'September', value: '9' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' },
  ];

  if (isLoading && !isRefreshing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Synthesizing Executive AI Reports...</p>
        </div>
      </div>
    );
  }

  if (!reportData || reportData.totalReviews === 0) {
    return (
      <main className="min-h-screen bg-[#faf8f5] dark:bg-none dark:bg-[#0b1220] transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <EmptyState
            icon={BarChart3}
            title="No data yet"
            description="Start analyzing reviews to see your performance reports."
            action={{ label: 'Go to Analyzer', href: '/analyzer' }}
          />
        </div>
      </main>
    );
  }

  const parsedInsights = reportData ? parseAIInsight(reportData.aiSummary) : null;

  return (
    <main className="min-h-screen bg-[#faf8f5] dark:bg-none dark:bg-[#0b1220] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-[#00C2A9] font-bold text-sm mb-1">
              <Sparkles className="w-4 h-4" />
              Executive Analytics & AI Insights
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {reportData?.homestayName || 'Homestay Performance Report'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Comprehensive tenant-isolated review synthesis and sentiment intelligence
            </p>
          </div>

          {/* Action Buttons & Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Frequency Range & Date Selector Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-[#faf8f5] border border-slate-200 dark:border-slate-300 p-1.5 rounded-xl text-xs shadow-sm text-slate-800 dark:text-slate-900">
              <Calendar className="w-4 h-4 text-slate-500 ml-1" />
              <select
                value={selectedRange}
                onChange={(e) => {
                  setSelectedRange(e.target.value);
                  if (e.target.value !== 'all') {
                    setSelectedMonth('all');
                    setSelectedYear('all');
                  }
                }}
                className="bg-transparent text-slate-800 dark:text-slate-900 font-semibold focus:outline-none cursor-pointer pr-1"
              >
                <option value="all" className="bg-white dark:bg-[#faf8f5] text-slate-800 dark:text-slate-900">All-Time</option>
                <option value="daily" className="bg-white dark:bg-[#faf8f5] text-slate-800 dark:text-slate-900">Daily (Today)</option>
                <option value="weekly" className="bg-white dark:bg-[#faf8f5] text-slate-800 dark:text-slate-900">Weekly (Last 7 Days)</option>
                <option value="monthly" className="bg-white dark:bg-[#faf8f5] text-slate-800 dark:text-slate-900">Monthly (Last 30 Days)</option>
                <option value="yearly" className="bg-white dark:bg-[#faf8f5] text-slate-800 dark:text-slate-900">Yearly (Last 365 Days)</option>
              </select>

              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setSelectedRange('all');
                }}
                className="bg-transparent text-slate-800 dark:text-slate-900 font-medium focus:outline-none cursor-pointer border-l border-slate-200 dark:border-slate-300 pl-2 pr-1"
              >
                {monthsOptions.map((m) => (
                  <option key={m.value} value={m.value} className="bg-white dark:bg-[#faf8f5] text-slate-800 dark:text-slate-900">
                    {m.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-slate-900 font-medium focus:outline-none cursor-pointer border-l border-slate-200 dark:border-slate-300 pl-2"
              >
                {yearsOptions.map((y) => (
                  <option key={y} value={y} className="bg-white dark:bg-[#faf8f5] text-slate-800 dark:text-slate-900">
                    {y === 'all' ? 'All Years' : y}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => fetchReports(true)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#faf8f5] hover:bg-slate-50 dark:hover:bg-slate-100 text-slate-800 dark:text-slate-900 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-300 transition-all cursor-pointer disabled:opacity-50"
              title="Refresh Gemini AI Summary"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh AI
            </button>

            <button
              onClick={handleExportPDF}
              disabled={isExportingPDF || !reportData}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5" />
              {isExportingPDF ? 'Exporting...' : 'Export PDF'}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Metrics Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#5cdcd0] border border-[#5cdcd0] dark:bg-[#5cdcd0] dark:border-[#5cdcd0] p-6 rounded-2xl shadow-sm relative overflow-hidden group text-black">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-black/70">Guest Satisfaction</span>
              <Award className="w-5 h-5 text-black" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-slate-900">{reportData?.guestSatisfactionRate || 100}%</span>
              <span className="text-xs font-medium text-black/80">Positive sentiment ratio</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#faf8f5] border border-slate-200 dark:border-slate-300 p-6 rounded-2xl shadow-sm relative overflow-hidden group text-slate-900">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Analyzed Reviews</span>
              <BarChart2 className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-slate-900">{reportData?.totalReviews || 0}</span>
              <span className="text-xs text-slate-500">Evaluated records</span>
            </div>
          </div>

          <div className="bg-[#5cdcd0] border border-[#5cdcd0] dark:bg-[#5cdcd0] dark:border-[#5cdcd0] p-6 rounded-2xl shadow-sm relative overflow-hidden group text-black">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-black/70">Primary Focus Area</span>
              <AlertCircle className="w-5 h-5 text-black" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 capitalize">
                {reportData?.topComplaints?.[0] || 'Cleanliness & Comfort'}
              </span>
            </div>
          </div>
        </div>

        {/* Gemini AI Executive Summary Card */}
        {parsedInsights && (
          <div className="bg-white dark:bg-[#faf8f5] border border-slate-200 dark:border-slate-300 rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden space-y-6 text-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Business Insights</h2>
                  <p className="text-xs text-slate-500">Automated multi-review synthesis and strategic recommendations</p>
                </div>
              </div>
            </div>

            {/* 1. TOP BRAND ASSET (Positive) */}
            {parsedInsights.topAssets.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                  ✨ TOP BRAND ASSET (Positive)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {parsedInsights.topAssets.map((asset, index) => (
                    <div key={index} className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-1">
                      <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                        <span>{index === 0 ? '✨' : '🍳'}</span>
                        <span>{asset.title}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{asset.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. OPERATIONAL RISKS (recurring complaints) */}
            {parsedInsights.operationalRisks.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
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
                      <div key={index} className="p-4 rounded-xl bg-white dark:bg-[#faf8f5] border border-slate-200 dark:border-slate-300 flex gap-3 shadow-sm">
                        <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-600 self-start">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <h5 className="font-bold text-xs text-slate-800">{risk.title}</h5>
                          <p className="text-xs text-slate-500 leading-relaxed">{risk.description}</p>
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
                  <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
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
                  <h4 className="text-[10px] font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
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
                  <h4 className="text-[10px] font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1.5">
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

        {/* Highlights & Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Most Appreciated Features */}
          <div className="bg-white dark:bg-[#faf8f5] border border-slate-200 dark:border-slate-300 p-6 rounded-2xl shadow-sm text-slate-900">
            <div className="flex items-center gap-2 mb-4 text-emerald-600 font-semibold text-sm">
              <ThumbsUp className="w-4 h-4" />
              Most Appreciated Aspects
            </div>
            {reportData?.mostAppreciated && reportData.mostAppreciated.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {reportData.mostAppreciated.map((item, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-medium capitalize">
                    ✓ {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No specific features recorded yet.</p>
            )}
          </div>

          {/* Top Complaints */}
          <div className="bg-white dark:bg-[#faf8f5] border border-slate-200 dark:border-slate-300 p-6 rounded-2xl shadow-sm text-slate-900">
            <div className="flex items-center gap-2 mb-4 text-rose-600 font-semibold text-sm">
              <ThumbsDown className="w-4 h-4" />
              Recurring Improvement Areas
            </div>
            {reportData?.topComplaints && reportData.topComplaints.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {reportData.topComplaints.map((item, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20 text-xs font-medium capitalize">
                    ⚠ {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-emerald-600 font-medium">No recurring complaints detected! Excellent work.</p>
            )}
          </div>
        </div>

        {/* Monthly Sentiment Distribution Chart */}
        <div className="bg-white dark:bg-[#faf8f5] border border-slate-200 dark:border-slate-300 p-6 rounded-2xl shadow-sm text-slate-900">
          <h2 className="text-base font-bold text-slate-900 mb-4">Monthly Sentiment Distribution & Trend</h2>
          {reportData?.monthlyTrend && reportData.monthlyTrend.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.monthlyTrend} barGap={10} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#64748b" 
                    fontSize={11} 
                    fontWeight={500}
                    axisLine={false} 
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={11} 
                    fontWeight={500}
                    axisLine={false} 
                    tickLine={false}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      borderColor: '#cbd5e1', 
                      borderRadius: '1rem', 
                      color: '#0f172a',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
                      fontSize: '11px',
                      padding: '8px 12px'
                    }} 
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '15px' }}
                  />
                  <Bar dataKey="positive" name="Positive" fill="#00c2a9" radius={[6, 6, 0, 0]} maxBarSize={60} />
                  <Bar dataKey="neutral" name="Neutral" fill="#4b5563" radius={[6, 6, 0, 0]} maxBarSize={60} />
                  <Bar dataKey="negative" name="Negative" fill="#111111" radius={[6, 6, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-xs text-slate-500">
              No monthly trend records available.
            </div>
          )}
        </div>

        {/* Category Frequency Progress Bars */}
        {reportData?.categoryBreakdown && reportData.categoryBreakdown.length > 0 && (
          <div className="bg-white dark:bg-[#faf8f5] border border-slate-200 dark:border-slate-300 p-6 rounded-2xl shadow-sm text-slate-900">
            <h2 className="text-base font-bold text-slate-900 mb-4">Category Frequency Breakdown</h2>
            <div className="space-y-4">
              {reportData.categoryBreakdown.map((cat, index) => {
                const percentage = reportData.totalReviews > 0 ? Math.round((cat.count / reportData.totalReviews) * 100) : 0;
                return (
                  <div key={index} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="capitalize text-slate-800">{cat.category}</span>
                      <span className="text-slate-500">{cat.count} reviews ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}


        {/* Operational Action Impact Section */}
        {actionsData.length > 0 && (
          <div className="bg-white dark:bg-[#faf8f5] border border-slate-200 dark:border-slate-300 p-6 rounded-2xl shadow-sm space-y-4 text-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  Logged Operational Action Impact
                </h2>
                <p className="text-xs text-slate-500">Measured reduction in guest complaints before vs after operational changes</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Impact Verified
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {actionsData.map((act: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white dark:bg-slate-100 border border-slate-200 capitalize text-slate-800">
                      {act.category}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-600">
                      -{act.complaintReductionPercent}% Complaints
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{act.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{act.aiImpactSummary}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guest Experience & NPS Forecast Section */}
        {forecastData && (
          <div className="bg-white dark:bg-[#faf8f5] border border-slate-200 dark:border-slate-300 p-6 rounded-2xl shadow-sm space-y-6 text-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-purple-500" />
                  Guest Experience & Loyalty Forecast
                </h2>
                <p className="text-xs text-slate-500">Historical vs Predicted Net Promoter Score (NPS) and Repeat Booking Probability</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20 capitalize">
                {forecastData.loyaltyRiskLevel} Loyalty Risk
              </span>
            </div>


            {/* NPS Forecast Chart */}
            {forecastData.npsTrend && (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastData.npsTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.3} vertical={false} />
                    <XAxis 
                      dataKey="period" 
                      tickFormatter={(tick) => {
                        if (tick === 'Q1') return 'Q1 (Jan-Mar)';
                        if (tick === 'Q2') return 'Q2 (Apr-Jun)';
                        if (tick === 'Q3 (Current)' || tick === 'Q3') return 'Q3 (Jul-Sep, Current)';
                        if (tick === 'Q4 (Forecast)' || tick === 'Q4') return 'Q4 (Oct-Dec, Forecast)';
                        return tick;
                      }}
                      stroke="#64748b" 
                      fontSize={11} 
                      fontWeight={500}
                      axisLine={false} 
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis 
                      domain={[50, 100]} 
                      stroke="#64748b" 
                      fontSize={11} 
                      fontWeight={500}
                      axisLine={false} 
                      tickLine={false}
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        borderColor: '#cbd5e1', 
                        borderRadius: '1rem', 
                        color: '#0f172a',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
                        fontSize: '11px',
                        padding: '8px 12px'
                      }} 
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '15px' }}
                    />
                    <Line type="monotone" dataKey="historicalNPS" name="Historical NPS" stroke="#00c2a9" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="predictedNPS" name="Predicted NPS" stroke="#8b5cf6" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <ReportsContent />
    </ProtectedRoute>
  );
}
