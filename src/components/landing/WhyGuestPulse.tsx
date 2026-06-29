'use client';

import { motion } from 'framer-motion';
import { Clock, Eye, Heart, Target } from 'lucide-react';

const benefits = [
  {
    icon: Clock,
    title: 'Save Hours of Manual Reading',
    description: 'Eliminate tedious manual parsing across multiple booking platforms. Get structured, aggregated sentiment summaries in seconds.',
  },
  {
    icon: Eye,
    title: 'Understand What Guests Really Think',
    description: 'Uncover deep underlying patterns behind guest praise and complaints using high-accuracy Google Gemini natural language processing.',
  },
  {
    icon: Heart,
    title: 'Improve Guest Satisfaction',
    description: 'Proactively address specific friction points like check-in delays or amenity gaps to elevate overall host ratings and guest reviews.',
  },
  {
    icon: Target,
    title: 'Make Better Business Decisions',
    description: 'Validate capital investments in room upgrades, staff training, or new amenities with clear, data-driven guest feedback metrics.',
  },
];

export default function WhyGuestPulse() {
  return (
    <section className="relative py-32 px-6 bg-background border-t border-border/40 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-semibold tracking-wide uppercase"
          >
            The GuestPulse AI Advantage
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground"
          >
            Why GuestPulse AI
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed"
          >
            Empowering homestay hosts with clarity, efficiency, and actionable intelligence.
          </motion.p>
        </div>

        {/* 4 Benefit Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="h-full p-10 rounded-3xl bg-card/60 dark:bg-card/40 backdrop-blur-xl border border-border/60 group-hover:border-indigo-500/40 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1.5 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-7 h-7" />
                    </div>

                    <h3 className="text-2xl font-bold text-foreground tracking-tight">
                      {item.title}
                    </h3>

                    <p className="text-muted-foreground text-base font-light leading-relaxed">
                      {item.description}
                    </p>
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
