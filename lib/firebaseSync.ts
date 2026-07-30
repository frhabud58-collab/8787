import { supabase } from './supabaseClient';

/**
 * Real-time sync layer for MIX platform.
 *
 * - Writes go to BOTH Supabase (source of truth) and localStorage (instant local cache).
 * - Real-time subscriptions broadcast INSERT/UPDATE/DELETE to all connected clients.
 * - Each component subscribes to relevant table changes and updates its state live.
 *
 * This replaces the old localStorage-only firebaseSync with a true multi-device
 * real-time backend while keeping localStorage as a fast local cache for reads.
 */

// Table name → localStorage key mapping
const TABLE_KEYS: Record<string, string> = {
  stores: 'mix_stores',
  products: 'mix_products',
  orders: 'mix_orders',
  banners: 'mix_banners',
  reviews: 'mix_reviews',
  coupons: 'mix_coupons',
  app_users: 'mix_users',
  store_requests: 'mix_store_requests',
};

// Reverse mapping: localStorage key → table name
const KEY_TABLES: Record<string, string> = {};
Object.entries(TABLE_KEYS).forEach(([table, key]) => { KEY_TABLES[key] = table; });

function readLocal(key: string): any[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocal(key: string, data: any[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

function dispatchChange(key: string): void {
  window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key } }));
}

// Maps snake_case DB row → camelCase app object
function mapRowToApp(table: string, row: any): any {
  if (!row) return row;
  const mappers: Record<string, (r: any) => any> = {
    stores: (r) => ({
      id: r.id,
      name: r.name,
      logo: r.logo,
      cover: r.cover,
      category: r.category,
      businessType: r.business_type,
      phoneCondition: r.phone_condition,
      description: r.description,
      city: r.city,
      district: r.district,
      neighborhood: r.neighborhood,
      storePhone: r.store_phone,
      seoDescription: r.seo_description,
      seoKeywords: r.seo_keywords,
      slug: r.slug,
      country: r.country,
      rating: Number(r.rating) || 5,
      reviewsCount: r.reviews_count || 0,
      productsCount: r.products_count || 0,
      themeColor: r.theme_color || { primary: '#D4AF37', secondary: '#111111', background: '#050505', frameColor: '#141414', textColor: '#d4d4d8' },
      layoutType: r.layout_type || 'luxury',
      visualTemplate: r.visual_template || 'multicategory',
      banners: r.banners || [],
      categories: r.categories || [],
      featured: r.featured || false,
      status: r.status || 'active',
      ownerId: r.owner_id || '',
      commissionRate: Number(r.commission_rate) || 5,
      salesCount: r.sales_count || 0,
      repairServices: r.repair_services || [],
      features: r.features || [],
      sectionsOrder: r.sections_order || [],
      sectionVisibility: r.section_visibility || {},
      storeLocation: r.store_location || {},
      servicesList: r.services_list || [],
      fontFamily: r.font_family,
      borderRadius: r.border_radius,
      shadowType: r.shadow_type,
      currency: r.currency || 'ر.س',
      paymentGateways: r.payment_gateways || [],
      customCheckoutFields: r.custom_checkout_fields || [],
      epithet: r.epithet,
      templateConfig: r.template_config,
    }),
    products: (r) => ({
      id: r.id,
      storeId: r.store_id,
      name: r.name,
      price: Number(r.price) || 0,
      originalPrice: r.original_price != null ? Number(r.original_price) : undefined,
      image: r.image,
      images: r.images || [],
      category: r.category,
      description: r.description,
      rating: Number(r.rating) || 5,
      stock: r.stock || 0,
      salesCount: r.sales_count || 0,
      isOffer: r.is_offer || false,
      offerText: r.offer_text,
      featured: r.featured || false,
      condition: r.condition,
      warranty: r.warranty,
      specs: r.specs || {},
      brand: r.brand,
      deviceModel: r.device_model,
    }),
    store_requests: (r) => ({
      id: r.id,
      merchantName: r.merchant_name,
      merchantEmail: r.merchant_email,
      merchantPassword: r.merchant_password,
      storeName: r.store_name,
      storeCategory: r.store_category,
      storeDescription: r.store_description,
      storeCity: r.store_city,
      storeDistrict: r.store_district,
      storeNeighborhood: r.store_neighborhood,
      storePhone: r.store_phone,
      storeLogo: r.store_logo,
      storeCover: r.store_cover,
      visualTemplate: r.visual_template,
      commissionRate: Number(r.commission_rate) || 3,
      status: r.status || 'pending',
      approvedAt: r.approved_at,
      storeId: r.store_id,
      merchantUserId: r.merchant_user_id,
    }),
    app_users: (r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      password: r.password,
      role: r.role || 'user',
      storeId: r.store_id,
      status: r.status || 'active',
      epithet: r.epithet,
    }),
    orders: (r) => ({
      id: r.id,
      storeId: r.store_id,
      storeName: r.store_name,
      customerName: r.customer_name,
      customerEmail: r.customer_email,
      customerPhone: r.customer_phone,
      customerAddress: r.customer_address,
      items: r.items || [],
      total: Number(r.total) || 0,
      status: r.status || 'pending',
      date: r.date,
    }),
    reviews: (r) => ({
      id: r.id,
      storeId: r.store_id,
      userName: r.user_name,
      rating: Number(r.rating) || 5,
      comment: r.comment,
      date: r.date,
    }),
    banners: (r) => ({
      id: r.id,
      title: r.title,
      subtitle: r.subtitle,
      image: r.image,
      videoUrl: r.video_url,
      linkType: r.link_type || 'offer',
      linkValue: r.link_value,
      active: r.active !== false,
      position: r.position || 'hero',
      buttonText: r.button_text,
      buttonLink: r.button_link,
      isGlobal: r.is_global || false,
      forceAllStores: r.force_all_stores || false,
      storeId: r.store_id,
      order: r.sort_order || 0,
    }),
    coupons: (r) => ({
      id: r.id,
      storeId: r.store_id,
      code: r.code,
      discountType: r.discount_type || 'percent',
      value: Number(r.value) || 0,
      minOrderValue: Number(r.min_order_value) || 0,
      active: r.active !== false,
    }),
  };
  const mapper = mappers[table];
  return mapper ? mapper(row) : row;
}

