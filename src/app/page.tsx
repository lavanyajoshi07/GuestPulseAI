import Link from 'next/link';
import { BarChart3, Search, History, TrendingUp } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50/50 via-background to-background dark:from-blue-950/15 dark:via-background dark:to-background transition-colors duration-300">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <BarChart3 className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              ReviewLens AI
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Intelligent review analysis for homestay and eco-tourism businesses.
            Understand guest feedback, detect sentiment, and craft perfect responses instantly.
          </p>
          <Link
            href="/analyzer"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/10 dark:shadow-blue-500/5"
          >
            Start Analyzing
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
          Powerful Features
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-card p-8 rounded-lg shadow-sm border border-border transition-colors duration-300">
            <Search className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-3 text-foreground">
              Smart Analysis
            </h3>
            <p className="text-muted-foreground">
              AI-powered sentiment detection and category classification for every review.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-card p-8 rounded-lg shadow-sm border border-border transition-colors duration-300">
            <TrendingUp className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-3 text-foreground">
              Instant Responses
            </h3>
            <p className="text-muted-foreground">
              Generate professional management responses to guest reviews automatically.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-card p-8 rounded-lg shadow-sm border border-border transition-colors duration-300">
            <History className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-4" />
            <h3 className="text-xl font-semibold mb-3 text-foreground">
              Historical Insights
            </h3>
            <p className="text-muted-foreground">
              Store and analyze all reviews with advanced search and filtering capabilities.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white rounded-xl p-12 shadow-xl shadow-blue-500/5">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Get Started Today
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <p className="text-sm opacity-90 mb-2">Quick Analysis</p>
              <p className="text-2xl font-bold">Instant</p>
            </div>
            <div className="text-center">
              <p className="text-sm opacity-90 mb-2">Storage</p>
              <p className="text-2xl font-bold">Unlimited</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link
              href="/analyzer"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-md"
            >
              Start Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 mt-16 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            ReviewLens AI © 2026. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
