/**
 * Smart Business Type Templates System
 * Each business type gets a customized dashboard, store design, and features
 */

export type BusinessType = 
  | 'phone_repair'           // صيانة هواتف
  | 'phone_sales'            // بيع هواتف
  | 'fashion'                // ملابس وأزياء
  | 'shoes'                  // أحذية
  | 'perfumes'               // عطور
  | 'electronics'            // إلكترونيات
  | 'restaurant'             // مطعم
  | 'supermarket'            // سوبر ماركت
  | 'home_tools'             // أدوات منزلية
  | 'jewelry'                // مجوهرات
  | 'books'                  // مكتبة
  | 'pharmacy'               // صيدلية
  | 'sweets'                 // حلويات
  | 'accessories'            // إكسسوارات
  | 'furniture'              // أثاث
  | 'general';               // عام

export interface BusinessTemplate {
  id: BusinessType;
  name: string;
  nameEn: string;
  icon: string;
  description: string;
  
  // Dashboard configuration
  dashboard: {
    sections: DashboardSection[];
    primaryColor: string;
    secondaryColor: string;
  };
  
  // Store page configuration
  store: {
    layout: 'grid' | 'list' | 'luxury' | 'repair';
    showProducts: boolean;
    showServices: boolean;
    showMenu: boolean;
    categories: string[];
    features: string[];
  };
  
  // Form fields for orders
  orderFields: OrderField[];
  
  // Default sections
  defaultSections: string[];
}

export interface DashboardSection {
  id: string;
  label: string;
  icon: string;
  enabled: boolean;
}

