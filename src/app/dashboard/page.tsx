'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/StatCard';
import EmptyState from '@/components/EmptyState';
import ProtectedRoute from '@/components/ProtectedRoute';
import { BarChart3, Loader2, AlertCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

const COLORS = ['#10b981', '#6b7280', '#ef4444'];

function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/dashboard');
      if (!response.ok) throw new Error('Failed to load dashboard');
      const data = await response.json();
      setStats(data.data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50/50 via-background to-background dark:from-blue-950/15 dark:via-background dark:to-background transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50/50 via-background to-background dark:from-blue-950/15 dark:via-background dark:to-background transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your review analysis metrics and trends.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
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
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    color: 'var(--foreground)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-6 transition-colors duration-300">
            <h3 className="text-lg font-semibold text-foreground mb-6">Top Categories</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.categoryBreakdown.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="category" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    color: 'var(--foreground)',
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Trend */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 mb-12 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-foreground mb-6">Sentiment Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.sentimentTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  color: 'var(--foreground)',
                }}
              />
              <Legend />
              <Bar dataKey="positive" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="neutral" fill="#6b7280" radius={[8, 8, 0, 0]} />
              <Bar dataKey="negative" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg shadow-sm border border-border p-6 transition-colors duration-300">
            <p className="text-sm font-medium text-muted-foreground mb-2">Average Sentiment Score</p>
            <p className="text-4xl font-bold text-foreground">
              {(stats.averageSentimentScore * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground mt-2">Based on all analyzed reviews</p>
          </div>

          <div className="bg-card rounded-lg shadow-sm border border-border p-6 transition-colors duration-300">
            <p className="text-sm font-medium text-muted-foreground mb-2">Most Common Category</p>
            <p className="text-4xl font-bold text-foreground capitalize">
              {stats.mostCommonCategory}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Most discussed topic in reviews</p>
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
