import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowRight, Star, Heart, Share2, Phone, Mail, MapPin, Sparkles, 
  ShoppingBag, Check, Grid, List, Sparkle, MessageSquarePlus, MessageSquare, Info,
  CreditCard, CheckCircle2, ChevronLeft, ChevronRight, X,
  Search, User, Trash2, Plus, Minus, Wrench, Clock, Copy, Smartphone
} from 'lucide-react';
import { Store, Product, Review, User as UserType, StoreTemplateConfig, PaymentGateway, CustomCheckoutField, CustomFieldType } from '../types';
import { compressAndResizeImage } from './ImagePicker';
import { fbSync, saveLocal } from '../lib/firebaseSync';
import { DEFAULT_PHONE_REPAIR_TEMPLATE } from '../data/mockData';
import ChatPanel from './ChatPanel';
import PhoneCasesHeart from './PhoneCasesHeart';

interface StoreViewProps {
  store: Store;
  products: Product[];
  onBack: () => void;
  onAddToCart: (product: Product, store: Store) => void;
  reviews: Review[];
  onAddReview: (review: Omit<Review, 'id' | 'date'>) => void;
}

export const FONT_FAMILY_MAPPING: Record<string, string> = {
  cairo: "'Cairo', sans-serif",
  tajawal: "'Tajawal', sans-serif",
  almarai: "'Almarai', sans-serif",
  amiri: "'Amiri', serif",
  changa: "'Changa', sans-serif",
  alexandria: "'Alexandria', sans-serif",
  inter: "'Inter', sans-serif",
};

export const BORDER_RADIUS_MAPPING: Record<string, string> = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  '3xl': '32px',
};

export const SHADOW_TYPE_MAPPING: Record<string, string> = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
};

export const CATEGORY_VISUALS: Record<string, { icon: string; color: string }> = {
  'الكل': { icon: '🏠', color: 'from-amber-500/25 to-orange-500/25' },
  'All': { icon: '🏠', color: 'from-amber-500/25 to-orange-500/25' },
  'الهواتف': { icon: '📱', color: 'from-blue-500/25 to-indigo-500/25' },
  'الهواتف الذكية': { icon: '📱', color: 'from-blue-500/25 to-indigo-500/25' },
  'Phones': { icon: '📱', color: 'from-blue-500/25 to-indigo-500/25' },
  'الإكسسوارات': { icon: '🎧', color: 'from-purple-500/25 to-pink-500/25' },
  'Accessories': { icon: '🎧', color: 'from-purple-500/25 to-pink-500/25' },
  'صيانة': { icon: '🔧', color: 'from-red-500/25 to-orange-500/25' },
  'Maintenance': { icon: '🔧', color: 'from-red-500/25 to-orange-500/25' },
  'عطور': { icon: '✨', color: 'from-teal-500/25 to-emerald-500/25' },
  'Perfumes': { icon: '✨', color: 'from-teal-500/25 to-emerald-500/25' },
  'عطور رجالية': { icon: '👑', color: 'from-cyan-500/25 to-blue-500/25' },
  'عطور نسائية': { icon: '👑', color: 'from-rose-500/25 to-pink-500/25' },
  'ملابس': { icon: '👕', color: 'from-amber-500/25 to-yellow-500/25' },
  'Clothing': { icon: '👕', color: 'from-amber-500/25 to-yellow-500/25' },
  'أحذية': { icon: '👟', color: 'from-emerald-500/25 to-teal-500/25' },
  'Shoes': { icon: '👟', color: 'from-emerald-500/25 to-teal-500/25' },
  'ساعات': { icon: '⌚', color: 'from-blue-500/25 to-cyan-500/25' },
  'Watches': { icon: '⌚', color: 'from-blue-500/25 to-cyan-500/25' },
  'الجمال': { icon: '💄', color: 'from-pink-500/25 to-rose-500/25' },
  'Beauty': { icon: '💄', color: 'from-pink-500/25 to-rose-500/25' },
  'ألعاب': { icon: '🎮', color: 'from-violet-500/25 to-purple-500/25' },
  'Games': { icon: '🎮', color: 'from-violet-500/25 to-purple-500/25' },
  'إلكترونيات': { icon: '💻', color: 'from-indigo-500/25 to-blue-500/25' },
  'Electronics': { icon: '💻', color: 'from-indigo-500/25 to-blue-500/25' },
  'سوبر ماركت': { icon: '🛒', color: 'from-green-500/25 to-emerald-500/25' },
  'Supermarket': { icon: '🛒', color: 'from-green-500/25 to-emerald-500/25' },
  'صينات هواتف': { icon: '📱', color: 'from-pink-500/25 to-rose-500/25' },
  'Phone Cases': { icon: '📱', color: 'from-pink-500/25 to-rose-500/25' },
  'كفرات': { icon: '📲', color: 'from-rose-500/25 to-pink-500/25' },
  'حمايات شاشة': { icon: '🛡️', color: 'from-indigo-500/25 to-blue-500/25' },
  'سوبر ماركت': { icon: '🛒', color: 'from-green-500/25 to-emerald-500/25' },
  'مواد غذائية': { icon: '🍎', color: 'from-lime-500/25 to-green-500/25' },
  'أدوات منزلية': { icon: '🏠', color: 'from-amber-500/25 to-yellow-500/25' },
  'كمبيوترات': { icon: '💻', color: 'from-blue-500/25 to-purple-500/25' },
  'لابتوب': { icon: '💻', color: 'from-cyan-500/25 to-blue-500/25' },
  'ملحقات': { icon: '🎧', color: 'from-purple-500/25 to-violet-500/25' },
};

