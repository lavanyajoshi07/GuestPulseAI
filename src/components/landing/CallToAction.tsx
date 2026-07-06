'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

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
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-lobster text-4xl md:text-6xl lg:text-7xl text-foreground leading-tight"
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
            href="/analyzer"
            className="w-full sm:w-auto px-8 py-4 bg-[#3CB371] hover:bg-[#2e8b57] text-white font-semibold text-base rounded-full shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Try Review Analyzer</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
