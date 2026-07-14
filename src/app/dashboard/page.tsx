'use client';

import { useState, useEffect } from 'react';
import EmptyState from '@/components/EmptyState';
import ProtectedRoute from '@/components/ProtectedRoute';
import { BarChart3, Loader2, AlertCircle, TrendingUp, Sparkles, Bell, CheckCircle2, Globe, Award, AlertTriangle, Plus, Activity, X, Heart, Users, MessageSquare, Smile, Meh, Frown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { ProactiveActionCard, LoggedAction, GuestExperienceForecast } from '@/types';

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
  const [predictionData, setPredictionData] = useState<any | null>(null);
  const [loggedActions, setLoggedActions] = useState<LoggedAction[]>([]);
  const [forecastData, setForecastData] = useState<GuestExperienceForecast | null>(null);
  const [homestayName, setHomestayName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State for Logging Action
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionTitle, setActionTitle] = useState('');
  const [actionCategory, setActionCategory] = useState('amenities');
  const [actionNotes, setActionNotes] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [resolvingCardId, setResolvingCardId] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    setError('');

    try {
      const [dashRes, predRes, actRes, foreRes, homestayRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/predictions'),
        fetch('/api/actions'),
        fetch('/api/forecasting'),
        fetch('/api/homestay'),
      ]);

      if (dashRes.ok) {
        const dashData = await dashRes.json();
        setStats(dashData.data || null);
      }

      if (predRes.ok) {
        const predData = await predRes.json();
        if (predData.data) {
          setActionCards(predData.data.proactiveActionCards || []);
          setPredictionData(predData.data || null);
        }
      }

      if (actRes.ok) {
        const aData = await actRes.json();
        setLoggedActions(aData.data || []);
      }

      if (foreRes.ok) {
        const fData = await foreRes.json();
        setForecastData(fData.data || null);
      }

      if (homestayRes.ok) {
        const homestayData = await homestayRes.json();
        if (homestayData.success && homestayData.homestay) {
          setHomestayName(homestayData.homestay.homestayName);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartResolveAction = (card: ProactiveActionCard) => {
    setActionTitle(`Resolve: ${card.title}`);
    setActionCategory(card.category);
    setActionNotes(`Resolving recommendation: ${card.description}`);
    setResolvingCardId(card.id);
    setIsModalOpen(true);
  };

  const handleOpenGeneralModal = () => {
    setActionTitle('');
    setActionCategory('amenities');
    setActionNotes('');
    setResolvingCardId(null);
    setIsModalOpen(true);
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
          proactiveCardId: resolvingCardId || undefined,
        }),
      });

      if (res.ok) {
        const newActData = await res.json();
        if (newActData.data) {
          setLoggedActions(prev => [newActData.data, ...prev]);
        }
        setActionTitle('');
        setActionNotes('');
        setResolvingCardId(null);
        setIsModalOpen(false);
        // Refresh all dashboard metrics (this will update forecast scores and map card status)
        await loadDashboard();
      }
    } catch (err) {
      console.error('Failed to log action:', err);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const getActiveAlerts = () => {
    if (!predictionData) return [];
    const complaints = predictionData.predictedRisingComplaints || [];
    return complaints.filter((complaint: string) => {
      // Check if there is any logged action matching this complaint
      const isResolved = loggedActions.some((action) => {
        const titleLower = action.title.toLowerCase();
        const complaintLower = complaint.toLowerCase();
        const categoryLower = action.category.toLowerCase();

        // Match based on category or keyword overlaps
        if (complaintLower.includes('wifi') || complaintLower.includes('wi-fi') || complaintLower.includes('internet')) {
          if (titleLower.includes('wifi') || titleLower.includes('wi-fi') || titleLower.includes('internet') || categoryLower === 'amenities') {
            return true;
          }
        }
        if (complaintLower.includes('check-in') || complaintLower.includes('checkin') || complaintLower.includes('host') || complaintLower.includes('staff')) {
          if (titleLower.includes('check-in') || titleLower.includes('checkin') || titleLower.includes('self-check') || categoryLower === 'host') {
            return true;
          }
        }
        if (complaintLower.includes('clean') || complaintLower.includes('dirt') || complaintLower.includes('smell') || complaintLower.includes('dust')) {
          if (titleLower.includes('clean') || titleLower.includes('dust') || categoryLower === 'cleanliness') {
            return true;
          }
        }
        // Generic title inclusion match
        return titleLower.includes(complaintLower) || complaintLower.includes(titleLower);
      });
      return !isResolved;
    });
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#faf8f5] dark:bg-none dark:bg-[#0b1220] transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Synthesizing Dashboard & AI Forecasts...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#faf8f5] dark:bg-none dark:bg-[#0b1220] transition-colors duration-300">
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
      <main className="min-h-screen bg-[#faf8f5] dark:bg-none dark:bg-[#0b1220] transition-colors duration-300">
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
    { name: 'Positive', value: stats.positiveReviews, fill: '#00bfa5' },
    { name: 'Neutral', value: stats.neutralReviews, fill: '#4b5563' },
    { name: 'Negative', value: stats.negativeReviews, fill: '#111111' },
  ];

  return (
    <main className="min-h-screen bg-[#faf8f5] dark:bg-none dark:bg-[#0b1220] transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        
        {/* Welcome Back Banner (Top) */}
        <div className="bg-white dark:bg-[#faf8f5] border border-slate-200 dark:border-slate-300 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm text-black">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back {homestayName || 'Guest'}!
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">
              Real-time analytics, guest experience forecasting (NPS), and operational tracking.
            </p>
            <button
              onClick={handleOpenGeneralModal}
              className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-[#00C2A9] hover:bg-[#00A38E] text-white text-xs font-semibold rounded-xl transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Log Operational Action
            </button>
          </div>
          
          {/* Custom inline SVG logo */}
          <div className="flex-shrink-0">
            <svg viewBox="0 0 280 80" className="h-16 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* House 1 (Left, background) */}
              <path d="M15 45 L30 30 L45 45 L45 65 L15 65 Z" fill="#4b5563" opacity="0.6" />
              <path d="M15 45 L30 30 L45 45" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              
              {/* House 3 (Right, background) */}
              <path d="M55 45 L70 30 L85 45 L85 65 L55 65 Z" fill="#4b5563" opacity="0.6" />
              <path d="M55 45 L70 30 L85 45" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              
              {/* House 2 (Middle, foreground) */}
              <path d="M32 35 L50 18 L68 35 L68 65 L32 65 Z" fill="#5cdcd0" />
              <path d="M32 35 L50 18 L68 35" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M32 65 L68 65" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M46 65 L46 52 L54 52 L54 65" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              
              {/* Cursive GuestPulse AI text */}
              <text x="95" y="42" fill="#111111" fontSize="30" fontFamily="Selima, cursive">GuestPulse AI</text>
              
              {/* Subtext */}
              <text x="95" y="60" fill="#666666" fontSize="10" fontFamily="sans-serif" fontWeight="600" letterSpacing="0.5">Build for every homestay.</text>
            </svg>
          </div>
        </div>

        {/* Phase 9: Guest Experience & NPS Forecast Cards */}
        {forecastData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Predicted NPS Card - White theme */}
            <div className="bg-white dark:bg-[#faf8f5] border border-slate-200 p-6 rounded-2xl shadow-sm space-y-2 text-black">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Predicted Net Promoter Score (NPS)</span>
                <Heart className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-extrabold text-slate-900">{forecastData.predictedNPS}</p>
                <span className="text-xs font-bold text-emerald-600">↑{forecastData.npsChange} from last quarter</span>
              </div>
              <p className="text-xs text-slate-500">High promoter sentiment driven by excellent host responsiveness.</p>
            </div>

            {/* Likelihood of Repeat Bookings Card - Turquoise theme */}
            <div className="bg-[#5cdcd0] border border-[#5cdcd0] p-6 rounded-2xl shadow-sm space-y-2 text-black">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-black/75 uppercase tracking-wider">Likelihood of Repeat Bookings</span>
                <Users className="w-5 h-5 text-black" />
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-extrabold text-black">{forecastData.repeatBookingProbability}%</p>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-black/10 text-black capitalize">
                  {forecastData.loyaltyRiskLevel} Loyalty Risk
                </span>
              </div>
              <p className="text-xs text-black/70">Guest retention forecast based on historical praise keywords.</p>
            </div>
          </div>
        )}

        {/* Modal for Logging Operational Action */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#faf8f5] border border-slate-200 dark:border-slate-300 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 text-black">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#00c2a9]" />
                Log Operational Action
              </h3>
              <p className="text-xs text-slate-500 mb-4">Record upgrades or staff changes to track complaint reduction impact.</p>

              <form onSubmit={handleAddAction} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Action Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Upgraded Wi-Fi Mesh Routers"
                    value={actionTitle}
                    onChange={(e) => setActionTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={actionCategory}
                    onChange={(e) => setActionCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="amenities">Amenities (Wi-Fi, AC, TV)</option>
                    <option value="cleanliness">Cleanliness & Housekeeping</option>
                    <option value="host">Host Service & Check-in</option>
                    <option value="value">Pricing & Value</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Description</label>
                  <textarea
                    rows={3}
                    placeholder="Installed new router hardware in east wing..."
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAction || !actionTitle.trim()}
                    className="px-4 py-2 bg-[#00c2a9] hover:bg-[#00a892] text-white text-xs font-semibold rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    {isSubmittingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Save Action
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Reviews */}
          <div className="bg-[#5cdcd0] border border-[#5cdcd0] rounded-2xl p-6 shadow-sm transition-all duration-300 text-black">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-black/70 mb-1">Total Reviews</p>
                <p className="text-3xl font-extrabold text-black">{stats.totalReviews}</p>
              </div>
              <MessageSquare className="w-6 h-6 text-black/80 mt-1" />
            </div>
          </div>

          {/* Positive Reviews */}
          <div className="bg-white dark:bg-[#faf8f5] border border-slate-200 rounded-2xl p-6 shadow-sm transition-all duration-300 text-black">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Positive Reviews</p>
                <p className="text-3xl font-extrabold text-slate-900">{stats.positiveReviews}</p>
                <p className="text-xs font-semibold mt-2 text-emerald-600">
                  ↑ 12% from last week
                </p>
              </div>
              <Smile className="w-6 h-6 text-[#00bfa5] mt-1" />
            </div>
          </div>

          {/* Neutral Reviews */}
          <div className="bg-white dark:bg-[#faf8f5] border border-slate-200 rounded-2xl p-6 shadow-sm transition-all duration-300 text-black">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Neutral Reviews</p>
                <p className="text-3xl font-extrabold text-slate-900">{stats.neutralReviews}</p>
              </div>
              <Meh className="w-6 h-6 text-[#4b5563] mt-1" />
            </div>
          </div>

          {/* Negative Reviews */}
          <div className="bg-[#5cdcd0] border border-[#5cdcd0] rounded-2xl p-6 shadow-sm transition-all duration-300 text-black">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-black/70 mb-1">Negative Reviews</p>
                <p className="text-3xl font-extrabold text-black">{stats.negativeReviews}</p>
              </div>
              <Frown className="w-6 h-6 text-black/80 mt-1" />
            </div>
          </div>
        </div>

        {/* Proactive Action Cards Section */}
        {actionCards.filter(card => !card.actionTaken).length > 0 && (
          <div className="bg-white dark:bg-[#faf8f5] border border-slate-200 dark:border-slate-300 p-6 rounded-2xl shadow-sm space-y-4 text-black">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Sparkles className="w-5 h-5 text-[#00c2a9]" />
                Proactive AI Action Cards & Real-Time Alerts
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#00c2a9]/10 text-[#00c2a9] border border-[#00c2a9]/20">
                Proactive AI Engine
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {actionCards.filter(card => !card.actionTaken).map((card) => {
                return (
                  <div key={card.id} className="bg-white dark:bg-[#faf8f5] border border-slate-200 dark:border-slate-300 p-5 rounded-2xl shadow-sm transition-all hover:shadow-md text-black flex flex-col justify-between min-h-[160px]">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            card.severity === 'red' ? 'bg-rose-500' :
                            card.severity === 'amber' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            {card.severity} Watch • {card.category}
                          </span>
                        </div>
                        <button
                          onClick={() => handleStartResolveAction(card)}
                          className="text-xs text-slate-500 hover:text-black cursor-pointer transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-200"
                          title="Log action to resolve alert"
                        >
                          <Bell className="w-4 h-4 text-[#00c2a9]" />
                        </button>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mb-1.5 leading-snug">{card.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{card.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Alerts & Plus Points (Predictive Insights) */}
        {predictionData && (
          <div className="bg-white dark:bg-[#faf8f5] border border-slate-200 dark:border-slate-300 p-6 rounded-2xl shadow-sm space-y-4 text-black">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00c2a9]" />
              Predictive Outlook: Alerts & Plus Points
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Alerts (Predicted Risks) */}
              <div className="bg-rose-500/5 dark:bg-rose-950/10 border border-rose-500/10 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Alerts (Predicted Risks)
                </h4>
                <div className="space-y-2">
                  {getActiveAlerts().length > 0 ? (
                    getActiveAlerts().map((item: string, idx: number) => (
                      <div key={idx} className="px-4 py-2.5 rounded-xl bg-white border border-rose-500/20 text-xs text-slate-900 flex items-center gap-2 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No active alerts.</p>
                  )}
                </div>
              </div>

              {/* Plus Points (Trending Praise) */}
              <div className="bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/10 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  Plus Points (Trending Praise)
                </h4>
                <div className="space-y-2">
                  {predictionData.predictedTrendingPositives && predictionData.predictedTrendingPositives.length > 0 ? (
                    predictionData.predictedTrendingPositives.map((item: string, idx: number) => (
                      <div key={idx} className="px-4 py-2.5 rounded-xl bg-white border border-emerald-500/10 text-xs text-slate-900 flex items-center gap-2 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                        {item}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No trending praise areas predicted.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Sentiment Distribution */}
          <div className="bg-white dark:bg-[#faf8f5] rounded-2xl border border-slate-200 dark:border-slate-300 p-6 transition-colors duration-300 text-black">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Sentiment Distribution</h3>
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
          <div className="bg-white dark:bg-[#faf8f5] rounded-2xl border border-slate-200 dark:border-slate-300 p-6 transition-colors duration-300 text-black">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">7-Day Sentiment Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.sentimentTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.4} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderColor: '#cbd5e1', borderRadius: '0.75rem', color: '#0f172a' }}
                />
                <Legend />
                <Bar dataKey="positive" name="Positive" fill="#00bfa5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="neutral" name="Neutral" fill="#4b5563" radius={[4, 4, 0, 0]} />
                <Bar dataKey="negative" name="Negative" fill="#111111" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Log (Recent Improvements) */}
        {loggedActions.length > 0 && (
          <div className="bg-white dark:bg-[#faf8f5] border border-slate-200 dark:border-slate-300 p-6 rounded-2xl shadow-sm space-y-4 text-black">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />
              Active Log (Recent Improvements)
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {loggedActions.map((act: any, idx: number) => (
                <div key={idx} className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-black shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-sm">✅</span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-slate-900 text-sm">{act.title}</span>
                        <span className="px-2 py-0.5 rounded-[6px] text-[10px] font-semibold bg-slate-50 border border-slate-200 text-slate-500 capitalize">{act.category}</span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {new Date(act.dateLogged).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed">{act.aiImpactSummary}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className="inline-block px-2 py-0.5 rounded-[6px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold text-[10px] uppercase tracking-wide">
                      Resolved
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
