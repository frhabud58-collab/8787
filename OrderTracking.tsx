import React from 'react';
import { Order } from '../types';
import { Package, Truck, CheckCircle, Clock, MapPin, Phone, X } from 'lucide-react';

interface OrderTrackingProps {
  order: Order;
  onClose: () => void;
}

const STATUS_STEPS = [
  { key: 'pending', label: 'تم استلام الطلب', icon: Clock, description: 'طلبك قيد المراجعة' },
  { key: 'confirmed', label: 'تم تأكيد الطلب', icon: CheckCircle, description: 'تم تأكيد طلبك من المتجر' },
  { key: 'preparing', label: 'جاري التجهيز', icon: Package, description: 'يتم تجهيز طلبك' },
  { key: 'shipped', label: 'تم الشحن', icon: Truck, description: 'طلبك في الطريق إليك' },
  { key: 'delivered', label: 'تم التوصيل', icon: MapPin, description: 'تم توصيل طلبك بنجاح' },
];

export default function OrderTracking({ order, onClose }: OrderTrackingProps) {
  const currentStepIndex = STATUS_STEPS.findIndex(s => s.key === order.status);
  
  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-[#111111] border border-[#2A2A2A] rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto animate-tab-fade"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#111111] border-b border-[#2A2A2A] px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h3 className="text-white font-bold text-sm">تتبع الطلب</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">رقم الطلب: #{order.id.slice(-8)}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Order Info */}
        <div className="px-5 py-4 border-b border-[#2A2A2A]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#D4A63D]/10 flex items-center justify-center">
              <Package size={22} className="text-[#D4A63D]" />
            </div>
            <div className="flex-1">
              <p className="text-white text-xs font-bold">{order.storeName}</p>
              <p className="text-zinc-500 text-[10px] mt-0.5">{order.items.length} منتج • {order.date.split('T')[0]}</p>
            </div>
            <div className="text-left">
              <p className="text-[#D4A63D] text-sm font-black">{order.total} ج.م</p>
              <p className={`text-[9px] font-bold mt-0.5 px-2 py-0.5 rounded-full ${
                order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                'bg-amber-500/20 text-amber-400'
              }`}>
                {STATUS_STEPS.find(s => s.key === order.status)?.label || order.status}
              </p>
            </div>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="px-5 py-5">
          <h4 className="text-white text-xs font-bold mb-4">حالة الطلب</h4>
          <div className="space-y-0">
            {STATUS_STEPS.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const Icon = step.icon;
              
              return (
                <div key={step.key} className="flex items-start gap-3 relative">
                  {/* Vertical line */}
                  {index < STATUS_STEPS.length - 1 && (
                    <div className={`absolute right-[13px] top-[28px] w-[2px] h-[calc(100%-8px)] ${
                      isCompleted ? 'bg-[#D4A63D]' : 'bg-zinc-800'
                    }`} />
                  )}
                  
                  {/* Circle */}
                  <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isCurrent ? 'bg-[#D4A63D] shadow-[0_0_15px_rgba(212,166,61,0.4)]' :
                    isCompleted ? 'bg-[#D4A63D]/80' :
                    'bg-zinc-800 border-2 border-zinc-700'
                  }`}>
                    <Icon size={12} className={isCompleted ? 'text-black' : 'text-zinc-500'} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pb-5">
                    <p className={`text-xs font-bold ${isCompleted ? 'text-white' : 'text-zinc-500'}`}>
                      {step.label}
                    </p>
                    <p className={`text-[10px] mt-0.5 ${isCompleted ? 'text-zinc-400' : 'text-zinc-600'}`}>
                      {step.description}
                    </p>
                    {isCurrent && (
                      <span className="inline-block mt-1.5 text-[9px] bg-[#D4A63D]/10 text-[#D4A63D] px-2 py-0.5 rounded-full font-bold animate-pulse">
                        الحالة الحالية
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Items */}
        <div className="px-5 py-4 border-t border-[#2A2A2A]">
          <h4 className="text-white text-xs font-bold mb-3">المنتجات</h4>
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-zinc-900/50 rounded-xl p-2.5">
                <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-[11px] font-bold truncate">{item.productName}</p>
                  <p className="text-zinc-500 text-[9px]">{item.quantity} × {item.price} ج.م</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Info */}
        <div className="px-5 py-4 border-t border-[#2A2A2A]">
          <h4 className="text-white text-xs font-bold mb-3">بيانات التوصيل</h4>
          <div className="space-y-2 text-[11px]">
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="text-zinc-600">الاسم:</span>
              <span className="text-white font-bold">{order.customerName}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Phone size={12} className="text-zinc-600" />
              <span className="text-white font-bold" dir="ltr">{order.customerPhone}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <MapPin size={12} className="text-zinc-600 shrink-0" />
              <span className="text-white font-bold">{order.customerAddress}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
