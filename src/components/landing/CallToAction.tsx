'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, Brain, TrendingUp } from 'lucide-react';

export default function CallToAction() {
  return (
    <section className="relative py-36 px-6 bg-background border-t border-border/40 overflow-hidden">
      {/* Cinematic Glowing Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-[#3CB371]/15 dark:via-blue-950/20 dark:to-[#3CB371]/30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-r from-blue-600/15 to-[#3CB371]/25 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 text-center space-y-10">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl font-bold font-sans tracking-tight text-foreground"
        >
          Elevate Your Guest Satisfaction Index
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed font-sans"
        >
          Unlock hidden patterns in guest reviews and implement proactive actions before the next check-in.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center gap-10 pt-4"
        >
          <Link
            href="/analyzer"
            className="w-full sm:w-auto px-8 py-4 bg-[#3CB371] hover:bg-[#2e8b57] text-white font-semibold text-base rounded-full shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:scale-105 hover:shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3CB371] focus:ring-offset-2 dark:focus:ring-offset-[#0B1220]"
          >
            <span>Try Review Analyzer</span>
          </Link>

          {/* Product Capabilities Highlights Row */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium select-none">
            {/* AI Review Analysis */}
            <div className="group relative flex items-center gap-2.5 px-5 py-3 rounded-full bg-white/5 dark:bg-[#17212B]/35 border border-border/40 dark:border-white/5 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] hover:bg-white/10 dark:hover:bg-[#17212B]/50 hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all duration-300 hover:-translate-y-0.5 cursor-default text-muted-foreground hover:text-foreground">
              {/* Decorative radial blur gradient on hover */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <Brain className="w-4.5 h-4.5 text-emerald-500 transition-transform duration-300 group-hover:scale-110 relative z-10" />
              <span className="relative z-10 tracking-wide font-sans">AI Review Analysis</span>
            </div>

            {/* Actionable Guest Insights */}
            <div className="group relative flex items-center gap-2.5 px-5 py-3 rounded-full bg-white/5 dark:bg-[#17212B]/35 border border-border/40 dark:border-white/5 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] hover:bg-white/10 dark:hover:bg-[#17212B]/50 hover:border-indigo-500/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all duration-300 hover:-translate-y-0.5 cursor-default text-muted-foreground hover:text-foreground">
              {/* Decorative radial blur gradient on hover */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <TrendingUp className="w-4.5 h-4.5 text-indigo-400 transition-transform duration-300 group-hover:scale-110 relative z-10" />
              <span className="relative z-10 tracking-wide font-sans">Actionable Guest Insights</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
