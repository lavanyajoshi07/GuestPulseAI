'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/StatCard';
import EmptyState from '@/components/EmptyState';
import ProtectedRoute from '@/components/ProtectedRoute';
import { BarChart3, Loader2, AlertCircle, TrendingUp, Sparkles, Bell, CheckCircle2, Globe, Award, AlertTriangle, Plus, Activity, X, Heart, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { ProactiveActionCard, BenchmarkingData, LoggedAction, GuestExperienceForecast } from '@/types';

interface DashboardStats {
  totalReviews: number;
  positiveReviews: number;
  neutralReviews: number;
  negativeReviews: number;
  averageSentimentScore: number;
  mostCommonCategory: string;
  categoryBreakdown: Array<{ category: string; count: number }>;
  sentimentTrend: Array<{ date: string; positive: number; neutral: number; negative: number }>;
}

function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [actionCards, setActionCards] = useState<ProactiveActionCard[]>([]);
  const [seasonalInsights, setSeasonalInsights] = useState<string>('');
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkingData | null>(null);
  const [loggedActions, setLoggedActions] = useState<LoggedAction[]>([]);
  const [forecastData, setForecastData] = useState<GuestExperienceForecast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State for Logging Action
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionTitle, setActionTitle] = useState('');
  const [actionCategory, setActionCategory] = useState('amenities');
  const [actionNotes, setActionNotes] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    setError('');

    try {
      const [dashRes, predRes, benchRes, actRes, foreRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/predictions'),
        fetch('/api/benchmarking'),
        fetch('/api/actions'),
        fetch('/api/forecasting'),
      ]);

      if (dashRes.ok) {
        const dashData = await dashRes.json();
        setStats(dashData.data || null);
      }

      if (predRes.ok) {
        const predData = await predRes.json();
        if (predData.data) {
          setActionCards(predData.data.proactiveActionCards || []);
          setSeasonalInsights(predData.data.seasonalInsights || '');
        }
      }

      if (benchRes.ok) {
        const bData = await benchRes.json();
        setBenchmarkData(bData.data || null);
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
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAction = (id: string) => {
    setActionCards(prev => prev.map(card => card.id === id ? { ...card, actionTaken: !card.actionTaken } : card));
  };

  const handleAddAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionTitle.trim()) return;

    setIsSubmittingAction(true);
    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: actionTitle,
          category: actionCategory,
          notes: actionNotes,
        }),
      });

      if (res.ok) {
        const newActData = await res.json();
        if (newActData.data) {
          setLoggedActions(prev => [newActData.data, ...prev]);
        }
        setActionTitle('');
        setActionNotes('');
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to log action:', err);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50/50 via-background to-background dark:from-blue-950/15 dark:via-background dark:to-background transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Synthesizing Dashboard, AI Forecasts & Benchmarks...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50/50 via-background to-background dark:from-blue-950/15 dark:via-background dark:to-background transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-950 dark:text-red-400 mb-1">Error</h3>
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!stats || stats.totalReviews === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50/50 via-background to-background dark:from-blue-950/15 dark:via-background dark:to-background transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <EmptyState
            icon={BarChart3}
            title="No data yet"
            description="Start analyzing reviews to see your dashboard statistics."
            action={{ label: 'Go to Analyzer', href: '/analyzer' }}
          />
        </div>
      </main>
    );
  }

  const sentimentData = [
    { name: 'Positive', value: stats.positiveReviews, fill: '#10b981' },
    { name: 'Neutral', value: stats.neutralReviews, fill: '#6b7280' },
    { name: 'Negative', value: stats.negativeReviews, fill: '#ef4444' },
  ];

  const bestPerformer = benchmarkData?.propertyComparisons?.find(p => p.status === 'Best Performer') || benchmarkData?.propertyComparisons?.[0];
  const needsAttention = benchmarkData?.propertyComparisons?.find(p => p.status === 'Needs Attention') || benchmarkData?.propertyComparisons?.[2];

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50/50 via-background to-background dark:from-blue-950/15 dark:via-background dark:to-background transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time analytics, guest experience forecasting (NPS), and operational tracking.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            Log Operational Action
          </button>
        </div>

        {/* Modal for Logging Operational Action */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Log Operational Action
              </h3>
              <p className="text-xs text-muted-foreground mb-4">Record upgrades or staff changes to track complaint reduction impact.</p>

              <form onSubmit={handleAddAction} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Action Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Upgraded Wi-Fi Mesh Routers"
                    value={actionTitle}
                    onChange={(e) => setActionTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border text-foreground rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Category</label>
                  <select
                    value={actionCategory}
                    onChange={(e) => setActionCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border text-foreground rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="amenities">Amenities (Wi-Fi, AC, TV)</option>
                    <option value="cleanliness">Cleanliness & Housekeeping</option>
                    <option value="host">Host Service & Check-in</option>
                    <option value="value">Pricing & Value</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Notes / Description</label>
                  <textarea
                    rows={3}
                    placeholder="Installed new router hardware in east wing..."
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border text-foreground rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAction || !actionTitle.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    {isSubmittingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Save Action
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Phase 9: Guest Experience & NPS Forecast Cards */}
        {forecastData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-purple-500/10 via-card to-card border border-purple-500/30 p-6 rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Predicted Net Promoter Score (NPS)</span>
                <Heart className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-extrabold text-foreground">{forecastData.predictedNPS}</p>
                <span className="text-xs font-bold text-emerald-500">↑{forecastData.npsChange} from last quarter</span>
              </div>
              <p className="text-xs text-muted-foreground">High promoter sentiment driven by excellent host responsiveness.</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/10 via-card to-card border border-emerald-500/30 p-6 rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Likelihood of Repeat Bookings</span>
                <Users className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-extrabold text-foreground">{forecastData.repeatBookingProbability}%</p>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500 capitalize">
                  {forecastData.loyaltyRiskLevel} Loyalty Risk
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Guest retention forecast based on historical praise keywords.</p>
            </div>
          </div>
        )}

        {/* Phase 8: Logged Actions & Impact Cards Section */}
        {loggedActions.length > 0 && (
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-base">
                <Activity className="w-5 h-5" />
                Action Impact Cards & Operational Improvements
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Automated Impact Tracking
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loggedActions.map((act) => (
                <div key={act._id} className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-card border border-border capitalize">
                      {act.category}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
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

        {/* Multi-Homestay & Industry Benchmarking Cards */}
        {benchmarkData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Industry Comparison</span>
                <Globe className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-extrabold text-foreground">{benchmarkData.ownerSatisfaction}%</p>
              <p className="text-xs text-muted-foreground">
                Vs Industry Average: <span className="font-bold text-emerald-500">{benchmarkData.industryAverageSatisfaction}%</span> (+10% Outperformance)
              </p>
            </div>

            {bestPerformer && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Best Performing Property</span>
                  <Award className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-lg font-bold text-foreground truncate">{bestPerformer.propertyName}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  {bestPerformer.satisfactionRate}% Satisfaction • Top Category: {bestPerformer.topCategory}
                </p>
              </div>
            )}

            {needsAttention && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Property Needs Attention</span>
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-lg font-bold text-foreground truncate">{needsAttention.propertyName}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                  {needsAttention.satisfactionRate}% Satisfaction • Review {needsAttention.topCategory}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Proactive Action Cards Section */}
        {actionCards.length > 0 && (
          <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-500 font-bold text-base">
                <Sparkles className="w-5 h-5" />
                Proactive AI Action Cards & Real-Time Alerts
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                Proactive AI Engine
              </span>
            </div>

            {seasonalInsights && (
              <p className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-xl border border-border">
                💡 <span className="font-semibold text-foreground">Seasonal & Tourist Insights:</span> {seasonalInsights}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {actionCards.map((card) => {
                const severityStyles = {
                  green: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400',
                  amber: 'border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400',
                  red: 'border-rose-500/30 bg-rose-500/5 text-rose-600 dark:text-rose-400',
                };

                return (
                  <div key={card.id} className={`border p-4 rounded-xl relative transition-all ${severityStyles[card.severity] || 'border-border'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-card border border-border">
                        {card.severity} Watch • {card.category}
                      </span>
                      <button
                        onClick={() => handleToggleAction(card.id)}
                        className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Mark action taken"
                      >
                        {card.actionTaken ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Bell className="w-4 h-4" />}
                      </button>
                    </div>
                    <h4 className="font-bold text-sm text-foreground mb-1">{card.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Total Reviews"
            value={stats.totalReviews}
            icon="📊"
            color="blue"
          />
          <StatCard
            label="Positive Reviews"
            value={stats.positiveReviews}
            icon="😊"
            color="green"
            trend={{ direction: 'up', percentage: 12 }}
          />
          <StatCard
            label="Neutral Reviews"
            value={stats.neutralReviews}
            icon="😐"
            color="blue"
          />
          <StatCard
            label="Negative Reviews"
            value={stats.negativeReviews}
            icon="😞"
            color="red"
          />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Sentiment Distribution */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-6 transition-colors duration-300">
            <h3 className="text-lg font-semibold text-foreground mb-6">Sentiment Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 7-Day Trend */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-6 transition-colors duration-300">
            <h3 className="text-lg font-semibold text-foreground mb-6">7-Day Sentiment Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.sentimentTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
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
        </div>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
