import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';

const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('mix_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('mix_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.backgroundColor = '#f5f5f0';
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.style.backgroundColor = '';
    }
  }, [theme]);

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="p-2 rounded-xl border border-[#2B2B2B] hover:bg-[#1a1a1a] transition-all cursor-pointer"
      title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}>
      <motion.div initial={false} animate={{ rotate: theme === 'light' ? 0 : 180 }} transition={{ duration: 0.3 }}>
        {theme === 'light' ? <Moon className="w-4 h-4 text-zinc-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
      </motion.div>
    </button>
  );
};

export default ThemeToggle;
