import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface RealtimeToastProps {
  toast: { message: string; type: 'update' | 'order' | 'chat' } | null;
}

export default function RealtimeToast({ toast }: RealtimeToastProps) {
  const bgColor = {
    update: 'from-[#D4A63D]/20 to-[#D4A63D]/5 border-[#D4A63D]/30',
    order: 'from-green-500/20 to-green-500/5 border-green-500/30',
    chat: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
  };

  const textColor = {
    update: 'text-[#D4A63D]',
    order: 'text-green-400',
    chat: 'text-blue-400',
  };

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          className={`fixed top-4 left-1/2 z-[9998] px-5 py-3 rounded-2xl border backdrop-blur-xl bg-gradient-to-r shadow-2xl ${bgColor[toast.type]}`}
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" style={{ color: toast.type === 'update' ? '#D4A63D' : toast.type === 'order' ? '#22c55e' : '#3b82f6' }}></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: toast.type === 'update' ? '#D4A63D' : toast.type === 'order' ? '#22c55e' : '#3b82f6' }}></span>
            </span>
            <span className={`text-xs font-bold ${textColor[toast.type]}`}>{toast.message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
