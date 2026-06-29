'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useNavbar } from '@/context/NavbarContext';
import ScrollZoom from './ScrollZoom';
import TypographyReveal from './TypographyReveal';

// Configurable tuning parameters
const HERO_SCROLL_DISTANCE = 2.5; // Scroll length multiplier (height = 250vh)

export default function Hero() {
  const { setNavbarVisible } = useNavbar();
  const containerRef = useRef<HTMLDivElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isIntroPlaying, setIsIntroPlaying] = useState(true);

  // Monitor scroll progress across the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Debug scroll progress
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    console.log("SCROLL PROGRESS:", latest);
  });

  // Fade out scroll indicator as scroll begins [0, 0.1]
  const opacityIndicator = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  // Initially hide the navbar on mount
  useEffect(() => {
    setNavbarVisible(false);
    return () => {
      setNavbarVisible(true);
    };
  }, [setNavbarVisible]);

  // Observe scroll progress to toggle navbar visibility
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      // Only reveal navbar when camera pull-back is fully completed (> 0.95 progress)
      if (latest > 0.95) {
        setNavbarVisible(true);
      } else {
        setNavbarVisible(false);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress, setNavbarVisible]);

  // Lock scroll on mount and release only when images are loaded and intro animation completes
  useEffect(() => {
    const isLocked = !imagesLoaded || isIntroPlaying;
    if (isLocked) {
      document.body.style.overflow = 'hidden';
      // Safeguard scroll position at top during lock
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [imagesLoaded, isIntroPlaying]);

  const handleImagesLoaded = () => {
    setImagesLoaded(true);
  };

  const handleIntroComplete = () => {
    setIsIntroPlaying(false);
  };

  return (
    <div
      ref={containerRef}
      style={{ height: `${HERO_SCROLL_DISTANCE * 100}vh` }}
      className="relative w-full bg-black"
    >
      {/* Pinned 100vh viewport container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        {/* Layer 1 & 2: Background Image & Crossfade Layers */}
        <ScrollZoom
          scrollYProgress={scrollYProgress}
          onImagesLoaded={handleImagesLoaded}
        />

        {/* Layer 3: Dark Cinematic Gradient Overlay */}
        <div className="absolute inset-0 bg-black/45 z-10 pointer-events-none" />

        {/* Layer 4: Cinematic Film Grain Layer */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-15">
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes grainAnimation {
              0%, 100% { transform: translate(0, 0); }
              10% { transform: translate(-0.5%, -0.5%); }
              20% { transform: translate(-1%, 0.5%); }
              30% { transform: translate(0.5%, -1%); }
              40% { transform: translate(-0.5%, 1.5%); }
              50% { transform: translate(-1%, 0.5%); }
              60% { transform: translate(1.5%, -0.5%); }
              70% { transform: translate(1%, 0.5%); }
              80% { transform: translate(0.5%, -1%); }
              90% { transform: translate(-1.5%, 1%); }
            }
            .film-grain {
              position: absolute;
              inset: -50%;
              width: 200%;
              height: 200%;
              background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
              opacity: 0.02;
              mix-blend-mode: overlay;
              animation: grainAnimation 8s steps(10) infinite;
              pointer-events: none;
              will-change: transform;
            }
          `}} />
          <div className="film-grain" />
        </div>

        {/* Layer 5 & 6: Typography Layer & CTA Layer */}
        {imagesLoaded && (
          <div className="absolute inset-0 flex flex-col justify-end items-center pb-24 md:pb-28 z-25 text-white pointer-events-none">
            <TypographyReveal onComplete={handleIntroComplete} />
          </div>
        )}

        {/* Layer 7: Scroll Indicator */}
        {imagesLoaded && (
          <motion.div
            style={{ opacity: opacityIndicator }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isIntroPlaying ? { opacity: 0 } : { opacity: 0.6, y: 0 }}
              transition={{
                opacity: { duration: 0.8, ease: 'easeOut' },
                y: { duration: 0.8, ease: 'easeOut' },
              }}
              className="flex flex-col items-center gap-1.5"
            >
              <span className="text-xs uppercase tracking-widest text-white/50 font-light font-sans">
                Scroll
              </span>
              <motion.div
                animate={{ y: [0, 4, 0] }}
                transition={{
                  duration: 3.0,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
              >
                <ChevronDown className="w-5 h-5 text-white/50" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
