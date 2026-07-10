'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, Layers, TrendingUp, Search } from 'lucide-react';

const reasons = [
  {
    icon: Sparkles,
    number: '01',
    title: 'Understand Guest Feelings Instantly',
    description: 'Our AI reads between the lines of reviews to tell you if guests were happy, neutral, or frustrated instantly.',
  },
  {
    icon: Layers,
    number: '02',
    title: 'No More Sorting Reviews Manually',
    description: 'We automatically group guest comments into neat topics like Cleanliness, Staff Service, and Amenities.',
  },
  {
    icon: TrendingUp,
    number: '03',
    title: 'Track Your Business at a Glance',
    description: 'Watch your homestay grow with simple, easy-to-read charts. Download clean summary reports with just one click.',
  },
  {
    icon: Search,
    number: '04',
    title: 'Find Any Review in Seconds',
    description: 'Keep all past guest feedback safely stored in one place. Search and find any specific review or comment in less than a second.',
  },
];

export default function WhyGuestPulse() {
  return (
    <section className="relative py-24 md:py-32 bg-white dark:bg-[#0B1220] border-t border-border/40 overflow-hidden transition-colors duration-300">
      {/* Cinematic Ambient Glow Backdrops */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#3CB371]/5 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-[#C49A5A]/5 to-transparent rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto w-full px-6 relative z-10">
        
        {/* Title Block */}
        <div className="mb-16 text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[#C49A5A] text-xs font-bold tracking-[0.25em] uppercase block font-sans">
            GuestPulse Advantage
          </span>
          <h2 className="font-lobster text-5xl md:text-6xl text-[#1F2937] dark:text-[#F8FAFC] leading-tight">
            Why Choose Us?
          </h2>
        </div>

        {/* 2-Column Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full">
          
          {/* Left Column: Homestay Collage Visual (Focal Point) */}
          <div className="lg:col-span-6 flex justify-center items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="w-full max-w-[500px] bg-[#F4EFEA] border border-[#D2C9BE] rounded-none shadow-md overflow-hidden flex flex-col justify-between py-6 md:py-8 select-none"
            >
              {/* Top row */}
              <div className="grid grid-cols-2 gap-4 p-6 md:p-8 pb-3">
                <div className="relative aspect-[3/4] overflow-hidden rounded-none shadow-sm">
                  <Image
                    src="/images/mountain_cabin_pool.png"
                    alt="Modern mountain cabin with pool"
                    fill
                    sizes="(max-width: 768px) 50vw, 250px"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="relative aspect-[3/4] overflow-hidden rounded-none shadow-sm">
                  <Image
                    src="/images/heritage_homestay.png"
                    alt="Heritage homestay villa"
                    fill
                    sizes="(max-width: 768px) 50vw, 250px"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </div>

              {/* Curved text path decoration */}
              <div className="px-6 md:px-8 py-2 flex items-center justify-center">
                <svg viewBox="0 0 500 55" className="w-full">
                  <path id="curve" d="M 20,45 Q 250,5 480,45" fill="none" />
                  <text className="fill-[#1F2937] text-[13px] font-bold tracking-[0.25em] uppercase font-sans">
                    <textPath href="#curve" startOffset="50%" textAnchor="middle">
                      BUILD FOR EVERY KIND OF HOMESTAY
                    </textPath>
                  </text>
                </svg>
              </div>

              {/* Bottom row */}
              <div className="grid grid-cols-3 gap-3 p-6 md:p-8 pt-2">
                <div className="relative aspect-[2/3] overflow-hidden rounded-none shadow-sm">
                  <Image
                    src="/images/bamboo_eco_lodge.png"
                    alt="Eco friendly bamboo lodge"
                    fill
                    sizes="(max-width: 768px) 33vw, 150px"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="relative aspect-[2/3] overflow-hidden rounded-none shadow-sm">
                  <Image
                    src="/images/mountain_view_balcony.png"
                    alt="Mountain view balcony"
                    fill
                    sizes="(max-width: 768px) 33vw, 150px"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="relative aspect-[2/3] overflow-hidden rounded-none shadow-sm">
                  <Image
                    src="/images/traditional_colorful_stay.png"
                    alt="Traditional colorful stay"
                    fill
                    sizes="(max-width: 768px) 33vw, 150px"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </div>

              {/* Fine line decoration at the bottom */}
              <div className="border-t border-[#D2C9BE] mx-6 md:mx-8 mb-6" />
            </motion.div>
          </div>

          {/* Right Column: Structured Benefit Cards */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            {reasons.map((reason, index) => {
              const Icon = reason.icon;
              return (
                <motion.div
                  key={reason.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex flex-col sm:flex-row gap-4 p-5 rounded-2xl bg-slate-50/50 border border-slate-200/60 dark:bg-[#17212B]/40 dark:border-white/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(60,179,113,0.06)] hover:bg-white dark:hover:bg-[#17212B] hover:border-[#3CB371]/35 group cursor-default"
                >
                  {/* Icon Container */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#3CB371]/10 flex items-center justify-center text-[#3CB371] group-hover:bg-[#3CB371] group-hover:text-white transition-all duration-300">
                    <Icon className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  
                  {/* Text Container */}
                  <div className="space-y-1.5">
                    <h4 className="font-sans font-semibold text-lg text-foreground tracking-tight group-hover:text-[#3CB371] transition-colors duration-300">
                      {reason.title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {reason.description}
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
