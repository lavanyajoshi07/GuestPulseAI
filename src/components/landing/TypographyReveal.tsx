'use client';

import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface TypographyRevealProps {
  onComplete: () => void;
}

export default function TypographyReveal({ onComplete }: TypographyRevealProps) {
  const titleControls = useAnimation();
  const subtitleControls = useAnimation();
  const ctaControls = useAnimation();

  const titleText = "GuestPulse AI";
  const letters = titleText.split("");

  useEffect(() => {
    const runTimeline = async () => {
      // 0.8s: GuestPulse AI reveal begins
      await new Promise((resolve) => setTimeout(resolve, 800));
      await titleControls.start("visible");
      
      // 3.0s (0.6s pause after title finishes around 2.4s): Subtitle fades in
      // Let's delay 1.0s from the start of title animation to hit exactly 3.0s
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await subtitleControls.start("visible");
      
      // 3.6s (0.6s pause): CTA buttons appear
      await new Promise((resolve) => setTimeout(resolve, 600));
      await ctaControls.start("visible");

      // 4.2s (0.6s pause / completion): Tell parent that intro is complete
      await new Promise((resolve) => setTimeout(resolve, 600));
      onComplete();
    };

    runTimeline();
  }, [titleControls, subtitleControls, ctaControls, onComplete]);

  // Letters container variant
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  // Letter individual variant
  const letterVariants = {
    hidden: {
      y: '100%',
      opacity: 0,
      filter: 'blur(4px)',
    },
    visible: {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1], // Premium Apple-style ease-out expo
      },
    },
  };

  // Subtitle container variant
  const subtitleVariants = {
    hidden: {
      opacity: 0,
      y: 15,
      filter: 'blur(4px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 1.0,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  // CTA Buttons variant
  const ctaVariants = {
    hidden: {
      opacity: 0,
      y: 10,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <div className="flex flex-col items-center justify-center text-center select-none w-full max-w-4xl px-6">
      {/* Title Layer with Clip Path Mask */}
      <motion.h1
        variants={containerVariants}
        initial="hidden"
        animate={titleControls}
        className="flex flex-wrap justify-center text-5xl md:text-7xl font-bold tracking-tight text-white font-sans overflow-hidden py-2"
        style={{ willChange: 'transform, opacity' }}
      >
        {letters.map((letter, idx) => (
          <span key={idx} className="inline-block overflow-hidden relative">
            <motion.span
              variants={letterVariants}
              className="inline-block will-change-[transform,opacity,filter]"
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          </span>
        ))}
      </motion.h1>

      {/* Subtitle Layer */}
      <motion.p
        variants={subtitleVariants}
        initial="hidden"
        animate={subtitleControls}
        className="mt-6 text-xl md:text-2xl text-white/80 font-light tracking-wide max-w-lg leading-relaxed will-change-[transform,opacity,filter]"
      >
        Understand Every Guest.
        <br />
        Improve Every Stay.
      </motion.p>

      {/* CTA Layer */}
      <motion.div
        variants={ctaVariants}
        initial="hidden"
        animate={ctaControls}
        className="mt-8 flex flex-row items-center gap-4 pointer-events-auto will-change-[transform,opacity]"
      >
        <button
          onClick={() => {
            const el = document.getElementById('phase-2-target');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="px-6 py-3 rounded-full bg-white text-black font-medium text-sm md:text-base shadow-lg hover:bg-white/90 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          Get Started
        </button>
        <button
          onClick={() => {
            const el = document.getElementById('phase-2-target');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="px-6 py-3 rounded-full border border-white/25 bg-white/5 backdrop-blur-md text-white font-medium text-sm md:text-base hover:bg-white/10 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          Explore Demo
        </button>
      </motion.div>
    </div>
  );
}
