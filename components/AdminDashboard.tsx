import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Users, Store, TrendingUp, FileSliders as Sliders, Settings, LogOut, Plus, Trash2, CreditCard as Edit3, Check, X, Save, Palette, Layers, Info, Eye, FileText, CheckCircle2 as CheckCircle, AlertTriangle, PlayCircle, Percent, ShoppingBag, Grid2x2 as Grid, MapPin, Truck, ShieldAlert, Key, Globe, Search, RefreshCw, Bell, Circle as HelpCircle, ArrowUpRight, BarChart3, Activity, ListOrdered, Sparkles, Wrench, CreditCard } from 'lucide-react';
import { Store as StoreType, Product, Order, MIXBanner, User, Coupon, StoreTemplateConfig } from '../types';
import { DEFAULT_PHONE_REPAIR_TEMPLATE, DEFAULT_STORE_TEMPLATES } from '../data/mockData';
import { logSystemActivity, compressBase64 } from '../lib/firebase';
import { fbSync } from '../lib/firebaseSync';
import JSZip from 'jszip';
import { 
  INITIAL_STORES, INITIAL_PRODUCTS, INITIAL_BANNERS, INITIAL_COUPONS, 
  INITIAL_REVIEWS, INITIAL_ORDERS, INITIAL_CATEGORIES 
} from '../data/mockData';

interface AdminDashboardProps {
  onLogout: () => void;
  onEnterStoreDashboard: (storeId: string) => void;
  onViewStore?: (storeId: string) => void;
  onMerchantApproved?: (merchant: any) => void;
}

