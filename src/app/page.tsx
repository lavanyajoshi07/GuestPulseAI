import Hero from '@/components/landing/Hero';
import SmoothScroll from '@/components/landing/SmoothScroll';

export default function HomePage() {
  return (
    <main className="relative bg-background min-h-screen overflow-x-clip">
      {/* Smooth Scroll via Lenis */}
      <SmoothScroll />

      {/* Cinematic Hero (Phase 1) */}
      <Hero />
      
      {/* Phase 2 Placeholder Target */}
      <section
        id="phase-2-target"
        className="relative min-h-screen flex flex-col items-center justify-center bg-background border-t border-border z-30 px-6 py-24 text-center"
      >
        <div className="max-w-md mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground font-sans">
            Phase 2 Starts Here
          </h2>
          <p className="text-muted-foreground mt-4 leading-relaxed font-light text-base md:text-lg">
            Review analytics dashboard, natural language analyzer, and feedback historical databases are preparing for launch.
          </p>
        </div>
      </section>
    </main>
  );
}
