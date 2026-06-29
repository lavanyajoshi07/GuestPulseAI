'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, useTransform, useSpring, MotionValue } from 'framer-motion';

interface ScrollZoomProps {
  scrollYProgress: MotionValue<number>;
  onImagesLoaded: () => void;
}

export default function ScrollZoom({ scrollYProgress, onImagesLoaded }: ScrollZoomProps) {
  const [loadedCount, setLoadedCount] = useState(0);

  // Trigger callback in useEffect to adhere to React 19 rules and avoid setState during render
  useEffect(() => {
    if (loadedCount === 2) {
      onImagesLoaded();
    }
  }, [loadedCount, onImagesLoaded]);

  const handleImageLoad = () => {
    setLoadedCount((prev) => prev + 1);
  };

  // Apply physics-based spring smoothing to the scroll progress
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 30,
    stiffness: 90,
    mass: 0.5,
    restDelta: 0.001
  });

  // Synchronized camera pull-back transformations
  // Transforms mapping: scroll progress [0, 1]
  const scaleClose = useTransform(smoothProgress, [0, 1], [1.08, 0.95]);
  const scaleMedium = useTransform(smoothProgress, [0, 1], [1.18, 1.0]);

  // Fade out the top (close) image to reveal the fully opaque medium image behind it.
  // This prevents any transparency "dip" where the dark background shows through, keeping the transition bright.
  const opacityClose = useTransform(smoothProgress, [0.15, 0.65], [1, 0]);

  return (
    <div className="absolute inset-0 w-full h-full select-none overflow-hidden bg-black z-0">
      {/* 1. Medium Image (Destination of Camera Pull-back) */}
      <motion.div
        style={{
          scale: scaleMedium,
          transformOrigin: 'center center',
        }}
        className="absolute inset-0 w-full h-full will-change-[transform]"
      >
        <Image
          src="/hero/hero-medium.png"
          alt="GuestPulse AI Homestay Medium View"
          fill
          priority
          quality={100}
          sizes="100vw"
          className="object-cover"
          onLoad={handleImageLoad}
        />
      </motion.div>

      {/* 2. Close Image (Start of Camera Pull-back) */}
      <motion.div
        style={{
          scale: scaleClose,
          opacity: opacityClose,
          transformOrigin: 'center center',
        }}
        className="absolute inset-0 w-full h-full will-change-[transform,opacity]"
      >
        {/* Slow, subtle cinematic floating/breathing layer */}
        <motion.div
          animate={{
            scale: [1, 1.01, 1],
            x: [0, 1.5, -1.5, 0],
            y: [0, -1.5, 1.5, 0],
          }}
          transition={{
            scale: { duration: 25, ease: "easeInOut", repeat: Infinity },
            x: { duration: 32, ease: "easeInOut", repeat: Infinity },
            y: { duration: 27, ease: "easeInOut", repeat: Infinity },
          }}
          className="w-full h-full relative will-change-transform"
        >
          <Image
            src="/hero/hero-close.png"
            alt="GuestPulse AI Homestay Close View"
            fill
            priority
            quality={100}
            sizes="100vw"
            className="object-cover"
            onLoad={handleImageLoad}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
