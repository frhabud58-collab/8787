import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, MessageCircle, Phone, Image as ImageIcon, Bell, Check, CheckCheck, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { ChatRoom, ChatMessage, User as UserType, Order } from '../types';
import { fbSync } from '../lib/firebaseSync';
import FileUploader from './FileUploader';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType | null;
  storeId?: string;
  storeName?: string;
  storeLogo?: string;
}

function generateId() {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function formatTime(ts: string) {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  } catch { return ts; }
}

function loadOrders(): Order[] {
  try { return JSON.parse(localStorage.getItem('mix_orders') || '[]'); }
  catch { return []; }
}

function OrderCard({ order, compact }: { order: Order; compact?: boolean }) {
  if (compact) {
    return (
      <div className="bg-zinc-900/80 border border-amber-500/20 rounded-xl p-2 text-[10px] min-w-[180px]">
        <div className="flex items-center gap-1.5 mb-1">
          <Package size={10} className="text-amber-400" />
          <span className="font-bold text-amber-400">طلب #{order.id.slice(-6)}</span>
        </div>
        <div className="text-zinc-300 truncate">{order.items.map(i => i.productName).join('، ')}</div>
        <div className="flex justify-between mt-1">
          <span className="text-zinc-500">{order.status}</span>
          <span className="text-amber-400 font-bold">{order.total} ج.م</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-amber-500/30 rounded-xl p-3 max-w-[260px]">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-zinc-800">
        <Package size={14} className="text-amber-400" />
        <span className="text-xs font-bold text-amber-400">طلب #{order.id.slice(-6)}</span>
        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
          order.status === 'تم التوصيل' ? 'bg-green-500/20 text-green-400' :
          order.status === 'قيد التنفيذ' ? 'bg-amber-500/20 text-amber-400' :
          'bg-zinc-700 text-zinc-300'
        }`}>{order.status}</span>
      </div>
      <div className="space-y-1.5">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <img src={item.image} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" referrerPolicy="no-referrer" />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] text-white font-bold truncate">{item.productName}</div>
              <div className="text-[9px] text-zinc-500">{item.quantity} × {item.price} ج.م</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-zinc-800">
        <span className="text-[9px] text-zinc-500">{order.customerName} • {order.date.split('T')[0]}</span>
        <span className="text-xs font-black text-amber-400">{order.total} ج.م</span>
      </div>
    </div>
  );
}

// Play notification sound
function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
}

function loadRooms(): ChatRoom[] {
  try { return JSON.parse(localStorage.getItem('mix_chat_rooms') || '[]'); }
  catch { return []; }
}

function loadMessages(roomId: string): ChatMessage[] {
  try {
    const all = JSON.parse(localStorage.getItem('mix_chat_messages') || '{}');
    return all[roomId] || [];
  } catch { return []; }
}

function saveMessages(roomId: string, msgs: ChatMessage[]) {
  try {
    const all = JSON.parse(localStorage.getItem('mix_chat_messages') || '{}');
    all[roomId] = msgs;
    localStorage.setItem('mix_chat_messages', JSON.stringify(all));
    // Sync last message to Firebase
    if (msgs.length > 0) {
      const lastMsg = msgs[msgs.length - 1];
      fbSync.saveChatMessage(lastMsg).catch(() => {});
    }
  } catch {}
}

function saveRooms(rooms: ChatRoom[]) {
  localStorage.setItem('mix_chat_rooms', JSON.stringify(rooms));
  // Sync rooms to Firebase
  rooms.forEach(room => fbSync.saveChatRoom(room).catch(() => {}));
}

export default function ChatPanel({
  isOpen, onClose, currentUser, storeId, storeName, storeLogo
}: ChatPanelProps) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [textInput, setTextInput] = useState('');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);
  const [isCustomerView, setIsCustomerView] = useState(false);
  const [showOrderPicker, setShowOrderPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const userRole = currentUser?.role || 'user';
  const userId = currentUser?.id || 'guest';

  // Load rooms on mount & poll for new messages
  useEffect(() => {
    if (!isOpen) return;
    const r = loadRooms();
    setRooms(r);
    
    // If customer with storeId: find or create room
    if (userRole === 'user' && storeId) {
      setIsCustomerView(true);
      const existing = r.find(rm => rm.customerId === userId && rm.storeId === storeId);
      if (existing) {
        setActiveRoomId(existing.id);
      } else {
        const newRoom: ChatRoom = {
          id: `room-${Date.now()}`,
          storeId,
          storeName: storeName || 'المتجر',
          storeLogo: storeLogo || '',
          customerId: userId,
          customerName: currentUser?.name || 'عميل',
          customerPhone: '',
          lastMessage: 'بداية المحادثة',
          lastTime: new Date().toISOString(),
          unread: 0,
          status: 'active'
        };
        const updated = [newRoom, ...r];
        saveRooms(updated);
        window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_chat_rooms' } }));
        setRooms(updated);
        setActiveRoomId(newRoom.id);
      }
    } else if (userRole === 'merchant' || userRole === 'admin') {
      setIsCustomerView(false);
      const unreadRoom = r.find(rm => rm.unread > 0);
      if (unreadRoom && !activeRoomId) {
        setActiveRoomId(unreadRoom.id);
      } else if (r.length > 0 && !activeRoomId) {
        setActiveRoomId(r[0].id);
      }
    }

    // Listen for real-time chat events
    const handleChatUpdate = () => {
      const updated = loadRooms();
      setRooms(updated);
      if (activeRoomId) {
        const fresh = loadMessages(activeRoomId);
        setMessages(prev => {
          if (fresh.length !== prev.length) return fresh;
          return prev;
        });
      }
    };
    window.addEventListener('local-storage-change', handleChatUpdate);
    window.addEventListener('mix-realtime-mix_chat_rooms', handleChatUpdate);
    window.addEventListener('mix-realtime-mix_chat_messages', handleChatUpdate);

    // Poll for new messages every 2 seconds
    const interval = setInterval(() => {
      const updated = loadRooms();
      setRooms(prev => {
        // Check for new rooms or unread changes
        let changed = false;
        if (updated.length !== prev.length) changed = true;
        else {
          for (const r of updated) {
            const old = prev.find(p => p.id === r.id);
            if (!old || old.unread !== r.unread || old.lastMessage !== r.lastMessage) {
              changed = true;
              break;
            }
          }
        }
        return changed ? updated : prev;
      });
      // Refresh active room messages
      if (activeRoomId) {
        const fresh = loadMessages(activeRoomId);
        setMessages(prev => {
          if (fresh.length !== prev.length) {
            // New message from other side
            if (fresh.length > prev.length) playNotificationSound();
            return fresh;
          }
          return prev;
        });
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('local-storage-change', handleChatUpdate);
      window.removeEventListener('mix-realtime-mix_chat_rooms', handleChatUpdate);
      window.removeEventListener('mix-realtime-mix_chat_messages', handleChatUpdate);
    };
  }, [isOpen, storeId, userId, userRole]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages when active room changes
  useEffect(() => {
    if (activeRoomId) {
      const msgs = loadMessages(activeRoomId);
      setMessages(msgs);
      // Mark as read for merchant/admin
      if (userRole === 'merchant' || userRole === 'admin') {
        const updated = rooms.map(r => r.id === activeRoomId ? { ...r, unread: 0 } : r);
        setRooms(updated);
        saveRooms(updated);
      }
    }
  }, [activeRoomId]);

  const sendMessage = () => {
    if (!textInput.trim() && !imageData) return;
    if (!activeRoomId) return;

    const newMsg: ChatMessage = {
      id: generateId(),
      roomId: activeRoomId,
      senderId: userId,
      senderName: currentUser?.name || 'مستخدم',
      senderRole: userRole as any,
      text: textInput.trim(),
      image: imageData || undefined,
      timestamp: new Date().toISOString(),
      read: false
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    saveMessages(activeRoomId, updated);

    // Update room last message
    const updatedRooms = rooms.map(r => {
      if (r.id === activeRoomId) {
        return {
          ...r,
          lastMessage: imageData ? '📷 صورة' : textInput.trim(),
          lastTime: new Date().toISOString(),
          unread: userRole === 'merchant' || userRole === 'admin' ? r.unread : (r.unread || 0) + 1
        };
      }
      return r;
    });
    setRooms(updatedRooms);
    saveRooms(updatedRooms);

    // Dispatch events so merchant/admin dashboards detect new messages
    window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_chat_messages' } }));
    window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_chat_rooms' } }));

    setTextInput('');
    setImageData(null);
    setShowImageUpload(false);
  };

  const sendOrderMessage = (order: Order) => {
    if (!activeRoomId) return;
    const newMsg: ChatMessage = {
      id: generateId(),
      roomId: activeRoomId,
      senderId: userId,
      senderName: currentUser?.name || 'مستخدم',
      senderRole: userRole as any,
      text: `📦 تم مشاركة الطلب #${order.id.slice(-6)}`,
      orderId: order.id,
      timestamp: new Date().toISOString(),
      read: false
    };
    const updated = [...messages, newMsg];
    setMessages(updated);
    saveMessages(activeRoomId, updated);
    const updatedRooms = rooms.map(r => {
      if (r.id === activeRoomId) {
        return { ...r, lastMessage: `📦 طلب #${order.id.slice(-6)}`, lastTime: new Date().toISOString(), unread: userRole === 'merchant' || userRole === 'admin' ? r.unread : (r.unread || 0) + 1 };
      }
      return r;
    });
    setRooms(updatedRooms);
    saveRooms(updatedRooms);
    window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_chat_messages' } }));
    window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_chat_rooms' } }));
    setShowOrderPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = () => {
    if (!storeId) return;
    const newRoom: ChatRoom = {
      id: `room-${Date.now()}`,
      storeId,
      storeName: storeName || 'المتجر',
      storeLogo: storeLogo || '',
      customerId: userId,
      customerName: currentUser?.name || 'عميل',
      customerPhone: '',
      lastMessage: 'بداية محادثة جديدة',
      lastTime: new Date().toISOString(),
      unread: 0,
      status: 'active'
    };
    const updated = [newRoom, ...rooms];
    saveRooms(updated);
    window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key: 'mix_chat_rooms' } }));
    setRooms(updated);
    setActiveRoomId(newRoom.id);
    setMessages([]);
  };

  if (!isOpen) return null;

  const activeRoom = rooms.find(r => r.id === activeRoomId);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-4xl h-[80vh] bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden z-10 flex flex-col"
          dir="rtl"
        >
          {/* Header */}
          <div className="shrink-0 bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="text-amber-400" size={18} />
              <span className="text-sm font-bold text-white">الدردشة المباشرة</span>
              {rooms.filter(r => r.unread > 0).length > 0 && (
                <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {rooms.filter(r => r.unread > 0).length}
                </span>
              )}
            </div>
            <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer">
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar - Rooms List (for merchants/admins) */}
            {!isCustomerView && (
              <div className="w-72 shrink-0 border-l border-zinc-800 flex flex-col bg-zinc-900/30">
                <div className="p-2 border-b border-zinc-800">
                  <input
                    type="text"
                    placeholder="بحث في المحادثات..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex-1 overflow-y-auto">
                  {rooms.length === 0 ? (
                    <div className="p-4 text-center text-zinc-500 text-xs">لا توجد محادثات</div>
                  ) : (
                    rooms.map(room => (
                      <button
                        key={room.id}
                        onClick={() => setActiveRoomId(room.id)}
                        className={`w-full p-3 text-right border-b border-zinc-800/50 transition-all cursor-pointer hover:bg-zinc-800/30 ${
                          activeRoomId === room.id ? 'bg-zinc-800/40 border-r-2 border-r-amber-500' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden shrink-0">
                            {room.storeLogo ? (
                              <img src={room.storeLogo} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">📷</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white truncate">{room.storeName}</span>
                              <span className="text-[9px] text-zinc-500 font-mono">{formatTime(room.lastTime)}</span>
                            </div>
                            <div className="flex items-center justify-between mt-0.5">
                              <span className="text-[10px] text-zinc-500 truncate">{room.lastMessage}</span>
                              {room.unread > 0 && (
                                <span className="shrink-0 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">{room.unread}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Customer view: show store info header */}
            {isCustomerView && (
              <div className="w-56 shrink-0 border-l border-zinc-800 bg-zinc-900/30 p-4 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-full bg-zinc-800 overflow-hidden mb-2">
                  {storeLogo ? (
                    <img src={storeLogo} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">🏪</div>
                  )}
                </div>
                <span className="text-xs font-bold text-white">{storeName || 'المتجر'}</span>
                <span className="text-[9px] text-zinc-500 mt-1">دردشة خاصة ومشفرة</span>
                <div className="mt-4 flex items-center gap-1 text-[10px] text-green-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span>متصل</span>
                </div>
              </div>
            )}

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
              {!activeRoomId ? (
                <div className="flex-1 flex items-center justify-center text-zinc-500 text-xs flex-col gap-2">
                  {isCustomerView ? (
                    <>
                      <MessageCircle size={32} className="text-zinc-700" />
                      <span>ابدأ محادثة مع التاجر</span>
                      <button onClick={startNewChat} className="mt-2 px-4 py-2 bg-amber-500 text-black font-bold text-xs rounded-lg hover:bg-amber-400 transition-colors cursor-pointer">
                        بدء المحادثة 💬
                      </button>
                    </>
                  ) : (
                    <span>اختر محادثة من القائمة</span>
                  )}
                </div>
              ) : (
                <>
                  {/* Active Room Header */}
                  <div className="shrink-0 bg-zinc-900/50 border-b border-zinc-800 px-4 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {activeRoom && (
                        <>
                          <div className="w-7 h-7 rounded-full bg-zinc-800 overflow-hidden">
                            {activeRoom.storeLogo ? (
                              <img src={activeRoom.storeLogo} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[9px]">🏪</div>
                            )}
                          </div>
                          <span className="text-xs font-bold text-white">{isCustomerView ? activeRoom.storeName : activeRoom.customerName}</span>
                        </>
                      )}
                    </div>
                    {!isCustomerView && activeRoom && (
                      <span className="text-[9px] text-zinc-500">
                        {activeRoom.customerPhone && <span dir="ltr">{activeRoom.customerPhone}</span>}
                      </span>
                    )}
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-950">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-zinc-600 text-xs">
                        <p>لا توجد رسائل بعد. ابدأ المحادثة الآن!</p>
                      </div>
                    ) : (
                      messages.map(msg => {
                        const isMe = msg.senderId === userId;
                        const linkedOrder = msg.orderId ? loadOrders().find(o => o.id === msg.orderId) : null;
                        return (
                          <div key={msg.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'} animate-fadeIn`}>
                            <div
                              className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                                isMe
                                  ? 'bg-amber-500 text-black rounded-br-sm'
                                  : 'bg-zinc-800 text-white rounded-bl-sm'
                              }`}
                            >
                              {!isMe && (
                                <span className="text-[9px] font-bold block mb-0.5" style={{ color: isMe ? 'black' : 'var(--store-primary, #D4AF37)' }}>
                                  {msg.senderName}
                                </span>
                              )}
                              {linkedOrder && (
                                <div className={`mb-2 p-0.5 rounded-lg ${isMe ? 'bg-black/10' : 'bg-zinc-700/50'}`}>
                                  <OrderCard order={linkedOrder} compact />
                                </div>
                              )}
                              {msg.text && (
                                <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                              )}
                              {msg.image && (
                                <img
                                  src={msg.image}
                                  alt=""
                                  className="mt-1 max-w-full rounded-lg max-h-48 object-cover cursor-pointer"
                                  onClick={() => window.open(msg.image, '_blank')}
                                  referrerPolicy="no-referrer"
                                />
                              )}
                              <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <span className={`text-[9px] ${isMe ? 'text-black/60' : 'text-zinc-400'}`}>{formatTime(msg.timestamp)}</span>
                                {isMe && (
                                  msg.read
                                    ? <CheckCheck size={12} className="text-blue-400" />
                                    : <Check size={12} className="text-black/50" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Order Picker */}
                  {showOrderPicker && (
                    <div className="shrink-0 bg-zinc-900 border-t border-zinc-800 px-4 py-2 max-h-48 overflow-y-auto">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-amber-400">اختر طلباً لمشاركته</span>
                        <button onClick={() => setShowOrderPicker(false)} className="text-zinc-500 hover:text-white cursor-pointer text-[10px]">✕</button>
                      </div>
                      {loadOrders().length === 0 ? (
                        <p className="text-[10px] text-zinc-600 text-center py-4">لا توجد طلبات بعد</p>
                      ) : (
                        <div className="space-y-2">
                          {loadOrders().slice(-10).reverse().map(order => (
                            <button
                              key={order.id}
                              onClick={() => sendOrderMessage(order)}
                              className="w-full text-left p-2 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-amber-500/40 transition-all cursor-pointer"
                            >
                              <OrderCard order={order} compact />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Image Preview */}
                  {imageData && (
                    <div className="shrink-0 bg-zinc-900 border-t border-zinc-800 px-4 py-2 flex items-center gap-2">
                      <img src={imageData} alt="" className="h-10 w-10 object-cover rounded-lg" />
                      <span className="text-[10px] text-zinc-400">صورة مرفقة</span>
                      <button onClick={() => { setImageData(null); setShowImageUpload(false); }} className="p-1 text-red-400 hover:text-red-300 cursor-pointer text-xs">✕</button>
                    </div>
                  )}

                  {/* Image Upload */}
                  {showImageUpload && !imageData && (
                    <div className="shrink-0 bg-zinc-900 border-t border-zinc-800 px-4 py-2">
                      <FileUploader
                        onUpload={(base64) => { setImageData(base64); setShowImageUpload(false); }}
                        label=""
                        maxSizeMB={3}
                      />
                    </div>
                  )}

                  {/* Input */}
                  <div className="shrink-0 bg-zinc-900 border-t border-zinc-800 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => { setShowImageUpload(!showImageUpload); setShowOrderPicker(false); }}
                        className="p-2 text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
                        title="إرفاق صورة"
                      >
                        <ImageIcon size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowOrderPicker(!showOrderPicker); setShowImageUpload(false); }}
                        className="p-2 text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
                        title="إرفاق طلب"
                      >
                        <Package size={18} />
                      </button>
                      <input
                        ref={inputRef}
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="اكتب رسالتك هنا..."
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-4 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={sendMessage}
                        disabled={!textInput.trim() && !imageData}
                        className="p-2 bg-amber-500 text-black rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
