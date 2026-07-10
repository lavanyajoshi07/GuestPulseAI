'use client';

import Image from 'next/image';

export default function HomestayTypes() {
  return (
    <section className="relative w-full bg-[#F9F8F5] dark:bg-[#0B1220] transition-colors duration-300 py-12 md:py-16">
      {/* Visual transitions to blend sections seamlessly */}
      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-background to-transparent pointer-events-none z-0" />
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto px-6 md:px-8 lg:px-12 relative z-10">
        <div className="flex justify-center items-center">
          {/* Light Theme Image & Frame */}
          <div className="block dark:hidden w-full transition-all duration-500 hover:scale-[1.005]">
            <div className="bg-white p-4 md:p-6 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-slate-200/50">
              <Image
                src="/images/homestay_types_light.png?v=3"
                alt="Build for every kind of homestay"
                width={1024}
                height={575}
                priority
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="w-full h-auto object-contain rounded-2xl"
              />
            </div>
          </div>

          {/* Dark Theme Image & Frame - Borderless */}
          <div className="hidden dark:block w-full transition-all duration-500 hover:scale-[1.005]">
            <div className="bg-[#17212B] p-4 md:p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
              <Image
                src="/images/homestay_types_dark.png?v=3"
                alt="Build for every kind of homestay"
                width={1024}
                height={575}
                priority
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="w-full h-auto object-contain rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
