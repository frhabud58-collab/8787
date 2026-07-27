
import React, { useState } from 'react';
import { AppProvider, useApp } from '../context/AppContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { DeviceSimulator } from './DeviceSimulator';
import { LanguageSelector } from './LanguageSelector';
import { BannerSlider } from './BannerSlider';
import { ProductCard } from './ProductCard';
import { ProductDetailsModal } from './ProductDetailsModal';
import { MaintenanceForm } from './MaintenanceForm';
import { ChatInterface } from './ChatInterface';
import { ClientAccount } from './ClientAccount';
import { AdminPanel } from './AdminPanel';
import { SuperAdminPanel } from './SuperAdminPanel';
import { CheckoutScreen } from './CheckoutScreen';
import { LoginScreen } from './LoginScreen';
import ParticleAnimation from './ParticleAnimation';
import { Product } from '../types';
import {
  Home,
  ShoppingBag,
  Wrench,
  MessageSquare,
  User,
  Search,
  Phone,
  MessageCircle,
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight,
  Shield,
  Heart,
  ShoppingCart,
  Menu,
  X,
  Facebook,
  Instagram,
  Radio,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from '../utils/translations';

function MainAppContent({ onBack }: { onBack: () => void }) {
  const {
    language,
    isClientMode,
    setIsClientMode,
    activeSection,
    setActiveSection,
    products,
    settings,
    cart,
    favorites,
    toggleFavorite,
  } = useApp();

  const { user, loading } = useAuth();

  const t = translations[language];

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Don't redirect automatically to admin panel anymore
  React.useEffect(() => {
    if (user) {
      setIsClientMode(true); // Always start in client mode first
      if (activeSection === 'admin') {
        setActiveSection('home');
      }
    }
  }, [user, activeSection, setActiveSection, setIsClientMode]);

  // Update Title and Favicon based on settings
  React.useEffect(() => {
    document.title = language === 'ar' ? settings.storeNameAr : settings.storeNameEn;
    if (settings.storeLogo) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = settings.storeLogo;
    }
  }, [settings.storeNameAr, settings.storeNameEn, settings.storeLogo, language]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#02020D] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  // Home Categories list
  const categoryCards = settings.categories || [];

  // Testimonials list
  const clientReviews = [
    { name: "خالد الحربي", rating: 5, commentAr: "تم إصلاح شاشة الآيفون أمامي في 20 دقيقة وبسعر ممتاز جداً مع ضمان 3 أشهر! شغل نظيف وراقي.", commentEn: "Repaired my iPhone screen right in front of me in 20 mins. Excellent prices and true 3-month warranty." },
    { name: "أميرة عسيري", rating: 5, commentAr: "اشتريت سماعة AirPods مستعملة نظيفة جداً كأنها جديدة تماماً والبطارية ممتازة. محترمون وأنصح بالتعامل معهم.", commentEn: "Bought certified used AirPods, absolutely pristine condition and amazing battery lifespan. Recommended!" },
    { name: "سلطان العتيبي", rating: 4.8, commentAr: "خدمة صيانة التابلت والأجهزة سريعة ومميزة جداً، والتطبيق يسهل متابعة الطلبات والدردشة مع الفني.", commentEn: "Great diagnostic flow. The live tracking feature and chatting directly with the tech is super convenient." }
  ];

  // Filter products
  const filteredProducts = products.filter((prod) => {
    const matchesSearch =
      prod.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || prod.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const bestSellers = products.filter((p) => p.isBestSeller);
  const latestOffers = products.filter((p) => p.isOffer);

  // App Layout Navigation Header / Bottom bars
  const clientNavLinks = [
    { id: 'home', labelAr: "الرئيسية", labelEn: 'Home', icon: Home },
    { id: 'shop', labelAr: "المتجر الإلكتروني", labelEn: 'Online Store', icon: ShoppingBag },
    { id: 'maintenance', labelAr: "طلب صيانة", labelEn: 'Maintenance Request', icon: Wrench },
    { id: 'chat', labelAr: "محطة مباشرة", labelEn: 'Live Station', icon: Radio },
    { id: 'account', labelAr: "حسابي", labelEn: 'My Account', icon: User },
  ];

  return (
    <div className={`flex flex-col flex-1 bg-transparent text-white min-h-[70vh] custom-body-bg ${
      language === 'ar' ? 'rtl' : 'ltr'
    }`} style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
      
      <style>{`
        :root {
          --primary-color: #FF7A00;
          --header-color: #0F172A;
          --bg-color: #FFFFFF;
          --bottom-color: #FFFFFF;
        }

        /* Overwrite standard Tailwind accent orange colors dynamically */
        .bg-orange-500, 
        .hover\\:bg-orange-500:hover, 
        .bg-orange-600, 
        .hover\\:bg-orange-600:hover {
          background: linear-gradient(135deg, #FF7A00 0%, #FF9F1A 100%) !important;
        }
        .text-orange-500, 
        .text-orange-600, 
        .text-orange-400, 
        .hover\\:text-orange-500:hover {
          color: #FF7A00 !important;
        }
        .border-orange-500, 
        .border-orange-600, 
        .hover\\:border-orange-500:hover,
        .hover\\:border-orange-600:hover {
          border-color: #FF7A00 !important;
        }
        .shadow-orange-500\\/10, 
        .shadow-orange-500\\/20, 
        .shadow-orange-500\\/30 {
          --tw-shadow-color: #FF7A00 !important;
        }
        
        .bg-\\[\\#0a192f\\] {
          background-color: #0F172A !important;
        }
        
        /* Fix the body background to match dark theme always */
        html:not(.dark) .custom-body-bg,
        html.dark .custom-body-bg {
          background-color: transparent !important;
        }
        html:not(.dark) .custom-bottom-bg,
        html.dark .custom-bottom-bg {
          background-color: rgba(3, 2, 20, 0.95) !important;
          border-color: rgba(255, 0, 127, 0.2) !important;
        }

        /* Heading underlines in line with the high-end look */
        .heading-underline {
          position: relative;
          display: inline-block;
          padding-bottom: 6px;
        }
        .heading-underline::after {
          content: '';
          position: absolute;
          bottom: 0;
          right: 0;
          width: 32px;
          height: 3px;
          background: linear-gradient(135deg, #FF7A00 0%, #FF9F1A 100%);
          border-radius: 999px;
        }
        [dir="ltr"] .heading-underline::after {
          right: auto;
          left: 0;
        }
      `}</style>
      
      {/* Dynamic Header Bar - With Pink-Cyan Gradient Glow matching the screenshot */}
                      <header className="bg-[#030214]/70 text-white sticky top-0 z-40 px-4 sm:px-6 py-4 shadow-2xl backdrop-blur-md">
                        <div className="flex items-center justify-between max-w-7xl mx-auto gap-4">
                          
                          {/* Back button to platform */}
                          <button 
                            onClick={onBack}
                            className="p-2 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 hover:bg-gradient-to-r from-purple-600/30 to-pink-600/30 hover:border-purple-400/50 text-white flex items-center gap-2 text-xs font-bold transition-all cursor-pointer"
                          >
                            <ChevronLeft size={14} />
                            <span>الرجوع للمنصة</span>
                          </button>

                          {/* Logo Brand Title with Custom 3D Neon App Icon matching the screenshot exactly */}
                          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveSection('home')}>
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0F0A3C] to-[#2D0A4B] border-2 border-[#FF00FF]/50 flex items-center justify-center shadow-[0_0_30px_rgba(255,0,255,0.4)] shrink-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <ShoppingCart className="w-6 h-6 text-white z-10" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm sm:text-base tracking-tight text-white leading-tight">
                {language === 'ar' ? "العتباوي للهواتف وصيانتها" : "Al Atbawi Phones & Repair"}
              </span>
              <span className="text-[10px] text-cyan-400 font-black tracking-wider leading-none mt-1 uppercase">
                {language === 'ar' ? "جوالات وإكسسوارات" : "Phones & Accessories"}
              </span>
            </div>
          </div>

          {/* Nav Links */}
          {isClientMode && (
            <nav className="hidden md:flex items-center gap-2">
              {clientNavLinks.map((link) => {
                const Icon = link.icon;
                const isSel = activeSection === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => setActiveSection(link.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 ${
                      isSel
                        ? 'bg-gradient-to-r from-[#FF00FF] to-[#00FFFF] text-white shadow-[0_0_20px_rgba(255,0,255,0.5)]'
                        : 'text-white/90 hover:text-[#00FFFF] hover:bg-[#030214]/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{language === 'ar' ? link.labelAr : link.labelEn}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Configurations toggles side */}
          <div className="flex items-center gap-3">
            {/* Real Language Selector */}
            <LanguageSelector />
            
            {/* Heart Button with gradient (Favorites) */}
            <button 
              onClick={() => setActiveSection('account')} 
              className="p-2 rounded-full bg-gradient-to-r from-[#FF00FF]/20 to-[#00FFFF]/20 border border-[#FF00FF]/40 hover:shadow-[0_0_15px_rgba(255,0,255,0.3)] transition-all relative"
            >
              <Heart className="w-5 h-5 text-orange-500" />
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#FF00FF] text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Cart Button with gradient */}
            <button 
              onClick={() => setActiveSection('account')} 
              className="p-2 rounded-full bg-gradient-to-r from-[#FF00FF] to-[#FF7A00] border border-[#FF00FF]/60 shadow-[0_0_20px_rgba(255,0,255,0.5)] hover:scale-105 transition-all relative"
            >
              <ShoppingCart className="w-5 h-5 text-white" />
              {cart.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            {isClientMode && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-white hover:bg-[#030214]/5 rounded-xl transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Mobile Collapsible Navigation Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#030214] border-[#FF007F]/20 border-[#FF007F]/20 px-4 py-4 space-y-2.5 z-40 overflow-hidden"
          >
            {clientNavLinks.map((link) => {
              const Icon = link.icon;
              const isSelected = activeSection === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveSection(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-xs sm:text-sm font-bold text-right border-[#FF007F]/20 last:border-0 border-white/5 transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#FF007F] to-[#FF7A00] text-white shadow-md shadow-pink-500/10'
                      : 'text-gray-300 hover:text-[#FF007F] hover:bg-[#030214]/5'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span>{language === 'ar' ? link.labelAr : link.labelEn}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* PRIMARY ACTIVE VIEW CONTENT DISPLAY */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full"
          >
            
            {/* VIEW 1: HOME PANEL */}
            {activeSection === 'home' && (
              <div className="space-y-10">
                
                {/* Auto Banner Slider */}
                <BannerSlider onSelectCategory={setSelectedCategory} />

                {/* Direct Rapid Search Bar with Pink-Cyan Gradient design matching the screenshot */}
                <div className="max-w-2xl mx-auto">
                  <div className="relative flex items-center rounded-full overflow-hidden">
                    {/* Gradient border glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF00FF] via-[#00FFFF] to-[#FF00FF] rounded-full opacity-75 blur-sm" />
                    
                    <div className="relative flex items-center w-full rounded-full bg-[#040417] px-4">
                      <button
                        onClick={() => setActiveSection('shop')}
                        className={`p-3 rounded-full bg-gradient-to-r from-[#FF00FF] to-[#FF7A00] text-white shadow-[0_0_20px_rgba(255,0,255,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 ${
                          language === 'ar' ? 'ml-0 order-2' : 'mr-0 order-1'
                        }`}
                      >
                        <Search className="w-5 h-5 text-white" />
                      </button>
                      <input
                        type="text"
                        placeholder={t.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`flex-1 py-4 text-sm bg-transparent focus:outline-none text-white font-semibold placeholder-slate-400 ${
                          language === 'ar' ? 'pr-4 text-right' : 'pl-4 text-left'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Categories Cards with Pink-Cyan Gradient design */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-white">
                        {language === 'ar' ? 'الأقسام الرئيسية' : 'Categories'}
                      </h3>
                      <div className="text-pink-500">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                    {categoryCards.map((cat) => (
                      <div
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setActiveSection('shop');
                        }}
                        className="relative rounded-[22px] p-5 flex flex-col items-center justify-between text-center cursor-pointer hover:-translate-y-1.5 transition-all duration-300 group"
                      >
                        {/* Gradient Border Glow */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF00FF] via-[#00FFFF] to-[#FF00FF] rounded-[22px] opacity-60 blur-sm group-hover:opacity-100 transition-opacity" />
                        
                        <div className="relative bg-[#040417] rounded-[22px] w-full h-full p-4 flex flex-col items-center justify-between">
                          <div className="w-20 h-20 rounded-full bg-[#030214] flex items-center justify-center overflow-hidden mb-3 group-hover:scale-105 transition-all duration-300 relative">
                            <div className="absolute inset-0 rounded-full border border-transparent bg-gradient-to-r from-[#FF00FF] to-[#00FFFF] opacity-50 group-hover:opacity-100 transition-opacity" style={{ padding: '2px' }}>
                              <div className="absolute inset-0 rounded-full bg-[#030214]" />
                            </div>
                            <img src={cat.image} alt={cat.titleEn} className="max-h-12 max-w-12 object-contain z-10 group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                          </div>
                          <span className="text-sm font-black text-white leading-tight group-hover:text-[#00FFFF] transition-colors duration-300">
                            {language === 'ar' ? cat.titleAr : cat.titleEn}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Best Sellers block */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-white">
                        {language === 'ar' ? 'المنتجات الأكثر مبيعاً' : t.bestSellers}
                      </h3>
                      <span className="animate-bounce">🔥</span>
                    </div>
                    <button
                      onClick={() => setActiveSection('shop')}
                      className="text-xs font-black text-orange-500 hover:text-[#FF007F] hover:underline flex items-center gap-1 transition-colors"
                    >
                      <span>{language === 'ar' ? 'مشاهدة الكل' : 'View All'}</span>
                      {language === 'ar' ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {bestSellers.slice(0,4).map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        onOpenDetails={setSelectedProduct}
                      />
                    ))}
                  </div>
                </div>

                {/* Special Repairs Hub Teaser with glowing border and neon colors */}
                <div className="bg-[#040417] p-8 sm:p-14 rounded-[24px] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden border border-[#FF007F]/20">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF007F]/10 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00FFFF]/10 rounded-full blur-3xl animate-pulse" />
                  
                  <div className={`space-y-4 flex-1 ${
                    language === 'ar' ? 'text-right' : 'text-left'
                  }`}>
                    <span className="bg-gradient-to-r from-[#FF007F] to-[#FF7A00] text-white text-[10px] font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider">
                      {language === 'ar' ? 'صيانة فورية مضمونة' : 'GUARANTEED REPAIR SERVICE'}
                    </span>
                    <h3 className="text-xl sm:text-3xl font-black leading-tight text-white glow-text-pink">
                      {language === 'ar' ? 'هل تعطل هاتف أو سماعة AirPods الخاصة بك؟' : 'Is your smartphone, tablet or Airpods broken?'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium leading-relaxed">
                      {language === 'ar'
                        ? 'نقدم خدمة فحص مجاني متكامل، صيانة شاشات فورية، حل مشاكل الصوت والبطارية، وقطع غيار أصلية بضمان معتمد بالإضافة إلى أحدث الإكسسوارات الفاخرة.'
                        : 'Get a free diagnosis, instant screen swap, battery replacements, and certified audio diagnostics with up to 6 months of absolute warranty coverage!'}
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveSection('maintenance')}
                    className="bg-gradient-to-r from-[#FF007F] to-[#FF7A00] hover:from-[#FF1A8B] hover:to-[#FF8B1A] text-white font-extrabold py-4 px-8 rounded-2xl text-xs sm:text-sm shadow-xl shadow-pink-500/25 transition-all hover:scale-105 active:scale-95 duration-300 flex-shrink-0"
                  >
                    {t.submitMaintenance}
                  </button>
                </div>

                {/* Customer Reviews Feedback loop */}
                <div className="space-y-6">
                  <h3 className="text-base sm:text-lg font-black text-white heading-underline">
                    {language === 'ar' ? 'آراء العملاء' : t.reviewsTitle}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {clientReviews.map((rev, idx) => (
                      <div key={idx} className="relative rounded-[24px] p-6 overflow-hidden">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF00FF] via-[#00FFFF] to-[#FF00FF] rounded-[24px] opacity-60 blur-sm" />
                        <div className="relative bg-[#040417] rounded-[22px] w-full h-full p-5 flex flex-col justify-between text-right">
                          <div className="space-y-3">
                            <div className="flex text-amber-500 gap-0.5 justify-end">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-current text-amber-400" />
                              ))}
                            </div>
                            <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                              "{language === 'ar' ? rev.commentAr : rev.commentEn}"
                            </p>
                          </div>
                          <span className="text-xs font-black text-white block mt-4 border-t pt-3 border-[#FF007F]/20">
                            - {rev.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Interactive location and contact buttons */}
                <div className="relative rounded-[24px] p-6 sm:p-8 overflow-hidden">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF00FF] via-[#00FFFF] to-[#FF00FF] rounded-[24px] opacity-60 blur-sm" />
                  
                  <div className="relative bg-[#040417] rounded-[22px] w-full h-full p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className={`space-y-2 ${
                      language === 'ar' ? 'text-right' : 'text-left'
                    }`}>
                      <h4 className="text-sm sm:text-base font-black text-white">
                        {language === 'ar' ? 'يسعدنا تشريفك لفرعنا الرئيسي بالعبور' : 'Visit Al Atbawi Main Store in Al Obour'}
                      </h4>
                      <p className="text-xs text-slate-400 font-medium">
                        {language === 'ar' ? settings.locationNameAr : settings.locationNameEn}
                      </p>
                    </div>

                    {/* Call, Whatsapp, Maps */}
                    <div className="flex flex-wrap gap-3">
                      <a
                        href={`https://wa.me/${settings.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-[#10B981] to-[#059669] text-white font-bold py-3 px-5 rounded-2xl text-xs flex items-center gap-2 shadow-md hover:scale-105 transition-all"
                      >
                        <MessageCircle className="w-4 h-4 fill-current" />
                        <span>{t.whatsappUs}</span>
                      </a>
                      
                      <a
                        href={`tel:${settings.phone}`}
                        className="bg-gradient-to-r from-[#0F172A] to-[#1E293B] border border-[#00FFFF]/30 text-white font-bold py-3 px-5 rounded-2xl text-xs flex items-center gap-2 shadow-md hover:scale-105 transition-all"
                      >
                        <Phone className="w-4 h-4 fill-current" />
                        <span>{t.contactUs}</span>
                      </a>

                      <a
                        href={settings.locationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-[#040417] to-[#030214] border border-[#FF007F]/30 text-slate-200 font-bold py-3 px-5 rounded-2xl text-xs flex items-center gap-2 shadow-md hover:scale-105 transition-all"
                      >
                        <MapPin className="w-4 h-4 text-orange-500" />
                        <span>{t.ourLocation}</span>
                      </a>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* VIEW 2: ONLINE STORE / ACCESSORIES SHOP */}
            {activeSection === 'shop' && (
              <div className="space-y-6">
                
                {/* Search & Category Filter Header bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-[#FF007F]/20 border-[#FF007F]/20 pb-5">
                  <div className="relative flex items-center rounded-full overflow-hidden w-full md:max-w-md">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF00FF] via-[#00FFFF] to-[#FF00FF] rounded-full opacity-60 blur-sm" />
                    <div className="relative flex items-center w-full rounded-full bg-[#040417] px-4">
                      <Search className={`w-4 h-4 text-slate-400 ${
                        language === 'ar' ? 'ml-0 order-2' : 'mr-0 order-1'
                      }`} />
                      <input
                        type="text"
                        placeholder={t.searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`flex-1 py-3 text-sm bg-transparent focus:outline-none text-white font-semibold placeholder-slate-400 ${
                          language === 'ar' ? 'pr-3 text-right' : 'pl-3 text-left'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Horizontal Scroll categories tab filters */}
                  <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto py-1">
                    {[
                      { id: 'all', labelAr: 'الكل', labelEn: 'All' },
                      ...(settings.categories?.map(cat => ({ id: cat.id, labelAr: cat.titleAr, labelEn: cat.titleEn })) || [])
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setSelectedCategory(btn.id)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                          selectedCategory === btn.id
                            ? 'bg-gradient-to-r from-[#FF00FF] to-[#FF7A00] text-white font-extrabold shadow-[0_0_20px_rgba(255,0,255,0.4)]'
                            : 'bg-[#040417] border border-[#FF007F]/30 text-slate-300 hover:text-white hover:border-[#00FFFF]/60'
                        }`}
                      >
                        {language === 'ar' ? btn.labelAr : btn.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Products Grid display */}
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-16 italic text-gray-400 dark:text-zinc-500 text-xs sm:text-sm">
                    {language === 'ar' ? 'عذراً، لم نجد أي منتج يطابق بحثك حالياً.' : 'No products found matching your description.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {filteredProducts.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        onOpenDetails={setSelectedProduct}
                      />
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* VIEW 3: DIAGNOSTIC REPAIR BOOKING FORM */}
            {activeSection === 'maintenance' && (
              <MaintenanceForm />
            )}

            {/* VIEW 4: LIVE CHAT DISPATCH */}
            {activeSection === 'chat' && (
              <ChatInterface />
            )}

            {/* VIEW 5: USER PROFILE & CHECKOUT PANELS */}
            {activeSection === 'account' && (
              <ClientAccount onCheckout={() => setActiveSection('checkout')} />
            )}

            {/* VIEW 5.5: CHECKOUT FLOW */}
            {activeSection === 'checkout' && (
              <CheckoutScreen onBack={() => setActiveSection('shop')} />
            )}

            {/* VIEW 6: CENTRAL ADMINISTRATOR SYSTEM */}
            {activeSection === 'admin' && (
              user?.email === 'frhabud58@gmail.com' ? <SuperAdminPanel /> : <AdminPanel />
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* Dynamic Premium Footer */}
      {isClientMode && (
        <footer className="bg-[#030214] text-slate-300 border-t border-[#FF007F]/20 py-12 px-6 sm:px-12 md:px-16 mt-16">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Store Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {settings.storeLogo ? (
                  <img src={settings.storeLogo} alt="Logo" className="w-9 h-9 rounded-xl object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-[#FF00FF] to-[#FF7A00] flex items-center justify-center font-black text-white shadow-[0_0_15px_rgba(255,0,255,0.4)]">
                    {settings.storeNameAr ? settings.storeNameAr.charAt(0) : 'ع'}
                  </div>
                )}
                <span className="font-extrabold text-base text-white tracking-tight">
                  {language === 'ar' ? settings.storeNameAr : settings.storeNameEn}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {language === 'ar'
                  ? 'منصتك الموثوقة لصيانة الهواتف الذكية، تابلت وسماعات AirPods مع قطع غيار أصلية وضمان معتمد بالإضافة إلى أحدث الإكسسوارات الفاخرة.'
                  : 'Your trusted platform for repairing smartphones, tablets, and AirPods with certified components, authentic warranty, and premium accessories!'}
              </p>
              {/* Social Media Circular Links */}
              <div className="flex items-center gap-3.5 pt-2">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#030214]/5 border border-[#FF007F]/30 hover:bg-gradient-to-r from-[#FF00FF]/20 to-[#00FFFF]/20 hover:border-[#00FFFF]/50 text-white flex items-center justify-center transition-all duration-300 hover:scale-105"
                >
                  <Facebook className="w-4.5 h-4.5" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#030214]/5 border border-[#FF007F]/30 hover:bg-gradient-to-r from-[#FF00FF]/20 to-[#00FFFF]/20 hover:border-[#00FFFF]/50 text-white flex items-center justify-center transition-all duration-300 hover:scale-105"
                >
                  <Instagram className="w-4.5 h-4.5" />
                </a>
                <a
                  href={`https://wa.me/${settings.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#030214]/5 border border-[#FF007F]/30 hover:bg-gradient-to-r from-[#FF00FF]/20 to-[#00FFFF]/20 hover:border-[#00FFFF]/50 text-white flex items-center justify-center transition-all duration-300 hover:scale-105"
                >
                  <MessageCircle className="w-4.5 h-4.5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase text-white tracking-wider border-[#FF007F]/20 border-[#FF007F]/20 pb-2">
                {language === 'ar' ? 'روابط سريعة' : 'Quick Navigation'}
              </h4>
              <ul className="space-y-2 text-xs font-semibold">
                {clientNavLinks.map((link) => (
                  <li key={link.id}>
                    <button
                      onClick={() => {
                        setActiveSection(link.id);
                        window.scrollTo({ top:0, behavior:'smooth' });
                      }}
                      className="hover:text-[#00FFFF] transition-colors duration-300 flex items-center gap-2 text-slate-400 hover:translate-x-1 duration-200 cursor-pointer"
                    >
                      <span>{language === 'ar' ? link.labelAr : link.labelEn}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase text-white tracking-wider border-[#FF007F]/20 border-[#FF007F]/20 pb-2">
                {language === 'ar' ? 'معلومات التواصل' : 'Contact Support'}
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-orange-500" />
                  <span>{settings.phone}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 text-orange-500" />
                  <span>{language === 'ar' ? 'الدعم الفني المباشر' : 'Live Chat Response'}</span>
                </li>
                <li className="flex items-center gap-2.5 leading-relaxed">
                  <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span>{language === 'ar' ? settings.locationNameAr : settings.locationNameEn}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="max-w-7xl mx-auto border-t border-[#FF007F]/20 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
            <span>
              © {new Date().getFullYear()} {language === 'ar' ? settings.storeNameAr : settings.storeNameEn}. {language === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
            </span>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-orange-500" />
              {language === 'ar' ? 'حماية بيانات آمنة 100%' : '100% Secured Checkout Guarantee'}
            </span>
          </div>
        </footer>
      )}

      {/* MOBILE FLOATING TAB NAVIGATION BAR (Simulating Native iOS/Android look!) */}
      {isClientMode && (
        <div className="md:hidden sticky bottom-0 z-40 bg-[#030214]/95 border-t border-[#FF007F]/30 backdrop-blur-md px-4 py-2 flex justify-around items-center shadow-[0_-10px_40px_rgba(255,0,127,0.15)] custom-bottom-bg">
          {clientNavLinks.map((link) => {
            const IconComp = link.icon;
            const isSelected = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveSection(link.id)}
                className="flex flex-col items-center justify-center p-1 transition-transform active:scale-95"
              >
                <div className={`p-1.5 rounded-xl transition-all ${
                  isSelected ? 'bg-gradient-to-r from-[#FF007F] to-[#FF7A00] text-white scale-105 shadow-[0_0_20px_rgba(255,0,127,0.4)]' : 'text-slate-400'
                }`}>
                  <IconComp className="w-5 h-5" />
                </div>
                <span className={`text-[9px] mt-0.5 font-bold tracking-tight ${
                  isSelected ? 'text-[#FF007F] font-extrabold' : 'text-slate-400'
                }`}>
                  {language === 'ar' ? link.labelAr : link.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Detail overlay Product Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailsModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onBuyNow={() => setActiveSection('checkout')}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

export default function AlAtbawiApp({ onBack }: { onBack?: () => void }) {
  return (
    <AuthProvider>
      <AppProvider>
        <ParticleAnimation />
        <DeviceSimulator>
          <MainAppContent onBack={onBack || (() => {})} />
        </DeviceSimulator>
      </AppProvider>
    </AuthProvider>
  );
}

