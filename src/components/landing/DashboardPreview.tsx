'use client';

import { motion } from 'framer-motion';
import { PieChart, Layers, Sparkles, History, FileText, CheckCircle2, TrendingUp, Heart } from 'lucide-react';

const highlights = [
  {
    icon: PieChart,
    title: 'Sentiment Distribution',
    description: 'Instant visual breakdown of positive, neutral, and negative guest sentiment scores.',
  },
  {
    icon: Layers,
    title: 'Category Analytics',
    description: 'Automated complaint and praise tracking across cleanliness, amenities, and host service.',
  },
  {
    icon: Sparkles,
    title: 'AI Business Insights',
    description: 'Gemini-generated operational recommendations tailored specifically to your homestay.',
  },
  {
    icon: History,
    title: 'Historical Reviews',
    description: 'Centralized review repository with multi-attribute filtering and instant search.',
  },
  {
    icon: FileText,
    title: 'Interactive Reports',
    description: 'Customizable date range analytics with continuous CSV and PDF export capabilities.',
  },
];

export default function DashboardPreview() {
  return (
    <section className="relative py-32 px-6 bg-background border-t border-border/40 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-semibold tracking-wide uppercase"
          >
            Real-Time Command Center
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground"
          >
            Command Your Hospitality Analytics
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed"
          >
            A high-performance dashboard engineered to convert raw feedback into operational growth.
          </motion.p>
        </div>

        {/* 2-Column Layout: Visual Mockup + Highlights List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left / Top: Dashboard Visual Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 relative"
          >
            <div className="relative rounded-3xl border border-border/80 bg-card/80 dark:bg-card/40 backdrop-blur-2xl p-6 shadow-2xl overflow-hidden group">
              {/* Glass Header Bar */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-semibold text-muted-foreground font-mono">GuestPulse AI Console v2.4</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20">Live Sync</span>
                </div>
              </div>

              {/* Mockup Dashboard Body */}
              <div className="space-y-6">
                {/* Mini Stat Cards Row */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-background/60 border border-border/50 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Satisfaction</span>
                    <div className="flex items-baseline justify-between">
                      <p className="text-xl font-extrabold text-foreground">92%</p>
                      <span className="text-[10px] font-bold text-emerald-500">↑ 8%</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-background/60 border border-border/50 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">NPS Forecast</span>
                    <div className="flex items-baseline justify-between">
                      <p className="text-xl font-extrabold text-purple-500">78</p>
                      <span className="text-[10px] font-bold text-purple-400">↑ 3</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-background/60 border border-border/50 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Repeat Rate</span>
                    <div className="flex items-baseline justify-between">
                      <p className="text-xl font-extrabold text-blue-500">72%</p>
                      <span className="text-[10px] font-bold text-blue-400">High</span>
                    </div>
                  </div>
                </div>

                {/* AI Insights Card Mockup */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent border border-blue-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-500 font-bold text-xs">
                      <Sparkles className="w-4 h-4" />
                      Gemini Executive Insight
                    </div>
                    <span className="text-[10px] text-muted-foreground">Updated 2m ago</span>
                  </div>
                  <p className="text-xs text-foreground font-light leading-relaxed">
                    "Guests consistently praise host warmth and scenic morning breakfasts. Resolving minor Wi-Fi latency in Room 4 is projected to boost overall satisfaction by an additional 6%."
                  </p>
                </div>

                {/* Simulated Chart Bars */}
                <div className="p-5 rounded-2xl bg-background/60 border border-border/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Weekly Sentiment Velocity</span>
                    <span className="text-[10px] text-muted-foreground">Last 7 Days</span>
                  </div>
                  <div className="h-28 flex items-end justify-between gap-3 pt-4 px-2">
                    {[65, 80, 75, 90, 85, 95, 92].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          style={{ height: `${h}%` }}
                          className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-cyan-400 group-hover:from-purple-600 group-hover:to-blue-400 transition-all duration-500"
                        />
                        <span className="text-[9px] text-muted-foreground font-mono">Day {i + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Highlights List */}
          <div className="lg:col-span-5 space-y-6">
            {highlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-card/40 backdrop-blur-md border border-border/50 hover:border-blue-500/40 transition-all duration-300 hover:translate-x-1 flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-xs font-light leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