// Maps camelCase app object → snake_case DB row
function mapAppToRow(table: string, obj: any): any {
  if (!obj) return obj;
  const mappers: Record<string, (o: any) => any> = {
    stores: (o) => ({
      id: o.id,
      name: o.name,
      logo: o.logo || '',
      cover: o.cover || '',
      category: o.category || '',
      business_type: o.businessType,
      phone_condition: o.phoneCondition,
      description: o.description || '',
      city: o.city || '',
      district: o.district || '',
      neighborhood: o.neighborhood || '',
      store_phone: o.storePhone,
      seo_description: o.seoDescription,
      seo_keywords: o.seoKeywords,
      slug: o.slug,
      country: o.country || '',
      rating: o.rating || 5,
      reviews_count: o.reviewsCount || 0,
      products_count: o.productsCount || 0,
      theme_color: o.themeColor,
      layout_type: o.layoutType || 'luxury',
      visual_template: o.visualTemplate || 'multicategory',
      banners: o.banners || [],
      categories: o.categories || [],
      featured: o.featured || false,
      status: o.status || 'active',
      owner_id: o.ownerId || '',
      commission_rate: o.commissionRate || 5,
      sales_count: o.salesCount || 0,
      repair_services: o.repairServices || [],
      features: o.features || [],
      sections_order: o.sectionsOrder || [],
      section_visibility: o.sectionVisibility || {},
      store_location: o.storeLocation || {},
      services_list: o.servicesList || [],
      font_family: o.fontFamily,
      border_radius: o.borderRadius,
      shadow_type: o.shadowType,
      currency: o.currency || 'ر.س',
      payment_gateways: o.paymentGateways || [],
      custom_checkout_fields: o.customCheckoutFields || [],
      epithet: o.epithet,
      template_config: o.templateConfig,
      updated_at: new Date().toISOString(),
    }),
    products: (o) => ({
      id: o.id,
      store_id: o.storeId,
      name: o.name,
      price: o.price || 0,
      original_price: o.originalPrice,
      image: o.image || '',
      images: o.images || [],
      category: o.category || '',
      description: o.description || '',
      rating: o.rating || 5,
      stock: o.stock || 0,
      sales_count: o.salesCount || 0,
      is_offer: o.isOffer || false,
      offer_text: o.offerText,
      featured: o.featured || false,
      condition: o.condition,
      warranty: o.warranty,
      specs: o.specs || {},
      brand: o.brand,
      device_model: o.deviceModel,
      updated_at: new Date().toISOString(),
    }),
    store_requests: (o) => ({
      id: o.id,
      merchant_name: o.merchantName,
      merchant_email: o.merchantEmail,
      merchant_password: o.merchantPassword,
      store_name: o.storeName,
      store_category: o.storeCategory || '',
      store_description: o.storeDescription,
      store_city: o.storeCity,
      store_district: o.storeDistrict,
      store_neighborhood: o.storeNeighborhood,
      store_phone: o.storePhone,
      store_logo: o.storeLogo,
      store_cover: o.storeCover,
      visual_template: o.visualTemplate,
      commission_rate: o.commissionRate || 3,
      status: o.status || 'pending',
      approved_at: o.approvedAt,
      store_id: o.storeId,
      merchant_user_id: o.merchantUserId,
    }),
    app_users: (o) => ({
      id: o.id,
      name: o.name,
      email: o.email,
      password: o.password,
      role: o.role || 'user',
      store_id: o.storeId,
      status: o.status || 'active',
      epithet: o.epithet,
      updated_at: new Date().toISOString(),
    }),
    orders: (o) => ({
      id: o.id,
      store_id: o.storeId,
      store_name: o.storeName,
      customer_name: o.customerName,
      customer_email: o.customerEmail,
      customer_phone: o.customerPhone,
      customer_address: o.customerAddress,
      items: o.items || [],
      total: o.total || 0,
      status: o.status || 'pending',
      date: o.date,
      updated_at: new Date().toISOString(),
    }),
    reviews: (o) => ({
      id: o.id,
      store_id: o.storeId,
      user_name: o.userName,
      rating: o.rating || 5,
      comment: o.comment,
      date: o.date,
      updated_at: new Date().toISOString(),
    }),
    banners: (o) => ({
      id: o.id,
      title: o.title,
      subtitle: o.subtitle,
      image: o.image || '',
      video_url: o.videoUrl,
      link_type: o.linkType || 'offer',
      link_value: o.linkValue,
      active: o.active !== false,
      position: o.position || 'hero',
      button_text: o.buttonText,
      button_link: o.buttonLink,
      is_global: o.isGlobal || false,
      force_all_stores: o.forceAllStores || false,
      store_id: o.storeId,
      sort_order: o.order || 0,
      updated_at: new Date().toISOString(),
    }),
    coupons: (o) => ({
      id: o.id,
      store_id: o.storeId,
      code: o.code,
      discount_type: o.discountType || 'percent',
      value: o.value || 0,
      min_order_value: o.minOrderValue || 0,
      active: o.active !== false,
      updated_at: new Date().toISOString(),
    }),
  };
  const mapper = mappers[table];
  return mapper ? mapper(obj) : obj;
}

