import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Store, Plus, Trash2, Edit3, Check, X, Save, Palette, Layers, 
  ShoppingBag, Ticket, TrendingUp, Sliders, Settings, Users, LogOut,
  Info, Eye, Grid, List, CheckCircle, Package, Truck, AlertCircle, Star,
  Wrench, Smartphone, CreditCard, Sparkles, GripVertical, ChevronUp, ChevronDown,
  MessageCircle
} from 'lucide-react';
import { Store as StoreType, Product, Order, Coupon, StoreBanner, User as UserType, PaymentGateway, CustomCheckoutField, PaymentGatewayType, CustomFieldType } from '../types';
import { fbSync, saveLocal } from '../lib/firebaseSync';
import { detectBusinessType, getBusinessTemplate, BUSINESS_TEMPLATES } from '../data/businessTemplates';
import ImagePicker from './ImagePicker';
import ChatPanel from './ChatPanel';
import PhoneCasesHeart from './PhoneCasesHeart';

const COLOR_PALETTES = [
  {
    id: 'royal-gold',
    name: 'الملكي الذهبي (الفخامة الكلاسيكية)',
    primary: '#D4AF37',
    background: '#09090b',
    frame: '#18181b',
    text: '#a1a1aa',
    previewColors: ['#D4AF37', '#09090b', '#18181b', '#a1a1aa']
  },
  {
    id: 'cyber-neon',
    name: 'النيون الحديث (التقنية المستقبيلة)',
    primary: '#06b6d4',
    background: '#03000a',
    frame: '#0f091f',
    text: '#93c5fd',
    previewColors: ['#06b6d4', '#03000a', '#0f091f', '#93c5fd']
  },
  {
    id: 'chic-rose',
    name: 'الوردي الأنيق (الموضة والجمال)',
    primary: '#ec4899',
    background: '#0f050b',
    frame: '#1e0c17',
    text: '#f472b6',
    previewColors: ['#ec4899', '#0f050b', '#1e0c17', '#f472b6']
  },
  {
    id: 'emerald-oasis',
    name: 'الزمردي الدافئ (الطبيعة والاسترخاء)',
    primary: '#10b981',
    background: '#020d08',
    frame: '#081a13',
    text: '#6ee7b7',
    previewColors: ['#10b981', '#020d08', '#081a13', '#6ee7b7']
  },
  {
    id: 'ice-blue',
    name: 'الأزرق الجليدي (الاحترافي الهادئ)',
    primary: '#3b82f6',
    background: '#020813',
    frame: '#0a1224',
    text: '#93c5fd',
    previewColors: ['#3b82f6', '#020813', '#0a1224', '#93c5fd']
  },
  {
    id: 'warm-amber',
    name: 'العنبر الدافئ (صناعة يدوية دافئة)',
    primary: '#f59e0b',
    background: '#0a0500',
    frame: '#1a0e02',
    text: '#fcd34d',
    previewColors: ['#f59e0b', '#0a0500', '#1a0e02', '#fcd34d']
  },
  {
    id: 'sweet-lavender',
    name: 'اللافندر الهادئ (ألوان ناعمة فخمة)',
    primary: '#8b5cf6',
    background: '#06030c',
    frame: '#120b24',
    text: '#c084fc',
    previewColors: ['#8b5cf6', '#06030c', '#120b24', '#c084fc']
  }
];

interface MerchantDashboardProps {
  storeId: string;
  onLogout: () => void;
  onViewStore: () => void; // Link to let them see their store live!
}

