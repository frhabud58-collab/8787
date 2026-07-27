import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Trash2, Plus, Minus, Tag, Check, Sparkles, CreditCard, Smartphone, Building2, Banknote } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Coupon, Store } from '../types';
import { fbSync, saveLocal } from '../lib/firebaseSync';

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  image: string;
  quantity: number;
  storeId: string;
  storeName: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  number: string;
  ownerName: string;
  bankName?: string;
  cardImage?: string;
  active: boolean;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  coupons: Coupon[];
  stores?: Store[];
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  coupons,
  stores
}: CartDrawerProps) {
  const { t, i18n } = useTranslation();
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'payment' | 'success'>('cart');
  
  // Checkout details form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  
  // Payment method
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  // Load payment methods from admin settings
  useEffect(() => {
    try {
      const methods = JSON.parse(localStorage.getItem('mix_payment_methods') || '[]');
      setPaymentMethods(methods.filter((m: PaymentMethod) => m.active));
    } catch { setPaymentMethods([]); }
  }, [isOpen]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Helper to get currency for a specific store
  const getStoreCurrency = (storeId: string) => {
    const st = stores?.find(s => s.id === storeId);
    return st?.currency || (i18n.language === 'en' ? 'EGP' : 'جنيه');
  };

  const primaryStoreId = cartItems[0]?.storeId;
  const currencySymbol = primaryStoreId ? getStoreCurrency(primaryStoreId) : (i18n.language === 'en' ? 'EGP' : 'جنيه');

  // Apply Coupon
  const handleApplyCoupon = () => {
    setCouponError('');
    if (!couponCode.trim()) return;

    const codeUpper = couponCode.trim().toUpperCase();
    
    // Find coupon in database
    const found = coupons.find(c => c.code === codeUpper && c.active);
    
    if (!found) {
      setCouponError('كوبون غير صحيح أو منتهي الصلاحية');
      setActiveCoupon(null);
      return;
    }

    if (subtotal < found.minOrderValue) {
      setCouponError(`الحد الأدنى لاستخدام الكوبون هو ${found.minOrderValue} ${getStoreCurrency(found.storeId)}`);
      setActiveCoupon(null);
      return;
    }

    // Check if store matches
    const isGlobal = found.storeId === 'all';
    const matchesStore = cartItems.some(item => item.storeId === found.storeId);

    if (!isGlobal && !matchesStore) {
      setCouponError('هذا الكوبون غير مخصص للمنتجات الموجودة بسلتك');
      setActiveCoupon(null);
      return;
    }

    setActiveCoupon(found);
  };

  const calculateDiscount = () => {
    if (!activeCoupon) return 0;
    if (activeCoupon.discountType === 'percent') {
      // Calculate based on items matching the store, or global
      const discountableSum = activeCoupon.storeId === 'all' 
        ? subtotal 
        : cartItems.reduce((acc, item) => item.storeId === activeCoupon.storeId ? acc + (item.price * item.quantity) : acc, 0);
      
      return Math.round((discountableSum * activeCoupon.value) / 100);
    } else {
      return activeCoupon.value;
    }
  };

  const discount = calculateDiscount();
  const deliveryFee = subtotal > 0 ? 25 : 0;
  const total = subtotal - discount + deliveryFee;

  // Group items by store for beautiful layout
  const groupedItems = cartItems.reduce((acc, item) => {
    if (!acc[item.storeId]) {
      acc[item.storeId] = {
        storeName: item.storeName,
        items: []
      };
    }
    acc[item.storeId].items.push(item);
    return acc;
  }, {} as Record<string, { storeName: string; items: CartItem[] }>);

  // Handle Checkout Submission
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      alert('الرجاء تعبئة البيانات الأساسية للشحن');
      return;
    }
    // Go to payment step
    setCheckoutStep('payment');
  };

  const handlePlaceOrder = () => {

    // Group cart items and create separate orders for each store
    const storeIds: string[] = Array.from(new Set(cartItems.map(item => item.storeId)));
    
    try {
      const storedOrders = JSON.parse(localStorage.getItem('mix_orders') || '[]');
      
      // Get payment method label
      const paymentLabel = selectedPayment === 'cod' ? 'الدفع عند الاستلام' :
        selectedPayment === 'card' ? 'بطاقة ائتمان' :
        paymentMethods.find(m => m.id === selectedPayment)?.type === 'vodafone_cash' ? 'فودافون كاش' :
        paymentMethods.find(m => m.id === selectedPayment)?.type === 'instapay' ? 'انستا بي' :
        paymentMethods.find(m => m.id === selectedPayment)?.bankName || 'تحويل بنكي';

      storeIds.forEach(storeId => {
        const storeItems = cartItems.filter(item => item.storeId === storeId);
        const storeSubtotal = storeItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        
        // Calculate proportional discount for this store
        let storeDiscount = 0;
        if (activeCoupon) {
          if (activeCoupon.storeId === storeId) {
            storeDiscount = discount;
          } else if (activeCoupon.storeId === 'all') {
            storeDiscount = Math.round((storeSubtotal / subtotal) * discount);
          }
        }

        const newOrder = {
          id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
          storeId: storeId,
          storeName: storeItems[0].storeName,
          customerName: name,
          customerEmail: email || 'customer@mix.com',
          customerPhone: phone,
          customerAddress: address,
          paymentMethod: paymentLabel,
          items: storeItems.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            image: item.image
          })),
          total: storeSubtotal - storeDiscount + 15,
          status: 'pending',
          date: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };

        storedOrders.unshift(newOrder);

        // Update Store's Sales Count
        const currentStores = JSON.parse(localStorage.getItem('mix_stores') || '[]');
        const updatedStores = currentStores.map((s: any) => {
          if (s.id === storeId) {
            return {
              ...s,
              salesCount: (s.salesCount || 0) + storeItems.reduce((acc, current) => acc + current.quantity, 0)
            };
          }
          return s;
        });
        saveLocal('mix_stores', updatedStores);
      });

      saveLocal('mix_orders', storedOrders);
    } catch (e) {
      console.error(e);
    }

    // Sync orders + stores to Firestore and dispatch events
    try {
      const freshOrders = JSON.parse(localStorage.getItem('mix_orders') || '[]');
      const freshStores = JSON.parse(localStorage.getItem('mix_stores') || '[]');
      // Save only the NEW orders (the ones we just created)
      const newOrders = freshOrders.filter((o: any) => storeIds.includes(o.storeId));
      for (const order of newOrders) {
        fbSync.saveOrder(order).catch(() => {});
      }
      for (const sid of storeIds) {
        const st = freshStores.find((s: any) => s.id === sid);
        if (st) fbSync.saveStore(st).catch(() => {});
      }
    } catch {}

    // Dispatch events so all dashboards update immediately
    window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_orders' } }));
    window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_stores' } }));
    window.dispatchEvent(new CustomEvent(`mix-realtime-mix_orders`, { detail: { data: JSON.parse(localStorage.getItem('mix_orders') || '[]') } }));
    window.dispatchEvent(new CustomEvent(`mix-realtime-mix_stores`, { detail: { data: JSON.parse(localStorage.getItem('mix_stores') || '[]') } }));

    setCheckoutStep('success');
  };

  const handleFinish = () => {
    onClearCart();
    setCheckoutStep('cart');
    setActiveCoupon(null);
    setCouponCode('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Drawer panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md bg-zinc-950 border-r border-amber-500/10 h-full flex flex-col shadow-2xl z-10"
          dir="rtl"
        >
          {/* Header */}
          <div className="p-4 border-b border-zinc-900 flex items-center justify-between">
            <button 
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-amber-400 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-2">
              <ShoppingBag className="text-amber-400 w-5 h-5" />
              <h3 className="text-lg font-bold text-white">سلة التسوق الموحدة (MIX)</h3>
            </div>
          </div>

          {checkoutStep === 'cart' && (
            <>
              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <ShoppingBag size={48} className="text-zinc-700 mb-4 animate-bounce" />
                    <p className="text-zinc-400 font-medium">سلتك فارغة تماماً</p>
                    <p className="text-zinc-600 text-xs mt-1">تصفح المحلات وأضف منتجاتك المميزة الآن</p>
                    <button
                      onClick={onClose}
                      className="mt-4 px-5 py-2 bg-amber-500 text-black font-bold text-xs rounded-lg hover:bg-amber-400 transition-colors cursor-pointer"
                    >
                      استكشف المحلات الآن
                    </button>
                  </div>
                ) : (
                  Object.entries(groupedItems).map(([storeId, group]) => (
                    <div key={storeId} className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl overflow-hidden">
                      {/* Store Sub-header */}
                      <div className="bg-zinc-900 px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
                        <span className="text-amber-400 text-xs font-bold">🛒 {group.storeName}</span>
                        <span className="text-[10px] bg-zinc-800 text-zinc-400 py-0.5 px-1.5 rounded">متجر مستقل</span>
                      </div>
                      
                      {/* Store Items */}
                      <div className="divide-y divide-zinc-800/50">
                        {group.items.map(item => (
                          <div key={item.productId} className="p-3 flex gap-3 items-center">
                            <img
                              src={item.image}
                              alt={item.productName}
                              referrerPolicy="no-referrer"
                              className="w-14 h-14 rounded-lg object-cover bg-zinc-800 border border-zinc-800"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white text-xs font-semibold truncate">{item.productName}</h4>
                              <p className="text-amber-400 text-xs font-bold mt-1">
                                {item.price} <span className="text-[10px] font-normal">{getStoreCurrency(item.storeId)}</span>
                              </p>
                            </div>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg p-1">
                              <button
                                onClick={() => onUpdateQuantity(item.productId, -1)}
                                className="text-zinc-400 hover:text-white p-0.5 cursor-pointer"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-white text-xs font-semibold min-w-[12px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(item.productId, 1)}
                                className="text-zinc-400 hover:text-white p-0.5 cursor-pointer"
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            <button
                              onClick={() => onRemoveItem(item.productId)}
                              className="text-zinc-500 hover:text-red-400 p-1 cursor-pointer transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cartItems.length > 0 && (
                /* Coupon & Summary Footer */
                <div className="p-4 bg-zinc-900/90 border-t border-zinc-800 space-y-4">
                  {/* Coupon Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-400 font-medium">كوبون الخصم (جرب: TECH10 أو OUD15)</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="أدخل كود الكوبون"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 pl-8 text-xs text-white focus:outline-none focus:border-amber-400 text-right font-mono"
                        />
                        <Tag className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                      </div>
                      <button
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        تطبيق
                      </button>
                    </div>
                    {couponError && <p className="text-red-400 text-[10px] text-right">{couponError}</p>}
                    {activeCoupon && (
                      <p className="text-green-400 text-[10px] text-right flex items-center gap-1 justify-end">
                        <Check size={12} />
                        <span>تم تطبيق خصم الكوبون بقيمة {activeCoupon.value}{activeCoupon.discountType === 'percent' ? '%' : ` ${currencySymbol}`}</span>
                      </p>
                    )}
                  </div>

                  {/* Pricing Details */}
                  <div className="space-y-1.5 border-t border-zinc-800 pt-3 text-xs text-zinc-400">
                    <div className="flex justify-between">
                      <span>مجموع المنتجات:</span>
                      <span className="text-white font-medium">{subtotal} {currencySymbol}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>قيمة الخصم:</span>
                        <span>-{discount} {currencySymbol}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>رسوم التوصيل والشحن:</span>
                      <span className="text-white font-medium">{deliveryFee} {currencySymbol}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-amber-400 border-t border-zinc-800 pt-2">
                      <span>الإجمالي النهائي:</span>
                      <span>{total} {currencySymbol}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setCheckoutStep('details')}
                    className="w-full py-3 bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 hover:from-yellow-500 hover:to-amber-400 text-black font-bold text-sm rounded-xl transition-all cursor-pointer text-center"
                  >
                    متابعة عملية الشحن والدفع
                  </button>
                </div>
              )}
            </>
          )}

          {checkoutStep === 'details' && (
            <form onSubmit={handleCheckout} className="flex-1 flex flex-col justify-between p-4 overflow-y-auto">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-amber-400 mb-2 border-b border-zinc-800 pb-2">📋 تفاصيل الشحن والتوصيل الفوري</h4>
                
                <div>
                  <label className="block text-zinc-300 text-xs font-semibold mb-1">اسم المستلم الكامل *</label>
                  <input
                    type="text"
                    placeholder="فهد الحربي"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400 text-right"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 text-xs font-semibold mb-1">رقم جوال المستلم *</label>
                  <input
                    type="text"
                    placeholder="05xxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400 text-left"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 text-xs font-semibold mb-1">عنوان التوصيل التفصيلي *</label>
                  <textarea
                    placeholder="المدينة، الحي، الشارع، ورقم المبنى"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400 text-right"
                    required
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 text-xs font-semibold mb-1">البريد الإلكتروني (اختياري)</label>
                  <input
                    type="email"
                    placeholder="customer@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400 text-left"
                  />
                </div>

                <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-xs text-zinc-400 space-y-1">
                  <p className="text-amber-400 font-bold mb-1">ℹ️ معلومات الدفع والتسليم:</p>
                  <p>• الدفع متاح عبر ميزة "الدفع عند الاستلام" أو البطاقة الائتمانية.</p>
                  <p>• سوف يتم تحويل طلبيتك تلقائياً للتاجر المعني بكل متجر لتجهيزها فوراً.</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-900">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>الإجمالي شامل الشحن:</span>
                  <span className="text-white font-bold">{total} {currencySymbol}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('cart')}
                    className="py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
                  >
                    العودة للسلة
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 bg-gradient-to-r from-yellow-600 to-amber-500 text-black font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
                  >
                    اختيار طريقة الدفع 💳
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* PAYMENT METHOD STEP */}
          {checkoutStep === 'payment' && (
            <div className="flex-1 flex flex-col p-4 overflow-y-auto">
              <div className="space-y-4 flex-1">
                <h4 className="text-sm font-bold text-amber-400 mb-2 border-b border-zinc-800 pb-2">💳 طريقة الدفع</h4>
                
                {/* COD - الدفع عند الاستلام */}
                <button
                  type="button"
                  onClick={() => setSelectedPayment('cod')}
                  className={`w-full p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
                    selectedPayment === 'cod'
                      ? 'border-amber-400 bg-amber-500/10 shadow-md shadow-amber-500/5'
                      : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/40'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedPayment === 'cod' ? 'bg-amber-500/20' : 'bg-zinc-800'
                  }`}>
                    <Banknote size={20} className={selectedPayment === 'cod' ? 'text-amber-400' : 'text-zinc-500'} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-bold ${selectedPayment === 'cod' ? 'text-amber-400' : 'text-white'}`}>الدفع عند الاستلام</p>
                    <p className="text-[9px] text-zinc-500 mt-0.5">ادفع عند استلام طلبك</p>
                  </div>
                  {selectedPayment === 'cod' && <Check size={16} className="text-amber-400" />}
                </button>

                {/* Vodafone Cash */}
                {paymentMethods.filter(m => m.type === 'vodafone_cash').map(method => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedPayment(method.id)}
                    className={`w-full p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
                      selectedPayment === method.id
                        ? 'border-red-500 bg-red-500/10 shadow-md shadow-red-500/5'
                        : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedPayment === method.id ? 'bg-red-500/20' : 'bg-zinc-800'
                    }`}>
                      <Smartphone size={20} className={selectedPayment === method.id ? 'text-red-400' : 'text-zinc-500'} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs font-bold ${selectedPayment === method.id ? 'text-red-400' : 'text-white'}`}>فودافون كاش</p>
                      <p className="text-[9px] text-zinc-500 mt-0.5" dir="ltr">{method.number}</p>
                    </div>
                    {selectedPayment === method.id && <Check size={16} className="text-red-400" />}
                  </button>
                ))}

                {/* InstaPay */}
                {paymentMethods.filter(m => m.type === 'instapay').map(method => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedPayment(method.id)}
                    className={`w-full p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
                      selectedPayment === method.id
                        ? 'border-purple-500 bg-purple-500/10 shadow-md shadow-purple-500/5'
                        : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedPayment === method.id ? 'bg-purple-500/20' : 'bg-zinc-800'
                    }`}>
                      <Smartphone size={20} className={selectedPayment === method.id ? 'text-purple-400' : 'text-zinc-500'} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs font-bold ${selectedPayment === method.id ? 'text-purple-400' : 'text-white'}`}>انستا بي</p>
                      <p className="text-[9px] text-zinc-500 mt-0.5">{method.ownerName}</p>
                    </div>
                    {selectedPayment === method.id && <Check size={16} className="text-purple-400" />}
                  </button>
                ))}

                {/* Bank Transfer */}
                {paymentMethods.filter(m => m.type === 'bank').map(method => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedPayment(method.id)}
                    className={`w-full p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
                      selectedPayment === method.id
                        ? 'border-cyan-500 bg-cyan-500/10 shadow-md shadow-cyan-500/5'
                        : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedPayment === method.id ? 'bg-cyan-500/20' : 'bg-zinc-800'
                    }`}>
                      <Building2 size={20} className={selectedPayment === method.id ? 'text-cyan-400' : 'text-zinc-500'} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs font-bold ${selectedPayment === method.id ? 'text-cyan-400' : 'text-white'}`}>{method.bankName || 'تحويل بنكي'}</p>
                      <p className="text-[9px] text-zinc-500 mt-0.5">{method.ownerName}</p>
                    </div>
                    {selectedPayment === method.id && <Check size={16} className="text-cyan-400" />}
                  </button>
                ))}

                {/* Credit Card */}
                <button
                  type="button"
                  onClick={() => setSelectedPayment('card')}
                  className={`w-full p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center gap-3 ${
                    selectedPayment === 'card'
                      ? 'border-blue-500 bg-blue-500/10 shadow-md shadow-blue-500/5'
                      : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/40'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedPayment === 'card' ? 'bg-blue-500/20' : 'bg-zinc-800'
                  }`}>
                    <CreditCard size={20} className={selectedPayment === 'card' ? 'text-blue-400' : 'text-zinc-500'} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-bold ${selectedPayment === 'card' ? 'text-blue-400' : 'text-white'}`}>بطاقة ائتمان</p>
                    <p className="text-[9px] text-zinc-500 mt-0.5">Visa / Mastercard</p>
                  </div>
                  {selectedPayment === 'card' && <Check size={16} className="text-blue-400" />}
                </button>

                {paymentMethods.length === 0 && (
                  <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-[10px] text-zinc-500 text-center">
                    لا توجد بوابات دفع مفعلة. الدفع عند الاستلام متاح دائماً.
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-900">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>الإجمالي شامل الشحن:</span>
                  <span className="text-white font-bold">{total} {currencySymbol}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('details')}
                    className="py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
                  >
                    العودة
                  </button>
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    className="py-2.5 bg-gradient-to-r from-yellow-600 to-amber-500 text-black font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
                  >
                    تأكيد الطلب 🚀
                  </button>
                </div>
              </div>
            </div>
          )}

          {checkoutStep === 'success' && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-xl animate-pulse" />
                <div className="relative bg-zinc-900 border-2 border-amber-400/50 rounded-full p-5 mb-6 text-amber-400 animate-bounce">
                  <Sparkles size={40} />
                </div>
              </div>
              
              <h4 className="text-xl font-bold text-white mb-2">🎉 تم إرسال طلبياتك بنجاح!</h4>
              <p className="text-zinc-400 text-xs max-w-xs leading-relaxed mb-6">
                شكرًا لتسوقك من سنتر **MIX** الإلكتروني الموحد. 
                تم إرسال الطلبات إلى المتاجر المعنية بنجاح، وسيتواصل معك التاجر مباشرة للشحن والتسليم.
              </p>

              <div className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 mb-6 text-right text-xs text-zinc-400 space-y-1">
                <p className="text-amber-400 font-bold mb-1">📌 تفاصيل التوصيل:</p>
                <p>• العميل: {name}</p>
                <p>• الجوال: {phone}</p>
                <p>• العنوان: {address}</p>
              </div>

              <button
                onClick={handleFinish}
                className="w-full py-3 bg-amber-500 text-black font-bold text-sm rounded-xl hover:bg-amber-400 transition-all cursor-pointer"
              >
                العودة للتسوق واستكشاف المتاجر
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
