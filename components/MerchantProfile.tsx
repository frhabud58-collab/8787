import React, { useState } from 'react';
import { User, Store, Order } from '../types';
import { Store as StoreIcon, Package, TrendingUp, MapPin, Phone, Mail, LogOut, Star, ShoppingBag, DollarSign, Users, Settings, ExternalLink } from 'lucide-react';

interface MerchantProfileProps {
  user: User;
  store: Store | undefined;
  orders: Order[];
  onClose: () => void;
  onLogout: () => void;
  onViewDashboard: () => void;
  onViewStore: () => void;
}

export default function MerchantProfile({ user, store, orders, onClose, onLogout, onViewDashboard, onViewStore }: MerchantProfileProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'store' | 'info'>('stats');
  
  const myOrders = orders.filter(o => store && o.storeId === store.id);
  const completedOrders = myOrders.filter(o => o.status === 'delivered');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  
  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-[#111111] border border-[#2A2A2A] rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden animate-tab-fade flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-b from-[#D4A63D]/10 to-transparent px-5 py-6 text-center border-b border-[#2A2A2A]">
          {store?.logo ? (
            <img src={store.logo} alt="" className="w-16 h-16 rounded-xl object-cover border-2 border-[#D4A63D]/30 mx-auto mb-3" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-[#D4A63D]/20 border-2 border-[#D4A63D]/30 flex items-center justify-center mx-auto mb-3">
              <StoreIcon size={28} className="text-[#D4A63D]" />
            </div>
          )}
          <h2 className="text-white font-bold text-sm">{store?.name || user.name}</h2>
          <p className="text-zinc-500 text-[10px] mt-0.5">{store?.category} • {store?.city}</p>
          <div className="flex justify-center gap-3 mt-3">
            <span className="text-[9px] bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full font-bold flex items-center gap-1">
              <Star size={10} className="text-[#D4A63D]" /> {store?.rating?.toFixed(1) || '0'}
            </span>
            <span className="text-[9px] bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full font-bold">
              {myOrders.length} طلب
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#2A2A2A]">
          {[
            { id: 'stats', label: 'إحصائيات', icon: TrendingUp },
            { id: 'store', label: 'المتجر', icon: StoreIcon },
            { id: 'info', label: 'بياناتي', icon: Users },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[11px] font-bold transition-all cursor-pointer ${
                  activeTab === tab.id 
                    ? 'text-[#D4A63D] border-b-2 border-[#D4A63D]' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'stats' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-900/50 border border-[#2A2A2A] rounded-xl p-3 text-center">
                  <DollarSign size={18} className="text-[#D4A63D] mx-auto mb-1" />
                  <p className="text-white text-lg font-black">{totalRevenue}</p>
                  <p className="text-zinc-500 text-[9px]">إجمالي المبيعات (ج.م)</p>
                </div>
                <div className="bg-zinc-900/50 border border-[#2A2A2A] rounded-xl p-3 text-center">
                  <ShoppingBag size={18} className="text-[#D4A63D] mx-auto mb-1" />
                  <p className="text-white text-lg font-black">{myOrders.length}</p>
                  <p className="text-zinc-500 text-[9px]">إجمالي الطلبات</p>
                </div>
                <div className="bg-zinc-900/50 border border-[#2A2A2A] rounded-xl p-3 text-center">
                  <Package size={18} className="text-green-400 mx-auto mb-1" />
                  <p className="text-white text-lg font-black">{completedOrders.length}</p>
                  <p className="text-zinc-500 text-[9px]">طلبات مكتملة</p>
                </div>
                <div className="bg-zinc-900/50 border border-[#2A2A2A] rounded-xl p-3 text-center">
                  <Star size={18} className="text-[#D4A63D] mx-auto mb-1" />
                  <p className="text-white text-lg font-black">{store?.rating?.toFixed(1) || '0.0'}</p>
                  <p className="text-zinc-500 text-[9px]">تقييم المتجر</p>
                </div>
              </div>
              
              <button
                onClick={() => { onViewDashboard(); onClose(); }}
                className="w-full py-3 bg-[#D4A63D]/10 border border-[#D4A63D]/20 text-[#D4A63D] text-xs font-bold rounded-xl hover:bg-[#D4A63D]/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Settings size={14} />
                فتح لوحة التحكم الكاملة
              </button>
            </div>
          )}

          {activeTab === 'store' && (
            <div className="space-y-3">
              {store?.cover && (
                <img src={store.cover} alt="" className="w-full h-32 object-cover rounded-xl" referrerPolicy="no-referrer" />
              )}
              <div className="bg-zinc-900/50 border border-[#2A2A2A] rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <StoreIcon size={16} className="text-[#D4A63D]" />
                  <div>
                    <p className="text-zinc-500 text-[9px]">اسم المتجر</p>
                    <p className="text-white text-xs font-bold">{store?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-[#D4A63D]" />
                  <div>
                    <p className="text-zinc-500 text-[9px]">المدينة</p>
                    <p className="text-white text-xs font-bold">{store?.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-[#D4A63D]" />
                  <div>
                    <p className="text-zinc-500 text-[9px]">رقم الهاتف</p>
                    <p className="text-white text-xs font-bold" dir="ltr">{store?.storePhone || 'غير محدد'}</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => { onViewStore(); onClose(); }}
                className="w-full py-3 bg-zinc-800 text-white text-xs font-bold rounded-xl hover:bg-zinc-700 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ExternalLink size={14} />
                فتح المتجر
              </button>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-3">
              <div className="bg-zinc-900/50 border border-[#2A2A2A] rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Users size={16} className="text-[#D4A63D]" />
                  <div>
                    <p className="text-zinc-500 text-[9px]">الاسم</p>
                    <p className="text-white text-xs font-bold">{user.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-[#D4A63D]" />
                  <div>
                    <p className="text-zinc-500 text-[9px]">البريد الإلكتروني</p>
                    <p className="text-white text-xs font-bold">{user.email}</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => { onLogout(); onClose(); }}
                className="w-full py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl hover:bg-red-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut size={14} />
                تسجيل الخروج
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
