import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  Smartphone, Shirt, Footprints, Watch, Sparkles, Gem, Flower2, Utensils, 
  Gamepad2, Search, Filter, Star, User, Store, ShoppingBag, Plus, 
  ChevronRight, ChevronLeft, LogOut, Shield, MapPin, TrendingUp, Info, Heart, Globe, Menu, X, Wrench,
  Laptop, Building2, Sofa, ShoppingCart, Coffee, Home, Trophy, BookOpen, Car, Monitor, Palette
} from 'lucide-react';

import { 
  User as UserType, Store as StoreType, Product, MIXBanner, 
  MIXCategory, Order, Coupon, Review 
} from './types';

import { 
  initializeStorage, loadData, saveData, INITIAL_CATEGORIES, 
  INITIAL_STORES, INITIAL_PRODUCTS, INITIAL_BANNERS, INITIAL_COUPONS, 
  INITIAL_REVIEWS, INITIAL_ORDERS 
} from './data/mockData';

import { fbSync } from './lib/firebaseSync';
// import { dbAPI } from './lib/dbAPI'; // disabled: legacy MongoDB layer, see init() comment below
import { fixAllCorruptedData } from './utils/encodingFix';

// Subcomponents
import AuthModal from './components/AuthModal';
import CartDrawer from './components/CartDrawer';
import StoreView from './components/StoreView';
import MerchantDashboard from './components/MerchantDashboard';
import AdminDashboard from './components/AdminDashboard';
import GoldBackground from './components/GoldBackground';
import InfiniteTunnel from './components/InfiniteTunnel';
import MaintenanceForm from './components/MaintenanceForm';
import ThemeToggle from './components/ThemeToggle';
import ParticleAnimation from './components/ParticleAnimation';
import PhoneCasesHeart from './components/PhoneCasesHeart';
import SplashScreen from './components/SplashScreen';
import RealtimeToast from './components/RealtimeToast';
import OrderTracking from './components/OrderTracking';
import UserProfile from './components/UserProfile';
import MerchantProfile from './components/MerchantProfile';
import { useRealtimeToast } from './hooks/useRealtimeSync';
// Map icon strings to Lucide components
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Smartphone,
  Shirt,
  Footprints,
  Watch,
  Sparkles,
  Gem,
  Flower2,
  Utensils,
  Gamepad2,
  Laptop,
  Building2,
  Sofa,
  ShoppingCart,
  Coffee,
  Home,
  Trophy,
  BookOpen,
  Car,
  Monitor,
  Palette
};



