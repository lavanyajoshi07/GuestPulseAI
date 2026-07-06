'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const steps = [
  {
    number: '01',
    title: 'Collect Guest Reviews',
    description:
      'Gather authentic feedback from guests through surveys, review platforms, and direct interactions, ensuring every voice is captured in one place.',
    image: '/how%20it%20works/3.png',
    alt: 'Laptop and phone collage with gold icons representing guest review collection',
  },
  {
    number: '02',
    title: 'AI Analyzes Feedback',
    description:
      'Our AI engine processes reviews at scale, detecting sentiment, recurring themes, and hidden patterns that manual analysis often misses.',
    image: '/how%20it%20works/4.png',
    alt: 'Hands with analytics sheet and charts showing AI feedback analysis',
  },
  {
    number: '03',
    title: 'Generate Insights',
    description:
      'Transform raw data into actionable insights with clear dashboards and reports, highlighting strengths and areas for improvement.',
    image: '/how%20it%20works/5.png',
    alt: 'Hands pointing at a tablet with graphs for generating insights',
  },
  {
    number: '04',
    title: 'Improve Guest Experience',
    description:
      'Use insights to refine services, train staff, and enhance operations, creating memorable experiences that drive loyalty and growth.',
    image: '/how%20it%20works/6.png',
    alt: 'High-five gesture collage with confetti for improving guest experience',
  },
];

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-[#F9F8F5] px-6 pt-24 pb-36 lg:pb-48 text-[#1F2937] dark:bg-[#0B1220] dark:text-[#F8FAFC]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#C49A5A]/8 blur-[120px] dark:bg-[#C49A5A]/10" />
        <div className="absolute right-[-8rem] top-24 h-[320px] w-[320px] rounded-full bg-white/40 blur-[140px] dark:bg-white/5" />
      </div>

      <div className="relative mx-auto max-w-[1600px]">
        <div className="mx-auto mb-14 max-w-4xl text-center md:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="font-lobster text-4xl text-[#1F2937] dark:text-[#F8FAFC] md:text-5xl lg:text-6xl"
          >
            How It Works
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mx-auto mt-5 max-w-3xl text-base font-medium leading-7 text-[#5F6B7A] dark:text-[#B8C2CC] md:text-lg"
          >
            For continuous steps designed to turn raw guest feedback into operational excellence
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4 xl:gap-7">
          {steps.map((step, index) => (
            <motion.article
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              whileHover={{ y: -6 }}
              className="group h-full"
            >
              <div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-[24px] border border-[#C49A5A] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition-all duration-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.14)] dark:bg-[#17212B] dark:shadow-[0_12px_32px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_20px_48px_rgba(0,0,0,0.48)]">
                <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-6 md:px-7 md:pt-7">
                  <span className="text-base md:text-lg font-bold tracking-[0.42em] text-[#C49A5A]">
                    {step.number}
                  </span>
                </div>

                <div className="flex flex-1 flex-col px-6 pb-6 md:px-7 md:pb-7">
                  <div className="mb-4 flex flex-1 items-center justify-center">
                    <div className="relative flex h-full w-full items-center justify-center py-1">
                      <Image
                        src={step.image}
                        alt={step.alt}
                        width={720}
                        height={520}
                        priority={index === 0}
                        className="h-auto w-full max-w-[85%] object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                        sizes="(min-width: 1280px) 23vw, (min-width: 1024px) 46vw, 100vw"
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <h3 className="font-serif text-[1.25rem] font-bold leading-tight text-[#1F2937] dark:text-[#F8FAFC] md:text-[1.35rem]">
                      {step.title}
                    </h3>

                    <p className="max-w-[34ch] font-serif text-[14px] font-normal leading-6 text-[#5F6B7A] dark:text-[#B8C2CC] md:text-[14px]">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}