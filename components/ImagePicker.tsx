import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Search, Check, CheckCircle } from 'lucide-react';

// Curated high-quality asset library for the MIX multi-vendor platform
export const PRESET_ASSETS = {
  logos: [
    { name: 'شعار جوالات وصيانة نيون 📱', url: 'https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?q=80&w=200&h=200&fit=crop' },
    { name: 'شعار أزياء وملابس بوتيك 👗', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200&h=200&fit=crop' },
    { name: 'شعار عطور فرنسية وشرقية 🧪', url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=200&h=200&fit=crop' },
    { name: 'شعار أحذية وكوتشيات رياضية 👟', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200&h=200&fit=crop' },
    { name: 'شعار أجهزة كهربائية وإلكترونيات 🔌', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=200&h=200&fit=crop' },
    { name: 'شعار متجر شامل لكل شيء 🛍️', url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=200&h=200&fit=crop' },
    { name: 'حديث وذهبي', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&h=200&fit=crop' },
    { name: 'أزياء راقية', url: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=200&h=200&fit=crop' },
    { name: 'عطور شرقية', url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=200&h=200&fit=crop' },
    { name: 'مجوهرات الماس', url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=200&h=200&fit=crop' },
    { name: 'لوجو تقني فريد', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200&h=200&fit=crop' },
    { name: 'ساعات وهيبة', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200&h=200&fit=crop' },
    { name: 'سويت كيك', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=200&h=200&fit=crop' },
    { name: 'مأكولات برجر', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=200&h=200&fit=crop' }
  ],
  covers: [
    { name: 'بنر جوالات وصيانة نيون تيك 📱⚡', url: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=1200&h=400&fit=crop' },
    { name: 'بنر أزياء وملابس كولكشن 👗✨', url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&h=400&fit=crop' },
    { name: 'بنر عطور شرقية وفرنسية فاخرة 🧪👑', url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1200&h=400&fit=crop' },
    { name: 'بنر أحذية وكوتشيات رياضية جريئة 👟🔥', url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1200&h=400&fit=crop' },
    { name: 'بنر أجهزة كهربائية ومنزلية ذكية 🔌🏠', url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200&h=400&fit=crop' },
    { name: 'بنر متجر شامل وهايبر ماركت عائلي 🛍️🛒', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&h=400&fit=crop' },
    { name: 'أناقة داكنة ورخام', url: 'https://images.unsplash.com/photo-1468436139062-f60a71c5c892?q=80&w=1200&h=400&fit=crop' },
    { name: 'بوتيك أزياء فرنسي', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&h=400&fit=crop' },
    { name: 'بخور وعود عربي', url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1200&h=400&fit=crop' },
    { name: 'معرض مجوهرات ملكي', url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&h=400&fit=crop' },
    { name: 'معرض هواتف ذكية', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&h=400&fit=crop' },
    { name: 'حلويات شوكولاتة', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1200&h=400&fit=crop' },
    { name: 'توصيل شحن فاخر', url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&h=400&fit=crop' }
  ],
  products: [
    // Phones
    { category: 'الهواتف الذكية', name: 'آيفون 15 برو ماكس ديب', url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&h=600&fit=crop' },
    { category: 'الهواتف الذكية', name: 'سامسونج S24 ألترا تيتانيوم', url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600&h=600&fit=crop' },
    { category: 'الهواتف الذكية', name: 'جوجل بيكسل 8 برو بورسلين', url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600&h=600&fit=crop' },
    
    // Headphones & Tech Accessories
    { category: 'سماعات واكسسوارات', name: 'سماعة أبل AirPods Max فضي', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&h=600&fit=crop' },
    { category: 'سماعات واكسسوارات', name: 'سماعة سوني WH-1000XM5 أسود', url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=600&h=600&fit=crop' },
    { category: 'سماعات واكسسوارات', name: 'سماعات إيربودز برو لاسلكية', url: 'https://images.unsplash.com/photo-1588444839799-eb6cd779811c?q=80&w=600&h=600&fit=crop' },
    
    // Repairs & Hardware
    { category: 'قطع غيار وصيانة', name: 'معدات صيانة وفحص فني الدقيق', url: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=600&h=600&fit=crop' },
    { category: 'قطع غيار وصيانة', name: 'شاشة بديلة أصلية سوبر أموليد', url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600&h=600&fit=crop' },
    { category: 'قطع غيار وصيانة', name: 'بطارية هاتف خلوي عالية الكثافة', url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=600&h=600&fit=crop' },
    
    // Perfumes
    { category: 'عطور وبخور', name: 'دهن العود الكمبودي الملكي', url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600&h=600&fit=crop' },
    { category: 'عطور وبخور', name: 'عطر مسك الغزال الفاخر', url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=600&h=600&fit=crop' },
    { category: 'عطور وبخور', name: 'بخور مبثوث ملكي فاخر دبل سوبر', url: 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=600&h=600&fit=crop' },
    
    // Watches & Jewelry
    { category: 'ساعات ومجوهرات', name: 'ساعة رولكس كوزموغراف ديتونا', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&h=600&fit=crop' },
    { category: 'ساعات ومجوهرات', name: 'ساعة يد ذهبية سويسرية كلاسيك', url: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=600&h=600&fit=crop' },
    { category: 'ساعات ومجوهرات', name: 'طقم ألماس بلاتيني متكامل', url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&h=600&fit=crop' },
    
    // Clothes & Fashion
    { category: 'ملابس وأزياء', name: 'ثوب سعودي مطرز فاخر شتوي', url: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=600&h=600&fit=crop' },
    { category: 'ملابس وأزياء', name: 'بشت ملكي أسود زري ذهبي ألماني', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&h=600&fit=crop' },
    { category: 'ملابس وأزياء', name: 'حذاء جلدي إيطالي فاخر صناعة يدوية', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&h=600&fit=crop' },

    // Sweets & Restaurants
    { category: 'مطاعم وحلويات', name: 'قالب كيك الشوكولاتة والكراميل الملكي', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=600&h=600&fit=crop' },
    { category: 'مطاعم وحلويات', name: 'علبة حلويات مشكلة شرقية وغربية', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&h=600&fit=crop' },
    { category: 'مطاعم وحلويات', name: 'وجبة همبرغر لحم دبل مشوي بالفحم', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&h=600&fit=crop' },

    // Flowers & Living
    { category: 'نباتات ومستلزمات طبيعية', name: 'شجيرة البونساي اليابانية المنزلية', url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=600&h=600&fit=crop' },
    { category: 'نباتات ومستلزمات طبيعية', name: 'باقة ورود جوري حمراء مغلفة', url: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=600&h=600&fit=crop' }
  ]
};

export function compressAndResizeImage(file: File, maxWidth: number, maxHeight: number, quality: number): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const image = new Image();
      image.onload = () => {
        let width = image.width;
        let height = image.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        try {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(image, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(dataUrl);
          } else {
            resolve(readerEvent.target?.result as string);
          }
        } catch (e) {
          console.warn('Canvas resizing failed, falling back to original base64:', e);
          resolve(readerEvent.target?.result as string);
        }
      };
      image.onerror = () => {
        resolve(readerEvent.target?.result as string);
      };
      image.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => {
      resolve('');
    };
    reader.readAsDataURL(file);
  });
}

interface ImagePickerProps {
  type: 'logo' | 'cover' | 'product' | 'category' | 'banner';
  selectedUrl: string;
  onSelect: (url: string) => void;
  label?: string;
}

export default function ImagePicker({ type, selectedUrl, onSelect, label }: ImagePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Determine what assets to show
  const getAssetsList = () => {
    if (type === 'logo') return PRESET_ASSETS.logos;
    if (type === 'cover' || type === 'banner') return PRESET_ASSETS.covers;
    return PRESETS_PRODUCTS_FILTERED();
  };

  const PRESETS_PRODUCTS_FILTERED = () => {
    let list = PRESET_ASSETS.products;
    if (activeCategory !== 'all') {
      list = list.filter(item => item.category === activeCategory);
    }
    if (searchTerm.trim() !== '') {
      list = list.filter(item => item.name.includes(searchTerm) || item.category.includes(searchTerm));
    }
    return list;
  };

  const uniqueCategories = ['all', ...Array.from(new Set(PRESET_ASSETS.products.map(p => p.category)))];

  const handleChoose = (url: string) => {
    onSelect(url);
    setIsOpen(false);
  };

  const currentList = getAssetsList();

  return (
    <div className="relative text-right" dir="rtl">
      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
        <label className="block text-zinc-300 text-xs font-semibold">{label || 'رابط الصورة'}</label>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-2 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 text-[#D4AF37] hover:text-white border border-[#D4AF37]/30 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
        >
          <Sparkles size={11} className="animate-pulse" />
          <span>اختر جاهز 🖼️</span>
        </button>
        <button
          type="button"
          onClick={() => {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.onchange = async (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                let maxWidth = 500;
                let maxHeight = 500;
                let quality = 0.8;

                if (type === 'logo') {
                  maxWidth = 200;
                  maxHeight = 200;
                  quality = 0.85;
                } else if (type === 'cover' || type === 'banner') {
                  maxWidth = 800;
                  maxHeight = 400;
                  quality = 0.75;
                }

                try {
                  const compressedBase64 = await compressAndResizeImage(file, maxWidth, maxHeight, quality);
                  onSelect(compressedBase64);
                } catch (err) {
                  console.error('Failed to compress image, using original reader:', err);
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    onSelect(event.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }
            };
            fileInput.click();
          }}
          className="px-2 py-0.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
        >
          <span>رفع من جهازك 📁</span>
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={selectedUrl}
          onChange={(e) => onSelect(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg py-2 px-3 text-[10px] text-white focus:outline-none focus:border-amber-400 font-mono text-left"
        />
        {selectedUrl && (
          <div className="w-9 h-9 rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden shrink-0">
            <img src={selectedUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute right-0 left-0 mt-2 p-4 bg-zinc-900 border border-amber-500/30 rounded-xl z-50 shadow-[0_10px_30px_rgba(0,0,0,0.8)] max-h-80 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
            <span className="text-xs font-bold text-amber-400">مكتبة الصور واللوجوهات الجاهزة لـ MIX ✨</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs text-zinc-500 hover:text-white cursor-pointer"
            >
              إغلاق [X]
            </button>
          </div>

          {/* Product category filter & Search (only for product/category type) */}
          {(type === 'product' || type === 'category') && (
            <div className="space-y-2 mb-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث عن صورة جاهزة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-850 rounded-lg py-1.5 px-3 pr-8 text-xs text-white focus:outline-none"
                />
                <Search className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
              </div>

              <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {uniqueCategories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold whitespace-nowrap cursor-pointer transition-colors ${
                      activeCategory === cat 
                        ? 'bg-amber-500 text-black' 
                        : 'bg-zinc-950 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {cat === 'all' ? 'الكل' : cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Assets Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {currentList.map((item: any, idx) => {
              const isSelected = selectedUrl === item.url;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleChoose(item.url)}
                  className={`relative p-1 bg-zinc-950 rounded-lg border transition-all cursor-pointer text-right group ${
                    isSelected ? 'border-amber-500 bg-amber-500/5' : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="aspect-square bg-zinc-900 rounded overflow-hidden relative">
                    <img
                      src={item.url}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <CheckCircle className="text-amber-400 w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <span className="text-[8px] text-zinc-400 block mt-1 truncate font-sans font-medium">{item.name}</span>
                </button>
              );
            })}
            {currentList.length === 0 && (
              <p className="col-span-4 text-center text-zinc-600 text-xs py-4">لا توجد صور مطابقة لبحثك.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
