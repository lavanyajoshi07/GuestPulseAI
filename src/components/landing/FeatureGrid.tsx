'use client';

import { motion } from 'framer-motion';
import { Sparkles, Layers, History, LayoutDashboard, FileText, Search } from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI Sentiment Analysis',
    description: 'Deep natural language processing detects nuanced guest emotion across positive, neutral, and negative sentiment spectrums.',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
  {
    icon: Layers,
    title: 'Smart Category Detection',
    description: 'Automated entity classification categorizes guest comments into cleanliness, host service, amenities, and value.',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  {
    icon: History,
    title: 'Historical Review Storage',
    description: 'Encrypted multi-tenant data storage securely logs past guest feedback, building a permanent historical record.',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
  {
    icon: LayoutDashboard,
    title: 'Analytics Dashboard',
    description: 'Real-time telemetry featuring interactive distribution charts, weekly sentiment velocity, and proactive alert banners.',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
  },
  {
    icon: FileText,
    title: 'Reports & Trends',
    description: 'Generate structured weekly, monthly, or yearly operational summaries with instantaneous CSV and PDF export options.',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  {
    icon: Search,
    title: 'Powerful Search',
    description: 'High-speed fuzzy search allows instant filtering by specific keywords, dates, sentiment levels, or property locations.',
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
  },
];

export default function FeatureGrid() {
  return (
    <section className="relative py-32 px-6 bg-background border-t border-border/40 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-24 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold tracking-wide uppercase"
          >
            Full-Stack Hospitality OS
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground"
          >
            Everything You Need
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed"
          >
            Comprehensive analytical tooling crafted specifically for modern homestay operators.
          </motion.p>
        </div>

        {/* 6 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group relative"
              >
                <div className="h-full p-8 rounded-3xl bg-card/60 dark:bg-card/40 backdrop-blur-xl border border-border/60 group-hover:border-emerald-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/5 hover:-translate-y-1.5 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className={`w-12 h-12 rounded-2xl ${item.bgColor} ${item.color} ${item.borderColor} border flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <h3 className="text-xl font-bold text-foreground tracking-tight">
                      {item.title}
                    </h3>

                    <p className="text-muted-foreground text-sm font-light leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    <span className="font-medium">Enterprise Ready</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
