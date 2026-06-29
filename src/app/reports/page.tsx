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
  Globe,
  Activity,
  Heart
} from 'lucide-react';
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
  exportReportAsCSV, 
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

function ReportsContent() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [error, setError] = useState('');

  const [selectedRange, setSelectedRange] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const [predictionData, setPredictionData] = useState<any | null>(null);
  const [benchmarkingData, setBenchmarkingData] = useState<any | null>(null);
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

      const [repRes, predRes, benchRes, actRes, foreRes] = await Promise.all([
        fetch(`/api/reports?${queryParams.toString()}`),
        fetch(`/api/predictions${refresh ? '?refresh=true' : ''}`),
        fetch(`/api/benchmarking${refresh ? '?refresh=true' : ''}`),
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

      if (benchRes.ok) {
        const bJson = await benchRes.json();
        setBenchmarkingData(bJson.data || null);
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

  const handleExportCSV = async () => {
    if (!reportData) return;
    setIsExportingCSV(true);
    try {
      const csvStr = await exportReportAsCSV(reportData, reportData.homestayName);
      const filename = sanitizeFilename(reportData.homestayName, 'csv');
      downloadFile(csvStr, filename, 'text/csv');
    } catch (err) {
      console.error('CSV export failed:', err);
    } finally {
      setIsExportingCSV(false);
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm mb-1">
            <Sparkles className="w-4 h-4" />
            Executive Analytics & AI Insights
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {reportData?.homestayName || 'Homestay Performance Report'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Comprehensive tenant-isolated review synthesis and sentiment intelligence
          </p>
        </div>

        {/* Action Buttons & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Frequency Range & Date Selector Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 bg-card border border-border p-1.5 rounded-xl text-xs shadow-sm">
            <Calendar className="w-4 h-4 text-muted-foreground ml-1" />
            <select
              value={selectedRange}
              onChange={(e) => {
                setSelectedRange(e.target.value);
                if (e.target.value !== 'all') {
                  setSelectedMonth('all');
                  setSelectedYear('all');
                }
              }}
              className="bg-transparent text-foreground font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-card text-foreground">All-Time</option>
              <option value="daily" className="bg-card text-foreground">Daily (Today)</option>
              <option value="weekly" className="bg-card text-foreground">Weekly (Last 7 Days)</option>
              <option value="monthly" className="bg-card text-foreground">Monthly (Last 30 Days)</option>
              <option value="yearly" className="bg-card text-foreground">Yearly (Last 365 Days)</option>
            </select>

            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setSelectedRange('all');
              }}
              className="bg-transparent text-foreground font-medium focus:outline-none cursor-pointer border-l border-border pl-2 pr-1"
            >
              {monthsOptions.map((m) => (
                <option key={m.value} value={m.value} className="bg-card text-foreground">
                  {m.label}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-foreground font-medium focus:outline-none cursor-pointer border-l border-border pl-2"
            >
              {yearsOptions.map((y) => (
                <option key={y} value={y} className="bg-card text-foreground">
                  {y === 'all' ? 'All Years' : y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => fetchReports(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-accent hover:bg-accent/80 text-foreground text-xs font-medium rounded-xl border border-border transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Gemini AI Summary"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh AI
          </button>

          <button
            onClick={handleExportCSV}
            disabled={isExportingCSV || !reportData}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {isExportingCSV ? 'Exporting...' : 'Export CSV'}
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
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Guest Satisfaction</span>
            <Award className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">{reportData?.guestSatisfactionRate || 100}%</span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Positive sentiment ratio</span>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Analyzed Reviews</span>
            <BarChart2 className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">{reportData?.totalReviews || 0}</span>
            <span className="text-xs text-muted-foreground">Evaluated records</span>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Primary Focus Area</span>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground capitalize">
              {reportData?.topComplaints?.[0] || 'Cleanliness & Comfort'}
            </span>
          </div>
        </div>
      </div>

      {/* Gemini AI Executive Summary Card */}
      <div className="bg-gradient-to-br from-blue-900/10 via-card to-indigo-900/10 border border-blue-500/20 rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Gemini AI Executive Business Insights</h2>
              <p className="text-xs text-muted-foreground">Automated multi-review synthesis and strategic recommendations</p>
            </div>
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none text-sm text-foreground/90 whitespace-pre-line leading-relaxed bg-card/60 backdrop-blur-md p-6 rounded-2xl border border-border/60">
          {reportData?.aiSummary || 'No AI summary generated yet.'}
        </div>
      </div>

      {/* Highlights & Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Appreciated Features */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
            <ThumbsUp className="w-4 h-4" />
            Most Appreciated Aspects
          </div>
          {reportData?.mostAppreciated && reportData.mostAppreciated.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {reportData.mostAppreciated.map((item, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-medium capitalize">
                  ✓ {item}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No specific features recorded yet.</p>
          )}
        </div>

        {/* Top Complaints */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-rose-600 dark:text-rose-400 font-semibold text-sm">
            <ThumbsDown className="w-4 h-4" />
            Recurring Improvement Areas
          </div>
          {reportData?.topComplaints && reportData.topComplaints.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {reportData.topComplaints.map((item, idx) => (
                <span key={idx} className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-medium capitalize">
                  ⚠ {item}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">No recurring complaints detected! Excellent work.</p>
          )}
        </div>
      </div>

      {/* Monthly Sentiment Distribution Chart */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
        <h2 className="text-base font-bold text-foreground mb-4">Monthly Sentiment Distribution & Trend</h2>
        {reportData?.monthlyTrend && reportData.monthlyTrend.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.75rem', color: '#fff' }} 
                />
                <Legend />
                <Bar dataKey="positive" name="Positive" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="neutral" name="Neutral" fill="#6b7280" radius={[4, 4, 0, 0]} />
                <Bar dataKey="negative" name="Negative" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-xs text-muted-foreground">
            No monthly trend records available.
          </div>
        )}
      </div>

      {/* Category Frequency Progress Bars */}
      {reportData?.categoryBreakdown && reportData.categoryBreakdown.length > 0 && (
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-4">Category Frequency Breakdown</h2>
          <div className="space-y-4">
            {reportData.categoryBreakdown.map((cat, index) => {
              const percentage = reportData.totalReviews > 0 ? Math.round((cat.count / reportData.totalReviews) * 100) : 0;
              return (
                <div key={index} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="capitalize text-foreground">{cat.category}</span>
                    <span className="text-muted-foreground">{cat.count} reviews ({percentage}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Phase 6: Predictive Satisfaction Forecast Chart */}
      {predictionData?.forecastTrend && (
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Predictive Satisfaction Forecast (Phase 6 AI Engine)
              </h2>
              <p className="text-xs text-muted-foreground">Historical performance vs upcoming predictive forecast line</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">
              {predictionData.accuracyScore}% Forecast Accuracy
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predictionData.forecastTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="period" stroke="#9ca3af" fontSize={12} />
                <YAxis domain={[60, 100]} stroke="#9ca3af" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.75rem', color: '#fff' }} />
                <Legend />
                <Line type="monotone" dataKey="actual" name="Actual Satisfaction %" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="predicted" name="AI Forecast %" stroke="#8b5cf6" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Phase 7: Multi-Homestay & Competitive Benchmarking Section */}
      {benchmarkingData && (
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                Multi-Homestay & Regional Benchmarking (Phase 7 Engine)
              </h2>
              <p className="text-xs text-muted-foreground">Side-by-side comparative analysis across listings and regional benchmarks</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
              Regional AI Comparison
            </span>
          </div>

          {/* AI Competitive Insights list */}
          {benchmarkingData.competitiveInsights && benchmarkingData.competitiveInsights.length > 0 && (
            <div className="p-4 bg-muted/40 rounded-xl border border-border space-y-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">AI Competitive Intelligence Summary</h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {benchmarkingData.competitiveInsights.map((ins: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-500">•</span>
                    <span>{ins}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Property Comparisons Table */}
          {benchmarkingData.propertyComparisons && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3 rounded-l-xl">Property Name</th>
                    <th className="p-3">Satisfaction %</th>
                    <th className="p-3">Top Advantage</th>
                    <th className="p-3 rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50 text-foreground">
                  {benchmarkingData.propertyComparisons.map((prop: any, i: number) => (
                    <tr key={i}>
                      <td className="p-3 font-semibold">{prop.propertyName}</td>
                      <td className="p-3 font-bold text-emerald-500">{prop.satisfactionRate}%</td>
                      <td className="p-3 capitalize">{prop.topCategory}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          prop.status === 'Best Performer' ? 'bg-emerald-500/20 text-emerald-500' :
                          prop.status === 'Needs Attention' ? 'bg-rose-500/20 text-rose-500' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {prop.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Phase 8: Operational Action Impact Section */}
      {actionsData.length > 0 && (
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                Logged Operational Action Impact (Phase 8 Tracking Engine)
              </h2>
              <p className="text-xs text-muted-foreground">Measured reduction in guest complaints before vs after operational changes</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Impact Verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actionsData.map((act: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-card border border-border capitalize">
                    {act.category}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-500">
                    -{act.complaintReductionPercent}% Complaints
                  </span>
                </div>
                <h4 className="font-bold text-sm text-foreground">{act.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{act.aiImpactSummary}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Phase 9: Guest Experience & NPS Forecast Section */}
      {forecastData && (
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Heart className="w-4 h-4 text-purple-500" />
                Guest Experience & Loyalty Forecast (Phase 9 Engine)
              </h2>
              <p className="text-xs text-muted-foreground">Historical vs Predicted Net Promoter Score (NPS) and Repeat Booking Probability</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20 capitalize">
              {forecastData.loyaltyRiskLevel} Loyalty Risk
            </span>
          </div>

          {/* AI Loyalty Insights */}
          {forecastData.loyaltyInsights && (
            <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/20 space-y-2">
              <h4 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">AI Guest Loyalty Intelligence</h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {forecastData.loyaltyInsights.map((ins: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-500">•</span>
                    <span>{ins}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* NPS Forecast Chart */}
          {forecastData.npsTrend && (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastData.npsTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="period" stroke="#9ca3af" fontSize={12} />
                  <YAxis domain={[50, 100]} stroke="#9ca3af" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.75rem', color: '#fff' }} />
                  <Legend />
                  <Line type="monotone" dataKey="historicalNPS" name="Historical NPS" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="predictedNPS" name="Predicted NPS" stroke="#a855f7" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <ReportsContent />
    </ProtectedRoute>
  );
}
