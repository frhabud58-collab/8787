import React, { useState, useEffect } from 'react';

const APP_DOWNLOAD_URL = 'https://www.appcreator24.com/app4115582-8wnxv6';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit'>('enter');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('show'), 600);
    const t2 = setTimeout(() => setPhase('exit'), 4000);
    const t3 = setTimeout(onComplete, 4600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B0B0B] transition-opacity duration-500 ${
        phase === 'exit' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#D4A63D] rounded-full blur-[200px] opacity-15" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-white rounded-full blur-[150px] opacity-5" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center animate-splash-fadeIn">
        {/* Logo */}
        <div className="animate-splash-pulse rounded-3xl p-6 bg-[#121212] border border-[#D4A63D]/30">
          <h1 className="text-5xl sm:text-6xl font-black tracking-tighter font-sans text-[#D4A63D]">
            MIX<span className="text-white italic">.</span>
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-[#8E8E8E] text-sm font-medium max-w-xs leading-relaxed">
          منصة المتاجر الموحدة - اكتشف آلاف المنتجات من أفضل المتاجر في مصر
        </p>

        {/* Loading dots */}
        <div className="flex gap-2 mt-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[#D4A63D]"
              style={{
                animation: 'splashPulse 1.2s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>

        {/* Download App Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <a
            href={APP_DOWNLOAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-6 py-3 bg-[#D4A63D] text-black font-extrabold text-sm rounded-2xl hover:bg-[#E5BC55] transition-all duration-300 shadow-[0_0_40px_rgba(212,166,61,0.3)] hover:shadow-[0_0_60px_rgba(212,166,61,0.5)] active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 010 1.732l-2.807 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/></svg>
            Google Play
          </a>
          <a
            href={APP_DOWNLOAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-6 py-3 bg-white/10 border border-white/20 text-white font-extrabold text-sm rounded-2xl hover:bg-white/20 transition-all duration-300 active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            App Store
          </a>
        </div>

        {/* Skip link */}
        <button
          onClick={onComplete}
          className="text-[#8E8E8E] text-xs hover:text-[#D4A63D] transition-colors cursor-pointer mt-2 underline underline-offset-2"
        >
          تخطي والدخول للمتجر
        </button>
      </div>
    </div>
  );
}