export type ChangeHandler = (payload: {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  table: string;
  newRecord: any | null;
  oldRecord: any | null;
}) => void;

let initDone = false;

export const realtimeSync = {
  /**
   * Load all data from Supabase into localStorage cache.
   * Called once on app startup to hydrate the local cache.
   */
  async init(): Promise<void> {
    if (initDone) return;
    initDone = true;
    try {
      const tables = Object.keys(TABLE_KEYS);
      await Promise.all(tables.map(async (table) => {
        const { data, error } = await supabase.from(table).select('*');
        if (error) {
          console.warn(`[sync] Failed to load ${table}:`, error.message);
          return;
        }
        if (data && data.length > 0) {
          const mapped = data.map((row: any) => mapRowToApp(table, row));
          writeLocal(TABLE_KEYS[table], mapped);
        }
      }));
      // Dispatch a global refresh event
      Object.values(TABLE_KEYS).forEach(dispatchChange);
    } catch (err) {
      console.warn('[sync] Init failed, using localStorage cache:', err);
    }
  },

  /**
   * Subscribe to real-time changes on a table.
   * Returns an unsubscribe function.
   */
  subscribe(table: string, handler: ChangeHandler): () => void {
    const channelName = `mix-${table}-${Math.random().toString(36).slice(2, 8)}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table }, (payload: any) => {
        const newRecord = payload.new ? mapRowToApp(table, payload.new) : null;
        const oldRecord = payload.old ? mapRowToApp(table, payload.old) : null;
        handler({ eventType: payload.eventType, table, newRecord, oldRecord });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // ============ WRITE METHODS ============
  // Each write goes to Supabase first, then updates localStorage and dispatches change.

  async saveStore(store: any): Promise<void> {
    const row = mapAppToRow('stores', store);
    await supabase.from('stores').upsert(row).eq('id', store.id);
    const all = readLocal('mix_stores');
    const idx = all.findIndex((s: any) => s.id === store.id);
    if (idx >= 0) all[idx] = store; else all.push(store);
    writeLocal('mix_stores', all);
    dispatchChange('mix_stores');
  },

  async saveAllStores(stores: any[]): Promise<void> {
    const rows = stores.map((s) => mapAppToRow('stores', s));
    await supabase.from('stores').upsert(rows);
    writeLocal('mix_stores', stores);
    dispatchChange('mix_stores');
  },

  async deleteStore(storeId: string): Promise<void> {
    await supabase.from('stores').delete().eq('id', storeId);
    const all = readLocal('mix_stores').filter((s: any) => s.id !== storeId);
    writeLocal('mix_stores', all);
    dispatchChange('mix_stores');
  },

  async saveProduct(product: any): Promise<void> {
    const row = mapAppToRow('products', product);
    await supabase.from('products').upsert(row).eq('id', product.id);
    const all = readLocal('mix_products');
    const idx = all.findIndex((p: any) => p.id === product.id);
    if (idx >= 0) all[idx] = product; else all.unshift(product);
    writeLocal('mix_products', all);
    dispatchChange('mix_products');
  },

  async saveAllProducts(products: any[]): Promise<void> {
    const rows = products.map((p) => mapAppToRow('products', p));
    await supabase.from('products').upsert(rows);
    writeLocal('mix_products', products);
    dispatchChange('mix_products');
  },

  async deleteProduct(productId: string): Promise<void> {
    await supabase.from('products').delete().eq('id', productId);
    const all = readLocal('mix_products').filter((p: any) => p.id !== productId);
    writeLocal('mix_products', all);
    dispatchChange('mix_products');
  },

  async saveOrder(order: any): Promise<void> {
    const row = mapAppToRow('orders', order);
    await supabase.from('orders').upsert(row).eq('id', order.id);
    const all = readLocal('mix_orders');
    const idx = all.findIndex((o: any) => o.id === order.id);
    if (idx >= 0) all[idx] = order; else all.unshift(order);
    writeLocal('mix_orders', all);
    dispatchChange('mix_orders');
  },

  async saveBanner(banner: any): Promise<void> {
    const row = mapAppToRow('banners', banner);
    await supabase.from('banners').upsert(row).eq('id', banner.id);
    const all = readLocal('mix_banners');
    const idx = all.findIndex((b: any) => b.id === banner.id);
    if (idx >= 0) all[idx] = banner; else all.push(banner);
    writeLocal('mix_banners', all);
    dispatchChange('mix_banners');
  },

  async saveAllBanners(banners: any[]): Promise<void> {
    const rows = banners.map((b) => mapAppToRow('banners', b));
    await supabase.from('banners').upsert(rows);
    writeLocal('mix_banners', banners);
    dispatchChange('mix_banners');
  },

  async saveReview(review: any): Promise<void> {
    const row = mapAppToRow('reviews', review);
    await supabase.from('reviews').upsert(row).eq('id', review.id);
    const all = readLocal('mix_reviews');
    const idx = all.findIndex((r: any) => r.id === review.id);
    if (idx >= 0) all[idx] = review; else all.unshift(review);
    writeLocal('mix_reviews', all);
    dispatchChange('mix_reviews');
  },

  async saveCoupon(coupon: any): Promise<void> {
    const row = mapAppToRow('coupons', coupon);
    await supabase.from('coupons').upsert(row).eq('id', coupon.id);
    const all = readLocal('mix_coupons');
    const idx = all.findIndex((c: any) => c.id === coupon.id);
    if (idx >= 0) all[idx] = coupon; else all.push(coupon);
    writeLocal('mix_coupons', all);
    dispatchChange('mix_coupons');
  },

  async saveUser(user: any): Promise<void> {
    const row = mapAppToRow('app_users', user);
    await supabase.from('app_users').upsert(row).eq('id', user.id);
    const all = readLocal('mix_users');
    const idx = all.findIndex((u: any) => u.id === user.id || u.email === user.email);
    if (idx >= 0) all[idx] = user; else all.push(user);
    writeLocal('mix_users', all);
    dispatchChange('mix_users');
  },

  async saveStoreRequest(req: any): Promise<void> {
    const row = mapAppToRow('store_requests', req);
    await supabase.from('store_requests').upsert(row).eq('id', req.id);
    const all = readLocal('mix_store_requests');
    const idx = all.findIndex((r: any) => r.id === req.id);
    if (idx >= 0) all[idx] = req; else all.push(req);
    writeLocal('mix_store_requests', all);
    dispatchChange('mix_store_requests');
  },

  async updateStoreRequest(id: string, updates: any): Promise<void> {
    const row = mapAppToRow('store_requests', updates);
    // Remove undefined fields
    Object.keys(row).forEach((k) => row[k] === undefined && delete row[k]);
    await supabase.from('store_requests').update(row).eq('id', id);
    const all = readLocal('mix_store_requests');
    const idx = all.findIndex((r: any) => r.id === id);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...updates };
      writeLocal('mix_store_requests', all);
      dispatchChange('mix_store_requests');
    }
  },

  async savePlatformSettings(settings: any): Promise<void> {
    try {
      localStorage.setItem('mix_platform_settings', JSON.stringify(settings));
    } catch {}
    dispatchChange('mix_platform_settings');
  },

  async savePlatformName(name: string): Promise<void> {
    try {
      localStorage.setItem('mix_platform_name', name);
    } catch {}
    dispatchChange('mix_platform_name');
  },

  async resetAll(): Promise<void> {
    const tables = Object.keys(TABLE_KEYS);
    await Promise.all(tables.map((t) => supabase.from(t).delete().neq('id', '___never___')));
    Object.values(TABLE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
      dispatchChange(key);
    });
  },

  destroy(): void {
    // No-op: channels are managed by individual component subscriptions
  },
};

// Backward-compatible export matching the old fbSync interface
export const fbSync = realtimeSync;
export function saveLocal(key: string, data: any): void {
  writeLocal(key, data);
  dispatchChange(key);
}
