'use client';

import Link from 'next/link';
import { BarChart3 } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border/60 text-foreground py-16 px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-border/40">
        {/* Brand Column */}
        <div className="space-y-4 md:col-span-1">
          <Link href="/" className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold tracking-tight text-foreground font-sans">
              GuestPulse AI
            </span>
          </Link>
          <p className="text-xs text-muted-foreground font-light leading-relaxed">
            AI-powered guest experience intelligence designed exclusively for independent homestays and boutique hospitality hosts.
          </p>
        </div>

        {/* Navigation Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Navigation</h4>
          <ul className="space-y-2 text-xs font-medium text-muted-foreground">
            <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
            <li><Link href="/analyzer" className="hover:text-foreground transition-colors">Review Analyzer</Link></li>
            <li><Link href="/history" className="hover:text-foreground transition-colors">History & Predictions</Link></li>
            <li><Link href="/dashboard" className="hover:text-foreground transition-colors">Analytics Dashboard</Link></li>
            <li><Link href="/reports" className="hover:text-foreground transition-colors">Interactive Reports</Link></li>
          </ul>
        </div>

        {/* Features Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Features</h4>
          <ul className="space-y-2 text-xs font-medium text-muted-foreground">
            <li><span className="hover:text-foreground transition-colors cursor-default">AI Sentiment Extraction</span></li>
            <li><span className="hover:text-foreground transition-colors cursor-default">Smart Category Detection</span></li>
            <li><span className="hover:text-foreground transition-colors cursor-default">Predictive NPS Forecasting</span></li>
            <li><span className="hover:text-foreground transition-colors cursor-default">Automated Action Tracking</span></li>
            <li><span className="hover:text-foreground transition-colors cursor-default">Multi-Property Benchmarking</span></li>
          </ul>
        </div>

        {/* Links & Connect Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Connect</h4>
          <div className="flex items-center gap-3 pt-1">
            <a
              href="https://github.com/lavanyajoshi07/GuestPulseAI"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl bg-background border border-border/80 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-blue-500/40 transition-all cursor-pointer"
              title="GitHub Repository"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-light">
        <p>© {currentYear} GuestPulse AI. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <span className="hover:text-foreground transition-colors cursor-pointer">Privacy Policy</span>
          <span className="hover:text-foreground transition-colors cursor-pointer">Terms of Service</span>
        </div>
      </div>
    </footer>
  );
}
