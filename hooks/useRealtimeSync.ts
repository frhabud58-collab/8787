import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Real-time sync hook that listens to Firestore changes instantly.
 * No polling needed - uses onSnapshot events from firebaseSync.
 */
export function useRealtimeData<T>(storageKey: string, defaultValue: T): [T, boolean, string] {
  const [data, setData] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch { return defaultValue; }
  });
  const [isLive, setIsLive] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('الآن');

  useEffect(() => {
    // Read initial data
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setData(JSON.parse(saved));
    } catch {}

    // Listen for REAL-TIME updates from Firestore onSnapshot
    const handleRealtime = (e: Event) => {
      const custom = e as CustomEvent;
      try {
        const newData = custom.detail?.data ?? JSON.parse(localStorage.getItem(storageKey) || 'null');
        if (newData) {
          setData(newData);
          setIsLive(true);
          setLastUpdate('الآن');
        }
      } catch {}
    };

    const handleGeneric = (e: Event) => {
      const custom = e as CustomEvent;
      if (custom.detail?.key === storageKey) {
        try {
          const newData = JSON.parse(localStorage.getItem(storageKey) || 'null');
          if (newData) {
            setData(newData);
            setLastUpdate('الآن');
          }
        } catch {}
      }
    };

    // Key-specific event (fastest path)
    window.addEventListener(`mix-realtime-${storageKey}`, handleRealtime);
    // Generic event (fallback)
    window.addEventListener('local-storage-change', handleGeneric);
    // Cross-tab event
    window.addEventListener('storage', handleGeneric);

    return () => {
      window.removeEventListener(`mix-realtime-${storageKey}`, handleRealtime);
      window.removeEventListener('local-storage-change', handleGeneric);
      window.removeEventListener('storage', handleGeneric);
    };
  }, [storageKey]);

  return [data, isLive, lastUpdate];
}

/**
 * Real-time toast notification that shows when data updates live
 */
export function useRealtimeToast() {
  const [toast, setToast] = useState<{ message: string; type: 'update' | 'order' | 'chat' } | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const showToast = useCallback((message: string, type: 'update' | 'order' | 'chat' = 'update') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast({ message, type });
    timeoutRef.current = setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const custom = e as CustomEvent;
      const key = custom.detail?.key || '';
      const messages: Record<string, string> = {
        'mix_stores': '🏪 تم تحديث المتاجر',
        'mix_products': '📦 تم تحديث المنتجات',
        'mix_banners': '🖼️ تم تحديث البانرات',
        'mix_orders': '🛒 تم تحديث الطلب',
        'mix_categories': '📂 تم تحديث الأقسام',
        'mix_platform_settings': '⚙️ تم تحديث إعدادات المنصة',
        'mix_chat_messages': '💬 رسالة جديدة',
        'mix_chat_rooms': '💬 تحديث المحادثات',
      };
      if (messages[key]) {
        showToast(messages[key], key.includes('order') ? 'order' : key.includes('chat') ? 'chat' : 'update');
      }
    };

    window.addEventListener('local-storage-change', handleUpdate);
    return () => window.removeEventListener('local-storage-change', handleUpdate);
  }, [showToast]);

  return { toast, showToast };
}
