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
    <section className="relative py-20 lg:py-0 bg-white dark:bg-[#0B1220] border-t border-border/40 overflow-hidden lg:h-[80vh] lg:min-h-[700px] lg:max-h-[800px] flex items-center lg:items-stretch">

      {/* ========================================== */}
      {/* DESKTOP BACKGROUND FRAMES WITH TEXT OVERLAYS */}
      {/* ========================================== */}

      {/* Frame 1: Top-left gold background block */}
      <div className="absolute left-0 top-0 h-[50%] w-[25vw] bg-[#C49A5A] hidden lg:flex flex-col justify-center pl-[4vw] pr-4 z-0">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-[16vw] space-y-4 text-[#0A2B1E]"
        >
          <Sparkles className="w-8 h-8 stroke-[1.5]" />
          <div className="space-y-1.5">
            <h4 className="text-xs md:text-sm font-black tracking-wider uppercase leading-tight font-sans">
              {reasons[0].title}
            </h4>
            <p className="text-[10px] md:text-[11px] font-medium leading-relaxed opacity-90">
              {reasons[0].description}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Frame 2: Bottom-left empty frame (White/Dark background) */}
      <div className="absolute left-0 bottom-0 h-[50%] w-[25vw] hidden lg:flex flex-col justify-center pl-[4vw] pr-4 z-0">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-[16vw] space-y-4 text-[#1F2937] dark:text-[#F8FAFC]"
        >
          <Layers className="w-8 h-8 stroke-[1.5] text-[#C49A5A]" />
          <div className="space-y-1.5">
            <h4 className="text-xs md:text-sm font-black tracking-wider uppercase leading-tight font-sans">
              {reasons[1].title}
            </h4>
            <p className="text-[10px] md:text-[11px] font-light leading-relaxed text-[#5F6B7A] dark:text-[#B8C2CC]">
              {reasons[1].description}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Frame 3 & 4: Bottom-right background blocks (Gold and Dark Green) */}
      <div className="absolute bottom-0 right-0 h-[50%] hidden lg:flex z-0" style={{ left: '50%' }}>
        {/* Frame 3: Left bottom-right block (Gold) */}
        <div className="w-[50%] bg-[#C49A5A] flex flex-col justify-center pl-[8vw] pr-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-[16vw] space-y-4 text-[#0A2B1E]"
          >
            <TrendingUp className="w-8 h-8 stroke-[1.5]" />
            <div className="space-y-1.5">
              <h4 className="text-xs md:text-sm font-black tracking-wider uppercase leading-tight font-sans">
                {reasons[2].title}
              </h4>
              <p className="text-[10px] md:text-[11px] font-medium leading-relaxed opacity-90">
                {reasons[2].description}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Frame 4: Right bottom-right block (Dark Green) */}
        <div className="w-[50%] bg-[#0A2B1E] flex flex-col justify-center pl-[4vw] pr-[4vw]">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-[16vw] space-y-4 text-[#F4EFEA]"
          >
            <Search className="w-8 h-8 stroke-[1.5] text-[#C49A5A]" />
            <div className="space-y-1.5">
              <h4 className="text-xs md:text-sm font-black tracking-wider uppercase leading-tight font-sans">
                {reasons[3].title}
              </h4>
              <p className="text-[10px] md:text-[11px] font-light leading-relaxed opacity-80">
                {reasons[3].description}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ========================================== */}
      {/* MAIN CONTENT GRID */}
      {/* ========================================== */}
      <div className="max-w-[1600px] mx-auto w-full px-6 relative z-10 flex lg:items-stretch">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start lg:items-stretch w-full">
          {/* Left Column: Collage Card */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end lg:pr-8 items-stretch relative z-20">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="w-full max-w-[540px] lg:max-w-[480px] h-auto lg:h-full bg-[#F4EFEA] border border-[#D2C9BE] rounded-none shadow-md overflow-hidden flex flex-col justify-between py-6 lg:py-8"
            >
              {/* Top row */}
              <div className="grid grid-cols-2 gap-4 p-6 md:p-8 pb-3">
                <div className="relative aspect-[3/4] overflow-hidden rounded-none shadow-sm">
                  <Image
                    src="/images/mountain_cabin_pool.png"
                    alt="Modern mountain cabin with pool"
                    fill
                    sizes="(max-width: 768px) 50vw, 270px"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="relative aspect-[3/4] overflow-hidden rounded-none shadow-sm">
                  <Image
                    src="/images/heritage_homestay.png"
                    alt="Heritage homestay villa"
                    fill
                    sizes="(max-width: 768px) 50vw, 270px"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </div>

              {/* Curved text divider */}
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
                    sizes="(max-width: 768px) 33vw, 180px"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="relative aspect-[2/3] overflow-hidden rounded-none shadow-sm">
                  <Image
                    src="/images/mountain_view_balcony.png"
                    alt="Mountain view balcony"
                    fill
                    sizes="(max-width: 768px) 33vw, 180px"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="relative aspect-[2/3] overflow-hidden rounded-none shadow-sm">
                  <Image
                    src="/images/traditional_colorful_stay.png"
                    alt="Traditional colorful stay"
                    fill
                    sizes="(max-width: 768px) 33vw, 180px"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              </div>

              {/* Fine line at the bottom */}
              <div className="border-t border-[#D2C9BE] mx-6 md:mx-8 mb-6 lg:mb-0" />
            </motion.div>
          </div>

          {/* Right Column: Text */}
          <div className="lg:col-span-5 lg:col-start-8 flex flex-col justify-center lg:justify-start items-center text-center px-6 py-12 lg:pt-24 lg:pb-0 min-h-[400px] lg:min-h-0 relative z-20">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="space-y-0 flex flex-col items-center justify-center text-center"
            >
              <h2 className="font-lobster text-6xl md:text-7xl lg:text-[6.5rem] xl:text-[7.5rem] leading-[0.9] text-[#1F2937] dark:text-[#F8FAFC]">
                Why
              </h2>
              <h3 className="font-lobster text-4xl md:text-5xl lg:text-[4rem] xl:text-[4.5rem] leading-[0.9] text-[#1F2937] dark:text-[#F8FAFC] mt-2">
                Choose Us?
              </h3>
            </motion.div>

            {/* Mobile Fallback: List of reasons (only rendered on smaller screens where absolute blocks are hidden) */}
            <div className="mt-12 space-y-6 text-left lg:hidden w-full max-w-[500px]">
              {reasons.map((reason) => {
                const Icon = reason.icon;
                return (
                  <div key={reason.title} className="space-y-2">
                    <Icon className="w-6 h-6 text-[#C49A5A]" />
                    <div className="space-y-1">
                      <h4 className="text-base font-extrabold text-[#1F2937] dark:text-[#F8FAFC] tracking-wider uppercase leading-tight font-sans">
                        {reason.title}
                      </h4>
                      <p className="text-xs font-light text-[#5F6B7A] dark:text-[#B8C2CC] leading-relaxed">
                        {reason.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile blocks (rendered inside content flow only for lg and below) */}
            <div className="flex w-full h-[100px] mt-12 rounded-[12px] overflow-hidden lg:hidden shadow-md">
              <div className="w-[50%] bg-[#C49A5A]" />
              <div className="w-[50%] bg-[#0A2B1E]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
