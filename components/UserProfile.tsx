import React, { useState } from 'react';
import { User, Order } from '../types';
import { User as UserIcon, Package, Heart, MapPin, Phone, Mail, LogOut, ShoppingBag, Clock, CheckCircle, Truck, ChevronLeft } from 'lucide-react';
import OrderTracking from './OrderTracking';

interface UserProfileProps {
  user: User;
  orders: Order[];
  wishlist: string[];
  onClose: () => void;
  onLogout: () => void;
}

export default function UserProfile({ user, orders, wishlist, onClose, onLogout }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'info'>('orders');
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  
  const myOrders = orders.filter(o => o.customerName === user.name || o.customerEmail === user.email);
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'delivered': return 'bg-green-500/20 text-green-400';
      case 'shipped': return 'bg-blue-500/20 text-blue-400';
      case 'preparing': return 'bg-amber-500/20 text-amber-400';
      case 'confirmed': return 'bg-cyan-500/20 text-cyan-400';
      default: return 'bg-zinc-700/50 text-zinc-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'pending': return 'قيد المراجعة';
      case 'confirmed': return 'مؤكد';
      case 'preparing': return 'جاري التجهيز';
      case 'shipped': return 'تم الشحن';
      case 'delivered': return 'تم التوصيل';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-[#111111] border border-[#2A2A2A] rounded-2xl w-full max-w-md max-h-[85vh] overflow-hidden animate-tab-fade flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-b from-[#D4A63D]/10 to-transparent px-5 py-6 text-center border-b border-[#2A2A2A]">
          <div className="w-16 h-16 rounded-full bg-[#D4A63D]/20 border-2 border-[#D4A63D]/30 flex items-center justify-center mx-auto mb-3">
            <UserIcon size={28} className="text-[#D4A63D]" />
          </div>
          <h2 className="text-white font-bold text-sm">{user.name}</h2>
          <p className="text-zinc-500 text-[10px] mt-0.5">{user.email}</p>
          <div className="flex justify-center gap-3 mt-3">
            <span className="text-[9px] bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full font-bold">
              {myOrders.length} طلب
            </span>
            <span className="text-[9px] bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full font-bold">
              {wishlist.length} مفضلة
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#2A2A2A]">
          {[
            { id: 'orders', label: 'طلباتي', icon: Package },
            { id: 'wishlist', label: 'المفضلة', icon: Heart },
            { id: 'info', label: 'بياناتي', icon: UserIcon },
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
          {activeTab === 'orders' && (
            <div className="space-y-3">
              {myOrders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag size={32} className="text-zinc-700 mx-auto mb-2" />
                  <p className="text-zinc-500 text-xs">لا توجد طلبات بعد</p>
                </div>
              ) : (
                myOrders.slice().reverse().map(order => (
                  <button
                    key={order.id}
                    onClick={() => setTrackingOrder(order)}
                    className="w-full bg-zinc-900/50 border border-[#2A2A2A] rounded-xl p-3 text-right hover:border-[#D4A63D]/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-[11px] font-bold">#{order.id.slice(-8)}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500 text-[10px]">{order.items.length} منتج</span>
                        <span className="text-zinc-700">•</span>
                        <span className="text-zinc-500 text-[10px]">{order.date.split('T')[0]}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[#D4A63D] text-xs font-black">{order.total} ج.م</span>
                        <ChevronLeft size={14} className="text-zinc-600" />
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="text-center py-8">
              <Heart size={32} className="text-zinc-700 mx-auto mb-2" />
              <p className="text-zinc-500 text-xs">{wishlist.length} منتج في المفضلة</p>
              <p className="text-zinc-600 text-[10px] mt-1">اضغط على أي منتج لإضافته للمفضلة</p>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-3">
              <div className="bg-zinc-900/50 border border-[#2A2A2A] rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <UserIcon size={16} className="text-[#D4A63D]" />
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
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-[#D4A63D]" />
                  <div>
                    <p className="text-zinc-500 text-[9px]">رقم الهاتف</p>
                    <p className="text-white text-xs font-bold" dir="ltr">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-[#D4A63D]" />
                  <div>
                    <p className="text-zinc-500 text-[9px]">الدور</p>
                    <p className="text-white text-xs font-bold capitalize">{user.role === 'customer' ? 'عميل' : user.role}</p>
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

        {/* Order Tracking Modal */}
        {trackingOrder && (
          <OrderTracking order={trackingOrder} onClose={() => setTrackingOrder(null)} />
        )}
      </div>
    </div>
  );
}