export default function AdminDashboard({ onLogout, onEnterStoreDashboard, onViewStore, onMerchantApproved }: AdminDashboardProps) {
  // 20 Tab States
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Local states
  const [stores, setStores] = useState<StoreType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [banners, setBanners] = useState<MIXBanner[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  // Store Templates state (uploaded via ZIP)
  const [templates, setTemplates] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('mix_templates') || '[]'); } catch { return []; }
  });
  const [isUploadingTemplate, setIsUploadingTemplate] = useState(false);
  const [templateApplyStore, setTemplateApplyStore] = useState('');
  const [templateApplyId, setTemplateApplyId] = useState('');

  // Banners form state
  const [bTitle, setBTitle] = useState('');
  const [bSub, setBSub] = useState('');
  const [bImage, setBImage] = useState('');
  const [bVideoUrl, setBVideoUrl] = useState('');
  const [bType, setBType] = useState<'store' | 'category' | 'offer'>('store');
  const [bValue, setBValue] = useState('');
  const [isAddingBanner, setIsAddingBanner] = useState(false);

  // General state
  const [defaultCommRate, setDefaultCommRate] = useState(5);
  const [platformName, setPlatformName] = useState('MIX - منصة المتاجر الموحدة');
  const [platformCurrency, setPlatformCurrency] = useState('ج.م');
  const [platformLanguage, setPlatformLanguage] = useState('ar');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Store Management Modal State
  const [mgmtStoreId, setMgmtStoreId] = useState<string | null>(null);
  const [mgmtTab, setMgmtTab] = useState<'info' | 'products' | 'banners' | 'about'>('info');
  const [mgmtName, setMgmtName] = useState('');
  const [mgmtDesc, setMgmtDesc] = useState('');
  const [mgmtCategory, setMgmtCategory] = useState('');
  const [mgmtCity, setMgmtCity] = useState('');
  const [mgmtLogo, setMgmtLogo] = useState('');
  const [mgmtCover, setMgmtCover] = useState('');
  const [mgmtPhone, setMgmtPhone] = useState('');
  const [mgmtDistrict, setMgmtDistrict] = useState('');
  const [mgmtNeighborhood, setMgmtNeighborhood] = useState('');
  const [mgmtMaintenance, setMgmtMaintenance] = useState(false);
  const [mgmtBannerTitle, setMgmtBannerTitle] = useState('');
  const [mgmtBannerSub, setMgmtBannerSub] = useState('');
  const [mgmtBannerImage, setMgmtBannerImage] = useState('');
  const [mgmtBannerVideo, setMgmtBannerVideo] = useState('');

  // Payment Methods state
  const [paymentMethods, setPaymentMethods] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('mix_payment_methods') || '[]'); } catch { return []; }
  });
  const [pmName, setPmName] = useState('');
  const [pmNumber, setPmNumber] = useState('');
  const [pmImage, setPmImage] = useState('');
  const [pmType, setPmType] = useState<'vodafone' | 'instapay' | 'bank' | 'other'>('vodafone');
  const [pmBankName, setPmBankName] = useState('');
  const [pmHolderName, setPmHolderName] = useState('');

  // Computed modal data
  const mgmtStore = mgmtStoreId ? stores.find(s => s.id === mgmtStoreId) || null : null;
  const mgmtProducts = mgmtStoreId ? products.filter(p => p.storeId === mgmtStoreId) : [];
  const mgmtOrders = mgmtStoreId ? orders.filter(o => o.storeId === mgmtStoreId) : [];

  // Categories state
  const [categories, setCategories] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('mix_categories') || JSON.stringify(INITIAL_CATEGORIES)); } catch { return INITIAL_CATEGORIES; }
  });
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('');

  // Search Engine config states
  const [synonyms, setSynonyms] = useState('عود = بخور, عطور = فرنسي, هاتف = جوال');
  const [boostCategory, setBoostCategory] = useState('عطور وبخور فاخر');

  // Ad campaign state
  const [ads, setAds] = useState<any[]>([
    { id: 'ad-1', title: 'إعلان قصر العود الممول', storeId: 'store-5', clicks: 231, views: 1402, status: 'active', placement: 'home_top' },
    { id: 'ad-2', title: 'إعلان تيك ستور الحصري', storeId: 'store-1', clicks: 92, views: 504, status: 'active', placement: 'sidebar' }
  ]);
  const [adTitle, setAdTitle] = useState('');
  const [adStore, setAdStore] = useState('');
  const [adPlacement, setAdPlacement] = useState('home_top');

  // Notifications State
  const [notifications, setNotifications] = useState<any[]>([
    { id: 'not-1', title: 'مرحبا بكم في السنتر الفخم MIX', body: 'اكتشف أرقى العروض الفاخرة المجمعة اليوم.', recipient: 'all', time: 'منذ ساعتين' }
  ]);
  const [notTitle, setNotTitle] = useState('');
  const [notBody, setNotBody] = useState('');
  const [notRecipient, setNotRecipient] = useState('all');

  // Brand Design Customization States
  const [brandColor, setBrandColor] = useState('#D4AF37');
  const [secondaryColor, setBrandSecondary] = useState('#111111');
  const [platformLogo, setPlatformLogo] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&h=200&fit=crop');

  // ========== COMPREHENSIVE PLATFORM SETTINGS ==========
  const [siteTitle, setSiteTitle] = useState('MIX - السوق المتحد للمنتجات الفاخرة');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [siteDescription, setSiteDescription] = useState('MIX - المنصة الموحدة للتسوق الفاخر والمتاجر المستقلة');
  const [metaKeywords, setMetaKeywords] = useState('تسوق, متجر, السعودية, عطور, ذهب');

  // Colors
  const [platformSecondaryColor, setPlatformSecondaryColor] = useState('#111111');
  const [platformBackgroundColor, setPlatformBackgroundColor] = useState('#000000');
  const [platformFrameColor, setPlatformFrameColor] = useState('#1a1a1a');
  const [platformTextColor, setPlatformTextColor] = useState('#a1a1aa');

  // Custom Code Injection
  const [customCSS, setCustomCSS] = useState('/* ضع كود CSS المخصص هنا */');
  const [customHeaderHTML, setCustomHeaderHTML] = useState('<!-- كود إضافي قبل إغلاق </head> -->');
  const [customFooterHTML, setCustomFooterHTML] = useState('<!-- كود إضافي قبل إغلاق </body> -->');
  const [animatedBackgroundCSS, setAnimatedBackgroundCSS] = useState('/* كود الخلفية المتحركة */');

  // Navigation Links
  const [navLinks, setNavLinks] = useState<{ label: string; url: string; order: number }[]>([
    { label: 'الرئيسية', url: '/', order: 1 },
    { label: 'المتاجر', url: '/stores', order: 2 },
    { label: 'العروض', url: '/offers', order: 3 },
    { label: 'اتصل بنا', url: '/contact', order: 4 },
  ]);
  const [footerLinks, setFooterLinks] = useState<{ label: string; url: string; order: number }[]>([
    { label: 'سياسة الخصوصية', url: '/privacy', order: 1 },
    { label: 'الشروط والأحكام', url: '/terms', order: 2 },
    { label: 'الشحن والاسترجاع', url: '/shipping', order: 3 },
  ]);
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string; icon: string }[]>([
    { platform: 'تويتر', url: 'https://x.com/mix', icon: '𝕏' },
    { platform: 'انستغرام', url: 'https://instagram.com/mix', icon: '📷' },
    { platform: 'واتساب', url: 'https://wa.me/966500000000', icon: '💬' },
  ]);
  const [footerText, setFooterText] = useState('© 2026 MIX - جميع الحقوق محفوظة');

  // Platform Content
  const [aboutText, setAboutText] = useState('MIX هي المنصة الموحدة الأولى من نوعها في المملكة العربية السعودية، تجمع أرقى المتاجر والعلامات المستقلة في مكان واحد.');
  const [contactEmail, setContactEmail] = useState('info@mix.com');
  const [contactPhone, setContactPhone] = useState('+966 50 000 0000');
  const [contactAddress, setContactAddress] = useState('الرياض، المملكة العربية السعودية');

  // Shipping configuration
  const [shippingCompanies, setShippingCompanies] = useState<any[]>([
    { id: 'ship-1', name: 'أرامكس (Aramex)', price: 25, deliveryTime: '2-4 أيام', active: true },
    { id: 'ship-2', name: 'سمسا (SMSA Express)', price: 30, deliveryTime: '1-3 أيام', active: true },
    { id: 'ship-3', name: 'دي إتش إل (DHL Domestic)', price: 50, deliveryTime: '24 ساعة', active: false }
  ]);

  // Roles & Permissions state
  const [roles, setRoles] = useState<any[]>([
    { id: 'role-1', name: 'مدير عام المنصة (أبو فرج)', key: 'admin', permissions: ['all'] },
    { id: 'role-2', name: 'محرر محتوى وعروض', key: 'moderator', permissions: ['products', 'banners'] },
    { id: 'role-3', name: 'دعم فني ومحاسبة', key: 'support', permissions: ['orders', 'users'] }
  ]);

  // API management state
  const [apiKeys, setApiKeys] = useState<any[]>([
    { id: 'key-1', label: 'بوابة الدفع - ميسر (MyFatoorah)', key: 'sk_live_90823x98a7dy983u', active: true },
    { id: 'key-2', label: 'بوابة رسائل الجوال - تواصل (SmsGateway)', key: 'api_sms_tawasol_87a32', active: true }
  ]);

  // Store requests state for auto-sync
  const [pendingStoreRequests, setPendingStoreRequests] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('mix_store_requests') || '[]').filter((r: any) => r.status === 'pending'); }
    catch { return []; }
  });

  // Store Templates state
  const [storeTemplates, setStoreTemplates] = useState<any[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('mix_store_templates') || '[]');
      return saved.length > 0 ? saved : DEFAULT_STORE_TEMPLATES;
    } catch { return DEFAULT_STORE_TEMPLATES; }
  });
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [editTemplateTab, setEditTemplateTab] = useState<'colors' | 'fonts' | 'animations' | 'layout' | 'branding' | 'services' | 'features'>('colors');

  // Listen for store request updates (same tab via custom event + cross-tab via storage/realtime event)
  useEffect(() => {
    const refreshRequests = () => {
      try {
        const all = JSON.parse(localStorage.getItem('mix_store_requests') || '[]');
        setPendingStoreRequests(all.filter((r: any) => r.status === 'pending'));
      } catch {}
    };
    refreshRequests();
    window.addEventListener('store-request-update', refreshRequests);
    window.addEventListener('local-storage-change', refreshRequests);
    window.addEventListener('storage', refreshRequests);
    window.addEventListener('mix-realtime-mix_store_requests', refreshRequests);
    const interval = setInterval(refreshRequests, 1000);
    return () => {
      window.removeEventListener('store-request-update', refreshRequests);
      window.removeEventListener('local-storage-change', refreshRequests);
      window.removeEventListener('storage', refreshRequests);
      window.removeEventListener('mix-realtime-mix_store_requests', refreshRequests);
      clearInterval(interval);
    };
  }, []);

  // Load state on start + polling every 1 second
  useEffect(() => {
    const loadData = () => {
      const s = JSON.parse(localStorage.getItem('mix_stores') || '[]');
      const p = JSON.parse(localStorage.getItem('mix_products') || '[]');
      const o = JSON.parse(localStorage.getItem('mix_orders') || '[]');
      const b = JSON.parse(localStorage.getItem('mix_banners') || '[]');
      const l = JSON.parse(localStorage.getItem('mix_activity_logs') || '[]');
      
      setStores(s);
      setProducts(p);
      setOrders(o);
      setBanners(b);
      setActivityLogs(l);
    };

    loadData();

    // Fast Polling every 1 second for new orders/products/banners/stores/requests
    const interval = setInterval(loadData, 1000);

    // Also listen for events
    const handler = () => loadData();
    window.addEventListener('local-storage-change', handler);
    window.addEventListener('storage', handler);
    window.addEventListener('mix-realtime-mix_orders', handler);
    window.addEventListener('mix-realtime-mix_products', handler);
    window.addEventListener('mix-realtime-mix_stores', handler);
    window.addEventListener('mix-realtime-mix_banners', handler);
    window.addEventListener('mix-realtime-mix_store_requests', handler);
    window.addEventListener('mix-realtime-mix_users', handler);

    return () => {
      clearInterval(interval);
      window.removeEventListener('local-storage-change', handler);
      window.removeEventListener('storage', handler);
      window.removeEventListener('mix-realtime-mix_orders', handler);
      window.removeEventListener('mix-realtime-mix_products', handler);
      window.removeEventListener('mix-realtime-mix_stores', handler);
    };
  }, []);

  const syncAndReload = (updatedStores: StoreType[], updatedProducts: Product[], updatedOrders: Order[], updatedBanners: MIXBanner[]) => {
    // Save to localStorage & broadcast via BroadcastChannel + events (for instant UI across all tabs)
    saveLocal('mix_stores', updatedStores);
    saveLocal('mix_products', updatedProducts);
    saveLocal('mix_orders', updatedOrders);
    saveLocal('mix_banners', updatedBanners);

    // Save to Firestore (real-time sync across devices)
    fbSync.saveAllStores(updatedStores).catch(console.error);
    fbSync.saveAllProducts(updatedProducts).catch(console.error);
    fbSync.saveAllBanners(updatedBanners).catch(console.error);

    // Update local state
    setStores(updatedStores);
    setProducts(updatedProducts);
    setOrders(updatedOrders);
    setBanners(updatedBanners);
  };

  // Helper to log platform activity and sync immediately
  const logAndNotify = async (action: string, details: string) => {
    await logSystemActivity(action, details);
    const updatedLogs = JSON.parse(localStorage.getItem('mix_activity_logs') || '[]');
    setActivityLogs(updatedLogs);
  };

  // Quick statistics
  const totalStores = stores.length;
  const activeStores = stores.filter(s => s.status === 'active').length;
  const totalProductsCount = products.length;
  const totalSales = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0);
  const totalCommission = orders.filter(o => o.status === 'delivered').reduce((sum, o) => {
    const s = stores.find(x => x.id === o.storeId);
    const rate = s ? s.commissionRate : defaultCommRate;
    return sum + (o.total * rate) / 100;
  }, 0);

  // Store Management
  const handleToggleStoreStatus = async (id: string) => {
    const targetStore = stores.find(s => s.id === id);
    if (!targetStore) return;
    const newStatus = targetStore.status === 'active' ? 'suspended' : 'active';
    const updated = stores.map(s => s.id === id ? { ...s, status: newStatus } : s);
    syncAndReload(updated, products, orders, banners);
    await logAndNotify(`تغيير حالة المتجر`, `تم تعديل حالة المتجر ${targetStore.name} إلى ${newStatus === 'active' ? 'نشط' : 'موقوف'}`);
  };

  const handleDeleteStore = async (id: string) => {
    const targetStore = stores.find(s => s.id === id);
    if (!targetStore) return;
    if (confirm(`⚠️ تنبيه شديد الخطورة: هل أنت متأكد من رغبتك في حذف متجر "${targetStore.name}" نهائياً من السنتر؟`)) {
      const updatedStores = stores.filter(s => s.id !== id);
      const updatedProducts = products.filter(p => p.storeId !== id);
      const updatedOrders = orders.filter(o => o.storeId !== id);
      syncAndReload(updatedStores, updatedProducts, updatedOrders, banners);
      await logAndNotify('حذف متجر بالكامل', `تم حذف متجر ${targetStore.name} وجميع المنتجات المرتبطة به`);
    }
  };

  // Open Store Management Modal
  const openStoreManager = (id: string) => {
    const s = stores.find(x => x.id === id);
    if (!s) return;
    setMgmtStoreId(id);
    setMgmtTab('info');
    setMgmtName(s.name);
    setMgmtDesc(s.description || '');
    setMgmtCategory(s.category || '');
    setMgmtCity(s.city || '');
    setMgmtLogo(s.logo || '');
    setMgmtCover(s.cover || '');
    setMgmtPhone((s as any).storePhone || '');
    setMgmtDistrict((s as any).district || '');
    setMgmtNeighborhood((s as any).neighborhood || '');
    setMgmtMaintenance((s as any).maintenanceMode || false);
  };

  // Save Store Info from modal
  const handleSaveStoreInfo = async () => {
    if (!mgmtStoreId) return;
    const updated = stores.map(s => s.id === mgmtStoreId ? {
      ...s,
      name: mgmtName,
      description: mgmtDesc,
      category: mgmtCategory,
      city: mgmtCity,
      logo: mgmtLogo,
      cover: mgmtCover,
      storePhone: mgmtPhone,
      district: mgmtDistrict,
      neighborhood: mgmtNeighborhood,
      maintenanceMode: mgmtMaintenance,
    } : s);
    syncAndReload(updated, products, orders, banners);
    await logAndNotify('تعديل بيانات متجر', `تم تعديل بيانات متجر ${mgmtName}`);
    alert('تم حفظ تعديلات المتجر بنجاح!');
  };

  // Delete Product from modal
  const handleDeleteProductFromModal = async (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    if (!confirm(`هل أنت متأكد من حذف منتج "${prod.name}"؟`)) return;
    const updated = products.filter(p => p.id !== productId);
    syncAndReload(stores, updated, orders, banners);
    await logAndNotify('حذف منتج', `تم حذف منتج ${prod.name}`);
  };

  // Toggle maintenance for a store
  const handleToggleStoreMaintenance = async (id: string) => {
    const s = stores.find(x => x.id === id);
    if (!s) return;
    const newMode = !(s as any).maintenanceMode;
    const updated = stores.map(x => x.id === id ? { ...x, maintenanceMode: newMode } : x);
    syncAndReload(updated, products, orders, banners);
    setMgmtMaintenance(newMode);
    await logAndNotify('تبديل وضع الصيانة', `تم ${newMode ? 'تفعيل' : 'إيقاف'} وضع الصيانة لمتجر ${s.name}`);
  };

  // Commission Control
  const handleUpdateStoreCommission = async (id: string, rate: number) => {
    const updated = stores.map(s => s.id === id ? { ...s, commissionRate: rate } : s);
    syncAndReload(updated, products, orders, banners);
    const sName = stores.find(s => s.id === id)?.name || '';
    await logAndNotify('تحديث عمولة متجر', `تم تحديث عمولة متجر ${sName} إلى %${rate}`);
    alert('تم تحديث نسبة عمولة المتجر وحفظها بنجاح!');
  };

  // General Banner Submit
  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bTitle || !bImage) {
      alert('يرجى إدخال عنوان البنر ورفع صورة للبنر.');
      return;
    }

    const newBanner: MIXBanner = {
      id: `mb-${Date.now()}`,
      title: bTitle,
      subtitle: bSub,
      image: bImage,
      videoUrl: bVideoUrl || undefined,
      linkType: bType,
      linkValue: bValue || 'all',
      active: true
    };

    try {
      const updated = [...banners, newBanner];
      syncAndReload(stores, products, orders, updated);
      setIsAddingBanner(false);
      setBTitle('');
      setBSub('');
      setBImage('');
      setBVideoUrl('');
      setBValue('');
      await logAndNotify('إضافة بنر إعلاني', `تم إضافة بنر ترويجي رئيسي جديد بعنوان: ${bTitle}`);
      alert('تم إضافة البنر بنجاح! 🎉');
    } catch (err) {
      console.error('Banner submit error:', err);
      alert('حدث خطأ أثناء إضافة البنر. تأكد من حجم الصورة/الفيديو.');
    }
  };

  const handleToggleBanner = async (id: string) => {
    const updated = banners.map(b => b.id === id ? { ...b, active: !b.active } : b);
    syncAndReload(stores, products, orders, updated);
    const bTitle = banners.find(b => b.id === id)?.title || '';
    await logAndNotify('تعديل بنر', `تم تبديل حالة عرض البنر: ${bTitle}`);
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا البنر؟')) return;
    const bTitle = banners.find(b => b.id === id)?.title || '';
    const updated = banners.filter(b => b.id !== id);
    syncAndReload(stores, products, orders, updated);
    await logAndNotify('حذف بنر', `تم إزالة البنر الإعلاني: ${bTitle}`);
  };

  // Orders Status Control
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: any) => {
    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: nextStatus } : o);
    syncAndReload(stores, products, updatedOrders, banners);
    await logAndNotify('تعديل حالة طلب', `تم تعديل حالة طلب الشراء رقم #${orderId} إلى: ${nextStatus}`);
  };

  // Products Control
  const handleDeleteProduct = async (prodId: string) => {
    const pName = products.find(p => p.id === prodId)?.name || '';
    if (confirm(`هل ترغب بحذف المنتج "${pName}" من السنتر؟`)) {
      const updatedProducts = products.filter(p => p.id !== prodId);
      syncAndReload(stores, updatedProducts, orders, banners);
      await logAndNotify('رقابة وحذف منتج', `تم حذف منتج مخالف: ${pName}`);
    }
  };

  // Ads Campaign Management
  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adTitle || !adStore) return;
    const newAd = {
      id: `ad-${Date.now()}`,
      title: adTitle,
      storeId: adStore,
      clicks: 0,
      views: 0,
      status: 'active',
      placement: adPlacement
    };
    setAds([newAd, ...ads]);
    setAdTitle('');
    await logAndNotify('حملة إعلانية ممولة', `تم إطلاق حملة ترويجية جديدة ممولة: ${adTitle}`);
  };

  // Notifications Dispatcher
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notTitle || !notBody) return;
    const newNot = {
      id: `not-${Date.now()}`,
      title: notTitle,
      body: notBody,
      recipient: notRecipient,
      time: 'الآن'
    };
    setNotifications([newNot, ...notifications]);
    setNotTitle('');
    setNotBody('');
    await logAndNotify('بث إشعار عام', `تم بث إشعار موجه إلى (${notRecipient}) بعنوان: ${notTitle}`);
    alert('🚀 تم بث وإرسال الإشعار لجميع الفئات المستهدفة فوراً!');
  };

  // Save Settings (General + Comprehensive Platform Settings)
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('mix_default_commission', defaultCommRate.toString());
    localStorage.setItem('mix_platform_name', platformName);

    // Save comprehensive platform settings
    const platformSettings = {
      siteTitle, faviconUrl, siteDescription, metaKeywords,
      platformSecondaryColor, platformBackgroundColor, platformFrameColor, platformTextColor,
      customCSS, customHeaderHTML, customFooterHTML, animatedBackgroundCSS,
      navLinks, footerLinks, socialLinks, footerText,
      aboutText, contactEmail, contactPhone, contactAddress,
      platformLogo, brandColor
    };
    localStorage.setItem('mix_platform_settings', JSON.stringify(platformSettings));

    // Save to Firestore (real-time sync)
    fbSync.savePlatformSettings(platformSettings).catch(console.error);
    fbSync.savePlatformName(platformName).catch(console.error);

    // Apply site title to browser tab
    document.title = siteTitle;

    // Notify platform to refresh
    window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_platform_settings' } }));
    window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_platform_name' } }));

    await logAndNotify('ضبط إعدادات المنصة', `تم تعديل إعدادات المنصة: الاسم="${platformName}"، التايتل="${siteTitle}"`);
    alert('تم حفظ جميع إعدادات النظام والهوية والكود المخصص للمنصة بنجاح! 🎨');
  };

  const handleResetDatabase = async () => {
    if (!window.confirm('هل أنت متأكد من رغبتك في إعادة ضبط قاعدة بيانات المنصة بالكامل إلى القيم والمنتجات الافتراضية؟ سيتم حذف جميع التعديلات الحالية والمزامنة فورياً مع Firestore.')) {
      return;
    }
    
    try {
      localStorage.setItem('mix_stores', JSON.stringify(INITIAL_STORES));
      localStorage.setItem('mix_products', JSON.stringify(INITIAL_PRODUCTS));
      localStorage.setItem('mix_banners', JSON.stringify(INITIAL_BANNERS));
      localStorage.setItem('mix_coupons', JSON.stringify(INITIAL_COUPONS));
      localStorage.setItem('mix_reviews', JSON.stringify(INITIAL_REVIEWS));
      localStorage.setItem('mix_orders', JSON.stringify(INITIAL_ORDERS));
      localStorage.setItem('mix_categories', JSON.stringify(INITIAL_CATEGORIES));
      
      // Reset Firestore
      await fbSync.resetAll({
        stores: INITIAL_STORES,
        products: INITIAL_PRODUCTS,
        banners: INITIAL_BANNERS,
        coupons: INITIAL_COUPONS,
        reviews: INITIAL_REVIEWS,
        orders: INITIAL_ORDERS,
        categories: INITIAL_CATEGORIES,
      }).catch(console.error);

      setStores(INITIAL_STORES);
      setProducts(INITIAL_PRODUCTS);
      setOrders(INITIAL_ORDERS);
      setBanners(INITIAL_BANNERS);
      
      await logAndNotify('إعادة ضبط المصنع للبيانات', 'تم استعادة كافة البيانات والمنتجات الافتراضية للمنصة والمزامنة فورياً سحابياً مع Firestore');
      alert('تمت إعادة ضبط قاعدة البيانات وتحديثها فورياً على كامل السحابة بنجاح! ⚡');
    } catch (err: any) {
      console.error(err);
      alert('فشل إعادة ضبط قاعدة البيانات: ' + err.message);
    }
  };

  // Toggle shipping activation
  const handleToggleShipping = async (id: string) => {
    const updated = shippingCompanies.map(sc => sc.id === id ? { ...sc, active: !sc.active } : sc);
    setShippingCompanies(updated);
    const sName = shippingCompanies.find(sc => sc.id === id)?.name || '';
    await logAndNotify('تحديث شركات الشحن', `تم تعديل حالة شركة الشحن: ${sName}`);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row text-right font-sans" dir="rtl">
      
      {/* 20 SECTION SIDEBAR */}
      <div className="w-full md:w-80 bg-[#090909] md:min-h-screen border-b md:border-b-0 md:border-l border-white/5 p-6 flex flex-col justify-between shrink-0 overflow-y-auto max-h-screen">
        <div className="space-y-6">
          <div className="flex items-center gap-3 bg-gradient-to-l from-yellow-600/30 to-amber-500/10 p-4 border border-[#D4AF37]/30 rounded-sm">
            <Shield className="w-6 h-6 text-[#D4AF37] animate-pulse" />
            <div>
              <h3 className="text-sm font-black tracking-widest text-[#D4AF37]">MIX SUPER PANEL</h3>
              <p className="text-[9px] font-black uppercase text-white/50">لوحة تحكم المنصة الشاملة بدون كود 🛡️</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Group 1: الرئيسية والتحليلات */}
            <div>
              <span className="text-[9px] font-black text-[#D4AF37] tracking-widest uppercase block mb-2 border-b border-white/5 pb-1">📊 الرئيسية والمؤشرات</span>
              <div className="space-y-1">
                {[
                  { id: 'dashboard', label: '1. لوحة القيادة العامة', icon: TrendingUp },
                  { id: 'analytics', label: '15. التقارير والتحليلات', icon: BarChart3 },
                  { id: 'logs', label: '18. سجل العمليات والأمان', icon: Activity },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold rounded transition-all cursor-pointer ${
                        activeTab === item.id 
                          ? 'bg-[#D4AF37] text-black font-extrabold shadow-[0_0_10px_rgba(212,175,55,0.25)]' 
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon size={12} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Group 2: المتاجر والشركاء */}
            <div>
              <span className="text-[9px] font-black text-[#D4AF37] tracking-widest uppercase block mb-2 border-b border-white/5 pb-1">🏪 المتاجر والشركاء</span>
              <div className="space-y-1">
                {[
                  { id: 'stores', label: '2. إدارة جميع المتاجر', icon: Store, count: stores.length },
                  { id: 'store-requests', label: 'طلبات المتاجر الجديدة', icon: FileText, count: pendingStoreRequests.length },
                  { id: 'commission', label: '8. التحكم بنسب العمولات', icon: Percent },
                  { id: 'store-editor', label: '12. باني صفحات الفروع', icon: Grid },
                  { id: 'templates', label: '13. قوالب المتاجر (ZIP)', icon: Layers, count: templates.length },
                  { id: 'template-settings', label: 'قوالب المتاجر القابلة للتعديل', icon: Palette, count: storeTemplates.length },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold rounded transition-all cursor-pointer ${
                        activeTab === item.id 
                          ? 'bg-[#D4AF37] text-black font-extrabold shadow-[0_0_10px_rgba(212,175,55,0.25)]' 
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={12} />
                        <span>{item.label}</span>
                      </div>
                      {item.count ? (
                        <span className={`text-[8px] font-black py-0.5 px-1.5 rounded-full ${activeTab === item.id ? 'bg-black text-white' : 'bg-white/10 text-white'}`}>
                          {item.count}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Group 3: المنتجات والكتالوج */}
            <div>
              <span className="text-[9px] font-black text-[#D4AF37] tracking-widest uppercase block mb-2 border-b border-white/5 pb-1">🛍️ المنتجات والأقسام</span>
              <div className="space-y-1">
                {[
                  { id: 'products', label: '4. رقابة جميع المنتجات', icon: ShoppingBag, count: products.length },
                  { id: 'categories', label: '5. الأقسام العامة للسنتر', icon: Layers },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold rounded transition-all cursor-pointer ${
                        activeTab === item.id 
                          ? 'bg-[#D4AF37] text-black font-extrabold shadow-[0_0_10px_rgba(212,175,55,0.25)]' 
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={12} />
                        <span>{item.label}</span>
                      </div>
                      {item.count ? (
                        <span className={`text-[8px] font-black py-0.5 px-1.5 rounded-full ${activeTab === item.id ? 'bg-black text-white' : 'bg-white/10 text-white'}`}>
                          {item.count}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Group 4: المبيعات والتوصيل */}
            <div>
              <span className="text-[9px] font-black text-[#D4AF37] tracking-widest uppercase block mb-2 border-b border-white/5 pb-1">📦 المبيعات والتوصيل</span>
              <div className="space-y-1">
                {[
                  { id: 'orders', label: '6. متابعة الطلبات الموحدة', icon: ListOrdered, count: orders.length },
                  { id: 'payments', label: '7. الدفع والاشتراكات', icon: Info },
                  { id: 'payment-methods', label: 'طرق الدفع للمستخدمين', icon: CreditCard },
                  { id: 'shipping', label: '16. شركات ومناطق الشحن', icon: Truck },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold rounded transition-all cursor-pointer ${
                        activeTab === item.id 
                          ? 'bg-[#D4AF37] text-black font-extrabold shadow-[0_0_10px_rgba(212,175,55,0.25)]' 
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={12} />
                        <span>{item.label}</span>
                      </div>
                      {item.count ? (
                        <span className={`text-[8px] font-black py-0.5 px-1.5 rounded-full ${activeTab === item.id ? 'bg-black text-white' : 'bg-white/10 text-white'}`}>
                          {item.count}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Group 5: التسويق والإعلانات */}
            <div>
              <span className="text-[9px] font-black text-[#D4AF37] tracking-widest uppercase block mb-2 border-b border-white/5 pb-1">📢 التسويق والإعلانات</span>
              <div className="space-y-1">
                {[
                  { id: 'banners', label: '9. إعلانات البنرات العامة', icon: Sliders },
                  { id: 'ads', label: '10. الحملات الإعلانية', icon: PlayCircle },
                  { id: 'notifications', label: '14. نظام البث والإشعارات', icon: Bell },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold rounded transition-all cursor-pointer ${
                        activeTab === item.id 
                          ? 'bg-[#D4AF37] text-black font-extrabold shadow-[0_0_10px_rgba(212,175,55,0.25)]' 
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon size={12} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Group 6: الإدارة والأعضاء والتقنية */}
            <div>
              <span className="text-[9px] font-black text-[#D4AF37] tracking-widest uppercase block mb-2 border-b border-white/5 pb-1">⚙️ الإدارة والتقنية</span>
              <div className="space-y-1">
                {[
                  { id: 'users', label: '3. إدارة جميع الأعضاء', icon: Users },
                  { id: 'permissions', label: '17. الأدوار والصلاحيات', icon: ShieldAlert },
                  { id: 'theme-editor', label: '11. محرر الهوية والتصميم', icon: Palette },
                  { id: 'search-control', label: '13. خوارزمية البحث الذكي', icon: Search },
                  { id: 'api-management', label: '19. ربط الـ APIs والـ Webhooks', icon: Key },
                  { id: 'settings', label: '20. الإعدادات العامة للمنصة', icon: Settings },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold rounded transition-all cursor-pointer ${
                        activeTab === item.id 
                          ? 'bg-[#D4AF37] text-black font-extrabold shadow-[0_0_10px_rgba(212,175,55,0.25)]' 
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon size={12} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full mt-6 py-2.5 bg-red-950/40 hover:bg-red-900/30 text-red-400 font-black text-[11px] rounded-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-red-900/20"
        >
          <LogOut size={12} />
          <span>خروج من نظام الإدارة ✕</span>
        </button>
      </div>

      {/* BODY CONTEXT PANEL */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto max-h-screen">
        
        {/* 1. DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <div className="flex items-center gap-2 text-[#D4AF37] text-[10px] font-black uppercase tracking-wider">
                <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-ping" />
                <span>نظام MIX التشغيلي الفوري | Real-Time Sync</span>
              </div>
              <h1 className="text-2xl font-black text-white mt-1">المؤشرات العامة والأداء العام للسنتر 📊</h1>
              <p className="text-xs text-white/40 mt-1">مراقبة الأداء المالي، مبيعات المتاجر، وحركة التداول الكلية على المنصة بالكامل.</p>
            </div>

            {/* Core Metrics Block */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0e0e0e] border border-white/5 p-6 rounded-sm text-right hover:border-[#D4AF37]/20 transition-all">
                <span className="text-[10px] text-white/40 block font-bold">إجمالي التداول الفعلي (الطلبات المستلمة)</span>
                <span className="text-xl sm:text-3xl font-mono font-black text-[#D4AF37] mt-2 block">{totalSales} {platformCurrency}</span>
                <span className="text-[9px] text-white/20 mt-1 block">من كافة المحلات النشطة</span>
              </div>

              <div className="bg-[#0e0e0e] border border-white/5 p-6 rounded-sm text-right hover:border-[#D4AF37]/20 transition-all">
                <span className="text-[10px] text-white/40 block font-bold">صافي عمولات المنصة المحسوبة</span>
                <span className="text-xl sm:text-3xl font-mono font-black text-amber-500 mt-2 block">{totalCommission.toFixed(1)} {platformCurrency}</span>
                <span className="text-[9px] text-green-400 mt-1 block">ربح منصة MIX الصافي</span>
              </div>

              <div className="bg-[#0e0e0e] border border-white/5 p-6 rounded-sm text-right hover:border-[#D4AF37]/20 transition-all">
                <span className="text-[10px] text-white/40 block font-bold">عدد المحلات والعلامات المستقلة</span>
                <span className="text-xl sm:text-3xl font-mono font-black text-white mt-2 block">{activeStores} / {totalStores}</span>
                <span className="text-[9px] text-white/30 mt-1 block">{totalStores - activeStores} محلات موقوفة أو تجريبية</span>
              </div>

              <div className="bg-[#0e0e0e] border border-white/5 p-6 rounded-sm text-right hover:border-[#D4AF37]/20 transition-all">
                <span className="text-[10px] text-white/40 block font-bold">إجمالي الكتالوج (المنتجات النشطة)</span>
                <span className="text-xl sm:text-3xl font-mono font-black text-white mt-2 block">{totalProductsCount} منتج</span>
                <span className="text-[9px] text-amber-400/80 mt-1 block">مرتبط بـ 9 أقسام تصنيف</span>
              </div>
            </div>

            {/* Quick Actions Portal */}
            <div className="p-5 bg-gradient-to-l from-[#0e0e0e] to-black border border-white/5 rounded-sm space-y-2">
              <span className="text-xs font-black text-[#D4AF37] block">🛡️ الدعم السريع والتشغيل الفيدرالي:</span>
              <p className="text-[11px] text-white/60 leading-relaxed">• تم ربط النظام كلياً بـ **قاعدة بيانات فاير بيس السحابية (Real-Time Firestore)**. أي عملية إيقاف متجر، تعديل عمولة، أو رقابة منتجات ستتم فوراً وتظهر لجميع المتسوقين والتجار دون الحاجة لإعادة تحميل الصفحة.</p>
            </div>
          </div>
        )}

        {/* 2. STORES MANAGEMENT */}
        {activeTab === 'stores' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-black text-[#D4AF37]">إدارة المحلات والمتاجر بالسنتر 🏪</h2>
              <p className="text-xs text-white/40 mt-1">تفعيل، حظر، فك حظر، أو الدخول الإداري الفوري لأي متجر مستقل بالكامل بدون كود.</p>
            </div>

            <div className="bg-[#0e0e0e] border border-white/5 rounded-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-white/5 text-white/60 border-b border-white/5">
                    <tr>
                      <th className="p-4">المتجر / الماركة</th>
                      <th className="p-4">مجال النشاط</th>
                      <th className="p-4">المدينة / الفرع</th>
                      <th className="p-4">العمولة</th>
                      <th className="p-4">الحالة</th>
                      <th className="p-4 text-left">التحكم والوصول</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {stores.map(store => (
                      <tr key={store.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={store.logo}
                            alt={store.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-sm object-cover bg-black border border-white/10 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-white block">{store.name}</span>
                            <span className="text-[8px] text-white/30 font-mono">Owner ID: {store.ownerId}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded-sm text-[10px] font-bold">
                            {store.category}
                          </span>
                        </td>
                        <td className="p-4">{store.city}</td>
                        <td className="p-4 font-mono font-bold text-amber-500">{store.commissionRate}%</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-sm text-[9px] font-bold ${
                            store.status === 'active' 
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {store.status === 'active' ? 'مفعل ونشط' : 'موقوف إدارياً'}
                          </span>
                        </td>
                        <td className="p-4 text-left">
                          <div className="flex gap-2 justify-end flex-wrap">
                            <button
                              onClick={() => openStoreManager(store.id)}
                              className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-sm text-[10px] font-bold transition-all cursor-pointer border border-[#D4AF37]/20"
                            >
                              إدارة المتجر ⚙️
                            </button>
                            <button
                              onClick={() => {
                                const st = stores.find(s2 => s2.id === store.id);
                                if (st && onViewStore) onViewStore(store.id);
                              }}
                              className="px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-sm text-[10px] font-bold transition-all cursor-pointer border border-blue-500/20"
                            >
                              فتح المتجر 👁️
                            </button>
                            <button
                              onClick={() => handleToggleStoreStatus(store.id)}
                              className={`px-3 py-1 rounded-sm text-[10px] font-bold transition-all cursor-pointer ${
                                store.status === 'active'
                                  ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                                  : 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                              }`}
                            >
                              {store.status === 'active' ? 'حظر / إيقاف' : 'إلغاء الحظر'}
                            </button>
                            <button
                              onClick={() => handleDeleteStore(store.id)}
                              className="p-1 text-white/30 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* STORE REQUESTS (طلبات المتاجر الجديدة) */}
        {activeTab === 'store-requests' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <div className="flex items-center gap-2 text-[#D4AF37] text-[10px] font-black uppercase tracking-wider">
                <span className="w-2 h-2 bg-[#D4AF37] rounded-full animate-ping" />
                <span>طلبات انتظار الموافقة</span>
              </div>
              <h2 className="text-xl font-black text-white mt-2">إدارة طلبات إنشاء المتاجر 🏪</h2>
              <p className="text-xs text-white/40 mt-1">مراجعة واعتماد أو رفض طلبات التجار الجدد بعد التحقق من بيانات الدفع.</p>
            </div>

            {(() => {
              const allRequests = JSON.parse(localStorage.getItem('mix_store_requests') || '[]');
              const pendingRequests = pendingStoreRequests;
              
              if (pendingRequests.length === 0) {
                return (
                  <div className="p-12 text-center border border-dashed border-zinc-800 rounded-2xl">
                    <div className="text-4xl mb-3">✅</div>
                    <p className="text-zinc-400 text-sm font-bold">لا توجد طلبات جديدة في انتظار الموافقة</p>
                    <p className="text-zinc-600 text-xs mt-1">جميع الطلبات تمت معالجتها</p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {pendingRequests.map((req: any) => (
                    <div key={req.id} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-white font-bold text-base">{req.storeName}</h3>
                          <p className="text-zinc-400 text-xs">بواسطة: {req.merchantName} · {req.merchantEmail}</p>
                        </div>
                        <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-full text-[10px] font-bold">في انتظار الموافقة</span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-zinc-600 block">الباقة</span>
                          <span className="text-white font-bold">{req.plan === 'basic' ? 'الانطلاقة 250 ج.م' : 'برو + 300 ج.م'}</span>
                        </div>
                        <div>
                          <span className="text-zinc-600 block">التصنيف</span>
                          <span className="text-white">{req.storeCategory}</span>
                        </div>
                        <div>
                          <span className="text-zinc-600 block">المدينة / الحي</span>
                          <span className="text-white">{req.storeCity}{req.storeDistrict ? ` - ${req.storeDistrict}` : ''}</span>
                        </div>
                        <div>
                          <span className="text-zinc-600 block">الهاتف</span>
                          <span className="text-white font-mono" dir="ltr">{req.storePhone || 'غير محدد'}</span>
                        </div>
                        <div>
                          <span className="text-zinc-600 block">تاريخ الطلب</span>
                          <span className="text-white">{new Date(req.createdAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                        {req.storeDescription && (
                          <div className="col-span-2 md:col-span-4">
                            <span className="text-zinc-600 block">وصف المتجر (SEO)</span>
                            <span className="text-white/70 text-[11px]">{req.storeDescription}</span>
                          </div>
                        )}
                      </div>

                      {/* Receipt Image */}
                      {req.receiptImage && (
                        <div>
                          <span className="text-zinc-500 text-[10px] block mb-1">إيصال الدفع (فودافون كاش):</span>
                          <img src={req.receiptImage} alt="Receipt" className="w-32 h-auto rounded-lg border border-zinc-700" />
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={async () => {
                            if (!confirm(`تم اعتماد متجر "${req.storeName}"؟ سيتم إنشاء المتجر فوراً.`)) return;
                            try {
                              const newStoreId = `store-${Date.now()}`;
                              const merchantUserId = `merchant-${Date.now()}`;

                              // Update existing pending user or create new merchant user
                              let storedUsers = JSON.parse(localStorage.getItem('mix_users') || '[]');
                              if (!Array.isArray(storedUsers)) storedUsers = [];
                              const existingUserIndex = storedUsers.findIndex((u: any) => u.email && u.email.toLowerCase() === req.merchantEmail.toLowerCase());
                              if (existingUserIndex >= 0) {
                                storedUsers[existingUserIndex] = {
                                  ...storedUsers[existingUserIndex],
                                  role: 'merchant',
                                  storeId: newStoreId,
                                  status: 'approved',
                                  id: merchantUserId
                                };
                              } else {
                                storedUsers.push({
                                  id: merchantUserId,
                                  name: req.merchantName,
                                  email: req.merchantEmail,
                                  password: req.merchantPassword,
                                  role: 'merchant',
                                  storeId: newStoreId
                                });
                              }
                              localStorage.setItem('mix_users', JSON.stringify(storedUsers));
                              // Save users to Firestore
                              const approvedUserData = storedUsers.find((u: any) => u.id === merchantUserId);
                              if (approvedUserData) fbSync.saveUser(approvedUserData).catch(console.error);

                              // Create store — includes ALL fields StoreView expects to prevent render errors
                              const storeSlug = req.storeName.replace(/\s+/g, '-').replace(/[^\u0600-\u06FF\w-]/g, '').toLowerCase();
                              const newStore = {
                                id: newStoreId,
                                name: req.storeName,
                                logo: req.storeLogo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&h=200&fit=crop',
                                cover: req.storeCover || 'https://images.unsplash.com/photo-1468436139062-f60a71c5c892?q=80&w=1200&h=400&fit=crop',
                                category: req.storeCategory,
                                description: req.storeDescription || `أهلاً بكم في ${req.storeName} على منصة MIX`,
                                city: req.storeCity,
                                district: req.storeDistrict || '',
                                neighborhood: req.storeNeighborhood || '',
                                storePhone: req.storePhone || '',
                                seoDescription: req.storeDescription || '',
                                seoKeywords: `${req.storeName}, ${req.storeCategory}, ${req.storeCity}, ${req.storeDistrict || ''}`,
                                slug: storeSlug,
                                country: 'مصر',
                                rating: 5.0,
                                reviewsCount: 0,
                                productsCount: 0,
                                themeColor: { primary: '#D4AF37', secondary: '#111111', background: '#050505', frameColor: '#141414', textColor: '#d4d4d8' },
                                layoutType: 'luxury' as const,
                                visualTemplate: req.visualTemplate || 'multicategory',
                                banners: [{
                                  id: `b-${Date.now()}`,
                                  title: `مرحباً بكم في ${req.storeName}`,
                                  subtitle: 'عروض حصرية وخصومات مميزة بانتظاركم',
                                  image: req.storeCover || 'https://images.unsplash.com/photo-1468436139062-f60a71c5c892?q=80&w=1200&h=400&fit=crop',
                                  linkToCategory: ''
                                }],
                                categories: [req.storeCategory, 'وصل حديثاً'],
                                featured: false,
                                status: 'active',
                                ownerId: merchantUserId,
                                commissionRate: req.commissionRate || 3,
                                salesCount: 0,
                                currency: 'ر.س',
                                features: [
                                  { id: '1', title: 'توصيل سريع', desc: 'توصيل لباب بيتك في أسرع وقت ممكن', icon: '⚡' },
                                  { id: '2', title: 'ضمان MIX للثقة', desc: 'جميع المنتجات مكفولة بضمان MIX المعتمد', icon: '🛡️' },
                                  { id: '3', title: 'دعم مباشر', desc: 'دعم متواصل على مدار اليوم لحل أي إشكاليات', icon: '💬' }
                                ],
                                paymentGateways: [
                                  { id: `pg-cod-${Date.now()}`, type: 'cod' as const, name: 'الدفع عند الاستلام', enabled: true, icon: '💵', minAmount: 50, maxAmount: 10000 },
                                  { id: `pg-vodafone-${Date.now()}`, type: 'vodafoneCash' as const, name: 'فودافون كاش', enabled: true, icon: '🟥', number: '', accountHolderName: '', extraInstructions: 'يرجى إرسال صورة الإيصال بعد التحويل' },
                                  { id: `pg-instapay-${Date.now()}`, type: 'instapay' as const, name: 'إنستا باي (InstaPay)', enabled: true, icon: '💙', number: '', accountHolderName: '', extraInstructions: 'تحويل فوري عبر تطبيق InstaPay' },
                                  { id: `pg-bank-${Date.now()}`, type: 'bankTransfer' as const, name: 'تحويل بنكي', enabled: true, icon: '🏦', bankName: '', accountHolderName: '', iban: '', branchName: '', number: '', extraInstructions: 'يرجى إرسال صورة إيصال التحويل' }
                                ],
                                customCheckoutFields: [
                                  { id: `f-name-${Date.now()}`, name: 'fullName', label: 'الاسم الكامل', type: 'text' as const, required: true, enabled: true, placeholder: 'أدخل اسمك الكامل', order: 1 },
                                  { id: `f-phone-${Date.now()}`, name: 'phone', label: 'رقم الهاتف', type: 'tel' as const, required: true, enabled: true, placeholder: 'مثال: 01xxxxxxxxx', order: 2, validation: { minLength: 10, maxLength: 15, pattern: '^[0-9+\\- ]+$' } },
                                  { id: `f-address-${Date.now()}`, name: 'address', label: 'عنوان التوصيل', type: 'textarea' as const, required: true, enabled: true, placeholder: 'المحافظة، الحي، الشارع، رقم العقار، الدور، رقم الشقة', order: 3 },
                                  { id: `f-gov-${Date.now()}`, name: 'governorate', label: 'المحافظة', type: 'select' as const, required: true, enabled: true, options: ['القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحيرة', 'الشرقية', 'القليوبية', 'المنوفية', 'الغربية', 'كفر الشيخ', 'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'الأقصر', 'أسوان', 'سوهاج', 'قنا', 'أسيوط', 'المنيا', 'الفيوم', 'بني سويف', 'الوادي الجديد', 'مطروح', 'شمال سيناء', 'جنوب سيناء', 'البحر الأحمر'], order: 4 },
                                  { id: `f-email-${Date.now()}`, name: 'email', label: 'البريد الإلكتروني', type: 'email' as const, required: false, enabled: true, placeholder: 'example@email.com', order: 5 },
                                  { id: `f-notes-${Date.now()}`, name: 'notes', label: 'ملاحظات إضافية', type: 'textarea' as const, required: false, enabled: true, placeholder: 'أي تعليمات خاصة للطلب (اختياري)', order: 6 }
                                ]
                              };
                              const currentStores = JSON.parse(localStorage.getItem('mix_stores') || '[]');
                              currentStores.push(newStore);
                              localStorage.setItem('mix_stores', JSON.stringify(currentStores));
                              // Save to Firestore
                              fbSync.saveStore(newStore).catch(console.error);

                              // Update request status
                              const updatedRequests = allRequests.map((r: any) => 
                                r.id === req.id ? { ...r, status: 'approved', approvedAt: new Date().toISOString(), storeId: newStoreId, merchantUserId } : r
                              );
                              localStorage.setItem('mix_store_requests', JSON.stringify(updatedRequests));
                              fbSync.updateStoreRequest(req.id, { status: 'approved', approvedAt: new Date().toISOString(), storeId: newStoreId, merchantUserId }).catch(console.error);

                              // Notify platform-wide that data changed
                              window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_stores' } }));
                              window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_users' } }));
                              window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_store_requests' } }));

                              // Refresh state
                              setStores([...currentStores]);
                              setPendingStoreRequests(prev => prev.filter((r: any) => r.id !== req.id));
                              await logAndNotify('موافقة على متجر جديد', `تمت الموافقة على طلب المتجر "${req.storeName}" وتم إنشاؤه فوراً`);
                              const approvedMerchant = {
                                id: merchantUserId,
                                name: req.merchantName,
                                email: req.merchantEmail,
                                role: 'merchant' as const,
                                storeId: newStoreId
                              };
                              localStorage.setItem('mix_user', JSON.stringify(approvedMerchant));
                              if (onMerchantApproved) onMerchantApproved(approvedMerchant);
                              else alert(`✅ تمت الموافقة على طلب "${req.storeName}" وتم إنشاء المتجر بنجاح! التاجر يمكنه الآن تسجيل الدخول.`);
                            } catch (err) {
                              alert('حدث خطأ أثناء إنشاء المتجر');
                              console.error(err);
                            }
                          }}
                          className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle size={14} />
                          <span>اعتماد الطلب ✓</span>
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`رفض طلب المتجر "${req.storeName}"؟`)) return;
                            const updatedRequests = allRequests.map((r: any) => 
                              r.id === req.id ? { ...r, status: 'rejected' } : r
                            );
                            localStorage.setItem('mix_store_requests', JSON.stringify(updatedRequests));
                            fbSync.updateStoreRequest(req.id, { status: 'rejected' }).catch(console.error);
                            setPendingStoreRequests(prev => prev.filter((r: any) => r.id !== req.id));
                            window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_store_requests' } }));
                            await logAndNotify('رفض طلب متجر', `تم رفض طلب المتجر "${req.storeName}"`);
                            setStores([...stores]);
                            alert(`تم رفض طلب "${req.storeName}".`);
                          }}
                          className="px-5 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <X size={14} />
                          <span>رفض الطلب</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* 3. USERS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-black text-[#D4AF37]">إدارة حسابات المستخدمين والأعضاء 👥</h2>
              <p className="text-xs text-white/40 mt-1">تصفح والتحكم بصلاحيات المشترين، والشركاء، ومدراء الفروع وتجميد الحسابات.</p>
            </div>

            <div className="bg-[#0e0e0e] border border-white/5 rounded-sm overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-white/5 text-white/60 border-b border-white/5">
                  <tr>
                    <th className="p-4">الاسم الكامل</th>
                    <th className="p-4">البريد الإلكتروني</th>
                    <th className="p-4">الدور / الصلاحية</th>
                    <th className="p-4">الارتباط</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-bold text-white">{u.name}</td>
                      <td className="p-4 font-mono text-white/60">{u.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-sm text-[9px] font-black ${
                          u.role === 'admin' ? 'bg-yellow-500 text-black' : u.role === 'merchant' ? 'bg-amber-500/10 text-amber-400' : 'bg-white/10 text-white/60'
                        }`}>
                          {u.role === 'admin' ? 'إدارة عامة' : u.role === 'merchant' ? 'تاجر شريك' : 'عميل متسوق'}
                        </span>
                      </td>
                      <td className="p-4 text-white/40">
                        {u.storeId ? stores.find(s => s.id === u.storeId)?.name || 'متجر مستقل' : 'لا يوجد'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. PRODUCTS CONTROL */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-black text-[#D4AF37]">مراقبة وحوكمة جميع المنتجات بالسنتر 🛍️</h2>
              <p className="text-xs text-white/40 mt-1">شاهد المنتجات التي يرفعها التجار بشكل لحظي، وتدخل بالتعطيل أو الحذف لضبط جودة المول.</p>
            </div>

            <div className="bg-[#0e0e0e] border border-white/5 rounded-sm overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-white/5 text-white/60 border-b border-white/5">
                  <tr>
                    <th className="p-4">المنتج المعروض</th>
                    <th className="p-4">المتجر التابع له</th>
                    <th className="p-4">السعر بالريال</th>
                    <th className="p-4">القسم</th>
                    <th className="p-4 text-left">الرقابة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {products.map(p => {
                    const store = stores.find(s => s.id === p.storeId);
                    return (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img src={p.image} alt="" className="w-10 h-10 object-cover rounded-sm bg-black border border-white/10" referrerPolicy="no-referrer" />
                          <div>
                            <span className="font-bold text-white block">{p.name}</span>
                            <span className="text-[9px] text-white/30 font-mono">ID: {p.id}</span>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-[#D4AF37]">{store?.name || 'متجر مستقل'}</td>
                        <td className="p-4 font-mono text-white font-bold">{p.price} ر.س</td>
                        <td className="p-4 text-white/60">{p.category}</td>
                        <td className="p-4 text-left">
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="px-2 py-1 bg-red-950/30 hover:bg-red-900/30 text-red-400 rounded-sm font-bold text-[9px] border border-red-900/20 transition-all cursor-pointer"
                          >
                            حذف كمنتج مخالف ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. CATEGORIES SYSTEM */}
        {activeTab === 'categories' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-black text-[#D4AF37]">نظام الأقسام العامة للمنصة 🏷️</h2>
                <p className="text-xs text-white/40 mt-1">إدارة الأقسام والتصنيفات التي تظهر في الصفحة الرئيسية لمحرك بحث MIX مع خيار تعميمها على المتاجر.</p>
              </div>
              <button
                onClick={() => {
                  try {
                    const allCatNames = categories.map(c => c.name);
                    const updatedStores = stores.map(s => {
                      const existing = s.categories || [];
                      const merged = Array.from(new Set([...existing, ...defaultCatNames]));
                      return { ...s, categories: merged };
                    });
                    localStorage.setItem('mix_stores', JSON.stringify(updatedStores));
                    window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_stores' } }));
                    window.dispatchEvent(new CustomEvent('mix-realtime-mix_stores', { detail: { key: 'mix_stores' } }));
                    alert('✓ تم تعميم ونشر الأقسام الافتراضية بنجاح على جميع المتاجر بالزمن الحقيقي!');
                  } catch (err) { console.error(err); }
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs rounded-sm hover:from-blue-500 hover:to-indigo-500 transition-all cursor-pointer flex items-center gap-1.5 shadow-lg"
              >
                📢 إرسال وتعميم الأقسام لجميع المتاجر
              </button>
            </div>

            <div className="p-6 bg-[#0e0e0e] border border-white/5 rounded-sm max-w-xl space-y-4">
              <span className="text-xs font-black text-[#D4AF37] block">إنشاء قسم عام جديد</span>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="اسم القسم باللغة العربية"
                  value={newCatName}
                  onChange={(e) => {
                    setNewCatName(e.target.value);
                    if (!newCatSlug) setNewCatSlug(e.target.value.replace(/\s+/g, '-'));
                  }}
                  className="bg-black border border-white/10 rounded-sm py-2 px-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
                <input
                  type="text"
                  placeholder="اسم أيقونة Lucide (مثال: Smartphone)"
                  value={newCatIcon}
                  onChange={(e) => setNewCatIcon(e.target.value)}
                  className="bg-black border border-white/10 rounded-sm py-2 px-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <input
                type="text"
                placeholder="slug (مثال: smartphones)"
                value={newCatSlug}
                onChange={(e) => setNewCatSlug(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-mono"
              />
              <button
                onClick={() => {
                  if (!newCatName.trim()) { alert('اكتب اسم القسم أولاً'); return; }
                  const newCat = {
                    id: `cat-${Date.now()}`,
                    name: newCatName.trim(),
                    slug: newCatSlug.trim() || newCatName.trim().replace(/\s+/g, '-'),
                    icon: newCatIcon.trim() || 'Tag',
                    description: ''
                  };
                  const updated = [...categories, newCat];
                  setCategories(updated);
                  localStorage.setItem('mix_categories', JSON.stringify(updated));
                  fbSync.savePlatformSettings({ categories: updated }).catch(console.error);
                  window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_categories' } }));
                  setNewCatName('');
                  setNewCatSlug('');
                  setNewCatIcon('');
                  alert('تم إضافة القسم بنجاح! 🎉');
                }}
                className="w-full py-2 bg-[#D4AF37] text-black font-bold text-xs rounded-sm cursor-pointer hover:bg-white hover:text-black transition-all"
              >
                تأسيس ونشر قسم في المنصة 🚀
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!confirm('هل تريد إرسال كافة الأقسام الافتراضية لجميع المتاجر المسجلة في المنصة؟')) return;
                  const catNames = categories.map(c => c.name);
                  const updatedStores = stores.map(s => {
                    const existing = s.categories || [];
                    const merged = Array.from(new Set([...existing, ...catNames]));
                    return { ...s, categories: merged };
                  });
                  setStores(updatedStores);
                  localStorage.setItem('mix_stores', JSON.stringify(updatedStores));
                  window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_stores' } }));
                  window.dispatchEvent(new CustomEvent('mix-realtime-mix_stores', { detail: { data: updatedStores } }));
                  alert('تم تعميم كافة الأقسام الافتراضية بنجاح على جميع المتاجر! 🚀');
                }}
                className="w-full mt-2 py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold text-xs rounded-sm cursor-pointer border border-amber-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <span>📢 إرسال وتعميم الأقسام الافتراضية لجميع المتاجر</span>
              </button>
            </div>

            {/* Categories List */}
            <div className="bg-[#0e0e0e] border border-white/5 rounded-sm overflow-hidden">
              <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                <span className="text-xs text-white/60 font-bold">الأقسام الحالية ({categories.length})</span>
              </div>
              {categories.length === 0 ? (
                <div className="p-8 text-center text-white/30 text-xs">لا توجد أقسام بعد</div>
              ) : (
                <div className="divide-y divide-white/5">
                  {categories.map((cat: any) => (
                    <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-lg flex items-center justify-center text-[#D4AF37] text-sm">
                          {cat.icon === 'Smartphone' ? '📱' : cat.icon === 'Shirt' ? '👕' : cat.icon === 'Watch' ? '⌚' : cat.icon === 'Gem' ? '💎' : cat.icon === 'Utensils' ? '🍽️' : cat.icon === 'Flower2' ? '🌸' : cat.icon === 'Laptop' ? '💻' : '🏷️'}
                        </span>
                        <div>
                          <span className="text-white text-xs font-bold block">{cat.name}</span>
                          <span className="text-white/30 text-[10px] font-mono">{cat.slug} • {cat.icon}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (!confirm(`هل أنت متأكد من حذف القسم "${cat.name}"؟`)) return;
                          const updated = categories.filter((c: any) => c.id !== cat.id);
                          setCategories(updated);
                          localStorage.setItem('mix_categories', JSON.stringify(updated));
                          fbSync.savePlatformSettings({ categories: updated }).catch(console.error);
                          window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_categories' } }));
                        }}
                        className="p-2 text-white/30 hover:text-red-400 transition-colors cursor-pointer"
                        title="حذف القسم"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-black text-[#D4AF37]">متابعة طلبات الشراء الموحدة بالسنتر 📦</h2>
              <p className="text-xs text-white/40 mt-1">تتبع كافة الشحنات والعمليات الجارية في السنتر، مع إمكانية التعديل السريع لحالة الطلب.</p>
            </div>

            <div className="bg-[#0e0e0e] border border-white/5 rounded-sm overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-white/5 text-white/60 border-b border-white/5">
                  <tr>
                    <th className="p-4">رقم الطلب / التاريخ</th>
                    <th className="p-4">العميل والمستلم</th>
                    <th className="p-4">المتجر البائع</th>
                    <th className="p-4">مجموع السعر</th>
                    <th className="p-4">حالة الشحنة</th>
                    <th className="p-4 text-left">تعديل الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <span className="font-mono text-white font-bold block">#{o.id}</span>
                        <span className="text-[9px] text-white/30">{o.date}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-white block">{o.customerName}</span>
                        <span className="text-[9px] text-white/40">{o.customerPhone}</span>
                      </td>
                      <td className="p-4 text-[#D4AF37] font-bold">{o.storeName}</td>
                      <td className="p-4 font-mono font-bold text-white">{o.total} ر.س</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-sm text-[9px] font-bold ${
                          o.status === 'delivered' ? 'bg-green-500/10 text-green-400' :
                          o.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-zinc-800 text-zinc-400'
                        }`}>
                          {o.status === 'delivered' ? 'تم التسليم مكتمل' :
                           o.status === 'pending' ? 'طلب جديد قيد المراجعة' : o.status}
                        </span>
                      </td>
                      <td className="p-4 text-left">
                        <select
                          value={o.status}
                          onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as any)}
                          className="bg-black border border-white/10 rounded-sm py-1 px-2 text-[10px] text-white focus:outline-none cursor-pointer"
                        >
                          <option value="pending">جديد / انتظار</option>
                          <option value="processing">قيد التجهيز</option>
                          <option value="shipped">تم الشحن / التوصيل</option>
                          <option value="delivered">مكتمل ومستلم</option>
                          <option value="cancelled">ملغي / مسترجع</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. PAYMENTS SYSTEM */}
        {activeTab === 'payments' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-black text-[#D4AF37]">بوابة المدفوعات والاشتراكات المالية 💳</h2>
              <p className="text-xs text-white/40 mt-1">مراقبة الفواتير التشغيلية واشتراكات المتاجر (الباقة الفلكية، الفضية، الملكية).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#0e0e0e] border border-white/5 p-5 rounded-sm">
                <span className="text-[10px] text-white/40 block">مبيعات الباقات والمبيعات العامة للسنتر</span>
                <span className="text-xl font-mono font-black text-[#D4AF37] block mt-1">45,120 ج.م</span>
              </div>
              <div className="bg-[#0e0e0e] border border-white/5 p-5 rounded-sm">
                <span className="text-[10px] text-white/40 block">المدفوعات المعلقة للمحافظ</span>
                <span className="text-xl font-mono font-black text-[#D4AF37] block mt-1">12,490 ج.م</span>
              </div>
              <div className="bg-[#0e0e0e] border border-white/5 p-5 rounded-sm">
                <span className="text-[10px] text-white/40 block">الفواتير الضريبية المصدرة</span>
                <span className="text-xl font-mono font-black text-[#D4AF37] block mt-1">214 فاتورة</span>
              </div>
            </div>
          </div>
        )}

        {/* PAYMENT METHODS */}
        {activeTab === 'payment-methods' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-black text-[#D4AF37]">طرق الدفع المتاحة للمستخدمين 💳</h2>
              <p className="text-xs text-white/40 mt-1">إضافة وتعديل وحذف طرق الدفع (فودافون كاش، انستا بي، بنك، إيصال). المستخدم يختار الطريقة عند الشراء.</p>
            </div>

            {/* Add New Payment Method */}
            <div className="bg-[#0e0e0e] border border-white/5 rounded-sm p-5 space-y-4">
              <h3 className="text-xs font-black text-white flex items-center gap-2">
                <Plus size={14} className="text-[#D4AF37]" /> إضافة طريقة دفع جديدة
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-[10px] font-bold mb-1">نوع طريقة الدفع</label>
                  <select value={pmType} onChange={e => setPmType(e.target.value as any)}
                    className="w-full bg-white/5 border border-white/10 rounded-sm py-2 px-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]">
                    <option value="vodafone">فودافون كاش</option>
                    <option value="instapay">انستا بي (InstaPay)</option>
                    <option value="bank">تحويل بنكي</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/60 text-[10px] font-bold mb-1">اسم صاحب الحساب</label>
                  <input value={pmHolderName} onChange={e => setPmHolderName(e.target.value)}
                    placeholder="الاسم كما في الحساب"
                    className="w-full bg-white/5 border border-white/10 rounded-sm py-2 px-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]" />
                </div>
                <div>
                  <label className="block text-white/60 text-[10px] font-bold mb-1">
                    {pmType === 'bank' ? 'رقم الحساب (IBAN)' : 'رقم المحفظة / الهاتف'}
                  </label>
                  <input value={pmNumber} onChange={e => setPmNumber(e.target.value)}
                    placeholder={pmType === 'bank' ? 'EG12 3456 7890 1234 5678 9012' : '010XXXXXXXX'}
                    className="w-full bg-white/5 border border-white/10 rounded-sm py-2 px-3 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]" />
                </div>
                {pmType === 'bank' && (
                  <div>
                    <label className="block text-white/60 text-[10px] font-bold mb-1">اسم البنك</label>
                    <input value={pmBankName} onChange={e => setPmBankName(e.target.value)}
                      placeholder="مثال: بنك مصر، CIB، الأهلي"
                      className="w-full bg-white/5 border border-white/10 rounded-sm py-2 px-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]" />
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="block text-white/60 text-[10px] font-bold mb-1">صورة البطاقة / الشعار / الإيصال</label>
                  {pmImage ? (
                    <div className="relative inline-block">
                      <img src={pmImage} alt="" className="w-32 h-20 rounded-sm object-cover border border-white/10" />
                      <button type="button" onClick={() => setPmImage('')}
                        className="absolute -top-1 -left-1 bg-black/80 text-red-400 text-[9px] w-4 h-4 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600 hover:text-white">×</button>
                    </div>
                  ) : (
                    <label className="block border-2 border-dashed border-white/10 hover:border-[#D4AF37]/40 rounded-sm p-6 text-center cursor-pointer transition-colors">
                      <div className="text-[#D4AF37] text-2xl mb-2">📷</div>
                      <p className="text-white/40 text-xs">اضغط لرفع صورة (بطاقة بنك، شعار فودافون، إيصال)</p>
                      <p className="text-white/20 text-[10px] mt-1">JPG, PNG — أقل من 2MB</p>
                      <input type="file" accept="image/*" className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]; if (!file) return;
                          const reader = new FileReader();
                          reader.onload = async (ev) => {
                            const compressed = await compressBase64(ev.target?.result as string, 600, 400, 0.7);
                            setPmImage(compressed);
                          };
                          reader.readAsDataURL(file);
                        }} />
                    </label>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  if (!pmNumber || !pmHolderName) { alert('أدخل رقم الحساب واسم الصاحب'); return; }
                  const newMethod = {
                    id: `pm-${Date.now()}`,
                    type: pmType,
                    name: pmHolderName,
                    number: pmNumber,
                    bankName: pmBankName,
                    image: pmImage,
                    active: true,
                    createdAt: new Date().toISOString(),
                  };
                  const updated = [...paymentMethods, newMethod];
                  setPaymentMethods(updated);
                  localStorage.setItem('mix_payment_methods', JSON.stringify(updated));
                  window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_payment_methods' } }));
                  setPmName(''); setPmNumber(''); setPmImage(''); setPmHolderName(''); setPmBankName('');
                  alert('تم إضافة طريقة الدفع بنجاح!');
                }}
                className="px-6 py-2 bg-[#D4AF37] text-black rounded-sm text-xs font-black hover:bg-[#b8960c] transition-colors cursor-pointer"
              >
                + إضافة طريقة الدفع
              </button>
            </div>

            {/* Existing Payment Methods */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-white">طرق الدفع الحالية ({paymentMethods.length})</h3>
              {paymentMethods.length === 0 ? (
                <div className="text-center py-8 text-white/30 text-xs">لا توجد طرق دفع مضافة بعد</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {paymentMethods.map(pm => (
                    <div key={pm.id} className="bg-[#0e0e0e] border border-white/5 rounded-sm p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {pm.image ? (
                            <img src={pm.image} alt="" className="w-12 h-12 rounded-sm object-cover border border-white/10" />
                          ) : (
                            <div className="w-12 h-12 rounded-sm bg-white/5 border border-white/10 flex items-center justify-center text-lg">
                              {pm.type === 'vodafone' ? '📱' : pm.type === 'instapay' ? '🏦' : pm.type === 'bank' ? '🏛️' : '💳'}
                            </div>
                          )}
                          <div>
                            <div className="text-xs font-bold text-white">
                              {pm.type === 'vodafone' ? 'فودافون كاش' : pm.type === 'instapay' ? 'انستا بي' : pm.type === 'bank' ? 'تحويل بنكي' : 'أخرى'}
                            </div>
                            <div className="text-[10px] text-white/40 font-mono">{pm.number}</div>
                            <div className="text-[10px] text-white/30">{pm.name}{pm.bankName ? ` — ${pm.bankName}` : ''}</div>
                          </div>
                        </div>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${pm.active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {pm.active ? 'نشط' : 'متوقف'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const updated = paymentMethods.map(x => x.id === pm.id ? { ...x, active: !x.active } : x);
                            setPaymentMethods(updated);
                            localStorage.setItem('mix_payment_methods', JSON.stringify(updated));
                          }}
                          className={`flex-1 py-1 rounded-sm text-[10px] font-bold cursor-pointer transition-colors ${
                            pm.active ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                          }`}
                        >
                          {pm.active ? 'إيقاف' : 'تفعيل'}
                        </button>
                        <button
                          onClick={() => {
                            if (!confirm('حذف طريقة الدفع؟')) return;
                            const updated = paymentMethods.filter(x => x.id !== pm.id);
                            setPaymentMethods(updated);
                            localStorage.setItem('mix_payment_methods', JSON.stringify(updated));
                          }}
                          className="px-3 py-1 text-white/20 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 8. COMMISSION CONTROL */}
        {activeTab === 'commission' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-black text-[#D4AF37]">التحكم بنسب العمولات للمتاجر والشركاء 💸</h2>
              <p className="text-xs text-white/40 mt-1">تحديد واقتطاع نسبة أرباح المنصة من كل مبيعة داخل متجر شريك بشكل فردي.</p>
            </div>

            <div className="bg-[#0e0e0e] border border-white/5 rounded-sm overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-white/5 text-white/60 border-b border-white/5">
                  <tr>
                    <th className="p-4">اسم المتجر</th>
                    <th className="p-4">المدينة</th>
                    <th className="p-4">العمولة التشغيلية</th>
                    <th className="p-4 text-left">تعديل نسبة مخصصة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {stores.map(store => (
                    <tr key={store.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-bold text-white">{store.name}</td>
                      <td className="p-4">{store.city}</td>
                      <td className="p-4 font-mono font-bold text-amber-500">{store.commissionRate}%</td>
                      <td className="p-4 text-left">
                        <div className="flex gap-2 justify-end items-center">
                          <input
                            type="number"
                            placeholder="نسبة %"
                            defaultValue={store.commissionRate}
                            onBlur={(e) => handleUpdateStoreCommission(store.id, Number(e.target.value))}
                            className="bg-black border border-white/10 rounded-sm w-16 py-1 px-2 text-xs text-white text-center font-mono"
                          />
                          <span className="text-white/40 text-[10px]">% اضغط خارج الحقل للحفظ</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 9. BANNERS MANAGER */}
        {activeTab === 'banners' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black text-[#D4AF37]">إدارة البنرات الإعلانية العامة لـ MIX 📢</h2>
                <p className="text-xs text-white/40 mt-1">تغيير السلايدرات الترويجية الفاخرة في واجهة المتجر الموحد الرئيسي.</p>
              </div>
              {!isAddingBanner && (
                <button
                  onClick={() => setIsAddingBanner(true)}
                  className="px-4 py-2 bg-[#D4AF37] text-black font-bold text-xs rounded-sm hover:bg-white transition-all cursor-pointer"
                >
                  إضافة بنر إعلاني عام ＋
                </button>
              )}
            </div>

            {isAddingBanner && (
              <form onSubmit={handleBannerSubmit} className="bg-[#0e0e0e] border border-white/5 p-6 rounded-sm space-y-4">
                <span className="text-xs font-black text-[#D4AF37] block">إضافة إعلان رئيسي جديد</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="العنوان الرئيسي للمنشور"
                    value={bTitle}
                    onChange={(e) => setBTitle(e.target.value)}
                    className="bg-black border border-white/10 rounded-sm py-2 px-3 text-xs text-white focus:outline-none"
                    required
                  />
                  <input
                    type="text"
                    placeholder="العنوان الفرعي"
                    value={bSub}
                    onChange={(e) => setBSub(e.target.value)}
                    className="bg-black border border-white/10 rounded-sm py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="text-[10px] text-white/50 block mb-1">صورة البنر (Image)</label>
                  {bImage ? (
                    <div className="relative">
                      <img src={bImage} alt="Preview" className="w-full aspect-[3/1] object-cover rounded-sm border border-white/10" />
                      <button
                        type="button"
                        onClick={() => setBImage('')}
                        className="absolute top-2 left-2 bg-black/80 text-red-400 text-[10px] px-2 py-1 rounded cursor-pointer hover:bg-red-600 hover:text-white"
                      >
                        حذف الصورة ✕
                      </button>
                    </div>
                  ) : (
                    <label className="block border-2 border-dashed border-white/10 hover:border-[#D4AF37]/40 rounded-sm p-6 text-center cursor-pointer transition-colors">
                      <div className="text-[#D4AF37] text-2xl mb-2">🖼️</div>
                      <p className="text-white/40 text-xs">اضغط لرفع صورة البنر من جهازك</p>
                      <p className="text-white/20 text-[10px] mt-1">JPG, PNG — نسبة عرض 3:1 مثالية</p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = async (ev) => {
                            const raw = ev.target?.result as string;
                            const compressed = await compressBase64(raw, 1200, 400, 0.7);
                            setBImage(compressed);
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  )}
                </div>

                {/* Video - URL or Upload */}
                <div>
                  <label className="text-[10px] text-white/50 block mb-1">فيديو البنر (اختياري)</label>
                  {bVideoUrl ? (
                    <div className="relative">
                      {bVideoUrl.includes('youtube.com') || bVideoUrl.includes('youtu.be') ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${bVideoUrl.includes('youtu.be') ? bVideoUrl.split('/').pop() : new URL(bVideoUrl).searchParams.get('v') || ''}?autoplay=1&mute=1&loop=1&controls=0`}
                          className="w-full aspect-[3/1] object-cover rounded-sm border border-white/10"
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                        />
                      ) : (
                        <video src={bVideoUrl} className="w-full aspect-[3/1] object-cover rounded-sm border border-white/10" controls muted loop autoPlay playsInline />
                      )}
                      <button
                        type="button"
                        onClick={() => setBVideoUrl('')}
                        className="absolute top-2 left-2 bg-black/80 text-red-400 text-[10px] px-2 py-1 rounded cursor-pointer hover:bg-red-600 hover:text-white"
                      >
                        حذف الفيديو ✕
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Option 1: Paste URL */}
                      <div className="p-3 bg-zinc-900/60 border border-white/10 rounded-sm space-y-2">
                        <p className="text-[10px] text-[#D4A637] font-bold flex items-center gap-1">🔗 الصق رابط الفيديو (يوتيوب أو أي رابط مباشر)</p>
                        <input
                          type="url"
                          placeholder="https://www.youtube.com/watch?v=... أو https://example.com/video.mp4"
                          className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-[11px] text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const url = (e.target as HTMLInputElement).value.trim();
                              if (url) {
                                setBVideoUrl(url);
                                (e.target as HTMLInputElement).value = '';
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            const input = (e.currentTarget.parentElement as HTMLElement).querySelector('input') as HTMLInputElement;
                            const url = input?.value?.trim();
                            if (url) {
                              setBVideoUrl(url);
                              input.value = '';
                            }
                          }}
                          className="w-full py-1.5 bg-[#D4AF37] text-black font-bold text-[10px] rounded-sm cursor-pointer hover:bg-white transition-all"
                        >
                          تأكيد الرابط ✅
                        </button>
                        <p className="text-[9px] text-white/30">يدعم: يوتيوب، فيميو، أو أي رابط فيديو مباشر (.mp4, .webm)</p>
                      </div>

                      {/* Option 2: Small file upload */}
                      <label className="block border-2 border-dashed border-white/10 hover:border-[#D4AF37]/40 rounded-sm p-4 text-center cursor-pointer transition-colors">
                        <div className="text-[#D4AF37] text-lg mb-1">📁</div>
                        <p className="text-white/40 text-[10px">أو ارفع فيديو صغير من جهازك</p>
                        <p className="text-white/20 text-[9px] mt-0.5">MP4/WebM — أقل من 2MB فقط</p>
                        <input
                          type="file"
                          accept="video/mp4,video/webm"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 2 * 1024 * 1024) {
                              alert('حجم الفيديو يتجاوز 2MB.\nاستخدم رابط فيديو بدلاً من الرفع مباشرة.');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (ev) => setBVideoUrl(ev.target?.result as string);
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={bType}
                    onChange={(e) => setBType(e.target.value as any)}
                    className="bg-black border border-white/10 rounded-sm py-2 px-3 text-xs text-white focus:outline-none"
                  >
                    <option value="store">رابط المتجر</option>
                    <option value="category">رابط القسم</option>
                    <option value="offer">رابط العرض</option>
                  </select>
                  <input
                    type="text"
                    placeholder="قيمة الوجهة (storeId / category / productId)"
                    value={bValue}
                    onChange={(e) => setBValue(e.target.value)}
                    className="bg-black border border-white/10 rounded-sm py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <button type="submit" className="w-full py-2 bg-white text-black hover:bg-[#D4AF37] hover:text-white transition-all font-bold text-xs rounded-sm cursor-pointer">
                  تثبيت ونشر البنر الإعلاني فوراً 🚀
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {banners.map(b => (
                <div key={b.id} className="bg-[#0e0e0e] border border-white/5 rounded-sm overflow-hidden flex flex-col justify-between">
                  {b.videoUrl ? (
                    (b.videoUrl.includes('youtube.com') || b.videoUrl.includes('youtu.be')) ? (
                      <iframe src={`https://www.youtube.com/embed/${b.videoUrl.includes('youtu.be') ? b.videoUrl.split('/').pop()?.split('?')[0] : new URL(b.videoUrl).searchParams.get('v') || ''}?mute=1&loop=1&controls=0`} className="w-full aspect-[3/1] object-cover" allow="encrypted-media" frameBorder="0" />
                    ) : (
                      <video src={b.videoUrl} className="w-full aspect-[3/1] object-cover" muted loop autoPlay />
                    )
                  ) : (
                    <img src={b.image} alt="" className="w-full aspect-[3/1] object-cover opacity-60" referrerPolicy="no-referrer" />
                  )}
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white text-xs">{b.title}</h4>
                      <p className="text-[10px] text-white/40 mt-1">الوجهة: {b.linkType} ({b.linkValue})</p>
                      {b.videoUrl && <span className="text-[9px] text-[#D4AF37] mt-1 block">🎬 يحتوي فيديو</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleBanner(b.id)}
                        className={`text-[10px] px-2 py-1 rounded-sm font-bold cursor-pointer ${b.active ? 'bg-green-600/20 text-green-400' : 'bg-white/5 text-white/30'}`}
                      >
                        {b.active ? 'نشط' : 'متوقف'}
                      </button>
                      <button onClick={() => handleDeleteBanner(b.id)} className="p-1.5 text-white/40 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 10. ADS SYSTEM */}
        {activeTab === 'ads' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-black text-[#D4AF37]">الحملات الإعلانية الممولة والمؤشرات 📈</h2>
              <p className="text-xs text-white/40 mt-1">تتبع أداء الإعلانات الممولة للمحلات، وتدشين حملات إعلانية إضافية لزيادة ترافيك المتاجر.</p>
            </div>

            <form onSubmit={handleCreateAd} className="bg-[#0e0e0e] border border-white/5 p-6 rounded-sm space-y-4 max-w-xl">
              <span className="text-xs font-black text-[#D4AF37] block">إنشاء وتدشين حملة ممولة جديدة</span>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="عنوان الإعلان"
                  value={adTitle}
                  onChange={(e) => setAdTitle(e.target.value)}
                  className="bg-black border border-white/10 rounded-sm py-2 px-3 text-xs text-white focus:outline-none"
                  required
                />
                <select
                  value={adStore}
                  onChange={(e) => setAdStore(e.target.value)}
                  className="bg-black border border-white/10 rounded-sm py-2 px-3 text-xs text-white focus:outline-none cursor-pointer"
                  required
                >
                  <option value="">اختر المتجر المستهدف</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full py-2 bg-[#D4AF37] text-black hover:bg-white hover:text-black transition-all font-bold text-xs rounded-sm cursor-pointer">
                إطلاق الحملة المروجة للمتجر 🚀
              </button>
            </form>

            <div className="bg-[#0e0e0e] border border-white/5 rounded-sm overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-white/5 text-white/60 border-b border-white/5">
                  <tr>
                    <th className="p-4">الحملة الإعلانية</th>
                    <th className="p-4">المتجر</th>
                    <th className="p-4">عدد المشاهدات</th>
                    <th className="p-4">النقرات</th>
                    <th className="p-4">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {ads.map(ad => (
                    <tr key={ad.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-bold text-white">{ad.title}</td>
                      <td className="p-4 text-[#D4AF37]">{stores.find(s => s.id === ad.storeId)?.name || 'متجر'}</td>
                      <td className="p-4 font-mono">{ad.views} مشاهدة</td>
                      <td className="p-4 font-mono text-green-400">{ad.clicks} نقرة</td>
                      <td className="p-4">
                        <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-sm text-[9px] font-black">نشطة ومروجة</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 11. COMPREHENSIVE PLATFORM EDITOR (Identity, Colors, Code, Navigation, Content) */}
        {activeTab === 'theme-editor' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-black text-[#D4AF37]">محرر المنصة الشامل - هوية، ألوان، كود، قوائم، محتوى 🎨</h2>
              <p className="text-xs text-white/40 mt-1">غيّر كل شيء في المنصة بدون برمجة: الشعار، الألوان، الخلفيات المتحركة، القوائم، الروابء والمحتوى.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* SECTION 1: PLATFORM IDENTITY */}
              <div className="bg-[#0e0e0e] border border-white/5 p-6 rounded-sm space-y-4">
                <span className="text-xs font-black text-[#D4AF37] block border-b border-white/5 pb-2">🔤 هوية المنصة (Platform Identity)</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 text-[10px] mb-1">اسم المنصة الرسمي (Platform Name)</label>
                    <input type="text" value={platformName} onChange={(e) => setPlatformName(e.target.value)} className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-xs text-white" />
                  </div>
                  <div>
                    <label className="block text-white/60 text-[10px] mb-1">عنوان التبويب (Site Title / Browser Tab)</label>
                    <input type="text" value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-xs text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/60 text-[10px] mb-1">شعار المنصة</label>
                    {platformLogo ? (
                      <div className="relative">
                        <img src={platformLogo} alt="" className="w-16 h-16 object-cover rounded-sm border border-white/10" />
                        <button type="button" onClick={() => setPlatformLogo('')}
                          className="absolute -top-1 -left-1 bg-black/80 text-red-400 text-[9px] w-4 h-4 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600 hover:text-white">×</button>
                      </div>
                    ) : (
                      <label className="block border-2 border-dashed border-white/10 hover:border-[#D4AF37]/40 rounded-sm p-4 text-center cursor-pointer transition-colors">
                        <div className="text-[#D4AF37] text-lg mb-1">🖼️</div>
                        <p className="text-white/40 text-[10px]">اضغط لرفع شعار المنصة</p>
                        <input type="file" accept="image/*" className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]; if (!file) return;
                            const reader = new FileReader();
                            reader.onload = async (ev) => {
                              const compressed = await compressBase64(ev.target?.result as string, 400, 400, 0.8);
                              setPlatformLogo(compressed);
                            };
                            reader.readAsDataURL(file);
                          }} />
                      </label>
                    )}
                    <input type="text" value={platformLogo.startsWith('data:') ? '' : platformLogo} onChange={(e) => setPlatformLogo(e.target.value)}
                      placeholder="أو الصق رابط الصورة"
                      className="w-full bg-black border border-white/10 rounded-sm py-1.5 px-3 text-[10px] text-white/50 font-mono mt-2 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-white/60 text-[10px] mb-1">أيقونة التبويب (Favicon URL)</label>
                    <input type="text" value={faviconUrl} onChange={(e) => setFaviconUrl(e.target.value)} placeholder="اترك فارغاً للافتراضي" className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-xs text-white font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block text-white/60 text-[10px] mb-1">وصف الموقع (Meta Description)</label>
                  <textarea value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} rows={2} className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-xs text-white" />
                </div>
                <div>
                  <label className="block text-white/60 text-[10px] mb-1">الكلمات المفتاحية (Meta Keywords)</label>
                  <input type="text" value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)} className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-xs text-white" />
                </div>
              </div>

              {/* SECTION 2: BRAND COLORS */}
              <div className="bg-[#0e0e0e] border border-white/5 p-6 rounded-sm space-y-4">
                <span className="text-xs font-black text-[#D4AF37] block border-b border-white/5 pb-2">🎨 ألوان المنصة (Platform Colors)</span>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-white/60 text-[10px] mb-1">اللون الأساسي (Primary)</label>
                    <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="w-full bg-black border border-white/10 rounded-sm h-10 p-1 cursor-pointer" />
                    <input type="text" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="w-full bg-black border border-white/10 rounded-sm mt-1 py-1 px-2 text-[10px] text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-white/60 text-[10px] mb-1">اللون الثانوي (Secondary)</label>
                    <input type="color" value={platformSecondaryColor} onChange={(e) => setPlatformSecondaryColor(e.target.value)} className="w-full bg-black border border-white/10 rounded-sm h-10 p-1 cursor-pointer" />
                    <input type="text" value={platformSecondaryColor} onChange={(e) => setPlatformSecondaryColor(e.target.value)} className="w-full bg-black border border-white/10 rounded-sm mt-1 py-1 px-2 text-[10px] text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-white/60 text-[10px] mb-1">خلفية (Background)</label>
                    <input type="color" value={platformBackgroundColor} onChange={(e) => setPlatformBackgroundColor(e.target.value)} className="w-full bg-black border border-white/10 rounded-sm h-10 p-1 cursor-pointer" />
                    <input type="text" value={platformBackgroundColor} onChange={(e) => setPlatformBackgroundColor(e.target.value)} className="w-full bg-black border border-white/10 rounded-sm mt-1 py-1 px-2 text-[10px] text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-white/60 text-[10px] mb-1">لون الإطارات (Frame)</label>
                    <input type="color" value={platformFrameColor} onChange={(e) => setPlatformFrameColor(e.target.value)} className="w-full bg-black border border-white/10 rounded-sm h-10 p-1 cursor-pointer" />
                    <input type="text" value={platformFrameColor} onChange={(e) => setPlatformFrameColor(e.target.value)} className="w-full bg-black border border-white/10 rounded-sm mt-1 py-1 px-2 text-[10px] text-white font-mono" />
                  </div>
                  <div>
                    <label className="block text-white/60 text-[10px] mb-1">لون النصوص (Text)</label>
                    <input type="color" value={platformTextColor} onChange={(e) => setPlatformTextColor(e.target.value)} className="w-full bg-black border border-white/10 rounded-sm h-10 p-1 cursor-pointer" />
                    <input type="text" value={platformTextColor} onChange={(e) => setPlatformTextColor(e.target.value)} className="w-full bg-black border border-white/10 rounded-sm mt-1 py-1 px-2 text-[10px] text-white font-mono" />
                  </div>
                </div>
              </div>

              {/* SECTION 3: CUSTOM CODE INJECTION */}
              <div className="bg-[#0e0e0e] border border-white/5 p-6 rounded-sm space-y-4">
                <span className="text-xs font-black text-[#D4AF37] block border-b border-white/5 pb-2">💻 كود مخصص - HTML، CSS، JS (Custom Code Injection)</span>
                <p className="text-[10px] text-white/40">يمكنك إضافة أي كود HTML/CSS/JS مخصص. يستخدم لتزيين الخلفيات المتحركة، إضافة أدوات تحليل، إعلانات، أو أي تخصيص آخر.</p>
                <div>
                  <label className="block text-white/60 text-[10px] mb-1">خلفية متحركة (CSS Animation Background)</label>
                  <textarea value={animatedBackgroundCSS} onChange={(e) => setAnimatedBackgroundCSS(e.target.value)} rows={4} className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-[10px] text-green-400 font-mono" placeholder="/* ضع كود الخلفية المتحركة CSS هنا */" />
                </div>
                <div>
                  <label className="block text-white/60 text-[10px] mb-1">كود CSS مخصص يُحقن في الموقع</label>
                  <textarea value={customCSS} onChange={(e) => setCustomCSS(e.target.value)} rows={5} className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-[10px] text-green-400 font-mono" />
                </div>
                <div>
                  <label className="block text-white/60 text-[10px] mb-1">كود HTML يُحقن في &lt;head&gt; (Header)</label>
                  <textarea value={customHeaderHTML} onChange={(e) => setCustomHeaderHTML(e.target.value)} rows={3} className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-[10px] text-cyan-400 font-mono" />
                </div>
                <div>
                  <label className="block text-white/60 text-[10px] mb-1">كود HTML يُحقن قبل &lt;/body&gt; (Footer)</label>
                  <textarea value={customFooterHTML} onChange={(e) => setCustomFooterHTML(e.target.value)} rows={3} className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-[10px] text-cyan-400 font-mono" />
                </div>
              </div>

              {/* SECTION 4: NAVIGATION LINKS */}
              <div className="bg-[#0e0e0e] border border-white/5 p-6 rounded-sm space-y-4">
                <span className="text-xs font-black text-[#D4AF37] block border-b border-white/5 pb-2">🔗 روابط القوائم (Navigation Links)</span>
                <span className="text-[10px] text-white/50">روابط القائمة العلوية (Header Navigation):</span>
                {navLinks.map((link, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-1 text-white/40 text-[10px] font-mono">{link.order}</div>
                    <input type="text" value={link.label} onChange={(e) => { const c = [...navLinks]; c[idx] = { ...c[idx], label: e.target.value }; setNavLinks(c); }} placeholder="التسمية" className="col-span-4 bg-black border border-white/10 rounded-sm py-1.5 px-2 text-xs text-white" />
                    <input type="text" value={link.url} onChange={(e) => { const c = [...navLinks]; c[idx] = { ...c[idx], url: e.target.value }; setNavLinks(c); }} placeholder="الرابط" className="col-span-5 bg-black border border-white/10 rounded-sm py-1.5 px-2 text-xs text-white font-mono" />
                    <button type="button" onClick={() => setNavLinks(navLinks.filter((_, i) => i !== idx))} className="col-span-1 p-1.5 bg-red-900/20 text-red-400 rounded-sm hover:bg-red-900/40 cursor-pointer text-xs">✕</button>
                    <button type="button" onClick={() => { if (idx > 0) { const c = [...navLinks]; [c[idx-1], c[idx]] = [c[idx], c[idx-1]]; setNavLinks(c); } }} className="col-span-1 p-1.5 bg-white/5 text-white/40 rounded-sm hover:bg-white/10 cursor-pointer text-xs">↑</button>
                  </div>
                ))}
                <button type="button" onClick={() => setNavLinks([...navLinks, { label: '', url: '', order: navLinks.length + 1 }])} className="w-full py-1.5 border border-dashed border-white/10 rounded-sm text-[10px] text-white/40 hover:text-white hover:border-white/30 transition-all cursor-pointer">+ إضافة رابط قائمة</button>

                <span className="text-[10px] text-white/50 mt-4 block">روابط الفوتر (Footer Links):</span>
                {footerLinks.map((link, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-1 text-white/40 text-[10px] font-mono">{link.order}</div>
                    <input type="text" value={link.label} onChange={(e) => { const c = [...footerLinks]; c[idx] = { ...c[idx], label: e.target.value }; setFooterLinks(c); }} className="col-span-4 bg-black border border-white/10 rounded-sm py-1.5 px-2 text-xs text-white" />
                    <input type="text" value={link.url} onChange={(e) => { const c = [...footerLinks]; c[idx] = { ...c[idx], url: e.target.value }; setFooterLinks(c); }} className="col-span-5 bg-black border border-white/10 rounded-sm py-1.5 px-2 text-xs text-white font-mono" />
                    <button type="button" onClick={() => setFooterLinks(footerLinks.filter((_, i) => i !== idx))} className="col-span-1 p-1.5 bg-red-900/20 text-red-400 rounded-sm hover:bg-red-900/40 cursor-pointer text-xs">✕</button>
                    <button type="button" onClick={() => { if (idx > 0) { const c = [...footerLinks]; [c[idx-1], c[idx]] = [c[idx], c[idx-1]]; setFooterLinks(c); } }} className="col-span-1 p-1.5 bg-white/5 text-white/40 rounded-sm hover:bg-white/10 cursor-pointer text-xs">↑</button>
                  </div>
                ))}
                <button type="button" onClick={() => setFooterLinks([...footerLinks, { label: '', url: '', order: footerLinks.length + 1 }])} className="w-full py-1.5 border border-dashed border-white/10 rounded-sm text-[10px] text-white/40 hover:text-white hover:border-white/30 transition-all cursor-pointer">+ إضافة رابط فوتر</button>

                <span className="text-[10px] text-white/50 mt-4 block">روابط التواصل الاجتماعي (Social Links):</span>
                {socialLinks.map((link, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <input type="text" value={link.icon} onChange={(e) => { const c = [...socialLinks]; c[idx] = { ...c[idx], icon: e.target.value }; setSocialLinks(c); }} placeholder="أيقونة" className="col-span-1 bg-black border border-white/10 rounded-sm py-1.5 px-1 text-xs text-white text-center" />
                    <input type="text" value={link.platform} onChange={(e) => { const c = [...socialLinks]; c[idx] = { ...c[idx], platform: e.target.value }; setSocialLinks(c); }} placeholder="المنصة" className="col-span-4 bg-black border border-white/10 rounded-sm py-1.5 px-2 text-xs text-white" />
                    <input type="text" value={link.url} onChange={(e) => { const c = [...socialLinks]; c[idx] = { ...c[idx], url: e.target.value }; setSocialLinks(c); }} placeholder="الرابط" className="col-span-5 bg-black border border-white/10 rounded-sm py-1.5 px-2 text-xs text-white font-mono" />
                    <button type="button" onClick={() => setSocialLinks(socialLinks.filter((_, i) => i !== idx))} className="col-span-1 p-1.5 bg-red-900/20 text-red-400 rounded-sm hover:bg-red-900/40 cursor-pointer text-xs">✕</button>
                    <button type="button" onClick={() => { if (idx > 0) { const c = [...socialLinks]; [c[idx-1], c[idx]] = [c[idx], c[idx-1]]; setSocialLinks(c); } }} className="col-span-1 p-1.5 bg-white/5 text-white/40 rounded-sm hover:bg-white/10 cursor-pointer text-xs">↑</button>
                  </div>
                ))}
                <button type="button" onClick={() => setSocialLinks([...socialLinks, { platform: '', url: '', icon: '🔗' }])} className="w-full py-1.5 border border-dashed border-white/10 rounded-sm text-[10px] text-white/40 hover:text-white hover:border-white/30 transition-all cursor-pointer">+ إضافة رابط تواصل</button>
              </div>

              {/* SECTION 5: PLATFORM CONTENT */}
              <div className="bg-[#0e0e0e] border border-white/5 p-6 rounded-sm space-y-4">
                <span className="text-xs font-black text-[#D4AF37] block border-b border-white/5 pb-2">📄 محتوى المنصة (Platform Content)</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-white/60 text-[10px] mb-1">نص "عن المنصة" (About Us)</label>
                    <textarea value={aboutText} onChange={(e) => setAboutText(e.target.value)} rows={3} className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-xs text-white" />
                  </div>
                  <div>
                    <label className="block text-white/60 text-[10px] mb-1">البريد الإلكتروني للتواصل</label>
                    <input type="text" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-xs text-white" />
                  </div>
                  <div>
                    <label className="block text-white/60 text-[10px] mb-1">رقم الهاتف للتواصل</label>
                    <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-xs text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-white/60 text-[10px] mb-1">العنوان (Address)</label>
                  <input type="text" value={contactAddress} onChange={(e) => setContactAddress(e.target.value)} className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-xs text-white" />
                </div>
                <div>
                  <label className="block text-white/60 text-[10px] mb-1">نص الفوتر السفلي (Footer Copyright)</label>
                  <input type="text" value={footerText} onChange={(e) => setFooterText(e.target.value)} className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-xs text-white" />
                </div>
              </div>

              {/* SAVE BUTTON */}
              <button type="submit" className="w-full py-3 bg-[#D4AF37] text-black hover:bg-white hover:text-black transition-all font-black text-sm rounded-sm cursor-pointer shadow-lg shadow-[#D4AF37]/10">
                💾 حفظ جميع إعدادات المنصة - الهوية، الألوان، الكود، القوائم، المحتوى
              </button>
            </form>
          </div>
        )}

        {/* 12. STORE PAGES EDITOR / BUILDER */}
        {activeTab === 'store-editor' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-black text-[#D4AF37]">باني ومحرر تصاميم فروع المتاجر 📐</h2>
              <p className="text-xs text-white/40 mt-1">تحديد الهوية الافتراضية لعرض المحلات بالسنتر (بناء كود تخطيطي Grid / List وتحديد الهيدر الفخم).</p>
            </div>

            <div className="p-6 bg-[#0e0e0e] border border-white/5 rounded-sm max-w-xl space-y-4">
              <span className="text-xs font-black text-white block">بناء وتخطيط الصفحة الرئيسية للمحلات</span>
              
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 bg-black border border-[#D4AF37]/50 rounded-sm text-center">
                  <span className="font-bold text-[#D4AF37] block">Luxury Royal Layout</span>
                  <p className="text-[10px] text-white/40 mt-1">تخطيط فخم بخلفية داكنة وتفاصيل ذهبية وبنر غامق (افتراضي)</p>
                </button>
                <button className="p-4 bg-black border border-white/10 rounded-sm text-center opacity-65">
                  <span className="font-bold text-white block">Minimalist Grid Layout</span>
                  <p className="text-[10px] text-white/40 mt-1">تخطيط مبسط أبيض أو رمادي يركز على شبكات صور المنتجات فقط</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 12-B. STORE TEMPLATES (ZIP UPLOAD) */}
        {activeTab === 'templates' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-black text-[#D4AF37]">قوالب المتاجر عبر رفع ملف ZIP 📦</h2>
              <p className="text-xs text-white/40 mt-1">ارفع ملف ZIP يحتوي على <b>template.json</b> (إعدادات التصميم) وأي صور (logo/cover). سيتم فك الضغط تلقائياً وتظهر القوالب هنا للتطبيق الفوري على أي متجر.</p>
            </div>

            {/* Upload */}
            <div className="bg-[#0e0e0e] border border-white/5 p-6 rounded-sm max-w-xl space-y-3">
              <span className="text-xs font-black text-white block">رفع ملف قالب (ZIP)</span>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept=".zip,application/zip"
                  onChange={async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (!file) return;
                    setIsUploadingTemplate(true);
                    try {
                      const zip = await JSZip.loadAsync(file);
                      // Collect all image files inside the ZIP (any folder, any case)
                      const images: { name: string; data: string }[] = [];
                      const isImg = (p: string) => /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(p);
                      zip.forEach((path: string, entry: any) => {
                        if (!entry.dir && isImg(path)) images.push({ name: path, data: '' });
                      });
                      const readImg = async (rel: string): Promise<string> => {
                        let f: any = null;
                        const clean = rel.replace(/^\.?\//, '').toLowerCase();
                        zip.forEach((path: string, entry: any) => {
                          if (!f && !entry.dir && path.replace(/^\.?\//, '').toLowerCase() === clean) f = entry;
                        });
                        if (!f) return '';
                        const b64 = await f.async('base64');
                        const ext = (rel.split('.').pop() || 'png').toLowerCase();
                        const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : ext === 'gif' ? 'image/gif' : 'image/png';
                        return `data:${mime};base64,${b64}`;
                      };
                      // template.json is OPTIONAL. If present, use its config.
                      let cfg: any = {};
                      let tplFile: any = null;
                      zip.forEach((path: string, entry: any) => {
                        if (!tplFile && !entry.dir && path.toLowerCase().endsWith('template.json')) tplFile = entry;
                      });
                      if (tplFile) {
                        try { cfg = JSON.parse(await tplFile.async('string')); } catch { cfg = {}; }
                      }
                      const name = cfg.name || file.name.replace(/\.zip$/i, '');
                      // Auto-read images as logo/cover (first = cover, second = logo)
                      let logo = ''; let cover = '';
                      if (images.length > 0) cover = await readImg(images[0].name);
                      if (images.length > 1) logo = await readImg(images[1].name);
                      else logo = cover;
                      if (cfg.logo) { const l = await readImg(cfg.logo); if (l) logo = l; }
                      if (cfg.cover) { const c = await readImg(cfg.cover); if (c) cover = c; }
                      const tpl = {
                        id: `tpl-${Date.now()}`,
                        name,
                        visualTemplate: cfg.visualTemplate || 'multicategory',
                        layoutType: cfg.layoutType || 'luxury',
                        themeColor: cfg.themeColor || { primary: '#D4AF37', secondary: '#111111', background: '#0B0B0B' },
                        description: cfg.description || (images.length ? `قَالب من ${images.length} صورة` : 'قَالب عام'),
                        logo: logo,
                        cover: cover
                      };
                      const updated = [...templates, tpl];
                      setTemplates(updated);
                      localStorage.setItem('mix_templates', JSON.stringify(updated));
                      window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_templates' } }));
                      await logSystemActivity('رفع قالب متجر', `تمت إضافة قالب "${name}" عبر ZIP`);
                      alert(`✅ تم فك الضغط وإضافة القالب "${name}" بنجاح!`);
                    } catch (err: any) {
                      console.error(err);
                      alert('❌ تعذرت معالجة ملف ZIP: ' + (err?.message || err));
                    } finally {
                      setIsUploadingTemplate(false);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                  className="block w-full text-xs text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-[#D4AF37] file:text-black file:font-bold file:cursor-pointer"
                />
                {isUploadingTemplate && <span className="text-[10px] text-amber-400">جارٍ فك الضغط...</span>}
              </div>
              <div className="text-[10px] text-white/30 leading-relaxed">
                <b className="text-white/60">ملف template.json اختياري الآن.</b> ارفع أي ZIP فيه صور (png/jpg/webp) — سيتم إنشاء قالب تلقائياً من الصور (أول صورة = غلاف، الثانية = شعار). ويمكنك إضافة template.json لألوان وتفاصيل دقيقة.<br/>
                <code className="text-[#D4AF37]">{'{ "name": "القالي الذهبي", "visualTemplate": "luxury", "layoutType": "luxury", "logo": "logo.png", "cover": "cover.png", "themeColor": { "primary": "#D4AF37", "background": "#0B0B0B" } }'}</code>
              </div>
            </div>

            {/* Apply template to a store */}
            <div className="bg-[#0e0e0e] border border-white/5 p-6 rounded-sm max-w-xl space-y-3">
              <span className="text-xs font-black text-white block">تطبيق قالب على متجر (يظهر فوراً)</span>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={templateApplyStore}
                  onChange={(e) => setTemplateApplyStore(e.target.value)}
                  className="bg-black border border-white/10 rounded-sm py-2 px-3 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="">-- اختر متجراً --</option>
                  {stores.map((s: StoreType) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <select
                  value={templateApplyId}
                  onChange={(e) => setTemplateApplyId(e.target.value)}
                  className="bg-black border border-white/10 rounded-sm py-2 px-3 text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="">-- اختر قالباً --</option>
                  {templates.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    if (!templateApplyStore) { alert('اختر متجراً أولاً'); return; }
                    const tpl = templates.find((t: any) => t.id === templateApplyId) || templates[templates.length - 1];
                    if (!tpl) { alert('ارفع قالباً أولاً'); return; }
                    const cur = JSON.parse(localStorage.getItem('mix_stores') || '[]');
                    const idx = cur.findIndex((x: any) => x.id === templateApplyStore);
                    if (idx < 0) { alert('المتجر غير موجود'); return; }
                    cur[idx] = {
                      ...cur[idx],
                      visualTemplate: tpl.visualTemplate,
                      layoutType: tpl.layoutType,
                      themeColor: tpl.themeColor,
                      ...(tpl.logo ? { logo: tpl.logo } : {}),
                      ...(tpl.cover ? { cover: tpl.cover } : {})
                    };
                    localStorage.setItem('mix_stores', JSON.stringify(cur));
                    setStores(cur);
                    window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_stores' } }));
                    onEnterStoreDashboard?.(templateApplyStore);
                    alert(`✅ تم تطبيق القالب "${tpl.name}" على "${cur[idx].name}" فوراً`);
                  }}
                  className="bg-[#D4AF37] text-black hover:bg-white hover:text-black transition-all font-bold text-xs rounded-sm cursor-pointer"
                >
                  طبّق آخر قالب مرفوع
                </button>
              </div>
            </div>

            {/* Templates list */}
            <div className="space-y-3">
              <span className="text-xs font-black text-white/80 block">القوالب المرفوعة ({templates.length})</span>
              {templates.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-zinc-800 rounded-2xl">
                  <p className="text-zinc-400 text-sm">لا توجد قوالب بعد. ارفع ملف ZIP للبدء.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((t: any) => (
                    <div key={t.id} className="bg-[#0e0e0e] border border-white/5 rounded-2xl overflow-hidden">
                      {t.cover ? (
                        <img src={t.cover} alt={t.name} className="w-full h-32 object-cover" />
                      ) : (
                        <div className="w-full h-32 bg-gradient-to-br from-[#D4AF37]/30 to-black" />
                      )}
                      <div className="p-4 space-y-1">
                        <h3 className="text-white font-bold text-sm">{t.name}</h3>
                        <p className="text-[10px] text-zinc-400">النمط: {t.visualTemplate} · {t.layoutType}</p>
                        {t.description && <p className="text-[10px] text-zinc-500">{t.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TEMPLATE SETTINGS - Customizable Store Templates */}
        {activeTab === 'template-settings' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-black text-[#D4AF37]">قوالب المتاجر القابلة للتعديل 🎨</h2>
              <p className="text-xs text-white/40 mt-1">تعديل الألوان، الخطوء الإنيميشن، التخطيء العناوين، خدمات الصيانة والمميزات لكل قالب. أي تاجر يختار نوع المتجر يحصل على القالب تلقائياً.</p>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {storeTemplates.map((tpl: any) => (
                <div key={tpl.id} className="bg-[#0e0e0e] border border-white/5 rounded-2xl overflow-hidden hover:border-[#D4AF37]/30 transition-all">
                  {/* Color Preview Bar */}
                  <div className="h-3 flex">
                    <div className="flex-1" style={{ backgroundColor: tpl.colors.primary }} />
                    <div className="flex-1" style={{ backgroundColor: tpl.colors.secondary }} />
                    <div className="flex-1" style={{ backgroundColor: tpl.colors.accent }} />
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-bold text-sm">{tpl.name}</h3>
                        <p className="text-[10px] text-zinc-400">التصنيف: {tpl.category} · البطاقات: {tpl.layout.cardStyle}</p>
                      </div>
                      <span className="text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded-full font-bold">
                        {tpl.id === 'tpl-phone-repair' ? 'صيانة' : 'أزياء'}
                      </span>
                    </div>

                    {/* Quick Info */}
                    <div className="flex flex-wrap gap-1.5">
                      {tpl.animations.neonEffect && <span className="text-[9px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded">Neon</span>}
                      {tpl.animations.glowEnabled && <span className="text-[9px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded">Glow</span>}
                      {tpl.layout.showRepairServices && <span className="text-[9px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded">صيانة</span>}
                      {tpl.layout.showCategoriesBar && <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded">أقسام</span>}
                    </div>

                    <button
                      onClick={() => setEditingTemplate(editingTemplate?.id === tpl.id ? null : tpl)}
                      className="w-full py-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] font-bold text-[11px] rounded-lg transition-all cursor-pointer border border-[#D4AF37]/20"
                    >
                      {editingTemplate?.id === tpl.id ? 'إغلاق المحرر ✕' : 'تعديل القالب ✏️'}
                    </button>
                  </div>

                  {/* Expanded Editor */}
                  {editingTemplate?.id === tpl.id && (
                    <div className="border-t border-white/5 p-4 space-y-4 bg-black/40">
                      {/* Sub-tabs */}
                      <div className="flex gap-1 overflow-x-auto pb-1">
                        {(['colors', 'fonts', 'animations', 'layout', 'branding', 'services', 'features'] as const).map(tab => (
                          <button
                            key={tab}
                            onClick={() => setEditTemplateTab(tab)}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                              editTemplateTab === tab
                                ? 'bg-[#D4AF37] text-black'
                                : 'bg-white/5 text-white/50 hover:text-white'
                            }`}
                          >
                            {tab === 'colors' ? '🎨 الألوان' : tab === 'fonts' ? '📝 الخطوط' : tab === 'animations' ? '✨ الإنيميشن' : tab === 'layout' ? '📐 التخطيط' : tab === 'branding' ? '🏷️ الهوية' : tab === 'services' ? '🛠️ الخدمات' : '⭐ المميزات'}
                          </button>
                        ))}
                      </div>

                      {/* Colors Tab */}
                      {editTemplateTab === 'colors' && (
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(editingTemplate.colors).map(([key, val]) => (
                            <div key={key}>
                              <label className="block text-white/50 text-[9px] mb-1 font-bold">{key}</label>
                              <div className="flex gap-2 items-center">
                                <input
                                  type="color"
                                  value={val as string}
                                  onChange={(e) => {
                                    const updated = { ...editingTemplate, colors: { ...editingTemplate.colors, [key]: e.target.value } };
                                    setEditingTemplate(updated);
                                  }}
                                  className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                                />
                                <input
                                  type="text"
                                  value={val as string}
                                  onChange={(e) => {
                                    const updated = { ...editingTemplate, colors: { ...editingTemplate.colors, [key]: e.target.value } };
                                    setEditingTemplate(updated);
                                  }}
                                  className="flex-1 bg-black border border-white/10 rounded py-1 px-2 text-[10px] text-white font-mono focus:outline-none"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Fonts Tab */}
                      {editTemplateTab === 'fonts' && (
                        <div className="space-y-3">
                          {['heading', 'body'].map(key => (
                            <div key={key}>
                              <label className="block text-white/50 text-[9px] mb-1 font-bold">{key === 'heading' ? 'خط العناوين' : 'خط النصوص'}</label>
                              <select
                                value={editingTemplate.fonts[key]}
                                onChange={(e) => {
                                  const updated = { ...editingTemplate, fonts: { ...editingTemplate.fonts, [key]: e.target.value } };
                                  setEditingTemplate(updated);
                                }}
                                className="w-full bg-black border border-white/10 rounded py-2 px-3 text-xs text-white focus:outline-none cursor-pointer"
                              >
                                {['Cairo', 'Tajawal', 'Almarai', 'Amiri', 'Changa', 'Alexandria', 'Inter'].map(f => (
                                  <option key={f} value={f}>{f}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Animations Tab */}
                      {editTemplateTab === 'animations' && (
                        <div className="space-y-2">
                          {['glowEnabled', 'pulseEnabled', 'slideEnabled', 'hoverScale', 'neonEffect'].map(key => (
                            <label key={key} className="flex items-center justify-between p-2 bg-white/5 rounded-lg cursor-pointer">
                              <span className="text-[11px] text-white/70 font-bold">
                                {key === 'glowEnabled' ? 'تفعيل التوهج (Glow)' : key === 'pulseEnabled' ? 'النبض (Pulse)' : key === 'slideEnabled' ? 'الانزلاق (Slide)' : key === 'hoverScale' ? 'تكبير عند المرور' : 'التأثير النيوني'}
                              </span>
                              <div
                                onClick={() => {
                                  const updated = { ...editingTemplate, animations: { ...editingTemplate.animations, [key]: !editingTemplate.animations[key] } };
                                  setEditingTemplate(updated);
                                }}
                                className={`w-10 h-5 rounded-full transition-all cursor-pointer relative ${editingTemplate.animations[key] ? 'bg-[#D4AF37]' : 'bg-zinc-700'}`}
                              >
                                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${editingTemplate.animations[key] ? 'right-0.5' : 'right-5'}`} />
                              </div>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* Layout Tab */}
                      {editTemplateTab === 'layout' && (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-white/50 text-[9px] mb-1 font-bold">نمط البطاقات</label>
                            <select
                              value={editingTemplate.layout.cardStyle}
                              onChange={(e) => {
                                const updated = { ...editingTemplate, layout: { ...editingTemplate.layout, cardStyle: e.target.value } };
                                setEditingTemplate(updated);
                              }}
                              className="w-full bg-black border border-white/10 rounded py-2 px-3 text-xs text-white focus:outline-none cursor-pointer"
                            >
                              <option value="neon">نيون (Neon)</option>
                              <option value="glass">زجاجي (Glass)</option>
                              <option value="solid">صلب (Solid)</option>
                              <option value="minimal">بسيط (Minimal)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-white/50 text-[9px] mb-1 font-bold">عدد أعمدة الشبكة</label>
                            <select
                              value={editingTemplate.layout.gridCols}
                              onChange={(e) => {
                                const updated = { ...editingTemplate, layout: { ...editingTemplate.layout, gridCols: parseInt(e.target.value) } };
                                setEditingTemplate(updated);
                              }}
                              className="w-full bg-black border border-white/10 rounded py-2 px-3 text-xs text-white focus:outline-none cursor-pointer"
                            >
                              {[2, 3, 4, 5].map(n => <option key={n} value={n}>{n} أعمدة</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-white/50 text-[9px] mb-1 font-bold">أقسام الصفحة</label>
                            <div className="space-y-1">
                              {['showCategoriesBar', 'showSearchBar', 'showRepairServices', 'showFeatures', 'showReviews', 'showAbout'].map(key => (
                                <label key={key} className="flex items-center justify-between p-1.5 bg-white/5 rounded cursor-pointer">
                                  <span className="text-[10px] text-white/60">
                                    {key === 'showCategoriesBar' ? 'شريط الأقسام' : key === 'showSearchBar' ? 'شريط البحث' : key === 'showRepairServices' ? 'خدمات الصيانة' : key === 'showFeatures' ? 'المميزات' : key === 'showReviews' ? 'التقييمات' : 'معلومات التواصل'}
                                  </span>
                                  <div
                                    onClick={() => {
                                      const updated = { ...editingTemplate, layout: { ...editingTemplate.layout, [key]: !editingTemplate.layout[key] } };
                                      setEditingTemplate(updated);
                                    }}
                                    className={`w-8 h-4 rounded-full transition-all cursor-pointer relative ${editingTemplate.layout[key] ? 'bg-[#D4AF37]' : 'bg-zinc-700'}`}
                                  >
                                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${editingTemplate.layout[key] ? 'right-0.5' : 'right-4.5'}`} />
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Branding Tab */}
                      {editTemplateTab === 'branding' && (
                        <div className="space-y-3">
                          {[
                            { key: 'tagline', label: 'الشعار الفرعي' },
                            { key: 'subtitle', label: 'الوصف' },
                            { key: 'heroTitle', label: 'عنوان البانر الرئيسي' },
                            { key: 'heroSubtitle', label: 'وصف البانر' },
                            { key: 'ctaText', label: 'نص زر الدعوة للإجراء' },
                            { key: 'trustedBadge', label: 'شارة الثقة' },
                          ].map(field => (
                            <div key={field.key}>
                              <label className="block text-white/50 text-[9px] mb-1 font-bold">{field.label}</label>
                              <input
                                type="text"
                                value={editingTemplate.branding[field.key]}
                                onChange={(e) => {
                                  const updated = { ...editingTemplate, branding: { ...editingTemplate.branding, [field.key]: e.target.value } };
                                  setEditingTemplate(updated);
                                }}
                                className="w-full bg-black border border-white/10 rounded py-2 px-3 text-xs text-white focus:outline-none"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Services Tab (Phone Repair) */}
                      {editTemplateTab === 'services' && (
                        <div className="space-y-3">
                          {editingTemplate.repairServices.map((srv: any, idx: number) => (
                            <div key={srv.id} className="p-3 bg-white/5 rounded-lg space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-white/50 font-bold">خدمة #{idx + 1}</span>
                                <button
                                  onClick={() => {
                                    const updated = { ...editingTemplate, repairServices: editingTemplate.repairServices.filter((_: any, i: number) => i !== idx) };
                                    setEditingTemplate(updated);
                                  }}
                                  className="text-red-400 hover:text-red-300 text-[10px] cursor-pointer"
                                >
                                  حذف ✕
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  placeholder="العنوان"
                                  value={srv.title}
                                  onChange={(e) => {
                                    const services = [...editingTemplate.repairServices];
                                    services[idx] = { ...services[idx], title: e.target.value };
                                    setEditingTemplate({ ...editingTemplate, repairServices: services });
                                  }}
                                  className="bg-black border border-white/10 rounded py-1.5 px-2 text-[10px] text-white focus:outline-none"
                                />
                                <input
                                  placeholder="الأيقونة (إيموجي)"
                                  value={srv.icon}
                                  onChange={(e) => {
                                    const services = [...editingTemplate.repairServices];
                                    services[idx] = { ...services[idx], icon: e.target.value };
                                    setEditingTemplate({ ...editingTemplate, repairServices: services });
                                  }}
                                  className="bg-black border border-white/10 rounded py-1.5 px-2 text-[10px] text-white focus:outline-none"
                                />
                              </div>
                              <input
                                placeholder="الوصف"
                                value={srv.desc}
                                onChange={(e) => {
                                  const services = [...editingTemplate.repairServices];
                                  services[idx] = { ...services[idx], desc: e.target.value };
                                  setEditingTemplate({ ...editingTemplate, repairServices: services });
                                }}
                                className="w-full bg-black border border-white/10 rounded py-1.5 px-2 text-[10px] text-white focus:outline-none"
                              />
                              <input
                                type="number"
                                placeholder="السعر"
                                value={srv.price}
                                onChange={(e) => {
                                  const services = [...editingTemplate.repairServices];
                                  services[idx] = { ...services[idx], price: parseInt(e.target.value) || 0 };
                                  setEditingTemplate({ ...editingTemplate, repairServices: services });
                                }}
                                className="w-full bg-black border border-white/10 rounded py-1.5 px-2 text-[10px] text-white focus:outline-none"
                              />
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const newSrv = { id: `rs-${Date.now()}`, title: 'خدمة جديدة', desc: 'وصف الخدمة', icon: '🔧', price: 0 };
                              setEditingTemplate({ ...editingTemplate, repairServices: [...editingTemplate.repairServices, newSrv] });
                            }}
                            className="w-full py-2 border border-dashed border-white/20 text-white/40 text-[10px] font-bold rounded-lg hover:border-[#D4AF37]/40 hover:text-[#D4AF37] transition-all cursor-pointer"
                          >
                            + إضافة خدمة صيانة جديدة
                          </button>
                        </div>
                      )}

                      {/* Features Tab */}
                      {editTemplateTab === 'features' && (
                        <div className="space-y-3">
                          {editingTemplate.features.map((feat: any, idx: number) => (
                            <div key={feat.id} className="p-3 bg-white/5 rounded-lg space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-white/50 font-bold">ميزة #{idx + 1}</span>
                                <button
                                  onClick={() => {
                                    const updated = { ...editingTemplate, features: editingTemplate.features.filter((_: any, i: number) => i !== idx) };
                                    setEditingTemplate(updated);
                                  }}
                                  className="text-red-400 hover:text-red-300 text-[10px] cursor-pointer"
                                >
                                  حذف ✕
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  placeholder="العنوان"
                                  value={feat.title}
                                  onChange={(e) => {
                                    const features = [...editingTemplate.features];
                                    features[idx] = { ...features[idx], title: e.target.value };
                                    setEditingTemplate({ ...editingTemplate, features });
                                  }}
                                  className="bg-black border border-white/10 rounded py-1.5 px-2 text-[10px] text-white focus:outline-none"
                                />
                                <input
                                  placeholder="الأيقونة (إيموجي)"
                                  value={feat.icon}
                                  onChange={(e) => {
                                    const features = [...editingTemplate.features];
                                    features[idx] = { ...features[idx], icon: e.target.value };
                                    setEditingTemplate({ ...editingTemplate, features });
                                  }}
                                  className="bg-black border border-white/10 rounded py-1.5 px-2 text-[10px] text-white focus:outline-none"
                                />
                              </div>
                              <input
                                placeholder="الوصف"
                                value={feat.desc}
                                onChange={(e) => {
                                  const features = [...editingTemplate.features];
                                  features[idx] = { ...features[idx], desc: e.target.value };
                                  setEditingTemplate({ ...editingTemplate, features });
                                }}
                                className="w-full bg-black border border-white/10 rounded py-1.5 px-2 text-[10px] text-white focus:outline-none"
                              />
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const newFeat = { id: `feat-${Date.now()}`, title: 'ميزة جديدة', desc: 'وصف الميزة', icon: '⭐' };
                              setEditingTemplate({ ...editingTemplate, features: [...editingTemplate.features, newFeat] });
                            }}
                            className="w-full py-2 border border-dashed border-white/20 text-white/40 text-[10px] font-bold rounded-lg hover:border-[#D4AF37]/40 hover:text-[#D4AF37] transition-all cursor-pointer"
                          >
                            + إضافة ميزة جديدة
                          </button>
                        </div>
                      )}

                      {/* Save Button */}
                      <button
                        onClick={() => {
                          const updated = storeTemplates.map((t: any) => t.id === editingTemplate.id ? editingTemplate : t);
                          setStoreTemplates(updated);
                          localStorage.setItem('mix_store_templates', JSON.stringify(updated));
                          window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_store_templates' } }));
                          alert(`✅ تم حفظ تعديلات القالب "${editingTemplate.name}" بنجاح!`);
                        }}
                        className="w-full py-2.5 bg-[#D4AF37] text-black hover:bg-white transition-all font-bold text-xs rounded-lg cursor-pointer"
                      >
                        💾 حفظ تعديلات القالب
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 13. SEARCH ENGINE CONTROL */}
        {activeTab === 'search-control' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-black text-[#D4AF37]">إدارة وضبط محرك البحث الذكي للسنتر 🔍</h2>
              <p className="text-xs text-white/40 mt-1">التحكم في ربط الكلمات البحثية وتوجيه المستخدمين للمتاجر الفخمة مباشرة وتحسين خوارزمية النتائج.</p>
            </div>

            <div className="bg-[#0e0e0e] border border-white/5 p-6 rounded-sm max-w-xl space-y-4">
              <div>
                <label className="block text-white/60 text-[10px] mb-1">المرادفات وخوارزمية المطابقة (Synonyms Dictionary)</label>
                <textarea
                  value={synonyms}
                  onChange={(e) => setSynonyms(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-xs text-white focus:outline-none font-mono h-24"
                />
              </div>

              <div>
                <label className="block text-white/60 text-[10px] mb-1">القسم المميز الأحق بالظهور أعلى نتائج البحث (Category Boost)</label>
                <input
                  type="text"
                  value={boostCategory}
                  onChange={(e) => setBoostCategory(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-xs text-white focus:outline-none"
                />
              </div>

              <button className="w-full py-2 bg-[#D4AF37] text-black hover:bg-white hover:text-black transition-all font-bold text-xs rounded-sm cursor-pointer">
                تحديث خوارزمية البحث المطور للسنتر
              </button>
            </div>
          </div>
        )}

        {/* 14. NOTIFICATIONS SYSTEM */}
        {activeTab === 'notifications' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-black text-[#D4AF37]">بث وإرسال الإشعارات الموحدة بالسنتر 📣</h2>
              <p className="text-xs text-white/40 mt-1">إرسال وبث الإشعارات الترويجية لجميع المتسوقين، أو الشركاء أصحاب المتاجر في وقت واحد.</p>
            </div>

            <form onSubmit={handleSendNotification} className="bg-[#0e0e0e] border border-white/5 p-6 rounded-sm max-w-xl space-y-4">
              <span className="text-xs font-black text-[#D4AF37] block">بث إشعار فوري جديد</span>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="عنوان الإشعار الرئيسي"
                  value={notTitle}
                  onChange={(e) => setNotTitle(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-sm py-2.5 px-3 text-xs text-white focus:outline-none"
                  required
                />
                <textarea
                  placeholder="محتوى الإشعار بالتفصيل"
                  value={notBody}
                  onChange={(e) => setNotBody(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-xs text-white focus:outline-none h-24"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/60 text-[10px] mb-1">الفئة المستهدفة بالبث</label>
                  <select
                    value={notRecipient}
                    onChange={(e) => setNotRecipient(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="all">كافة المستخدمين والعملاء</option>
                    <option value="merchants">الشركاء أصحاب المحلات فقط</option>
                    <option value="shoppers">المشترين النشطين</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-white text-black hover:bg-[#D4AF37] hover:text-white transition-all font-bold text-xs rounded-sm cursor-pointer">
                إرسال وبث الإشعار الآن 🚀
              </button>
            </form>
          </div>
        )}

        {/* 15. ANALYTICS & REPORTS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-black text-[#D4AF37]">التقارير المالية والتحليلات المتقدمة للسنتر 📊</h2>
              <p className="text-xs text-white/40 mt-1">تراقب التحليلات تفاصيل حركة المحلات، الزوار، والسلع الأكثر مبيعاً.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0e0e0e] border border-white/5 p-6 rounded-sm">
                <span className="text-xs font-black text-[#D4AF37] block mb-4">المحلات الأكثر مبيعاً بالسنتر</span>
                <div className="space-y-3">
                  {stores.slice(0, 4).map(s => (
                    <div key={s.id} className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">{s.name}</span>
                      <span className="font-mono text-white/60">{(s.salesCount || 0) * 450} ر.س</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0e0e0e] border border-white/5 p-6 rounded-sm">
                <span className="text-xs font-black text-white block mb-4">أداء السنتر المالي الشهري</span>
                <p className="text-xs text-white/40 leading-relaxed">يرصد التقرير نمو العمليات بنسبة %14.2 مقارنة بالشهر السابق. يمكنك تحميل التقرير المالي المجمع كـ PDF.</p>
                <button className="mt-4 px-4 py-2 bg-[#D4AF37]/10 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-bold text-xs rounded-sm transition-all cursor-pointer">
                  تحميل تقرير التداول الشامل PDF 📥
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 16. SHIPPING MANAGEMENT */}
        {activeTab === 'shipping' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-black text-[#D4AF37]">إدارة شركات الشحن ومناطق التوصيل بالسنتر 🚛</h2>
              <p className="text-xs text-white/40 mt-1">تحديد الشركات الشريكة التي يعتمد عليها التجار لتوصيل شحنات وطلبات المشترين بسلام.</p>
            </div>

            <div className="bg-[#0e0e0e] border border-white/5 rounded-sm overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-white/5 text-white/60 border-b border-white/5">
                  <tr>
                    <th className="p-4">شركة الشحن والتوصيل</th>
                    <th className="p-4">تكلفة التوصيل الافتراضية</th>
                    <th className="p-4">زمن التوصيل المتوقع</th>
                    <th className="p-4">التحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {shippingCompanies.map(sc => (
                    <tr key={sc.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-bold text-white">{sc.name}</td>
                      <td className="p-4 font-mono">{sc.price} ر.س</td>
                      <td className="p-4">{sc.deliveryTime}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleShipping(sc.id)}
                          className={`px-3 py-1 rounded-sm text-[10px] font-bold transition-all cursor-pointer ${
                            sc.active 
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                              : 'bg-white/5 text-white/40 border border-white/5'
                          }`}
                        >
                          {sc.active ? 'شغال ومفعل' : 'موقف مؤقتاً'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 17. ROLES & PERMISSIONS */}
        {activeTab === 'permissions' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-black text-[#D4AF37]">صلاحيات وأدوار المشرفين بالسنتر 🛡️</h2>
              <p className="text-xs text-white/40 mt-1">تحديد الأدوار الوظيفية (مثل دعم فني، محرر عروض) للتحكم الدقيق في صلاحيات نظام MIX.</p>
            </div>

            <div className="bg-[#0e0e0e] border border-white/5 rounded-sm overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-white/5 text-white/60 border-b border-white/5">
                  <tr>
                    <th className="p-4">الاسم الوظيفي للمشرف</th>
                    <th className="p-4">مفتاح الوصول</th>
                    <th className="p-4">الصلاحيات المخولة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {roles.map(r => (
                    <tr key={r.id}>
                      <td className="p-4 font-bold text-white">{r.name}</td>
                      <td className="p-4 font-mono text-amber-500">{r.key}</td>
                      <td className="p-4 flex gap-1 flex-wrap">
                        {r.permissions.map((p: string) => (
                          <span key={p} className="bg-white/5 px-2 py-0.5 rounded-sm text-[9px] font-mono">{p}</span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 18. LOGS & ACTIVITY TRACKING */}
        {activeTab === 'logs' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-black text-[#D4AF37]">سجل النشاطات العملياتي والأمان للسنتر 🛡️</h2>
              <p className="text-xs text-white/40 mt-1">مراقبة فورية وموثقة من قاعدة فاير بيس لكل التعديلات، من فعل ماذا ومتى بالسنتر بالكامل.</p>
            </div>

            <div className="bg-[#0e0e0e] border border-white/5 rounded-sm overflow-hidden">
              <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-white/5 text-white/60 border-b border-white/5 sticky top-0">
                    <tr>
                      <th className="p-4">العملية والحدث</th>
                      <th className="p-4">المستكشف والمنفذ</th>
                      <th className="p-4 font-mono">التفاصيل الكاملة للحدث</th>
                      <th className="p-4 text-left">التاريخ والوقت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {activityLogs.map((log, idx) => (
                      <tr key={log.id || idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 font-bold text-white flex items-center gap-2">
                          <Activity size={12} className="text-amber-500 animate-pulse" />
                          <span>{log.action}</span>
                        </td>
                        <td className="p-4 font-bold text-[#D4AF37]">{log.user || 'نظام التحديث الفوري'}</td>
                        <td className="p-4 font-mono text-white/60">{log.details}</td>
                        <td className="p-4 text-left text-[10px] text-white/30 font-mono">{log.time ? new Date(log.time).toLocaleTimeString('ar-SA') : 'الآن'}</td>
                      </tr>
                    ))}
                    {activityLogs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-white/30">لا توجد سجلات تشغيلية حالياً في فاير بيس.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 19. API MANAGEMENT */}
        {activeTab === 'api-management' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-black text-[#D4AF37]">إدارة الـ APIs والـ Webhooks بالسنتر 🔑</h2>
              <p className="text-xs text-white/40 mt-1">ربط المتاجر والمنصة بالخدمات الخارجية، وإدارة مفاتيح API لخدمات الدفع وتوثيق المحلات.</p>
            </div>

            <div className="bg-[#0e0e0e] border border-white/5 rounded-sm overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-white/5 text-white/60 border-b border-white/5">
                  <tr>
                    <th className="p-4">اسم الخدمة الخارجية</th>
                    <th className="p-4">مفتاح API Key المرتبط</th>
                    <th className="p-4 text-left">التشغيل والربط</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {apiKeys.map(k => (
                    <tr key={k.id}>
                      <td className="p-4 font-bold text-white">{k.label}</td>
                      <td className="p-4 font-mono text-white/50">{k.key}</td>
                      <td className="p-4 text-left">
                        <span className="bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 px-2 py-0.5 rounded-sm text-[9px] font-black">متصل ويعمل (Live)</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 20. SYSTEM SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-black text-[#D4AF37]">الإعدادات العامة للسنتر الموحد ⚙️</h2>
              <p className="text-xs text-white/40 mt-1">تعديل اسم المنصة بالكامل، واللغات، والعملات، وتنشيط وضع الصيانة للسنتر بالكامل.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-[#0e0e0e] border border-white/5 p-6 rounded-sm max-w-xl space-y-5">
              <div>
                <label className="block text-white/60 text-[10px] mb-1.5">اسم المنصة الرسمي بالكامل (Platform Name)</label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/60 text-[10px] mb-1.5">العملة الرسمية بالسنتر</label>
                  <input
                    type="text"
                    value={platformCurrency}
                    onChange={(e) => setPlatformCurrency(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-xs text-white focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-[10px] mb-1.5">اللغة الافتراضية للوحة</label>
                  <select
                    value={platformLanguage}
                    onChange={(e) => setPlatformLanguage(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="ar">اللغة العربية (العربية)</option>
                    <option value="en">English (الإنجليزية)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 text-xs font-semibold mb-1.5 flex items-center gap-1">
                  <Percent size={14} className="text-[#D4AF37]" />
                  <span>نسبة العمولة الافتراضية للمتاجر الجديدة (%)</span>
                </label>
                <input
                  type="number"
                  value={defaultCommRate}
                  onChange={(e) => setDefaultCommRate(Number(e.target.value))}
                  className="w-full bg-black border border-white/10 rounded-sm py-2 px-3 text-xs text-white focus:outline-none font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-sm">
                <div>
                  <span className="text-xs font-bold text-white block">وضع صيانة المنصة بالكامل (Maintenance Mode)</span>
                  <span className="text-[10px] text-white/40">عند تشغيل هذا الخيار، سيتم قفل المول مؤقتاً لأعمال التطوير السحابية.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={`px-3 py-1.5 rounded-sm text-[10px] font-black transition-all cursor-pointer ${
                    maintenanceMode ? 'bg-red-500 text-black' : 'bg-white/10 text-white'
                  }`}
                >
                  {maintenanceMode ? 'قيد الصيانة ⚠️' : 'المنصة تعمل بالكامل'}
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-white text-black hover:bg-[#D4AF37] hover:text-white transition-all font-black text-xs rounded-sm cursor-pointer text-center"
              >
                تطبيق الإعدادات وحفظ الضبط ⚙️
              </button>
            </form>

            {/* Database Cloud Sync & Reset Diagnostics */}
            <div className="bg-[#0e0e0e] border border-red-900/20 p-6 rounded-sm max-w-xl space-y-4">
              <div>
                <h3 className="text-sm font-bold text-red-400 flex items-center gap-1.5">
                  <ShieldAlert size={16} />
                  <span>أدوات النظام وقاعدة البيانات السحابية (Firestore Diagnostics)</span>
                </h3>
                <p className="text-[11px] text-white/50 mt-1">
                  أدوات متقدمة لتشخيص حالة الاتصال، وإدارة المزامنة الفورية، وإعادة تهيئة قاعدة بيانات Firestore السحابية فورياً لجميع العملاء.
                </p>
              </div>

              <div className="p-3 bg-red-950/10 border border-red-900/30 rounded-sm text-xs space-y-2">
                <span className="text-white/80 font-bold block">إعادة تهيئة السنتر وضبط المصنع (Database Reset):</span>
                <p className="text-[10px] text-white/40">
                  إذا واجهت أي مشاكل في عرض المتاجر أو المنتجات على المنصة الموحدة لزوار جدد، يمكنك استدعاء هذا الأمر لإعادة كتابة ومزامنة جميع البيانات الافتراضية والمنتجات الراقية مباشرة على Firestore.
                </p>
                <button
                  type="button"
                  onClick={handleResetDatabase}
                  className="w-full py-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/25 transition-all text-[10px] font-bold rounded-sm cursor-pointer flex items-center justify-center gap-1"
                >
                  <RefreshCw size={12} />
                  <span>تنظيف المزامنة وإعادة تهيئة قاعدة البيانات السحابية ⚡</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ==================== STORE MANAGEMENT MODAL ==================== */}
      {mgmtStoreId && mgmtStore && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) setMgmtStoreId(null); }}>
          <div
            className="bg-[#0a0a0a] border border-white/10 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <img src={mgmtStore.logo} alt="" className="w-10 h-10 rounded-sm object-cover border border-white/10" />
                  <div>
                    <h3 className="text-sm font-black text-white">{mgmtStore.name}</h3>
                    <span className="text-[10px] text-white/40">{mgmtStore.category} • {mgmtStore.city}</span>
                  </div>
                </div>
                <button onClick={() => setMgmtStoreId(null)} className="text-white/40 hover:text-white transition-colors cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 p-2 border-b border-white/5 bg-white/[0.01]">
                {([
                  { key: 'info', label: '📝 تعديل البيانات', icon: Edit3 },
                  { key: 'products', label: `📦 المنتجات (${mgmtProducts.length})`, icon: ShoppingBag },
                  { key: 'banners', label: '🖼️ البانرات', icon: Layers },
                  { key: 'about', label: '⚙️ الإعدادات', icon: Settings },
                ] as const).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setMgmtTab(tab.key)}
                    className={`px-3 py-1.5 rounded-sm text-[10px] font-bold transition-all cursor-pointer ${
                      mgmtTab === tab.key
                        ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30'
                        : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">

                {/* === TAB: Edit Info === */}
                {mgmtTab === 'info' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/60 text-[10px] font-bold mb-1">اسم المتجر</label>
                      <input
                        value={mgmtName}
                        onChange={e => setMgmtName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-sm py-2 px-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-[10px] font-bold mb-1">مجال النشاط</label>
                      <input
                        value={mgmtCategory}
                        onChange={e => setMgmtCategory(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-sm py-2 px-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-[10px] font-bold mb-1">المدينة</label>
                      <input
                        value={mgmtCity}
                        onChange={e => setMgmtCity(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-sm py-2 px-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-[10px] font-bold mb-1">رقم هاتف المتجر</label>
                      <input
                        value={mgmtPhone}
                        onChange={e => setMgmtPhone(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-sm py-2 px-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-[10px] font-bold mb-1">الحي</label>
                      <input
                        value={mgmtDistrict}
                        onChange={e => setMgmtDistrict(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-sm py-2 px-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-[10px] font-bold mb-1">الشارع / المنطقة</label>
                      <input
                        value={mgmtNeighborhood}
                        onChange={e => setMgmtNeighborhood(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-sm py-2 px-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-white/60 text-[10px] font-bold mb-1">وصف المتجر</label>
                      <textarea
                        value={mgmtDesc}
                        onChange={e => setMgmtDesc(e.target.value)}
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-sm py-2 px-3 text-xs text-white focus:outline-none focus:border-[#D4AF37] resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-white/60 text-[10px] font-bold mb-1">شعار المتجر (Logo)</label>
                      {mgmtLogo ? (
                        <div className="relative inline-block">
                          <img src={mgmtLogo} alt="Logo" className="w-16 h-16 rounded-sm object-cover border border-white/10" />
                          <button type="button" onClick={() => setMgmtLogo('')}
                            className="absolute -top-1 -left-1 bg-black/80 text-red-400 text-[9px] w-4 h-4 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600 hover:text-white">×</button>
                        </div>
                      ) : (
                        <label className="block border-2 border-dashed border-white/10 hover:border-[#D4AF37]/40 rounded-sm p-4 text-center cursor-pointer transition-colors">
                          <div className="text-[#D4AF37] text-lg mb-1">🖼️</div>
                          <p className="text-white/40 text-[10px]">اضغط لرفع صورة الشعار</p>
                          <input type="file" accept="image/*" className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]; if (!file) return;
                              const reader = new FileReader();
                              reader.onload = async (ev) => {
                                const compressed = await compressBase64(ev.target?.result as string, 400, 400, 0.8);
                                setMgmtLogo(compressed);
                              };
                              reader.readAsDataURL(file);
                            }} />
                        </label>
                      )}
                      <input type="text" value={mgmtLogo.startsWith('data:') ? '' : mgmtLogo} onChange={e => setMgmtLogo(e.target.value)}
                        placeholder="أو الصق رابط الشعار"
                        className="w-full bg-white/5 border border-white/10 rounded-sm py-1.5 px-2 text-[10px] text-white/50 font-mono mt-2 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-white/60 text-[10px] font-bold mb-1">غلاف المتجر (Cover)</label>
                      {mgmtCover ? (
                        <div className="relative">
                          <img src={mgmtCover} alt="Cover" className="w-full h-20 rounded-sm object-cover border border-white/10" />
                          <button type="button" onClick={() => setMgmtCover('')}
                            className="absolute top-1 left-1 bg-black/80 text-red-400 text-[9px] w-4 h-4 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600 hover:text-white">×</button>
                        </div>
                      ) : (
                        <label className="block border-2 border-dashed border-white/10 hover:border-[#D4AF37]/40 rounded-sm p-4 text-center cursor-pointer transition-colors">
                          <div className="text-[#D4AF37] text-lg mb-1">🏔️</div>
                          <p className="text-white/40 text-[10px]">اضغط لرفع صورة الغلاف</p>
                          <input type="file" accept="image/*" className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]; if (!file) return;
                              const reader = new FileReader();
                              reader.onload = async (ev) => {
                                const compressed = await compressBase64(ev.target?.result as string, 1200, 400, 0.7);
                                setMgmtCover(compressed);
                              };
                              reader.readAsDataURL(file);
                            }} />
                        </label>
                      )}
                      <input type="text" value={mgmtCover.startsWith('data:') ? '' : mgmtCover} onChange={e => setMgmtCover(e.target.value)}
                        placeholder="أو الصق رابط الغلاف"
                        className="w-full bg-white/5 border border-white/10 rounded-sm py-1.5 px-2 text-[10px] text-white/50 font-mono mt-2 focus:outline-none" />
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <button
                        onClick={handleSaveStoreInfo}
                        className="px-6 py-2 bg-[#D4AF37] text-black rounded-sm text-xs font-black hover:bg-[#b8960c] transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <Save size={14} />
                        حفظ التعديلات
                      </button>
                    </div>
                  </div>
                )}

                {/* === TAB: Products === */}
                {mgmtTab === 'products' && (
                  <div className="space-y-3">
                    {mgmtProducts.length === 0 ? (
                      <div className="text-center py-8 text-white/30 text-xs">لا يوجد منتجات في هذا المتجر</div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {mgmtProducts.map(prod => (
                          <div key={prod.id} className="bg-white/[0.03] border border-white/5 rounded-sm p-3 flex gap-3">
                            <img src={prod.image} alt="" className="w-14 h-14 rounded-sm object-cover border border-white/10 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-white truncate">{prod.name}</div>
                              <div className="text-[10px] text-white/40 mt-0.5">{prod.category}</div>
                              <div className="text-[10px] text-[#D4AF37] font-bold font-mono mt-1">
                                {prod.price} {mgmtStore.currency || 'ج.م'}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteProductFromModal(prod.id)}
                              className="text-white/20 hover:text-red-400 transition-colors self-start cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* === TAB: Banners === */}
                {mgmtTab === 'banners' && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <span className="text-[10px] font-black text-[#D4AF37] block">بanners المتجر التفاعلية</span>
                        <span className="text-[10px] text-white/40 mt-1 block">البانرات تظهر مباشرة في صفحة المتجر للمستخدمين فور النشر، مع دعم صور وفيديوهات يوتيوب وتغريدات.</span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] font-black text-green-400 bg-green-500/5 border border-green-500/20 px-2 py-1 rounded-sm">
                        <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        LIVE SYNC - سحابي فوري
                      </div>
                    </div>

                    {/* Store Banners (from store.banners array) */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-sm p-3 space-y-3">
                      <span className="text-[10px] font-bold text-white/70 block">بانرات داخلية خاصة بالمتجر (تظهر في StoreView)</span>
                      <div className="space-y-2">
                        {!((mgmtStore as any).banners?.length) ? (
                          <div className="text-center py-6 text-white/30 text-xs border border-dashed border-white/5 rounded-sm">
                            لا توجد بانرات داخلية لهذا المتجر - قم بإضافة أول بانر أدناه
                          </div>
                        ) : (
                          ((mgmtStore as any).banners || []).map((b: any, idx: number) => (
                            <div key={`sb-${idx}`} className="flex items-center gap-3 bg-black/40 border border-white/5 rounded-sm p-2.5">
                              <div className="relative shrink-0">
                                <img src={b.image} alt="" className="w-28 h-14 rounded-sm object-cover border border-white/10" onError={(e)=>{ (e.currentTarget as any).style.opacity='0.2' }} />
                                {b.videoUrl && <span className="absolute bottom-0.5 left-0.5 bg-black/80 text-red-400 text-[8px] font-black px-1 rounded">▶ فيديو</span>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-white truncate">{b.title || 'بدون عنوان'}</div>
                                <div className="text-[10px] text-white/40 truncate">{b.subtitle || b.videoUrl || ''}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-sm ${b.active === false ? 'bg-zinc-800 text-zinc-400' : 'bg-green-500/10 text-green-400'}`}>
                                    {b.active === false ? 'معطّل' : 'نشط'}
                                  </span>
                                  {b.link && <span className="text-[8px] text-blue-400/80 font-mono">🔗 {b.link.slice(0,40)}</span>}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={async () => {
                                    const updatedStores = stores.map(st => {
                                      if (st.id !== mgmtStoreId) return st;
                                      const sb = [...((st as any).banners || [])];
                                      sb[idx] = { ...sb[idx], active: sb[idx].active === false ? true : false };
                                      return { ...st, banners: sb };
                                    });
                                    syncAndReload(updatedStores, products, orders, banners);
                                    await logAndNotify('تعديل بانر متجر', `تم تبديل حالة بانر #${idx+1} في متجر ${mgmtStore.name}`);
                                  }}
                                  className="p-1.5 text-white/30 hover:text-amber-400 transition-colors cursor-pointer" title="تشغيل/إيقاف"
                                >
                                  <Eye size={13} />
                                </button>
                                <button
                                  onClick={async () => {
                                    if (!confirm('حذف هذا البانر من المتجر؟')) return;
                                    const updatedStores = stores.map(st => {
                                      if (st.id !== mgmtStoreId) return st;
                                      const sb = [...((st as any).banners || [])];
                                      sb.splice(idx, 1);
                                      return { ...st, banners: sb };
                                    });
                                    syncAndReload(updatedStores, products, orders, banners);
                                    await logAndNotify('حذف بانر متجر', `تم حذف بانر من متجر ${mgmtStore.name}`);
                                  }}
                                  className="p-1.5 text-white/20 hover:text-red-400 transition-colors cursor-pointer" title="حذف"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="pt-3 border-t border-white/5 space-y-2 mt-3">
                        <span className="text-[10px] font-bold text-[#D4AF37] block flex items-center gap-1">
                          <Plus size={11} /> إضافة بانر جديد داخلي للمتجر
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input placeholder="عنوان البانر *" value={mgmtBannerTitle} onChange={e=>setMgmtBannerTitle(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-sm py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]" />
                          <input placeholder="عنوان فرعي / وصف قصير" value={mgmtBannerSub} onChange={e=>setMgmtBannerSub(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-sm py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] text-white/40 mb-0.5 block">صورة البانر (رابط أو رفع)</label>
                            <div className="flex gap-1">
                              <input placeholder="https://... image" value={mgmtBannerImage.startsWith('data:') ? '' : mgmtBannerImage} onChange={e=>setMgmtBannerImage(e.target.value)}
                                className="flex-1 bg-white/5 border border-white/10 rounded-sm py-1.5 px-2 text-[10px] text-white/80 focus:outline-none focus:border-[#D4AF37] font-mono" />
                              <label className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-white/50 border border-white/10 rounded-sm cursor-pointer text-[10px] font-bold transition-colors">
                                📤
                                <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                  const f = e.target.files?.[0]; if (!f) return;
                                  const reader = new FileReader();
                                  reader.onload = async (ev) => {
                                    const c = await compressBase64(ev.target?.result as string, 1400, 500, 0.78);
                                    setMgmtBannerImage(c);
                                  };
                                  reader.readAsDataURL(f);
                                }} />
                              </label>
                            </div>
                            {mgmtBannerImage && (
                              <div className="mt-1.5 w-full h-16 rounded-sm border border-white/10 overflow-hidden bg-black">
                                <img src={mgmtBannerImage} alt="preview" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="text-[9px] text-white/40 mb-0.5 block">رابط فيديو (YouTube / mp4) - اختياري</label>
                            <input placeholder="https://youtu.be/... أو mp4" value={mgmtBannerVideo} onChange={e=>setMgmtBannerVideo(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-sm py-1.5 px-2.5 text-[10px] text-white/80 focus:outline-none focus:border-[#D4AF37] font-mono" />
                            {mgmtBannerVideo && (
                              <div className="mt-1.5 p-2 bg-gradient-to-r from-red-500/10 to-amber-500/10 border border-red-500/20 rounded-sm text-[9px] text-red-300 font-bold flex items-center gap-1">
                                ▶ تم تفعيل وضع الفيديو للبانر
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            if (!mgmtBannerTitle.trim() || !mgmtBannerImage) { alert('يرجى إدخال عنوان البانر وصورة البانر على الأقل.'); return; }
                            const newSb: any = {
                              id: `sb-${Date.now()}`,
                              title: mgmtBannerTitle.trim(),
                              subtitle: mgmtBannerSub.trim(),
                              image: mgmtBannerImage,
                              videoUrl: mgmtBannerVideo.trim() || undefined,
                              active: true,
                              createdAt: Date.now(),
                            };
                            const updatedStores = stores.map(st => {
                              if (st.id !== mgmtStoreId) return st;
                              const current = [...((st as any).banners || [])];
                              current.unshift(newSb);
                              return { ...st, banners: current };
                            });
                            syncAndReload(updatedStores, products, orders, banners);
                            setMgmtBannerTitle(''); setMgmtBannerSub(''); setMgmtBannerImage(''); setMgmtBannerVideo('');
                            await logAndNotify('إضافة بانر متجر', `تم إضافة بانر جديد (${newSb.title}) إلى متجر ${mgmtStore.name}`);
                          }}
                          className="mt-1 px-5 py-2 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#D4AF37] rounded-sm text-[10px] font-black cursor-pointer border border-[#D4AF37]/30 transition-colors flex items-center gap-1.5"
                        >
                          <Plus size={11} /> نشر بانر جديد → يظهر فوراً في المتجر
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-white/[0.02] border border-white/5 rounded-sm">
                      <div className="text-[10px] text-white/60 font-bold mb-2 flex items-center gap-1.5">
                        <Layers size={11} /> بانرات المنصة المرتبطة بهذا المتجر (تظهر في الصفحة الرئيسية)
                      </div>
                      <div className="space-y-3">
                      {banners.filter(b => b.linkType === 'store' && b.linkValue === mgmtStoreId).length === 0 ? (
                        <div className="text-center py-5 text-white/30 text-[11px] border border-dashed border-white/5 rounded-sm">لا يوجد بانرات عامة مرتبطة بهذا المتجر في الصفحة الرئيسية</div>
                      ) : (
                        banners.filter(b => b.linkType === 'store' && b.linkValue === mgmtStoreId).map(b => (
                          <div key={b.id} className="flex items-center gap-3 bg-black/40 border border-white/5 rounded-sm p-2.5">
                            <img src={b.image} alt="" className="w-20 h-12 rounded-sm object-cover border border-white/10 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                {b.title}
                                {!b.active && <span className="text-[8px] text-zinc-400 bg-zinc-800 px-1 rounded">معطّل</span>}
                              </div>
                              <div className="text-[10px] text-white/40 truncate">{b.subtitle || ''}</div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={async () => {
                                const upd = banners.map(x => x.id === b.id ? { ...x, active: !x.active } : x);
                                syncAndReload(stores, products, orders, upd);
                                await logAndNotify('تبديل حالة بانر', `تم ${b.active ? 'إيقاف' : 'تفعيل'} بانر ${b.title}`);
                              }} className="p-1.5 text-white/30 hover:text-blue-400 cursor-pointer" title="تبديل الحالة">
                                <Eye size={13} />
                              </button>
                              <button onClick={async () => {
                                if (!confirm('حذف هذا البانر؟')) return;
                                const upd = banners.filter(x => x.id !== b.id);
                                syncAndReload(stores, products, orders, upd);
                                await logAndNotify('حذف بانر', `تمت إزالة البانر ${b.title}`);
                              }} className="p-1.5 text-white/20 hover:text-red-400 cursor-pointer" title="حذف">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                      </div>
                      <div className="pt-3 mt-3 border-t border-white/5 text-[10px] text-white/40 leading-relaxed">
                        💡 لإضافة بانر عام يظهر في الصفحة الرئيسية ويربط على هذا المتجر، استخدم قسم "البانرات" الرئيسي في لوحة المدير واختر نوع الرابط "متجر" ثم حدد هذا المتجر.
                      </div>
                    </div>
                  </div>
                )}

                {/* === TAB: Settings === */}
                {mgmtTab === 'about' && (
                  <div className="space-y-4">
                    {/* Store Info Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-white/[0.03] border border-white/5 rounded-sm p-3 text-center">
                        <div className="text-lg font-black text-[#D4AF37]">{mgmtProducts.length}</div>
                        <div className="text-[9px] text-white/40 mt-1">المنتجات</div>
                      </div>
                      <div className="bg-white/[0.03] border border-white/5 rounded-sm p-3 text-center">
                        <div className="text-lg font-black text-[#D4AF37]">{mgmtOrders.length}</div>
                        <div className="text-[9px] text-white/40 mt-1">الطلبات</div>
                      </div>
                      <div className="bg-white/[0.03] border border-white/5 rounded-sm p-3 text-center">
                        <div className="text-lg font-black text-[#D4AF37]">{mgmtStore.salesCount || 0}</div>
                        <div className="text-[9px] text-white/40 mt-1">المبيعات</div>
                      </div>
                      <div className="bg-white/[0.03] border border-white/5 rounded-sm p-3 text-center">
                        <div className="text-lg font-black text-[#D4AF37]">{mgmtStore.commissionRate || 5}%</div>
                        <div className="text-[9px] text-white/40 mt-1">العمولة</div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-white">إجراءات سريعة</h4>
                      
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            if (onViewStore) onViewStore(mgmtStoreId!);
                            setMgmtStoreId(null);
                          }}
                          className="px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-sm text-[10px] font-bold cursor-pointer hover:bg-blue-500/20 transition-colors flex items-center gap-1"
                        >
                          <Eye size={12} /> فتح المتجر
                        </button>
                        <button
                          onClick={() => {
                            onEnterStoreDashboard(mgmtStoreId!);
                            setMgmtStoreId(null);
                          }}
                          className="px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-sm text-[10px] font-bold cursor-pointer hover:bg-purple-500/20 transition-colors flex items-center gap-1"
                        >
                          <Settings size={12} /> لوحة التاجر الكاملة
                        </button>
                        <button
                          onClick={() => handleToggleStoreStatus(mgmtStoreId!)}
                          className={`px-4 py-2 rounded-sm text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                            mgmtStore.status === 'active'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                              : 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                          }`}
                        >
                          {mgmtStore.status === 'active' ? <><ShieldAlert size={12} /> حظر المتجر</> : <><Shield size={12} /> تفعيل المتجر</>}
                        </button>
                        <button
                          onClick={() => handleToggleStoreMaintenance(mgmtStoreId!)}
                          className={`px-4 py-2 rounded-sm text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                            mgmtMaintenance
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                              : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <Wrench size={12} /> {mgmtMaintenance ? 'إيقاف الصيانة' : 'وضع الصيانة'}
                        </button>
                      </div>
                    </div>

                    {/* Commission Edit */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-sm p-3">
                      <label className="text-[10px] text-white/60 font-bold block mb-1">نسبة العمولة (%)</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          defaultValue={mgmtStore.commissionRate || 5}
                          id="mgmt-commission"
                          className="w-24 bg-white/5 border border-white/10 rounded-sm py-1.5 px-2 text-xs text-white focus:outline-none font-mono"
                        />
                        <button
                          onClick={() => {
                            const val = Number((document.getElementById('mgmt-commission') as HTMLInputElement)?.value);
                            if (val >= 0 && val <= 100) handleUpdateStoreCommission(mgmtStoreId!, val);
                          }}
                          className="px-3 py-1.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-sm text-[10px] font-bold cursor-pointer border border-[#D4AF37]/20 hover:bg-[#D4AF37]/20"
                        >
                          حفظ
                        </button>
                      </div>
                    </div>

                    {/* Maintenance Status */}
                    <div className={`p-3 rounded-sm border ${
                      mgmtMaintenance
                        ? 'bg-amber-500/5 border-amber-500/20'
                        : 'bg-white/[0.02] border-white/5'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Wrench size={14} className={mgmtMaintenance ? 'text-amber-400' : 'text-white/30'} />
                        <span className="text-xs font-bold text-white">وضع الصيانة {mgmtMaintenance ? 'مفعّل' : 'متوقف'}</span>
                      </div>
                      <p className="text-[10px] text-white/40 mt-1">
                        {mgmtMaintenance
                          ? 'المتجر حالياً في وضع الصيانة — الزوار لا يستطيعون التصفح أو الشراء.'
                          : 'عند تفعيل وضع الصيانة، لن يتمكن الزوار من الدخول للمتجر.'}
                      </p>
                    </div>

                    {/* Danger Zone */}
                    <div className="border border-red-500/20 rounded-sm p-3">
                      <h4 className="text-xs font-black text-red-400 mb-2">⚠️ منطقة الخطر</h4>
                      <button
                        onClick={() => {
                          handleDeleteStore(mgmtStoreId!);
                          setMgmtStoreId(null);
                        }}
                        className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-sm text-[10px] font-bold cursor-pointer hover:bg-red-500/20 transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={12} /> حذف المتجر نهائياً
                      </button>
                    </div>
                  </div>
                )}
              </div>
          </div>
        </div>
    )}

    </div>
  );
}
