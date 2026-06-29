'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CallToAction() {
  return (
    <section className="relative py-36 px-6 bg-background border-t border-border/40 overflow-hidden">
      {/* Cinematic Glowing Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-purple-950/20 dark:via-blue-950/20 dark:to-purple-950/40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-r from-blue-600/15 to-purple-600/15 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 text-center space-y-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-semibold tracking-wide uppercase"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Transform Your Hospitality Today
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-tight"
        >
          Turn Guest Reviews into Better Stays
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg md:text-2xl text-muted-foreground font-light max-w-3xl mx-auto leading-relaxed"
        >
          Start using AI to understand guest feedback and grow your homestay with confidence.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4"
        >
          <Link
            href="/auth/register"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base rounded-full shadow-xl shadow-blue-500/25 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            href="/analyzer"
            className="w-full sm:w-auto px-8 py-4 bg-card/80 backdrop-blur-md border border-border/80 hover:bg-accent text-foreground font-semibold text-base rounded-full transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Try Review Analyzer</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
