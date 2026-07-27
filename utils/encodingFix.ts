/**
 * Arabic Text Encoding Fix Utility
 * Fixes corrupted Arabic text where UTF-8 bytes were misinterpreted as Latin-1
 * This happens when text like "الكل" becomes "ط§ظ„ظƒظ„"
 */

/**
 * Fix corrupted Arabic text by converting from Latin-1 to UTF-8
 * @param text - The potentially corrupted text
 * @returns The fixed text if corruption is detected, otherwise the original text
 */
export function fixArabicText(text: string): string {
  if (!text || typeof text !== 'string') return text;
  
  try {
    // Detect if text is corrupted by checking for specific patterns
    // Corrupted Arabic typically contains sequences like ط§ظ„ which are Latin-1 misinterpretations
    const hasCorruptionPattern = /ط[§ظ]/.test(text) || /ظ[…†‡ˆ‰Š‹Œ]/.test(text);
    
    if (hasCorruptionPattern) {
      // Convert from Latin-1 to UTF-8
      const fixed = Buffer.from(text, 'latin1').toString('utf-8');
      // Verify the fixed text contains valid Arabic
      if (/[\u0600-\u06FF]/.test(fixed)) {
        return fixed;
      }
    }
  } catch (error) {
    console.error('Error fixing Arabic text:', error);
  }
  
  return text;
}

/**
 * Recursively fix Arabic text in an object
 * @param obj - The object to fix
 * @returns The object with fixed Arabic text
 */
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

/**
 * Fix Arabic text in localStorage data
 * @param key - The localStorage key to fix
 * @param defaultValue - Default value if key doesn't exist
 * @returns The fixed data
 */
export function loadAndFixData<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    
    const parsed = JSON.parse(item);
    const fixed = fixArabicInObject(parsed);
    
    // Save the fixed data back to localStorage
    localStorage.setItem(key, JSON.stringify(fixed));
    
    return fixed as T;
  } catch (error) {
    console.error(`Error loading and fixing key ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Fix all existing corrupted data in localStorage
 * Call this once on app initialization
 */
export function fixAllCorruptedData(): void {
  const keysToFix = [
    'mix_stores',
    'mix_products',
    'mix_banners',
    'mix_reviews',
    'mix_coupons',
    'mix_orders',
    'mix_categories',
    'mix_users',
    'mix_platform_settings',
    'mix_store_requests'
  ];
  
  keysToFix.forEach(key => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        const fixed = fixArabicInObject(parsed);
        const fixedString = JSON.stringify(fixed);
        
        // Only update if data was actually fixed
        if (fixedString !== item) {
          localStorage.setItem(key, fixedString);
          console.log(`Fixed corrupted Arabic text in: ${key}`);
        }
      }
    } catch (error) {
      console.error(`Error fixing key ${key}:`, error);
    }
  });
}

/**
 * Check if text contains corrupted Arabic
 * @param text - Text to check
 * @returns true if text appears to be corrupted
 */
export function isCorruptedArabic(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  
  // Check for common corruption patterns
  // These are Latin-1 byte values that appear when UTF-8 Arabic is misinterpreted
  const corruptionPatterns = [
    /ط[§ظ]/,  // ال
    /ظ[…†‡ˆ‰Š‹Œ]/,  // Various corrupted Arabic characters
    /طھ/,  // ت
    /ط±/,  // ر
    /ظˆ/,  // و
    /ظ„/,  // ا
  ];
  
  return corruptionPatterns.some(pattern => pattern.test(text));
}