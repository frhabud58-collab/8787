if (typeof window !== 'undefined') {
  // Add global error filters for IndexedDB/Storage quota errors to prevent application crashes or error overlays
  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (
      msg.includes('indexedDB') || 
      msg.includes('IndexedDB') || 
      msg.includes('QuotaExceededError') || 
      msg.includes('FILE_ERROR_NO_SPACE') ||
      msg.includes('backing store')
    ) {
      console.warn('⚠️ Prevented app crash from IndexedDB/Storage error:', msg);
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || '';
    if (
      reason.includes('indexedDB') || 
      reason.includes('IndexedDB') || 
      reason.includes('QuotaExceededError') || 
      reason.includes('FILE_ERROR_NO_SPACE') ||
      reason.includes('backing store')
    ) {
      console.warn('⚠️ Prevented app crash from unhandled IndexedDB/Storage promise rejection:', reason);
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './i18n'; // Load translations
import App from './App.tsx';
import './index.css';

// Register service worker for PWA (production only — avoids CacheStorage
// errors and stale-cache issues while running the local dev server)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

