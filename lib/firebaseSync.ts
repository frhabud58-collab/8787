// Minimal localStorage-backed stub for firebaseSync — no external Firebase needed.
// This keeps the app functional for local builds/testing.

const KEY_MAP: Record<string, string> = {
  stores: 'mix_stores',
  products: 'mix_products',
  orders: 'mix_orders',
  banners: 'mix_banners',
  reviews: 'mix_reviews',
  coupons: 'mix_coupons',
  users: 'mix_users',
  storeRequests: 'mix_store_requests',
  platformSettings: 'mix_platform_settings',
  storeTemplates: 'mix_store_templates',
};

function readKey(key: string): any[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeKey(key: string, data: any[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key } }));
  } catch {}
}

export function saveLocal(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key } }));
  } catch {}
}

export const fbSync = {
  init: async () => {},
  destroy: () => {},

  saveStore: async (store: any) => {
    const all = readKey('mix_stores');
    const idx = all.findIndex((s: any) => s.id === store.id);
    if (idx >= 0) all[idx] = store;
    else all.push(store);
    writeKey('mix_stores', all);
  },

  saveAllStores: async (stores: any[]) => writeKey('mix_stores', stores),

  saveProduct: async (product: any) => {
    const all = readKey('mix_products');
    const idx = all.findIndex((p: any) => p.id === product.id);
    if (idx >= 0) all[idx] = product;
    else all.push(product);
    writeKey('mix_products', all);
  },

  saveAllProducts: async (products: any[]) => writeKey('mix_products', products),

  saveOrder: async (order: any) => {
    const all = readKey('mix_orders');
    const idx = all.findIndex((o: any) => o.id === order.id);
    if (idx >= 0) all[idx] = order;
    else all.unshift(order);
    writeKey('mix_orders', all);
  },

  saveBanner: async (banner: any) => {
    const all = readKey('mix_banners');
    const idx = all.findIndex((b: any) => b.id === banner.id);
    if (idx >= 0) all[idx] = banner;
    else all.push(banner);
    writeKey('mix_banners', all);
  },

  saveAllBanners: async (banners: any[]) => writeKey('mix_banners', banners),

  saveReview: async (review: any) => {
    const all = readKey('mix_reviews');
    const idx = all.findIndex((r: any) => r.id === review.id);
    if (idx >= 0) all[idx] = review;
    else all.unshift(review);
    writeKey('mix_reviews', all);
  },

  saveCoupon: async (coupon: any) => {
    const all = readKey('mix_coupons');
    const idx = all.findIndex((c: any) => c.id === coupon.id);
    if (idx >= 0) all[idx] = coupon;
    else all.push(coupon);
    writeKey('mix_coupons', all);
  },

  saveUser: async (user: any) => {
    const all = readKey('mix_users');
    const idx = all.findIndex((u: any) => u.id === user.id || u.email === user.email);
    if (idx >= 0) all[idx] = user;
    else all.push(user);
    writeKey('mix_users', all);
  },

  saveStoreRequest: async (req: any) => {
    const all = readKey('mix_store_requests');
    const idx = all.findIndex((r: any) => r.id === req.id);
    if (idx >= 0) all[idx] = req;
    else all.push(req);
    writeKey('mix_store_requests', all);
  },

  updateStoreRequest: async (id: string, updates: any) => {
    const all = readKey('mix_store_requests');
    const idx = all.findIndex((r: any) => r.id === id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...updates };
      writeKey('mix_store_requests', all);
    }
  },

  savePlatformSettings: async (settings: any) => {
    try {
      const current = JSON.parse(localStorage.getItem('mix_platform_settings') || '{}');
      const merged = { ...current, ...settings };
      localStorage.setItem('mix_platform_settings', JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_platform_settings' } }));
    } catch {}
  },

  savePlatformName: async (name: string) => {
    try {
      localStorage.setItem('mix_platform_name', name);
      window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_platform_name' } }));
    } catch {}
  },

  resetAll: async (_options?: any) => {
    Object.values(KEY_MAP).forEach((key) => {
      localStorage.removeItem(key);
    });
    window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_stores' } }));
  },
};
