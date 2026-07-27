
export interface MIXCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  description: string;
  rating: number;
  stock: number;
  salesCount: number;
  isOffer: boolean;
  offerText?: string;
  featured?: boolean;
  condition?: 'new' | 'used';
  warranty?: string;
  specs?: Record<string, string>;
  brand?: string;
  deviceModel?: string;
}

export interface MIXBanner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  videoUrl?: string;
  linkType: 'offer' | 'store' | 'category';
  linkValue: string;
  active: boolean;
  position?: 'hero' | 'middle' | 'promo' | 'sidebar';
  buttonText?: string;
  buttonLink?: string;
  isGlobal?: boolean;
  forceAllStores?: boolean;
  storeId?: string;
  order?: number;
}

export type PaymentGatewayType = 
  | 'cod' 
  | 'vodafoneCash' 
  | 'instapay' 
  | 'etisalatCash' 
  | 'orangeMoney' 
  | 'bankMisr'
  | 'nbe'
  | 'bankTransfer' 
  | 'creditCard' 
  | 'paypal' 
  | 'stripe' 
  | 'moyasar'
  | 'myfatoorah'
  | 'paymob'
  | 'other';

export interface PaymentGateway {
  id: string;
  type: PaymentGatewayType;
  name: string;
  enabled: boolean;
  icon?: string;
  number?: string;
  accountHolderName?: string;
  bankName?: string;
  iban?: string;
  swiftCode?: string;
  branchName?: string;
  clientId?: string;
  clientSecret?: string;
  extraInstructions?: string;
  minAmount?: number;
  maxAmount?: number;
  order?: number;
}

export type CustomFieldType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'tel' 
  | 'email' 
  | 'select' 
  | 'checkbox' 
  | 'radio' 
  | 'date' 
  | 'time' 
  | 'file';

export interface CustomCheckoutField {
  id: string;
  name: string;
  label: string;
  type: CustomFieldType;
  required: boolean;
  enabled: boolean;
  placeholder?: string;
  options?: string[];
  defaultValue?: string;
  helpText?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  order: number;
}

export interface Store {
  id: string;
  name: string;
  logo: string;
  cover: string;
  category: string;
  businessType?: 'phone_repair' | 'phone_sales' | 'fashion' | 'shoes' | 'perfumes' | 'electronics' | 'restaurant' | 'supermarket' | 'home_tools' | 'jewelry' | 'books' | 'pharmacy' | 'sweets' | 'accessories' | 'furniture' | 'general';
  phoneCondition?: 'new' | 'used' | 'both';
  description: string;
  city: string;
  district?: string;
  neighborhood?: string;
  storePhone?: string;
  seoDescription?: string;
  seoKeywords?: string;
  slug?: string;
  country: string;
  rating: number;
  reviewsCount: number;
  productsCount: number;
  themeColor: {
    primary: string;
    secondary: string;
    background: string;
    frameColor?: string;
    textColor?: string;
  };
  layoutType: 'luxury' | 'grid' | 'professional';
  visualTemplate?: string;
  banners: Array<{
    id: string;
    image: string;
    videoUrl?: string;
    title: string;
    subtitle: string;
    linkToCategory: string;
  }>;
  categories: string[];
  featured: boolean;
  status: string;
  ownerId: string;
  commissionRate: number;
  salesCount: number;
  repairServices?: Array<{
    id: string;
    title: string;
    desc: string;
    icon: string;
    price: number;
  }>;
  features?: Array<{
    id: string;
    title: string;
    desc: string;
    icon: string;
  }>;
  sectionsOrder?: string[];
  sectionVisibility?: Record<string, boolean>;
  storeLocation?: {
    address?: string;
    mapUrl?: string;
    lat?: number;
    lng?: number;
    workingHours?: string;
    whatsappPhone?: string;
  };
  servicesList?: Array<{
    id: string;
    title: string;
    desc: string;
    icon: string;
    price?: number;
  }>;
  fontFamily?: string;
  borderRadius?: string;
  shadowType?: string;
  currency?: string;
  paymentGateways?: PaymentGateway[];
  customCheckoutFields?: CustomCheckoutField[];
  epithet?: string;
  templateConfig?: StoreTemplateConfig;
}

export interface Review {
  id: string;
  storeId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Coupon {
  id: string;
  storeId: string | 'all';
  code: string;
  discountType: 'percent' | 'fixed';
  value: number;
  minOrderValue: number;
  active: boolean;
}

export interface Order {
  id: string;
  storeId: string;
  storeName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  total: number;
  status: string;
  date: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'merchant' | 'customer' | 'user';
  storeId?: string;
  status?: string;
  epithet?: string;
}

export interface ChatRoom {
  id: string;
  storeId: string;
  storeName: string;
  storeLogo: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  status: 'active' | 'closed';
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'merchant' | 'customer' | 'user';
  text?: string;
  image?: string;
  orderId?: string;
  timestamp: string;
  read: boolean;
}

export interface StoreTemplateConfig {
  id: string;
  name: string;
  category: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  animations: {
    glowEnabled: boolean;
    pulseEnabled: boolean;
    slideEnabled: boolean;
    hoverScale: boolean;
    neonEffect: boolean;
  };
  layout: {
    borderRadius: string;
    cardStyle: 'neon' | 'glass' | 'solid' | 'minimal';
    bannerStyle: 'fullscreen' | 'compact' | 'minimal';
    gridCols: number;
    showCategoriesBar: boolean;
    showSearchBar: boolean;
    showRepairServices: boolean;
    showFeatures: boolean;
    showReviews: boolean;
    showAbout: boolean;
    sectionsOrder: string[];
  };
  branding: {
    tagline: string;
    subtitle: string;
    heroTitle: string;
    heroSubtitle: string;
    ctaText: string;
    trustedBadge: string;
  };
  repairServices: Array<{
    id: string;
    title: string;
    desc: string;
    icon: string;
    price: number;
  }>;
  features: Array<{
    id: string;
    title: string;
    desc: string;
    icon: string;
  }>;
}

export interface StoreBanner {
  id: string;
  image: string;
  videoUrl?: string;
  title: string;
  subtitle: string;
  linkToCategory?: string;
  position?: 'hero' | 'middle' | 'promo' | 'sidebar';
  buttonText?: string;
  buttonLink?: string;
  active?: boolean;
  order?: number;
}

export type DeviceType = 'phone' | 'tablet' | 'laptop' | 'watch' | 'other';
export type UrgencyType = 'low' | 'medium' | 'high' | 'urgent';

export interface MaintenanceRequest {
  id: string;
  type: DeviceType;
  deviceBrand: string;
  deviceModel: string;
  description: string;
  images: string[];
  urgency: UrgencyType;
  appointmentDate: string;
  appointmentTime: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  storeId: string;
  userId?: string;
  userName?: string;
  userPhone?: string;
  issue?: string;
}
