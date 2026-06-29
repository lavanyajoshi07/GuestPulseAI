'use client';

import { motion } from 'framer-motion';
import { Inbox, Cpu, BarChart3, Award } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: Inbox,
    title: 'Collect Guest Reviews',
    description: 'Ingest review data effortlessly across CSV exports, PDF reports, scanned receipts (OCR), or direct text inputs.',
  },
  {
    step: '02',
    icon: Cpu,
    title: 'AI Analyzes Feedback',
    description: 'Gemini AI extracts underlying sentiments, categorizing feedback into cleanliness, host hospitality, amenities, and value.',
  },
  {
    step: '03',
    icon: BarChart3,
    title: 'Generate Insights',
    description: 'Synthesize raw reviews into actionable satisfaction percentages, predictive risk alerts, and multi-property benchmarking.',
  },
  {
    step: '04',
    icon: Award,
    title: 'Improve Guest Experience',
    description: 'Execute operational upgrades, eliminate recurring complaints, and elevate guest loyalty and repeat booking metrics.',
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-32 px-6 bg-background border-t border-border/40 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-24 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs font-semibold tracking-wide uppercase"
          >
            Streamlined Intelligence Flow
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground"
          >
            How It Works
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed"
          >
            Four continuous steps designed to turn raw guest feedback into operational excellence.
          </motion.p>
        </div>

        {/* Timeline Grid */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Connecting Line for Desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500/20 via-purple-500/40 to-emerald-500/20 -translate-y-12 z-0" />

          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                className="relative z-10 group"
              >
                <div className="h-full p-8 rounded-3xl bg-card/60 dark:bg-card/40 backdrop-blur-xl border border-border/60 group-hover:border-purple-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/5 hover:-translate-y-1.5 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className="text-3xl font-black text-muted-foreground/30 font-mono">
                        {item.step}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-foreground tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-sm font-light leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-border/40 flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    <span>Step {index + 1} of 4</span>
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