export interface OrderField {
  id: string;
  label: string;
  type: 'text' | 'tel' | 'email' | 'textarea' | 'select' | 'date' | 'time' | 'number';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export const BUSINESS_TEMPLATES: Record<BusinessType, BusinessTemplate> = {
  phone_repair: {
    id: 'phone_repair',
    name: 'صيانة هواتف',
    nameEn: 'Phone Repair',
    icon: '🔧',
    description: 'خدمات صيانة وإصلاح الهواتف والأجهزة الذكية',
    
    dashboard: {
      sections: [
        { id: 'repairs', label: 'إدارة طلبات الصيانة', icon: '🔧', enabled: true },
        { id: 'services', label: 'أنواع الأعطال', icon: '⚙️', enabled: true },
        { id: 'devices', label: 'أنواع الأجهزة', icon: '📱', enabled: true },
        { id: 'pricing', label: 'أسعار الصيانة', icon: '💰', enabled: true },
        { id: 'appointments', label: 'الحجوزات', icon: '📅', enabled: true },
        { id: 'technicians', label: 'الفنيين', icon: '👨‍🔧', enabled: true },
        { id: 'warranty', label: 'الضمان', icon: '🛡️', enabled: true },
        { id: 'banners', label: 'البنرات', icon: '🖼️', enabled: true },
        { id: 'orders', label: 'الطلبات', icon: '📦', enabled: true },
      ],
      primaryColor: '#3b82f6',
      secondaryColor: '#1e40af',
    },
    
    store: {
      layout: 'repair',
      showProducts: false,
      showServices: true,
      showMenu: false,
      categories: ['تبديل شاشات', 'تبديل بطاريات', 'سوفت وير', 'فك قفل', 'إصلاح أعطال'],
      features: ['ضمان 6 أشهر', 'قطع أصلية', 'خدمة سريعة', 'فنيين معتمدين'],
    },
    
    orderFields: [
      { id: 'device_type', label: 'نوع الجهاز', type: 'select', required: true, options: ['iPhone', 'Samsung', 'Xiaomi', 'Huawei', 'Other'] },
      { id: 'device_model', label: 'موديل الجهاز', type: 'text', required: true, placeholder: 'مثال: iPhone 13 Pro' },
      { id: 'problem', label: 'وصف العطل', type: 'textarea', required: true, placeholder: 'اشرح العطل بالتفصيل...' },
      { id: 'urgency', label: 'أولوية الإصلاح', type: 'select', required: true, options: ['عادي', 'مستعجل', 'طارئ'] },
      { id: 'appointment_date', label: 'تاريخ الحجز', type: 'date', required: true },
      { id: 'appointment_time', label: 'وقت الحجز', type: 'time', required: true },
      { id: 'customer_name', label: 'الاسم', type: 'text', required: true },
      { id: 'customer_phone', label: 'رقم الهاتف', type: 'tel', required: true },
    ],
    
    defaultSections: ['hero_banner', 'services', 'repair_types', 'features', 'contact'],
  },
  
  phone_sales: {
    id: 'phone_sales',
    name: 'بيع هواتف',
    nameEn: 'Phone Sales',
    icon: '📱',
    description: 'بيع هواتف محمولة وملحقاتها',
    
    dashboard: {
      sections: [
        { id: 'products', label: 'المنتجات', icon: '📦', enabled: true },
        { id: 'categories', label: 'التصنيفات', icon: '📂', enabled: true },
        { id: 'brands', label: 'الماركات', icon: '🏷️', enabled: true },
        { id: 'specs', label: 'المواصفات', icon: '⚙️', enabled: true },
        { id: 'warranty', label: 'الضمان', icon: '🛡️', enabled: true },
        { id: 'discounts', label: 'الخصومات', icon: '🏷️', enabled: true },
        { id: 'offers', label: 'العروض', icon: '⭐', enabled: true },
        { id: 'orders', label: 'الطلبات', icon: '📋', enabled: true },
        { id: 'customers', label: 'العملاء', icon: '👥', enabled: true },
      ],
      primaryColor: '#8b5cf6',
      secondaryColor: '#6d28d9',
    },
    
    store: {
      layout: 'grid',
      showProducts: true,
      showServices: false,
      showMenu: false,
      categories: ['هواتف جديدة', 'هواتف مستعملة', 'ملحقات', 'شواحن', 'كفرات'],
      features: ['ضمان سنة', 'دفع آمن', 'توصيل مجاني', 'أسعار منافسة'],
    },
    
    orderFields: [
      { id: 'product_name', label: 'المنتج', type: 'text', required: true },
      { id: 'quantity', label: 'الكمية', type: 'number', required: true },
      { id: 'color', label: 'اللون', type: 'select', required: false, options: ['أسود', 'أبيض', 'أزرق', 'أحمر', 'أخضر'] },
      { id: 'customer_name', label: 'الاسم الكامل', type: 'text', required: true },
      { id: 'customer_phone', label: 'رقم الهاتف', type: 'tel', required: true },
      { id: 'address', label: 'عنوان التوصيل', type: 'textarea', required: true },
      { id: 'notes', label: 'ملاحظات', type: 'textarea', required: false },
    ],
    
    defaultSections: ['hero_banner', 'categories', 'featured_products', 'offers', 'reviews'],
  },
  
  fashion: {
    id: 'fashion',
    name: 'ملابس',
    nameEn: 'Fashion',
    icon: '👗',
    description: 'ملابس وأزياء رجالية ونسائية',
    
    dashboard: {
      sections: [
        { id: 'products', label: 'المنتجات', icon: '👕', enabled: true },
        { id: 'categories', label: 'الأقسام', icon: '📂', enabled: true },
        { id: 'sizes', label: 'المقاسات', icon: '📏', enabled: true },
        { id: 'colors', label: 'الألوان', icon: '🎨', enabled: true },
        { id: 'brands', label: 'الماركات', icon: '🏷️', enabled: true },
        { id: 'materials', label: 'الخامات', icon: '🧵', enabled: true },
        { id: 'offers', label: 'العروض', icon: '🏷️', enabled: true },
        { id: 'orders', label: 'الطلبات', icon: '📦', enabled: true },
      ],
      primaryColor: '#ec4899',
      secondaryColor: '#be185d',
    },
    
    store: {
      layout: 'grid',
      showProducts: true,
      showServices: false,
      showMenu: false,
      categories: ['رجالي', 'نسائي', 'أطفال', 'رياضي'],
      features: ['جودة عالية', 'تصاميم عصرية', 'أسعار مناسبة', 'توصيل سريع'],
    },
    
    orderFields: [
      { id: 'product_name', label: 'المنتج', type: 'text', required: true },
      { id: 'size', label: 'المقاس', type: 'select', required: true, options: ['S', 'M', 'L', 'XL', 'XXL'] },
      { id: 'color', label: 'اللون', type: 'select', required: true, options: ['أسود', 'أبيض', 'أزرق', 'أحمر', 'أخضر', 'رمادي'] },
      { id: 'quantity', label: 'الكمية', type: 'number', required: true },
      { id: 'customer_name', label: 'الاسم', type: 'text', required: true },
      { id: 'customer_phone', label: 'الهاتف', type: 'tel', required: true },
      { id: 'address', label: 'العنوان', type: 'textarea', required: true },
    ],
    
    defaultSections: ['hero_banner', 'categories', 'new_arrivals', 'offers', 'reviews'],
  },
  
  shoes: {
    id: 'shoes',
    name: 'أحذية',
    nameEn: 'Shoes',
    icon: '👟',
    description: 'أحذية رياضية وكاجوال',
    
    dashboard: {
      sections: [
        { id: 'products', label: 'المنتجات', icon: '👟', enabled: true },
        { id: 'categories', label: 'الأقسام', icon: '📂', enabled: true },
        { id: 'sizes', label: 'المقاسات', icon: '📏', enabled: true },
        { id: 'colors', label: 'الألوان', icon: '🎨', enabled: true },
        { id: 'brands', label: 'الماركات', icon: '🏷️', enabled: true },
        { id: 'materials', label: 'الخامات', icon: '🧵', enabled: true },
        { id: 'offers', label: 'العروض', icon: '⭐', enabled: true },
        { id: 'orders', label: 'الطلبات', icon: '📦', enabled: true },
      ],
      primaryColor: '#10b981',
      secondaryColor: '#047857',
    },
    
    store: {
      layout: 'grid',
      showProducts: true,
      showServices: false,
      showMenu: false,
      categories: ['رجالي', 'نسائي', 'أطفال', 'رياضي'],
      features: ['راحة فائقة', 'جودة عالية', 'تصاميم عصرية', 'ضمان'],
    },
    
    orderFields: [
      { id: 'product_name', label: 'المنتج', type: 'text', required: true },
      { id: 'size', label: 'المقاس', type: 'select', required: true, options: ['38', '39', '40', '41', '42', '43', '44', '45'] },
      { id: 'color', label: 'اللون', type: 'select', required: true, options: ['أسود', 'أبيض', 'بني'] },
      { id: 'quantity', label: 'الكمية', type: 'number', required: true },
      { id: 'customer_name', label: 'الاسم', type: 'text', required: true },
      { id: 'customer_phone', label: 'الهاتف', type: 'tel', required: true },
      { id: 'address', label: 'العنوان', type: 'textarea', required: true },
    ],
    
    defaultSections: ['hero_banner', 'categories', 'featured_products', 'offers', 'reviews'],
  },
  
  perfumes: {
    id: 'perfumes',
    name: 'عطور',
    nameEn: 'Perfumes',
    icon: '✨',
    description: 'عطور شرقية وغربية فاخرة',
    
    dashboard: {
      sections: [
        { id: 'products', label: 'المنتجات', icon: '🧴', enabled: true },
        { id: 'categories', label: 'الأقسام', icon: '📂', enabled: true },
        { id: 'brands', label: 'الماركات', icon: '🏷️', enabled: true },
        { id: 'scents', label: 'الروائح', icon: '🌸', enabled: true },
        { id: 'offers', label: 'العروض', icon: '⭐', enabled: true },
        { id: 'orders', label: 'الطلبات', icon: '📦', enabled: true },
      ],
      primaryColor: '#d4a63d',
      secondaryColor: '#b8860b',
    },
    
    store: {
      layout: 'luxury',
      showProducts: true,
      showServices: false,
      showMenu: false,
      categories: ['عطور رجالية', 'عطور نسائية', 'عطور أطفال', 'بخور'],
      features: ['عطور أصلية', 'تغليف فاخر', 'هدايا مجانية', 'ضمان'],
    },
    
    orderFields: [
      { id: 'product_name', label: 'العطر', type: 'text', required: true },
      { id: 'size', label: 'الحجم', type: 'select', required: true, options: ['50ml', '100ml', '200ml'] },
      { id: 'quantity', label: 'الكمية', type: 'number', required: true },
      { id: 'customer_name', label: 'الاسم', type: 'text', required: true },
      { id: 'customer_phone', label: 'الهاتف', type: 'tel', required: true },
      { id: 'address', label: 'العنوان', type: 'textarea', required: true },
      { id: 'gift_wrap', label: 'تغليف هدية', type: 'select', required: false, options: ['نعم', 'لا'] },
    ],
    
    defaultSections: ['hero_banner', 'categories', 'featured_products', 'offers', 'reviews'],
  },
  
  electronics: {
    id: 'electronics',
    name: 'إلكترونيات',
    nameEn: 'Electronics',
    icon: '💻',
    description: 'أجهزة إلكترونية وكمبيوترات',
    
    dashboard: {
      sections: [
        { id: 'products', label: 'المنتجات', icon: '📦', enabled: true },
        { id: 'categories', label: 'التصنيفات', icon: '📂', enabled: true },
        { id: 'brands', label: 'الماركات', icon: '🏷️', enabled: true },
        { id: 'specs', label: 'المواصفات', icon: '⚙️', enabled: true },
        { id: 'warranty', label: 'الضمان', icon: '🛡️', enabled: true },
        { id: 'offers', label: 'العروض', icon: '⭐', enabled: true },
        { id: 'orders', label: 'الطلبات', icon: '📋', enabled: true },
      ],
      primaryColor: '#6366f1',
      secondaryColor: '#4f46e5',
    },
    
    store: {
      layout: 'grid',
      showProducts: true,
      showServices: false,
      showMenu: false,
      categories: ['لابتوبات', 'هواتف', 'شاشات', 'سماعات', 'ملحقات'],
      features: ['ضمان سنة', 'دعم فني', 'توصيل مجاني', 'أسعار تنافسية'],
    },
    
    orderFields: [
      { id: 'product_name', label: 'المنتج', type: 'text', required: true },
      { id: 'quantity', label: 'الكمية', type: 'number', required: true },
      { id: 'customer_name', label: 'الاسم', type: 'text', required: true },
      { id: 'customer_phone', label: 'الهاتف', type: 'tel', required: true },
      { id: 'address', label: 'العنوان', type: 'textarea', required: true },
    ],
    
    defaultSections: ['hero_banner', 'categories', 'featured_products', 'offers', 'reviews'],
  },
  
  restaurant: {
    id: 'restaurant',
    name: 'مطعم',
    nameEn: 'Restaurant',
    icon: '🍽️',
    description: 'مطعم ومأكولات',
    
    dashboard: {
      sections: [
        { id: 'menu', label: 'قائمة الطعام', icon: '🍕', enabled: true },
        { id: 'drinks', label: 'المشروبات', icon: '🥤', enabled: true },
        { id: 'meals', label: 'الوجبات', icon: '🍽️', enabled: true },
        { id: 'addons', label: 'الإضافات', icon: '➕', enabled: true },
        { id: 'orders', label: 'الطلبات', icon: '📋', enabled: true },
        { id: 'delivery', label: 'التوصيل', icon: '🚚', enabled: true },
        { id: 'tables', label: 'الطاولات', icon: '🪑', enabled: true },
        { id: 'hours', label: 'أوقات العمل', icon: '⏰', enabled: true },
      ],
      primaryColor: '#ef4444',
      secondaryColor: '#b91c1c',
    },
    
    store: {
      layout: 'list',
      showProducts: true,
      showServices: false,
      showMenu: true,
      categories: ['وجبات رئيسية', 'مشروبات', 'حلويات', 'مقبلات'],
      features: ['توصيل سريع', 'جودة عالية', 'أسعار مناسبة', 'عروض يومية'],
    },
    
    orderFields: [
      { id: 'meal_type', label: 'نوع الطلب', type: 'select', required: true, options: ['توصيل', 'استلام', 'تناول في المطعم'] },
      { id: 'items', label: 'الطلبات', type: 'textarea', required: true, placeholder: 'اكتب الطلبات بالتفصيل...' },
      { id: 'customer_name', label: 'الاسم', type: 'text', required: true },
      { id: 'customer_phone', label: 'الهاتف', type: 'tel', required: true },
      { id: 'address', label: 'العنوان', type: 'textarea', required: false },
      { id: 'notes', label: 'ملاحظات خاصة', type: 'textarea', required: false },
    ],
    
    defaultSections: ['hero_banner', 'menu_categories', 'featured_meals', 'offers', 'reviews'],
  },
  
  supermarket: {
    id: 'supermarket',
    name: 'سوبر ماركت',
    nameEn: 'Supermarket',
    icon: '🛒',
    description: 'مواد غذائية ومنتجات يومية',
    
    dashboard: {
      sections: [
        { id: 'products', label: 'المنتجات', icon: '📦', enabled: true },
        { id: 'categories', label: 'الأقسام', icon: '📂', enabled: true },
        { id: 'offers', label: 'العروض', icon: '🏷️', enabled: true },
        { id: 'orders', label: 'الطلبات', icon: '📋', enabled: true },
        { id: 'delivery', label: 'التوصيل', icon: '🚚', enabled: true },
      ],
      primaryColor: '#22c55e',
      secondaryColor: '#15803d',
    },
    
    store: {
      layout: 'grid',
      showProducts: true,
      showServices: false,
      showMenu: false,
      categories: ['خضروات', 'فواكه', 'منتجات غذائية', 'مشروبات', 'منظفات'],
      features: ['منتجات طازجة', 'أسعار منافسة', 'توصيل سريع', 'عروض أسبوعية'],
    },
    
    orderFields: [
      { id: 'items', label: 'المنتجات المطلوبة', type: 'textarea', required: true },
      { id: 'customer_name', label: 'الاسم', type: 'text', required: true },
      { id: 'customer_phone', label: 'الهاتف', type: 'tel', required: true },
      { id: 'address', label: 'العنوان', type: 'textarea', required: true },
    ],
    
    defaultSections: ['hero_banner', 'categories', 'featured_products', 'offers', 'reviews'],
  },
  
  home_tools: {
    id: 'home_tools',
    name: 'أدوات منزلية',
    nameEn: 'Home Tools',
    icon: '🏠',
    description: 'أدوات ومعدات منزلية',
    
    dashboard: {
      sections: [
        { id: 'products', label: 'المنتجات', icon: '📦', enabled: true },
        { id: 'categories', label: 'الأقسام', icon: '📂', enabled: true },
        { id: 'offers', label: 'العروض', icon: '⭐', enabled: true },
        { id: 'orders', label: 'الطلبات', icon: '📋', enabled: true },
      ],
      primaryColor: '#f59e0b',
      secondaryColor: '#d97706',
    },
    
    store: {
      layout: 'grid',
      showProducts: true,
      showServices: false,
      showMenu: false,
      categories: ['أدوات مطبخ', 'أدوات تنظيف', 'ديكور', 'أثاث'],
      features: ['جودة عالية', 'أسعار مناسبة', 'ضمان', 'توصيل'],
    },
    
    orderFields: [
      { id: 'product_name', label: 'المنتج', type: 'text', required: true },
      { id: 'quantity', label: 'الكمية', type: 'number', required: true },
      { id: 'customer_name', label: 'الاسم', type: 'text', required: true },
      { id: 'customer_phone', label: 'الهاتف', type: 'tel', required: true },
      { id: 'address', label: 'العنوان', type: 'textarea', required: true },
    ],
    
    defaultSections: ['hero_banner', 'categories', 'featured_products', 'offers', 'reviews'],
  },
  
  jewelry: {
    id: 'jewelry',
    name: 'مجوهرات',
    nameEn: 'Jewelry',
    icon: '💎',
    description: 'مجوهرات وإكسسوارات فاخرة',
    
    dashboard: {
      sections: [
        { id: 'products', label: 'المنتجات', icon: '💎', enabled: true },
        { id: 'categories', label: 'الأقسام', icon: '📂', enabled: true },
        { id: 'materials', label: 'الخامات', icon: '⚙️', enabled: true },
        { id: 'offers', label: 'العروض', icon: '⭐', enabled: true },
        { id: 'orders', label: 'الطلبات', icon: '📋', enabled: true },
      ],
      primaryColor: '#d4a63d',
      secondaryColor: '#b8860b',
    },
    
    store: {
      layout: 'luxury',
      showProducts: true,
      showServices: false,
      showMenu: false,
      categories: ['خواتم', 'أساور', 'قلائد', 'أقراط'],
      features: ['ذهب عيار 18', 'ألماس طبيعي', 'تصاميم حصرية', 'شهادة ضمان'],
    },
    
    orderFields: [
      { id: 'product_name', label: 'المنتج', type: 'text', required: true },
      { id: 'size', label: 'المقاس', type: 'select', required: false, options: ['صغير', 'متوسط', 'كبير'] },
      { id: 'customer_name', label: 'الاسم', type: 'text', required: true },
      { id: 'customer_phone', label: 'الهاتف', type: 'tel', required: true },
      { id: 'address', label: 'العنوان', type: 'textarea', required: true },
    ],
    
    defaultSections: ['hero_banner', 'categories', 'featured_products', 'offers', 'reviews'],
  },
  
  books: {
    id: 'books',
    name: 'مكتبة',
    nameEn: 'Books',
    icon: '📚',
    description: 'كتب ومراجع',
    
    dashboard: {
      sections: [
        { id: 'products', label: 'الكتب', icon: '📚', enabled: true },
        { id: 'categories', label: 'الأقسام', icon: '📂', enabled: true },
        { id: 'authors', label: 'المؤلفون', icon: '✍️', enabled: true },
        { id: 'offers', label: 'العروض', icon: '⭐', enabled: true },
        { id: 'orders', label: 'الطلبات', icon: '📋', enabled: true },
      ],
      primaryColor: '#8b5cf6',
      secondaryColor: '#6d28d9',
    },
    
    store: {
      layout: 'grid',
      showProducts: true,
      showServices: false,
      showMenu: false,
      categories: ['روايات', 'كتب علمية', 'أطفال', 'مراجع'],
      features: ['كتب أصلية', 'أسعار مناسبة', 'توصيل', 'عروض دورية'],
    },
    
    orderFields: [
      { id: 'book_title', label: 'عنوان الكتاب', type: 'text', required: true },
      { id: 'author', label: 'المؤلف', type: 'text', required: true },
      { id: 'quantity', label: 'الكمية', type: 'number', required: true },
      { id: 'customer_name', label: 'الاسم', type: 'text', required: true },
      { id: 'customer_phone', label: 'الهاتف', type: 'tel', required: true },
      { id: 'address', label: 'العنوان', type: 'textarea', required: true },
    ],
    
    defaultSections: ['hero_banner', 'categories', 'featured_books', 'offers', 'reviews'],
  },
  
  pharmacy: {
    id: 'pharmacy',
    name: 'صيدلية',
    nameEn: 'Pharmacy',
    icon: '💊',
    description: 'أدوية ومستحضرات طبية',
    
    dashboard: {
      sections: [
        { id: 'products', label: 'المنتجات', icon: '💊', enabled: true },
        { id: 'categories', label: 'الأقسام', icon: '📂', enabled: true },
        { id: 'prescriptions', label: 'الوصفات الطبية', icon: '📋', enabled: true },
        { id: 'orders', label: 'الطلبات', icon: '📦', enabled: true },
        { id: 'delivery', label: 'التوصيل', icon: '🚚', enabled: true },
      ],
      primaryColor: '#10b981',
      secondaryColor: '#047857',
    },
    
    store: {
      layout: 'grid',
      showProducts: true,
      showServices: true,
      showMenu: false,
      categories: ['أدوية', 'مستحضرات تجميل', 'فيتامينات', 'أجهزة طبية'],
      features: ['منتجات أصلية', 'استشارات طبية', 'توصيل سريع', 'أسعار مناسبة'],
    },
    
    orderFields: [
      { id: 'product_name', label: 'المنتج', type: 'text', required: true },
      { id: 'prescription', label: 'الوصفة الطبية', type: 'file', required: false },
      { id: 'customer_name', label: 'الاسم', type: 'text', required: true },
      { id: 'customer_phone', label: 'الهاتف', type: 'tel', required: true },
      { id: 'address', label: 'العنوان', type: 'textarea', required: true },
    ],
    
    defaultSections: ['hero_banner', 'categories', 'featured_products', 'services', 'reviews'],
  },
  
  sweets: {
    id: 'sweets',
    name: 'حلويات',
    nameEn: 'Sweets',
    icon: '🍰',
    description: 'حلويات وشوكولاتة',
    
    dashboard: {
      sections: [
        { id: 'products', label: 'المنتجات', icon: '🍰', enabled: true },
        { id: 'categories', label: 'الأقسام', icon: '📂', enabled: true },
        { id: 'occasions', label: 'المناسبات', icon: '🎂', enabled: true },
        { id: 'offers', label: 'العروض', icon: '⭐', enabled: true },
        { id: 'orders', label: 'الطلبات', icon: '📋', enabled: true },
        { id: 'delivery', label: 'التوصيل', icon: '🚚', enabled: true },
      ],
      primaryColor: '#ec4899',
      secondaryColor: '#be185d',
    },
    
    store: {
      layout: 'grid',
      showProducts: true,
      showServices: true,
      showMenu: false,
      categories: ['شوكولاتة', 'كيك', 'حلويات شرقية', 'مخبوزات'],
      features: ['طازجة يومياً', 'مكونات طبيعية', 'تغليف فاخر', 'توصيل سريع'],
    },
    
    orderFields: [
      { id: 'product_name', label: 'المنتج', type: 'text', required: true },
      { id: 'occasion', label: 'المناسبة', type: 'select', required: false, options: ['عيد ميلاد', 'زفاف', 'مناسبة خاصة', 'أخرى'] },
      { id: 'message', label: 'رسالة على الكيك', type: 'textarea', required: false },
      { id: 'customer_name', label: 'الاسم', type: 'text', required: true },
      { id: 'customer_phone', label: 'الهاتف', type: 'tel', required: true },
      { id: 'address', label: 'العنوان', type: 'textarea', required: true },
    ],
    
    defaultSections: ['hero_banner', 'categories', 'featured_products', 'offers', 'reviews'],
  },
  
  accessories: {
    id: 'accessories',
    name: 'إكسسوارات',
    nameEn: 'Accessories',
    icon: '👜',
    description: 'إكسسوارات وأحزمة',
    
    dashboard: {
      sections: [
        { id: 'products', label: 'المنتجات', icon: '👜', enabled: true },
        { id: 'categories', label: 'الأقسام', icon: '📂', enabled: true },
        { id: 'offers', label: 'العروض', icon: '⭐', enabled: true },
        { id: 'orders', label: 'الطلبات', icon: '📋', enabled: true },
      ],
      primaryColor: '#f59e0b',
      secondaryColor: '#d97706',
    },
    
    store: {
      layout: 'grid',
      showProducts: true,
      showServices: false,
      showMenu: false,
      categories: ['حقائب', 'أحزمة', 'نظارات', 'ساعات'],
      features: ['جودة عالية', 'تصاميم عصرية', 'أسعار مناسبة', 'ضمان'],
    },
    
    orderFields: [
      { id: 'product_name', label: 'المنتج', type: 'text', required: true },
      { id: 'quantity', label: 'الكمية', type: 'number', required: true },
      { id: 'customer_name', label: 'الاسم', type: 'text', required: true },
      { id: 'customer_phone', label: 'الهاتف', type: 'tel', required: true },
      { id: 'address', label: 'العنوان', type: 'textarea', required: true },
    ],
    
    defaultSections: ['hero_banner', 'categories', 'featured_products', 'offers', 'reviews'],
  },
  
  furniture: {
    id: 'furniture',
    name: 'أثاث',
    nameEn: 'Furniture',
    icon: '🪑',
    description: 'أثاث وديكور',
    
    dashboard: {
      sections: [
        { id: 'products', label: 'المنتجات', icon: '🪑', enabled: true },
        { id: 'categories', label: 'الأقسام', icon: '📂', enabled: true },
        { id: 'offers', label: 'العروض', icon: '⭐', enabled: true },
        { id: 'orders', label: 'الطلبات', icon: '📋', enabled: true },
        { id: 'delivery', label: 'التوصيل والتركيب', icon: '🚚', enabled: true },
      ],
      primaryColor: '#92400e',
      secondaryColor: '#78350f',
    },
    
    store: {
      layout: 'grid',
      showProducts: true,
      showServices: true,
      showMenu: false,
      categories: ['غرف نوم', 'غرف معيشة', 'مطابخ', 'مكاتب'],
      features: ['خشب طبيعي', 'ضمان 5 سنوات', 'توصيل وتركيب', 'تصاميم عصرية'],
    },
    
    orderFields: [
      { id: 'product_name', label: 'المنتج', type: 'text', required: true },
      { id: 'color', label: 'اللون', type: 'select', required: false, options: ['بني', 'أبيض', 'أسود', 'رمادي'] },
      { id: 'customer_name', label: 'الاسم', type: 'text', required: true },
      { id: 'customer_phone', label: 'الهاتف', type: 'tel', required: true },
      { id: 'address', label: 'العنوان', type: 'textarea', required: true },
      { id: 'notes', label: 'ملاحظات التركيب', type: 'textarea', required: false },
    ],
    
    defaultSections: ['hero_banner', 'categories', 'featured_products', 'offers', 'reviews'],
  },
  
  general: {
    id: 'general',
    name: 'عام',
    nameEn: 'General',
    icon: '🏪',
    description: 'متجر عام متعدد الأقسام',
    
    dashboard: {
      sections: [
        { id: 'products', label: 'المنتجات', icon: '📦', enabled: true },
        { id: 'categories', label: 'الأقسام', icon: '📂', enabled: true },
        { id: 'offers', label: 'العروض', icon: '⭐', enabled: true },
        { id: 'orders', label: 'الطلبات', icon: '📋', enabled: true },
        { id: 'customers', label: 'العملاء', icon: '👥', enabled: true },
      ],
      primaryColor: '#6b7280',
      secondaryColor: '#4b5563',
    },
    
    store: {
      layout: 'grid',
      showProducts: true,
      showServices: false,
      showMenu: false,
      categories: ['منتجات متنوعة'],
      features: ['منتجات متنوعة', 'أسعار مناسبة', 'توصيل سريع'],
    },
    
    orderFields: [
      { id: 'product_name', label: 'المنتج', type: 'text', required: true },
      { id: 'quantity', label: 'الكمية', type: 'number', required: true },
      { id: 'customer_name', label: 'الاسم', type: 'text', required: true },
      { id: 'customer_phone', label: 'الهاتف', type: 'tel', required: true },
      { id: 'address', label: 'العنوان', type: 'textarea', required: true },
    ],
    
    defaultSections: ['hero_banner', 'categories', 'featured_products', 'offers', 'reviews'],
  },
};

/**
 * Detect business type from store category or name
 */
export function detectBusinessType(category: string, name: string = ''): BusinessType {
  const cat = category.toLowerCase();
  const nm = name.toLowerCase();
  
  // Phone repair
  if (cat.includes('صيانة') || cat.includes('صيانة هواتف') || cat.includes('إصلاح') || 
      nm.includes('صيانة') || nm.includes('إصلاح')) {
    return 'phone_repair';
  }
  
  // Phone sales
  if (cat.includes('هواتف') || cat.includes('جوالات') || cat.includes('موبايل') ||
      cat.includes('بيع هواتف') || nm.includes('هواتف') || nm.includes('جوال')) {
    return 'phone_sales';
  }
  
  // Fashion
  if (cat.includes('ملابس') || cat.includes('أزياء') || cat.includes('موضة') ||
      cat.includes('فاشن') || nm.includes('ملابس') || nm.includes('أزياء')) {
    return 'fashion';
  }
  
  // Shoes
  if (cat.includes('أحذية') || cat.includes('حذاء') || cat.includes('رياضة') ||
      nm.includes('أحذية') || nm.includes('حذاء')) {
    return 'shoes';
  }
  
  // Perfumes
  if (cat.includes('عطور') || cat.includes('بخور') || cat.includes('عطر') ||
      nm.includes('عطور') || nm.includes('عطر')) {
    return 'perfumes';
  }
  
  // Electronics
  if (cat.includes('إلكترونيات') || cat.includes('أجهزة') || cat.includes('كمبيوتر') ||
      cat.includes('لابتوب') || nm.includes('إلكترونيات')) {
    return 'electronics';
  }
  
  // Restaurant
  if (cat.includes('مطعم') || cat.includes('مأكولات') || cat.includes('طعام') ||
      cat.includes('وجبات') || nm.includes('مطعم')) {
    return 'restaurant';
  }
  
  // Supermarket
  if (cat.includes('سوبر') || cat.includes('ماركت') || cat.includes('مواد غذائية') ||
      nm.includes('سوبر') || nm.includes('ماركت')) {
    return 'supermarket';
  }
  
  // Home tools
  if (cat.includes('أدوات منزلية') || cat.includes('مطبخ') || cat.includes('ديكور') ||
      nm.includes('أدوات') || nm.includes('منزلية')) {
    return 'home_tools';
  }
  
  // Jewelry
  if (cat.includes('مجوهرات') || cat.includes('ذهب') || cat.includes('ألماس') ||
      nm.includes('مجوهرات') || nm.includes('ذهب')) {
    return 'jewelry';
  }
  
  // Books
  if (cat.includes('كتب') || cat.includes('مكتبة') || cat.includes('روايات') ||
      nm.includes('كتب') || nm.includes('مكتبة')) {
    return 'books';
  }
  
  // Pharmacy
  if (cat.includes('صيدلية') || cat.includes('أدوية') || cat.includes('مستحضرات') ||
      nm.includes('صيدلية') || nm.includes('أدوية')) {
    return 'pharmacy';
  }
  
  // Sweets
  if (cat.includes('حلويات') || cat.includes('شوكولاتة') || cat.includes('كيك') ||
      nm.includes('حلويات') || nm.includes('شوكولاتة')) {
    return 'sweets';
  }
  
  // Accessories
  if (cat.includes('إكسسوارات') || cat.includes('حقائب') || cat.includes('أحزمة') ||
      nm.includes('إكسسوارات')) {
    return 'accessories';
  }
  
  // Furniture
  if (cat.includes('أثاث') || cat.includes('غرف') || cat.includes('مطابخ') ||
      nm.includes('أثاث')) {
    return 'furniture';
  }
  
  return 'general';
}

/**
 * Get template by business type
 */
export function getBusinessTemplate(businessType: BusinessType): BusinessTemplate {
  return BUSINESS_TEMPLATES[businessType] || BUSINESS_TEMPLATES.general;
}