export default function StoreView({
  store: initialStore,
  products,
  onBack,
  onAddToCart,
  reviews,
  onAddReview
}: StoreViewProps) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'home' | 'products' | 'offers' | 'reviews' | 'about'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Quick Checkout state variables (DYNAMIC - NEW SYSTEM)
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [checkoutFormValues, setCheckoutFormValues] = useState<Record<string, any>>({});
  const [selectedPaymentGatewayId, setSelectedPaymentGatewayId] = useState<string | null>(null);
  const [transferSenderNumber, setTransferSenderNumber] = useState('');
  const [transferReceiptImage, setTransferReceiptImage] = useState('');
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState('');

  // LEGACY STATE BACKWARD COMPATIBILITY (keep for old stores that still use the old format)
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutAddress, setCheckoutAddress] = useState('');
  const [checkoutEmail, setCheckoutEmail] = useState('');
  const [checkoutNotes, setCheckoutNotes] = useState('');
  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState<'cod' | 'vodafoneCash'>('cod');
  const [vodafoneSenderNumber, setVodafoneSenderNumber] = useState('');
  const [vodafoneReceiptImage, setVodafoneReceiptImage] = useState('');

  // Active product image index for multiple product images gallery view
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Review form state
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Slideshow and Repair request state variables
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);
  const [repairDevice, setRepairDevice] = useState('');
  const [repairProblem, setRepairProblem] = useState('');
  const [repairPhone, setRepairPhone] = useState('');
  const [repairSuccess, setRepairSuccess] = useState(false);

  // New customized states for premium tech-repair store experience
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavsModal, setShowFavsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customer, setCustomer] = useState<{ name: string; phone: string; email?: string } | null>(null);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [accountPhone, setAccountPhone] = useState('');
  const [accountEmail, setAccountEmail] = useState('');

  // Cart state for self-contained independent shopping cart
  const [cart, setCart] = useState<any[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [isCartCheckout, setIsCartCheckout] = useState(false);

  // Live store data from localStorage (polling) so merchant edits appear immediately
  const [liveStore, setLiveStore] = useState(initialStore);
  const [liveProducts, setLiveProducts] = useState(products);
  const store = liveStore;
  const currencySymbol = store.currency || (i18n.language === 'en' ? 'EGP' : 'جنيه');

  // Template config from AdminDashboard
  const [templateConfig, setTemplateConfig] = useState<StoreTemplateConfig | null>(() => {
    if (store.templateConfig) return store.templateConfig;
    try {
      const saved = JSON.parse(localStorage.getItem('mix_store_templates') || '[]');
      const cat = (store.category || '').toLowerCase();
      if (cat.includes('صيانة') || cat.includes('موبايل') || cat.includes('هواتف') || cat.includes('جوال')) {
        return saved.find((t: any) => t.id === 'tpl-phone-repair') || DEFAULT_PHONE_REPAIR_TEMPLATE;
      }
      return saved[0] || null;
    } catch { return DEFAULT_PHONE_REPAIR_TEMPLATE; }
  });

  useEffect(() => {
    const sync = () => {
      try {
        const allStores = JSON.parse(localStorage.getItem('mix_stores') || '[]');
        const updatedStore = allStores.find((s: any) => s.id === initialStore.id);
        if (updatedStore) setLiveStore(updatedStore);
        const allProducts = JSON.parse(localStorage.getItem('mix_products') || '[]');
        setLiveProducts(allProducts.filter((p: any) => p.storeId === initialStore.id));
        // Load template config from admin
        const templates = JSON.parse(localStorage.getItem('mix_store_templates') || '[]');
        const cat = (updatedStore?.category || initialStore.category || '').toLowerCase();
        const isRepair = cat.includes('طµظٹط§ظ†ط©') || cat.includes('ظ…ظˆط¨ط§ظٹظ„') || cat.includes('ظ‡ظˆط§طھظپ') || cat.includes('ط¬ظˆط§ظ„');
        const tpl = templates.find((t: any) => isRepair && t.id === 'tpl-phone-repair') || templates[0] || null;
        if (tpl) setTemplateConfig(tpl);
      } catch {}
    };
    sync();
    const interval = setInterval(sync, 2000);
    const handler = () => sync();
    window.addEventListener('local-storage-change', handler);
    window.addEventListener('storage', handler);
    window.addEventListener('mix-realtime-mix_stores', handler);
    window.addEventListener('mix-realtime-mix_products', handler);
    window.addEventListener('mix-realtime-mix_store_templates', handler);
    return () => {
      clearInterval(interval);
      window.removeEventListener('local-storage-change', handler);
      window.removeEventListener('storage', handler);
      window.removeEventListener('mix-realtime-mix_stores', handler);
      window.removeEventListener('mix-realtime-mix_products', handler);
      window.removeEventListener('mix-realtime-mix_store_templates', handler);
    };
  }, [initialStore.id]);

  // Hydrate favorites, customer, and cart on mount
  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('mix_favorites') || '[]');
      setFavorites(favs);
      const cust = JSON.parse(localStorage.getItem('mix_customer') || 'null');
      if (cust) {
        setCustomer(cust);
        setAccountName(cust.name);
        setAccountPhone(cust.phone);
        setAccountEmail(cust.email || '');
      }
      const savedCart = JSON.parse(localStorage.getItem('mix_cart') || '[]');
      setCart(savedCart);
    } catch (e) {
      console.error('Failed to load storage in StoreView', e);
    }
  }, []);

  // Sync cart whenever storage event fires
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const savedCart = JSON.parse(localStorage.getItem('mix_cart') || '[]');
        setCart(savedCart);
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleFavorite = (productId: string) => {
    try {
      const currentFavs = JSON.parse(localStorage.getItem('mix_favorites') || '[]');
      let updated: string[];
      if (currentFavs.includes(productId)) {
        updated = currentFavs.filter((id: string) => id !== productId);
      } else {
        updated = [...currentFavs, productId];
      }
      localStorage.setItem('mix_favorites', JSON.stringify(updated));
      setFavorites(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const updateCartItemQuantity = (productId: string, delta: number) => {
    try {
      const savedCart = JSON.parse(localStorage.getItem('mix_cart') || '[]');
      const updatedCart = savedCart.map((item: any) => {
        if (item.productId === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean);
      
      localStorage.setItem('mix_cart', JSON.stringify(updatedCart));
      setCart(updatedCart);
      window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_cart' } }));
    } catch (e) {
      console.error(e);
    }
  };

  const removeCartItem = (productId: string) => {
    try {
      const savedCart = JSON.parse(localStorage.getItem('mix_cart') || '[]');
      const updatedCart = savedCart.filter((item: any) => item.productId !== productId);
      localStorage.setItem('mix_cart', JSON.stringify(updatedCart));
      setCart(updatedCart);
      window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_cart' } }));
    } catch (e) {
      console.error(e);
    }
  };

  // Filter products for this store
  const storeProducts = liveProducts;
  const offerProducts = storeProducts.filter(p => p.isOffer);
  
  // Filter by store category and search term
  const filteredProducts = storeProducts.filter(p => {
    const matchesCategory = selectedCategory === 'الكل' || p.category === selectedCategory;
    const matchesSearch = !searchTerm.trim() || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const storeReviews = reviews.filter(r => r.storeId === store.id);

  // Apply custom CSS variables for store colors
  useEffect(() => {
    const root = document.documentElement;
    const tc = templateConfig;
    root.style.setProperty('--store-primary', tc?.colors?.primary || store.themeColor.primary);
    root.style.setProperty('--store-secondary', tc?.colors?.secondary || store.themeColor.secondary);
    root.style.setProperty('--store-background', tc?.colors?.background || store.themeColor.background);
    root.style.setProperty('--store-frame', store.themeColor.frameColor || 'rgba(24, 24, 27, 0.4)');
    root.style.setProperty('--store-text', tc?.colors?.textMuted || store.themeColor.textColor || '#A1A1AA');
    root.style.setProperty('--store-accent', tc?.colors?.accent || '#ec4899');
    root.style.setProperty('--store-surface', tc?.colors?.surface || '#18181b');
    
    // Set dynamic custom live typography, corner radius and shadows
    const fontVal = store.fontFamily ? FONT_FAMILY_MAPPING[store.fontFamily] : FONT_FAMILY_MAPPING[tc?.fonts?.heading?.toLowerCase() || 'cairo'];
    root.style.setProperty('--store-font', fontVal || FONT_FAMILY_MAPPING.cairo);
    
    if (store.borderRadius || tc?.layout?.borderRadius) {
      root.style.setProperty('--store-radius', tc?.layout?.borderRadius || BORDER_RADIUS_MAPPING[store.borderRadius] || '16px');
    } else {
      root.style.setProperty('--store-radius', '16px');
    }

    if (store.shadowType) {
      root.style.setProperty('--store-shadow', SHADOW_TYPE_MAPPING[store.shadowType] || 'none');
    } else {
      root.style.setProperty('--store-shadow', 'none');
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      root.style.removeProperty('--store-primary');
      root.style.removeProperty('--store-secondary');
      root.style.removeProperty('--store-background');
      root.style.removeProperty('--store-frame');
      root.style.removeProperty('--store-text');
      root.style.removeProperty('--store-accent');
      root.style.removeProperty('--store-surface');
      root.style.removeProperty('--store-font');
      root.style.removeProperty('--store-radius');
      root.style.removeProperty('--store-shadow');
    };
  }, [store, templateConfig]);

  // Resolve Store Category Theme
  const templateType = store.visualTemplate || templateConfig?.category === 'صيانة' ? 'mobile' : (() => {
    const cat = (store.category || '').toLowerCase();
    if (cat.includes('موبايل') || cat.includes('جوال') || cat.includes('صيانة') || cat.includes('هواتف')) return 'mobile';
    if (cat.includes('ملابس') || cat.includes('أزياء') || cat.includes('موضة') || cat.includes('أحذية') || cat.includes('فاشن')) return 'clothing';
    if (cat.includes('عطر') || cat.includes('بخور') || cat.includes('روائح') || cat.includes('عطور')) return 'perfume';
    if (cat.includes('حذاء') || cat.includes('أحذية') || cat.includes('رياضة') || cat.includes('رياضي')) return 'shoes';
    if (cat.includes('كهرب') || cat.includes('إلكتروني') || cat.includes('لابتوب') || cat.includes('شاشات')) return 'electronics';
    if (cat.includes('صينات') || cat.includes('كفرات') || cat.includes('حمايات') || cat.includes('phone cases')) return 'phonecases';
    if (cat.includes('سوبر') || cat.includes('ماركت') || cat.includes('مواد غذائية') || cat.includes('supermarket')) return 'supermarket';
    if (cat.includes('أدوات') || cat.includes('منزلية') || cat.includes('مطبخ') || cat.includes('ديكور')) return 'hometools';
    if (cat.includes('كمبيوتر') || cat.includes('لابتوب') || cat.includes('pc') || cat.includes('computer')) return 'computers';
    return 'multicategory';
  })();

  // Automatic slideshow transitions
  useEffect(() => {
    if (store.banners && store.banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIdx(prev => (prev + 1) % store.banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [store.banners]);

  const handleShare = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName || !newReviewComment) {
      alert('الرجاء كتابة اسمك والتعليق قبل الإرسال');
      return;
    }
    onAddReview({
      storeId: store.id,
      userName: newReviewName,
      rating: newReviewRating,
      comment: newReviewComment
    });
    setReviewSuccess(true);
    setNewReviewName('');
    setNewReviewComment('');
    setNewReviewRating(5);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  // ============== NEW SYSTEM: HELPERS ==============
  // Detect payment gateways format (new array vs old object)
  const useNewPaymentSystem = Array.isArray(store.paymentGateways);
  const useNewCheckoutFieldsSystem = Array.isArray(store.customCheckoutFields);

  // Get enabled payment gateways (normalized to new format regardless of store data)
  const getEnabledGateways = (): PaymentGateway[] => {
    if (useNewPaymentSystem) {
      return (store.paymentGateways as PaymentGateway[]).filter(g => g.enabled);
    }
    // Legacy format backward compatibility
    const legacy = (store.paymentGateways || { cod: true, vodafoneCash: false }) as any;
    const result: PaymentGateway[] = [];
    if (legacy.cod) {
      result.push({
        id: 'legacy-cod',
        type: 'cod',
        name: 'الدفع عند الاستلام',
        enabled: true,
        icon: '💵'
      });
    }
    if (legacy.vodafoneCash) {
      result.push({
        id: 'legacy-vfc',
        type: 'vodafoneCash',
        name: 'فودافون كاش',
        enabled: true,
        number: legacy.vodafoneCashNumber,
        icon: '🟥'
      });
    }
    return result;
  };

  const enabledGateways = getEnabledGateways();
  const currentSelectedGateway = (() => {
    if (useNewPaymentSystem) {
      return enabledGateways.find(g => g.id === selectedPaymentGatewayId) || enabledGateways[0] || null;
    }
    // Legacy
    if (selectedPaymentGateway === 'vodafoneCash') {
      return enabledGateways.find(g => g.type === 'vodafoneCash') || enabledGateways[0] || null;
    }
    return enabledGateways.find(g => g.type === 'cod') || enabledGateways[0] || null;
  })();

  // Get checkout fields (normalized to new array format)
  const getCheckoutFields = (): CustomCheckoutField[] => {
    if (useNewCheckoutFieldsSystem) {
      return (store.customCheckoutFields as CustomCheckoutField[])
        .filter(f => f.enabled)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    // Legacy format backward compatibility
    const legacy = (store.customCheckoutFields || { fullName: true, phone: true, address: true, notes: true, email: false }) as any;
    const fields: CustomCheckoutField[] = [];
    let order = 1;
    if (legacy.fullName !== false) {
      fields.push({ id: 'legacy-name', name: 'fullName', label: 'الاسم الكامل للمشتري', type: 'text', required: true, enabled: true, placeholder: 'الرجاء كتابة اسمك الثلاثي', order: order++ });
    }
    fields.push({ id: 'legacy-phone', name: 'phone', label: 'رقم الهاتف / الجوال', type: 'tel', required: true, enabled: true, placeholder: 'مثال: 0501234567', order: order++ });
    if (legacy.address !== false) {
      fields.push({ id: 'legacy-address', name: 'address', label: 'عنوان الشحن والتوصيل بالتفصيل', type: 'text', required: true, enabled: true, placeholder: 'مثال: الرياض، حي الياسمين، شارع العليا', order: order++ });
    }
    if (legacy.email) {
      fields.push({ id: 'legacy-email', name: 'email', label: 'البريد الإلكتروني', type: 'email', required: true, enabled: true, placeholder: 'your-email@example.com', order: order++ });
    }
    if (legacy.notes !== false) {
      fields.push({ id: 'legacy-notes', name: 'notes', label: 'ملاحظات إضافية للتاجر (اختياري)', type: 'textarea', required: false, enabled: true, placeholder: 'اكتب أي ملاحظات أو طلبات خاصة...', order: order++ });
    }
    return fields;
  };

  const checkoutFields = getCheckoutFields();

  // Helper: get form value from either new system state or legacy state based on field name
  const getFormValue = (name: string): any => {
    if (useNewCheckoutFieldsSystem) {
      return checkoutFormValues[name] ?? '';
    }
    // Legacy mapping
    switch (name) {
      case 'fullName': return checkoutName;
      case 'phone': return checkoutPhone;
      case 'address': return checkoutAddress;
      case 'email': return checkoutEmail;
      case 'notes': return checkoutNotes;
      default: return checkoutFormValues[name] ?? '';
    }
  };

  // Helper: set form value to appropriate state
  const setFormValue = (name: string, value: any) => {
    if (useNewCheckoutFieldsSystem) {
      setCheckoutFormValues(prev => ({ ...prev, [name]: value }));
    } else {
      switch (name) {
        case 'fullName': setCheckoutName(value); break;
        case 'phone': setCheckoutPhone(value); break;
        case 'address': setCheckoutAddress(value); break;
        case 'email': setCheckoutEmail(value); break;
        case 'notes': setCheckoutNotes(value); break;
        default: setCheckoutFormValues(prev => ({ ...prev, [name]: value }));
      }
    }
  };

  const GATEWAY_TYPE_LABELS: Record<string, { label: string; color: string; icon: string; desc: string }> = {
    cod: { label: 'الدفع عند الاستلام', color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30', icon: '💵', desc: 'ادفع كاش أو شبكة فور الاستلام' },
    vodafoneCash: { label: 'فودافون كاش', color: 'from-red-500/20 to-rose-500/10 border-red-500/30', icon: '🟥', desc: 'تحويل مباشر وسريع للمحفظة' },
    instapay: { label: 'إنستا باي (InstaPay)', color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30', icon: '💙', desc: 'تحويل فوري عبر شبكة إنستا باي' },
    etisalatCash: { label: 'اتصالات كاش', color: 'from-green-500/20 to-emerald-500/10 border-green-500/30', icon: '🟩', desc: 'محفظة اتصالات الإلكترونية' },
    orangeMoney: { label: 'أورانج ماني', color: 'from-orange-500/20 to-amber-500/10 border-orange-500/30', icon: '🟧', desc: 'محفظة أورانج الإلكترونية' },
    bankTransfer: { label: 'تحويل بنكي', color: 'from-slate-500/20 to-zinc-500/10 border-slate-500/30', icon: '🏦', desc: 'تحويل مباشر لحساب البنك' },
    creditCard: { label: 'بطاقة ائتمان', color: 'from-violet-500/20 to-purple-500/10 border-violet-500/30', icon: '💳', desc: 'دفع ببطاقة فيزا/ماستركارد' },
    paypal: { label: 'PayPal', color: 'from-sky-500/20 to-blue-500/10 border-sky-500/30', icon: '🅿️', desc: 'دفع آمن عبر باي بال' },
    stripe: { label: 'Stripe', color: 'from-fuchsia-500/20 to-pink-500/10 border-fuchsia-500/30', icon: '⚡', desc: 'دفع إلكتروني عبر سترايب' },
    other: { label: 'طريقة أخرى', color: 'from-zinc-500/20 to-neutral-500/10 border-zinc-500/30', icon: '💰', desc: 'طريقة دفع أخرى محددة من التاجر' }
  };

  // Open Quick Checkout and preselect payment gateway based on merchant's preferences
  const openQuickCheckout = (prod: Product, isCart: boolean = false) => {
    setCheckoutProduct(prod);
    setIsCartCheckout(isCart);
    setOrderCompleted(false);
    setPlacedOrderId('');
    setTransferSenderNumber('');
    setTransferReceiptImage('');
    
    // Initialize both legacy and new system fields
    setCheckoutName(customer?.name || '');
    setCheckoutPhone(customer?.phone || '');
    setCheckoutAddress('');
    setCheckoutEmail(customer?.email || '');
    setCheckoutNotes('');
    setVodafoneSenderNumber('');
    setVodafoneReceiptImage('');

    // Initialize new dynamic form values
    const initialFormValues: Record<string, any> = {};
    getCheckoutFields().forEach(f => {
      if (f.name === 'fullName') initialFormValues[f.name] = customer?.name || '';
      else if (f.name === 'phone') initialFormValues[f.name] = customer?.phone || '';
      else if (f.name === 'email') initialFormValues[f.name] = customer?.email || '';
      else if (f.defaultValue) initialFormValues[f.name] = f.defaultValue;
      else initialFormValues[f.name] = '';
    });
    setCheckoutFormValues(initialFormValues);

    // Choose default gateway (NEW SYSTEM)
    const gateways = getEnabledGateways();
    if (gateways.length > 0) {
      const codGw = gateways.find(g => g.type === 'cod');
      const defaultGw = codGw || gateways[0];
      setSelectedPaymentGatewayId(defaultGw.id);
      // Keep legacy system in sync
      if (defaultGw.type === 'vodafoneCash') setSelectedPaymentGateway('vodafoneCash');
      else setSelectedPaymentGateway('cod');
    } else {
      setSelectedPaymentGatewayId(null);
      setSelectedPaymentGateway('cod');
    }
  };

  const openCartCheckout = () => {
    const storeCartItems = cart.filter((item: any) => item.storeId === store.id);
    if (storeCartItems.length === 0) return;
    
    const virtualProduct: Product = {
      id: 'cart-checkout',
      storeId: store.id,
      name: 'سلة المشتريات المتكاملة',
      price: storeCartItems.reduce((acc, i) => acc + (i.price * i.quantity), 0),
      image: storeCartItems[0].image,
      category: 'سلة التسوق',
      description: 'طلب مجموعة لمنتجات السلة من المتجر',
      rating: 5,
      stock: 99,
      salesCount: 0,
      isOffer: false
    };

    openQuickCheckout(virtualProduct, true);
  };

  const handleQuickCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutProduct) return;

    // ========== DYNAMIC FIELDS VALIDATION (NEW SYSTEM) ==========
    const fields = getCheckoutFields();
    for (const fld of fields) {
      const val = getFormValue(fld.name);
      const isEmpty = val === undefined || val === null || (typeof val === 'string' && !val.trim()) || (Array.isArray(val) && val.length === 0);
      if (fld.required && isEmpty) {
        alert(`⚠️ الرجاء تعبئة الحقل المطلوب: "${fld.label}"`);
        return;
      }
      // Type-specific validations
      if (val && typeof val === 'string') {
        if (fld.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) {
          alert(`⚠️ بريد إلكتروني غير صحيح في الحقل: "${fld.label}"`);
          return;
        }
        if (fld.type === 'tel' && !/^[\d\s\-+\(\)]{5,}$/.test(val.trim())) {
          alert(`⚠️ رقم هاتف غير صحيح في الحقل: "${fld.label}"`);
          return;
        }
        if (fld.validation?.minLength && val.trim().length < fld.validation.minLength) {
          alert(`⚠️ الحقل "${fld.label}" يجب أن يحتوي على الأقل ${fld.validation.minLength} أحرف`);
          return;
        }
        if (fld.validation?.maxLength && val.trim().length > fld.validation.maxLength) {
          alert(`⚠️ الحقل "${fld.label}" لا يمكن أن يتجاوز ${fld.validation.maxLength} أحرف`);
          return;
        }
      }
    }

    // ========== PAYMENT GATEWAY VALIDATION (NEW SYSTEM) ==========
    const gw = currentSelectedGateway;
    if (!gw) {
      alert('⚠️ يرجى اختيار طريقة دفع صالحة');
      return;
    }

    // For non-COD gateways: validate sender number + receipt (for wallet/bank transfers)
    const isTransferGateway = gw.type !== 'cod' && gw.type !== 'creditCard' && gw.type !== 'paypal' && gw.type !== 'stripe';
    if (isTransferGateway) {
      const senderNum = useNewPaymentSystem ? transferSenderNumber : vodafoneSenderNumber;
      const receiptImg = useNewPaymentSystem ? transferReceiptImage : vodafoneReceiptImage;
      if (!senderNum.trim()) {
        alert('⚠️ الرجاء إدخال رقم الهاتف المحول منه أو رقم العملية لتأكيد استلام الدفعة');
        return;
      }
      if (!receiptImg) {
        alert('⚠️ الرجاء رفع صورة إيصال/وصل التحويل من جهازك لتأكيد عملية الدفع');
        return;
      }
    }

    // Submit order to localStorage and dispatch event or reload data
    try {
      const storedOrders = JSON.parse(localStorage.getItem('mix_orders') || '[]');
      const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

      const storeCartItems = cart.filter((item: any) => item.storeId === store.id);
      const orderItems = isCartCheckout 
        ? storeCartItems.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            image: item.image
          }))
        : [
            {
              productId: checkoutProduct.id,
              productName: checkoutProduct.name,
              quantity: 1,
              price: checkoutProduct.price,
              image: checkoutProduct.image
            }
          ];

      const orderTotal = isCartCheckout 
        ? storeCartItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0) + 15
        : checkoutProduct.price + 15;

      // Collect customer data from dynamic form
      const getVal = (n: string, fallback = '') => {
        const v = getFormValue(n);
        if (v === undefined || v === null) return fallback;
        if (typeof v === 'string') return v.trim() || fallback;
        return String(v) || fallback;
      };

      const customerName = getVal('fullName') || getVal('name') || getVal('customerName') || 'عميل الطلب السريع';
      const customerPhone = getVal('phone') || getVal('telephone') || getVal('mobile') || 'غير متوفر';
      const customerEmail = getVal('email') || getVal('emailAddress') || 'quick-customer@mix.com';
      const customerAddress = getVal('address') || getVal('shippingAddress') || getVal('deliveryAddress') || 'عنوان العميل';
      const notesVal = getVal('notes') || getVal('additionalNotes') || '';

      const isNewTransferGw = useNewPaymentSystem ? isTransferGateway : selectedPaymentGateway === 'vodafoneCash';
      const transferSender = useNewPaymentSystem ? transferSenderNumber : vodafoneSenderNumber;
      const transferReceipt = useNewPaymentSystem ? transferReceiptImage : vodafoneReceiptImage;
      const paymentMethodStr = useNewPaymentSystem
        ? `${gw.type}__${gw.id}__${gw.name}`
        : (selectedPaymentGateway === 'vodafoneCash' ? 'vodafone_cash' : 'cod');

      const newOrder = {
        id: orderId,
        storeId: store.id,
        storeName: store.name,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        items: orderItems,
        total: orderTotal,
        status: 'pending',
        paymentMethod: paymentMethodStr,
        paymentGatewayName: gw?.name,
        paymentGatewayType: gw?.type,
        vodafoneNumber: isNewTransferGw ? transferSender.trim() : undefined,
        vodafoneReceiptImage: isNewTransferGw ? transferReceipt : undefined,
        transferSenderNumber: isNewTransferGw ? transferSender.trim() : undefined,
        transferReceipt: isNewTransferGw ? transferReceipt : undefined,
        customFields: useNewCheckoutFieldsSystem ? { ...checkoutFormValues } : undefined,
        notes: notesVal || undefined,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };

      storedOrders.unshift(newOrder);
      saveLocal('mix_orders', storedOrders);
      // Save order to Firestore (real-time sync to admin & merchant dashboard)
      fbSync.saveOrder(newOrder).catch(console.error);

      if (isCartCheckout) {
        const remainingCart = cart.filter((item: any) => item.storeId !== store.id);
        localStorage.setItem('mix_cart', JSON.stringify(remainingCart));
        setCart(remainingCart);
      }

      // Update Sales Count for Store
      const currentStores = JSON.parse(localStorage.getItem('mix_stores') || '[]');
      const updatedStores = currentStores.map((s: any) => {
        if (s.id === store.id) {
          return {
            ...s,
            salesCount: (s.salesCount || 0) + 1
          };
        }
        return s;
      });
      saveLocal('mix_stores', updatedStores);
      // Save updated store to Firestore
      const updatedStore = updatedStores.find((s: any) => s.id === store.id);
      if (updatedStore) fbSync.saveStore(updatedStore).catch(console.error);

      // Trigger standard order event to reload top bar or layout count
      window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_cart' } }));
      window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_orders' } }));
      window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_stores' } }));
      window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_cart' } }));

      setPlacedOrderId(orderId);
      setOrderCompleted(true);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء معالجة الطلب، الرجاء المحاولة مرة أخرى');
    }
  };

  return (
    <div 
      className="min-h-screen text-white pb-20 relative transition-all duration-500 text-right store-custom-root" 
      style={{ 
        backgroundColor: store.themeColor.background,
        fontFamily: 'var(--store-font, Cairo, sans-serif)'
      }}
      dir="rtl"
    >
      {/* Absolute top glow based on store colors */}
      <div 
        className="absolute top-0 right-1/4 w-96 h-96 rounded-full opacity-10 pointer-events-none blur-3xl transition-all duration-1000"
        style={{ backgroundColor: store.themeColor.primary }}
      />

      {/* STICKY STORE TOP BAR - Hidden for dist template (has its own header) */}
      {templateType !== 'mobile' && (
        <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-zinc-900 rounded-xl text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <ArrowRight size={20} />
              <span className="text-xs hidden sm:inline">العودة لسنتر MIX</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Active Store Indicator */}
            <span className="text-[10px] uppercase tracking-wider font-semibold py-1 px-2.5 rounded-full border bg-zinc-900 text-zinc-400 border-zinc-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: store.themeColor.primary }} />
              ظ…طھط¬ط± ظ…ط³طھظ‚ظ„ ظپظٹ MIX
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleShare}
              className="p-2 hover:bg-zinc-900 rounded-xl text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
              title="مشاركة رابط المتجر"
            >
              <Share2 size={18} />
            </button>
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2 hover:bg-zinc-900 rounded-xl transition-colors cursor-pointer ${isLiked ? 'text-rose-500' : 'text-zinc-400'}`}
            >
              <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      )}

      {/* Copied alert banner */}
      <AnimatePresence>
        {copiedLink && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-black text-xs font-bold px-4 py-2 rounded-full shadow-lg"
          >
            تم نسخ رابط المتجر بنجاح! 🔗
          </motion.div>
        )}
      </AnimatePresence>

      {/* STORE COVER HERO - COMPACT & HIGH-END */}
      <div className="relative h-44 sm:h-52 md:h-56 w-full overflow-hidden bg-zinc-950">
        <img 
          src={store.cover} 
          alt={store.name} 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover opacity-40 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-l from-zinc-950/80 via-transparent to-transparent" />
        
        {/* Floating Cover Badge */}
        <div className="absolute bottom-3 right-4 md:right-8 left-4 md:left-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-4 text-right">
            {/* Logo */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 p-1 bg-zinc-950 shadow-2xl shrink-0" style={{ borderColor: store.themeColor.primary }}>
              <img 
                src={store.logo} 
                alt={store.name} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>

            {/* Details */}
            <div className="text-right">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight drop-shadow-md font-sans">
                  {store.name}
                </h1>
                {store.epithet && (
                  <span className="text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-600/30 to-yellow-500/30 text-amber-300 border border-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.15)] flex items-center gap-1">
                    {store.epithet}
                  </span>
                )}
                <span 
                  className="text-[9px] sm:text-[10px] font-black px-2.5 py-0.5 rounded-full text-black shadow-sm uppercase tracking-wider"
                  style={{ backgroundColor: store.themeColor.primary }}
                >
                  {store.category}
                </span>
                <span className="bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {i18n.language === 'en' ? 'Verified Partner' : (templateConfig?.branding?.trustedBadge || 'ط´ط±ظٹظƒ ظ…ط¹طھظ…ط¯')}
                </span>
              </div>
              
              <p className="text-zinc-300 text-[11px] mt-1 max-w-xl line-clamp-1 sm:line-clamp-2 drop-shadow">
                {store.description}
              </p>

              <div className="flex items-center gap-3 text-[10px] sm:text-xs text-zinc-400 mt-2 flex-wrap">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star size={13} fill="currentColor" />
                  {store.rating} <span className="text-[10px] text-zinc-400">({store.reviewsCount} {i18n.language === 'en' ? 'reviews' : 'طھظ‚ظٹظٹظ…'})</span>
                </span>
                <span className="text-zinc-700">â€¢</span>
                <span className="flex items-center gap-1 text-zinc-300">
                  <MapPin size={11} className="text-zinc-500" />
                  {store.district ? `${store.district}طŒ ` : ''}{store.city}طŒ {store.country}
                </span>
                {store.storePhone && (
                  <>
                    <span className="text-zinc-700">â€¢</span>
                    <a href={`tel:${store.storePhone}`} className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300" dir="ltr">
                      ًں“‍ {store.storePhone}
                    </a>
                  </>
                )}
                <span className="text-zinc-700">â€¢</span>
                <span className="text-zinc-300">{storeProducts.length} {i18n.language === 'en' ? 'products' : 'ظ…ظ†طھط¬'}</span>
                <span className="text-zinc-700">â€¢</span>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}${window.location.pathname}#/store/${store.slug || store.id}`;
                    navigator.clipboard.writeText(url).then(() => alert('طھظ… ظ†ط³ط® ط±ط§ط¨ط· ط§ظ„ظ…طھط¬ط±!'));
                  }}
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 cursor-pointer transition-colors"
                >
                  ًں”— ظ…ط´ط§ط±ظƒط©
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STORE TABS NAVIGATION - Hidden for dist template */}
      {templateType === 'mobile' ? null : (
      <div className="bg-zinc-950/90 sticky top-[49px] z-30 border-b border-zinc-800 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto flex justify-center gap-1 sm:gap-2 py-2" style={{ scrollbarWidth: 'none' }}>
          {[
            { id: 'home', label: 'ط§ظ„ط±ط¦ظٹط³ظٹط©' },
            { id: 'products', label: 'ط§ظ„ظ…ظ†طھط¬ط§طھ' },
            { id: 'offers', label: 'ط§ظ„ط¹ط±ظˆط¶ ط§ظ„ظ‚ظˆظٹط©' },
            { id: 'reviews', label: 'ط§ظ„طھظ‚ظٹظٹظ…ط§طھ' },
            { id: 'about', label: 'ظ…ط¹ظ„ظˆظ…ط§طھ ط§ظ„طھظˆط§طµظ„' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap"
              style={{
                backgroundColor: activeTab === tab.id ? store.themeColor.primary : 'transparent',
                color: activeTab === tab.id ? '#000000' : '#A1A1AA'
              }}
            >
              {tab.label}
              {tab.id === 'offers' && offerProducts.length > 0 && (
                <span className="mr-1 text-[9px] bg-red-600 text-white font-black py-0.5 px-1.5 rounded-full animate-pulse">
                  {offerProducts.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      )}

      {/* MAIN VIEW AREA CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            
            {/* GLOBAL PREMIUM STORE SEARCH & CIRCULAR CATEGORY ACCENT - Hidden for dist template */}
            {templateType !== 'mobile' && (
            <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
              
              {/* Premium Search Bar */}
              <div className="max-w-2xl mx-auto w-full">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder={i18n.language === 'en' ? "Search for products, categories, or details in this store..." : "ط§ظ„ط¨ط­ط« ط§ظ„ط³ط±ظٹط¹ ظپظٹ ظ…ظ†طھط¬ط§طھ ظˆط£ظ‚ط³ط§ظ… ظ‡ط°ط§ ط§ظ„ظ…طھط¬ط±..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-950/90 border border-zinc-700/40 focus:border-amber-500 rounded-2xl py-2.5 sm:py-3 pr-11 pl-4 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all text-right font-sans shadow-inner"
                  />
                  <Search size={18} className="absolute right-4 top-3 sm:top-3.5 text-zinc-400" />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')} 
                      className="absolute left-3.5 top-3 sm:top-3.5 text-zinc-500 hover:text-white text-xs font-bold"
                    >
                      âœ•
                    </button>
                  )}
                </div>
              </div>

              {/* Horizontal Noon-Style Circular Categories */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2">
                  <span className="text-[10px] sm:text-xs font-black text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles size={13} className="animate-pulse text-amber-500" />
                    <span>{i18n.language === 'en' ? "Browse Store Sections" : "ط£ظ‚ط³ط§ظ… ط§ظ„ظ…طھط¬ط± ط§ظ„ظ…طھط§ط­ط©"}</span>
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {i18n.language === 'en' ? `Showing ${filteredProducts.length} items` : `ظ…ط¹ط±ظˆط¶ ${filteredProducts.length} ظ…ظ†طھط¬`}
                  </span>
                </div>

                {/* Categories Slider List */}
                <div 
                  className="w-full overflow-x-auto flex gap-4 sm:gap-6 justify-start py-2 px-1 scrollbar-none" 
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {['ط§ظ„ظƒظ„', ...(store.categories && store.categories.length > 0 ? store.categories : Array.from(new Set(storeProducts.map(p => p.category))))].map((cat) => {
                    const isSel = selectedCategory === cat;
                    const visual = CATEGORY_VISUALS[cat] || { icon: 'ًں“¦', color: 'from-zinc-850 to-zinc-900' };
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          // Smooth scroll to the products section of the template
                          const prodSec = document.getElementById('store-products-section');
                          if (prodSec) {
                            prodSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                        className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none cursor-pointer"
                      >
                        {/* Circle */}
                        <div 
                          className={`w-12 h-12 sm:w-15 sm:h-15 rounded-full flex items-center justify-center bg-gradient-to-br ${visual.color} border-2 transition-all duration-300 transform group-hover:scale-110 shadow-md ${
                            isSel 
                              ? 'border-amber-400 scale-105 shadow-[0_0_15px_rgba(212,166,61,0.35)]' 
                              : 'border-zinc-800/80 group-hover:border-zinc-700'
                          }`}
                        >
                          <span className="text-lg sm:text-xl filter drop-shadow">{visual.icon}</span>
                        </div>
                        {/* Title */}
                        <span 
                          className={`text-[9px] sm:text-[11px] font-bold tracking-tight text-center transition-colors ${
                            isSel ? 'text-amber-400 font-extrabold' : 'text-zinc-400 group-hover:text-zinc-200'
                          }`}
                        >
                          {cat}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
            )}

            <div id="store-products-section" className="space-y-8">
              {templateType === 'mobile' ? (
              <div className="space-y-12 pb-12 text-right font-sans" dir="rtl">
                
                {/* SECTION 1: HERO BANNER (بنر رئيسي احترافي) */}
                <div className="relative rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-950">
                  {(store.banners || []).length > 0 ? (
                    <div className="relative min-h-[300px] sm:min-h-[400px] flex items-center p-6 sm:p-12 bg-gradient-to-r from-zinc-950 via-zinc-900/90 to-transparent">
                      {(store.banners || [])[currentBannerIdx]?.videoUrl ? (
                        <video 
                          src={(store.banners || [])[currentBannerIdx].videoUrl} 
                          autoPlay 
                          loop 
                          muted 
                          playsInline 
                          className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none" 
                        />
                      ) : (
                        <img 
                          src={(store.banners || [])[currentBannerIdx]?.image || store.cover || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&h=500&fit=crop'} 
                          alt="" 
                          className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none filter blur-[1px]" 
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className="relative z-10 max-w-xl space-y-4">
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-black inline-flex items-center gap-1.5">
                          <Sparkles size={12} className="animate-spin" /> مركز معتمد لصيانة وبيع الهواتف الذكية ⚡
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                          {(store.banners || [])[currentBannerIdx]?.title || store.name}
                        </h2>
                        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                          {(store.banners || [])[currentBannerIdx]?.subtitle || store.description}
                        </p>
                        <div className="flex items-center gap-3 pt-2 flex-wrap">
                          <button 
                            onClick={() => {
                              const el = document.getElementById('phone-repair-booking');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }} 
                            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <Wrench size={16} /> حجز صيانة فورية
                          </button>
                          <button 
                            onClick={() => {
                              const el = document.getElementById('new-phones-section');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }} 
                            className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl border border-zinc-700 transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <Smartphone size={16} /> تصفح أحدث الهواتف
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* SECTION 2: PHONE CATEGORIES (أقسام خاصة بالهواتف) */}
                <div className="bg-zinc-950/80 border border-zinc-850 p-5 rounded-3xl shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                    <h3 className="text-sm font-black text-amber-400 flex items-center gap-2">
                      <Smartphone size={18} /> أقسام المتجر المتخصصة في الهواتف
                    </h3>
                    <span className="text-[11px] text-zinc-400">اختر القسم للتنقل السريع</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {[
                      { id: 'all', name: 'جميع المنتجات', icon: '📱', target: 'store-products-section' },
                      { id: 'new', name: 'الهواتف الجديدة', icon: '✨', target: 'new-phones-section' },
                      { id: 'used', name: 'الهواتف المستعملة', icon: '🔄', target: 'used-phones-section' },
                      { id: 'repair', name: 'قسم الصيانة', icon: '🛠️', target: 'phone-repair-booking' },
                      { id: 'acc', name: 'الإكسسوارات', icon: '🎧', target: 'accessories-section' },
                      { id: 'offers', name: 'العروض الخاصة', icon: '🔥', target: 'special-offers-section' }
                    ].map(c => (
                      <button 
                        key={c.id}
                        onClick={() => {
                          const el = document.getElementById(c.target);
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="p-3.5 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 rounded-2xl flex flex-col items-center gap-2 transition-all cursor-pointer group"
                      >
                        <span className="text-2xl group-hover:scale-110 transition-transform">{c.icon}</span>
                        <span className="text-xs font-bold text-zinc-300 group-hover:text-amber-400">{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* SECTION 3: NEW PHONES (قسم الهواتف الجديدة) */}
                <div id="new-phones-section" className="space-y-4">
                  <div className="flex items-center justify-between border-r-4 border-amber-500 pr-3">
                    <div>
                      <h3 className="text-base font-black text-white flex items-center gap-2">
                        <span>📱 قسم الهواتف الجديدة</span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold">أحدث الإصدارات كفالة معتمدة</span>
                      </h3>
                      <p className="text-xs text-zinc-400">أجهزة أبل وايفون وسامسونج وشاومي جديدة كلياً بضمان الوكيل</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {storeProducts.slice(0, 8).map(product => (
                      <div key={product.id} className="bg-zinc-950 border border-zinc-850 hover:border-amber-500/40 rounded-2xl overflow-hidden shadow-lg transition-all group flex flex-col justify-between">
                        <div className="relative aspect-square bg-zinc-900 overflow-hidden cursor-pointer" onClick={() => setCheckoutProduct(product)}>
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                          <span className="absolute top-2 right-2 bg-green-500/20 text-green-400 border border-green-500/30 text-[9px] font-black px-2 py-0.5 rounded-full">جديد بالكرتونة</span>
                        </div>
                        <div className="p-3.5 space-y-2 text-right">
                          <h4 className="text-xs font-black text-white line-clamp-1 group-hover:text-amber-400 cursor-pointer" onClick={() => setCheckoutProduct(product)}>{product.name}</h4>
                          <div className="flex items-center justify-between">
                            <span className="text-amber-400 font-black text-xs font-mono">{product.price} {currencySymbol}</span>
                            {product.originalPrice && <span className="text-[10px] text-zinc-500 line-through font-mono">{product.originalPrice}</span>}
                          </div>
                          <button onClick={() => setCheckoutProduct(product)} className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5">
                            <ShoppingBag size={14} /> أطلب الآن
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 4: USED PHONES (قسم الهواتف المستعملة) */}
                <div id="used-phones-section" className="space-y-4">
                  <div className="flex items-center justify-between border-r-4 border-blue-500 pr-3">
                    <div>
                      <h3 className="text-base font-black text-white flex items-center gap-2">
                        <span>🔄 قسم الهواتف المستعملة (كسر زيرو)</span>
                        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold">فحص شامل + ضمان المتجر</span>
                      </h3>
                      <p className="text-xs text-zinc-400">هواتف كسر زيرو وحالة ممتازة مفحوصة بالكامل بخبرة مهندسينا</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {storeProducts.slice(0, 4).map(product => (
                      <div key={`used-${product.id}`} className="bg-zinc-950 border border-zinc-850 hover:border-blue-500/40 rounded-2xl overflow-hidden shadow-lg transition-all group flex flex-col justify-between">
                        <div className="relative aspect-square bg-zinc-900 overflow-hidden cursor-pointer" onClick={() => setCheckoutProduct(product)}>
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                          <span className="absolute top-2 right-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] font-black px-2 py-0.5 rounded-full">حالة كسر زيرو 100%</span>
                        </div>
                        <div className="p-3.5 space-y-2 text-right">
                          <h4 className="text-xs font-black text-white line-clamp-1 group-hover:text-blue-400 cursor-pointer" onClick={() => setCheckoutProduct(product)}>{product.name}</h4>
                          <div className="flex items-center justify-between">
                            <span className="text-blue-400 font-black text-xs font-mono">{product.price} {currencySymbol}</span>
                            <span className="text-[9px] text-zinc-400">ضمان 3 أشهر</span>
                          </div>
                          <button onClick={() => setCheckoutProduct(product)} className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5">
                            <ShoppingBag size={14} /> أطلب هذا الجهاز
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 5: MAINTENANCE SECTION (قسم الصيانة وطلب الإصلاح) */}
                <div id="phone-repair-booking" className="bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-amber-500/30 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-amber-400 flex items-center gap-2">
                        <Wrench className="animate-bounce text-amber-500" size={22} />
                        <span>قسم الصيانة وحجز أعطال الأجهزة الذكية</span>
                      </h3>
                      <p className="text-xs text-zinc-400">احجز موعد صيانة جهازك أونلاين واحصل على خصم 15% على قطع الغيار الأصلية</p>
                    </div>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!repairPhone || !repairDevice) {
                      alert('يرجى تحديد نوع الجهاز ورقم الهاتف لحجز موعد الصيانة');
                      return;
                    }
                    try {
                      const req = {
                        id: `req-${Date.now()}`,
                        storeId: store.id,
                        deviceBrand: repairDevice,
                        issue: repairProblem || 'صيانة عامة وفحص أعطال',
                        userPhone: repairPhone,
                        status: 'pending',
                        createdAt: new Date().toISOString()
                      };
                      const saved = JSON.parse(localStorage.getItem('mix_store_requests') || '[]');
                      saved.push(req);
                      localStorage.setItem('mix_store_requests', JSON.stringify(saved));
                      window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_store_requests' } }));
                      fbSync.saveStoreRequest(req);
                      setRepairSuccess(true);
                      setTimeout(() => setRepairSuccess(false), 4000);
                    } catch (err) { console.error(err); }
                  }} className="space-y-4">
                    {repairSuccess && (
                      <div className="p-4 bg-green-500/20 border border-green-500/40 rounded-2xl text-green-300 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 size={18} /> تم استلام طلب صيانة جهازك بنجاح! سيتواصل معك المهندس المختص فوراً.
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1.5">نوع الجهاز والموديل *</label>
                        <input type="text" placeholder="مثال: iPhone 15 Pro Max أو S24 Ultra" value={repairDevice} onChange={(e) => setRepairDevice(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-amber-500" required />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1.5">نوع المشكلة / عطل الجهاز</label>
                        <select value={repairProblem} onChange={(e) => setRepairProblem(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-amber-500">
                          <option value="شاشة مكسورة / تبديل شاشة">تبديل شاشة أصلية</option>
                          <option value="تغيير بطارية (صحة 100%)">تغيير بطارية جديدة</option>
                          <option value="مشكلة بالشحن / سوكيت الشحن">إصلاح منفذ الشحن</option>
                          <option value="عطل بالسماعات أو المايك">إصلاح الصوت والسماعات</option>
                          <option value="سقوط بالماء / صيانة بوردة">صيانة مايكروسكوب واللوحة الأم</option>
                          <option value="سوفت وير وفك رمز القفل">سوفت وير وفك حسابات</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-300 mb-1.5">رقم هاتف للتواصل *</label>
                        <input type="tel" placeholder="010XXXXXXXX" value={repairPhone} onChange={(e) => setRepairPhone(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white font-mono text-left focus:outline-none focus:border-amber-500" required />
                      </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2">
                      <Wrench size={16} /> إرسال طلب الصيانة الفوري
                    </button>
                  </form>
                </div>

                {/* SECTION 6: ACCESSORIES (قسم الإكسسوارات) */}
                <div id="accessories-section" className="space-y-4">
                  <div className="flex items-center justify-between border-r-4 border-purple-500 pr-3">
                    <div>
                      <h3 className="text-base font-black text-white flex items-center gap-2">
                        <span>🎧 قسم الإكسسوارات والكفرات والملحقات</span>
                      </h3>
                      <p className="text-xs text-zinc-400">كفرات حماية، حمايات شاشة، شواحن سريعة، وسماعات لاسلكية عالية الجودة</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {storeProducts.slice(0, 4).map(product => (
                      <div key={`acc-${product.id}`} className="bg-zinc-950 border border-zinc-850 hover:border-purple-500/40 rounded-2xl overflow-hidden shadow-lg transition-all group flex flex-col justify-between">
                        <div className="relative aspect-square bg-zinc-900 overflow-hidden cursor-pointer" onClick={() => setCheckoutProduct(product)}>
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                        </div>
                        <div className="p-3.5 space-y-2 text-right">
                          <h4 className="text-xs font-black text-white line-clamp-1 group-hover:text-purple-400 cursor-pointer" onClick={() => setCheckoutProduct(product)}>{product.name}</h4>
                          <span className="text-purple-400 font-black text-xs font-mono block">{product.price} {currencySymbol}</span>
                          <button onClick={() => setCheckoutProduct(product)} className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5">
                            <ShoppingBag size={14} /> أطلب الآن
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 7: SPECIAL OFFERS (قسم العروض) */}
                <div id="special-offers-section" className="space-y-4">
                  <div className="flex items-center justify-between border-r-4 border-red-500 pr-3">
                    <div>
                      <h3 className="text-base font-black text-white flex items-center gap-2">
                        <span>🔥 قسم العروض والتخفيضات الكبرى</span>
                      </h3>
                      <p className="text-xs text-zinc-400">باكجات حماية وعروض خصم مميزة لفترة محدودة</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {offerProducts.map(product => (
                      <div key={`offer-${product.id}`} className="p-4 bg-gradient-to-r from-red-950/40 via-zinc-950 to-zinc-950 border border-red-500/30 rounded-2xl flex items-center gap-4 shadow-lg">
                        <img src={product.image} alt="" className="w-20 h-20 rounded-xl object-cover border border-zinc-800 shrink-0" referrerPolicy="no-referrer" />
                        <div className="flex-1 space-y-1 text-right min-w-0">
                          <span className="text-[9px] bg-red-600 text-white font-black px-2 py-0.5 rounded-full uppercase">خصم حصري</span>
                          <h4 className="text-xs font-black text-white truncate">{product.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-red-400 font-black text-xs font-mono">{product.price} {currencySymbol}</span>
                            {product.originalPrice && <span className="text-[10px] text-zinc-500 line-through font-mono">{product.originalPrice}</span>}
                          </div>
                          <button onClick={() => setCheckoutProduct(product)} className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] rounded-lg cursor-pointer">
                            احصل على العرض
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 8: SERVICES (قسم الخدمات) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { title: 'صيانة سريعة 30 دقيقة', desc: 'إصلاح أغلب الأعطال فورياً أمامك في نفس اليوم', icon: '⚡', color: 'from-amber-500/10 to-amber-500/5 border-amber-500/30' },
                    { title: 'ضمان معتمد 6 أشهر', desc: 'كفالة حقيقية على كافة قطع الغيار والشاشات', icon: '🛡️', color: 'from-blue-500/10 to-blue-500/5 border-blue-500/30' },
                    { title: 'استبدال جهازك القديم', desc: 'نشتري جهازك القديم بأفضل سعر ونقوم باستبداله', icon: '🔄', color: 'from-purple-500/10 to-purple-500/5 border-purple-500/30' },
                    { title: 'فحص مجاني شامل', desc: 'تشخيص دقيق لكافة الأعطال بدون أي تكلفة', icon: '🔍', color: 'from-green-500/10 to-green-500/5 border-green-500/30' }
                  ].map((srv, i) => (
                    <div key={i} className={`p-4 bg-gradient-to-b ${srv.color} border rounded-2xl space-y-2 text-right`}>
                      <span className="text-3xl block">{srv.icon}</span>
                      <h4 className="text-xs font-black text-white">{srv.title}</h4>
                      <p className="text-[10.5px] text-zinc-400 leading-relaxed">{srv.desc}</p>
                    </div>
                  ))}
                </div>

                {/* SECTION 9: POPULAR PRODUCTS (قسم أشهر المنتجات) */}
                <div className="space-y-4">
                  <h3 className="text-base font-black text-white flex items-center gap-2 border-r-4 border-amber-500 pr-3">
                    <span>⭐ قسم أشهر المنتجات والأكثر طلبًا</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {storeProducts.slice(0, 4).map(product => (
                      <div key={`pop-${product.id}`} className="bg-zinc-950 border border-zinc-850 p-3 rounded-2xl flex items-center gap-3">
                        <img src={product.image} alt="" className="w-14 h-14 rounded-xl object-cover border border-zinc-800 shrink-0" referrerPolicy="no-referrer" />
                        <div className="space-y-1 text-right min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-white truncate cursor-pointer" onClick={() => setCheckoutProduct(product)}>{product.name}</h4>
                          <span className="text-amber-400 font-extrabold text-xs font-mono block">{product.price} {currencySymbol}</span>
                          <button onClick={() => setCheckoutProduct(product)} className="text-[10px] text-amber-400 hover:underline font-bold cursor-pointer">شراء الآن ←</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 10: LATEST PRODUCTS (قسم أحدث المنتجات) */}
                <div className="space-y-4">
                  <h3 className="text-base font-black text-white flex items-center gap-2 border-r-4 border-green-500 pr-3">
                    <span>🆕 قسم أحدث المنتجات المضافة</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {storeProducts.slice(-4).map(product => (
                      <div key={`lat-${product.id}`} className="bg-zinc-950 border border-zinc-850 p-3 rounded-2xl flex items-center gap-3">
                        <img src={product.image} alt="" className="w-14 h-14 rounded-xl object-cover border border-zinc-800 shrink-0" referrerPolicy="no-referrer" />
                        <div className="space-y-1 text-right min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-white truncate cursor-pointer" onClick={() => setCheckoutProduct(product)}>{product.name}</h4>
                          <span className="text-green-400 font-extrabold text-xs font-mono block">{product.price} {currencySymbol}</span>
                          <button onClick={() => setCheckoutProduct(product)} className="text-[10px] text-green-400 hover:underline font-bold cursor-pointer">أطلب الآن ←</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 11: CUSTOMER REVIEWS (قسم تقييمات العملاء) */}
                <div className="bg-zinc-950 border border-zinc-850 p-6 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <h3 className="text-sm font-black text-amber-400 flex items-center gap-2">
                      <Star size={16} fill="currentColor" /> آراء وتقييمات عملاء مركز الصيانة والمتجر
                    </h3>
                    <span className="text-xs text-zinc-400">تقييم ممتاز ({store.rating} / 5)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {storeReviews.length > 0 ? storeReviews.map(r => (
                      <div key={r.id} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-2 text-right">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{r.userName}</span>
                          <div className="flex items-center text-amber-400 text-xs">
                            {'★'.repeat(r.rating)}
                          </div>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">"{r.comment}"</p>
                        <span className="text-[9px] text-zinc-500 block">{r.date}</span>
                      </div>
                    )) : (
                      <div className="col-span-full text-center py-4 text-xs text-zinc-500">
                        أول من يضيف تقييماً لهذا المتجر! جميع خدماتنا مضمونة 100%.
                      </div>
                    )}
                  </div>
                </div>

                {/* SECTION 12: CONTACT (قسم التواصل) */}
                <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 text-right">
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                      <Phone size={18} className="text-green-400" /> هل تحتاج استشارة تقنية أو تواصل سريع معك؟
                    </h4>
                    <p className="text-xs text-zinc-400">مهندسو الصيانة جاهزون للرد على استفساراتك مباشرة</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <a href={`https://wa.me/${store.storePhone || '201000000000'}`} target="_blank" rel="noreferrer" className="px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all">
                      تواصل واتساب 💬
                    </a>
                    <button onClick={() => setShowChat(true)} className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer">
                      محادثة مباشرة ⚡
                    </button>
                  </div>
                </div>

                {/* SECTION 13: STORE LOCATION (قسم موقع المتجر) */}
                <div className="bg-zinc-950 border border-zinc-850 p-6 rounded-3xl space-y-4 text-right">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <h4 className="text-sm font-black text-amber-400 flex items-center gap-2">
                      <MapPin size={18} /> موقع المتجر وساعات العمل الرسمية
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-zinc-300">
                    <div className="space-y-2 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-850">
                      <span className="font-extrabold text-white block">📍 العنوان:</span>
                      <p>{store.city} - {store.district || 'المنطقة الرئيسية'} - {store.description}</p>
                    </div>
                    <div className="space-y-2 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-850">
                      <span className="font-extrabold text-white block">⏰ مواعيد العمل:</span>
                      <p>يومياً من الساعة 10:00 صباحاً حتى 11:00 مساءً (الجمعة من 2:00 ظهراً)</p>
                    </div>
                  </div>
                </div>

              </div>
              ) : templateType === 'clothing' ? (
              /* Placeholder - will be replaced by template below */
              null
              ) : null}

            {/* -------------------- TEMPLATE: 2. CLOTHING & BOUTIQUE -------------------- */}
            {templateType === 'clothing' && (
              <div className="space-y-6">
                {/* Fashion Coupon tag */}
                <div className="bg-gradient-to-r from-amber-500/10 to-red-500/10 border-2 border-dashed border-amber-500/30 p-4 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-right">
                  <div>
                    <span className="text-[10px] font-black text-amber-500 uppercase block mb-0.5">ط®طµظˆظ…ط§طھ ظ†ظ‡ط§ظٹط© ط§ظ„ظ…ظˆط³ظ… ط§ظ„ظƒط¨ط±ظ‰ ًں§¥</span>
                    <h4 className="text-xs font-extrabold text-white">ط§ط³طھط®ط¯ظ… ظƒظˆط¨ظˆظ† <span className="text-amber-400 font-mono">FASHION10</span> ظ„ظ„ط­طµظˆظ„ ط¹ظ„ظ‰ ط®طµظ… 10% ط¥ط¶ط§ظپظٹ ظپظˆط±ظٹ!</h4>
                  </div>
                  <span className="px-3 py-1 bg-white text-black font-black text-[10px] rounded-lg uppercase">طھظ†ط´ظٹط· ط§ظ„ظƒظˆط¯</span>
                </div>

                {/* Staggered Modern Fashion view */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Quick Categories list */}
                  <div className="bg-zinc-950 p-4 rounded-2xl border" style={{ borderColor: 'var(--store-frame)' }}>
                    <h3 className="text-xs font-bold text-white border-b pb-2 mb-3" style={{ borderColor: 'var(--store-frame)' }}>ظ…ط¬ظ…ظˆط¹ط§طھ ط§ظ„ط£ط²ظٹط§ط،</h3>
                    <div className="flex flex-col gap-1">
                      <button onClick={() => setSelectedCategory('ط§ظ„ظƒظ„')} className={`px-3 py-2 text-right text-xs rounded-xl transition-all font-semibold ${selectedCategory === 'ط§ظ„ظƒظ„' ? 'bg-amber-400 text-black font-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}>ط§ظ„ظƒظ„ ({storeProducts.length})</button>
                      {store.categories.map((c, i) => (
                        <button key={i} onClick={() => setSelectedCategory(c)} className={`px-3 py-2 text-right text-xs rounded-xl transition-all font-semibold ${selectedCategory === c ? 'bg-amber-400 text-black font-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}>{c}</button>
                      ))}
                    </div>
                  </div>

                  {/* Main Grid */}
                  <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {filteredProducts.map(product => (
                      <div key={product.id} onClick={() => setSelectedProduct(product)} className="group bg-zinc-950 border rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-all flex flex-col justify-between" style={{ borderColor: 'var(--store-frame)' }}>
                        <div className="relative aspect-[4/5] bg-zinc-900 overflow-hidden">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" referrerPolicy="no-referrer" />
                          {product.isOffer && <span className="absolute top-2 right-2 bg-red-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full uppercase">HOT</span>}
                        </div>
                        <div className="p-3">
                          <span className="text-[9px] text-zinc-500 uppercase font-black">{product.category}</span>
                          <h4 className="text-white text-xs font-bold mt-0.5 group-hover:text-amber-400 line-clamp-1">{product.name}</h4>
                          <p className="text-[10px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed" style={{ color: 'var(--store-text)' }}>{product.description}</p>
                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-900">
                            <span className="text-white font-black font-mono text-xs">{product.price} {currencySymbol}</span>
                            <button onClick={(e) => { e.stopPropagation(); openQuickCheckout(product); }} className="px-2.5 py-1 bg-white text-black font-bold text-[9px] rounded-lg hover:bg-amber-400 cursor-pointer">ط§ظ‚طھظ†ط§ط، ًں›چï¸ڈ</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- TEMPLATE: 3. LUXURY PERFUMES -------------------- */}
            {templateType === 'perfume' && (
              <div className="space-y-6">
                <div className="text-center max-w-lg mx-auto py-4">
                  <span className="text-[9px] text-amber-500 font-extrabold uppercase tracking-widest block mb-1">ط¹ط·ظˆط± ط§ظ„ظ†ظٹط´ ظˆط§ظ„ط±ظˆط§ط¦ط­ ط§ظ„ط´ط±ظ‚ظٹط© ًں•Œ</span>
                  <h3 className="text-xl font-extrabold text-white mb-2" style={{ fontFamily: 'Georgia, serif' }}>ظ…ط¬ظ…ظˆط¹ط© ط§ظ„ط¹ط·ظˆط± ط§ظ„ظپط§ط®ط±ط©</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed" style={{ color: 'var(--store-text)' }}>ط§ظ†ط؛ظ…ط³ ظپظٹ ظ…ط²ظٹط¬ ظپط§ط®ط± ظ…ظ† ط§ظ„ط¹ظˆط¯ ظˆط§ظ„ظ…ط³ظƒ ظˆط§ظ„ط¹ظ†ط¨ط± ط§ظ„ط°ظٹ ظٹط¹ط¨ط± ط¹ظ† ط§ظ„ظپط®ط§ظ…ط© ظˆط§ظ„ط±ظˆط¹ط© ط§ظ„ط´ط±ظ‚ظٹط© ط§ظ„ط£طµظٹظ„ط©.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map(product => (
                    <div key={product.id} onClick={() => setSelectedProduct(product)} className="group relative bg-black/80 border rounded-2xl overflow-hidden p-4 cursor-pointer text-center space-y-3 hover:shadow-[0_10px_30px_rgba(212,175,55,0.08)] transition-all duration-300" style={{ borderColor: 'var(--store-primary)' }}>
                      <div className="aspect-square bg-zinc-950 rounded-xl overflow-hidden relative border" style={{ borderColor: 'var(--store-frame)' }}>
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                        <span className="absolute bottom-2 left-2 bg-black/80 text-[#D4AF37] border border-[#D4AF37]/40 text-[8px] px-2 py-0.5 rounded-full font-bold">ط¹ط·ظˆط± ظپط§ط®ط±ط©</span>
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-[9px] text-[#D4AF37] font-black uppercase block tracking-wider">{product.category}</span>
                        <h4 className="text-white text-xs sm:text-sm font-extrabold line-clamp-1">{product.name}</h4>
                        <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed" style={{ color: 'var(--store-text)' }}>{product.description}</p>
                      </div>

                      <div className="pt-2 border-t flex items-center justify-between" style={{ borderColor: 'var(--store-frame)' }}>
                        <span className="text-[#D4AF37] font-bold font-mono text-xs">{product.price} {currencySymbol}</span>
                        <button onClick={(e) => { e.stopPropagation(); openQuickCheckout(product); }} className="px-3 py-1.5 bg-[#D4AF37] hover:bg-white text-black font-extrabold text-[9px] rounded-xl transition-all cursor-pointer">ط·ظ„ط¨ ظپظˆط±ظٹ âڑ،</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* -------------------- TEMPLATE: 4. SHOES & SPORTS -------------------- */}
            {templateType === 'shoes' && (
              <div className="space-y-6">
                {/* Athletic dynamic tag banner */}
                <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white p-4 rounded-3xl flex items-center justify-between text-right shadow-lg">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest block bg-white/25 px-2 py-0.5 rounded-full self-start max-w-max mb-1">ط§ظ„ط³ط±ط¹ط© ظˆط§ظ„ط±ط§ط­ط© ط§ظ„ظƒظ„ظٹط© ًں‘ں</span>
                    <h4 className="text-xs sm:text-sm font-black">ط£ط­ط°ظٹط© ط±ظٹط§ط¶ظٹط© ظˆط·ط¨ظٹط© ظ…ظ‚ط§ظˆظ…ط© ظ„ظ„ط§ظ†ط²ظ„ط§ظ‚ ط¨ط£ظپط¶ظ„ ط§ظ„ط£ط³ط¹ط§ط±</h4>
                  </div>
                  <span className="px-3 py-1.5 bg-black text-white font-black text-[10px] rounded-xl">ط´ط§ظ‡ط¯ ط§ظ„ط¹ط±ظˆط¶</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {filteredProducts.map(product => (
                    <div key={product.id} onClick={() => setSelectedProduct(product)} className="group bg-zinc-900/60 border rounded-2xl overflow-hidden p-3 cursor-pointer flex flex-col justify-between hover:border-red-500/40 transition-all" style={{ borderColor: 'var(--store-frame)' }}>
                      <div className="aspect-square bg-zinc-950 rounded-xl overflow-hidden relative flex items-center justify-center">
                        <div className="absolute w-24 h-24 rounded-full bg-red-600/10 blur-xl group-hover:bg-red-600/20 transition-all" />
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover relative z-10 group-hover:rotate-3 group-hover:scale-105 transition-all" referrerPolicy="no-referrer" />
                      </div>
                      <div className="mt-2 flex-1 text-right">
                        <span className="text-[8px] bg-red-600/10 text-red-500 px-1.5 py-0.5 rounded-full font-bold uppercase">{product.category}</span>
                        <h4 className="text-white text-xs font-black line-clamp-1 mt-1">{product.name}</h4>
                        <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5" style={{ color: 'var(--store-text)' }}>{product.description}</p>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800">
                        <span className="text-red-500 font-bold font-mono text-xs">{product.price} {currencySymbol}</span>
                        <button onClick={(e) => { e.stopPropagation(); openQuickCheckout(product); }} className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-black text-[9px] rounded-lg cursor-pointer">ط´ط±ط§ط، âڑ،</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* -------------------- TEMPLATE: 5. ELECTRONICS & APPLIANCES -------------------- */}
            {templateType === 'electronics' && (
              <div className="space-y-6">
                {/* Tech specifications grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-950/20 border border-blue-500/25 p-4 rounded-2xl text-right">
                    <span className="text-xs font-black text-blue-400 block mb-1">ًں›،ï¸ڈ ط¶ظ…ط§ظ† ط§ظ„ظˆظƒظٹظ„ ط§ظ„ط±ط³ظ…ظٹ</span>
                    <p className="text-[10px] text-zinc-400">ط¬ظ…ظٹط¹ ط§ظ„ط£ط¬ظ‡ط²ط© ط§ظ„ظƒظ‡ط±ط¨ط§ط¦ظٹط© ظ…ط´ظ…ظˆظ„ط© ط¨ط¶ظ…ط§ظ† ط§ط³طھط¨ط¯ط§ظ„ ظˆطµظٹط§ظ†ط© ط±ط³ظ…ظٹ ظ„ظ…ط¯ط© ط³ظ†طھظٹظ†.</p>
                  </div>
                  <div className="bg-blue-950/20 border border-blue-500/25 p-4 rounded-2xl text-right">
                    <span className="text-xs font-black text-blue-400 block mb-1">ًںڑڑ ط´ط­ظ† ط¢ظ…ظ† ظˆط³ط±ظٹط¹</span>
                    <p className="text-[10px] text-zinc-400">ط´ط­ظ† ط¢ظ…ظ† ظ„ظ„ط£ط¬ظ‡ط²ط© ط§ظ„ظƒط¨ظٹط±ط© ظ…ط¹ ط¶ظ…ط§ظ† ط§ظ„ط³ظ„ط§ظ…ط© ظ…ظ† ط£ظٹ ط®ط¯ط´ ظˆطھظˆطµظٹظ„ ظ„ط¨ط§ط¨ ظ…ظ†ط²ظ„ظƒ.</p>
                  </div>
                  <div className="bg-blue-950/20 border border-blue-500/25 p-4 rounded-2xl text-right">
                    <span className="text-xs font-black text-blue-400 block mb-1">ًں’³ ط¨ظˆط§ط¨ط§طھ ط¯ظپط¹ ظ…ظٹط³ط±ط©</span>
                    <p className="text-[10px] text-zinc-400">ط§ط¯ظپط¹ ط¹ظ†ط¯ ط§ظ„ط§ط³طھظ„ط§ظ…طŒ ط£ظˆ ط¨ط§ظ„طھظ‚ط³ظٹط· ط§ظ„ظ…ظٹط³ط±طŒ ط£ظˆ ط¹ط¨ط± ط§ظ„طھط­ظˆظٹظ„ ط§ظ„ط¨ظ†ظƒظٹ ط§ظ„ظپظˆط±ظٹ.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                  {filteredProducts.map(product => (
                    <div key={product.id} onClick={() => setSelectedProduct(product)} className="group bg-zinc-950 border rounded-2xl p-3 cursor-pointer flex flex-col justify-between hover:border-blue-500/40 hover:shadow-lg transition-all" style={{ borderColor: 'var(--store-frame)' }}>
                      <div className="aspect-square bg-zinc-900 rounded-xl overflow-hidden relative shrink-0">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-all" referrerPolicy="no-referrer" />
                        <span className="absolute top-2 right-2 bg-blue-600 text-white font-black text-[8px] px-2 py-0.5 rounded-full">ط¶ظ…ط§ظ† ط³ظ†طھظٹظ†</span>
                      </div>
                      <div className="mt-2.5 flex-1">
                        <span className="text-[9px] text-blue-400 font-bold uppercase">{product.category}</span>
                        <h4 className="text-white text-xs font-bold line-clamp-1">{product.name}</h4>
                        <p className="text-[10px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed" style={{ color: 'var(--store-text)' }}>{product.description}</p>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800">
                        <span className="text-blue-400 font-bold font-mono text-xs">{product.price} {currencySymbol}</span>
                        <button onClick={(e) => { e.stopPropagation(); openQuickCheckout(product); }} className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-black text-[9px] rounded-lg cursor-pointer">ط§ط·ظ„ط¨ ط§ظ„ط¢ظ† âڑ،</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* -------------------- TEMPLATE: 6. MULTICATEGORY BAZAAR -------------------- */}
            {templateType === 'multicategory' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Right categories bar */}
                <div className="md:col-span-3 space-y-4">
                  <div className="bg-zinc-950 border rounded-2xl p-4" style={{ borderColor: 'var(--store-frame)' }}>
                    <h3 className="text-xs font-black text-white mb-3 pb-2 border-b flex items-center gap-1.5" style={{ borderColor: 'var(--store-frame)' }}>
                      <Sparkle size={14} style={{ color: 'var(--store-primary)' }} />
                      <span>ط£ظ‚ط³ط§ظ… ط§ظ„ظ…طھط¬ط± ط§ظ„ط´ط§ظ…ظ„</span>
                    </h3>
                    
                    <div className="flex flex-col gap-1">
                      <button onClick={() => setSelectedCategory('ط§ظ„ظƒظ„')} className={`px-3 py-2 text-xs font-semibold text-right rounded-xl transition-all cursor-pointer ${selectedCategory === 'ط§ظ„ظƒظ„' ? 'bg-amber-400 text-black font-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}>ظƒظ„ ط§ظ„ظ…ظ†طھط¬ط§طھ ({storeProducts.length})</button>
                      {store.categories.map((cat, idx) => (
                        <button key={idx} onClick={() => setSelectedCategory(cat)} className={`px-3 py-2 text-xs font-semibold text-right rounded-xl transition-all cursor-pointer ${selectedCategory === cat ? 'bg-amber-400 text-black font-black' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}>{cat}</button>
                      ))}
                    </div>
                  </div>

                  {/* Standard info */}
                  <div className="bg-zinc-900/20 border rounded-2xl p-4 text-[11px] text-zinc-400 space-y-2 leading-relaxed text-right" style={{ borderColor: 'var(--store-frame)' }}>
                    <h4 className="font-bold text-zinc-300 flex items-center gap-1">ًں“¦ ط´ط­ظ† ظ„ظƒط§ظپط© ط§ظ„ظ…ط­ط§ظپط¸ط§طھ</h4>
                    <p>ظ†ظ‚ظˆظ… ط¨طھط³ظ„ظٹظ… ط·ظ„ط¨ط§طھظƒ ط¨ط£ظ‚طµظ‰ ط³ط±ط¹ط© ظ…ظ…ظƒظ†ط© ظ…ظ† ظ…ط³طھظˆط¯ط¹ظ†ط§ ط§ظ„ط±ط¦ظٹط³ظٹ ظ…ط¨ط§ط´ط±ط© ط¥ظ„ظ‰ ط¨ط§ط¨ظƒ.</p>
                  </div>
                </div>

                {/* Left products grid */}
                <div className="md:col-span-9 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-white">ط§ظ„ظ…ظ†طھط¬ط§طھ ط§ظ„ط£ظƒط«ط± ظ…ط¨ظٹط¹ط§ظ‹ ًںŒں</h3>
                    <span className="text-[10px] text-zinc-500">ظ…ط¹ط±ظˆط¶ {filteredProducts.length} ظ…ظ†طھط¬</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                    {filteredProducts.map(product => (
                      <div key={product.id} onClick={() => setSelectedProduct(product)} className="group bg-zinc-950 border rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-all flex flex-col justify-between" style={{ borderColor: 'var(--store-frame)' }}>
                        <div className="relative aspect-square w-full bg-zinc-900 overflow-hidden shrink-0">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-all" referrerPolicy="no-referrer" />
                        </div>
                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] text-zinc-500 font-bold block">{product.category}</span>
                            <h4 className="text-white text-xs font-bold mt-1 line-clamp-1 group-hover:text-amber-400 transition-all">{product.name}</h4>
                            <p className="text-zinc-400 text-[10px] mt-1 line-clamp-2 leading-relaxed" style={{ color: 'var(--store-text)' }}>{product.description}</p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-900">
                            <span className="text-white font-bold font-mono text-xs">{product.price} {currencySymbol}</span>
                            <button onClick={(e) => { e.stopPropagation(); openQuickCheckout(product); }} className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-[9px] rounded-lg transition-colors cursor-pointer">ط§ط·ظ„ط¨ ظپظˆط±ظٹ âڑ،</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- TEMPLATE: 7. PHONE CASES -------------------- */}
            {templateType === 'phonecases' && (
              <div className="space-y-6">
                <style>{`
                  @keyframes case-pulse {
                    0%, 100% { box-shadow: 0 0 15px rgba(255,107,157,0.2); }
                    50% { box-shadow: 0 0 30px rgba(255,107,157,0.5); }
                  }
                  .case-card {
                    animation: case-pulse 3s infinite ease-in-out;
                  }
                `}</style>

                {/* ظ‚ظ„ط¨ ط§ظ„ظ…طھط¬ط± - ظٹط¸ظ‡ط± ظپظٹ ط§ظ„ظ…طھط¬ط± ظ†ظپط³ظ‡ */}
                <div className="bg-zinc-900/40 border border-pink-500/20 rounded-3xl p-4 flex flex-col items-center">
                  <PhoneCasesHeart
                    storeName={store.name}
                    storeLogo={store.logo}
                    hideButton
                    epithet={store.epithet}
                  />
                </div>

                {/* Promo Banner */}
                <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 rounded-3xl p-6 text-right text-white shadow-lg">
                  <span className="text-[9px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">ط£ط­ط¯ط« طھط´ظƒظٹظ„ط© طµظٹظ†ط§طھ ظˆط­ظ…ط§ظٹط§طھ ًں“±</span>
                  <h3 className="text-lg font-black mt-2">ظƒظپط±ط§طھ ط¬ظˆط§ظ„ ط¨طھطµط§ظ…ظٹظ… ط­طµط±ظٹط© طھظ†ط§ط³ط¨ ظƒظ„ ط§ظ„ط£ط°ظˆط§ظ‚</h3>
                  <p className="text-xs text-white/80 mt-1">ط£ط¬ظˆط¯ ط§ظ„ط®ط§ظ…ط§طھطŒ ط£ط±ط®طµ ط§ظ„ط£ط³ط¹ط§ط±طŒ طھظˆطµظٹظ„ ط³ط±ظٹط¹ ظ„ط¨ط§ط¨ ط§ظ„ط¨ظٹطھ</p>
                </div>

                {/* Categories Pills */}
                <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                  {['ط§ظ„ظƒظ„', ...(store.categories.length > 0 ? store.categories : ['ظƒظپط±ط§طھ', 'ط­ظ…ط§ظٹط§طھ', 'ط´ظˆط§ط­ظ†', 'ط¥ظƒط³ط³ظˆط§ط±ط§طھ'])].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                          : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Products Grid - Vibrant Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className="group bg-zinc-900/60 border border-pink-500/20 rounded-2xl overflow-hidden hover:border-pink-400/40 hover:shadow-[0_0_25px_rgba(255,107,157,0.15)] transition-all cursor-pointer flex flex-col justify-between case-card"
                    >
                      <div className="relative aspect-square bg-zinc-950 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent" />
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                        {product.isOffer && (
                          <span className="absolute top-2 right-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full shadow-lg">
                            {product.offerText || 'ط¹ط±ط¶'}
                          </span>
                        )}
                      </div>
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] text-pink-400 font-bold block">{product.category}</span>
                          <h4 className="text-white text-xs font-bold mt-0.5 line-clamp-1 group-hover:text-pink-300 transition-colors">{product.name}</h4>
                          <p className="text-zinc-400 text-[10px] mt-1 line-clamp-2 leading-relaxed">{product.description}</p>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800">
                          <span className="text-pink-400 font-black font-mono text-sm">{product.price} {currencySymbol}</span>
                          <button onClick={(e) => { e.stopPropagation(); openQuickCheckout(product); }} className="px-3 py-1.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-black text-[9px] rounded-xl transition-all cursor-pointer shadow-md">ط´ط±ط§ط، ًں›چï¸ڈ</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* -------------------- TEMPLATE: 8. SUPERMARKET -------------------- */}
            {templateType === 'supermarket' && (
              <div className="space-y-6">
                {/* Fresh Deals Banner */}
                <div className="bg-gradient-to-l from-green-800 to-emerald-900 rounded-3xl p-6 text-right text-white shadow-lg border border-green-500/20">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest bg-green-500/20 px-2 py-0.5 rounded-full text-green-300">ط¹ط±ظˆط¶ ط§ظ„ط£ط³ط¨ظˆط¹ ط§ظ„ط·ط§ط²ط¬ط© ًں¥¦</span>
                      <h3 className="text-lg font-black mt-2">ظƒظ„ ظ…ط³طھظ„ط²ظ…ط§طھظƒ ط§ظ„ظٹظˆظ…ظٹط© ط¨ط£ظپط¶ظ„ ط§ظ„ط£ط³ط¹ط§ط±</h3>
                      <p className="text-xs text-green-200/80 mt-1">ظ…ظ†طھط¬ط§طھ ط·ط§ط²ط¬ط©طŒ طھظˆطµظٹظ„ ظ…ط¬ط§ظ†ظٹ ظ„ظ„ط·ظ„ط¨ط§طھ ظپظˆظ‚ 100 ط±.ط³</p>
                    </div>
                    <span className="text-3xl">ًں›’</span>
                  </div>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                  {['ط§ظ„ظƒظ„', ...(store.categories.length > 0 ? store.categories : ['ظ…ظˆط§ط¯ ط؛ط°ط§ط¦ظٹط©', 'ظ…ط´ط±ظˆط¨ط§طھ', 'ظ…ظ†ط¸ظپط§طھ', 'ط·ط§ط²ط¬'])].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                          : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className="group bg-zinc-900/50 border border-green-500/15 rounded-2xl overflow-hidden hover:border-green-400/30 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div className="relative aspect-square bg-zinc-950 overflow-hidden">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                        {product.isOffer && (
                          <span className="absolute top-2 right-2 bg-green-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full">{product.offerText || 'ط¹ط±ط¶ ط®ط§طµ'}</span>
                        )}
                      </div>
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] text-green-400 font-bold block">{product.category}</span>
                          <h4 className="text-white text-xs font-bold mt-0.5 line-clamp-1 group-hover:text-green-300 transition-colors">{product.name}</h4>
                          <p className="text-zinc-400 text-[10px] mt-1 line-clamp-2">{product.description}</p>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800">
                          <span className="text-green-400 font-black font-mono text-sm">{product.price} {currencySymbol}</span>
                          <button onClick={(e) => { e.stopPropagation(); openQuickCheckout(product); }} className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white font-black text-[9px] rounded-xl transition-all cursor-pointer">ط£ط·ظ„ط¨ ًں›’</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* -------------------- TEMPLATE: 9. HOME TOOLS -------------------- */}
            {templateType === 'hometools' && (
              <div className="space-y-6">
                {/* Home Banner */}
                <div className="bg-gradient-to-l from-amber-800 to-yellow-900 rounded-3xl p-6 text-right text-white shadow-lg border border-amber-500/20">
                  <span className="text-[9px] font-black uppercase tracking-widest bg-amber-500/20 px-2 py-0.5 rounded-full text-amber-300">ط£ط¯ظˆط§طھ ظ…ظ†ط²ظ„ظٹط© ظˆط¯ظٹظƒظˆط±ط§طھ ط¹طµط±ظٹط© ًںڈ </span>
                  <h3 className="text-lg font-black mt-2">ط¬ظ‡ط² ط¨ظٹطھظƒ ط¨ط£ط­ط¯ط« ط§ظ„ظ…ط³طھظ„ط²ظ…ط§طھ</h3>
                  <p className="text-xs text-amber-200/80 mt-1">ط£ط·ظ‚ظ… ظ‚ط¯ظˆط±طŒ ط¯ظٹظƒظˆط±ط§طھطŒ ظˆط£ط¬ظ‡ط²ط© ظ…ظ†ط²ظ„ظٹط© ط¨ط¬ظˆط¯ط© ط¹ط§ظ„ظٹط© ظˆط£ط³ط¹ط§ط± ظ…ظ†ط§ظپط³ط©</p>
                </div>

                {/* Category Pills */}
                <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                  {['ط§ظ„ظƒظ„', ...(store.categories.length > 0 ? store.categories : ['ط£ط¯ظˆط§طھ ظ…ظ†ط²ظ„ظٹط©', 'ظ…ط·ط¨ط®', 'ط¯ظٹظƒظˆط±', 'ط£ط¬ظ‡ط²ط©'])].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                          : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className="group bg-zinc-900/50 border border-amber-500/15 rounded-2xl overflow-hidden hover:border-amber-400/30 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div className="relative aspect-square bg-zinc-950 overflow-hidden">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                        {product.isOffer && (
                          <span className="absolute top-2 right-2 bg-amber-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full">{product.offerText || 'ط®طµظ…'}</span>
                        )}
                      </div>
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] text-amber-400 font-bold block">{product.category}</span>
                          <h4 className="text-white text-xs font-bold mt-0.5 line-clamp-1 group-hover:text-amber-300 transition-colors">{product.name}</h4>
                          <p className="text-zinc-400 text-[10px] mt-1 line-clamp-2">{product.description}</p>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800">
                          <span className="text-amber-400 font-black font-mono text-sm">{product.price} {currencySymbol}</span>
                          <button onClick={(e) => { e.stopPropagation(); openQuickCheckout(product); }} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-[9px] rounded-xl transition-all cursor-pointer">ط§ط´طھط±ظٹ ًں›چï¸ڈ</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* -------------------- TEMPLATE: 10. COMPUTERS & TECH -------------------- */}
            {templateType === 'computers' && (
              <div className="space-y-6">
                {/* Tech Banner */}
                <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 rounded-3xl p-6 text-right text-white shadow-lg border border-blue-500/20">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest bg-blue-500/20 px-2 py-0.5 rounded-full text-blue-300">ط£ط­ط¯ط« ط§ظ„طھظ‚ظ†ظٹط§طھ ظˆط§ظ„ط£ط¬ظ‡ط²ط© ًں’»</span>
                      <h3 className="text-lg font-black mt-2">ظ„ط§ط¨طھظˆط¨ط§طھ ظˆظƒظ…ط¨ظٹظˆطھط±ط§طھ ط¨ط£ط¹ظ„ظ‰ ط§ظ„ظ…ظˆط§طµظپط§طھ</h3>
                      <p className="text-xs text-blue-200/80 mt-1">ط£ط¬ظ‡ط²ط© ط£ظ„ط¹ط§ط¨طŒ ط¹ظ…ظ„طŒ ظˆظ…ظ„ط­ظ‚ط§طھ ط¬ط±ط§ظپظٹظƒ ط§ط­طھط±ط§ظپظٹط©</p>
                    </div>
                    <span className="text-3xl">âڑ،</span>
                  </div>
                </div>

                {/* Spec Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-blue-950/20 border border-blue-500/20 p-3 rounded-2xl text-right">
                    <span className="text-xs font-black text-blue-400">âڑ، ظ…ط¹ط§ظ„ط¬ط§طھ ط§ظ„ط¬ظٹظ„ ط§ظ„ط¬ط¯ظٹط¯</span>
                    <p className="text-[10px] text-zinc-400 mt-1">Intel Core Ultra ظˆ AMD Ryzen 9000</p>
                  </div>
                  <div className="bg-blue-950/20 border border-blue-500/20 p-3 rounded-2xl text-right">
                    <span className="text-xs font-black text-blue-400">ًںژ® ظƒط±ظˆطھ ط´ط§ط´ط© RTX</span>
                    <p className="text-[10px] text-zinc-400 mt-1">ط£ط¯ط§ط، ط£ظ„ط¹ط§ط¨ ط§ط­طھط±ط§ظپظٹ ظ…ط¹ NVIDIA GeForce</p>
                  </div>
                  <div className="bg-blue-950/20 border border-blue-500/20 p-3 rounded-2xl text-right">
                    <span className="text-xs font-black text-blue-400">ًں”§ ط¶ظ…ط§ظ† ط³ظ†طھظٹظ†</span>
                    <p className="text-[10px] text-zinc-400 mt-1">ط¶ظ…ط§ظ† ظ…ط¹طھظ…ط¯ ظˆظ‚ط·ط¹ ط؛ظٹط§ط± ط£طµظ„ظٹط© ظ…طھظˆظپط±ط©</p>
                  </div>
                </div>

                {/* Category Pills */}
                <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                  {['ط§ظ„ظƒظ„', ...(store.categories.length > 0 ? store.categories : ['ظ„ط§ط¨طھظˆط¨', 'ظ‚ط·ط¹ ظƒظ…ط¨ظٹظˆطھط±', 'ظ…ظ„ط­ظ‚ط§طھ', 'ط´ط§ط´ط§طھ'])].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                          : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                      className="group bg-zinc-900/50 border border-blue-500/15 rounded-2xl overflow-hidden hover:border-blue-400/30 hover:shadow-[0_0_25px_rgba(59,130,246,0.1)] transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div className="relative aspect-square bg-zinc-950 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent" />
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                        {product.isOffer && (
                          <span className="absolute top-2 right-2 bg-blue-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full">{product.offerText || 'ط¹ط±ط¶'}</span>
                        )}
                      </div>
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] text-blue-400 font-bold block">{product.category}</span>
                          <h4 className="text-white text-xs font-bold mt-0.5 line-clamp-1 group-hover:text-blue-300 transition-colors">{product.name}</h4>
                          <p className="text-zinc-400 text-[10px] mt-1 line-clamp-2">{product.description}</p>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800">
                          <div>
                            <span className="text-blue-400 font-black font-mono text-sm">{product.price} {currencySymbol}</span>
                            {product.originalPrice && (
                              <span className="text-zinc-600 text-[9px] line-through mr-1">{product.originalPrice} {currencySymbol}</span>
                            )}
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); openQuickCheckout(product); }} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[9px] rounded-xl transition-all cursor-pointer shadow-md">ط§ط´طھط±ظٹ âڑ،</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>

          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Section layout control */}
            <div className="bg-zinc-900/60 border border-zinc-800 p-3 rounded-2xl flex items-center justify-between flex-wrap gap-2">
              {/* Category buttons slider */}
              <div className="flex gap-1.5 overflow-x-auto py-1" style={{ scrollbarWidth: 'none' }}>
                <button
                  onClick={() => setSelectedCategory('ط§ظ„ظƒظ„')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors ${
                    selectedCategory === 'ط§ظ„ظƒظ„'
                      ? 'bg-white text-black font-bold'
                      : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-900'
                  }`}
                >
                  ط§ظ„ظƒظ„ ({storeProducts.length})
                </button>
                {store.categories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-white text-black font-bold'
                        : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {filteredProducts.map(product => (
                <div 
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="group bg-zinc-900/40 border border-zinc-800 hover:border-amber-500/30 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
                >
                  <div className="relative aspect-square w-full bg-zinc-950 overflow-hidden">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.isOffer && (
                      <span className="absolute top-2 right-2 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                        ط¹ط±ط¶ ط®ط§طµ
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] text-zinc-500 font-medium">{product.category}</span>
                    <h4 className="text-white text-xs sm:text-sm font-bold mt-1 group-hover:text-amber-400 transition-colors line-clamp-1">
                      {product.name}
                    </h4>
                    <p className="text-zinc-400 text-[10px] mt-1 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800/40">
                      <div>
                        <span className="text-white text-sm font-bold font-mono">{product.price} {currencySymbol}</span>
                        {product.originalPrice && (
                          <span className="text-zinc-600 text-[10px] line-through mr-1.5 font-mono">
                            {product.originalPrice} {currencySymbol}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(product, store);
                          }}
                          className="p-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 rounded-lg transition-colors cursor-pointer"
                        >
                          <ShoppingBag size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openQuickCheckout(product);
                          }}
                          className="px-2 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-[10px] rounded-lg transition-colors cursor-pointer"
                        >
                          <span>ط·ظ„ط¨ ط³ط±ظٹط¹ âڑ،</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: OFFERS */}
        {activeTab === 'offers' && (
          <div className="space-y-6">
            {offerProducts.length === 0 ? (
              <div className="text-center py-16 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl">
                <p className="text-zinc-500 text-sm">ظ„ط§ طھطھظˆظپط± ط¹ط±ظˆط¶ طھط±ظˆظٹط¬ظٹط© ظ†ط´ط·ط© ط­ط§ظ„ظٹط§ظ‹ ظپظٹ ظ‡ط°ط§ ط§ظ„ظ…طھط¬ط±</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {offerProducts.map(product => (
                  <div 
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className="group bg-gradient-to-br from-red-950/20 to-zinc-900/40 border border-red-500/20 hover:border-red-500/40 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
                  >
                    <div className="relative aspect-[4/3] w-full bg-zinc-950 overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2 right-2 bg-red-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-full animate-pulse shadow-md">
                        {product.offerText || 'ط®طµظ… ظ…ظ…ظٹط²'}
                      </span>
                    </div>
                    <div className="p-4 text-right">
                      <span className="text-[10px] text-zinc-500 font-medium">{product.category}</span>
                      <h4 className="text-white text-sm sm:text-base font-extrabold mt-1 group-hover:text-red-400 transition-colors line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-zinc-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800">
                        <div>
                          <span className="text-red-400 text-base font-black font-mono">{product.price} {currencySymbol}</span>
                          {product.originalPrice && (
                            <span className="text-zinc-600 text-xs line-through mr-2 font-mono">
                              {product.originalPrice} {currencySymbol}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(product, store);
                            }}
                            className="p-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 rounded-lg transition-colors cursor-pointer"
                          >
                            <ShoppingBag size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openQuickCheckout(product);
                            }}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1"
                          >
                            <span>ط´ط±ط§ط، ط³ط±ظٹط¹ âڑ،</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Review Form */}
              <div className="md:col-span-5 bg-zinc-900/60 border border-zinc-800/80 p-6 rounded-2xl space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MessageSquarePlus className="text-amber-500" size={18} />
                  <span>ط§ظƒطھط¨ طھظ‚ظٹظٹظ…ظƒ ظˆطھط¬ط±ط¨طھظƒ ظ„ظ„طھط§ط¬ط±</span>
                </h3>
                
                <form onSubmit={handleAddReviewSubmit} className="space-y-3">
                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold mb-1">ط§ط³ظ…ظƒ ط§ظ„ظƒط§ظ…ظ„</label>
                    <input
                      type="text"
                      placeholder="ظ…ط«ط§ظ„: طµط§ظ„ط­ ط§ظ„ط±ظˆظٹظ„ظٹ"
                      value={newReviewName}
                      onChange={(e) => setNewReviewName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400 text-right"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold mb-1">ط§ظ„طھظ‚ظٹظٹظ… ط¨ط§ظ„ظ†ط¬ظˆظ…</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setNewReviewRating(star)}
                          className="text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star size={20} fill={star <= newReviewRating ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold mb-1">ط§ظƒطھط¨ طھط¹ظ„ظٹظ‚ظƒ ظˆطھط¬ط±ط¨طھظƒ ط¨ط§ظ„طھظپطµظٹظ„</label>
                    <textarea
                      placeholder="ظƒظٹظپ ظƒط§ظ†طھ ط¬ظˆط¯ط© ط§ظ„ظ…ظ†طھط¬ط§طھطŒ ط³ط±ط¹ط© ط§ظ„طھط¬ظ‡ظٹط²طŒ ظˆطھط¬ط±ط¨طھظƒ ط§ظ„ط¹ط§ظ…ط© ظ…ط¹ ط§ظ„ظ…ط­ظ„طں"
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      rows={4}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400 text-right"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
                  >
                    ط¥ط±ط³ط§ظ„ ط§ظ„طھظ‚ظٹظٹظ… ظپظˆط±ط§ظ‹
                  </button>
                </form>

                <AnimatePresence>
                  {reviewSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-green-400 text-xs text-center"
                    >
                      âœ“ ط´ظƒط±ط§ظ‹ ظ„ظƒ! طھظ… ط¥ط±ط³ط§ظ„ ظ…ط±ط§ط¬ط¹طھظƒ ط¨ظ†ط¬ط§ط­ ظˆط³ظˆظپ طھط¸ظ‡ط± ظ…ط¨ط§ط´ط±ط©.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Column: Reviews List */}
              <div className="md:col-span-7 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <MessageSquare size={18} className="text-zinc-400" />
                    <span>ط¢ط±ط§ط، ظˆظ…ط±ط§ط¬ط¹ط§طھ ط§ظ„ظ…طھط³ظˆظ‚ظٹظ†</span>
                  </h3>
                  <span className="text-xs text-zinc-400">({storeReviews.length} ظ…ط±ط§ط¬ط¹ط©)</span>
                </div>

                {storeReviews.length === 0 ? (
                  <div className="text-center py-12 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl">
                    <p className="text-zinc-500 text-sm">ظ„ط§ طھطھظˆظپط± ظ…ط±ط§ط¬ط¹ط§طھ ظ„ظ‡ط°ط§ ط§ظ„ظ…طھط¬ط± ط­طھظ‰ ط§ظ„ط¢ظ†. ظƒظ† ط£ظˆظ„ ظ…ظ† ظٹظƒطھط¨ طھظ‚ظٹظٹظ…ط§ظ‹!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {storeReviews.map(review => (
                      <div key={review.id} className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-white">{review.userName}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">{review.date}</span>
                        </div>
                        <div className="flex gap-0.5 text-amber-400">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              size={12} 
                              fill={i < review.rating ? 'currentColor' : 'none'} 
                              className={i < review.rating ? 'text-amber-400' : 'text-zinc-700'} 
                            />
                          ))}
                        </div>
                        <p className="text-zinc-300 text-xs leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: CONTACT / ABOUT */}
        {activeTab === 'about' && (
          <div className="max-w-2xl mx-auto bg-zinc-900/60 border border-zinc-800 p-6 sm:p-8 rounded-3xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl mx-auto overflow-hidden border bg-zinc-950 p-1" style={{ borderColor: store.themeColor.primary }}>
              <img 
                src={store.logo} 
                alt={store.name} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            
            <div>
              <h3 className="text-lg font-extrabold text-white">{store.name}</h3>
              <p className="text-xs text-amber-500 font-bold mt-1">{store.category} ظپظٹ {store.city}{store.district ? ` - ${store.district}` : ''}</p>
              <p className="text-zinc-400 text-xs mt-3 max-w-md mx-auto leading-relaxed">
                {store.seoDescription || store.description}
              </p>
            </div>

            <div className="border-t border-zinc-800/80 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-right max-w-md mx-auto">
              {store.storePhone && (
                <a href={`tel:${store.storePhone}`} className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 flex items-center gap-3 hover:border-amber-500/30 transition-colors cursor-pointer">
                  <Phone className="text-amber-400 w-5 h-5 shrink-0" />
                  <div>
                    <span className="text-[10px] text-zinc-500 block">ط§ظ„ظ‡ط§طھظپ ط§ظ„ظ…ط¨ط§ط´ط± ظ„ظ„ط·ظ„ط¨</span>
                    <span className="text-white text-xs font-semibold font-mono" dir="ltr">{store.storePhone}</span>
                  </div>
                </a>
              )}

              {(store.district || store.neighborhood) && (
                <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 flex items-center gap-3">
                  <MapPin className="text-amber-400 w-5 h-5 shrink-0" />
                  <div>
                    <span className="text-[10px] text-zinc-500 block">ط§ظ„ط¹ظ†ظˆط§ظ†</span>
                    <span className="text-white text-xs font-semibold">{store.district}{store.neighborhood ? `طŒ ${store.neighborhood}` : ''}طŒ {store.city}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Share store link */}
            <div className="flex justify-center">
              <button
                onClick={() => {
                  const url = `${window.location.origin}${window.location.pathname}#/store/${store.slug || store.id}`;
                  navigator.clipboard.writeText(url).then(() => alert('طھظ… ظ†ط³ط® ط±ط§ط¨ط· ط§ظ„ظ…طھط¬ط±! ط´ط§ط±ظƒظ‡ ظ…ط¹ ط£ظٹ ط´ط®طµ'));
                }}
                className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-xl hover:bg-amber-500/20 transition-colors cursor-pointer flex items-center gap-2"
              >
                ًں”— ظ†ط³ط® ط±ط§ط¨ط· ط§ظ„ظ…طھط¬ط± ظ„ظ„ظ…ط´ط§ط±ظƒط©
              </button>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl text-xs text-zinc-400 text-center leading-relaxed">
              ط¬ظ…ظٹط¹ ط§ظ„ظ…طھط§ط¬ط± ظˆط§ظ„ط·ظ„ط¨ط§طھ ط¯ط§ط®ظ„ ظ…ظ†طµط© MIX ظ…ط´ظ…ظˆظ„ط© ط¨ط¶ظ…ط§ظ† MIX ط§ظ„ظ…ظˆط­ط¯ ظˆط­ظ…ط§ظٹط© ط§ظ„ظ…طھط³ظˆظ‚طŒ ظ„ط¶ظ…ط§ظ† ط§ط³طھظ„ط§ظ… ط·ظ„ط¨ظٹطھظƒ ط¨ظ†ظپط³ ط§ظ„ط¬ظˆط¯ط© ظˆط§ظ„ظ…ظˆط§طµظپط§طھ ط§ظ„ظ…ط¹ط±ظˆط¶ط©.
            </div>
          </div>
        )}

      </div>

      {/* DETAILED PRODUCT DETAILS MODAL (POPUP) */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedProduct(null);
                setActiveImageIdx(0);
              }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Window */}
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl z-10"
              dir="rtl"
            >
              {/* Product Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2">
                
                {/* Image Section / Gallery Carousel */}
                <div className="relative bg-zinc-900 flex flex-col justify-between min-h-[350px] md:min-h-[450px]">
                  <div className="relative flex-1 bg-zinc-950 flex items-center justify-center overflow-hidden">
                    <img 
                      src={selectedProduct.images && selectedProduct.images[activeImageIdx] ? selectedProduct.images[activeImageIdx] : selectedProduct.image} 
                      alt={selectedProduct.name} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain max-h-[380px]"
                    />
                    {selectedProduct.isOffer && (
                      <span className="absolute top-4 right-4 bg-red-600 text-white font-black text-xs px-3 py-1 rounded-full animate-bounce">
                        {selectedProduct.offerText || 'ط®طµظ… ظ…ظ…ظٹط²'}
                      </span>
                    )}
                    <button 
                      onClick={() => {
                        setSelectedProduct(null);
                        setActiveImageIdx(0);
                      }}
                      className="absolute top-4 left-4 p-2.5 bg-black/70 hover:bg-black/90 rounded-full text-white cursor-pointer z-10 transition-transform hover:scale-105"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Thumbnails list if multiple images exist */}
                  {selectedProduct.images && selectedProduct.images.filter(Boolean).length > 1 && (
                    <div className="p-3 bg-zinc-950 border-t border-zinc-900/80 flex gap-2 overflow-x-auto justify-center" style={{ scrollbarWidth: 'none' }}>
                      {selectedProduct.images.filter(Boolean).map((imgUrl, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImageIdx(idx)}
                          className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                            activeImageIdx === idx ? 'border-amber-500 scale-105 ring-2 ring-amber-500/20' : 'border-zinc-850 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={imgUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="p-6 md:p-8 flex flex-col justify-between text-right">
                  <div className="space-y-4">
                    <div>
                      <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold">
                        {selectedProduct.category}
                      </span>
                      <h3 className="text-xl md:text-2xl font-black text-white mt-3 leading-tight">
                        {selectedProduct.name}
                      </h3>
                      <p className="text-xs text-amber-500/80 font-bold mt-1">ط¨ط§ط¦ط¹ ظ…ط¹طھظ…ط¯: {store.name}</p>
                    </div>

                    <p className="text-zinc-400 text-xs leading-relaxed max-h-[140px] overflow-y-auto">
                      {selectedProduct.description}
                    </p>

                    <div className="border-t border-b border-zinc-900 py-3 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <span>ط§ظ„طھظ‚ظٹظٹظ…:</span>
                        <span className="text-amber-400 font-bold flex items-center gap-0.5">
                          <Star size={12} fill="currentColor" />
                          {selectedProduct.rating || 5.0}
                        </span>
                      </div>
                      <div className="text-zinc-400">
                        <span>ط§ظ„ظ…ط®ط²ظˆظ† ط§ظ„ظ…طھط§ط­:</span>
                        <span className={`font-bold mr-1 ${selectedProduct.stock > 5 ? 'text-green-400' : 'text-red-400'}`}>
                          {selectedProduct.stock > 0 ? `${selectedProduct.stock} ظˆط­ط¯ط©` : 'ظ†ظپط°طھ ط§ظ„ظƒظ…ظٹط©'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-900/80 space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-zinc-500 text-[10px] block font-semibold">ط§ظ„ط³ط¹ط± ط§ظ„ط¥ط¬ظ…ط§ظ„ظٹ ط´ط§ظ…ظ„ ط§ظ„ط¶ط±ظٹط¨ط©</span>
                        <span className="text-white text-2xl font-extrabold font-mono">{selectedProduct.price} {currencySymbol}</span>
                        {selectedProduct.originalPrice && (
                          <span className="text-zinc-600 text-xs line-through mr-2 font-mono block">
                            {selectedProduct.originalPrice} {currencySymbol}
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <span>ًںڑڑ طھظˆطµظٹظ„ ظ…ط¬ط§ظ†ظٹ ظˆط³ط±ظٹط¹</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Standard Cart Button */}
                      <button
                        disabled={selectedProduct.stock <= 0}
                        onClick={() => {
                          onAddToCart(selectedProduct, store);
                          setSelectedProduct(null);
                          setActiveImageIdx(0);
                        }}
                        className="px-4 py-3 bg-zinc-900 hover:bg-zinc-850 disabled:bg-zinc-950 disabled:text-zinc-700 text-zinc-300 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-zinc-800"
                      >
                        <ShoppingBag size={14} />
                        <span>ط¥ط¶ط§ظپط© ظ„ظ„ط³ظ„ط©</span>
                      </button>

                      {/* Prominent Quick Checkout Button */}
                      <button
                        disabled={selectedProduct.stock <= 0}
                        onClick={() => {
                          openQuickCheckout(selectedProduct);
                          setSelectedProduct(null);
                          setActiveImageIdx(0);
                        }}
                        className="px-4 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_20px_rgba(245,158,11,0.2)]"
                      >
                        <Sparkle size={14} className="animate-pulse" />
                        <span>ط·ظ„ط¨ ط³ط±ظٹط¹ ظˆظ…ط¨ط§ط´ط± âڑ،</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QUICK CHECKOUT FORM MODAL */}
      <AnimatePresence>
        {checkoutProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!orderCompleted) setCheckoutProduct(null);
              }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            {/* Modal Window */}
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800/80 rounded-3xl overflow-hidden shadow-2xl z-10 p-6 md:p-8 text-right"
              dir="rtl"
            >
              {!orderCompleted ? (
                /* CHECKOUT FORM */
                <form onSubmit={handleQuickCheckoutSubmit} className="space-y-6">
                  
                  {/* Form Header */}
                  <div className="flex justify-between items-start border-b border-zinc-900 pb-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-white flex items-center gap-2">
                        <span className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">ًں“‹</span>
                        <span>ظ†ظ…ظˆط°ط¬ طھط¹ط¨ط¦ط© ط¨ظٹط§ظ†ط§طھ ط§ظ„ط´ط­ظ† ظˆط§ظ„ط¯ظپط¹ ط§ظ„ط³ط±ظٹط¹</span>
                      </h3>
                      <p className="text-xs text-zinc-400">
                        ظ‚ظ… ط¨طھط¹ط¨ط¦ط© ط¨ظٹط§ظ†ط§طھظƒ ظ„طھط£ظƒظٹط¯ ط´ط±ط§ط، ظ…ظ†طھط¬ <strong className="text-amber-400">"{checkoutProduct.name}"</strong> ظپظˆط±ط§ظ‹ ظ…ظ† ظ…طھط¬ط± <strong className="text-zinc-200">"{store.name}"</strong>.
                      </p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setCheckoutProduct(null)}
                      className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-500 hover:text-white cursor-pointer transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* Summary card */}
                  <div className="p-4 bg-zinc-900/40 rounded-2xl border border-zinc-850 flex items-center gap-3">
                    <img src={checkoutProduct.image} alt="" className="w-12 h-12 rounded-xl object-cover border border-zinc-800 shrink-0" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-zinc-500 font-bold block">{checkoutProduct.category}</span>
                      <span className="text-white text-xs font-bold block truncate mt-0.5">{checkoutProduct.name}</span>
                    </div>
                    <div className="text-left shrink-0">
                      <span className="text-[10px] text-zinc-500 block">ط³ط¹ط± ط§ظ„ظ…ظ†طھط¬</span>
                      <span className="text-amber-400 text-xs font-extrabold font-mono">{checkoutProduct.price} {currencySymbol}</span>
                    </div>
                  </div>

                  {/* DYNAMIC CUSTOM CHECKOUT FIELDS (NEW SYSTEM + BACKWARD COMPAT) */}
                  <div className="space-y-4">
                    {checkoutFields.map((fld) => {
                      const value = getFormValue(fld.name);
                      const baseInput = "w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400";
                      const isLtr = fld.type === 'tel' || fld.type === 'email' || fld.type === 'number' || fld.type === 'date' || fld.type === 'time';
                      const reqMark = fld.required ? <span className="text-red-400 mx-0.5">*</span> : null;
                      return (
                        <div key={fld.id}>
                          <label className={`block text-zinc-400 text-xs font-bold mb-1.5 ${fld.required ? 'text-zinc-200' : ''}`}>
                            {fld.label} {reqMark}
                          </label>
                          {fld.type === 'textarea' && (
                            <textarea placeholder={fld.placeholder || ''} value={String(value || '')} onChange={(e) => setFormValue(fld.name, e.target.value)} rows={3} className={baseInput + " text-right font-sans resize-none"} required={fld.required} />
                          )}
                          {(fld.type === 'text' || fld.type === 'tel' || fld.type === 'email' || fld.type === 'number') && (
                            <input type={fld.type} placeholder={fld.placeholder || ''} value={String(value || '')} onChange={(e) => setFormValue(fld.name, e.target.value)} min={fld.validation?.minLength} max={fld.validation?.maxLength} className={baseInput + " " + (isLtr ? 'text-left font-mono' : 'text-right font-sans')} required={fld.required} />
                          )}
                          {fld.type === 'date' && (
                            <input type="date" value={String(value || '')} onChange={(e) => setFormValue(fld.name, e.target.value)} className={baseInput + " text-left font-mono"} required={fld.required} />
                          )}
                          {fld.type === 'time' && (
                            <input type="time" value={String(value || '')} onChange={(e) => setFormValue(fld.name, e.target.value)} className={baseInput + " text-left font-mono"} required={fld.required} />
                          )}
                          {fld.type === 'select' && (
                            <select value={String(value || '')} onChange={(e) => setFormValue(fld.name, e.target.value)} className={baseInput + " text-right font-sans"} required={fld.required}>
                              <option value="">-- اختر --</option>
                              {(fld.options || []).map((opt, i) => (<option key={i} value={opt}>{opt}</option>))}
                            </select>
                          )}
                          {fld.type === 'radio' && (
                            <div className="space-y-2 pt-1">
                              {(fld.options || []).map((opt, i) => (
                                <label key={i} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-zinc-900/60 transition-colors">
                                  <input type="radio" name={`radio_${fld.id}`} value={opt} checked={String(value || '') === opt} onChange={(e) => setFormValue(fld.name, e.target.value)} className="accent-amber-500" required={fld.required} />
                                  <span className="text-xs text-zinc-200">{opt}</span>
                                </label>
                              ))}
                            </div>
                          )}
                          {fld.type === 'checkbox' && (
                            <label className="flex items-start gap-2 cursor-pointer p-3 rounded-xl bg-zinc-900/40 border border-zinc-850 hover:bg-zinc-900/70 transition-colors">
                              <input type="checkbox" checked={Boolean(value)} onChange={(e) => setFormValue(fld.name, e.target.checked)} className="accent-amber-500 mt-0.5" required={fld.required} />
                              <div>
                                <span className="text-xs font-bold text-zinc-200">{fld.placeholder || fld.label}</span>
                                {fld.helpText && <span className="text-[10px] text-zinc-500 block mt-0.5">{fld.helpText}</span>}
                              </div>
                            </label>
                          )}
                          {fld.type === 'file' && (
                            <div>
                              <button type="button" onClick={() => {
                                const fi = document.createElement('input');
                                fi.type = 'file';
                                fi.accept = fld.placeholder || 'image/*,.pdf,.doc,.docx';
                                fi.onchange = async (ev) => {
                                  const f = ev.target.files?.[0];
                                  if (f) {
                                    try {
                                      if (f.type.startsWith('image/')) {
                                        const c = await compressAndResizeImage(f, 1000, 1000, 0.8);
                                        setFormValue(fld.name, c);
                                      } else {
                                        const reader = new FileReader();
                                        reader.onload = (evt) => setFormValue(fld.name, evt.target?.result);
                                        reader.readAsDataURL(f);
                                      }
                                    } catch (e) { setFormValue(fld.name, f.name); }
                                  }
                                };
                                fi.click();
                              }} className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all">
                                <Plus size={12} /> رفع ملف
                              </button>
                              {value && typeof value === 'string' && value.startsWith('data:image') && (
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-[10px] text-green-400 font-bold">✓ تم الرفع</span>
                                  <div className="w-10 h-10 rounded border border-zinc-800 overflow-hidden shrink-0 bg-zinc-900"><img src={value} alt="preview" className="w-full h-full object-cover" /></div>
                                </div>
                              )}
                              {value && !(typeof value === 'string' && value.startsWith('data:image')) && (
                                <span className="text-[10px] text-green-400 font-bold block mt-2">✓ الملف: {String(value).slice(0, 60)}</span>
                              )}
                            </div>
                          )}
                          {fld.helpText && fld.type !== 'checkbox' && (<p className="text-[10px] text-zinc-500 mt-1">💡 {fld.helpText}</p>)}
                        </div>
                      );
                    })}
                  </div>

                  {/* DYNAMIC PAYMENT GATEWAYS (NEW SYSTEM + BACKWARD COMPAT) */}
                  <div className="space-y-3 pt-2">
                    <label className="block text-zinc-300 text-xs font-bold">اختر طريقة الدفع المفضلة لديك:</label>
                    <div className={`grid gap-3 ${enabledGateways.length > 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
                      {enabledGateways.map((gw) => {
                        const meta = GATEWAY_TYPE_LABELS[gw.type] || GATEWAY_TYPE_LABELS.other;
                        const isSelected = useNewPaymentSystem ? currentSelectedGateway?.id === gw.id : (gw.type === 'cod' ? selectedPaymentGateway === 'cod' : selectedPaymentGateway === 'vodafoneCash');
                        const accentBorder = isSelected ? 'border-amber-500 ring-1 ring-amber-500/30 bg-amber-500/5' : 'border-zinc-850 hover:border-zinc-800 bg-zinc-950/40 bg-gradient-to-l ' + meta.color;
                        return (
                          <label key={gw.id} className={`p-4 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all select-none ${accentBorder}`}>
                            <div className="flex items-center gap-2.5">
                              <input type="radio" name="paymentGateway" checked={isSelected} onChange={() => {
                                if (useNewPaymentSystem) setSelectedPaymentGatewayId(gw.id);
                                else setSelectedPaymentGateway(gw.type === 'vodafoneCash' ? 'vodafoneCash' : 'cod');
                              }} className="accent-amber-500" />
                              <div className="text-right">
                                <span className="text-xs font-extrabold text-white block flex items-center gap-1.5">
                                  <span className="text-base">{gw.icon || meta.icon}</span>
                                  {gw.name}
                                </span>
                                <span className="text-[9px] text-zinc-500 block mt-0.5">{meta.desc}</span>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    {currentSelectedGateway && currentSelectedGateway.type !== 'cod' && (
                      <div className="p-4 bg-gradient-to-br from-slate-900/60 to-zinc-950/80 border border-amber-500/20 rounded-2xl space-y-3.5 animate-fadeIn mt-2">
                        <div className="space-y-1.5">
                          <span className="text-xs font-black text-amber-400 block flex items-center gap-1.5">
                            <span className="text-lg">{currentSelectedGateway.icon || GATEWAY_TYPE_LABELS[currentSelectedGateway.type]?.icon || '💰'}</span>
                            تعليمات التحويل عبر {currentSelectedGateway.name}:
                          </span>
                          <p className="text-[11px] text-zinc-300 leading-relaxed">
                            الرجاء تحويل المبلغ الإجمالي وهو <strong className="text-white font-mono bg-black/40 px-1.5 py-0.5 rounded">{checkoutProduct.price + 15} {currencySymbol}</strong> (منتج + توصيل 15 {currencySymbol}) إلى حسابات التاجر:
                          </p>
                        </div>
                        <div className="bg-black/60 border border-zinc-800 rounded-2xl p-3 space-y-2.5">
                          {currentSelectedGateway.number && (
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-zinc-500 font-bold">الرقم / المحفظة:</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-amber-400 font-black text-sm font-mono tracking-wide" dir="ltr">{currentSelectedGateway.number}</span>
                                <button type="button" onClick={() => { try { navigator.clipboard.writeText(currentSelectedGateway.number || ''); alert('✓ تم نسخ الرقم'); } catch {} }} className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-amber-400 transition-colors cursor-pointer" title="نسخ"><Copy size={12} /></button>
                              </div>
                            </div>
                          )}
                          {currentSelectedGateway.bankName && (<div className="flex items-center justify-between"><span className="text-[10px] text-zinc-500 font-bold">البنك:</span><span className="text-white font-bold text-xs">{currentSelectedGateway.bankName}</span></div>)}
                          {currentSelectedGateway.accountHolderName && (<div className="flex items-center justify-between"><span className="text-[10px] text-zinc-500 font-bold">اسم الحامل:</span><span className="text-white font-semibold text-xs">{currentSelectedGateway.accountHolderName}</span></div>)}
                          {currentSelectedGateway.iban && (
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-zinc-500 font-bold">IBAN:</span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-green-400 font-black text-xs font-mono tracking-wider" dir="ltr">{currentSelectedGateway.iban}</span>
                                <button type="button" onClick={() => { try { navigator.clipboard.writeText(currentSelectedGateway.iban || ''); alert('✓ تم نسخ الآيبان'); } catch {} }} className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-green-400 transition-colors cursor-pointer"><Copy size={12} /></button>
                              </div>
                            </div>
                          )}
                          {currentSelectedGateway.branchName && (<div className="flex items-center justify-between"><span className="text-[10px] text-zinc-500 font-bold">الفرع:</span><span className="text-zinc-200 text-xs">{currentSelectedGateway.branchName}</span></div>)}
                        </div>
                        {currentSelectedGateway.extraInstructions && (
                          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                            <p className="text-[10.5px] text-amber-200 leading-relaxed">📌 {currentSelectedGateway.extraInstructions}</p>
                          </div>
                        )}
                        <div>
                          <label className="block text-zinc-400 text-[11px] font-bold mb-1">رقم الهاتف المحول منه أو رقم العملية *</label>
                          <input type="text" placeholder="مثال: 05xxxxxxxx أو رقم العملية" value={useNewPaymentSystem ? transferSenderNumber : vodafoneSenderNumber} onChange={(e) => { const v = e.target.value; if (useNewPaymentSystem) setTransferSenderNumber(v); else setVodafoneSenderNumber(v); }} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono text-left" required />
                        </div>
                        <div>
                          <label className="block text-zinc-400 text-[11px] font-bold mb-1.5">صورة إيصال وصل التحويل *</label>
                          <div className="flex gap-2 items-center flex-wrap">
                            <button type="button" onClick={() => {
                              const fileInput = document.createElement('input');
                              fileInput.type = 'file';
                              fileInput.accept = 'image/*';
                              fileInput.onchange = async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    const c = await compressAndResizeImage(file, 800, 800, 0.75);
                                    if (useNewPaymentSystem) setTransferReceiptImage(c); else setVodafoneReceiptImage(c);
                                  } catch (err) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => { const r = ev.target?.result; if (useNewPaymentSystem) setTransferReceiptImage(r); else setVodafoneReceiptImage(r); };
                                    reader.readAsDataURL(file);
                                  }
                                }
                              };
                              fileInput.click();
                            }} className="px-3.5 py-2 bg-amber-950/40 hover:bg-amber-950/60 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all">
                              <Plus size={12} /> رفع صورة الإيصال
                            </button>
                            {(useNewPaymentSystem ? transferReceiptImage : vodafoneReceiptImage) ? (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-green-400 font-bold">✓ تم الرفع</span>
                                <div className="w-12 h-12 rounded-xl border border-zinc-800 overflow-hidden shrink-0 bg-zinc-900"><img src={useNewPaymentSystem ? transferReceiptImage : vodafoneReceiptImage} alt="receipt" className="w-full h-full object-cover" /></div>
                              </div>
                            ) : (<span className="text-[9px] text-zinc-500">لم يتم اختيار أي ملف</span>)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pricing break down */}
                  <div className="p-4 bg-zinc-900/20 rounded-2xl border border-zinc-850 text-xs space-y-2">
                    <div className="flex justify-between text-zinc-400">
                      <span>ط³ط¹ط± ط§ظ„ظ…ظ†طھط¬:</span>
                      <span className="font-mono">{checkoutProduct.price} {currencySymbol}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>طھظƒظ„ظپط© ط§ظ„طھظˆطµظٹظ„ ط§ظ„ظ…ظˆط­ط¯ط© ظ„ظ€ MIX:</span>
                      <span className="font-mono">15 {currencySymbol}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold pt-2 border-t border-zinc-900">
                      <span>ط§ظ„ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ظƒظ„ظٹ:</span>
                      <span className="text-amber-400 font-mono text-sm">{checkoutProduct.price + 15} {currencySymbol}</span>
                    </div>
                  </div>

                  {/* Submit checkout */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setCheckoutProduct(null)}
                      className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
                    >
                      ط¥ظ„ط؛ط§ط،
                    </button>
                    <button
                      type="submit"
                      className="flex-2 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_20px_rgba(245,158,11,0.2)]"
                    >
                      <Check size={14} />
                      <span>طھط£ظƒظٹط¯ ظˆط¥ط±ط³ط§ظ„ ط§ظ„ط·ظ„ط¨ ظپظˆط±ط§ظ‹ ًںڑ€</span>
                    </button>
                  </div>

                </form>
              ) : (
                /* ORDER COMPLETED SUCCESS VIEW */
                <div className="py-8 text-center space-y-6 animate-fadeIn">
                  <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
                    <CheckCircle2 size={36} className="animate-bounce" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-white">طھظ… ط¥ط±ط³ط§ظ„ ط·ظ„ط¨ظٹطھظƒ ط¨ظ†ط¬ط§ط­! ًںژ‰ًں›’</h3>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                      ط´ظƒط±ط§ظ‹ ظ„ط«ظ‚طھظƒ ط¨ظ…طھط¬ط± <strong className="text-amber-400">"{store.name}"</strong> ظˆظ…ط¬طھظ…ط¹ <strong className="text-white">MIX</strong>. ظ„ظ‚ط¯ طھظ… طھط³ط¬ظٹظ„ ط·ظ„ط¨ظƒ ط¨ظ†ط¬ط§ط­ ظپظٹ ظ„ظˆط­ط© ط§ظ„طھط­ظƒظ… ظˆطھظ†ط¨ظٹظ‡ ط§ظ„طھط§ط¬ط± ظ„طھط¬ظ‡ظٹط²ظ‡ ظپظˆط±ط§ظ‹.
                    </p>
                  </div>

                  <div className="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800 text-xs text-right space-y-2.5 max-w-sm mx-auto">
                    <div className="flex justify-between border-b border-zinc-800 pb-2">
                      <span className="text-zinc-500 font-bold">ط±ظ‚ظ… ط§ظ„ط·ظ„ط¨ ط§ظ„ظپط±ظٹط¯:</span>
                      <span className="font-mono text-amber-400 font-black tracking-wider">{placedOrderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">ط§ظ„ظ…ظ†طھط¬ ط§ظ„ظ…ط·ظ„ظˆط¨:</span>
                      <span className="text-white font-semibold">{checkoutProduct.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">ط·ط±ظٹظ‚ط© ط§ظ„ط¯ظپط¹ ط§ظ„ظ…ط®طھط§ط±ط©:</span>
                      <span className="text-white font-semibold">
                        {selectedPaymentGateway === 'vodafoneCash' ? 'ظپظˆط¯ط§ظپظˆظ† ظƒط§ط´ ًں“±' : 'ط§ظ„ط¯ظپط¹ ط¹ظ†ط¯ ط§ظ„ط§ط³طھظ„ط§ظ… ظƒط§ط´ ًں“¦'}
                      </span>
                    </div>
                    {selectedPaymentGateway === 'vodafoneCash' && (
                      <div className="flex justify-between">
                        <span className="text-zinc-500">ط§ظ„ط±ظ‚ظ… ط§ظ„ظ…ط­ظˆظ„ ظ…ظ†ظ‡:</span>
                        <span className="text-white font-mono">{vodafoneSenderNumber}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-zinc-800 font-bold">
                      <span className="text-zinc-400">ط§ظ„ظ…ط¨ظ„ط؛ ط§ظ„ظ…ط¯ظپظˆط¹:</span>
                      <span className="text-green-400 font-mono text-sm">{checkoutProduct.price + 15} {currencySymbol}</span>
                    </div>
                  </div>

                  <div className="bg-amber-500/5 border border-amber-500/10 p-3.5 rounded-xl text-[10px] text-zinc-500 max-w-sm mx-auto leading-relaxed">
                    ًں“Œ ط³ظˆظپ ظٹظ‚ظˆظ… ط§ظ„طھط§ط¬ط± ط¨ط§ظ„طھظˆط§طµظ„ ظ…ط¹ظƒ ظ‡ط§طھظپظٹط§ظ‹ ط¹ظ„ظ‰ ط±ظ‚ظ… <strong className="text-zinc-300 font-mono">{checkoutPhone}</strong> ظ„طھط£ظƒظٹط¯ ظ…ظˆط¹ط¯ ط§ظ„ط´ط­ظ† ظˆط§ظ„طھط³ظ„ظٹظ….
                  </div>

                  <button
                    onClick={() => setCheckoutProduct(null)}
                    className="px-8 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl cursor-pointer transition-all"
                  >
                    ط§ظ„ط¹ظˆط¯ط© ظ„ظ„طھطµظپط­ ظˆط§ظ„ط§ط³طھظ…طھط§ط¹
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FAVORITES MODAL */}
      <AnimatePresence>
        {showFavsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFavsModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              className="relative w-full max-w-lg bg-zinc-950/95 border border-purple-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.25)] z-10 p-6 text-right text-white"
              dir="rtl"
            >
              <div className="flex justify-between items-center border-b border-zinc-900 pb-4 mb-4">
                <h3 className="text-base font-black flex items-center gap-2">
                  <Heart className="text-pink-500 animate-pulse" fill="#ec4899" size={18} />
                  <span>ط§ظ„ظ…ظ†طھط¬ط§طھ ط§ظ„ظ…ظپط¶ظ„ط© ظ„ط¯ظٹظƒ</span>
                </h3>
                <button 
                  onClick={() => setShowFavsModal(false)}
                  className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {favorites.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <span className="text-4xl block">â‌¤ï¸ڈ</span>
                  <p className="text-zinc-500 text-xs">ظ‚ط§ط¦ظ…ط© ط§ظ„ظ…ظپط¶ظ„ط© ظپط§ط±ط؛ط© ط­ط§ظ„ظٹط§ظ‹. طھطµظپط­ ط§ظ„ظ…طھط¬ط± ظˆط£ط¶ظپ ظ…ظ†طھط¬ط§طھظƒ ط§ظ„ظ…ظپط¶ظ„ط© ظ‡ظ†ط§!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {storeProducts.filter(p => favorites.includes(p.id)).map(prod => (
                    <div key={prod.id} className="p-3 bg-zinc-900/40 rounded-2xl border border-zinc-850 flex items-center gap-3">
                      <img src={prod.image} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0 border border-zinc-800" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] text-purple-400 font-bold block">{prod.category}</span>
                        <h4 className="text-xs font-bold text-white truncate mt-0.5">{prod.name}</h4>
                        <span className="text-xs text-cyan-400 font-bold block mt-1 font-mono">{prod.price} {currencySymbol}</span>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            onAddToCart(prod, store);
                            setShowFavsModal(false);
                            setShowCartModal(true);
                          }}
                          className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] rounded-lg transition-all cursor-pointer flex items-center gap-1"
                        >
                          <ShoppingBag size={10} />
                          <span>ط´ط±ط§ط، ط³ط±ظٹط¹</span>
                        </button>
                        <button
                          onClick={() => toggleFavorite(prod.id)}
                          className="px-2.5 py-1.5 bg-zinc-950 hover:bg-zinc-900 text-zinc-500 hover:text-red-400 font-bold text-[10px] rounded-lg transition-all cursor-pointer border border-zinc-855 text-center"
                        >
                          ط­ط°ظپ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CART MODAL */}
      <AnimatePresence>
        {showCartModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCartModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              className="relative w-full max-w-lg bg-zinc-950/95 border border-purple-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.25)] z-10 p-6 text-right text-white"
              dir="rtl"
            >
              <div className="flex justify-between items-center border-b border-zinc-900 pb-4 mb-4">
                <h3 className="text-base font-black flex items-center gap-2">
                  <ShoppingBag className="text-cyan-400" size={18} />
                  <span>ط¹ط±ط¨ط© ط§ظ„ظ…ط´طھط±ظٹط§طھ ط§ظ„ط®ط§طµط© ط¨ظƒ</span>
                </h3>
                <button 
                  onClick={() => setShowCartModal(false)}
                  className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {cart.filter(item => item.storeId === store.id).length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <span className="text-4xl block">ًں›’</span>
                  <p className="text-zinc-500 text-xs">ط³ظ„طھظƒ ظپط§ط±ط؛ط© ط­ط§ظ„ظٹط§ظ‹. طھطµظپط­ ط§ظ„ظ…طھط¬ط± ظˆط£ط¶ظپ ظ…ظ†طھط¬ط§طھظƒ ط§ظ„ظ…ظپط¶ظ„ط© ظ‡ظ†ط§ ظ„ط´ط±ط§ط¦ظ‡ط§!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                    {cart.filter(item => item.storeId === store.id).map(item => (
                      <div key={item.productId} className="p-3 bg-zinc-900/40 rounded-2xl border border-zinc-850 flex items-center gap-3">
                        <img src={item.image} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0 border border-zinc-800" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{item.productName}</h4>
                          <span className="text-[10px] text-zinc-500 block mt-0.5">ط³ط¹ط± ط§ظ„ظˆط­ط¯ط©: {item.price} {currencySymbol}</span>
                          <span className="text-xs text-cyan-400 font-bold block mt-1 font-mono">ط§ظ„ط¥ط¬ظ…ط§ظ„ظٹ: {item.price * item.quantity} {currencySymbol}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 bg-zinc-950 p-1 rounded-lg border border-zinc-850">
                          <button
                            onClick={() => updateCartItemQuantity(item.productId, -1)}
                            className="p-1 bg-zinc-900 hover:bg-zinc-850 rounded text-zinc-400 hover:text-white cursor-pointer"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="text-xs font-bold font-mono px-1 min-w-[15px] text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateCartItemQuantity(item.productId, 1)}
                            className="p-1 bg-zinc-900 hover:bg-zinc-850 rounded text-zinc-400 hover:text-white cursor-pointer"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeCartItem(item.productId)}
                          className="p-2 bg-zinc-950 hover:bg-red-950/20 text-zinc-500 hover:text-red-400 rounded-xl cursor-pointer border border-zinc-850 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="p-4 bg-zinc-900/20 rounded-2xl border border-zinc-850 text-xs space-y-2">
                    <div className="flex justify-between text-zinc-400">
                      <span>ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ظ…ظ†طھط¬ط§طھ:</span>
                      <span className="font-mono">{cart.filter(item => item.storeId === store.id).reduce((acc, i) => acc + (i.price * i.quantity), 0)} {currencySymbol}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>طھظƒظ„ظپط© ط§ظ„طھظˆطµظٹظ„ ط§ظ„ظ…ظˆط­ط¯ط© ظ„ظ€ MIX:</span>
                      <span className="font-mono">15 {currencySymbol}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold pt-2 border-t border-zinc-900">
                      <span>ط§ظ„ط¥ط¬ظ…ط§ظ„ظٹ ط§ظ„ظƒظ„ظٹ:</span>
                      <span className="text-cyan-400 font-mono text-sm">
                        {cart.filter(item => item.storeId === store.id).reduce((acc, i) => acc + (i.price * i.quantity), 0) + 15} {currencySymbol}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowCartModal(false);
                      openCartCheckout();
                    }}
                    className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_20px_rgba(6,182,212,0.2)]"
                  >
                    <Sparkle size={14} className="animate-pulse" />
                    <span>طھط£ظƒظٹط¯ ظˆط´ط±ط§ط، ط§ظ„ط³ظ„ط© ظƒط§ظ…ظ„ط© âڑ،</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ACCOUNT / PROFILE PORTAL MODAL */}
      <AnimatePresence>
        {showAccountModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAccountModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              className="relative w-full max-w-lg bg-zinc-950/95 border border-purple-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.25)] z-10 p-6 text-right text-white"
              dir="rtl"
            >
              <div className="flex justify-between items-center border-b border-zinc-900 pb-4 mb-4">
                <h3 className="text-base font-black flex items-center gap-2">
                  <User className="text-purple-400" size={18} />
                  <span>ط¨ظˆط§ط¨ط© ط§ظ„ط¹ظ…ظٹظ„ ط§ظ„ط±ظ‚ظ…ظٹط© ًں”گ</span>
                </h3>
                <button 
                  onClick={() => setShowAccountModal(false)}
                  className="p-1.5 hover:bg-zinc-900 rounded-lg text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {!customer ? (
                /* LOGIN FORM */
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!accountName.trim() || !accountPhone.trim()) {
                      alert('ط§ظ„ط±ط¬ط§ط، ط¥ط¯ط®ط§ظ„ ط§ظ„ط§ط³ظ… ظˆط±ظ‚ظ… ط§ظ„ظ‡ط§طھظپ ظ„ظ„طھط³ط¬ظٹظ„');
                      return;
                    }
                    const newCust = {
                      name: accountName.trim(),
                      phone: accountPhone.trim(),
                      email: accountEmail.trim() || undefined
                    };
                    localStorage.setItem('mix_customer', JSON.stringify(newCust));
                    setCustomer(newCust);
                  }}
                  className="space-y-4"
                >
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    ط³ط¬ظ„ ط¨ظٹط§ظ†ط§طھظƒ ط§ظ„ط´ط®طµظٹط© ظ„طھط³ظ‡ظٹظ„ ط¹ظ…ظ„ظٹط§طھ ط§ظ„ط¯ظپط¹ ط§ظ„طھظ„ظ‚ط§ط¦ظٹطŒ طھطھط¨ط¹ طھط§ط±ظٹط® طµظٹط§ظ†ط© ظ‡ط§طھظپظƒ ظˆط§ظ„ط·ظ„ط¨ط§طھ ظˆظ…طھط§ط¨ط¹ط© ط§ظ„طھط­ط¯ظٹط«ط§طھ ظ…ط¹ ط§ظ„طھط§ط¬ط±.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-zinc-500 text-[10px] font-bold mb-1">ط§ظ„ط§ط³ظ… ط¨ط§ظ„ظƒط§ظ…ظ„ *</label>
                      <input
                        type="text"
                        placeholder="ط§ظƒطھط¨ ط§ط³ظ…ظƒ ط§ظ„ط«ظ„ط§ط«ظٹ"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-purple-400 text-right font-sans"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-500 text-[10px] font-bold mb-1">ط±ظ‚ظ… ط§ظ„ظ‡ط§طھظپ / ط§ظ„ط¬ظˆط§ظ„ *</label>
                      <input
                        type="tel"
                        placeholder="ظ…ط«ط§ظ„: 0501234567"
                        value={accountPhone}
                        onChange={(e) => setAccountPhone(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-purple-400 text-left font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-500 text-[10px] font-semibold mb-1">ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط¥ظ„ظƒطھط±ظˆظ†ظٹ (ط§ط®طھظٹط§ط±ظٹ)</label>
                      <input
                        type="email"
                        placeholder="your-email@example.com"
                        value={accountEmail}
                        onChange={(e) => setAccountEmail(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-purple-400 text-left font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl transition-all cursor-pointer shadow-[0_4px_20px_rgba(168,85,247,0.25)]"
                  >
                    ط­ظپط¸ ظˆظ…طھط§ط¨ط¹ط© ط§ظ„ط­ط³ط§ط¨ ط§ظ„ط±ظ‚ظ…ظٹ
                  </button>
                </form>
              ) : (
                /* CUSTOMER DASHBOARD */
                <div className="space-y-5">
                  <div className="p-4 bg-zinc-900/40 rounded-2xl border border-zinc-850 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-600/10 border border-purple-500/20 text-purple-400 font-black flex items-center justify-center text-sm">
                        {customer.name.substring(0, 1).toUpperCase()}
                      </div>
                      <div className="text-right">
                        <h4 className="text-xs font-black text-white">{customer.name}</h4>
                        <span className="text-[10px] text-zinc-500 block font-mono mt-0.5">{customer.phone}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        localStorage.removeItem('mix_customer');
                        setCustomer(null);
                        setAccountName('');
                        setAccountPhone('');
                        setAccountEmail('');
                      }}
                      className="text-[10px] text-red-400 hover:text-red-300 font-bold bg-red-950/10 px-2.5 py-1.5 rounded-lg border border-red-950/20 transition-all cursor-pointer"
                    >
                      طھط³ط¬ظٹظ„ ط§ظ„ط®ط±ظˆط¬
                    </button>
                  </div>

                  {/* Orders & Repair History Panels */}
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-black text-purple-400 tracking-wider">ط³ط¬ظ„ ط·ظ„ط¨ط§طھظƒ ط§ظ„ظپط¹ط§ظ„ط© ظˆطµظٹط§ظ†ط§طھظƒ ًں“±</h4>
                    
                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                      {/* Query requests */}
                      {(() => {
                        const orders = JSON.parse(localStorage.getItem('mix_orders') || '[]')
                          .filter((o: any) => o.storeId === store.id && o.customerPhone === customer.phone);
                        const repairs = JSON.parse(localStorage.getItem('mix_repair_requests') || '[]')
                          .filter((r: any) => r.phone === customer.phone);

                        if (orders.length === 0 && repairs.length === 0) {
                          return (
                            <p className="text-center py-6 text-zinc-600 text-[10px]">ظ„ط§ طھظˆط¬ط¯ ط·ظ„ط¨ط§طھ ط´ط±ط§ط، ط£ظˆ ط·ظ„ط¨ط§طھ طµظٹط§ظ†ط© ط³ط§ط¨ظ‚ط© ظ„ظƒ.</p>
                          );
                        }

                        return (
                          <>
                            {orders.map((o: any) => (
                              <div key={o.id} className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-900 text-[10px] flex justify-between items-center">
                                <div className="text-right space-y-0.5">
                                  <span className="text-[9px] text-amber-500 font-bold font-mono">{o.id}</span>
                                  <p className="text-zinc-300 font-bold">ط·ظ„ط¨: {o.items[0]?.productName || 'ظ…ظ†طھط¬ط§طھ ظ…ط¬ظ…ط¹ط©'}</p>
                                  <span className="text-[8px] text-zinc-500 block">{o.date}</span>
                                </div>
                                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-bold">ظ‚ظٹط¯ ط§ظ„ط§ظ†طھط¸ط§ط±</span>
                              </div>
                            ))}
                            {repairs.map((r: any, idx: number) => (
                              <div key={idx} className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-900 text-[10px] flex justify-between items-center">
                                <div className="text-right space-y-0.5">
                                  <span className="text-[9px] text-purple-400 font-bold block">ط·ظ„ط¨ طµظٹط§ظ†ط© ًں”§</span>
                                  <p className="text-zinc-300 font-bold">ط¬ظ‡ط§ط² {r.device}</p>
                                  <span className="text-[8px] text-zinc-500 block">{r.problem}</span>
                                </div>
                                <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full font-bold">ظ…ط³طھظ„ظ…</span>
                              </div>
                            ))}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Chat Button */}
      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 left-6 z-40 w-12 h-12 bg-amber-500 hover:bg-amber-400 text-black rounded-full shadow-lg shadow-amber-500/30 flex items-center justify-center transition-all hover:scale-110 cursor-pointer animate-bounce"
        title="ط¯ط±ط¯ط´ط© ظ…ط¨ط§ط´ط±ط© ظ…ط¹ ط§ظ„طھط§ط¬ط±"
      >
        <MessageSquarePlus size={22} />
      </button>

      {/* Chat Panel */}
      {(() => {
        const chatUser: UserType | null = customer ? {
          id: customer.phone || customer.email || 'store-customer',
          name: customer.name || 'ط¹ظ…ظٹظ„',
          email: customer.email || '',
          password: '',
          role: 'customer'
        } : null;
        return (
          <ChatPanel
            isOpen={showChat}
            onClose={() => setShowChat(false)}
            currentUser={chatUser}
            storeId={store.id}
            storeName={store.name}
            storeLogo={store.logo}
          />
        );
      })()}

    </div>
  );
}