export default function App() {
  const { t, i18n } = useTranslation();

  const getProductCurrency = (storeId: string) => {
    const st = stores.find(s => s.id === storeId);
    return st?.currency || (i18n.language === 'en' ? 'EGP' : 'جنيه');
  };

  // Apply page direction on language change
  useEffect(() => {
    const dir = i18n.language === 'en' ? 'ltr' : 'rtl';
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  // Initialization
  useEffect(() => {
    initializeStorage();
    // Fix any corrupted Arabic text in localStorage
    fixAllCorruptedData();
    // Initialize Firebase real-time sync (Firestore is the single source of truth for MIX)
    fbSync.init().catch(err => console.error('[Firebase] Init failed:', err));
    // NOTE: The legacy MongoDB/Express API layer (dbAPI.init()) has been disabled.
    // It pointed to an unreachable localhost backend in production (VITE_API_URL was
    // never set) and wrote to the same localStorage keys as Firestore, causing silent
    // sync conflicts. Firestore (fbSync) is now the only active data layer.

    // Hash-based routing for SEO / direct links
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) return;

      if (hash.startsWith('/store/')) {
        const storeSlugOrId = hash.replace('/store/', '');
        const storedStores = JSON.parse(localStorage.getItem('mix_stores') || '[]');
        const found = storedStores.find((s: any) => s.id === storeSlugOrId || s.slug === storeSlugOrId);
        if (found) {
          setSelectedStore(found);
          setActivePortal('mall');
          // Update SEO meta tags
          document.title = `${found.name} | منصة MIX - ${found.category} في ${found.city}`;
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) metaDesc.setAttribute('content', found.seoDescription || found.description || `${found.name} - ${found.category} في ${found.city}`);
          const ogTitle = document.querySelector('meta[property="og:title"]');
          if (ogTitle) ogTitle.setAttribute('content', `${found.name} | منصة MIX`);
          const ogDesc = document.querySelector('meta[property="og:description"]');
          if (ogDesc) ogDesc.setAttribute('content', found.seoDescription || found.description || `${found.name} - ${found.category}`);
          const ogImage = document.querySelector('meta[property="og:image"]');
          if (ogImage) ogImage.setAttribute('content', found.logo);
          const ogUrl = document.querySelector('meta[property="og:url"]');
          if (ogUrl) ogUrl.setAttribute('content', `${window.location.origin}${window.location.pathname}#/store/${found.slug || found.id}`);
        }
      } else if (hash.startsWith('/category/')) {
        const cat = decodeURIComponent(hash.replace('/category/', ''));
        if (cat === 'صينات هوات') {
          setSelectedActivity(cat);
          setShowHeartPanel(true);
        } else {
          setSelectedActivity(cat);
        }
        setActivePortal('mall');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => {
      window.removeEventListener('hashchange', handleHash);
      fbSync.destroy();
    };
  }, []);

  // Application database states loaded from Local Storage
  const [categories] = useState<MIXCategory[]>(INITIAL_CATEGORIES);
  const [stores, setStores] = useState<StoreType[]>(() => loadData('mix_stores', INITIAL_STORES));
  const [products, setProducts] = useState<Product[]>(() => loadData('mix_products', INITIAL_PRODUCTS));
  const [banners, setBanners] = useState<MIXBanner[]>(() => loadData('mix_banners', INITIAL_BANNERS));
  const [reviews, setReviews] = useState<Review[]>(() => loadData('mix_reviews', INITIAL_REVIEWS));
  const [coupons, setCoupons] = useState<Coupon[]>(() => loadData('mix_coupons', INITIAL_COUPONS));
  const [orders, setOrders] = useState<Order[]>(() => loadData('mix_orders', INITIAL_ORDERS));

  // Application session states
  const [currentUser, setCurrentUser] = useState<UserType | null>(() => {
    const saved = localStorage.getItem('mix_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [cart, setCart] = useState<any[]>(() => {
    const saved = localStorage.getItem('mix_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Platform settings (dynamic from AdminDashboard)
  const [platformSettings, setPlatformSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mix_platform_settings') || '{}');
    } catch { return {}; }
  });
  const [platformName, setPlatformName] = useState(() => {
    return localStorage.getItem('mix_platform_name') || 'MIX';
  });

  // Navigation & view states
  const [activePortal, setActivePortal] = useState<'mall' | 'merchant' | 'admin'>(() => {
    const saved = localStorage.getItem('mix_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u.role === 'admin') return 'admin';
        if (u.role === 'merchant') return 'merchant';
      } catch (err) {
        console.error(err);
      }
    }
    return 'mall';
  });
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);

  // Helper: Open a store and update URL hash + SEO meta tags
  const openStore = (store: StoreType) => {
    setSelectedStore(store);
    const slug = store.slug || store.id;
    window.location.hash = `/store/${slug}`;
    // SEO meta tags
    document.title = `${store.name} | منصة MIX - ${store.category} في ${store.city}`;
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };
    setMeta('name', 'description', store.seoDescription || store.description || `${store.name} - ${store.category} في ${store.city}`);
    setMeta('property', 'og:title', `${store.name} | منصة MIX`);
    setMeta('property', 'og:description', store.seoDescription || store.description || `${store.name} - ${store.category}`);
    setMeta('property', 'og:image', store.logo);
    setMeta('property', 'og:url', `${window.location.origin}${window.location.pathname}#/store/${slug}`);
    setMeta('name', 'keywords', store.seoKeywords || `${store.name}, ${store.category}, ${store.city}, متجر, تسوق`);
  };

  const closeStore = () => {
    setSelectedStore(null);
    window.location.hash = '';
    document.title = localStorage.getItem('mix_platform_name') || 'MIX - منصة المتاجر الموحدة';
  };
  const [adminManagedStoreId, setAdminManagedStoreId] = useState<string | null>(null); // For admin to manage a store
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mix_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const updated = prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId];
      localStorage.setItem('mix_wishlist', JSON.stringify(updated));
      return updated;
    });
  };

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<string>('الكل');
  const [filterCity, setFilterCity] = useState<string>('الكل');
  const [filterRating, setFilterRating] = useState<number>(0);
  const [filterPriceRange, setFilterPriceRange] = useState<string>('الكل');

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [showAlatbawiSection, setShowAlatbawiSection] = useState(false);
  const [showHeartPanel, setShowHeartPanel] = useState(false);
  const [showSplash, setShowSplash] = useState(() => {
    return !localStorage.getItem('mix_splash_seen');
  });
  const { toast: realtimeToast } = useRealtimeToast();
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showMerchantProfile, setShowMerchantProfile] = useState(false);

  // Banner slider state
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // Sync session states back to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('mix_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('mix_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('mix_cart', JSON.stringify(cart));
  }, [cart]);

  // Handle automatic sliding of home banners
  useEffect(() => {
    const activeBanners = banners.filter(b => b.active);
    if (activeBanners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners]);

  // Listen to changes in databases to keep local state updated
  const refreshDatabaseStates = () => {
    setStores(loadData('mix_stores', INITIAL_STORES));
    setProducts(loadData('mix_products', INITIAL_PRODUCTS));
    setBanners(loadData('mix_banners', INITIAL_BANNERS));
    setReviews(loadData('mix_reviews', INITIAL_REVIEWS));
    setCoupons(loadData('mix_coupons', INITIAL_COUPONS));
    setOrders(loadData('mix_orders', INITIAL_ORDERS));
  };

  // Apply platform settings from localStorage
  const applyPlatformSettings = () => {
    try {
      const settings = JSON.parse(localStorage.getItem('mix_platform_settings') || '{}');
      const name = localStorage.getItem('mix_platform_name') || 'MIX';
      setPlatformSettings(settings);
      setPlatformName(name);
      if (settings.siteTitle) document.title = settings.siteTitle;
      let styleEl = document.getElementById('mix-dynamic-css');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'mix-dynamic-css';
        document.head.appendChild(styleEl);
      }
      if (settings.customCSS) styleEl.textContent = settings.customCSS;
      if (settings.brandColor) {
        styleEl.textContent = (settings.customCSS || '') + `\n:root { --brand-color: ${settings.brandColor}; }\n.gold-gradient { background: linear-gradient(135deg, ${settings.brandColor}, #b8960c) !important; }\ntext-gold { color: ${settings.brandColor} !important; }`;
      }
      if (settings.platformBackgroundColor) {
        document.body.style.backgroundColor = settings.platformBackgroundColor;
      }
      if (settings.faviconUrl) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = settings.faviconUrl;
      }
    } catch {}
  };

  // INSTANT REAL-TIME SYNC: event-driven + fast polling fallback
  useEffect(() => {
    let isMounted = true;

    // Instant sync from Firestore onSnapshot events (no hash check!)
    const handleRealtimeEvent = (e: Event) => {
      if (!isMounted) return;
      const custom = e as CustomEvent;
      const key = custom.detail?.key;
      if (key) {
        // Immediately update the relevant state
        switch (key) {
          case 'mix_stores': setStores(loadData('mix_stores', INITIAL_STORES)); break;
          case 'mix_products': setProducts(loadData('mix_products', INITIAL_PRODUCTS)); break;
          case 'mix_banners': setBanners(loadData('mix_banners', INITIAL_BANNERS)); break;
          case 'mix_orders': setOrders(loadData('mix_orders', INITIAL_ORDERS)); break;
          case 'mix_coupons': setCoupons(loadData('mix_coupons', INITIAL_COUPONS)); break;
          case 'mix_reviews': setReviews(loadData('mix_reviews', INITIAL_REVIEWS)); break;
          case 'mix_platform_settings': applyPlatformSettings(); break;
          case 'mix_platform_name': applyPlatformSettings(); break;
          case 'mix_categories': break; // categories handled by its own state
          default: refreshDatabaseStates(); break;
        }
      }
    };

    // Fast polling: every 500ms for cross-tab + fallback (lightweight check)
    let lastStoreStr = localStorage.getItem('mix_stores') || '';
    let lastProductStr = localStorage.getItem('mix_products') || '';
    let lastOrderStr = localStorage.getItem('mix_orders') || '';
    let lastBannerStr = localStorage.getItem('mix_banners') || '';
    let lastReqStr = localStorage.getItem('mix_store_requests') || '';
    const fastPoll = setInterval(() => {
      if (!isMounted) return;
      const curStoreStr = localStorage.getItem('mix_stores') || '';
      const curProductStr = localStorage.getItem('mix_products') || '';
      const curOrderStr = localStorage.getItem('mix_orders') || '';
      const curBannerStr = localStorage.getItem('mix_banners') || '';
      const curReqStr = localStorage.getItem('mix_store_requests') || '';
      if (curStoreStr !== lastStoreStr || curProductStr !== lastProductStr || curOrderStr !== lastOrderStr || curBannerStr !== lastBannerStr || curReqStr !== lastReqStr) {
        lastStoreStr = curStoreStr;
        lastProductStr = curProductStr;
        lastOrderStr = curOrderStr;
        lastBannerStr = curBannerStr;
        lastReqStr = curReqStr;
        refreshDatabaseStates();
        applyPlatformSettings();
      }
    }, 500);

    // Listen to events for INSTANT sync
    window.addEventListener('local-storage-change', handleRealtimeEvent);
    window.addEventListener('storage', handleRealtimeEvent);
    window.addEventListener('mix-realtime-mix_stores', handleRealtimeEvent);
    window.addEventListener('mix-realtime-mix_products', handleRealtimeEvent);
    window.addEventListener('mix-realtime-mix_banners', handleRealtimeEvent);
    window.addEventListener('mix-realtime-mix_orders', handleRealtimeEvent);
    window.addEventListener('mix-realtime-mix_store_requests', handleRealtimeEvent);

    return () => {
      isMounted = false;
      clearInterval(fastPoll);
      window.removeEventListener('local-storage-change', handleRealtimeEvent);
      window.removeEventListener('storage', handleRealtimeEvent);
      window.removeEventListener('mix-realtime-mix_stores', handleRealtimeEvent);
      window.removeEventListener('mix-realtime-mix_products', handleRealtimeEvent);
      window.removeEventListener('mix-realtime-mix_banners', handleRealtimeEvent);
      window.removeEventListener('mix-realtime-mix_orders', handleRealtimeEvent);
      window.removeEventListener('mix-realtime-mix_store_requests', handleRealtimeEvent);
    };
  }, []);

  // Keep selectedStore in sync with latest stores data from localStorage
  useEffect(() => {
    if (selectedStore) {
      const updated = stores.find(s => s.id === selectedStore.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedStore)) {
        setSelectedStore(updated);
      }
    }
  }, [stores]);

  // Sync URL hash with current store / category for SEO & direct linking
  useEffect(() => {
    if (selectedStore) {
      const newHash = `/store/${selectedStore.id}`;
      if (window.location.hash !== `#${newHash}`) {
        window.history.replaceState(null, '', `#${newHash}`);
      }
    } else if (!selectedStore && selectedActivity !== 'الكل') {
      const newHash = `/category/${encodeURIComponent(selectedActivity)}`;
      if (window.location.hash !== `#${newHash}`) {
        window.history.replaceState(null, '', `#${newHash}`);
      }
    } else {
      if (window.location.hash) {
        window.history.replaceState(null, '', ' ');
      }
    }
  }, [selectedStore, selectedActivity]);

  // Helper: Get cart bubble count
  const cartBubbleCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // CART HANDLERS
  const handleAddToCart = (product: Product, store: StoreType) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) => 
          item.productId === product.id 
            ? { ...item, quantity: Math.min(product.stock, item.quantity + 1) } 
            : item
        );
      }
      return [
        ...prev, 
        { 
          productId: product.id, 
          productName: product.name, 
          price: product.price, 
          image: product.image, 
          quantity: 1, 
          storeId: store.id, 
          storeName: store.name 
        }
      ];
    });
    // Visual indicator
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) => 
      prev.map((item) => {
        if (item.productId === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      }).filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // REVIEW HANDLERS
  const handleAddStoreReview = (newReview: Omit<Review, 'id' | 'date'>) => {
    const fullReview: Review = {
      ...newReview,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().substring(0, 10)
    };

    const currentReviews = loadData('mix_reviews', INITIAL_REVIEWS);
    const updatedReviews = [fullReview, ...currentReviews];
    saveData('mix_reviews', updatedReviews);
    setReviews(updatedReviews);

    // Recalculate average store rating
    const currentStores = loadData('mix_stores', INITIAL_STORES);
    const updatedStores = currentStores.map((s: StoreType) => {
      if (s.id === newReview.storeId) {
        const storeRevs = updatedReviews.filter(r => r.storeId === s.id);
        const avg = storeRevs.reduce((sum, r) => sum + r.rating, 0) / storeRevs.length;
        return {
          ...s,
          rating: Number(avg.toFixed(1)),
          reviewsCount: storeRevs.length
        };
      }
      return s;
    });
    saveData('mix_stores', updatedStores);
    setStores(updatedStores);
  };

  // FILTER LOGIC FOR STORES LIST
  const filteredStores = stores.filter((store) => {
    if (store.status !== 'active') return false;
    
    // Activity match
    const matchesActivity = selectedActivity === 'الكل' || store.category === selectedActivity;
    
    // City match
    const matchesCity = filterCity === 'الكل' || store.city === filterCity;
    
    // Rating match
    const matchesRating = store.rating >= filterRating;

    return matchesActivity && matchesCity && matchesRating;
  });

  // SMART SEARCH matching logic (the most powerful section)
  const isSearching = searchQuery.trim() !== '';
  const searchResults = (() => {
    if (!isSearching) return null;
    const q = searchQuery.toLowerCase().trim();

    // 1. Match stores
    const matchedStores = stores.filter(s => 
      s.status === 'active' && (
        s.name.toLowerCase().includes(q) || 
        s.category.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        (q === 'العتيبي' && s.name.includes('العتيبي'))
      )
    );

    // 2. Match products
    const matchedProducts = products.filter(p => {
      // Find parent store
      const store = stores.find(s => s.id === p.storeId);
      if (!store || store.status !== 'active') return false;

      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });

    // 3. Match offers
    const matchedOffers = matchedProducts.filter(p => p.isOffer);

    return {
      stores: matchedStores,
      products: matchedProducts,
      offers: matchedOffers
    };
  })();

  // Handle clicking a smart search link
  const handleBannerClick = (banner: MIXBanner) => {
    if (banner.linkType === 'store') {
      const found = stores.find(s => s.id === banner.linkValue);
      if (found) setSelectedStore(found);
    } else if (banner.linkType === 'category') {
      setSelectedActivity(banner.linkValue);
      const firstSection = document.getElementById('explore-section');
      if (firstSection) firstSection.scrollIntoView({ behavior: 'smooth' });
    } else if (banner.linkType === 'offer') {
      setSearchQuery('عرض');
    }
  };

  // Detect mobile for performance optimization
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <div className="h-dvh bg-black text-white font-sans antialiased selection:bg-amber-500 selection:text-black flex flex-col">
      
      {/* SPLASH SCREEN - first visit only */}
      {showSplash && (
        <SplashScreen onComplete={() => {
          localStorage.setItem('mix_splash_seen', '1');
          setShowSplash(false);
        }} />
      )}

      {/* REAL-TIME TOAST NOTIFICATIONS */}
      <RealtimeToast toast={realtimeToast} />

      {/* Background Animations - disabled on mobile for performance */}
      {!isMobile && <InfiniteTunnel />}
      {!isMobile && <GoldBackground />}
      <ParticleAnimation />

      {/* All content above backgrounds - this area scrolls */}
      <div id="content-scroll" className="relative z-10 flex-1 overflow-y-auto pb-28 lg:pb-12 scroll-smooth">
      {/* 1. MERCHANT PORTAL (IF ROUTED IN STATE) */}
      {activePortal === 'merchant' && currentUser && currentUser.role === 'merchant' && (
        <MerchantDashboard
          storeId={adminManagedStoreId || currentUser.storeId || 'store-1'}
          onLogout={() => {
            if (adminManagedStoreId) {
              // Admin was managing, return to admin portal
              setAdminManagedStoreId(null);
              setActivePortal('admin');
            } else {
              setCurrentUser(null);
              setActivePortal('mall');
            }
            refreshDatabaseStates();
          }}
          onViewStore={() => {
            const myStore = stores.find(s => s.id === (adminManagedStoreId || currentUser.storeId));
            if (myStore) {
              openStore(myStore);
              setActivePortal('mall');
            }
          }}
        />
      )}

      {/* 2. ADMIN PORTAL (IF ROUTED IN STATE) */}
      {activePortal === 'admin' && currentUser && currentUser.role === 'admin' && (
        <AdminDashboard
          onLogout={() => {
            setCurrentUser(null);
            setActivePortal('mall');
            refreshDatabaseStates();
          }}
          onEnterStoreDashboard={(storeId) => {
            setAdminManagedStoreId(storeId);
            setActivePortal('merchant');
          }}
          onViewStore={(storeId) => {
            const st = stores.find(s => s.id === storeId);
            if (st) {
              openStore(st);
              setActivePortal('mall');
            }
          }}
          onMerchantApproved={(merchant) => {
            localStorage.setItem('mix_user', JSON.stringify(merchant));
            setCurrentUser(merchant);
            setActivePortal('merchant');
            refreshDatabaseStates();
          }}
        />
      )}

      {/* 3. STORE VIEW -Adapt to merchant customized styles and details */}
      {activePortal === 'mall' && selectedStore && (
        <StoreView
          store={selectedStore}
          products={products}
          onBack={() => {
            setSelectedStore(null);
            refreshDatabaseStates();
          }}
          onAddToCart={handleAddToCart}
          reviews={reviews}
          onAddReview={handleAddStoreReview}
        />
      )}

      {/* 3b. AL-ATBAWI FULL SITE SECTION (IFRAME) */}
      {activePortal === 'mall' && !selectedStore && showAlatbawiSection && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex items-center justify-between bg-[#0B0B0B] border-b border-[#2B2B2B] px-4 py-3 z-10">
            <button onClick={() => setShowAlatbawiSection(false)}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-bold cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              العودة
            </button>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-[10px] font-black">ع</span>
              <span className="text-white font-bold text-sm">العتباوي للهواتف والإكسسوارات</span>
            </div>
            <a href="https://atbawi-mobile.surge.sh/" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors font-bold cursor-pointer">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              فتح في جديد
            </a>
          </div>
          <iframe
            src="https://atbawi-mobile.surge.sh/"
            className="w-full flex-1 border-none"
            title="العتباوي"
            allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          />
        </div>
      )}

      {/* 4. MAIN ELECTRONIC MALL (MIX HOME PAGE) */}
      {activePortal === 'mall' && !selectedStore && (
        <div className={`text-right relative min-h-screen text-white flex flex-col z-10 ${isMobile ? 'bg-[#0B0B0B]' : 'bg-[#0B0B0B]/70 backdrop-blur-sm'}`} dir="rtl" style={{ fontFamily: 'Cairo, sans-serif' }}>
          
          {/* Hero Background Glows for Premium Vibe */}
          <div className="absolute top-0 left-0 right-0 h-[900px] opacity-15 pointer-events-none z-0 overflow-hidden">
            <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-[#D4A63D] blur-[200px] rounded-full translate-x-1/4 -translate-y-1/4"></div>
            <div className="absolute top-[300px] left-0 w-[600px] h-[600px] bg-white blur-[180px] rounded-full -translate-x-1/4"></div>
          </div>

          {/* HEADER - FIXED TOP */}
          <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0B0B]/95 backdrop-blur-xl border-b border-[#2B2B2B] px-3 sm:px-6 py-3" style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}>
            <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-4">
              
              {/* MIX BRAND LOGO */}
              <div 
                onClick={() => {
                  setSelectedStore(null);
                  setSearchQuery('');
                  setSelectedActivity('الكل');
                  const el = document.getElementById('content-scroll');
                  if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {platformSettings.platformLogo && (
                  <img src={platformSettings.platformLogo} alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover border border-[#2B2B2B]" />
                )}
                <h1 className="text-lg sm:text-2xl font-black tracking-tighter font-sans" style={{ color: platformSettings.brandColor || platformSettings.platformSecondaryColor || '#D4A63D' }}>
                  {platformName || 'MIX'}<span className="text-white italic">.</span>
                </h1>
              </div>

              {/* SEARCH BAR - Always visible */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={t('search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#121212]/90 border border-[#222] focus:border-[#D4A63D]/60 rounded-xl py-2.5 px-4 pr-10 text-xs sm:text-sm text-white focus:outline-none transition-all placeholder-zinc-400 shadow-inner font-bold"
                />
                <Search size={16} className="absolute right-3.5 top-3 text-[#D4A63D]" />
              </div>

              {/* ACTION BUTTONS - Desktop */}
              <div className="hidden lg:flex items-center gap-2">
                <button
                  onClick={() => { setSelectedStore(null); setSearchQuery(''); setSelectedActivity('الكل'); const el = document.getElementById('content-scroll'); if (el) el.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="px-3 py-2 text-[#D0D0D0] hover:text-[#D4A63D] text-xs font-bold rounded-xl transition-colors cursor-pointer hover:bg-[#121212]"
                >
                  الرئيسية
                </button>
                <button
                  onClick={() => document.getElementById('stores-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-3 py-2 text-[#D0D0D0] hover:text-[#D4A63D] text-xs font-bold rounded-xl transition-colors cursor-pointer hover:bg-[#121212]"
                >
                  المتاجر
                </button>
                <button
                  onClick={() => document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-3 py-2 text-[#D0D0D0] hover:text-[#D4A63D] text-xs font-bold rounded-xl transition-colors cursor-pointer hover:bg-[#121212]"
                >
                  الأقسام
                </button>
                <button
                  onClick={() => { setSearchQuery('عرض'); document.getElementById('search-anchor')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="px-3 py-2 text-[#D0D0D0] hover:text-[#D4A63D] text-xs font-bold rounded-xl transition-colors cursor-pointer hover:bg-[#121212]"
                >
                  العروض
                </button>
                
                <div className="w-px h-6 bg-[#2B2B2B] mx-1" />
                
                <ThemeToggle />
                
                <button
                  onClick={() => {
                    const nextLang = i18n.language === 'en' ? 'ar' : 'en';
                    i18n.changeLanguage(nextLang);
                    localStorage.setItem('mix_lang', nextLang);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#121212] hover:bg-[#1a1a1a] rounded-xl border border-[#2B2B2B] hover:border-[#D4A63D]/40 transition-all text-zinc-300 hover:text-[#D4A63D] cursor-pointer text-xs font-bold"
                  title={i18n.language === 'en' ? 'تغيير للغة العربية' : 'Switch to English'}
                >
                  <Globe size={15} className="text-[#D4A63D]" />
                  <span>{i18n.language === 'en' ? 'عربي' : 'EN'}</span>
                </button>
                
                <button onClick={() => setIsCartOpen(true)} className="relative p-2 bg-[#121212] hover:bg-[#1a1a1a] rounded-xl border border-[#2B2B2B] hover:border-[#D4A63D]/40 transition-all text-[#D0D0D0] hover:text-[#D4A63D] cursor-pointer">
                  <ShoppingBag size={16} />
                  {cartBubbleCount > 0 && <span className="absolute -top-1 -left-1 bg-[#D4A63D] text-black text-[8px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">{cartBubbleCount}</span>}
                </button>
                
                {currentUser ? (
                  <div className="flex items-center gap-2">
                    {currentUser.role === 'merchant' && (() => {
                      // Check if user has a store - either directly or by finding it
                      const userStore = stores.find(s => s.id === currentUser.storeId || s.ownerId === currentUser.id || s.ownerId === currentUser.email);
                      if (userStore) {
                        // User has a store - show "My Store" button
                        return (
                          <button 
                            onClick={() => {
                              openStore(userStore);
                            }} 
                            className="py-2 px-3 bg-gradient-to-r from-[#D4A63D] to-[#E5BC55] hover:from-[#E5BC55] hover:to-[#D4A63D] text-black text-[10px] font-black rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
                          >
                            <Store size={14} />
                            <span>متجري</span>
                          </button>
                        );
                      } else {
                        // User is merchant but no store yet - show dashboard button
                        return (
                          <button onClick={() => setActivePortal('merchant')} className="py-2 px-3 bg-[#D4A63D] hover:bg-[#A87C22] text-black text-[10px] font-black rounded-lg transition-colors cursor-pointer">
                            لوحة تحكم المتجر
                          </button>
                        );
                      }
                    })()}
                    {currentUser.role === 'admin' && <button onClick={() => setActivePortal('admin')} className="py-2 px-3 bg-gradient-to-r from-[#D4A63D] to-[#E5BC55] text-black text-[10px] font-black rounded-lg transition-all cursor-pointer">لوحة تحكم MIX</button>}
                    <button onClick={() => { if (currentUser.role === 'merchant') setShowMerchantProfile(true); else if (currentUser.role === 'admin') setActivePortal('admin'); else setShowUserProfile(true); }} className="p-2 bg-[#121212] hover:bg-[#1a1a1a] rounded-xl border border-[#2B2B2B] hover:border-[#D4A63D]/40 transition-all text-zinc-300 hover:text-[#D4A63D] cursor-pointer">
                      <User size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setIsAuthOpen(true)} className="px-3 py-2 border border-[#2B2B2B] hover:border-[#D4A63D] text-white hover:text-[#D4A63D] text-[10px] font-bold rounded-xl transition-colors cursor-pointer">دخول</button>
                    <button onClick={() => setIsAuthOpen(true)} className="px-3 py-2 bg-[#D4A63D] text-black hover:bg-[#E5BC55] text-[10px] font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1">🏪 إنشاء متجر</button>
                  </div>
                )}
              </div>

              {/* MOBILE ACTION BUTTONS */}
              <div className="flex lg:hidden items-center gap-1.5">
                <button onClick={() => setIsCartOpen(true)} className="relative p-2 bg-[#121212] hover:bg-[#1a1a1a] rounded-xl border border-[#2B2B2B] transition-all text-[#D0D0D0] cursor-pointer">
                  <ShoppingBag size={15} />
                  {cartBubbleCount > 0 && <span className="absolute -top-1 -left-1 bg-[#D4A63D] text-black text-[7px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center">{cartBubbleCount}</span>}
                </button>
                {currentUser ? (
                  <button onClick={() => { if (currentUser.role === 'merchant') setShowMerchantProfile(true); else if (currentUser.role === 'admin') setActivePortal('admin'); else setShowUserProfile(true); }} className="p-2 bg-[#121212] hover:bg-[#1a1a1a] rounded-xl border border-[#2B2B2B] transition-all text-zinc-300 cursor-pointer">
                    <User size={15} />
                  </button>
                ) : (
                  <button onClick={() => setIsAuthOpen(true)} className="px-2.5 py-2 bg-[#D4A63D] text-black text-[10px] font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1">
                    <User size={13} />
                    <span>دخول</span>
                  </button>
                )}
              </div>
            </div>
          </header>
          
          {/* HEADER SPACER - Fixed header needs spacer */}
          <div className="h-[60px] sm:h-[64px]" />

          {/* DYNAMIC SEARCH ENGINE INTERFACE (IF SEARCHING OR SAVED TO WISHLIST) */}
          {(isSearching || searchQuery === 'wishlist-query-active') && (
            <main className="max-w-7xl mx-auto px-4 mt-6 space-y-8 animate-fadeIn w-full">
              
              {/* Back to normal home */}
              <div className="flex justify-between items-center border-b border-[#2B2B2B] pb-4">
                <div className="flex items-center gap-2">
                  <Search className="text-[#D4A63D] w-5 h-5 animate-pulse" />
                  <h2 className="text-lg font-extrabold text-white">
                    {searchQuery === 'wishlist-query-active' 
                      ? 'قائمة مفضلاتي وأمنياتي المحددة ❤️' 
                      : `نتائج البحث الذكي عن: "${searchQuery}"`}
                  </h2>
                </div>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-1.5 bg-[#121212] hover:bg-zinc-800 text-[#D0D0D0] text-xs font-bold rounded-xl border border-[#2B2B2B] transition-colors cursor-pointer"
                >
                  العودة للرئيسية ✕
                </button>
              </div>

              {searchQuery === 'wishlist-query-active' ? (
                /* Wishlist view logic */
                <div className="space-y-4">
                  {wishlist.length === 0 ? (
                    <p className="text-[#8E8E8E] text-xs">لا توجد منتجات في المفضلة حالياً.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {products.filter(p => wishlist.includes(p.id)).map(product => {
                        const parentStore = stores.find(s => s.id === product.storeId);
                        const isProductWishlisted = wishlist.includes(product.id);
                        const originalPrice = product.originalPrice || Math.round(product.price * 1.25);
                        const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);

                        return (
                          <div
                            key={product.id}
                            className="group bg-[#121212] border border-[#2B2B2B] hover:border-[#D4A63D]/40 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col justify-between"
                          >
                            <div className="aspect-square bg-[#0B0B0B] relative overflow-hidden">
                              <img
                                src={product.image}
                                alt={product.name}
                                referrerPolicy="no-referrer"
                                onClick={() => { if (parentStore) openStore(parentStore); }}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <button 
                                onClick={() => toggleWishlist(product.id)}
                                className="absolute top-2 left-2 p-1.5 bg-black/70 backdrop-blur rounded-full text-red-500 hover:text-white transition-all"
                              >
                                <Heart size={14} className="fill-current" />
                              </button>
                              <span className="absolute top-2 right-2 bg-red-600 text-white font-black text-[9px] px-2 py-0.5 rounded-lg shadow-md">
                                خصم {discountPercent}%
                              </span>
                            </div>
                            <div className="p-3 text-right">
                              <span className="text-[9px] text-[#D4A63D] font-medium tracking-wider uppercase">{product.category}</span>
                              <h4 className="text-white text-xs font-bold truncate mt-0.5 group-hover:text-[#D4A63D] transition-colors">{product.name}</h4>
                              <div className="flex items-baseline gap-2 mt-2">
                                <span className="text-white text-sm font-extrabold">{product.price} {getProductCurrency(product.storeId)}</span>
                                <span className="text-[#8E8E8E] text-[10px] line-through">{originalPrice} {getProductCurrency(product.storeId)}</span>
                              </div>
                              <p className="text-[9px] text-[#8E8E8E] truncate mt-2">المتجر: {parentStore?.name}</p>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (parentStore) handleAddToCart(product, parentStore);
                                }}
                                className="w-full mt-3 py-2 bg-[#D4A63D] hover:bg-[#E5BC55] text-black font-extrabold text-[10px] rounded-xl transition-all flex items-center justify-center gap-1.5"
                              >
                                <ShoppingBag size={11} />
                                <span>إضافة للسلة</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* Standard search results logic */
                searchResults && (
                  <div className="space-y-8">
                    {/* 1. Matches Stores */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-[#D4A63D] border-r-2 border-[#D4A63D] pr-2">المحلات والمتاجر المطابقة ({searchResults.stores.length})</h3>
                      {searchResults.stores.length === 0 ? (
                        <p className="text-[#8E8E8E] text-xs pr-2">لا توجد محلات مطابقة لكلمة البحث.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {searchResults.stores.map(store => (
                            <div
                              key={store.id}
                              onClick={() => openStore(store)}
                              className="group bg-[#121212] border border-[#2B2B2B] hover:border-[#D4A63D]/30 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
                            >
                              <div className="h-32 relative overflow-hidden bg-zinc-950">
                                <img
                                  src={store.cover}
                                  alt={store.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/10" />
                              </div>
                              <div className="p-4 relative mt-[-24px]">
                                <img
                                  src={store.logo}
                                  alt={store.name}
                                  referrerPolicy="no-referrer"
                                  className="w-12 h-12 rounded-xl object-cover bg-black p-1 border border-[#2B2B2B] shadow-xl"
                                />
                                <h4 className="text-white text-sm font-bold mt-2 group-hover:text-[#D4A63D] transition-colors">{store.name}</h4>
                                <p className="text-[#8E8E8E] text-[10px] mt-1 line-clamp-2 leading-relaxed">{store.description}</p>
                                <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-[#2B2B2B]/40 text-[10px] text-[#8E8E8E]">
                                  <span>📍 {store.city}، {store.country}</span>
                                  <span className="text-[#D4A63D] font-bold flex items-center gap-0.5">
                                    <Star size={11} fill="currentColor" />
                                    {store.rating}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 2. Matches Offers */}
                    <div className="space-y-4 pt-4">
                      <h3 className="text-sm font-bold text-red-500 border-r-2 border-red-500 pr-2">العروض والخصومات المطابقة ({searchResults.offers.length})</h3>
                      {searchResults.offers.length === 0 ? (
                        <p className="text-[#8E8E8E] text-xs pr-2">لا توجد عروض ترويجية مطابقة حالياً.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {searchResults.offers.map(product => {
                            const parentStore = stores.find(s => s.id === product.storeId);
                            return (
                              <div
                                key={product.id}
                                onClick={() => {
                                  if (parentStore) {
                                    setSelectedStore(parentStore);
                                  }
                                }}
                                className="group bg-gradient-to-l from-red-950/10 to-[#121212] border border-red-500/20 hover:border-red-500/40 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 p-3 flex gap-3"
                              >
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  referrerPolicy="no-referrer"
                                  className="w-20 h-20 rounded-xl object-cover bg-black shrink-0"
                                />
                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                  <div>
                                    <span className="text-[9px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded-full">{product.offerText || 'خصم'}</span>
                                    <h4 className="text-white text-xs font-bold mt-1 truncate">{product.name}</h4>
                                    <p className="text-[#8E8E8E] text-[9px] mt-0.5 truncate">بواسطة: {parentStore?.name}</p>
                                  </div>
                                  <div className="text-[10px]">
                                    <span className="text-white font-bold">{product.price} {getProductCurrency(product.storeId)}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* 3. Matches Products */}
                    <div className="space-y-4 pt-4">
                      <h3 className="text-sm font-bold text-[#D4A63D] border-r-2 border-[#D4A63D] pr-2">المنتجات المطابقة للبحث ({searchResults.products.length})</h3>
                      {searchResults.products.length === 0 ? (
                        <p className="text-[#8E8E8E] text-xs pr-2">لا توجد منتجات مطابقة للبحث.</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                          {searchResults.products.map(product => {
                            const parentStore = stores.find(s => s.id === product.storeId);
                            const isProductWishlisted = wishlist.includes(product.id);
                            return (
                              <div
                                key={product.id}
                                className="group bg-[#121212] border border-[#2B2B2B] hover:border-[#D4A63D]/25 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
                              >
                                <div className="aspect-square bg-black relative overflow-hidden">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    referrerPolicy="no-referrer"
                                    onClick={() => { if (parentStore) openStore(parentStore); }}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                  <button 
                                    onClick={() => toggleWishlist(product.id)}
                                    className="absolute top-2 left-2 p-1.5 bg-black/60 rounded-full text-[#8E8E8E] hover:text-red-500 transition-colors"
                                  >
                                    <Heart size={14} className={isProductWishlisted ? "fill-red-500 text-red-500" : ""} />
                                  </button>
                                </div>
                                <div className="p-3 text-right">
                                  <span className="text-[9px] text-[#D4A63D] font-medium tracking-wider uppercase">{product.category}</span>
                                  <h4 className="text-white text-xs font-bold truncate mt-0.5 group-hover:text-[#D4A63D] transition-colors">{product.name}</h4>
                                  <p className="text-[#D4A63D] text-xs font-bold mt-1.5">{product.price} {getProductCurrency(product.storeId)}</p>
                                  <p className="text-[9px] text-white/40 truncate mt-1">المتجر: {parentStore?.name}</p>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (parentStore) handleAddToCart(product, parentStore);
                                    }}
                                    className="w-full mt-3 py-1.5 bg-[#D4A63D] hover:bg-[#E5BC55] text-black font-extrabold text-[9px] rounded-xl transition-all flex items-center justify-center gap-1"
                                  >
                                    <ShoppingBag size={10} />
                                    <span>إضافة للسلة</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}

            </main>
          )}

          {/* NORMAL HOME CONTENTS (IF NOT ACTIVE SEARCH OR WISHLIST SEARCH) */}
          {!isSearching && searchQuery !== 'wishlist-query-active' && (
            <main className="max-w-7xl mx-auto px-4 mt-6 space-y-12 w-full z-10 relative">
              
              {/* HERO BANNER SLIDER - LUXURY SLIDER */}
              <section className="relative rounded-2xl overflow-hidden aspect-[2.3/1] sm:aspect-[2.8/1] bg-[#121212] border border-[#2B2B2B] shadow-2xl z-10">
                <AnimatePresence mode="wait">
                  {banners.filter(b => b.active).map((banner, index) => {
                    if (index !== currentBannerIndex) return null;
                    return (
                      <motion.div
                        key={banner.id}
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 cursor-pointer"
                        onClick={() => handleBannerClick(banner)}
                      >
                        {/* Background cover - image or video */}
                        {banner.videoUrl ? (
                          (banner.videoUrl.includes('youtube.com') || banner.videoUrl.includes('youtu.be')) ? (
                            <iframe
                              src={`https://www.youtube.com/embed/${banner.videoUrl.includes('youtu.be') ? banner.videoUrl.split('/').pop()?.split('?')[0] : new URL(banner.videoUrl).searchParams.get('v') || ''}?autoplay=1&mute=1&loop=1&controls=0&playlist=${banner.videoUrl.includes('youtu.be') ? banner.videoUrl.split('/').pop()?.split('?')[0] : new URL(banner.videoUrl).searchParams.get('v') || ''}`}
                              className="absolute inset-0 w-full h-full object-cover opacity-70"
                              allow="autoplay; encrypted-media"
                              frameBorder="0"
                            />
                          ) : (
                            <video 
                              src={banner.videoUrl} 
                              className="w-full h-full object-cover opacity-60"
                              autoPlay 
                              muted 
                              loop 
                              playsInline
                            />
                          )
                        ) : (
                          <img 
                            src={banner.image} 
                            alt={banner.title} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover opacity-50"
                          />
                        )}
                        
                        {/* Shading Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-l from-black via-black/50 to-transparent" />
                        
                        {/* Contents */}
                        <div className="absolute inset-y-0 right-6 sm:right-12 md:right-16 flex flex-col justify-center max-w-xl text-right z-10 p-4">
                          <span className="text-[#D4A63D] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-[#D4A63D] rotate-45 inline-block animate-pulse"></span>
                            عروض وتخفيضات منصة MIX الفاخرة
                          </span>
                          
                          <h1 className="text-lg sm:text-3xl md:text-5xl font-extrabold text-white leading-tight mb-2 sm:mb-4">
                            {banner.title}
                          </h1>
                          
                          <p className="text-[10px] sm:text-sm text-[#D0D0D0] leading-relaxed hidden sm:block font-light mb-6">
                            {banner.subtitle}
                          </p>

                          <div className="mt-1 sm:mt-2 flex gap-2">
                            <button className="px-5 sm:px-8 py-2 sm:py-3 bg-[#D4A63D] hover:bg-[#E5BC55] text-black text-xs font-black rounded-xl transition-all shadow-lg hover:scale-[1.02]">
                              تسوق الآن 🛍️
                            </button>
                          </div>
                        </div>

                        {/* Geometric design ornament on the left side */}
                        <div className="absolute left-16 inset-y-0 h-full w-1/3 bg-gradient-to-l from-[#D4A63D]/5 to-transparent flex items-center justify-center border-r border-[#2B2B2B]/10 hidden md:flex z-10">
                          <div className="w-20 h-20 border border-[#D4A63D]/30 rotate-45 flex items-center justify-center overflow-hidden transition-transform duration-700 hover:rotate-90">
                            <div className="w-full h-full bg-[#121212] rotate-[-45deg] flex items-center justify-center text-2xl">⚜️</div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Left/Right Floating Arrows */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const activeBannersCount = banners.filter(b => b.active).length;
                    setCurrentBannerIndex((prev) => (prev === 0 ? activeBannersCount - 1 : prev - 1));
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-[#D4A63D] hover:text-black transition-colors flex items-center justify-center text-white text-xs cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const activeBannersCount = banners.filter(b => b.active).length;
                    setCurrentBannerIndex((prev) => (prev === activeBannersCount - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-[#D4A63D] hover:text-black transition-colors flex items-center justify-center text-white text-xs cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>

                {/* Bullets navigation indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                  {banners.filter(b => b.active).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setCurrentBannerIndex(idx); }}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${idx === currentBannerIndex ? 'w-6 bg-[#D4A63D]' : 'w-1.5 bg-zinc-700'}`}
                    />
                  ))}
                </div>
              </section>

              {/* DOWNLOAD APP BANNER */}
              <a
                href="https://www.appcreator24.com/app4115582-8wnxv6"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gradient-to-l from-[#D4A63D]/10 via-[#121212] to-[#121212] border border-[#D4A63D]/20 hover:border-[#D4A63D]/50 rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,166,61,0.15)] group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#D4A63D] rounded-2xl flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(212,166,61,0.3)] group-hover:shadow-[0_0_30px_rgba(212,166,61,0.5)] transition-shadow">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-black" viewBox="0 0 24 24" fill="currentColor"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/></svg>
                  </div>
                  <div className="flex-1 text-right">
                    <h4 className="text-white font-extrabold text-sm sm:text-base group-hover:text-[#D4A63D] transition-colors">حمّل تطبيق MIX الآن</h4>
                    <p className="text-[#8E8E8E] text-[10px] sm:text-xs mt-0.5">تسوق من أي مكان على هاتفك - Google Play & App Store</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <div className="bg-[#121212] border border-[#2B2B2B] group-hover:border-[#D4A63D]/40 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all">
                      <svg className="w-4 h-4 text-[#8E8E8E] group-hover:text-[#D4A63D] transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 010 1.732l-2.807 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/></svg>
                      <span className="text-[9px] text-[#8E8E8E] group-hover:text-white transition-colors font-bold">Google Play</span>
                    </div>
                    <div className="bg-[#121212] border border-[#2B2B2B] group-hover:border-[#D4A63D]/40 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all">
                      <svg className="w-4 h-4 text-[#8E8E8E] group-hover:text-[#D4A63D] transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                      <span className="text-[9px] text-[#8E8E8E] group-hover:text-white transition-colors font-bold">App Store</span>
                    </div>
                  </div>
                </div>
              </a>

              {/* THREE CORE FEATURES DIRECTLY UNDER CAROUSEL */}
              <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-[#121212] border border-[#2B2B2B] rounded-2xl p-3 sm:p-5 flex items-center gap-3 sm:gap-4 hover:border-[#D4A63D]/30 transition-all">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#D4A63D]/10 rounded-xl flex items-center justify-center text-[#D4A63D] shrink-0">
                    <Shield size={16} />
                  </div>
                  <div className="text-right">
                    <h4 className="text-white font-bold text-[11px] sm:text-sm">🔒 دفع آمن ومحمي</h4>
                    <p className="text-[#8E8E8E] text-[9px] sm:text-xs mt-0.5 sm:mt-1">بوابات دفع مشفرة بالكامل تضمن حماية أموالك.</p>
                  </div>
                </div>

                <div className="bg-[#121212] border border-[#2B2B2B] rounded-2xl p-3 sm:p-5 flex items-center gap-3 sm:gap-4 hover:border-[#D4A63D]/30 transition-all">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#D4A63D]/10 rounded-xl flex items-center justify-center text-[#D4A63D] shrink-0">
                    <Smartphone size={16} />
                  </div>
                  <div className="text-right">
                    <h4 className="text-white font-bold text-[11px] sm:text-sm">⚡ شحن وتوصيل سريع</h4>
                    <p className="text-[#8E8E8E] text-[9px] sm:text-xs mt-0.5 sm:mt-1">توصيل فوري وبشراكة لوجستية مع كبرى شركات الشحن.</p>
                  </div>
                </div>

                <div className="bg-[#121212] border border-[#2B2B2B] rounded-2xl p-3 sm:p-5 flex items-center gap-3 sm:gap-4 hover:border-[#D4A63D]/30 transition-all sm:col-span-2 md:col-span-1">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#D4A63D]/10 rounded-xl flex items-center justify-center text-[#D4A63D] shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div className="text-right">
                    <h4 className="text-white font-bold text-[11px] sm:text-sm">📞 دعم فني 24/7</h4>
                    <p className="text-[#8E8E8E] text-[9px] sm:text-xs mt-0.5 sm:mt-1">خدمة عملاء وتاجر مخصصة لمساعدتكم في أي وقت.</p>
                  </div>
                </div>
              </section>

              {/* SEARCH SECTION WITH DROPDOWN CATEGORY AND FILTER BUTTON */}
              <section id="search-anchor" className="bg-[#121212] border border-[#2B2B2B] p-6 sm:p-8 rounded-2xl space-y-4">
                <div className="text-center sm:text-right">
                  <h3 className="text-lg font-extrabold text-white">البحث السريع المتقدم عن المتاجر والمنتجات</h3>
                  <p className="text-[#8E8E8E] text-xs mt-1">اكتب الكلمة المفتاحية، اختر الفئة المفضلة للفرز السريع</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search box */}
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="ابحث عن متجر، منتج، أو عرض... (مثال: أحذية، هواتف، العتيبي)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#0B0B0B] border border-[#2B2B2B] focus:border-[#D4A63D]/50 rounded-xl py-3 px-4 pr-11 text-xs sm:text-sm text-white focus:outline-none transition-all text-right"
                    />
                    <Search className="absolute right-4 top-3.5 w-4 h-4 text-[#8E8E8E]" />
                  </div>

                  {/* Category Dropdown */}
                  <div className="sm:w-48">
                    <select
                      value={selectedActivity}
                      onChange={(e) => setSelectedActivity(e.target.value)}
                      className="w-full bg-[#0B0B0B] border border-[#2B2B2B] focus:border-[#D4A63D]/50 rounded-xl py-3 px-4 text-xs sm:text-sm text-white focus:outline-none transition-all text-right cursor-pointer"
                    >
                      <option value="الكل">كل الأقسام</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filter Button (Reset filters/Apply filters) */}
                  <button
                    onClick={() => {
                      if (selectedActivity !== 'الكل' || searchQuery || filterCity !== 'الكل' || filterRating > 0) {
                        setSelectedActivity('الكل');
                        setSearchQuery('');
                        setFilterCity('الكل');
                        setFilterRating(0);
                        alert('تم إعادة تعيين جميع فلاتر البحث بنجاح!');
                      } else {
                        // Just trigger search filter scrolling
                        const el = document.getElementById('explore-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="px-6 py-3 bg-[#121212] hover:bg-[#1a1a1a] border border-[#2B2B2B] hover:border-[#D4A63D] text-white hover:text-[#D4A63D] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
                  >
                    <Filter size={16} />
                    <span>إعادة تعيين / فلتـرة</span>
                  </button>
                </div>

                {/* Quick search tags */}
                <div className="pt-2 flex flex-wrap gap-2 items-center text-xs">
                  <span className="text-[#8E8E8E] font-medium ml-1">أكثر الكلمات بحثاً:</span>
                  {['هواتف', 'سماعات', 'ساعات', 'ملابس', 'أحذية', 'عطور', 'إكسسوارات'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchQuery(tag)}
                      className="py-1 px-3 bg-[#0B0B0B] hover:bg-[#D4A63D]/10 text-[#D0D0D0] hover:text-[#D4A63D] border border-[#2B2B2B] hover:border-[#D4A63D]/30 rounded-xl transition-all text-[11px] cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </section>

              {/* BROWSE CATEGORIES SECTION */}
              <section id="categories-section" className="space-y-4">
                <div className="border-b border-[#2B2B2B] pb-2 text-right">
                  <h3 className="text-xl font-bold text-[#D4A63D]">تصفح حسب الفئة والمجال</h3>
                  <p className="text-[#8E8E8E] text-[10px] uppercase tracking-widest mt-1">تسوّق حسب احتياجك من كبرى الأقسام المنظمة</p>
                </div>
                
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-3">
                  <button
                    onClick={() => setSelectedActivity('الكل')}
                    className={`p-3 sm:p-4 rounded-2xl flex flex-col items-center gap-2 border transition-all cursor-pointer ${
                      selectedActivity === 'الكل'
                        ? 'border-[#D4A63D] bg-[#D4A63D]/10 text-[#D4A63D] font-bold shadow-[0_0_15px_rgba(212,166,61,0.1)]'
                        : 'border-[#2B2B2B] bg-[#121212] text-[#D0D0D0] hover:text-white hover:border-[#D4A63D]/40'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center font-black text-[10px] text-[#D4A63D] shrink-0">
                      MIX
                    </div>
                    <span className="text-[11px] font-bold">عرض الكل</span>
                  </button>

                  {categories.map((cat) => {
                    const IconComponent = ICON_MAP[cat.icon] || Sparkles;
                    const isPhoneCases = cat.name === 'صينات هوات';
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedActivity(cat.name);
                          if (isPhoneCases) {
                            setShowHeartPanel(true);
                          } else {
                            setShowHeartPanel(false);
                          }
                          const el = document.getElementById('explore-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`p-4 rounded-2xl flex flex-col items-center gap-2 border transition-all cursor-pointer relative ${
                          selectedActivity === cat.name
                            ? isPhoneCases
                              ? 'border-pink-500 bg-pink-500/10 text-pink-400 font-bold shadow-[0_0_20px_rgba(236,72,153,0.25)]'
                              : 'border-[#D4A63D] bg-[#D4A63D]/10 text-[#D4A63D] font-bold shadow-[0_0_15px_rgba(212,166,61,0.1)]'
                            : isPhoneCases
                              ? 'border-pink-900/40 bg-[#1a0f14] text-pink-300 hover:border-pink-500/60 hover:text-pink-300'
                              : 'border-[#2B2B2B] bg-[#121212] text-[#D0D0D0] hover:text-white hover:border-[#D4A63D]/40'
                        }`}
                      >
                        {isPhoneCases && (
                          <span className="absolute -top-1 -right-1 text-[10px] animate-bounce">💗</span>
                        )}
                        <div className={`w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0 ${
                          isPhoneCases ? 'text-pink-400' : 'text-[#D4A63D]'
                        }`}>
                          <IconComponent size={14} />
                        </div>
                        <span className="text-[11px] font-bold whitespace-nowrap">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* BEST STORES HORIZONTAL SCROLL SECTION */}
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-[#2B2B2B] pb-2">
                  <h3 className="text-sm font-bold text-[#D4A63D]">⭐ أفضل المتاجر</h3>
                  <button onClick={() => document.getElementById('stores-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-[10px] text-[#D4A63D] hover:text-[#E5BC55] font-bold cursor-pointer">
                    عرض الكل ←
                  </button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {stores.filter(s => s.status === 'active' && s.rating >= 4.5).slice(0, 10).map((store) => (
                    <div
                      key={store.id}
                      onClick={() => openStore(store)}
                      className="shrink-0 w-36 sm:w-44 bg-[#121212] border border-[#2B2B2B] hover:border-[#D4A63D]/40 rounded-2xl overflow-hidden cursor-pointer transition-all group"
                    >
                      <div className="h-16 sm:h-20 relative bg-zinc-950 overflow-hidden">
                        <img src={store.cover} alt="" referrerPolicy="no-referrer" loading="lazy"
                          className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-2 relative mt-[-16px]">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-[#D4A63D] p-0.5 bg-black mx-auto">
                          <img src={store.logo} alt={store.name} referrerPolicy="no-referrer" loading="lazy"
                            className="w-full h-full object-cover rounded-lg" />
                        </div>
                        <h4 className="text-white text-[10px] sm:text-xs font-bold text-center mt-1 truncate group-hover:text-[#D4A63D] transition-colors">
                          {store.name.split('|')[0].trim()}
                        </h4>
                        <div className="flex items-center justify-center gap-1 mt-0.5">
                          <Star size={8} className="text-[#D4A63D]" fill="currentColor" />
                          <span className="text-[9px] text-[#D4A63D] font-bold">{store.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* COMPREHENSIVE ADVANCED ADVANCED FILTERS BAR */}
              <section className="bg-[#121212]/80 backdrop-blur-md border border-[#2B2B2B] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="text-[#D4A63D] w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold text-[#D0D0D0]">تخصيص الفرز الجغرافي والجودة:</span>
                </div>

                <div className="flex gap-3 flex-wrap justify-end w-full sm:w-auto">
                  {/* City selector */}
                  <div className="text-xs">
                    <span className="text-[10px] text-[#8E8E8E] ml-1 block mb-1">المدينة والفرع</span>
                    <select
                      value={filterCity}
                      onChange={(e) => setFilterCity(e.target.value)}
                      className="bg-[#0B0B0B] border border-[#2B2B2B] text-white rounded-xl py-1.5 px-3 focus:outline-none cursor-pointer focus:border-[#D4A63D] text-xs"
                    >
                      <option value="الكل">كل مدن مصر 🇪🇬</option>
                      <option value="القاهرة">القاهرة</option>
                      <option value="الجيزة">الجيزة</option>
                      <option value="الإسكندرية">الإسكندرية</option>
                      <option value="المنصورة">المنصورة</option>
                      <option value="طنطا">طنطا</option>
                      <option value="المنيا">المنيا</option>
                      <option value="أسيوط">أسيوط</option>
                      <option value="سوهاج">سوهاج</option>
                      <option value="قنا">قنا</option>
                      <option value="الأقصر">الأقصر</option>
                      <option value="أسوان">أسوان</option>
                      <option value="الإسماعيلية">الإسماعيلية</option>
                      <option value="السويس">السويس</option>
                      <option value="دمياط">دمياط</option>
                      <option value="الفيوم">الفيوم</option>
                      <option value="بني سويف">بني سويف</option>
                      <option value="الغربية">الغربية</option>
                      <option value="كفر الشيخ">كفر الشيخ</option>
                      <option value="البحيرة">البحيرة</option>
                    </select>
                  </div>

                  {/* Rating Selector */}
                  <div className="text-xs">
                    <span className="text-[10px] text-[#8E8E8E] ml-1 block mb-1">التقييم والجودة</span>
                    <select
                      value={filterRating}
                      onChange={(e) => setFilterRating(Number(e.target.value))}
                      className="bg-[#0B0B0B] border border-[#2B2B2B] text-white rounded-xl py-1.5 px-3 focus:outline-none cursor-pointer focus:border-[#D4A63D] text-xs"
                    >
                      <option value={0}>كل مستويات التقييم</option>
                      <option value={4.5}>4.5 نجوم وأعلى ⭐</option>
                      <option value={4.8}>4.8 نجوم وأعلى ⭐</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* EXPLORE STORES SECTIONS (استكشف المحلات المميزة) */}
              <section id="explore-section" className="space-y-6">
                <div className="flex justify-between items-end flex-wrap gap-2 border-b border-[#2B2B2B] pb-3 text-right">
                  <div>
                    <h3 className={`text-xl font-bold ${showHeartPanel && selectedActivity === 'صينات هوات' ? 'text-pink-400' : 'text-[#D4A63D]'}`}>
                      {showHeartPanel && selectedActivity === 'صينات هوات' ? '💗 قلب متجر العتباوي لصينات الهواتف' : 'أبرز المتاجر والشركاء'}
                    </h3>
                    <p className="text-[#8E8E8E] text-xs mt-1">
                      {showHeartPanel && selectedActivity === 'صينات هوات'
                        ? 'افتح لوحة التحكم مباشرة أو ادخل بإيميلك وكلمة السر'
                        : 'اكتشف أرقى العلامات التجارية في السنتر الرقمي الموحد'}
                    </p>
                  </div>
                  <span className="text-xs bg-[#121212] border border-[#2B2B2B] py-1 px-3 rounded-xl text-[#D4A63D] font-mono">
                    النشاط المحدد: {selectedActivity}
                  </span>
                </div>

                {/* ===== HEART PANEL - يظهر عند اختيار قسم صينات هوات ===== */}
                {showHeartPanel && selectedActivity === 'صينات هوات' && (() => {
                  const alatbawiStore = stores.find(s => s.id === 'store-alatbawi');
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative overflow-hidden rounded-3xl border border-pink-500/20 bg-gradient-to-br from-[#1a0a14] via-[#0f0510] to-[#0B0B0B] shadow-[0_0_40px_rgba(236,72,153,0.08)] mb-8"
                    >
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4" />
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4" />
                      </div>

                      <div className="relative z-10 p-6 sm:p-10">
                        <div className="text-center mb-6">
                          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-pink-500/10 border border-pink-500/30 rounded-full text-pink-300 text-xs font-black tracking-wider">
                            <Smartphone size={12} />
                            متجر العتباوي لصينات الهواتف 💗
                          </span>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                          <PhoneCasesHeart
                            storeName={alatbawiStore?.name || 'متجر العتباوي لصينات الهواتف'}
                            storeLogo={alatbawiStore?.logo || 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=200&h=200&fit=crop'}
                            epithet={alatbawiStore?.epithet || '👑 ملك صينات الهواتف'}
                            hideButton
                          />
                          <button
                            onClick={() => { setShowMaintenance(false); setShowAlatbawiSection(true); }}
                            className="px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-sm font-black rounded-2xl transition-all shadow-[0_0_30px_rgba(236,72,153,0.3)] flex items-center gap-3 cursor-pointer"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                            <span>فتح متجر العتباوي</span>
                            <ChevronLeft size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })()}

                {filteredStores.length === 0 ? (
                  <div className="text-center py-16 bg-[#121212] border border-dashed border-[#2B2B2B] rounded-2xl">
                    <p className="text-[#8E8E8E] text-sm">لا تتوفر محلات مطابقة لهذه الفلاتر حالياً.</p>
                    <button
                      onClick={() => {
                        setSelectedActivity('الكل');
                        setFilterCity('الكل');
                        setFilterRating(0);
                      }}
                      className="mt-4 px-6 py-2 bg-[#D4A63D]/10 text-[#D4A63D] text-xs font-bold border border-[#D4A63D]/20 rounded-xl hover:bg-[#D4A63D]/20"
                    >
                      إعادة تعيين الفلاتر
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6" id="stores-section">
                    {filteredStores.map((store) => (
                      <div
                        key={store.id}
                        onClick={() => { if (store.id === 'store-alatbawi') { setShowAlatbawiSection(true); } else { openStore(store); } }}
                        className="group bg-[#121212] border border-[#2B2B2B] hover:border-[#D4A63D]/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-[0_8px_32px_rgba(212,166,61,0.1)] hover:-translate-y-1 flex flex-col justify-between relative"
                      >
                        {/* Subtle glow on hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-[#D4A63D]/5 via-transparent to-[#D4A63D]/5 rounded-2xl" />
                        {/* Cover Image */}
                        <div className="h-32 sm:h-36 relative bg-zinc-950 overflow-hidden">
                          <img
                            src={store.cover}
                            alt={store.name}
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            className="w-full h-full object-cover opacity-50 group-hover:scale-103 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-black/10" />
                          {/* City + Category badges */}
                          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                            <span className="bg-[#0B0B0B]/90 backdrop-blur text-[8px] sm:text-[9px] text-[#D4A63D] font-bold py-1 px-2 rounded-xl border border-[#2B2B2B]">
                              📍 {store.city}
                            </span>
                            <span className="bg-[#0B0B0B]/90 backdrop-blur text-[8px] sm:text-[9px] text-white font-bold py-1 px-2 rounded-xl border border-[#2B2B2B]">
                              {store.category}
                            </span>
                          </div>
                          {(store.category || '').includes('صينات') && (
                            <span className="absolute top-10 right-2 bg-pink-600/90 backdrop-blur text-[8px] text-white font-bold py-0.5 px-1.5 rounded-xl border border-pink-400/30 shadow-[0_0_12px_rgba(244,63,94,0.3)] flex items-center gap-1">
                              💗 قلب
                              {store.epithet && (
                                <span className="text-[7px] text-amber-300 mr-1">👑</span>
                              )}
                            </span>
                          )}
                        </div>

                        {/* Content details */}
                        <div className="p-3 sm:p-4 relative mt-[-28px] flex-1 flex flex-col justify-between">
                          <div>
                            {/* Logo badge floating */}
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl overflow-hidden border p-0.5 bg-black shadow-2xl relative z-10" style={{ borderColor: '#D4A63D' }}>
                              <img
                                src={store.logo}
                                alt={store.name}
                                referrerPolicy="no-referrer"
                                loading="lazy"
                                className="w-full h-full object-cover rounded-lg sm:rounded-xl"
                              />
                            </div>

                            <div className="mt-2 sm:mt-3">
                              <h4 className="text-white text-sm sm:text-base font-bold group-hover:text-[#D4A63D] transition-colors leading-tight">
                                {store.name}
                              </h4>
                              {store.epithet && (
                                <span className="block text-[8px] text-amber-400/80 font-bold mt-0.5 tracking-wide">{store.epithet}</span>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[#D4A63D] font-extrabold flex items-center gap-0.5 text-[10px]">
                                  <Star size={10} fill="currentColor" />
                                  {store.rating}
                                </span>
                                <span className="text-[#8E8E8E] text-[9px]">({store.reviewsCount})</span>
                                <span className="text-[#8E8E8E] text-[9px]">•</span>
                                <span className="text-[#8E8E8E] text-[9px]">{store.district ? `${store.district}،` : ''} {store.city}</span>
                              </div>
                            </div>

                            <p className="text-[#D0D0D0]/80 text-[10px] sm:text-xs mt-1.5 line-clamp-2 leading-relaxed">
                              {store.description}
                            </p>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-[#2B2B2B] text-[9px] sm:text-[10px] text-[#8E8E8E]">
                              <div className="flex items-center gap-2">
                                <span className="text-[#D0D0D0] font-medium">🛍️ {products.filter(p => p.storeId === store.id).length}</span>
                                <span className="text-[#D0D0D0] font-medium">📦 {store.salesCount || 0}</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleWishlist(store.id);
                                }}
                                className="p-1 rounded-full hover:bg-[#2B2B2B] transition-colors"
                                title="المفضلة"
                              >
                                <Heart size={11} className={wishlist.includes(store.id) ? "fill-red-500 text-red-500" : "text-zinc-500"} />
                              </button>
                            </div>

                            {/* Enter store action */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openStore(store);
                              }}
                              className="w-full mt-3 py-2 sm:py-2.5 bg-[#0B0B0B] hover:bg-zinc-900 border border-[#2B2B2B] group-hover:border-[#D4A63D]/40 text-[#D4A63D] font-bold text-[10px] sm:text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <span>دخول المتجر</span>
                              <ChevronLeft size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* PRODUCTS SECTION ("منتجات المنصة") */}
              <section id="products-section" className="space-y-6">
                <div className="flex justify-between items-end border-b border-[#2B2B2B] pb-2 text-right">
                  <div>
                    <h3 className="text-xl font-bold text-[#D4A63D]">منتجات السنتر الإلكتروني</h3>
                    <p className="text-[#8E8E8E] text-xs mt-1">تشكيلة حصرية للتسوق المباشر من كبرى محلات المنصة الموثوقة</p>
                  </div>
                  <button
                    onClick={() => {
                      setSearchQuery(' '); // space triggers list of all matching products
                      const sec = document.getElementById('search-anchor');
                      if (sec) sec.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="text-xs text-[#D4A63D] hover:text-[#E5BC55] font-bold hover:underline"
                  >
                    عرض الكل
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {products.filter(p => p.featured).slice(0, 12).map((product) => {
                    const parentStore = stores.find(s => s.id === product.storeId);
                    const isProductWishlisted = wishlist.includes(product.id);
                    const originalPrice = product.originalPrice || Math.round(product.price * 1.30);
                    const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);

                    return (
                      <div
                        key={product.id}
                        className="group bg-[#121212] border border-[#2B2B2B] hover:border-[#D4A63D]/30 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col justify-between"
                      >
                        <div className="aspect-square bg-zinc-950 overflow-hidden relative">
                          <img
                            src={product.image}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            onClick={() => { if (parentStore) openStore(parentStore); }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <span className="absolute top-2 right-2 bg-red-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-lg shadow-md">
                            خصم {discountPercent}%
                          </span>
                          
                          <button 
                            onClick={() => toggleWishlist(product.id)}
                            className="absolute top-2 left-2 p-1.5 bg-[#0B0B0B]/80 hover:bg-black text-[#8E8E8E] hover:text-red-500 rounded-full border border-[#2B2B2B] transition-all"
                            title="إضافة للمفضلة"
                          >
                            <Heart size={13} className={isProductWishlisted ? "fill-red-500 text-red-500" : ""} />
                          </button>

                          <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur text-[8px] text-[#D4A63D] font-bold px-2 py-0.5 rounded-lg border border-[#2B2B2B]">
                            🏬 {parentStore?.name.split('|')[0].trim()}
                          </div>
                        </div>

                        <div className="p-3 text-right flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] text-[#D4A63D] font-medium tracking-wider uppercase">{product.category}</span>
                            <h4 className="text-white text-xs font-bold mt-0.5 truncate group-hover:text-[#D4A63D] transition-colors">
                              {product.name}
                            </h4>
                          </div>

                          <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-[#2B2B2B]">
                            <div className="flex flex-col">
                              <span className="text-white text-xs sm:text-sm font-black">{product.price} {getProductCurrency(product.storeId)}</span>
                              <span className="text-[#8E8E8E] text-[9px] line-through">{originalPrice} {getProductCurrency(product.storeId)}</span>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (parentStore) handleAddToCart(product, parentStore);
                              }}
                              className="p-2 bg-[#0B0B0B] hover:bg-[#D4A63D] border border-[#2B2B2B] hover:border-[#D4A63D] text-white hover:text-black rounded-xl transition-all cursor-pointer"
                              title="أضف لسلة التسوق"
                            >
                              <ShoppingBag size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* ALL CATEGORIES SECTION - SHOW AT BOTTOM */}
              <section id="all-categories-section" className="space-y-4">
                <div className="border-b border-[#2B2B2B] pb-2 text-right">
                  <h3 className="text-xl font-bold text-[#D4A63D]">جميع الأقسام والتصنيفات</h3>
                  <p className="text-[#8E8E8E] text-[10px] uppercase tracking-widest mt-1">تصفح جميع التصنيفات المتاحة في المنصة</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const IconComponent = ICON_MAP[cat.icon] || Sparkles;
                    const isPhoneCases = cat.name === 'صينات هوات';
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedActivity(cat.name);
                          if (isPhoneCases) setShowHeartPanel(true);
                          else setShowHeartPanel(false);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          selectedActivity === cat.name
                            ? isPhoneCases
                              ? 'border-pink-500 bg-pink-500/10 text-pink-400'
                              : 'border-[#D4A63D] bg-[#D4A63D]/10 text-[#D4A63D]'
                            : 'border-[#2B2B2B] bg-[#121212] text-[#D0D0D0] hover:text-white hover:border-[#D4A63D]/40'
                        }`}
                      >
                        <IconComponent size={13} />
                        <span>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* PLATFORM TRUST FEATURES BAR */}
              <section id="features-bar" className="bg-[#121212] border border-[#2B2B2B] p-6 rounded-2xl">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center text-xs">
                  <div className="space-y-2 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-[#D4A63D]/15 flex items-center justify-center text-[#D4A63D]">
                      <ShoppingBag size={18} />
                    </div>
                    <span className="font-bold text-white block">آلاف المنتجات</span>
                    <span className="text-[#8E8E8E] text-[10px] block">تشكيلة واسعة تناسب ذوقك</span>
                  </div>

                  <div className="space-y-2 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-[#D4A63D]/15 flex items-center justify-center text-[#D4A63D]">
                      <Store size={18} />
                    </div>
                    <span className="font-bold text-white block">آلاف المتاجر</span>
                    <span className="text-[#8E8E8E] text-[10px] block">متاجر مرخصة وموثوقة</span>
                  </div>

                  <div className="space-y-2 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-[#D4A63D]/15 flex items-center justify-center text-[#D4A63D]">
                      <Gem size={18} />
                    </div>
                    <span className="font-bold text-white block">أفضل الأسعار</span>
                    <span className="text-[#8E8E8E] text-[10px] block">عروض وتخفيضات مستمرة</span>
                  </div>

                  <div className="space-y-2 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-[#D4A63D]/15 flex items-center justify-center text-[#D4A63D]">
                      <Shield size={18} />
                    </div>
                    <span className="font-bold text-white block">دفع آمن</span>
                    <span className="text-[#8E8E8E] text-[10px] block">حماية مشفرة مئة بالمئة</span>
                  </div>

                  <div className="space-y-2 flex flex-col items-center col-span-2 md:col-span-1">
                    <div className="w-10 h-10 rounded-full bg-[#D4A63D]/15 flex items-center justify-center text-[#D4A63D]">
                      <Smartphone size={18} />
                    </div>
                    <span className="font-bold text-white block">شحن سريع</span>
                    <span className="text-[#8E8E8E] text-[10px] block">لباب بيتك في وقت قياسي</span>
                  </div>
                </div>
              </section>

            </main>
          )}

          {/* LUXURIOUS PLATFORM FOOTER */}
          <footer id="footer-section" className="border-t border-[#2B2B2B] mt-20 pt-16 pb-12 bg-[#0B0B0B] z-10 relative">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 text-right text-[#FFFFFF] text-xs">
              
              {/* Col 1: Brand details and App Badges */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {platformSettings.platformLogo && (
                    <img src={platformSettings.platformLogo} alt="Logo" className="w-10 h-10 rounded-xl object-cover border border-[#2B2B2B]" />
                  )}
                  <h1 className="text-2xl font-black tracking-tighter font-sans" style={{ color: platformSettings.brandColor || platformSettings.platformSecondaryColor || '#D4A63D' }}>
                    {platformName || 'MIX'}<span className="text-white italic">.</span>
                  </h1>
                </div>
                <p className="leading-relaxed font-light text-white/70">
                  {platformSettings.aboutText || 'منصة السنتر والمركز التجاري الرقمي الموحد (Digital Mall) الأكبر بالمملكة ودول الخليج. نجمع آلاف المحلات والماركات المستقلة الفاخرة تحت مظلة تسوق موحدة بموثوقية وضمان تام.'}
                </p>

                {/* App Sections Badges */}
                <div className="space-y-2 pt-2">
                  <span className="text-white font-bold text-[10px] block">تطبيقات المنصة على الهواتف الذكية 📱</span>
                  <div className="flex flex-row gap-2 justify-start items-center">
                    <a href="https://www.appcreator24.com/app4115582-8wnxv6" target="_blank" rel="noopener noreferrer" className="bg-[#121212] border border-[#2B2B2B] hover:border-[#D4A63D]/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all hover:shadow-[0_0_15px_rgba(212,166,61,0.15)] group">
                      <svg className="w-4 h-4 text-white group-hover:text-[#D4A63D] transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 010 1.732l-2.807 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/></svg>
                      <div className="text-[8px] text-right font-light text-white/60 group-hover:text-[#D4A63D] transition-colors">حمّله من <span className="font-bold text-white block text-[10px] group-hover:text-[#D4A63D]">Google Play</span></div>
                    </a>
                    <a href="https://www.appcreator24.com/app4115582-8wnxv6" target="_blank" rel="noopener noreferrer" className="bg-[#121212] border border-[#2B2B2B] hover:border-[#D4A63D]/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all hover:shadow-[0_0_15px_rgba(212,166,61,0.15)] group">
                      <svg className="w-4 h-4 text-white group-hover:text-[#D4A63D] transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                      <div className="text-[8px] text-right font-light text-white/60 group-hover:text-[#D4A63D] transition-colors">حمّله من <span className="font-bold text-white block text-[10px] group-hover:text-[#D4A63D]">App Store</span></div>
                    </a>
                  </div>
                </div>
              </div>

              {/* Col 2: Core Links (Primary) */}
              <div className="space-y-3 font-light text-white/70">
                <h4 className="text-white font-bold text-xs text-[#D4A63D] mb-3">الروابط الرئيسية</h4>
                <p className="hover:text-[#D4A63D] transition-colors cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>الرئيسية</p>
                <p className="hover:text-[#D4A63D] transition-colors cursor-pointer" onClick={() => { const el = document.getElementById('stores-section'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}>المتاجر الشريكة</p>
                <p className="hover:text-[#D4A63D] transition-colors cursor-pointer" onClick={() => { const el = document.getElementById('categories-section'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}>أقسام التسوق</p>
                <p className="hover:text-[#D4A63D] transition-colors cursor-pointer" onClick={() => { const el = document.getElementById('products-section'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}>أحدث المنتجات</p>
                <p className="hover:text-[#D4A63D] transition-colors cursor-pointer" onClick={() => setSearchQuery('عرض')}>العروض والخصومات الجارية</p>
              </div>

              {/* Col 3: Customer Service Links */}
              <div className="space-y-3 font-light text-white/70">
                <h4 className="text-white font-bold text-xs text-[#D4A63D] mb-3">خدمة المساعدة والأمان</h4>
                <p className="hover:text-[#D4A63D] transition-colors cursor-pointer">• خدمة العملاء (24/7)</p>
                <p className="hover:text-[#D4A63D] transition-colors cursor-pointer">• الأسئلة الشائعة للعملاء والتاجر</p>
                <p className="hover:text-[#D4A63D] transition-colors cursor-pointer">• سياسة الشحن والتوصيل الفوري</p>
                <p className="hover:text-[#D4A63D] transition-colors cursor-pointer">• ضمان استرجاع الأموال وحماية المتسوق</p>
                <p className="hover:text-[#D4A63D] transition-colors cursor-pointer">• سياسة الاستخدام والخصوصية</p>
              </div>

              {/* Col 4: Platform and Merchant Links */}
              <div className="space-y-3 font-light text-white/70">
                <h4 className="text-white font-bold text-xs text-[#D4A63D] mb-3">عن منصة MIX</h4>
                <p className="hover:text-[#D4A63D] transition-colors cursor-pointer">• من نحن ورؤيتنا المستقبلية</p>
                <p className="hover:text-[#D4A63D] transition-colors cursor-pointer">• مركز المدونة والأخبار</p>
                <p className="hover:text-[#D4A63D] transition-colors cursor-pointer">• الوظائف والفرص الشاغرة</p>
                <p className="hover:text-[#D4A63D] transition-colors cursor-pointer">• شركاء النجاح والمستثمرون</p>
                <p className="hover:text-[#D4A63D] transition-colors cursor-pointer">• بوابة الموردين والمحلات الكبرى</p>
              </div>

            </div>

            {/* Social media, Payments logo, Copyright */}
            <div className="max-w-7xl mx-auto px-6 border-t border-[#2B2B2B] mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center text-white/60 text-[10px] gap-6">
              
              {/* Right side: Copyright */}
              <div className="text-right space-y-1">
                <span className="text-white/80">جميع الحقوق محفوظة © {new Date().getFullYear()} لمنصة {platformName || 'MIX'} - {platformSettings.footerText || 'السنتر الإلكتروني الموحد'}.</span>
                <span className="block font-mono tracking-widest text-[#D4A63D]">{platformSettings.contactEmail || 'Coded with Luxury, Gold & Egyptian/Saudi Aesthetic'}</span>
              </div>

              {/* Middle: Social links */}
              <div className="flex gap-4 text-white text-xs font-bold">
                {(platformSettings.socialLinks || [
                  { platform: 'Facebook', url: '#', icon: '📘' },
                  { platform: 'Twitter/X', url: '#', icon: '𝕏' },
                  { platform: 'Instagram', url: '#', icon: '📷' },
                  { platform: 'TikTok', url: '#', icon: '🎵' },
                  { platform: 'YouTube', url: '#', icon: '▶️' }
                ]).map((link: any, i: number) => {
                  const label = typeof link === 'string' ? link : link.platform || link.label || '';
                  const url = typeof link === 'string' ? '#' : link.url || '#';
                  const icon = typeof link === 'string' ? '' : link.icon || '';
                  return (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="hover:text-[#D4A63D] transition-colors cursor-pointer font-bold flex items-center gap-1">
                      {icon && <span>{icon}</span>}
                      <span>{label}</span>
                    </a>
                  );
                })}
              </div>

              {/* Left side: Payment Methods */}
              <div className="flex flex-row items-center gap-2">
                <span className="text-[9px] text-white/70 font-bold">طرق دفع آمنة:</span>
                <div className="flex gap-1.5 text-[10px] text-white">
                  <span className="bg-[#121212] border border-[#2B2B2B] px-2 py-1 rounded-md font-bold hover:border-[#D4A63D] transition-colors">mada</span>
                  <span className="bg-[#121212] border border-[#2B2B2B] px-2 py-1 rounded-md font-bold hover:border-[#D4A63D] transition-colors">Visa</span>
                  <span className="bg-[#121212] border border-[#2B2B2B] px-2 py-1 rounded-md font-bold hover:border-[#D4A63D] transition-colors">Mastercard</span>
                  <span className="bg-[#121212] border border-[#2B2B2B] px-2 py-1 rounded-md font-bold hover:border-[#D4A63D] transition-colors">فودافون كاش</span>
                  <span className="bg-[#121212] border border-[#2B2B2B] px-2 py-1 rounded-md font-bold hover:border-[#D4A63D] transition-colors">انستا بي</span>
                </div>
              </div>

            </div>
          </footer>

        </div>
      )}

      {/* SHOPPING CART SIDE DRAWER */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        coupons={coupons}
        stores={stores}
      />

      {/* LOGIN / SIGNUP MODAL */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          // If role is merchant, automatically show merchant dashboard
          if (user.role === 'merchant') {
            setActivePortal('merchant');
          } else if (user.role === 'admin') {
            setActivePortal('admin');
          } else {
            setActivePortal('mall');
          }
          refreshDatabaseStates();
          
          // Show success toast for new store creation and redirect
          if (user.role === 'merchant' && user.storeId) {
            setTimeout(() => {
              const newStore = stores.find(s => s.id === user.storeId);
              if (newStore) {
                alert(`🎉 مرحباً بك في منصة MIX!\n\nتم إنشاء متجرك "${newStore.name}" بنجاح\n📱 رابط المتجر: ${window.location.origin}${window.location.pathname}#/store/${newStore.id}\n\nيمكنك الآن إدارة متجرك من لوحة التحكم.`);
                // Refresh stores list to ensure the new store appears
                refreshDatabaseStates();
              }
            }, 500);
          }
        }}
        onOpenHeartDashboard={() => {
          setIsAuthOpen(true);
        }}
      />

      {/* ===== MOBILE BOTTOM NAVIGATION BAR ===== */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div 
          className="pointer-events-auto mx-2 mb-1 bg-[#111111]/95 backdrop-blur-2xl border border-[#2A2A2A] rounded-2xl shadow-[0_-4px_30px_rgba(0,0,0,0.8)] px-1 py-1.5 flex items-center justify-around max-w-md mx-auto"
        >
          {[
            { 
              icon: <svg className="w-5 h-5" fill={activePortal === 'mall' && !searchQuery && !selectedStore ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={activePortal === 'mall' && !searchQuery && !selectedStore ? 0 : 2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>, 
              label: 'الرئيسية', 
              action: () => { setSelectedStore(null); setSearchQuery(''); setSelectedActivity('الكل'); const el = document.getElementById('content-scroll'); if (el) el.scrollTo({ top: 0, behavior: 'smooth' }); }, 
              isActive: activePortal === 'mall' && !searchQuery && !selectedStore 
            },
            { 
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>, 
              label: 'الأقسام', 
              action: () => { setSelectedStore(null); setSearchQuery(''); document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' }); },
              isActive: false
            },
            { 
              icon: <div className="relative"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>{cart.length > 0 && <span className="absolute -top-1.5 -right-1.5 bg-[#D4A63D] text-black text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-lg">{cart.length}</span>}</div>, 
              label: 'السلة', 
              action: () => setIsCartOpen(true), 
              isActive: isCartOpen 
            },
            { 
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>, 
              label: 'إنشاء متجر', 
              action: () => { 
                if (currentUser && currentUser.role === 'merchant') { setActivePortal('merchant'); }
                else if (currentUser && currentUser.role === 'admin') { setActivePortal('admin'); }
                else { setIsAuthOpen(true); }
              },
              isActive: currentUser?.role === 'merchant' || currentUser?.role === 'admin'
            },
            { 
              icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>, 
              label: currentUser ? 'حسابي' : 'دخول', 
              action: () => { 
                if (currentUser && currentUser.role === 'merchant') setShowMerchantProfile(true);
                else if (currentUser && currentUser.role === 'admin') setActivePortal('admin');
                else if (currentUser) setShowUserProfile(true);
                else setIsAuthOpen(true);
              },
              isActive: false
            },
          ].map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-1.5 px-2.5 rounded-xl transition-all duration-150 cursor-pointer min-w-[52px] ${
                item.isActive 
                  ? 'text-[#D4A63D]' 
                  : 'text-white/70 active:text-white'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
            >
              {item.isActive && (
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-[#D4A63D] rounded-full shadow-[0_0_8px_rgba(212,166,61,0.6)]" />
              )}
              <span className="transition-transform duration-100 active:scale-90">{item.icon}</span>
              <span className="text-[9px] font-extrabold leading-none tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>
        
        {/* Bottom Info Strip */}
        <div className="pointer-events-auto mx-2 mb-0.5 bg-[#0D0D0D]/80 backdrop-blur-md border border-[#1A1A1A] rounded-xl px-3 py-1 flex items-center justify-between max-w-md mx-auto">
          <a href="https://www.appcreator24.com/app4115582-8wnxv6" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[#D4A63D] hover:text-[#E5BC55] transition-colors">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/></svg>
            <span className="text-[9px] font-extrabold tracking-wider">حمّل التطبيق</span>
          </a>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
            </span>
            <span className="text-[9px] text-green-400 font-extrabold">LIVE</span>
          </div>
        </div>
      </div>

      </div>{/* end content wrapper */}

      {/* LIVE CONNECTION INDICATOR - Desktop */}
      <div className="hidden lg:flex fixed bottom-6 right-6 z-50 items-center gap-2 px-3 py-1.5 bg-[#0B0B0B]/90 backdrop-blur-md border border-[#2B2B2B] rounded-full">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </span>
        <span className="text-[9px] text-green-400 font-bold tracking-wider">LIVE</span>
      </div>

      {/* USER PROFILE MODAL */}
      {showUserProfile && currentUser && (
        <UserProfile 
          user={currentUser} 
          orders={orders}
          wishlist={wishlist}
          onClose={() => setShowUserProfile(false)} 
          onLogout={() => { setCurrentUser(null); setShowUserProfile(false); }} 
        />
      )}

      {/* MERCHANT PROFILE MODAL */}
      {showMerchantProfile && currentUser && (
        <MerchantProfile 
          user={currentUser} 
          store={stores.find(s => s.id === currentUser.storeId)}
          orders={orders}
          onClose={() => setShowMerchantProfile(false)} 
          onLogout={() => { setCurrentUser(null); setShowMerchantProfile(false); }}
          onViewDashboard={() => { setShowMerchantProfile(false); setActivePortal('merchant'); }}
          onViewStore={() => { 
            const myStore = stores.find(s => s.id === currentUser.storeId);
            if (myStore) { setShowMerchantProfile(false); openStore(myStore); }
          }}
        />
      )}

    </div>
  );
}
