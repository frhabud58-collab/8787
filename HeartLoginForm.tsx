
import React, { useState } from 'react';
import { User, Lock, CheckCircle2 } from 'lucide-react';

interface HeartLoginFormProps {
  onSuccess: (user: any) => void;
}

export default function HeartLoginForm({ onSuccess }: HeartLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check the exact credentials from user request
    if (email.toLowerCase() === 'gomay35736@fishnone.com' && password === 'alatbawi123') {
      const alatbawiUser = {
        id: 'merchant-alatbawi',
        name: 'العتباوي',
        email: 'gomay35736@fishnone.com',
        role: 'merchant' as const,
        storeId: 'store-alatbawi'
      };
      setSuccess(true);
      setTimeout(() => {
        onSuccess(alatbawiUser);
      }, 800);
    } else {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-xs text-red-400 bg-red-900/20 border border-red-500/30 rounded-xl p-3 text-right">
          {error}
        </div>
      )}
      {success && (
        <div className="text-xs text-green-400 bg-green-900/20 border border-green-500/30 rounded-xl p-3 text-right flex items-center gap-2">
          <CheckCircle2 size={14} />
          تم تسجيل الدخول بنجاح!
        </div>
      )}

      <div className="space-y-1">
        <label className="text-[11px] text-pink-200 font-bold text-right block">البريد الإلكتروني</label>
        <div className="relative">
          <User size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="gomay35736@fishnone.com"
            className="w-full bg-zinc-950/80 border border-pink-500/30 focus:border-pink-400 focus:ring-1 focus:ring-pink-400/50 rounded-xl py-2.5 pr-10 pl-3 text-xs text-white placeholder-zinc-600 transition-all text-right outline-none"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[11px] text-pink-200 font-bold text-right block">كلمة المرور</label>
        <div className="relative">
          <Lock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-400" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="alatbawi123"
            className="w-full bg-zinc-950/80 border border-pink-500/30 focus:border-pink-400 focus:ring-1 focus:ring-pink-400/50 rounded-xl py-2.5 pr-10 pl-3 text-xs text-white placeholder-zinc-600 transition-all text-right outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={success}
        className="w-full py-2.5 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 disabled:opacity-70 text-white text-xs font-black rounded-xl transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] cursor-pointer flex items-center justify-center gap-2"
      >
        دخول لوحة التحكم
      </button>
    </form>
  );
}
