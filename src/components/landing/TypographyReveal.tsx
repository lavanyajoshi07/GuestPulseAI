'use client';

import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface TypographyRevealProps {
  onComplete: () => void;
}

export default function TypographyReveal({ onComplete }: TypographyRevealProps) {
  const titleControls = useAnimation();
  const subtitleControls = useAnimation();

  const titleText = "GuestPulse AI";
  const letters = titleText.split("");

  useEffect(() => {
    let isMounted = true;

    const runTimeline = async () => {
      // 0.3s: GuestPulse AI reveal begins (reduced from 0.8s)
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (!isMounted) return;
      await titleControls.start("visible");
      
      // Show subtitle and CTA buttons sooner (reduced from 1.4s to 0.7s)
      await new Promise((resolve) => setTimeout(resolve, 700));
      if (!isMounted) return;
      
      // Start subtitle animation
      await subtitleControls.start("visible");

      // Wait 1.0s (reduced from 1.6s) before unlocking page scroll
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (!isMounted) return;
      onComplete();
    };

    runTimeline();

    return () => {
      isMounted = false;
    };
  }, [titleControls, subtitleControls, onComplete]);

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
        duration: 1.6, // Increased from 1.0 to 1.6 for smoother flow
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
    </div>
  );
}
