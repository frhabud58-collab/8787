/**
 * Arabic Text Encoding Fix Utility (browser-safe)
 * Fixes corrupted Arabic text where UTF-8 bytes were misinterpreted as Latin-1.
 * Uses TextEncoder/TextDecoder instead of Node.js Buffer.
 */

const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8');

export function fixArabicText(text: string): string {
  if (!text || typeof text !== 'string') return text;

  try {
    const hasCorruptionPattern = /ط[§ظ]/.test(text) || /ظ[…†‡ˆ‰Š‹Œ]/.test(text);
    if (hasCorruptionPattern) {
      const bytes = encoder.encode(text);
      const fixed = decoder.decode(bytes);
      if (/[\u0600-\u06FF]/.test(fixed)) {
        return fixed;
      }
    }
  } catch {
    // Silent fail — text stays as-is
  }

  return text;
}

export function fixArabicInObject(obj: any): any {
  if (typeof obj === 'string') {
    return fixArabicText(obj);
  } else if (Array.isArray(obj)) {
    return obj.map(fixArabicInObject);
  } else if (obj && typeof obj === 'object') {
    const fixed: any = {};
    for (const key in obj) {
      fixed[key] = fixArabicInObject(obj[key]);
    }
    return fixed;
  }
  return obj;
}

export function loadAndFixData<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    const parsed = JSON.parse(item);
    const fixed = fixArabicInObject(parsed);
    localStorage.setItem(key, JSON.stringify(fixed));
    return fixed as T;
  } catch {
    return defaultValue;
  }
}

export function fixAllCorruptedData(): void {
  const keysToFix = [
    'mix_stores', 'mix_products', 'mix_banners', 'mix_reviews',
    'mix_coupons', 'mix_orders', 'mix_categories', 'mix_users',
    'mix_platform_settings', 'mix_store_requests'
  ];

  keysToFix.forEach(key => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        const fixed = fixArabicInObject(parsed);
        const fixedString = JSON.stringify(fixed);
        if (fixedString !== item) {
          localStorage.setItem(key, fixedString);
        }
      }
    } catch {
      // Skip unreadable keys
    }
  });
}

export function isCorruptedArabic(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const corruptionPatterns = [
    /ط[§ظ]/, /ظ[…†‡ˆ‰Š‹Œ]/, /طھ/, /ط±/, /ظˆ/, /ظ„/,
  ];
  return corruptionPatterns.some(pattern => pattern.test(text));
}
