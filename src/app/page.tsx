import Hero from '@/components/landing/Hero';
import SmoothScroll from '@/components/landing/SmoothScroll';
import HomestayTypes from '@/components/landing/HomestayTypes';
import HowItWorks from '@/components/landing/HowItWorks';
import FeatureGrid from '@/components/landing/FeatureGrid';
import DashboardPreview from '@/components/landing/DashboardPreview';
import WhyGuestPulse from '@/components/landing/WhyGuestPulse';
import CallToAction from '@/components/landing/CallToAction';
import Footer from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <main className="relative bg-background min-h-screen overflow-x-clip">
      {/* Smooth Scroll via Lenis */}
      <SmoothScroll />

      {/* Cinematic Hero (Phase 1) - LOCKED & UNTOUCHED */}
      <Hero />
      
      {/* Landing Page Sections (Phase 2) */}
      <div id="phase-2-target" className="relative z-30 bg-background">
        <HomestayTypes />
        <HowItWorks />
        <FeatureGrid />
        <DashboardPreview />
        <WhyGuestPulse />
        <CallToAction />
        <Footer />
      </div>
    </main>
  );
}
