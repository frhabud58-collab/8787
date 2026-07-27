import React from 'react';
import { Heart, Settings2, ShieldCheck, Smartphone } from 'lucide-react';

interface PhoneCasesHeartProps {
  storeName: string;
  storeLogo: string;
  hideButton?: boolean;
  epithet?: string;
}

/**
 * القلب (Heart) الخاص بمتجر صينات الهواتف (العتباوي).
 * يحتوي على تأثير "فوران" (غليان/فقاعات متصاعدة) ويضم زر لوحة التحكم
 * الذي يفتح مباشرة بدون تسجيل دخول.
 */
export default function PhoneCasesHeart({ storeName, storeLogo, hideButton, epithet }: PhoneCasesHeartProps) {
  // قائمة الفقاعات المتصاعدة (تأثير الفوران)
  const bubbles = Array.from({ length: 14 });

  return (
    <div className="relative w-full my-4 flex flex-col items-center">
      <style>{`
        @keyframes heartPulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 18px rgba(255,107,157,0.55)); }
          50% { transform: scale(1.06); filter: drop-shadow(0 0 38px rgba(255,107,157,0.9)); }
        }
        @keyframes bubbleRise {
          0% { transform: translateY(10px) scale(0.6); opacity: 0; }
          20% { opacity: 0.9; }
          100% { transform: translateY(-90px) scale(1.1); opacity: 0; }
        }
        @keyframes heartGlow {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.7; }
        }
        .heart-pulse { animation: heartPulse 1.8s ease-in-out infinite; }
        .heart-glow { animation: heartGlow 2.2s ease-in-out infinite; }
        .bubble { animation: bubbleRise 2.4s ease-in infinite; }
      `}</style>

      <div className="text-center mb-2 space-y-1">
        {epithet && (
          <div className="inline-flex items-center gap-1 px-4 py-1 bg-gradient-to-r from-amber-600/20 via-yellow-500/20 to-amber-600/20 border border-amber-400/40 rounded-full shadow-[0_0_20px_rgba(212,166,61,0.2)]">
            <span className="text-[9px] sm:text-[10px] font-black text-amber-300 tracking-wider">{epithet}</span>
            <style>{`
              @keyframes crownGlow {
                0%, 100% { filter: drop-shadow(0 0 4px rgba(251,191,36,0.4)); }
                50% { filter: drop-shadow(0 0 12px rgba(251,191,36,0.8)); }
              }
              .crown-glow { animation: crownGlow 2s ease-in-out infinite; }
            `}</style>
            <span className="crown-glow text-amber-300 text-sm">👑</span>
          </div>
        )}
        <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-pink-400 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/30">
          <Smartphone size={12} /> قلب متجر صينات الهواتف 💗
        </span>
      </div>

      {/* القلب مع تأثير الفوران */}
      <div className="relative w-44 h-44 flex items-center justify-center">
        {/* هالة متوهجة خلف القلب */}
        <div className="heart-glow absolute inset-0 rounded-full bg-pink-500/20 blur-2xl" />

        {/* الفقاعات المتصاعدة (الفوران) */}
        <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
          {bubbles.map((_, i) => {
            const left = 12 + ((i * 37) % 76);
            const delay = (i % 7) * 0.32;
            const size = 6 + ((i * 13) % 14);
            return (
              <span
                key={i}
                className="bubble absolute bottom-6 rounded-full bg-gradient-to-t from-pink-400/70 to-white/80"
                style={{
                  left: `${left}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </div>

        {/* شكل القلب */}
        <div className="heart-pulse relative z-10 text-pink-500" style={{ filter: 'drop-shadow(0 0 20px rgba(255,107,157,0.6))' }}>
          <Heart size={112} fill="url(#heartGrad)" stroke="#ff8ab8" strokeWidth={2} />
          <svg width="0" height="0">
            <defs>
              <linearGradient id="heartGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ff6b9d" />
                <stop offset="100%" stopColor="#ff2d6f" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* شعار المتجر داخل القلب */}
        <img
          src={storeLogo}
          alt={storeName}
          className="absolute z-20 w-16 h-16 rounded-full object-cover border-2 border-white/40 shadow-lg"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="text-center mt-3 mb-4">
        <h4 className="text-white font-black text-base">{storeName}</h4>
        {epithet && (
          <p className="text-amber-300/80 text-[10px] mt-0.5 font-bold tracking-wide">{epithet.replace('👑 ', '')}</p>
        )}
        <p className="text-pink-300/70 text-[10px] mt-0.5">متجر صينات هوات متصل بالمنصة مباشرة</p>
      </div>

    </div>
  );
}