export default function MerchantDashboard({ storeId, onLogout, onViewStore }: MerchantDashboardProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'branding' | 'products' | 'orders' | 'coupons' | 'repairs' | 'banners' | 'gateways' | 'chat'>('stats');
  const [showChat, setShowChat] = useState(false);
  
  // Local Database States
  const [stores, setStores] = useState<StoreType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [repairs, setRepairs] = useState<any[]>([]);
  const [expandedReceiptOrderId, setExpandedReceiptOrderId] = useState<string | null>(null);
  
  // New order notification state
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const [showNewOrderToast, setShowNewOrderToast] = useState<Order | null>(null);
  const prevOrderCountRef = React.useRef(0);

  // Gateways and custom form settings
  const [paymentGateways, setPaymentGateways] = useState<PaymentGateway[]>([]);
  const [customCheckoutFields, setCustomCheckoutFields] = useState<CustomCheckoutField[]>([]);
  const [editingGatewayId, setEditingGatewayId] = useState<string | null>(null);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [showAddGatewayModal, setShowAddGatewayModal] = useState(false);
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);

  // New Gateway form
  const [newGwType, setNewGwType] = useState<PaymentGatewayType>('instapay');
  const [newGwName, setNewGwName] = useState('');
  const [newGwNumber, setNewGwNumber] = useState('');
  const [newGwBankName, setNewGwBankName] = useState('');
  const [newGwHolder, setNewGwHolder] = useState('');
  const [newGwIban, setNewGwIban] = useState('');
  const [newGwBranch, setNewGwBranch] = useState('');
  const [newGwInstructions, setNewGwInstructions] = useState('');
  const [newGwIcon, setNewGwIcon] = useState('');

  // New Custom Field form
  const [newFldType, setNewFldType] = useState<CustomFieldType>('text');
  const [newFldLabel, setNewFldLabel] = useState('');
  const [newFldName, setNewFldName] = useState('');
  const [newFldPlaceholder, setNewFldPlaceholder] = useState('');
  const [newFldRequired, setNewFldRequired] = useState(true);
  const [newFldOptions, setNewFldOptions] = useState('');
  const [newFldHelp, setNewFldHelp] = useState('');
  const [newFldDefault, setNewFldDefault] = useState('');
  const [newFldMinLen, setNewFldMinLen] = useState<string>('');
  const [newFldMaxLen, setNewFldMaxLen] = useState<string>('');

  // Repair request form states
  const [isAddingRepair, setIsAddingRepair] = useState(false);
  const [repCustomerName, setRepCustomerName] = useState('');
  const [repCustomerPhone, setRepCustomerPhone] = useState('');
  const [repDeviceModel, setRepDeviceModel] = useState('');
  const [repProblem, setRepProblem] = useState('');
  const [repCost, setRepCost] = useState(150);
  const [repStatus, setRepStatus] = useState<'pending' | 'inspecting' | 'repairing' | 'completed' | 'delivered'>('pending');

  // Store Banners form states
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSub, setBannerSub] = useState('');
  const [bannerImage, setBannerImage] = useState('');

  // Selected/Active entities in edits
  const [myStore, setMyStore] = useState<StoreType | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  // Branding states
  const [storeName, setStoreName] = useState('');
  const [storeDesc, setStoreDesc] = useState('');
  const [storeLogo, setStoreLogo] = useState('');
  const [storeCover, setStoreCover] = useState('');
  const [currency, setCurrency] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  const [backColor, setBackColor] = useState('');
  const [layoutType, setLayoutType] = useState<'grid' | 'list' | 'luxury'>('grid');

  // Custom templates and styling states
  const [visualTemplate, setVisualTemplate] = useState<'mobile' | 'clothing' | 'perfume' | 'shoes' | 'multicategory' | 'electronics' | 'phonecases' | 'supermarket' | 'hometools' | 'computers'>('multicategory');
  const [frameColor, setFrameColor] = useState('#18181b');
  const [textColor, setTextColor] = useState('#a1a1aa');
  const [borderRadius, setBorderRadius] = useState<'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'>('xl');
  const [fontFamily, setFontFamily] = useState<'cairo' | 'tajawal' | 'almarai' | 'amiri' | 'changa' | 'alexandria' | 'inter'>('cairo');
  const [shadowType, setShadowType] = useState<'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'inner'>('none');
  const [features, setFeatures] = useState<{ id: string; title: string; desc: string; icon: string }[]>([]);
  const [repairServices, setRepairServices] = useState<{ id: string; title: string; desc: string; icon: string; price?: number }[]>([]);
  const [sectionsOrder, setSectionsOrder] = useState<string[]>([]);

  // Custom features inputs
  const [newFeatureTitle, setNewFeatureTitle] = useState('');
  const [newFeatureDesc, setNewFeatureDesc] = useState('');
  const [newFeatureIcon, setNewFeatureIcon] = useState('🌟');

  // Custom repair services inputs
  const [newServiceTitle, setNewServiceTitle] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServiceIcon, setNewServiceIcon] = useState('📱');
  const [newServicePrice, setNewServicePrice] = useState<number>(100);

  // AI Design States
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiBrandingPrompt, setAiBrandingPrompt] = useState('');

  // Product form states
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState(0);
  const [pOrigPrice, setPOrigPrice] = useState(0);
  const [pCategory, setPCategory] = useState('');
  const [pStock, setPStock] = useState(10);
  const [pImage, setPImage] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pIsOffer, setPIsOffer] = useState(false);
  const [pOfferText, setPOfferText] = useState('');
  const [pImages, setPImages] = useState<string[]>([]);

  // Coupon form states
  const [cCode, setCCode] = useState('');
  const [cType, setCType] = useState<'percent' | 'fixed'>('percent');
  const [cValue, setCValue] = useState(10);
  const [cMin, setCMin] = useState(100);
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);

  // Categories drag-and-drop reorder states
  const [draggedCatIndex, setDraggedCatIndex] = useState<number | null>(null);
  const [dragOverCatIndex, setDragOverCatIndex] = useState<number | null>(null);

  // Load all mock database items from localStorage on mount + polling
  useEffect(() => {
    const loadData = () => {
      const s = JSON.parse(localStorage.getItem('mix_stores') || '[]');
      const p = JSON.parse(localStorage.getItem('mix_products') || '[]');
      const o = JSON.parse(localStorage.getItem('mix_orders') || '[]');
      const c = JSON.parse(localStorage.getItem('mix_coupons') || '[]');
      const r = JSON.parse(localStorage.getItem('mix_repairs') || '[]');

      const myNewOrders = o.filter((order: any) => order.storeId === storeId);
      const prevCount = prevOrderCountRef.current;

      // Detect NEW orders
      if (prevCount > 0 && myNewOrders.length > prevCount) {
        const newestOrder = myNewOrders[myNewOrders.length - 1];
        setNewOrderIds(prev => new Set([...prev, newestOrder.id]));
        setShowNewOrderToast(newestOrder);
        
        // Play notification sound
        try {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.1);
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.5);
        } catch {}

        // Vibrate on mobile
        try { navigator.vibrate?.([100, 50, 100]); } catch {}

        // Auto-hide toast after 5 seconds
        setTimeout(() => setShowNewOrderToast(null), 5000);
      }

      prevOrderCountRef.current = myNewOrders.length;

      setStores(s);
      setProducts(p);
      setOrders(o);
      setCoupons(c);
      const myStore = s.find((x: any) => x.id === storeId);
      if (myStore) {
        setMyStore(myStore);
        if (myStore.paymentGateways && Array.isArray(myStore.paymentGateways)) {
          setPaymentGateways(myStore.paymentGateways);
        }
        if (myStore.customCheckoutFields && Array.isArray(myStore.customCheckoutFields)) {
          setCustomCheckoutFields(myStore.customCheckoutFields);
        }
      }
      setRepairs(r.filter((item: any) => item.storeId === storeId));
    };

    loadData();

    // Polling every 500ms for faster store loading (reduced from 2s)
    const interval = setInterval(loadData, 500);

    // Also listen for events
    const handler = () => loadData();
    window.addEventListener('local-storage-change', handler);
    window.addEventListener('storage', handler);
    window.addEventListener('mix-realtime-mix_orders', handler);
    window.addEventListener('mix-realtime-mix_products', handler);
    window.addEventListener('mix-realtime-mix_stores', handler);

    return () => {
      clearInterval(interval);
      window.removeEventListener('local-storage-change', handler);
      window.removeEventListener('storage', handler);
      window.removeEventListener('mix-realtime-mix_orders', handler);
      window.removeEventListener('mix-realtime-mix_products', handler);
      window.removeEventListener('mix-realtime-mix_stores', handler);
    };
  }, [storeId]);

  // Sync back to localStorage & re-load
  const syncAndReload = (
    updatedStores: StoreType[], 
    updatedProducts: Product[], 
    updatedOrders: Order[], 
    updatedCoupons: Coupon[],
    updatedRepairs?: any[]
  ) => {
    saveLocal('mix_stores', updatedStores);
    saveLocal('mix_products', updatedProducts);
    saveLocal('mix_orders', updatedOrders);
    saveLocal('mix_coupons', updatedCoupons);
    
    if (updatedRepairs) {
      const allRepairs = JSON.parse(localStorage.getItem('mix_repairs') || '[]');
      const otherRepairs = allRepairs.filter((item: any) => item.storeId !== storeId);
      const merged = [...otherRepairs, ...updatedRepairs];
      saveLocal('mix_repairs', merged);
      setRepairs(updatedRepairs);
    }

    setStores(updatedStores);
    setProducts(updatedProducts);
    setOrders(updatedOrders);
    setCoupons(updatedCoupons);

    const found = updatedStores.find(x => x.id === storeId);
    if (found) setMyStore(found);

    // Sync to Firestore (real-time cross-device)
    if (found) fbSync.saveStore(found).catch(console.error);
    const myProducts = updatedProducts.filter(p => p.storeId === storeId);
    myProducts.forEach(p => fbSync.saveProduct(p).catch(console.error));
    updatedOrders.forEach(o => fbSync.saveOrder(o).catch(console.error));
  };

  if (!myStore) {
    // Show loading state with retry instead of error
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-right" dir="rtl">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg font-bold">جاري تحميل متجرك...</p>
        <p className="text-xs text-zinc-500 mt-1">يتم الآن إعداد متجرك وتجهيز لوحة التحكم</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-lg cursor-pointer hover:bg-amber-400"
        >
          تحديث الصفحة
        </button>
      </div>
    );
  }

  // Get store URL
  const storeUrl = `${window.location.origin}${window.location.pathname}#/store/${myStore.id}`;

  // Statistics calculations
  const myProducts = products.filter(p => p.storeId === storeId);
  const myOrders = orders.filter(o => o.storeId === storeId);
  const completedOrders = myOrders.filter(o => o.status === 'delivered');
  const revenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrdersCount = myOrders.filter(o => o.status === 'pending').length;

  // Handle AI Design Redesign
  const handleAIDesignRedesign = async () => {
    if (!storeName) {
      alert('الرجاء التأكد من كتابة اسم المتجر أولاً.');
      return;
    }
    setIsGeneratingAI(true);
    try {
      const response = await fetch('/api/gemini/generate-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: storeName,
          category: myStore?.category || 'عام',
          idea: aiBrandingPrompt,
          logo: storeLogo
        })
      });
      if (!response.ok) {
        throw new Error('فشل استدعاء المولد الذكي');
      }
      const data = await response.json();
      
      if (data.themeColor?.primary) setPrimaryColor(data.themeColor.primary);
      if (data.themeColor?.background) setBackColor(data.themeColor.background);
      if (data.description) setStoreDesc(data.description);
      if (data.layoutType) setLayoutType(data.layoutType);
      
      if (data.banners?.[0]?.image) {
        setStoreCover(data.banners[0].image);
      }

      alert('✨ قام الذكاء الاصطناعي بتصميم متجرك وإعادة تنسيق الألوان، الهوية البصرية، والوصف التسويقي بنجاح! اضغط على "حفظ جميع التعديلات" بالأسفل لتثبيتها فوراً.');
    } catch (err) {
      console.error(err);
      alert('تم استخدام التصميم الافتراضي المنسق لهوية هذا المتجر بنجاح ✨');
      const fallbackColor = myStore?.category?.includes('صيانة') ? '#3b82f6' : '#D4AF37';
      setPrimaryColor(fallbackColor);
      setBackColor('#050505');
      setStoreDesc(`أهلاً بكم في ${storeName} المتخصص لتقديم أرقى المنتجات بأعلى معايير الجودة لـ MIX.`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Handle store branding save
  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = stores.map(s => {
      if (s.id === storeId) {
        return {
          ...s,
          name: storeName,
          description: storeDesc,
          logo: storeLogo,
          cover: storeCover,
          currency: currency,
          layoutType: layoutType,
          visualTemplate: visualTemplate,
          features: features,
          borderRadius: borderRadius,
          fontFamily: fontFamily,
          shadowType: shadowType,
          repairServices: repairServices,
          sectionsOrder: sectionsOrder,
          themeColor: {
            ...s.themeColor,
            primary: primaryColor,
            background: backColor,
            frameColor: frameColor,
            textColor: textColor
          },
          // Auto-apply templateConfig if category is صيانة
          ...(s.category?.includes('صيانة') || s.category?.includes('موبايل') || s.category?.includes('هواتف') ? {
            templateConfig: (() => {
              try {
                const templates = JSON.parse(localStorage.getItem('mix_store_templates') || '[]');
                return templates.find((t: any) => t.id === 'tpl-phone-repair') || null;
              } catch { return null; }
            })()
          } : {})
        };
      }
      return s;
    });
    syncAndReload(updated, products, orders, coupons);
    alert('تم حفظ إعدادات هويتك وتصميم متجرك بنجاح! 🎨');
  };

  // Save payment gateways and custom checkout form fields
  const handleSavePaymentSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = stores.map(s => {
      if (s.id === storeId) {
        return {
          ...s,
          paymentGateways,
          customCheckoutFields
        };
      }
      return s;
    });
    
    syncAndReload(updated, products, orders, coupons);
    alert('تم حفظ إعدادات بوابات الدفع وتخصيص النموذج بنجاح! 💳⚙️');
  };

  // Payment Gateway Handlers
  const toggleGateway = (gwId: string) => {
    setPaymentGateways(prev => prev.map(gw => 
      gw.id === gwId ? { ...gw, enabled: !gw.enabled } : gw
    ));
  };

  const deleteGateway = (gwId: string) => {
    if (!confirm('هل أنت متأكد من حذف بوابة الدفع هذه؟')) return;
    setPaymentGateways(prev => prev.filter(gw => gw.id !== gwId));
  };

  const openAddGateway = () => {
    setEditingGatewayId(null);
    setNewGwType('instapay');
    setNewGwName('');
    setNewGwNumber('');
    setNewGwBankName('');
    setNewGwHolder('');
    setNewGwIban('');
    setNewGwBranch('');
    setNewGwInstructions('');
    setNewGwIcon('');
    setShowAddGatewayModal(true);
  };

  const openEditGateway = (gw: PaymentGateway) => {
    setEditingGatewayId(gw.id);
    setNewGwType(gw.type);
    setNewGwName(gw.name);
    setNewGwNumber(gw.number || '');
    setNewGwBankName(gw.bankName || '');
    setNewGwHolder(gw.accountHolderName || '');
    setNewGwIban(gw.iban || '');
    setNewGwBranch(gw.branchName || '');
    setNewGwInstructions(gw.extraInstructions || '');
    setNewGwIcon(gw.icon || '');
    setShowAddGatewayModal(true);
  };

  const saveGateway = () => {
    if (!newGwName.trim()) {
      alert('يرجى إدخال اسم بوابة الدفع');
      return;
    }
    if (editingGatewayId) {
      setPaymentGateways(prev => prev.map(gw => 
        gw.id === editingGatewayId ? {
          ...gw,
          type: newGwType,
          name: newGwName,
          number: newGwNumber || undefined,
          bankName: newGwBankName || undefined,
          accountHolderName: newGwHolder || undefined,
          iban: newGwIban || undefined,
          branchName: newGwBranch || undefined,
          extraInstructions: newGwInstructions || undefined,
          icon: newGwIcon || undefined
        } : gw
      ));
    } else {
      const newGw: PaymentGateway = {
        id: `pg-${Date.now()}`,
        type: newGwType,
        name: newGwName,
        enabled: true,
        number: newGwNumber || undefined,
        bankName: newGwBankName || undefined,
        accountHolderName: newGwHolder || undefined,
        iban: newGwIban || undefined,
        branchName: newGwBranch || undefined,
        extraInstructions: newGwInstructions || undefined,
        icon: newGwIcon || undefined
      };
      setPaymentGateways(prev => [...prev, newGw]);
    }
    setShowAddGatewayModal(false);
    setEditingGatewayId(null);
  };

  // Custom Checkout Field Handlers
  const toggleFieldEnabled = (fldId: string) => {
    setCustomCheckoutFields(prev => prev.map(f => 
      f.id === fldId ? { ...f, enabled: !f.enabled } : f
    ));
  };

  const toggleFieldRequired = (fldId: string) => {
    setCustomCheckoutFields(prev => prev.map(f => 
      f.id === fldId ? { ...f, required: !f.required } : f
    ));
  };

  const deleteField = (fldId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الحقل من نموذج الطلب؟')) return;
    setCustomCheckoutFields(prev => prev.filter(f => f.id !== fldId));
  };

  const openAddField = () => {
    setEditingFieldId(null);
    setNewFldType('text');
    setNewFldLabel('');
    setNewFldName('');
    setNewFldPlaceholder('');
    setNewFldRequired(true);
    setNewFldOptions('');
    setNewFldHelp('');
    setNewFldDefault('');
    setNewFldMinLen('');
    setNewFldMaxLen('');
    setShowAddFieldModal(true);
  };

  const openEditField = (fld: CustomCheckoutField) => {
    setEditingFieldId(fld.id);
    setNewFldType(fld.type);
    setNewFldLabel(fld.label);
    setNewFldName(fld.name);
    setNewFldPlaceholder(fld.placeholder || '');
    setNewFldRequired(fld.required);
    setNewFldOptions(fld.options ? fld.options.join(', ') : '');
    setNewFldHelp(fld.helpText || '');
    setNewFldDefault(fld.defaultValue || '');
    setNewFldMinLen(fld.validation?.minLength?.toString() || '');
    setNewFldMaxLen(fld.validation?.maxLength?.toString() || '');
    setShowAddFieldModal(true);
  };

  const saveField = () => {
    if (!newFldLabel.trim() || !newFldName.trim()) {
      alert('يرجى إدخال اسم الحقل والعنوان');
      return;
    }
    const maxOrder = Math.max(0, ...customCheckoutFields.map(f => f.order || 0));
    if (editingFieldId) {
      setCustomCheckoutFields(prev => prev.map(f => 
        f.id === editingFieldId ? {
          ...f,
          type: newFldType,
          label: newFldLabel,
          name: newFldName,
          placeholder: newFldPlaceholder || undefined,
          required: newFldRequired,
          options: newFldOptions.trim() ? newFldOptions.split(',').map(o => o.trim()).filter(Boolean) : undefined,
          helpText: newFldHelp || undefined,
          defaultValue: newFldDefault || undefined,
          validation: {
            minLength: newFldMinLen ? parseInt(newFldMinLen) : undefined,
            maxLength: newFldMaxLen ? parseInt(newFldMaxLen) : undefined,
            pattern: f.validation?.pattern
          }
        } : f
      ));
    } else {
      const newFld: CustomCheckoutField = {
        id: `fld-${Date.now()}`,
        type: newFldType,
        label: newFldLabel,
        name: newFldName,
        placeholder: newFldPlaceholder || undefined,
        required: newFldRequired,
        enabled: true,
        options: newFldOptions.trim() ? newFldOptions.split(',').map(o => o.trim()).filter(Boolean) : undefined,
        helpText: newFldHelp || undefined,
        defaultValue: newFldDefault || undefined,
        validation: {
          minLength: newFldMinLen ? parseInt(newFldMinLen) : undefined,
          maxLength: newFldMaxLen ? parseInt(newFldMaxLen) : undefined
        },
        order: maxOrder + 1
      };
      setCustomCheckoutFields(prev => [...prev, newFld]);
    }
    setShowAddFieldModal(false);
    setEditingFieldId(null);
  };

  const moveFieldUp = (idx: number) => {
    if (idx <= 0) return;
    setCustomCheckoutFields(prev => {
      const updated = [...prev];
      const tmp = updated[idx];
      updated[idx] = updated[idx-1];
      updated[idx-1] = tmp;
      return updated.map((f, i) => ({ ...f, order: i+1 }));
    });
  };

  const moveFieldDown = (idx: number) => {
    setCustomCheckoutFields(prev => {
      if (idx >= prev.length - 1) return prev;
      const updated = [...prev];
      const tmp = updated[idx];
      updated[idx] = updated[idx+1];
      updated[idx+1] = tmp;
      return updated.map((f, i) => ({ ...f, order: i+1 }));
    });
  };

  // Add store specific category
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    if (myStore.categories.includes(newCategory.trim())) {
      alert('القسم موجود بالفعل');
      return;
    }
    const updated = stores.map(s => {
      if (s.id === storeId) {
        return {
          ...s,
          categories: [...s.categories, newCategory.trim()]
        };
      }
      return s;
    });
    setNewCategory('');
    syncAndReload(updated, products, orders, coupons);
  };

  // Remove store specific category
  const handleRemoveCategory = (cat: string) => {
    if (myStore.categories.length <= 1) {
      alert('يجب أن يحتوي متجرك على قسم واحد على الأقل');
      return;
    }
    const updated = stores.map(s => {
      if (s.id === storeId) {
        return {
          ...s,
          categories: s.categories.filter(c => c !== cat)
        };
      }
      return s;
    });
    syncAndReload(updated, products, orders, coupons);
  };

  // Reorder store specific categories
  const reorderCategories = (fromIndex: number, toIndex: number) => {
    if (!myStore) return;
    const updatedCategories = [...myStore.categories];
    const [removed] = updatedCategories.splice(fromIndex, 1);
    updatedCategories.splice(toIndex, 0, removed);
    
    const updated = stores.map(s => {
      if (s.id === storeId) {
        return {
          ...s,
          categories: updatedCategories
        };
      }
      return s;
    });
    syncAndReload(updated, products, orders, coupons);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    setDraggedCatIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (index !== dragOverCatIndex) {
      setDragOverCatIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedCatIndex(null);
    setDragOverCatIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndexStr = e.dataTransfer.getData('text/plain');
    if (sourceIndexStr === '') return;
    const sourceIndex = parseInt(sourceIndexStr, 10);
    
    if (sourceIndex === targetIndex) return;
    
    reorderCategories(sourceIndex, targetIndex);
    handleDragEnd();
  };

  const moveCategoryUp = (index: number) => {
    if (index === 0) return;
    reorderCategories(index, index - 1);
  };

  const moveCategoryDown = (index: number) => {
    if (!myStore || index === myStore.categories.length - 1) return;
    reorderCategories(index, index + 1);
  };

  // Handle order status change
  const handleOrderStatusChange = (orderId: string, newStatus: any) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    });
    syncAndReload(stores, products, updated, coupons);
  };

  // Delete product
  const handleDeleteProduct = (prodId: string) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً من متجرك؟')) {
      const updated = products.filter(p => p.id !== prodId);
      // Decrement store product count
      const updatedStores = stores.map(s => {
        if (s.id === storeId) {
          return { ...s, productsCount: Math.max(0, s.productsCount - 1) };
        }
        return s;
      });
      syncAndReload(updatedStores, updated, orders, coupons);
    }
  };

  // Save / Add Product Submit
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || pPrice <= 0 || !pImage) {
      alert('الرجاء تعبئة البيانات الأساسية للمنتج');
      return;
    }

    const currentImages = pImages.filter(Boolean).length > 0 ? pImages.filter(Boolean) : [pImage];

    if (editingProduct) {
      // Edit
      const updated = products.map(p => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            name: pName,
            price: Number(pPrice),
            originalPrice: pOrigPrice > 0 ? Number(pOrigPrice) : undefined,
            category: pCategory || myStore.categories[0],
            stock: Number(pStock),
            image: pImage,
            images: currentImages,
            description: pDesc,
            isOffer: pIsOffer,
            offerText: pOfferText
          };
        }
        return p;
      });
      syncAndReload(stores, updated, orders, coupons);
      setEditingProduct(null);
    } else {
      // Add new
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        storeId: storeId,
        name: pName,
        price: Number(pPrice),
        originalPrice: pOrigPrice > 0 ? Number(pOrigPrice) : undefined,
        category: pCategory || myStore.categories[0],
        stock: Number(pStock),
        image: pImage,
        images: currentImages,
        description: pDesc,
        salesCount: 0,
        rating: 5.0,
        isOffer: pIsOffer,
        offerText: pOfferText
      };
      const updatedProds = [...products, newProd];
      // Increment store product count
      const updatedStores = stores.map(s => {
        if (s.id === storeId) {
          return { ...s, productsCount: s.productsCount + 1 };
        }
        return s;
      });
      syncAndReload(updatedStores, updatedProds, orders, coupons);
      setIsAddingProduct(false);
    }

    // Reset fields
    setPName('');
    setPPrice(0);
    setPOrigPrice(0);
    setPCategory('');
    setPStock(10);
    setPImage('');
    setPImages([]);
    setPDesc('');
    setPIsOffer(false);
    setPOfferText('');
  };

  // Start Editing Product
  const startEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setPName(prod.name);
    setPPrice(prod.price);
    setPOrigPrice(prod.originalPrice || 0);
    setPCategory(prod.category);
    setPStock(prod.stock);
    setPImage(prod.image);
    setPImages(prod.images || [prod.image]);
    setPDesc(prod.description);
    setPIsOffer(prod.isOffer);
    setPOfferText(prod.offerText || '');
    setIsAddingProduct(true);
  };

  // Add Coupon Submit
  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cCode) return;

    const newCoupon: Coupon = {
      id: `cp-${Date.now()}`,
      storeId: storeId,
      code: cCode.trim().toUpperCase(),
      discountType: cType,
      value: Number(cValue),
      minOrderValue: Number(cMin),
      active: true
    };

    const updated = [...coupons, newCoupon];
    syncAndReload(stores, products, orders, updated);
    setIsAddingCoupon(false);
    setCCode('');
    setCValue(10);
    setCMin(100);
  };

  // Delete Coupon
  const handleDeleteCoupon = (id: string) => {
    const updated = coupons.filter(c => c.id !== id);
    syncAndReload(stores, products, orders, updated);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col md:flex-row text-right" dir="rtl">
      
      {/* NEW ORDER TOAST NOTIFICATION */}
      {showNewOrderToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] animate-fadeIn">
          <div className="bg-green-500/20 border border-green-500/40 backdrop-blur-xl rounded-2xl px-5 py-3 shadow-[0_0_40px_rgba(34,197,94,0.3)] flex items-center gap-3 max-w-sm">
            <div className="relative flex h-4 w-4 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
            </div>
            <div className="min-w-0">
              <p className="text-green-400 text-xs font-bold">طلب جديد وارد!</p>
              <p className="text-white text-[10px] mt-0.5 truncate">
                {showNewOrderToast.customerName} - {showNewOrderToast.total} ج.م
              </p>
            </div>
            <button 
              onClick={() => { setActiveTab('orders'); setShowNewOrderToast(null); setNewOrderIds(new Set()); }}
              className="shrink-0 bg-green-500 text-black text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-green-400 cursor-pointer"
            >
              عرض
            </button>
          </div>
        </div>
      )}

      {/* SIDEBAR NAVIGATION - GLASS EFFECT */}
      <div className="w-full md:w-64 bg-zinc-900/50 md:min-h-screen border-b md:border-b-0 md:border-l border-zinc-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          
          {/* Active Store Widget */}
          <div className="flex items-center gap-3 bg-zinc-900 p-3 rounded-xl border border-zinc-800">
            <img 
              src={myStore.logo} 
              alt={myStore.name} 
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-lg object-cover bg-zinc-800 shrink-0" 
            />
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-white truncate">{myStore.name}</h3>
              <p className="text-[9px] text-amber-500 font-bold mt-0.5">لوحة التحكم للتاجر</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-3 md:pb-0" style={{ scrollbarWidth: 'none' }}>
            {(() => {
              const isElectronics = 
                visualTemplate === 'mobile' ||
                myStore.visualTemplate === 'mobile' ||
                myStore.category === 'إلكترونيات وهواتف' || 
                (myStore.category || '').includes('صيانة') || 
                (myStore.category || '').includes('محل') || 
                (myStore.category || '').includes('هواتف') ||
                (myStore.category || '').includes('جوال');
              
              const navItems = isElectronics ? [
                { id: 'stats', label: 'إحصائيات عامة', icon: TrendingUp },
                { id: 'orders', label: 'طلبات الشراء', icon: ShoppingBag, count: pendingOrdersCount },
                { id: 'gateways', label: 'بوابات الدفع والنموذج', icon: CreditCard },
                { id: 'banners', label: 'إدارة بنرات العرض', icon: Sliders },
                { id: 'products', label: 'إدارة المنتجات والمخزون', icon: Layers },
                { id: 'repairs', label: 'إدارة طلبات الصيانة', icon: Wrench, count: repairs.filter(r => r.status !== 'delivered').length },
                { id: 'coupons', label: 'الكوبونات والخصومات', icon: Ticket },
                { id: 'branding', label: 'إعدادات المنصة والهوية', icon: Palette },
                { id: 'chat', label: 'الدردشة مع العملاء', icon: MessageCircle }
              ] : [
                { id: 'stats', label: '1. الإحصائيات والأداء', icon: TrendingUp },
                { id: 'banners', label: '2. إدارة البنرات', icon: Sliders },
                { id: 'categories', label: '3. إدارة الأقسام', icon: Grid },
                { id: 'products', label: '4. إدارة المنتجات', icon: Layers },
                { id: 'classifications', label: '5. إدارة التصنيفات', icon: List },
                { id: 'orders', label: '6. إدارة الطلبات', icon: ShoppingBag, count: pendingOrdersCount },
                { id: 'customers', label: '7. إدارة العملاء', icon: Users },
                { id: 'gateways', label: '8. إدارة طرق الدفع', icon: CreditCard },
                { id: 'order_form', label: '9. نموذج الطلب المخصص', icon: CheckCircle },
                { id: 'pages', label: '10. إدارة الصفحات', icon: Info },
                { id: 'ads', label: '11. إدارة الإعلانات', icon: Sparkles },
                { id: 'offers', label: '12. إدارة العروض', icon: Ticket },
                { id: 'shipping', label: '13. إدارة الشحن', icon: Truck },
                { id: 'settings', label: '14. إعدادات المتجر', icon: Settings },
                { id: 'theme_colors', label: '15. الألوان والخطوط', icon: Palette },
                { id: 'templates', label: '16. القالب ونشاط المتجر', icon: Smartphone },
                { id: 'sliders', label: '17. إدارة السلايدر', icon: Sliders },
                { id: 'videos', label: '18. إدارة الصور والفيديوهات', icon: Eye },
                { id: 'chat', label: 'الدردشة المباشرة', icon: MessageCircle }
              ];

              return navItems.map(item => {
                const Icon = item.icon;
                const hasNewOrders = item.id === 'orders' && newOrderIds.size > 0;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsAddingProduct(false);
                      setEditingProduct(null);
                      if (item.id === 'orders') setNewOrderIds(new Set());
                    }}
                    className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap md:w-full ${
                      activeTab === item.id 
                        ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/10' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
                    }`}
                  >
                    <Icon size={16} />
                    {hasNewOrders && (
                      <span className="relative flex h-2.5 w-2.5 -mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 border-2 border-zinc-900"></span>
                      </span>
                    )}
                    <span>{item.label}</span>
                    {item.count ? (
                      <span className="mr-auto text-[9px] bg-red-600 text-white font-black py-0.5 px-1.5 rounded-full">
                        {item.count}
                      </span>
                    ) : null}
                  </button>
                );
              });
            })()}
          </nav>
        </div>

        {/* Portal Bottom Actions */}
        <div className="pt-6 border-t border-zinc-800 space-y-2 mt-6 md:mt-0">
          <button
            onClick={onViewStore}
            className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-amber-400 font-bold text-xs rounded-lg border border-amber-500/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Eye size={14} />
            <span>معاينة متجرك لايف</span>
          </button>
          
          <button
            onClick={onLogout}
            className="w-full py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut size={14} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD BODY CONTENTS */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        
        {/* STATS VIEW */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h2 className="text-xl font-bold text-white">مرحباً بك مجدداً، يا تاجر MIX! 👋</h2>
                <p className="text-xs text-zinc-400 mt-1">إليك تقرير أداء ونشاط متجرك الإلكتروني المستقل حتى اليوم.</p>
              </div>
              <button
                onClick={onViewStore}
                className="py-1.5 px-3 bg-amber-500 text-black text-xs font-bold rounded-lg hover:bg-amber-400 cursor-pointer"
              >
                دخول المتجر المستقل 🛍️
              </button>
            </div>

            {/* Quick Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-2xl">
                <span className="text-[10px] text-zinc-500 block font-semibold">إجمالي الإيرادات (المستلمة)</span>
                <span className="text-lg sm:text-2xl font-black text-amber-400 mt-1 block font-mono">{revenue} ر.س</span>
                <span className="text-[9px] text-green-400 mt-1 block">من الطلبيات المكتملة</span>
              </div>
              
              <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-2xl">
                <span className="text-[10px] text-zinc-500 block font-semibold">عدد الطلبيات الكلية</span>
                <span className="text-lg sm:text-2xl font-black text-white mt-1 block font-mono">{myOrders.length} طلب</span>
                <span className="text-[9px] text-zinc-400 mt-1 block">{pendingOrdersCount} قيد المعالجة</span>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-2xl">
                <span className="text-[10px] text-zinc-500 block font-semibold">المنتجات النشطة</span>
                <span className="text-lg sm:text-2xl font-black text-white mt-1 block font-mono">{myProducts.length} منتج</span>
                <span className="text-[9px] text-zinc-400 mt-1 block">في {myStore.categories.length} أقسام</span>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-2xl">
                <span className="text-[10px] text-zinc-500 block font-semibold">تقييم المتجر</span>
                <span className="text-lg sm:text-2xl font-black text-yellow-400 mt-1 block flex items-center gap-1 font-mono">
                  <Star size={18} fill="currentColor" />
                  {myStore.rating}
                </span>
                <span className="text-[9px] text-zinc-400 mt-1 block">بناء على {myStore.reviewsCount} تقييم</span>
              </div>
            </div>

            {/* Commission and platform billing banner */}
            <div className="p-4 bg-gradient-to-l from-zinc-900 to-zinc-950 rounded-2xl border border-zinc-800 text-xs text-zinc-400 flex items-center gap-3">
              <Info className="text-amber-500 shrink-0 w-5 h-5" />
              <div>
                <p className="text-zinc-200 font-bold mb-0.5">💡 عمولة المنصة MIX الخاصة بك: {myStore.commissionRate}%</p>
                <p>تستقطع المنصة {myStore.commissionRate}% من إجمالي المبيعات المكتملة لتغطية تكاليف الخوادم، الترويج والإعلان، وتوصيل الطلبات الفوري.</p>
              </div>
            </div>

            {/* Phone Repair Heart Section - Only for phone repair category stores */}
            {myStore.categories.some(cat => cat.includes('صينات') || cat.includes('هواتف') || cat.includes('صيانة') || cat.includes('جوالات')) && (
              <div className="p-6 bg-gradient-to-br from-pink-900/20 to-purple-900/20 rounded-2xl border border-pink-500/30">
                <div className="text-center mb-4">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-pink-500/10 border border-pink-500/30 rounded-full text-pink-300 text-xs font-black tracking-wider">
                    <Smartphone size={12} />
                    قلب متجر صيانة الهواتف 💗
                  </span>
                </div>
                <PhoneCasesHeart
                  storeName={myStore.name}
                  storeLogo={myStore.logo}
                  epithet={myStore.epithet || '👑 ملك صيانة الهواتف'}
                  hideButton
                />
              </div>
            )}
          </div>
        )}

        {/* BRANDING VIEW */}
        {activeTab === 'branding' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-bold text-white">تخصيص الهوية والشكل الخارجي لمتجرك</h2>
              <p className="text-xs text-zinc-400 mt-1">غير الألوان، الشعارات، الغلاف، وطريقة عرض المنتجات لتميز متجرك عن المتاجر الأخرى.</p>
            </div>

            {/* AI DESIGN REDESIGNER PANEL */}
            <div className="p-5 border border-[#D4AF37]/30 bg-[#ffb700]/5 rounded-2xl space-y-3.5">
              <div className="flex items-center gap-2 text-[#D4AF37]">
                <Sparkles size={18} className="animate-pulse" />
                <h3 className="text-sm font-black">إعادة تصميم وتنسيق المتجر بالذكاء الاصطناعي 🪄🤖</h3>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                هل تريد تغيير هوية متجرك البصرية؟ اكتب وصفتك الجديدة (مثلاً: أسلوب كلاسيكي راقي لبيع العطور الشرقية باللون الذهبي الداكن، أو صيانة جوالات وأجهزة ذكية حديثة) وسيعمل الذكاء الاصطناعي على إعادة تنسيق الألوان، والوصف، وصور الغلاف فوراً!
              </p>
              <div className="flex gap-2.5 flex-wrap md:flex-nowrap">
                <input
                  type="text"
                  placeholder="اكتب التوجه الفني الجديد لمتجرك..."
                  value={aiBrandingPrompt}
                  onChange={(e) => setAiBrandingPrompt(e.target.value)}
                  className="flex-1 min-w-[200px] bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="button"
                  disabled={isGeneratingAI}
                  onClick={handleAIDesignRedesign}
                  className="px-4 py-2 bg-[#D4AF37] hover:bg-white text-black font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
                >
                  {isGeneratingAI ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>جاري إعادة التصميم الذكي...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>تطبيق التصميم بالذكاء الاصطناعي ✨</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveBranding} className="space-y-6 bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Right Column - Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-amber-400 border-b border-zinc-800/80 pb-2 flex items-center gap-1.5">
                    <span>📋 الهوية والبيانات الأساسية للمتجر</span>
                  </h3>
                  
                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold mb-1">اسم المتجر / المحل</label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold mb-1">شرح ووصف المتجر المختصر</label>
                    <textarea
                      value={storeDesc}
                      onChange={(e) => setStoreDesc(e.target.value)}
                      rows={3}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold mb-1">عملة المتجر المخصصة</label>
                    <input
                      type="text"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      placeholder="مثال: جنيه، ر.س، د.إ، USD، EUR (اتركه فارغاً لاستخدام العملة الافتراضية 'جنيه')"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[10px] text-zinc-500 mt-1">
                      يمكنك تحديد أي عملة تريدها لتعرض بجوار أسعار المنتجات في متجرك.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="text-right">
                      <ImagePicker
                        type="logo"
                        selectedUrl={storeLogo}
                        onSelect={setStoreLogo}
                        label="شعار المتجر (Logo) *"
                      />
                    </div>
                    <div className="text-right">
                      <ImagePicker
                        type="cover"
                        selectedUrl={storeCover}
                        onSelect={setStoreCover}
                        label="صورة الغلاف (Cover) *"
                      />
                    </div>
                  </div>
                </div>

                {/* Left Column - Advanced Colors */}
                <div className="space-y-4 border-r border-zinc-800/80 pr-0 md:pr-6 mt-6 md:mt-0">
                  <h3 className="text-sm font-bold text-amber-400 border-b border-zinc-800/80 pb-2 flex items-center gap-1.5">
                    <span>🎨 نظام الألوان المخصص وتصميم الأشكال</span>
                  </h3>

                  {/* Ready-made Color Palettes Selector */}
                  <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-850 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-zinc-300 flex items-center gap-1">
                        <Palette className="text-amber-500 w-3.5 h-3.5" />
                        <span>اختر لوحة ألوان جاهزة لمتجرك</span>
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">تطبيق بنقرة واحدة</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {COLOR_PALETTES.map((palette) => {
                        const isSelected = 
                          primaryColor.toLowerCase() === palette.primary.toLowerCase() &&
                          backColor.toLowerCase() === palette.background.toLowerCase() &&
                          frameColor.toLowerCase() === palette.frame.toLowerCase() &&
                          textColor.toLowerCase() === palette.text.toLowerCase();

                        return (
                          <button
                            type="button"
                            key={palette.id}
                            onClick={() => {
                              setPrimaryColor(palette.primary);
                              setBackColor(palette.background);
                              setFrameColor(palette.frame);
                              setTextColor(palette.text);
                            }}
                            className={`p-2.5 rounded-xl border text-right transition-all duration-200 cursor-pointer flex flex-col gap-2 ${
                              isSelected 
                                ? 'border-amber-400 bg-amber-500/5 shadow-md shadow-amber-500/5' 
                                : 'border-zinc-850 bg-zinc-900/40 hover:bg-zinc-800/40 hover:border-zinc-700'
                            }`}
                          >
                            <span className="text-[10.5px] font-bold text-white truncate block w-full">{palette.name}</span>
                            <div className="flex gap-1.5 items-center">
                              {palette.previewColors.map((color, cIdx) => (
                                <span 
                                  key={cIdx} 
                                  className="w-4 h-4 rounded-full border border-zinc-950 shadow-sm" 
                                  style={{ backgroundColor: color }} 
                                  title={
                                    cIdx === 0 ? 'الأساسي' : 
                                    cIdx === 1 ? 'الخلفية' : 
                                    cIdx === 2 ? 'الهياكل' : 'النصوص'
                                  }
                                />
                              ))}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-400 text-xs font-semibold mb-1">اللون الأساسي (Primary Accent)</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl py-1 px-2 text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-zinc-400 text-xs font-semibold mb-1">اللون الخلفي العام للمتجر</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={backColor}
                          onChange={(e) => setBackColor(e.target.value)}
                          className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={backColor}
                          onChange={(e) => setBackColor(e.target.value)}
                          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl py-1 px-2 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-400 text-xs font-semibold mb-1">لون هيكل الإطارات والبطاقات</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={frameColor}
                          onChange={(e) => setFrameColor(e.target.value)}
                          className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={frameColor}
                          onChange={(e) => setFrameColor(e.target.value)}
                          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl py-1 px-2 text-xs text-white font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-zinc-400 text-xs font-semibold mb-1">لون نصوص الشرح والأوصاف</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl py-1 px-2 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold mb-1">نمط عرض قائمة المنتجات</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'grid', label: 'شبكي (Grid)', desc: 'الأفضل لمعظم المحلات' },
                        { id: 'list', label: 'قائمة طعام (List)', desc: 'ممتاز للمطاعم' },
                        { id: 'luxury', label: 'فاخر ومتباعد', desc: 'للعطور والمجوهرات' }
                      ].map(style => (
                        <button
                          type="button"
                          key={style.id}
                          onClick={() => setLayoutType(style.id as any)}
                          className={`p-2 border rounded-xl text-right flex flex-col justify-between transition-all cursor-pointer ${
                            layoutType === style.id
                              ? 'border-amber-400 bg-amber-500/10 text-amber-400'
                              : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <span className="text-xs font-bold block">{style.label}</span>
                          <span className="text-[9px] text-zinc-500 mt-1">{style.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* LIVE CUSTOMIZATION: Fonts, Corners & Shadows */}
                  <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-800 space-y-4">
                    <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <Sparkles className="text-cyan-400 w-4 h-4 animate-pulse" />
                      <span>✨ التخصيص المباشر للمتجر (خطوط، بطاقات، وظلال)</span>
                    </span>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">
                      غير مظهر متجرك فورياً ليناسب هويتك التجارية. هذه التغييرات تنعكس على الخطوط المستخدمة، انحناءات زوايا الأزرار والبطاقات، وتأثيرات الظلال.
                    </p>

                    {/* Font Family Selector */}
                    <div className="space-y-1.5">
                      <label className="block text-zinc-400 text-xs font-semibold">خط المتجر العربي المفضل</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {[
                          { id: 'cairo', label: 'Cairo', name: 'خط كود - عريض وحديث' },
                          { id: 'tajawal', label: 'Tajawal', name: 'تجول - ناعم وبسيط' },
                          { id: 'almarai', label: 'Almarai', name: 'المراعي - واضح مريح' },
                          { id: 'amiri', label: 'Amiri', name: 'الأميري - كلاسيكي نسخ' },
                          { id: 'changa', label: 'Changa', name: 'شانغا - جريء عريض' },
                          { id: 'alexandria', label: 'Alexandria', name: 'الإسكندرية - مستقبلي' },
                          { id: 'inter', label: 'Inter', name: 'إنتر - طابع لاتيني' }
                        ].map(font => (
                          <button
                            type="button"
                            key={font.id}
                            onClick={() => setFontFamily(font.id as any)}
                            className={`p-2 border rounded-xl text-center transition-all cursor-pointer ${
                              fontFamily === font.id
                                ? 'border-cyan-400 bg-cyan-500/10 text-cyan-400 font-bold'
                                : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-white'
                            }`}
                          >
                            <span className="text-xs block" style={{ fontFamily: font.id === 'cairo' ? 'Cairo' : font.id === 'tajawal' ? 'Tajawal' : font.id === 'almarai' ? 'Almarai' : font.id === 'amiri' ? 'Amiri' : font.id === 'changa' ? 'Changa' : font.id === 'alexandria' ? 'Alexandria' : 'Inter' }}>{font.label}</span>
                            <span className="text-[9px] text-zinc-500 mt-0.5 block truncate">{font.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Border Radius Selector */}
                    <div className="space-y-1.5">
                      <label className="block text-zinc-400 text-xs font-semibold">زوايا البطاقات والأزرار (Border Radius)</label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { id: 'none', label: 'حادة', desc: '0px' },
                          { id: 'sm', label: 'ناعمة', desc: '4px' },
                          { id: 'md', label: 'متوسطة', desc: '8px' },
                          { id: 'lg', label: 'افتراضية', desc: '12px' },
                          { id: 'xl', label: 'مستديرة', desc: '16px' },
                          { id: '2xl', label: 'واسعة', desc: '24px' },
                          { id: '3xl', label: 'انسيابية', desc: '32px' }
                        ].map(radius => (
                          <button
                            type="button"
                            key={radius.id}
                            onClick={() => setBorderRadius(radius.id as any)}
                            className={`p-1.5 border rounded-xl text-center transition-all cursor-pointer ${
                              borderRadius === radius.id
                                ? 'border-cyan-400 bg-cyan-500/10 text-cyan-400 font-bold'
                                : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-white'
                            }`}
                          >
                            <span className="text-[11px] font-bold block">{radius.label}</span>
                            <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">{radius.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Shadow Selector */}
                    <div className="space-y-1.5">
                      <label className="block text-zinc-400 text-xs font-semibold">تأثيرات ظلال العناصر (Card Shadows)</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'none', label: 'بدون ظل' },
                          { id: 'sm', label: 'ظل ناعم خفيف' },
                          { id: 'md', label: 'ظل متوسط' },
                          { id: 'lg', label: 'ظل بارز 3D' },
                          { id: 'xl', label: 'ظل عريض فخم' },
                          { id: 'inner', label: 'ظل غائر (Inner)' }
                        ].map(shd => (
                          <button
                            type="button"
                            key={shd.id}
                            onClick={() => setShadowType(shd.id as any)}
                            className={`p-1.5 border rounded-xl text-center transition-all cursor-pointer ${
                              shadowType === shd.id
                                ? 'border-cyan-400 bg-cyan-500/10 text-cyan-400 font-bold'
                                : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-white'
                            }`}
                          >
                            <span className="text-[11px] font-bold block">{shd.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: Visual Template Selector */}
              <div className="border-t border-zinc-800/80 pt-6 space-y-3">
                <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <span>🏢 اختر قالب تصميم واجهة المتجر البصرية</span>
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] rounded font-bold">تغيير فوري لشكل المتجر</span>
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  بناءً على تخصص متجرك، اختر القالب البصري الأنسب. سيقوم هذا بتغيير نمط الصفحة الرئيسية، التموضع الفني، وتوفير الميزات الملائمة مثل طلب تذاكر صيانة الهواتف أو معارض الأزياء والعطور الفاخرة!
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { id: 'mobile', label: '📱 قالب جوالات وصيانة', desc: 'أشكال نيون حديثة، خدمات فنية، ونموذج إلكتروني مدمج لتسجيل وفحص الصيانة للعملاء.' },
                    { id: 'clothing', label: '👗 قالب ملابس وأزياء', desc: 'معرض صور كامل للأزياء، تنسيقات فاشن، كولكشنات، وتجربة تصفح بأسلوب البوتيك الراقي.' },
                    { id: 'perfume', label: '🧪 قالب عطور وبخور', desc: 'فخامة ملكية، خطوط متباعدة راقية، عرض المكونات وروائح العطر، وعنصر تجربة فخم.' },
                    { id: 'shoes', label: '👟 قالب أحذية ورياضة', desc: 'عصرية وجريئة، حركات وتأثيرات للأحذية، صور زاوية 360 درجة وتقسيم سلال رياضي.' },
                    { id: 'electronics', label: '🔌 قالب أجهزة كهربائية', desc: 'قالب تقني ممتاز، يسلط الضوء على المواصفات الفنية، والضمان، وقطع الغيار المنزلية الكبيرة.' },
                    { id: 'multicategory', label: '🛍️ قالب متجر شامل (عام)', desc: 'الأفضل لجميع التصنيفات، يضم البنرات الدوارة، قائمة أقسام مريحة، وترتيب السلة الكلاسيكي.' },
                    { id: 'phonecases', label: '📱 قالب كفرات جوالات', desc: 'تصميم وردي زهري عصري لعرض كفرات وحمايات وشواحن الجوالات.' },
                    { id: 'supermarket', label: '🛒 قالب سوبر ماركت', desc: 'أخضر نابض بالحياة للسوبر ماركت والمواد الغذائية والمنتجات الطازجة.' },
                    { id: 'hometools', label: '🏠 قالب أدوات منزلية', desc: 'عنبر دافئ للأدوات المنزلية وأطقم المطبخ والديكورات العصرية.' },
                    { id: 'computers', label: '💻 قالب كمبيوترات وتقنية', desc: 'أزرق تقني للابتوبات وقطع الكمبيوتر وملحقات الأجهزة.' }
                  ].map(tpl => (
                    <button
                      type="button"
                      key={tpl.id}
                      onClick={() => setVisualTemplate(tpl.id as any)}
                      className={`p-3 border rounded-xl text-right flex flex-col justify-between transition-all cursor-pointer ${
                        visualTemplate === tpl.id
                          ? 'border-amber-400 bg-amber-500/10 text-amber-400 ring-2 ring-amber-500/30'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold block">{tpl.label}</span>
                      <span className="text-[10px] text-zinc-500 mt-1 leading-relaxed">{tpl.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION: Features / Advantages Manager */}
              <div className="border-t border-zinc-800/80 pt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                    <span>🌟 مميزات ومزايا المتجر التنافسية (Features)</span>
                  </h3>
                </div>
                <p className="text-xs text-zinc-400">
                  أضف مزايا خاصة لمتجرك تظهر للعملاء في الصفحة الرئيسية لزيادة ثقتهم، مثل: (توصيل مجاني، ضمان حقيقي، دعم 24 ساعة، استرجاع مرن).
                </p>

                {/* List current features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {features.map((f, idx) => (
                    <div key={f.id || idx} className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-850 flex items-start gap-2.5 justify-between">
                      <div className="flex items-start gap-2">
                        <span className="text-xl shrink-0 mt-0.5">{f.icon || '🌟'}</span>
                        <div>
                          <p className="text-xs font-bold text-zinc-100">{f.title}</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">{f.desc}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = features.filter((_, i) => i !== idx);
                          setFeatures(updated);
                        }}
                        className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-all cursor-pointer"
                        title="حذف الميزة"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new feature form inline */}
                <div className="bg-zinc-950/40 p-4 border border-zinc-850 rounded-xl space-y-3">
                  <h4 className="text-[11px] font-bold text-amber-400">🆕 إضافة ميزة/ضمان جديد لمتجرك:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end text-right">
                    <div className="sm:col-span-3">
                      <label className="block text-zinc-500 text-[10px] font-semibold mb-1">أيقونة / إيموجي</label>
                      <select
                        value={newFeatureIcon}
                        onChange={(e) => setNewFeatureIcon(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-1.5 px-2 text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        <option value="⚡">⚡ شحن سريع</option>
                        <option value="🛡️">🛡️ حماية وضمان</option>
                        <option value="💬">💬 دعم تواصل</option>
                        <option value="🚚">🚚 شحن مجاني</option>
                        <option value="🌟">🌟 مميز وجاذب</option>
                        <option value="💳">💳 دفع آمن</option>
                        <option value="🔁">🔁 استبدال مرن</option>
                        <option value="💎">💎 جودة مضمونة</option>
                        <option value="🏷️">🏷️ أفضل سعر</option>
                      </select>
                    </div>
                    <div className="sm:col-span-4">
                      <label className="block text-zinc-500 text-[10px] font-semibold mb-1">عنوان الميزة الرئيسية</label>
                      <input
                        type="text"
                        placeholder="مثال: شحن مجاني لكل المحافظات"
                        value={newFeatureTitle}
                        onChange={(e) => setNewFeatureTitle(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-zinc-500 text-[10px] font-semibold mb-1">وصف الميزة المصغر</label>
                      <input
                        type="text"
                        placeholder="مثال: عند الشراء بقيمة تزيد عن 200 ر.س"
                        value={newFeatureDesc}
                        onChange={(e) => setNewFeatureDesc(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (!newFeatureTitle.trim() || !newFeatureDesc.trim()) {
                            alert('الرجاء تعبئة عنوان وخط الميزة لإضافتها.');
                            return;
                          }
                          const newF = {
                            id: `feat-${Date.now()}`,
                            title: newFeatureTitle.trim(),
                            desc: newFeatureDesc.trim(),
                            icon: newFeatureIcon
                          };
                          setFeatures([...features, newF]);
                          setNewFeatureTitle('');
                          setNewFeatureDesc('');
                        }}
                        className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Plus size={12} />
                        <span>أضف الآن</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: Sections Order Customizer */}
              <div className="border-t border-zinc-800/80 pt-6 space-y-3">
                <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <span>↕️ ترتيب أقسام المتجر الرئيسية</span>
                  <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] rounded font-bold">تغيير الترتيب فورا</span>
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed text-right">
                  تحكم بترتيب عرض العناصر في الصفحة الرئيسية لمتجرك بسهولة. استخدم الأزرار لتحريك الأقسام لأعلى أو لأسفل ليظهر متجرك بالشكل الذي تفضله.
                </p>

                <div className="space-y-2 max-w-xl text-right">
                  {sectionsOrder.map((sec, idx) => {
                    const sectionLabels: Record<string, string> = {
                      slider: 'البنر الرئيسي المتحرك والشرائح 🎆',
                      search: 'شريط البحث الذكي المتقدم 🔍',
                      categories: 'أقسام المتجر وبطاقات الفئات 🗂️',
                      products: 'المنتجات والبطاقات الأكثر مبيعاً 🏷️',
                      services: 'قسم خدمات الصيانة المستقلة الفاخرة 🛠️',
                      features: 'شريط المميزات والضمانات والتوصيل ⭐',
                      reviews: 'قسم آراء وتقييمات العملاء الموثوقة 💬',
                      about: 'بيانات الاتصال وموقع المتجر وساعات العمل 📍',
                    };
                    return (
                      <div key={sec} className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-200">
                          <span className="text-zinc-500 ml-2 font-mono">{idx + 1}.</span>
                          {sectionLabels[sec] || sec}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => {
                              const newOrder = [...sectionsOrder];
                              const temp = newOrder[idx];
                              newOrder[idx] = newOrder[idx - 1];
                              newOrder[idx - 1] = temp;
                              setSectionsOrder(newOrder);
                            }}
                            className="p-1 rounded bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            title="تحريك لأعلى"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === sectionsOrder.length - 1}
                            onClick={() => {
                              const newOrder = [...sectionsOrder];
                              const temp = newOrder[idx];
                              newOrder[idx] = newOrder[idx + 1];
                              newOrder[idx + 1] = temp;
                              setSectionsOrder(newOrder);
                            }}
                            className="p-1 rounded bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            title="تحريك لأسفل"
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION: Repair Services Manager */}
              <div className="border-t border-zinc-800/80 pt-6 space-y-3">
                <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                  <span>🛠️ إدارة وتخصيص خدمات الصيانة المتاحة</span>
                  <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[10px] rounded font-bold">باقات مخصصة لهوية متجرك</span>
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed text-right">
                  أضف أو عدل باقات وخدمات الصيانة التي تظهر لعملائك في قسم الصيانة المخصص لمتجرك (مثل تبديل الشاشات، صيانة اللوحة الأم، إلخ).
                </p>

                {/* List services */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {repairServices.map((srv, idx) => (
                    <div key={srv.id || idx} className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-850 flex items-start gap-2.5 justify-between">
                      <div className="flex items-start gap-2 text-right">
                        <span className="text-xl shrink-0 mt-0.5">{srv.icon || '📱'}</span>
                        <div>
                          <p className="text-xs font-bold text-zinc-100">{srv.title}</p>
                          <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">{srv.desc}</p>
                          {srv.price ? (
                            <p className="text-[10px] text-cyan-400 font-bold font-mono mt-1">متوسط التكلفة: {srv.price} ر.س</p>
                          ) : null}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = repairServices.filter((_, i) => i !== idx);
                          setRepairServices(updated);
                        }}
                        className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-all cursor-pointer"
                        title="حذف الخدمة"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new service form */}
                <div className="bg-zinc-950/40 p-4 border border-zinc-850 rounded-xl space-y-3">
                  <h4 className="text-[11px] font-bold text-cyan-400 text-right">🆕 إضافة خدمة صيانة جديدة للعملاء:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end text-right">
                    <div className="sm:col-span-2">
                      <label className="block text-zinc-500 text-[10px] font-semibold mb-1">أيقونة الخدمة</label>
                      <select
                        value={newServiceIcon}
                        onChange={(e) => setNewServiceIcon(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-1.5 px-2 text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                      >
                        <option value="📱">📱 شاشات وجوالات</option>
                        <option value="🔋">🔋 بطاريات وشحن</option>
                        <option value="🔌">🔌 منفذ شاحن</option>
                        <option value="🔊">🔊 سماعة وميكروفون</option>
                        <option value="⚙️">⚙️ سوفت وير وبرمجة</option>
                        <option value="🔬">🔬 بوردة ومايكرو</option>
                        <option value="🛡️">🛡️ فحص مجاني</option>
                        <option value="📸">📸 كاميرات وتصوير</option>
                        <option value="🧹">🧹 تنظيف وتلميع</option>
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-zinc-500 text-[10px] font-semibold mb-1">اسم خدمة الصيانة</label>
                      <input
                        type="text"
                        placeholder="مثال: تبديل شاشة أصلية"
                        value={newServiceTitle}
                        onChange={(e) => setNewServiceTitle(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label className="block text-zinc-500 text-[10px] font-semibold mb-1">وصف مقتضب للخدمة والضمان</label>
                      <input
                        type="text"
                        placeholder="مثال: تبديل خلال ساعة واحدة بقطع أصلية وضمان 6 أشهر"
                        value={newServiceDesc}
                        onChange={(e) => setNewServiceDesc(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div className="sm:col-span-1.5">
                      <label className="block text-zinc-500 text-[10px] font-semibold mb-1">السعر (ر.س)</label>
                      <input
                        type="number"
                        value={newServicePrice}
                        onChange={(e) => setNewServicePrice(Number(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-1.5 px-2 text-xs text-white focus:outline-none focus:border-cyan-400 text-left"
                      />
                    </div>
                    <div className="sm:col-span-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (!newServiceTitle.trim() || !newServiceDesc.trim()) {
                            alert('الرجاء تعبئة اسم ووصف الخدمة لإضافتها.');
                            return;
                          }
                          const newSrv = {
                            id: `srv-${Date.now()}`,
                            title: newServiceTitle.trim(),
                            desc: newServiceDesc.trim(),
                            icon: newServiceIcon,
                            price: newServicePrice || undefined
                          };
                          setRepairServices([...repairServices, newSrv]);
                          setNewServiceTitle('');
                          setNewServiceDesc('');
                          setNewServicePrice(100);
                        }}
                        className="w-full py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Plus size={12} />
                        <span>إضافة</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-zinc-800/80 pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10"
                >
                  <Save size={14} />
                  <span>حفظ جميع التعديلات والتصميم الآن 🌟</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* PRODUCTS & CUSTOM SECTIONS VIEW */}
        {activeTab === 'products' && (
          <div className="space-y-8">
            
            {/* Store Categories / Sections management */}
            <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-3xl space-y-5">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                    <Layers className="text-amber-500 w-4.5 h-4.5" />
                    <span>إعادة ترتيب وتخصيص أقسام المتجر الرئيسية</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    قم بإضافة الأقسام (مثل: آيفون، ملابس شتوية، بخور ملكي) ورتبها بالتسلسل الذي تريده لعرضها في المتجر.
                    <span className="text-amber-400 font-medium block sm:inline sm:mr-1">💡 اسحب وأفلت الأقسام لترتيبها فوراً، أو استخدم أسهم التوجيه السريعة للتحريك.</span>
                  </p>
                </div>
                
                {/* Info status of items */}
                <div className="text-[10px] bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800 text-zinc-500 font-mono">
                  {myStore.categories.length} أقسام مفعلة
                </div>
              </div>

              {/* Add category input form */}
              <div className="flex gap-2 bg-zinc-950/40 p-2 rounded-2xl border border-zinc-850">
                <input
                  type="text"
                  placeholder="اسم القسم الجديد (مثال: مستلزمات الصيانة، عطور رجالية...)"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-4 text-xs text-white focus:outline-none focus:border-amber-400 text-right flex-1 font-medium"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-5 py-2 bg-amber-500 text-black font-black text-xs rounded-xl hover:bg-amber-400 transition-all cursor-pointer flex items-center gap-1 shadow-lg shadow-amber-500/10 shrink-0"
                >
                  <Plus size={14} />
                  <span>إضافة قسم جديد</span>
                </button>
              </div>

              {/* Drag and Drop category list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {myStore.categories.map((cat, idx) => {
                  const catProductsCount = myProducts.filter(p => p.category === cat).length;
                  const isDragging = draggedCatIndex === idx;
                  const isOver = dragOverCatIndex === idx;

                  return (
                    <div
                      key={idx}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => handleDrop(e, idx)}
                      className={`p-3.5 rounded-2xl border transition-all duration-200 select-none flex items-center justify-between gap-3 cursor-grab active:cursor-grabbing ${
                        isDragging 
                          ? 'opacity-40 border-dashed border-amber-500/60 bg-zinc-900/20' 
                          : isOver
                          ? 'border-amber-500 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.05)] scale-[1.01]'
                          : 'border-zinc-800/80 bg-zinc-950/80 hover:bg-zinc-900/60 hover:border-zinc-700'
                      }`}
                    >
                      {/* Right side: Grip indicator and Category details */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0">
                          <GripVertical size={16} />
                        </div>
                        
                        <div className="text-right min-w-0">
                          <div className="font-bold text-white text-xs truncate" title={cat}>
                            {cat}
                          </div>
                          <span className="text-[10px] text-zinc-500 font-medium block mt-0.5">
                            {catProductsCount === 0 
                              ? 'لا توجد منتجات مضافة لهذا القسم' 
                              : catProductsCount === 1 
                              ? 'يحتوي على منتج واحد'
                              : catProductsCount === 2
                              ? 'يحتوي على منتجين'
                              : `يحتوي على ${catProductsCount} منتجات`}
                          </span>
                        </div>
                      </div>

                      {/* Left side: Arrow reordering controls & deletion */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Up button */}
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={(e) => { e.stopPropagation(); moveCategoryUp(idx); }}
                          className="p-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 rounded-lg transition-colors cursor-pointer"
                          title="تحريك للأعلى"
                        >
                          <ChevronUp size={14} />
                        </button>

                        {/* Down button */}
                        <button
                          type="button"
                          disabled={idx === myStore.categories.length - 1}
                          onClick={(e) => { e.stopPropagation(); moveCategoryDown(idx); }}
                          className="p-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 rounded-lg transition-colors cursor-pointer"
                          title="تحريك للأسفل"
                        >
                          <ChevronDown size={14} />
                        </button>

                        <div className="w-px h-5 bg-zinc-800 mx-1 shrink-0" />

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleRemoveCategory(cat); }}
                          className="p-1.5 bg-red-600/10 hover:bg-red-600 hover:text-white text-red-400 rounded-lg transition-all cursor-pointer"
                          title="حذف هذا القسم"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Products management */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-white">قائمة المنتجات المعروضة</h3>
                  <p className="text-xs text-zinc-400">تصفح وأضف أو عدل على قائمة منتجات متجرك.</p>
                </div>
                {!isAddingProduct && (
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setPName('');
                      setPPrice(0);
                      setPOrigPrice(0);
                      setPCategory(myStore.categories[0] || 'عام');
                      setPStock(10);
                      setPImage('');
                      setPDesc('');
                      setPIsOffer(false);
                      setPOfferText('');
                      setIsAddingProduct(true);
                    }}
                    className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl hover:bg-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>إضافة منتج جديد</span>
                  </button>
                )}
              </div>

              {isAddingProduct ? (
                /* Add / Edit Product Form */
                <form onSubmit={handleProductSubmit} className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold text-amber-400">
                    {editingProduct ? `تعديل منتج: ${editingProduct.name}` : 'إضافة منتج إلكتروني جديد'}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-400 text-xs font-semibold mb-1">اسم المنتج الكامل *</label>
                      <input
                        type="text"
                        placeholder="مثال: سماعة سوني برو اللاسلكية"
                        value={pName}
                        onChange={(e) => setPName(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 text-xs font-semibold mb-1">القسم المخصص له *</label>
                      <select
                        value={pCategory}
                        onChange={(e) => setPCategory(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none cursor-pointer"
                      >
                        {myStore.categories.map((cat, idx) => (
                          <option key={idx} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-zinc-400 text-xs font-semibold mb-1">سعر البيع (ر.س) *</label>
                      <input
                        type="number"
                        value={pPrice || ''}
                        onChange={(e) => setPPrice(Number(e.target.value))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 text-xs font-semibold mb-1">السعر الأصلي لشطب الخصم</label>
                      <input
                        type="number"
                        placeholder="مثال: 500"
                        value={pOrigPrice || ''}
                        onChange={(e) => setPOrigPrice(Number(e.target.value))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 text-xs font-semibold mb-1">الكمية المتوفرة بالمخزون *</label>
                      <input
                        type="number"
                        value={pStock || ''}
                        onChange={(e) => setPStock(Number(e.target.value))}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-zinc-950/40 border border-zinc-850 p-4 rounded-xl">
                      <ImagePicker
                        type="product"
                        selectedUrl={pImage}
                        onSelect={setPImage}
                        label="صورة المنتج الأساسية (رابط أو من المكتبة) *"
                      />
                    </div>

                    <div className="bg-zinc-950/20 border border-zinc-850/60 p-4 rounded-xl space-y-3">
                      <label className="block text-zinc-300 text-[11px] font-bold">معرض صور المنتج الإضافية (يمكنك تحديد حتى 4 صور إضافية للمنتج)</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[0, 1, 2, 3].map((index) => (
                          <div key={index} className="bg-zinc-950 border border-zinc-900 p-2.5 rounded-lg space-y-2 text-right">
                            <span className="block text-zinc-500 text-[9px] font-bold">صورة إضافية {index + 1}</span>
                            <ImagePicker
                              type="product"
                              selectedUrl={pImages[index] || ''}
                              onSelect={(url) => {
                                const copy = [...pImages];
                                copy[index] = url;
                                setPImages(copy);
                              }}
                              label=""
                            />
                            {pImages[index] && (
                              <button
                                type="button"
                                onClick={() => {
                                  const copy = [...pImages];
                                  copy[index] = '';
                                  setPImages(copy.filter(Boolean));
                                }}
                                className="text-[9px] text-red-400 hover:text-red-500 hover:underline transition-colors block cursor-pointer mr-auto"
                              >
                                حذف الصورة
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold mb-1">وصف المنتج التفصيلي</label>
                    <textarea
                      placeholder="اكتب مواصفات، ميزات، وحجم المنتج لترغيب المشتري بالشراء."
                      value={pDesc}
                      onChange={(e) => setPDesc(e.target.value)}
                      rows={3}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isOfferCheckbox"
                        checked={pIsOffer}
                        onChange={(e) => setPIsOffer(e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded text-amber-500"
                      />
                      <label htmlFor="isOfferCheckbox" className="text-xs text-zinc-300 font-bold select-none cursor-pointer">هل هذا المنتج يمثل عرضاً ترويجياً نشطاً؟</label>
                    </div>

                    {pIsOffer && (
                      <div>
                        <label className="block text-zinc-400 text-xs font-semibold mb-1">عنوان العرض الترويجي الجذاب</label>
                        <input
                          type="text"
                          placeholder="مثال: خصم 20%، اشتري قطعتين واحصل على الثالثة مجاناً"
                          value={pOfferText}
                          onChange={(e) => setPOfferText(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 justify-end pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingProduct(false);
                        setEditingProduct(null);
                      }}
                      className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      إلغاء التغيير
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl hover:bg-amber-400 cursor-pointer flex items-center gap-1"
                    >
                      <Save size={14} />
                      <span>{editingProduct ? 'حفظ التعديلات' : 'إضافة وعرض المنتج لايف'}</span>
                    </button>
                  </div>
                </form>
              ) : myProducts.length === 0 ? (
                <div className="text-center py-16 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl">
                  <p className="text-zinc-500 text-sm">لا يوجد لديك أي منتجات معروضة حالياً.</p>
                  <button
                    onClick={() => setIsAddingProduct(true)}
                    className="mt-4 px-4 py-2 bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20 rounded-xl hover:bg-amber-500/20"
                  >
                    أضف أول منتج لمتجرك الآن 🛍️
                  </button>
                </div>
              ) : (
                /* Products Table */
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-zinc-900/80 border-b border-zinc-850 text-zinc-400">
                        <tr>
                          <th className="p-3">المنتج</th>
                          <th className="p-3">القسم</th>
                          <th className="p-3">السعر</th>
                          <th className="p-3">المخزون</th>
                          <th className="p-3">المبيعات</th>
                          <th className="p-3 text-left">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-850/50 text-zinc-300">
                        {myProducts.map(prod => (
                          <tr key={prod.id} className="hover:bg-zinc-900/20 transition-colors">
                            <td className="p-3 flex items-center gap-2">
                              <img
                                src={prod.image}
                                alt={prod.name}
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 rounded-lg object-cover bg-zinc-800 shrink-0"
                              />
                              <span className="font-bold text-white truncate max-w-[150px]" title={prod.name}>
                                {prod.name}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-[10px] text-zinc-400">
                                {prod.category}
                              </span>
                            </td>
                            <td className="p-3 font-mono font-bold text-amber-400">{prod.price} ر.س</td>
                            <td className="p-3 font-mono">{prod.stock} وحدة</td>
                            <td className="p-3 font-mono text-zinc-500">{prod.salesCount || 0} مباع</td>
                            <td className="p-3 text-left">
                              <div className="flex gap-1.5 justify-end">
                                <button
                                  onClick={() => startEditProduct(prod)}
                                  className="p-1.5 hover:bg-zinc-850 text-amber-400 rounded-lg cursor-pointer transition-colors"
                                  title="تعديل تفاصيل المنتج"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prod.id)}
                                  className="p-1.5 hover:bg-zinc-850 text-red-400 rounded-lg cursor-pointer transition-colors"
                                  title="حذف المنتج نهائياً"
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
              )}
            </div>

          </div>
        )}

        {/* ORDERS MANAGEMENT VIEW */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">إدارة طلبات المتجر والمبيعات</h2>
              <p className="text-xs text-zinc-400 mt-1">تابع حالة الطلبيات الواردة لمتجرك وقم بتغييرها لمباشرة الشحن والتسليم.</p>
            </div>

            {myOrders.length === 0 ? (
              <div className="text-center py-16 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl">
                <p className="text-zinc-500 text-sm">لا تتوفر أي طلبات لمتجرك حتى هذه اللحظة.</p>
                <p className="text-[10px] text-zinc-600 mt-1">سيتم إخطارك هنا مباشرة فور قيام أي عميل بوضع طلبية من متجرك.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myOrders.map(order => (
                  <div key={order.id} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden text-xs">
                    {/* Top bar */}
                    <div className="bg-zinc-900 px-4 py-3 border-b border-zinc-850 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-white text-sm">{order.id}</span>
                        <span className="text-zinc-500">•</span>
                        <span className="text-zinc-400 font-mono">{order.date}</span>
                      </div>

                      {/* Status selectors */}
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400 font-semibold ml-1.5">حالة الطلبية الحالية:</span>
                        <select
                          value={order.status}
                          onChange={(e) => handleOrderStatusChange(order.id, e.target.value as any)}
                          className="bg-zinc-950 border border-zinc-800 text-white font-semibold py-1 px-2.5 rounded-lg text-xs cursor-pointer focus:border-amber-400 focus:outline-none"
                        >
                          <option value="pending">انتظار التجهيز ⏳</option>
                          <option value="processing">قيد العمل والتحضير ⚙️</option>
                          <option value="shipped">تم الشحن والتسليم للمندوب 🚚</option>
                          <option value="delivered">تم الاستلام والمبيعة مكتملة ✓</option>
                          <option value="cancelled">ملغي ✕</option>
                        </select>
                      </div>
                    </div>

                    {/* Order Details Body */}
                    <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      
                      {/* Products List (Inside order) */}
                      <div className="md:col-span-7 space-y-2.5">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">المنتجات المطلوبة:</p>
                        {order.items.map((item, index) => (
                          <div key={index} className="flex gap-3 items-center bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-900">
                            <img
                              src={item.image}
                              alt={item.productName}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-lg object-cover bg-zinc-900 shrink-0 border border-zinc-800"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-bold truncate text-xs">{item.productName}</p>
                              <p className="text-zinc-500 text-[10px] mt-0.5">الكمية: {item.quantity} وحدة × {item.price} ر.س</p>
                            </div>
                            <span className="text-white font-bold font-mono">{item.price * item.quantity} ر.س</span>
                          </div>
                        ))}
                      </div>

                      {/* Customer Delivery info */}
                      <div className="md:col-span-5 bg-zinc-950/60 p-4 rounded-xl border border-zinc-850 space-y-2 text-right">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">تفاصيل العميل والشحن فوري:</p>
                        <div className="space-y-1 text-xs text-zinc-300">
                          <p><span className="text-zinc-500">اسم العميل:</span> <span className="text-white font-bold">{order.customerName}</span></p>
                          <p><span className="text-zinc-500">الجوال:</span> <span className="text-white font-mono font-bold">{order.customerPhone}</span></p>
                          <p><span className="text-zinc-500">البريد:</span> <span className="text-zinc-400 font-mono">{order.customerEmail}</span></p>
                          <p className="leading-relaxed"><span className="text-zinc-500">العنوان:</span> <span className="text-white text-[11px] font-medium">{order.customerAddress}</span></p>
                          
                          {/* Vodafone Cash payment verification */}
                          {order.paymentMethod === 'vodafone_cash' && (
                            <div className="mt-3.5 p-2.5 bg-red-950/20 border border-red-500/20 rounded-xl space-y-2">
                              <p className="text-[10px] font-extrabold text-red-400 flex items-center gap-1">
                                <span>📱 الدفع عبر فودافون كاش</span>
                              </p>
                              <p className="text-[11px]"><span className="text-zinc-400">الرقم المحول منه:</span> <span className="text-white font-mono font-bold">{order.vodafoneNumber || 'غير محدد'}</span></p>
                              {order.vodafoneReceiptImage && (
                                <div className="space-y-1.5 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => setExpandedReceiptOrderId(expandedReceiptOrderId === order.id ? null : order.id)}
                                    className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-white border border-red-500/30 rounded text-[10px] font-bold cursor-pointer transition-all w-full text-center"
                                  >
                                    {expandedReceiptOrderId === order.id ? 'إخفاء صورة الإيصال ✕' : 'عرض صورة الإيصال 📄'}
                                  </button>
                                  {expandedReceiptOrderId === order.id && (
                                    <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900 p-1 animate-fadeIn">
                                      <img
                                        src={order.vodafoneReceiptImage}
                                        alt="إيصال التحويل"
                                        className="w-full h-auto max-h-64 object-contain"
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="border-t border-zinc-900 pt-3 mt-3 flex justify-between items-center text-xs">
                          <span className="text-zinc-400 font-semibold">إجمالي الفاتورة للتاجر:</span>
                          <span className="text-amber-400 font-black text-sm font-mono">{order.total} ر.س</span>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* COUPONS MANAGEMENT VIEW */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-bold text-white">إدارة كوبونات خصم المحل</h2>
                <p className="text-xs text-zinc-400 mt-1">قم بإنشاء كوبونات خاصة بمتجرك لتشجيع المشترين والزبائن على زيادة السلة.</p>
              </div>
              {!isAddingCoupon && (
                <button
                  onClick={() => setIsAddingCoupon(true)}
                  className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl hover:bg-amber-400 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>إضافة كود كوبون جديد</span>
                </button>
              )}
            </div>

            {isAddingCoupon && (
              <form onSubmit={handleCouponSubmit} className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold text-amber-400">إنشاء كوبون تسويقي جديد للمحل فقط</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold mb-1">كود الكوبون (بالأحرف اللاتينية) *</label>
                    <input
                      type="text"
                      placeholder="مثال: SALE10"
                      value={cCode}
                      onChange={(e) => setCCode(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400 text-left font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold mb-1">نوع الخصم المستقطع *</label>
                    <select
                      value={cType}
                      onChange={(e) => setCType(e.target.value as any)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none cursor-pointer"
                    >
                      <option value="percent">نسبة مئوية (%)</option>
                      <option value="fixed">مبلغ ثابت (ر.س)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold mb-1">قيمة الخصم (الرقمية) *</label>
                    <input
                      type="number"
                      value={cValue}
                      onChange={(e) => setCValue(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold mb-1">الحد الأدنى لاستخدام الكوبون (ر.س)</label>
                    <input
                      type="number"
                      value={cMin}
                      onChange={(e) => setCMin(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddingCoupon(false)}
                    className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl"
                  >
                    إلغاء التغيير
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl hover:bg-amber-400"
                  >
                    إطلاق ونشر الكوبون الآن
                  </button>
                </div>
              </form>
            )}

            {coupons.filter(c => c.storeId === storeId).length === 0 ? (
              <div className="text-center py-16 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl">
                <p className="text-zinc-500 text-sm">لم تقم بإنشاء أي كوبونات خصم لمتجرك حتى الآن.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.filter(c => c.storeId === storeId).map(c => (
                  <div key={c.id} className="bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl flex items-center justify-between text-right">
                    <div>
                      <span className="font-mono font-extrabold text-sm text-amber-400 tracking-wider block">{c.code}</span>
                      <span className="text-[10px] text-zinc-400 mt-1 block">
                        خصم {c.value}{c.discountType === 'percent' ? '%' : ' ر.س'} عند تخطي المجموع لـ {c.minOrderValue} ر.س
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteCoupon(c.id)}
                      className="p-1.5 hover:bg-zinc-800 text-red-400 rounded-lg transition-colors cursor-pointer"
                      title="حذف الكوبون"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PAYMENT GATEWAYS & CUSTOM CHECKOUT FORM FIELDS */}
        {activeTab === 'gateways' && (
          <div className="space-y-8 animate-fadeIn text-right" dir="rtl">
            <div>
              <h2 className="text-xl font-black text-white">إعدادات الدفع ونموذج الطلب السريع 💳⚙️</h2>
              <p className="text-xs text-zinc-400 mt-1">
                تحكم في بوابات الدفع التي تظهر للمشترين عند طلب منتجاتك، بالإضافة إلى الحقول المطلوبة في نموذج تعبئة البيانات السريع.
              </p>
            </div>

            <form onSubmit={handleSavePaymentSettings} className="space-y-6">
              
              {/* PAYMENT GATEWAYS SECTION */}
              <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl space-y-6">
                <div className="border-b border-zinc-800/80 pb-4 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">💳</span>
                      <span>بوابات الدفع المتاحة في متجرك</span>
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-1">أضف وعدّل طُرق الدفع المفضلة لعملائك (InstaPay, بنكي, محافظ إلكترونية...)</p>
                  </div>
                  <button
                    type="button"
                    onClick={openAddGateway}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
                  >
                    <Plus size={14} />
                    <span>إضافة بوابة دفع جديدة</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {paymentGateways.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-zinc-800 rounded-2xl">
                      <p className="text-zinc-500 text-xs">لا توجد بوابات دفع مضافة بعد. اضغط على "إضافة بوابة دفع جديدة" للبدء.</p>
                    </div>
                  ) : (
                    paymentGateways.map((gw) => (
                      <div key={gw.id} className={`p-4 rounded-2xl border transition-all ${gw.enabled ? 'bg-gradient-to-l from-green-500/5 to-zinc-950/60 border-green-500/20' : 'bg-zinc-950/60 border-zinc-850'}`}>
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-xl border border-zinc-700/50">
                            {gw.icon || (
                              {
                                cod: '💵',
                                vodafoneCash: '🟥',
                                instapay: '💙',
                                etisalatCash: '🟩',
                                orangeMoney: '🟧',
                                bankTransfer: '🏦',
                                creditCard: '💳',
                                paypal: '🅿️',
                                stripe: '⚡',
                                other: '💰'
                              }[gw.type] || '💰'
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <label className={`text-xs font-bold cursor-pointer select-none ${gw.enabled ? 'text-white' : 'text-zinc-500'}`}>
                                    {gw.name}
                                  </label>
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${gw.enabled ? 'bg-green-500/20 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
                                    {gw.enabled ? 'نشط' : 'متوقف'}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-zinc-800 text-zinc-400">
                                    {gw.type}
                                  </span>
                                </div>
                                <div className="mt-1.5 space-y-0.5 text-[10px] text-zinc-400">
                                  {gw.number && <p>الرقم: <span className="font-mono text-zinc-300" dir="ltr">{gw.number}</span></p>}
                                  {gw.bankName && <p>البنك: <span className="text-zinc-300">{gw.bankName}</span></p>}
                                  {gw.accountHolderName && <p>اسم الحساب: <span className="text-zinc-300">{gw.accountHolderName}</span></p>}
                                  {gw.iban && <p>IBAN: <span className="font-mono text-zinc-300" dir="ltr">{gw.iban}</span></p>}
                                  {gw.extraInstructions && <p className="text-amber-400/80">📌 {gw.extraInstructions}</p>}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => toggleGateway(gw.id)}
                                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${gw.enabled ? 'text-green-400 hover:bg-green-500/10' : 'text-zinc-500 hover:bg-zinc-800'}`}
                                  title={gw.enabled ? 'إيقاف التفعيل' : 'تفعيل'}
                                >
                                  {gw.enabled ? <CheckCircle size={15} /> : <X size={15} />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openEditGateway(gw)}
                                  className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                                  title="تعديل"
                                >
                                  <Edit3 size={15} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteGateway(gw.id)}
                                  className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                  title="حذف"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* CUSTOM CHECKOUT FORM FIELDS */}
              <div className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl space-y-6">
                <div className="border-b border-zinc-800/80 pb-4 flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">📋</span>
                      <span>منشئ نموذج الطلب (Form Builder)</span>
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-1">تحكم كامل في حقول نموذج الطلب: أضف، عدّل، احذف، ورتّب الحقول.</p>
                  </div>
                  <button
                    type="button"
                    onClick={openAddField}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-pink-500/20"
                  >
                    <Plus size={14} />
                    <span>إضافة حقل جديد</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {customCheckoutFields.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-zinc-800 rounded-2xl">
                      <p className="text-zinc-500 text-xs">لا توجد حقول مضافة. اضغط على "إضافة حقل جديد" لإنشاء النموذج.</p>
                    </div>
                  ) : (
                    [...customCheckoutFields]
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((fld, idx) => (
                        <div key={fld.id} className={`p-3.5 rounded-xl border transition-all flex items-center gap-3 ${fld.enabled ? 'bg-zinc-950/60 border-zinc-850/80' : 'bg-zinc-950/20 border-zinc-900 opacity-50'}`}>
                          <div className="flex flex-col gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => moveFieldUp(idx)}
                              disabled={idx === 0}
                              className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ChevronUp size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveFieldDown(idx)}
                              disabled={idx === customCheckoutFields.length - 1}
                              className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ChevronDown size={13} />
                            </button>
                          </div>
                          <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500/20 to-blue-500/20 border border-zinc-700/50 flex items-center justify-center text-[10px] font-black text-zinc-300">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-bold ${fld.enabled ? 'text-white' : 'text-zinc-500'}`}>
                                {fld.label}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-zinc-800 text-zinc-400">
                                {fld.type}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-zinc-800/50 text-zinc-500">
                                name: {fld.name}
                              </span>
                              {fld.required && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-red-500/20 text-red-400">
                                  إلزامي
                                </span>
                              )}
                              {!fld.enabled && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-zinc-800 text-zinc-500">
                                  مخفي
                                </span>
                              )}
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-[9px] text-zinc-500">
                              {fld.placeholder && <span>مكان الإدخال: "{fld.placeholder}"</span>}
                              {fld.options && fld.options.length > 0 && <span>خيارات: {fld.options.join(', ')}</span>}
                              {fld.helpText && <span className="text-zinc-400">💡 {fld.helpText}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleFieldEnabled(fld.id)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${fld.enabled ? 'text-green-400 hover:bg-green-500/10' : 'text-zinc-500 hover:bg-zinc-800'}`}
                              title={fld.enabled ? 'إخفاء الحقل' : 'إظهار الحقل'}
                            >
                              {fld.enabled ? <Eye size={14} /> : <Eye size={14} className="opacity-30" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleFieldRequired(fld.id)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${fld.required ? 'text-amber-400 hover:bg-amber-500/10' : 'text-zinc-500 hover:bg-zinc-800'}`}
                              title={fld.required ? 'الغاء الإلزام' : 'جعل الحقل إلزامي'}
                            >
                              ✦
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditField(fld)}
                              className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                              title="تعديل"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteField(fld.id)}
                              className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                              title="حذف"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>

                <div className="pt-4 border-t border-zinc-850 flex gap-3 justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
                  >
                    <Save size={14} />
                    <span>حفظ جميع الإعدادات</span>
                  </button>
                </div>
              </div>
            </form>

            {/* ADD/EDIT GATEWAY MODAL */}
            <AnimatePresence>
              {showAddGatewayModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                  onClick={() => setShowAddGatewayModal(false)}
                >
                  <motion.div
                    initial={{ y: 20, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 20, opacity: 0, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-lg space-y-5 max-h-[90vh] overflow-y-auto"
                    dir="rtl"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-bold text-base">
                        {editingGatewayId ? 'تعديل بوابة دفع' : 'إضافة بوابة دفع جديدة'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowAddGatewayModal(false)}
                        className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-zinc-300 text-[11px] font-bold mb-1.5">نوع بوابة الدفع *</label>
                        <select
                          value={newGwType}
                          onChange={(e) => setNewGwType(e.target.value as PaymentGatewayType)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="cod">الدفع عند الاستلام (COD)</option>
                          <option value="vodafoneCash">فودافون كاش</option>
                          <option value="instapay">إنستا باي (InstaPay)</option>
                          <option value="etisalatCash">اتصالات كاش (Etisalat Cash)</option>
                          <option value="orangeMoney">أورانج ماني (Orange Money)</option>
                          <option value="bankTransfer">تحويل بنكي</option>
                          <option value="creditCard">بطاقة ائتمان</option>
                          <option value="paypal">PayPal</option>
                          <option value="stripe">Stripe</option>
                          <option value="other">طريقة أخرى</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-zinc-300 text-[11px] font-bold mb-1.5">اسم بوابة الدفع (يظهر للعميل) *</label>
                        <input
                          type="text"
                          placeholder="مثال: الدفع عبر إنستا باي"
                          value={newGwName}
                          onChange={(e) => setNewGwName(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-300 text-[11px] font-bold mb-1.5">الأيقونة / الإيموجي</label>
                        <input
                          type="text"
                          placeholder="مثال: 💙 أو 🏦"
                          value={newGwIcon}
                          onChange={(e) => setNewGwIcon(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      {(newGwType === 'vodafoneCash' || newGwType === 'instapay' || newGwType === 'etisalatCash' || newGwType === 'orangeMoney' || newGwType === 'other') && (
                        <>
                          <div>
                            <label className="block text-zinc-300 text-[11px] font-bold mb-1.5">رقم المحفظة / الرقم الخاص *</label>
                            <input
                              type="text"
                              placeholder="مثال: 01012345678"
                              value={newGwNumber}
                              onChange={(e) => setNewGwNumber(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                              dir="ltr"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-300 text-[11px] font-bold mb-1.5">اسم صاحب الحساب</label>
                            <input
                              type="text"
                              placeholder="مثال: أحمد محمد علي"
                              value={newGwHolder}
                              onChange={(e) => setNewGwHolder(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </>
                      )}

                      {newGwType === 'bankTransfer' && (
                        <>
                          <div>
                            <label className="block text-zinc-300 text-[11px] font-bold mb-1.5">اسم البنك *</label>
                            <input
                              type="text"
                              placeholder="مثال: البنك الأهلي المصري، الراجحي..."
                              value={newGwBankName}
                              onChange={(e) => setNewGwBankName(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-300 text-[11px] font-bold mb-1.5">اسم صاحب الحساب *</label>
                            <input
                              type="text"
                              placeholder="الاسم الكامل كما هو مسجل بالبنك"
                              value={newGwHolder}
                              onChange={(e) => setNewGwHolder(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-300 text-[11px] font-bold mb-1.5">رقم الحساب البنكي / رقم البطاقة</label>
                            <input
                              type="text"
                              placeholder="رقم الحساب أو رقم البطاقة"
                              value={newGwNumber}
                              onChange={(e) => setNewGwNumber(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                              dir="ltr"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-300 text-[11px] font-bold mb-1.5">رقم الآيبان (IBAN)</label>
                            <input
                              type="text"
                              placeholder="مثال: SA0000000000000000000000"
                              value={newGwIban}
                              onChange={(e) => setNewGwIban(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                              dir="ltr"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-300 text-[11px] font-bold mb-1.5">اسم الفرع</label>
                            <input
                              type="text"
                              placeholder="فرع المدينة الرئيسي..."
                              value={newGwBranch}
                              onChange={(e) => setNewGwBranch(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </>
                      )}

                      <div>
                        <label className="block text-zinc-300 text-[11px] font-bold mb-1.5">تعليمات إضافية للعميل</label>
                        <textarea
                          placeholder="مثال: يرجى إرسال صورة إيصال التحويل على واتساب بعد الإتمام..."
                          value={newGwInstructions}
                          onChange={(e) => setNewGwInstructions(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500 resize-none h-20"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddGatewayModal(false)}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl cursor-pointer"
                      >
                        إلغاء
                      </button>
                      <button
                        type="button"
                        onClick={saveGateway}
                        className="px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-blue-500/20"
                      >
                        {editingGatewayId ? 'حفظ التعديلات' : 'إضافة البوابة'}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ADD/EDIT FIELD MODAL */}
            <AnimatePresence>
              {showAddFieldModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                  onClick={() => setShowAddFieldModal(false)}
                >
                  <motion.div
                    initial={{ y: 20, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 20, opacity: 0, scale: 0.95 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-lg space-y-5 max-h-[90vh] overflow-y-auto"
                    dir="rtl"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-bold text-base">
                        {editingFieldId ? 'تعديل حقل في النموذج' : 'إضافة حقل جديد لنموذج الطلب'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowAddFieldModal(false)}
                        className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-zinc-300 text-[11px] font-bold mb-1.5">نوع الحقل *</label>
                          <select
                            value={newFldType}
                            onChange={(e) => setNewFldType(e.target.value as CustomFieldType)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-pink-500"
                          >
                            <option value="text">نص قصير (Text)</option>
                            <option value="textarea">نص طويل (Textarea)</option>
                            <option value="number">رقم (Number)</option>
                            <option value="tel">رقم هاتف (Phone)</option>
                            <option value="email">بريد إلكتروني (Email)</option>
                            <option value="select">قائمة منسدلة (Select)</option>
                            <option value="checkbox">مربع اختيار (Checkbox)</option>
                            <option value="radio">خيارات راديو (Radio)</option>
                            <option value="date">تاريخ (Date)</option>
                            <option value="time">وقت (Time)</option>
                            <option value="file">ملف (File)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-zinc-300 text-[11px] font-bold mb-1.5">اسم الحقل التقني (Name) *</label>
                          <input
                            type="text"
                            placeholder="مثال: full_name, address"
                            value={newFldName}
                            onChange={(e) => setNewFldName(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white font-mono focus:outline-none focus:border-pink-500"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-zinc-300 text-[11px] font-bold mb-1.5">العنوان الذي يظهر للعميل *</label>
                        <input
                          type="text"
                          placeholder="مثال: الاسم الكامل، عنوان التوصيل..."
                          value={newFldLabel}
                          onChange={(e) => setNewFldLabel(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-pink-500"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-300 text-[11px] font-bold mb-1.5">نص داخل الحقل (Placeholder)</label>
                        <input
                          type="text"
                          placeholder="اكتب اسمك الكامل هنا..."
                          value={newFldPlaceholder}
                          onChange={(e) => setNewFldPlaceholder(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-pink-500"
                        />
                      </div>

                      {(newFldType === 'select' || newFldType === 'radio') && (
                        <div>
                          <label className="block text-zinc-300 text-[11px] font-bold mb-1.5">
                            الخيارات (افصل بينها بفاصلة ,)
                          </label>
                          <input
                            type="text"
                            placeholder="الرياض, جدة, الدمام, مكة المكرمة"
                            value={newFldOptions}
                            onChange={(e) => setNewFldOptions(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-pink-500"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-zinc-300 text-[11px] font-bold mb-1.5">القيمة الافتراضية</label>
                        <input
                          type="text"
                          placeholder="اختياري"
                          value={newFldDefault}
                          onChange={(e) => setNewFldDefault(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-pink-500"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-300 text-[11px] font-bold mb-1.5">نص مساعدة أسفل الحقل</label>
                        <input
                          type="text"
                          placeholder="💡 مثال: سيتم استخدام رقم الهاتف للتواصل وتأكيد الطلب"
                          value={newFldHelp}
                          onChange={(e) => setNewFldHelp(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-pink-500"
                        />
                      </div>

                      {(newFldType === 'text' || newFldType === 'textarea' || newFldType === 'tel') && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-zinc-300 text-[11px] font-bold mb-1.5">الحد الأدنى للحروف</label>
                            <input
                              type="number"
                              placeholder="3"
                              value={newFldMinLen}
                              onChange={(e) => setNewFldMinLen(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white font-mono focus:outline-none focus:border-pink-500"
                              dir="ltr"
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-300 text-[11px] font-bold mb-1.5">الحد الأقصى للحروف</label>
                            <input
                              type="number"
                              placeholder="255"
                              value={newFldMaxLen}
                              onChange={(e) => setNewFldMaxLen(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white font-mono focus:outline-none focus:border-pink-500"
                              dir="ltr"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-850">
                        <input
                          type="checkbox"
                          id="fldRequired"
                          checked={newFldRequired}
                          onChange={(e) => setNewFldRequired(e.target.checked)}
                          className="w-4 h-4 accent-pink-500"
                        />
                        <label htmlFor="fldRequired" className="flex-1 text-xs text-zinc-300 cursor-pointer select-none">
                          <span className="font-bold text-white">الحقل إلزامي (Required)</span>
                          <span className="block text-[10px] text-zinc-500 mt-0.5">العميل لن يستطيع إكمال الطلب بدون تعبئة هذا الحقل</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddFieldModal(false)}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl cursor-pointer"
                      >
                        إلغاء
                      </button>
                      <button
                        type="button"
                        onClick={saveField}
                        className="px-5 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white text-xs font-bold rounded-xl cursor-pointer shadow-lg shadow-pink-500/20"
                      >
                        {editingFieldId ? 'حفظ التعديلات' : 'إضافة الحقل للنموذج'}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* STORE BANNERS VIEW */}
        {activeTab === 'banners' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-bold text-white">إدارة بنرات العرض للمحل</h2>
                <p className="text-xs text-zinc-400 mt-1">قم بإدارة وتغيير البنرات الدعائية التي تظهر في الواجهة الخاصة بمتجرك.</p>
              </div>
              {!isAddingBanner && (
                <button
                  onClick={() => setIsAddingBanner(true)}
                  className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl hover:bg-amber-400 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>إضافة بنر عرض جديد</span>
                </button>
              )}
            </div>

            {isAddingBanner && (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!bannerTitle || !bannerImage) {
                    alert('الرجاء كتابة العنوان وإدخال رابط الصورة');
                    return;
                  }
                  const newB: StoreBanner = {
                    id: `sb-${Date.now()}`,
                    image: bannerImage,
                    title: bannerTitle,
                    subtitle: bannerSub,
                    linkToCategory: ''
                  };
                  const updatedBanners = [...(myStore.banners || []), newB];
                  const updatedStores = stores.map(s => {
                    if (s.id === storeId) {
                      return { ...s, banners: updatedBanners };
                    }
                    return s;
                  });
                  syncAndReload(updatedStores, products, orders, coupons);
                  setIsAddingBanner(false);
                  setBannerTitle('');
                  setBannerSub('');
                  setBannerImage('');
                  alert('تمت إضافة بنر العرض بنجاح! 🎉');
                }} 
                className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl space-y-4 text-right"
              >
                <h4 className="text-xs font-bold text-amber-400">إضافة بنر عرض ترويجي للمتجر</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold mb-1">عنوان البنر الرئيسي *</label>
                    <input
                      type="text"
                      placeholder="خصم 20% على شاشات الآيفون"
                      value={bannerTitle}
                      onChange={(e) => setBannerTitle(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold mb-1">وصف فرعي قصير</label>
                    <input
                      type="text"
                      placeholder="بقطع غيار أصلية وضمان 6 أشهر"
                      value={bannerSub}
                      onChange={(e) => setBannerSub(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <ImagePicker
                    type="banner"
                    selectedUrl={bannerImage}
                    onSelect={setBannerImage}
                    label="صورة البنر الجاهزة *"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddingBanner(false)}
                    className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl hover:bg-amber-400"
                  >
                    حفظ وإضافة البنر للمتجر 🌟
                  </button>
                </div>
              </form>
            )}

            {(!myStore.banners || myStore.banners.length === 0) ? (
              <div className="text-center py-12 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl">
                <p className="text-zinc-500 text-xs">لا توجد بنرات عرض مخصصة لمتجرك حالياً.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myStore.banners.map((b) => (
                  <div key={b.id} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between">
                    <div className="aspect-[3/1] bg-zinc-950 relative">
                      <img 
                        src={b.image} 
                        alt={b.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover opacity-60"
                      />
                    </div>
                    <div className="p-4 flex justify-between items-center">
                      <div>
                        <h4 className="text-white text-xs font-bold">{b.title}</h4>
                        {b.subtitle && <p className="text-zinc-500 text-[10px] mt-0.5">{b.subtitle}</p>}
                      </div>
                      <button
                        onClick={() => {
                          const updated = myStore.banners.filter(x => x.id !== b.id);
                          const updatedStores = stores.map(s => {
                            if (s.id === storeId) {
                              return { ...s, banners: updated };
                            }
                            return s;
                          });
                          syncAndReload(updatedStores, products, orders, coupons);
                          alert('تم حذف بنر العرض بنجاح! 🗑️');
                        }}
                        className="p-1.5 hover:bg-zinc-800 text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="حذف البنر"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REPAIRS/MAINTENANCE REQUESTS VIEW */}
        {activeTab === 'repairs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-bold text-white">إدارة طلبات صيانة الهواتف والأجهزة</h2>
                <p className="text-xs text-zinc-400 mt-1">تتبع حالة تصليح وصيانة هواتف العملاء، وسجل عمليات الفحص الفني وتقدير التكلفة.</p>
              </div>
              {!isAddingRepair && (
                <button
                  onClick={() => setIsAddingRepair(true)}
                  className="px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl hover:bg-amber-400 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>تسجيل طلب صيانة جديد</span>
                </button>
              )}
            </div>

            {isAddingRepair && (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!repCustomerName || !repDeviceModel || !repProblem) {
                    alert('الرجاء كتابة اسم العميل، موديل الجهاز، ونوع العطل.');
                    return;
                  }
                  const newRep = {
                    id: `rep-${Date.now()}`,
                    storeId: storeId,
                    customerName: repCustomerName,
                    customerPhone: repCustomerPhone,
                    deviceModel: repDeviceModel,
                    problem: repProblem,
                    cost: Number(repCost),
                    status: repStatus,
                    date: new Date().toISOString().split('T')[0]
                  };
                  const updatedRepairs = [newRep, ...repairs];
                  syncAndReload(stores, products, orders, coupons, updatedRepairs);
                  setIsAddingRepair(false);
                  setRepCustomerName('');
                  setRepCustomerPhone('');
                  setRepDeviceModel('');
                  setRepProblem('');
                  setRepCost(150);
                  setRepStatus('pending');
                  alert('تم تسجيل طلب صيانة وتصليح جهاز العميل بنجاح! 📱⚙️');
                }}
                className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl space-y-4 text-right"
              >
                <h4 className="text-xs font-bold text-amber-400">نموذج استلام هاتف وتصنيفه صيانة</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold mb-1">اسم العميل بالكامل *</label>
                    <input
                      type="text"
                      placeholder="مثال: فيصل بن راشد"
                      value={repCustomerName}
                      onChange={(e) => setRepCustomerName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold mb-1">رقم جوال العميل للاتصال</label>
                    <input
                      type="text"
                      placeholder="مثال: 055xxxxxxx"
                      value={repCustomerPhone}
                      onChange={(e) => setRepCustomerPhone(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold mb-1">موديل ونوع الجهاز *</label>
                    <input
                      type="text"
                      placeholder="مثال: آيفون 15 برو ماكس"
                      value={repDeviceModel}
                      onChange={(e) => setRepDeviceModel(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold mb-1">تكلفة الصيانة التقديرية (ر.س)</label>
                    <input
                      type="number"
                      value={repCost}
                      onChange={(e) => setRepCost(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-xs font-semibold mb-1">الحالة الابتدائية للطلب</label>
                    <select
                      value={repStatus}
                      onChange={(e) => setRepStatus(e.target.value as any)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none cursor-pointer"
                    >
                      <option value="pending">تم الاستلام (قيد الانتظار)</option>
                      <option value="inspecting">قيد الفحص والتشخيص الفني</option>
                      <option value="repairing">قيد الإصلاح والتصليح العملي</option>
                      <option value="completed">جاهز للتسليم للعميل</option>
                      <option value="delivered">تم تسليم الهاتف واستلام المبلغ</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 text-xs font-semibold mb-1">تشخيص العطل والمشكلة بالتفصيل *</label>
                  <textarea
                    placeholder="شاشة مكسورة بالكامل، الجهاز لا يقلع، منفذ الشحن بحاجة لتنظيف أو استبدال كامل..."
                    value={repProblem}
                    onChange={(e) => setRepProblem(e.target.value)}
                    rows={3}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddingRepair(false)}
                    className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 text-black font-bold text-xs rounded-xl hover:bg-amber-400"
                  >
                    حفظ وتسجيل الطلب بالمحل 📱
                  </button>
                </div>
              </form>
            )}

            {repairs.length === 0 ? (
              <div className="text-center py-16 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-3xl">
                <p className="text-zinc-500 text-xs">لا توجد طلبات صيانة مسجلة في هذا المحل حالياً.</p>
              </div>
            ) : (
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-zinc-900/80 border-b border-zinc-850 text-zinc-400">
                      <tr>
                        <th className="p-3">رقم الطلب / العميل</th>
                        <th className="p-3">نوع وموديل الجهاز</th>
                        <th className="p-3">مشكلة العطل المستلم بها</th>
                        <th className="p-3">السعر المتوقع</th>
                        <th className="p-3">حالة تصليح الجهاز</th>
                        <th className="p-3 text-left">تحديثات وتحكم المحل</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850/50 text-zinc-300">
                      {repairs.map(rep => (
                        <tr key={rep.id} className="hover:bg-zinc-900/20 transition-colors">
                          <td className="p-3">
                            <span className="font-bold text-white block">{rep.customerName}</span>
                            <span className="text-[10px] text-zinc-500 font-mono block">{rep.customerPhone || 'لا يوجد جوال'}</span>
                          </td>
                          <td className="p-3 font-semibold text-amber-100">{rep.deviceModel}</td>
                          <td className="p-3 text-zinc-400 max-w-[200px] truncate" title={rep.problem}>{rep.problem}</td>
                          <td className="p-3 font-mono font-bold text-white">{rep.cost} ر.س</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                              rep.status === 'pending'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : rep.status === 'inspecting'
                                ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                : rep.status === 'repairing'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : rep.status === 'completed'
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}>
                              {rep.status === 'pending' && 'تم الاستلام بقيد الانتظار'}
                              {rep.status === 'inspecting' && 'قيد التشخيص والفحص'}
                              {rep.status === 'repairing' && 'قيد التصليح والصيانة'}
                              {rep.status === 'completed' && 'جاهز ومكتمل للتسليم'}
                              {rep.status === 'delivered' && 'تم تسليمه للمشترك والمحاسبة'}
                            </span>
                          </td>
                          <td className="p-3 text-left">
                            <div className="flex gap-1 justify-end items-center">
                              <select
                                value={rep.status}
                                onChange={(e) => {
                                  const updated = repairs.map(x => {
                                    if (x.id === rep.id) {
                                      return { ...x, status: e.target.value };
                                    }
                                    return x;
                                  });
                                  syncAndReload(stores, products, orders, coupons, updated);
                                }}
                                className="bg-zinc-950 border border-zinc-800 rounded py-1 px-1.5 text-[10px] text-zinc-300 focus:outline-none cursor-pointer"
                              >
                                <option value="pending">انتظار</option>
                                <option value="inspecting">تشخيص</option>
                                <option value="repairing">تصليح</option>
                                <option value="completed">جاهز</option>
                                <option value="delivered">مسلّم</option>
                              </select>

                              <button
                                onClick={() => {
                                  if (confirm('هل أنت متأكد من رغبتك في حذف طلب الصيانة هذا؟')) {
                                    const updated = repairs.filter(x => x.id !== rep.id);
                                    syncAndReload(stores, products, orders, coupons, updated);
                                  }
                                }}
                                className="p-1 hover:bg-zinc-800 text-red-500 rounded transition-colors cursor-pointer"
                                title="حذف الطلب"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CATEGORIES MANAGEMENT VIEW */}
        {activeTab === 'categories' && (
          <div className="space-y-6 text-right font-sans" dir="rtl">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-bold text-white">إدارة أقسام المتجر (Categories)</h2>
                <p className="text-xs text-zinc-400 mt-1">أنشئ أقساماً جديدة، عَدِّل اسمها وصورتها، وأظهرها أو أخفها بنقرة واحدة.</p>
              </div>
              <button
                onClick={() => {
                  const name = prompt('أدخل اسم القسم الجديد:');
                  if (!name) return;
                  const currentCats = myStore?.categories || [];
                  if (currentCats.includes(name)) {
                    alert('القسم موجود بالفعل');
                    return;
                  }
                  const updatedStores = stores.map(s => s.id === storeId ? { ...s, categories: [...currentCats, name] } : s);
                  syncAndReload(updatedStores, products, orders, coupons);
                  alert('تمت إضافة القسم بنجاح! 📂');
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} /> إضافة قسم جديد
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(myStore?.categories || ['هواتف جديدة', 'هواتف مستعملة', 'صيانة وأعطال', 'إكسسوارات وكفرات', 'عروض سريعة']).map((cat, i) => (
                <div key={i} className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl text-lg">📂</span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{cat}</h4>
                      <span className="text-[10px] text-zinc-500">{products.filter(p => p.category === cat).length} منتج</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const newName = prompt('تعديل اسم القسم:', cat);
                        if (!newName || newName === cat) return;
                        const updatedCats = (myStore?.categories || []).map(c => c === cat ? newName : c);
                        const updatedProducts = products.map(p => p.category === cat ? { ...p, category: newName } : p);
                        const updatedStores = stores.map(s => s.id === storeId ? { ...s, categories: updatedCats } : s);
                        syncAndReload(updatedStores, updatedProducts, orders, coupons);
                        alert('تمت مراجعة اسم القسم وتعديله! ✏️');
                      }}
                      className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="تعديل"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (!confirm(`هل تريد حذف قسم "${cat}"؟`)) return;
                        const updatedCats = (myStore?.categories || []).filter(c => c !== cat);
                        const updatedStores = stores.map(s => s.id === storeId ? { ...s, categories: updatedCats } : s);
                        syncAndReload(updatedStores, products, orders, coupons);
                        alert('تم حذف القسم! 🗑️');
                      }}
                      className="p-1.5 hover:bg-zinc-800 text-red-400 rounded-lg transition-colors cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CUSTOM ORDER FORM BUILDER VIEW */}
        {activeTab === 'order_form' && (
          <div className="space-y-6 text-right font-sans" dir="rtl">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-bold text-white">إدارة نموذج الطلب المخصص (Order Form Builder)</h2>
                <p className="text-xs text-zinc-400 mt-1">أضف حقولاً مخصصة تظهر للعميل عند النقر على المنتجات والشراء (الاسم، الهاتف، المحافظة، المقاس، اللون، إلخ).</p>
              </div>
              <button
                onClick={() => {
                  setEditingFieldId(null);
                  setNewFldType('text');
                  setNewFldLabel('');
                  setNewFldName('');
                  setNewFldPlaceholder('');
                  setNewFldRequired(true);
                  setNewFldOptions('');
                  setNewFldHelp('');
                  setShowAddFieldModal(true);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} /> إضافة حقل مخصص جديد
              </button>
            </div>

            <div className="space-y-3">
              {(customCheckoutFields.length > 0 ? customCheckoutFields : [
                { id: 'f-name', name: 'name', label: 'الاسم بالكامل', type: 'text' as const, required: true, enabled: true, order: 1 },
                { id: 'f-phone', name: 'phone', label: 'رقم الهاتف / الواتساب', type: 'tel' as const, required: true, enabled: true, order: 2 },
                { id: 'f-gov', name: 'governorate', label: 'المحافظة', type: 'text' as const, required: true, enabled: true, order: 3 },
                { id: 'f-city', name: 'city', label: 'المدينة / المنطقة', type: 'text' as const, required: true, enabled: true, order: 4 },
                { id: 'f-address', name: 'address', label: 'العنوان التفصيلي', type: 'textarea' as const, required: true, enabled: true, order: 5 },
                { id: 'f-qty', name: 'quantity', label: 'الكمية المطلوب شراءها', type: 'number' as const, required: true, enabled: true, order: 6 },
                { id: 'f-color', name: 'color', label: 'اللون المطلوب', type: 'text' as const, required: false, enabled: true, order: 7 },
                { id: 'f-size', name: 'size', label: 'المقاس / السعة', type: 'text' as const, required: false, enabled: true, order: 8 },
                { id: 'f-notes', name: 'notes', label: 'ملاحظات إضافية للتاجر', type: 'textarea' as const, required: false, enabled: true, order: 9 }
              ]).map((fld, i) => (
                <div key={fld.id || i} className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-zinc-800 text-amber-400 font-mono text-xs font-bold rounded-lg">{i + 1}</span>
                    <div>
                      <h4 className="text-xs font-extrabold text-white flex items-center gap-2">
                        {fld.label}
                        {fld.required ? <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded">إجباري *</span> : <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">اختياري</span>}
                      </h4>
                      <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">نوع الحقل: {fld.type} | كود الحقل: {fld.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const updatedFields = customCheckoutFields.map(f => f.id === fld.id ? { ...f, required: !f.required } : f);
                        setCustomCheckoutFields(updatedFields);
                        const updatedStores = stores.map(s => s.id === storeId ? { ...s, customCheckoutFields: updatedFields } : s);
                        syncAndReload(updatedStores, products, orders, coupons);
                      }}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold rounded-lg cursor-pointer"
                    >
                      {fld.required ? 'جعله اختيارياً' : 'جعله إجبارياً'}
                    </button>
                    <button
                      onClick={() => {
                        if (!confirm(`هل تريد حذف حقل "${fld.label}"؟`)) return;
                        const updatedFields = customCheckoutFields.filter(f => f.id !== fld.id);
                        setCustomCheckoutFields(updatedFields);
                        const updatedStores = stores.map(s => s.id === storeId ? { ...s, customCheckoutFields: updatedFields } : s);
                        syncAndReload(updatedStores, products, orders, coupons);
                        alert('تم حذف الحقل المخصص! 🗑️');
                      }}
                      className="p-1.5 hover:bg-zinc-800 text-red-400 rounded-lg transition-colors cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CLASSIFICATIONS & TEMPLATES VIEW */}
        {activeTab === 'templates' && (
          <div className="space-y-6 text-right font-sans" dir="rtl">
            <div>
              <h2 className="text-lg font-bold text-white">تخصيص القالب والنشاط التجارية للمتجر</h2>
              <p className="text-xs text-zinc-400 mt-1">اختر نشاط المتجر لتطبيق التنسيق الاحترافي المتخصص (مثال: صيانة الهواتف وبيع الهواتف).</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'mobile', name: 'قالب صيانة الهواتف وبيع الهواتف 📱', desc: 'قالب متكامل يضم كافة أقسام صيانة الجوالات، الهواتف الجديدة والمستعملة، حجز الأعطال، والإكسسوارات.' },
                { id: 'clothing', name: 'قالب الملابس والأزياء 🧥', desc: 'مخصص للموضة والبوتيك مع معرض أزياء وسلايدر فخم.' },
                { id: 'perfume', name: 'قالب العطور والجمال ✨', desc: 'تصميم راقٍ للعطور ومستحضرات التجميل.' },
                { id: 'multicategory', name: 'قالب متعدد الأقسام العام 🛍️', desc: 'قالب مرن يناسب المحلات الشاملة.' }
              ].map(tpl => (
                <div 
                  key={tpl.id}
                  onClick={() => {
                    setVisualTemplate(tpl.id as any);
                    const updatedStores = stores.map(s => s.id === storeId ? { ...s, visualTemplate: tpl.id } : s);
                    syncAndReload(updatedStores, products, orders, coupons);
                    alert(`تم تغيير قالب متجرك ونشاطه إلى "${tpl.name}" بنجاح! 🎨`);
                  }}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${visualTemplate === tpl.id ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'}`}
                >
                  <h4 className="text-sm font-black text-white">{tpl.name}</h4>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">{tpl.desc}</p>
                  {visualTemplate === tpl.id && <span className="inline-block mt-3 text-[10px] bg-amber-500 text-black font-black px-2 py-0.5 rounded-full">✓ النشاط الحالي الفعال</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS VIEW */}
        {(activeTab === 'settings' || activeTab === 'theme_colors' || activeTab === 'classifications' || activeTab === 'customers' || activeTab === 'pages' || activeTab === 'ads' || activeTab === 'offers' || activeTab === 'shipping' || activeTab === 'sliders' || activeTab === 'videos') && (
          <div className="space-y-6 text-right font-sans" dir="rtl">
            <div>
              <h2 className="text-lg font-bold text-white">إعدادات الهوية والواجهة الكاملة</h2>
              <p className="text-xs text-zinc-400 mt-1">تخصيص كامل لألوان المتجر، الخطوط، بيانات الاتصال، معلومات الشحن والعروض.</p>
            </div>

            <form onSubmit={handleSaveBranding} className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold mb-1">اسم المتجر الرسمي *</label>
                  <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400" required />
                </div>
                <div>
                  <label className="block text-zinc-400 text-xs font-semibold mb-1">عملة المتجر</label>
                  <input type="text" value={currency} onChange={(e) => setCurrency(e.target.value)} placeholder="جنيه / ر.س / USD" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400 font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 text-xs font-semibold mb-1">الوصف التعريفية للمتجر (SEO)</label>
                <textarea rows={3} value={storeDesc} onChange={(e) => setStoreDesc(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400 resize-none" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImagePicker type="logo" selectedUrl={storeLogo} onSelect={setStoreLogo} label="شعار المتجر (اللوجو)" />
                <ImagePicker type="banner" selectedUrl={storeCover} onSelect={setStoreCover} label="صورة غلاف المتجر (Banner)" />
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end">
                <button type="submit" className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer">
                  حفظ كافة التغييرات مباشرة ⚡
                </button>
              </div>
            </form>
          </div>
        )}

        {/* CHAT VIEW */}
        {activeTab === 'chat' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">الدردشة مع العملاء</h2>
              <p className="text-xs text-zinc-400 mt-1">تواصل مباشر مع عملائك، أرسل واستقبل الرسائل والصور في الوقت الفعلي.</p>
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden" style={{ height: 'calc(100vh - 300px)' }}>
              {(() => {
                const merchantUser: UserType = {
                  id: storeId,
                  name: myStore.name || 'تاجر',
                  email: '',
                  password: '',
                  role: 'merchant'
                };
                return (
                  <ChatPanel
                    isOpen={true}
                    onClose={() => setActiveTab('stats')}
                    currentUser={merchantUser}
                    storeId={storeId}
                    storeName={myStore.name}
                    storeLogo={myStore.logo}
                  />
                );
              })()}
            </div>
          </div>
        )}

      </div>
      
    </div>
  );
}
