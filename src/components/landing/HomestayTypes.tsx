'use client';

import { motion } from 'framer-motion';
import { Mountain, Leaf, Landmark, Sparkles, Waves, Home } from 'lucide-react';

const homestayTypes = [
  {
    icon: Mountain,
    title: 'Mountain Cabin',
    description: 'Cozy alpine retreats surrounded by mountain air, hiking trails, and wood-burning fireplaces.',
    gradient: 'from-blue-500/10 via-indigo-500/5 to-transparent',
    borderColor: 'group-hover:border-blue-500/40',
    iconColor: 'text-blue-500',
  },
  {
    icon: Leaf,
    title: 'Eco Lodge',
    description: 'Sustainable sanctuaries focused on environmental harmony, organic dining, and peaceful solitude.',
    gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
    borderColor: 'group-hover:border-emerald-500/40',
    iconColor: 'text-emerald-500',
  },
  {
    icon: Landmark,
    title: 'Heritage Home',
    description: 'Historic estates and ancestral manors preserved with timeless elegance and cultural rich stories.',
    gradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
    borderColor: 'group-hover:border-amber-500/40',
    iconColor: 'text-amber-500',
  },
  {
    icon: Sparkles,
    title: 'Boutique Stay',
    description: 'Artfully curated urban and countryside suites tailored for design lovers and bespoke luxury.',
    gradient: 'from-purple-500/10 via-pink-500/5 to-transparent',
    borderColor: 'group-hover:border-purple-500/40',
    iconColor: 'text-purple-500',
  },
  {
    icon: Waves,
    title: 'Beach Villa',
    description: 'Oceanfront hideaways offering panoramic water views, sunset decks, and gentle sea breezes.',
    gradient: 'from-cyan-500/10 via-blue-500/5 to-transparent',
    borderColor: 'group-hover:border-cyan-500/40',
    iconColor: 'text-cyan-500',
  },
  {
    icon: Home,
    title: 'Farm Stay',
    description: 'Rustic countryside homesteads offering hands-on farm life, fresh harvests, and serene landscapes.',
    gradient: 'from-lime-500/10 via-emerald-500/5 to-transparent',
    borderColor: 'group-hover:border-lime-500/40',
    iconColor: 'text-lime-500',
  },
];

export default function HomestayTypes() {
  return (
    <section className="relative py-32 px-6 bg-background overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

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
            Universal Hospitality Intelligence
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground"
          >
            Built for Every Kind of Stay
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed"
          >
            Whether you manage a mountain cabin, eco lodge, heritage home, boutique stay, or beach villa, GuestPulse AI helps you understand every guest.
          </motion.p>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {homestayTypes.map((item, index) => {
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
                <div className={`h-full p-8 rounded-3xl bg-card/60 dark:bg-card/40 backdrop-blur-xl border border-border/60 ${item.borderColor} transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden`}>
                  {/* Subtle hover gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

                  <div className="relative z-10 space-y-5">
                    <div className={`w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center ${item.iconColor} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7" />
                    </div>

                    <h3 className="text-2xl font-bold text-foreground tracking-tight">
                      {item.title}
                    </h3>

                    <p className="text-muted-foreground text-sm font-light leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="relative z-10 pt-6 flex items-center text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                    <span>Learn more</span>
                    <span className="ml-1 group-hover:translate-x-1 transition-transform duration-300">→</span>
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
