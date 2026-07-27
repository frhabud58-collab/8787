import { MIXCategory, Store, Product, MIXBanner, Order, Coupon, Review } from '../types';
import { fixArabicInObject } from '../utils/encodingFix';

export const INITIAL_CATEGORIES: MIXCategory[] = [
  {
    id: 'cat-1',
    name: 'ملابس',
    slug: 'clothing',
    icon: 'Shirt',
    description: 'أزياء ملابس وأزياء رجالية ونسائية فاخرة'
  },
  {
    id: 'cat-2',
    name: 'أحذية',
    slug: 'shoes',
    icon: 'Footprints',
    description: 'أرقى الأحذية الرسمية والرياضية الفخمة'
  },
  {
    id: 'cat-3',
    name: 'إلكترونيات',
    slug: 'electronics',
    icon: 'Smartphone',
    description: 'أجهزة ذكية وإلكترونيات استهلاكية حديثة'
  },
  {
    id: 'cat-4',
    name: 'ساعات',
    slug: 'watches',
    icon: 'Watch',
    description: 'ساعات فخمة وذكية من أرقى الماركات'
  },
  {
    id: 'cat-5',
    name: 'إكسسوارات',
    slug: 'accessories',
    icon: 'Gem',
    description: 'حقائب وإكسسوارات راقية تكمل مظهرك'
  },
  {
    id: 'cat-6',
    name: 'مطبخ ومنزل',
    slug: 'kitchen-home',
    icon: 'Utensils',
    description: 'مستلزمات منزل ومطبخ راقية وعصرية'
  },
  {
    id: 'cat-7',
    name: 'ألعاب وهدايا',
    slug: 'games-gifts',
    icon: 'Gamepad2',
    description: 'ألعاب ترفيهية وهدايا مبتكرة لجميع الأعمار'
  },
  {
    id: 'cat-8',
    name: 'سيارات',
    slug: 'cars',
    icon: 'Smartphone',
    description: 'إكسسوارات ومستلزمات سيارات عصرية'
  },
  {
    id: 'cat-9',
    name: 'مطاعم',
    slug: 'restaurants',
    icon: 'Utensils',
    description: 'وجبات ومأكولات شهية من أفضل المطاعم'
  },
  {
    id: 'cat-10',
    name: 'هواتف',
    slug: 'phones',
    icon: 'Smartphone',
    description: 'أحدث الهواتف الذكية والملحقات'
  },
  {
    id: 'cat-11',
    name: 'كمبيوتر',
    slug: 'computers',
    icon: 'Laptop',
    description: 'لابتوبات وكمبيوترات وملحقاتها'
  },
  {
    id: 'cat-12',
    name: 'عطور',
    slug: 'perfumes',
    icon: 'Sparkles',
    description: 'عطور فاخرة وروائح شرقية أصيلة'
  },
  {
    id: 'cat-13',
    name: 'مستحضرات تجميل',
    slug: 'cosmetics',
    icon: 'Palette',
    description: 'مكياج وعناية بالبشرة والجمال'
  },
  {
    id: 'cat-14',
    name: 'مجوهرات',
    slug: 'jewelry',
    icon: 'Gem',
    description: 'مجوهرات ثمينة وأكسسوارات فاخرة'
  },
  {
    id: 'cat-15',
    name: 'أثاث',
    slug: 'furniture',
    icon: 'Sofa',
    description: 'أثاث منزلي ومكتبي عصري'
  },
  {
    id: 'cat-16',
    name: 'سوبر ماركت',
    slug: 'supermarket',
    icon: 'ShoppingCart',
    description: 'منتجات غذائية ومواد استهلاكية'
  },
  {
    id: 'cat-17',
    name: 'كافيهات',
    slug: 'cafes',
    icon: 'Coffee',
    description: 'مقاهي ومشروبات وحلويات'
  },
  {
    id: 'cat-18',
    name: 'أدوات منزلية',
    slug: 'hometools',
    icon: 'Home',
    description: 'أدوات ومستلزمات المنزل'
  },
  {
    id: 'cat-19',
    name: 'رياضة',
    slug: 'sports',
    icon: 'Trophy',
    description: 'مستلزمات رياضية ولياقة بدنية'
  },
  {
    id: 'cat-20',
    name: 'كتب',
    slug: 'books',
    icon: 'BookOpen',
    description: 'كتب عربية وموسوعات ثقافية'
  },
  {
    id: 'cat-21',
    name: 'عقارات',
    slug: 'realestate',
    icon: 'Building2',
    description: 'عقارات وأراضي ومكاتب'
  },
  {
    id: 'cat-22',
    name: 'المزيد',
    slug: 'more',
    icon: 'Sparkles',
    description: 'تصفح باقي الأقسام والمنتجات المتاحة بالمنصة'
  },
  {
    id: 'cat-23',
    name: 'صينات هوات',
    slug: 'phone-cases',
    icon: 'Smartphone',
    description: 'أجمل كفرات الجوال وحمايات الشاشة والإكسسوارات الذكية'
  },
  {
    id: 'cat-24',
    name: 'سوبر ماركت',
    slug: 'supermarket',
    icon: 'ShoppingBag',
    description: 'كل مستلزماتك اليومية من مواد غذائية ومشروبات ومنتجات طازجة'
  },
  {
    id: 'cat-25',
    name: 'أدوات منزلية',
    slug: 'home-tools',
    icon: 'Utensils',
    description: 'أدوات المطبخ والمنزل العصرية بأفضل الأسعار'
  },
  {
    id: 'cat-26',
    name: 'كمبيوترات',
    slug: 'computers',
    icon: 'Smartphone',
    description: 'أحدث أجهزة الكمبيوتر واللابتوب وملحقاتها'
  }
];

export const INITIAL_STORES: Store[] = [
  {
    id: 'store-1',
    name: 'إلكترو ستور',
    logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200&h=200&fit=crop',
    cover: 'https://images.unsplash.com/photo-1468436139062-f60a71c5c892?q=80&w=1200&h=400&fit=crop',
    category: 'إلكترونيات',
    description: 'وجهتك الأولى لأحدث الهواتف والأجهزة الكهربائية والذكية بضمان معتمد وبأفضل الأسعار.',
    city: 'الرياض',
    country: 'السعودية',
    rating: 4.7,
    reviewsCount: 982,
    productsCount: 120,
    themeColor: {
      primary: '#D4A63D', // Gold
      secondary: '#121212', // Dark Gray
      background: '#0B0B0B' // Pitch Black
    },
    layoutType: 'luxury',
    banners: [
      {
        id: 'sb-1-1',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&h=400&fit=crop',
        title: 'عالم الصوتيات الفاخرة',
        subtitle: 'خصومات تصل إلى 30% على السماعات الاحترافية',
        linkToCategory: 'إلكترونيات'
      }
    ],
    categories: ['إلكترونيات', 'ساعات', 'إكسسوارات'],
    featured: true,
    status: 'active',
    ownerId: 'owner-1',
    commissionRate: 5,
    salesCount: 1250
  },
  {
    id: 'store-2',
    name: 'متجر الأناقة',
    logo: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200&h=200&fit=crop',
    cover: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&h=400&fit=crop',
    category: 'ملابس وأزياء',
    description: 'أرقى تصميمات الأزياء العصرية والملابس الفخمة للرجال والنساء والأطفال. أناقة فريدة تناسب جميع المناسبات.',
    city: 'الرياض',
    country: 'السعودية',
    rating: 4.3,
    reviewsCount: 1200,
    productsCount: 85,
    themeColor: {
      primary: '#D4A63D',
      secondary: '#121212',
      background: '#0B0B0B'
    },
    layoutType: 'luxury',
    banners: [
      {
        id: 'sb-2-1',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&h=400&fit=crop',
        title: 'مجموعة الصيف الراقية',
        subtitle: 'ألوان مشرقة وأقمشة طبيعية مريحة لجاذبية مطلقة',
        linkToCategory: 'ملابس'
      }
    ],
    categories: ['ملابس', 'حقائب', 'إكسسوارات'],
    featured: true,
    status: 'active',
    ownerId: 'owner-2',
    commissionRate: 7,
    salesCount: 940
  },
  {
    id: 'store-3',
    name: 'بيت الجمال',
    logo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=200&h=200&fit=crop',
    cover: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200&h=400&fit=crop',
    category: 'مستحضرات تجميل',
    description: 'مستحضرات تجميل أصلية 100% ومنتجات عناية طبيعية وبشرة مشرقة دائماً مع أفضل الخبراء ومستحضرات التجميل.',
    city: 'جدة',
    country: 'السعودية',
    rating: 4.7,
    reviewsCount: 1500,
    productsCount: 64,
    themeColor: {
      primary: '#D4A63D',
      secondary: '#121212',
      background: '#0B0B0B'
    },
    layoutType: 'luxury',
    banners: [
      {
        id: 'sb-3-1',
        image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1200&h=400&fit=crop',
        title: 'بشرة نضرة خالية من العيوب',
        subtitle: 'مجموعة السيروم الطبيعي ومستحضرات الترطيب الفائقة',
        linkToCategory: 'مستحضرات تجميل'
      }
    ],
    categories: ['مستحضرات تجميل', 'عطور'],
    featured: true,
    status: 'active',
    ownerId: 'owner-3',
    commissionRate: 6,
    salesCount: 620
  },
  {
    id: 'store-6',
    name: 'مطعم الذواقة',
    logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=200&h=200&fit=crop',
    cover: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&h=400&fit=crop',
    category: 'مطاعم ومأكولات',
    description: 'أشهى المأكولات والمشروبات والبرجر الطازج المحضر يومياً بصلصاتنا السرية الخاصة من مطاعم ومأكولات الذواقة.',
    city: 'الدمام',
    country: 'السعودية',
    rating: 4.8,
    reviewsCount: 873,
    productsCount: 22,
    themeColor: {
      primary: '#D4A63D',
      secondary: '#121212',
      background: '#0B0B0B'
    },
    layoutType: 'luxury',
    banners: [
      {
        id: 'sb-6-1',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1200&h=400&fit=crop',
        title: 'وجبات عائلية مشبعة',
        subtitle: 'وفر أكثر مع تشكيلة وجبات الذواقة اللذيذة والشهية',
        linkToCategory: 'مطاعم ومأكولات'
      }
    ],
    categories: ['مطاعم ومأكولات'],
    featured: true,
    status: 'active',
    ownerId: 'owner-6',
    commissionRate: 4,
    salesCount: 1540
  },
  {
    id: 'store-mobile-sales',
    name: 'موبايل مارت',
    logo: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=200&h=200&fit=crop',
    cover: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?q=80&w=1200&h=400&fit=crop',
    category: 'إلكترونيات وهواتف',
    description: 'متجر متخصص لبيع أحدث الهواتف الذكية والأجهزة الإلكترونية بأسعار تنافسية وضمان معتمد.',
    city: 'الرياض',
    country: 'السعودية',
    rating: 4.6,
    reviewsCount: 456,
    productsCount: 78,
    themeColor: {
      primary: '#3b82f6',
      secondary: '#121212',
      background: '#0B0B0B'
    },
    layoutType: 'grid',
    visualTemplate: 'mobile',
    banners: [
      {
        id: 'sb-mobile-sales-1',
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&h=400&fit=crop',
        title: 'أحدث إصدارات الهواتف',
        subtitle: 'تسوق أحدث هواتف العام 2025 بخصومات حصرية',
        linkToCategory: 'الهواتف'
      }
    ],
    categories: ['الهواتف', 'إكسسوارات', 'شواحن'],
    featured: true,
    status: 'active',
    ownerId: 'owner-mobile-sales',
    commissionRate: 5,
    salesCount: 890
  },
  {
    id: 'store-mobile-repair',
    name: 'مركز صيانة التميز',
    logo: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=200&h=200&fit=crop',
    cover: 'https://images.unsplash.com/photo-1468436139062-f60a71c5c892?q=80&w=1200&h=400&fit=crop',
    category: 'صيانة هواتف وبيع جوالات',
    description: 'مركز صيانة احترافي للهواتف الذكية مع قطع غيار أصلية وضمان على جميع الخدمات.',
    city: 'جدة',
    country: 'السعودية',
    rating: 4.9,
    reviewsCount: 678,
    productsCount: 45,
    themeColor: {
      primary: '#8b5cf6',
      secondary: '#121212',
      background: '#0B0B0B',
      frameColor: '#0d0a14',
      textColor: '#93c5fd'
    },
    layoutType: 'grid',
    visualTemplate: 'mobile',
    repairServices: [
      { id: 'rs-1', title: 'صيانة شاشات', desc: 'تبديل شاشات أصلية مع ضمان', icon: '📱', price: 299 },
      { id: 'rs-2', title: 'تغيير البطارية', desc: 'بطاريات أصلية عالية الجودة', icon: '🔋', price: 149 },
      { id: 'rs-3', title: 'إصلاح منفذ الشحن', desc: 'حل مشاكل الشحن البطيء', icon: '🔌', price: 99 },
      { id: 'rs-4', title: 'السوفت وير', desc: 'فك قفل وتحديث نظام', icon: '⚙️', price: 120 }
    ],
    banners: [
      {
        id: 'sb-mobile-repair-1',
        image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=1200&h=400&fit=crop',
        title: 'صيانة سريعة وموثوقة',
        subtitle: 'أصلح هاتفك في نفس اليوم مع ضمان',
        linkToCategory: 'صيانة'
      }
    ],
    categories: ['صيانة', 'قطع غيار', 'إكسسوارات'],
    featured: true,
    status: 'active',
    ownerId: 'owner-mobile-repair',
    commissionRate: 5,
    salesCount: 567
  },
  {
    id: 'store-phonecases',
    name: 'كفراتي للصينات والحماية',
    logo: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=200&h=200&fit=crop',
    cover: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=1200&h=400&fit=crop',
    category: 'صينات هوات',
    description: 'متجر متخصص في أجمل وأقوى كفرات الجوال وجميع أنواع الإكسسوارات وحمايات الشاشة بأعلى جودة وأفضل سعر.',
    city: 'الرياض',
    country: 'السعودية',
    rating: 4.8,
    reviewsCount: 312,
    productsCount: 56,
    themeColor: {
      primary: '#ff6b9d',
      secondary: '#121212',
      background: '#0a0a0f',
      frameColor: '#1a0f14',
      textColor: '#f9a8d4'
    },
    layoutType: 'grid',
    visualTemplate: 'phonecases',
    banners: [
      {
        id: 'sb-phonecases-1',
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=1200&h=400&fit=crop',
        title: 'أحدث كفرات الجوال 2026',
        subtitle: 'تصاميم حصرية وأنيقة تناسب جميع الأذواق مع تخفيضات تصل إلى 40%',
        linkToCategory: 'كفرات'
      }
    ],
  categories: ['كفرات', 'حمايات شاشة', 'شواحن', 'إكسسوارات', 'سماعات', 'باور بانك', 'كابلات', 'حامل جوال', 'ساعات ذكية', 'نظارات'],
    featured: true,
    status: 'active',
    ownerId: 'owner-phonecases',
    commissionRate: 5,
    salesCount: 723
  },
  {
    id: 'store-supermarket',
    name: 'سوبر ماركت العائلة',
    logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=200&h=200&fit=crop',
    cover: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&h=400&fit=crop',
    category: 'سوبر ماركت',
    description: 'كل ما تحتاجه العائلة من مواد غذائية طازجة، مشروبات، ومستلزمات يومية بأفضل الأسعار وجودة مضمونة.',
    city: 'جدة',
    country: 'السعودية',
    rating: 4.6,
    reviewsCount: 890,
    productsCount: 120,
    themeColor: {
      primary: '#22c55e',
      secondary: '#121212',
      background: '#050a06',
      frameColor: '#0a1a0e',
      textColor: '#86efac'
    },
    layoutType: 'luxury',
    visualTemplate: 'supermarket',
    banners: [
      {
        id: 'sb-supermarket-1',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200&h=400&fit=crop',
        title: 'عروض الأسبوع الطازجة',
        subtitle: 'تخفيضات كبرى على الخضروات والفواكه واللحوم الطازجة',
        linkToCategory: 'مواد غذائية'
      }
    ],
    categories: ['مواد غذائية', 'مشروبات', 'منظفات', 'طازج'],
    featured: true,
    status: 'active',
    ownerId: 'owner-supermarket',
    commissionRate: 3,
    salesCount: 2340
  },
  {
    id: 'store-hometools',
    name: 'بيت العروسة للأدوات المنزلية',
    logo: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=200&h=200&fit=crop',
    cover: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=1200&h=400&fit=crop',
    category: 'أدوات منزلية',
    description: 'أحدث أدوات المطبخ والمنزل العصرية، أواني طهي، أجهزة كهربائية منزلية، وديكورات أنيقة.',
    city: 'الدمام',
    country: 'السعودية',
    rating: 4.7,
    reviewsCount: 456,
    productsCount: 89,
    themeColor: {
      primary: '#f59e0b',
      secondary: '#121212',
      background: '#0a0804',
      frameColor: '#1a1408',
      textColor: '#fde68a'
    },
    layoutType: 'luxury',
    visualTemplate: 'hometools',
    banners: [
      {
        id: 'sb-hometools-1',
        image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=1200&h=400&fit=crop',
        title: 'تجهيزات مطبخك العصرية',
        subtitle: 'أطقم قدور وأواني طهي فاخرة بخصم 30%',
        linkToCategory: 'أدوات منزلية'
      }
    ],
    categories: ['أدوات منزلية', 'مطبخ', 'ديكور', 'أجهزة'],
    featured: true,
    status: 'active',
    ownerId: 'owner-hometools',
    commissionRate: 4,
    salesCount: 567
  },
  {
    id: 'store-computers',
    name: 'تقنيتي للكمبيوترات والملحقات',
    logo: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=200&h=200&fit=crop',
    cover: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1200&h=400&fit=crop',
    category: 'كمبيوترات',
    description: 'أحدث أجهزة اللابتوب والكمبيوترات المكتبية، قطع التجميع، وملحقات الألعاب والجرافيك.',
    city: 'الرياض',
    country: 'السعودية',
    rating: 4.9,
    reviewsCount: 678,
    productsCount: 95,
    themeColor: {
      primary: '#3b82f6',
      secondary: '#121212',
      background: '#030712',
      frameColor: '#0f172a',
      textColor: '#93c5fd'
    },
    layoutType: 'grid',
    visualTemplate: 'computers',
    banners: [
      {
        id: 'sb-computers-1',
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1200&h=400&fit=crop',
        title: 'أجهزة لابتوب للألعاب',
        subtitle: 'أقوى أجهزة gaming بمعالجات الجيل الجديد وكرت شاشة RTX',
        linkToCategory: 'لابتوب'
      }
    ],
    categories: ['لابتوب', 'قطع كمبيوتر', 'ملحقات', 'شاشات'],
    featured: true,
    status: 'active',
    ownerId: 'owner-computers',
    commissionRate: 5,
    salesCount: 890
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-m-1',
    storeId: 'store-1',
    name: 'ساعة MIX الذكية',
    price: 599,
    originalPrice: 799,
    image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=400&h=400&fit=crop',
    category: 'ساعات',
    description: 'ساعة ذكية فاخرة بشاشة AMOLED فائقة الوضوح، تتبع الصحة والرياضة ومقاومة للماء وتنبيهات ذكية.',
    rating: 4.9,
    stock: 45,
    salesCount: 120,
    isOffer: true,
    offerText: 'خصم خاص 25%',
    featured: true
  },
  {
    id: 'prod-m-2',
    storeId: 'store-1',
    name: 'سماعات MIX اللاسلكية',
    price: 299,
    originalPrice: 399,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&h=400&fit=crop',
    category: 'إلكترونيات',
    description: 'سماعات رأس لاسلكية مريحة مع ميزة إلغاء الضجيج النشط وصوت نقي فائق الدقة وبطارية تدوم طويلاً.',
    rating: 4.8,
    stock: 32,
    salesCount: 95,
    isOffer: true,
    offerText: 'خصم خاص 25%',
    featured: true
  },
  {
    id: 'prod-m-3',
    storeId: 'store-3',
    name: 'عطر MIX الذهبي',
    price: 189,
    originalPrice: 249,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=400&h=400&fit=crop',
    category: 'عطور',
    description: 'عطر شرقي فرنسي فاخر بتركيبة مركزة وفوّاحة تدوم طويلاً بلمسة الذهب الفريدة والعود مع الورد.',
    rating: 4.9,
    stock: 20,
    salesCount: 150,
    isOffer: true,
    offerText: 'خصم خاص 24%',
    featured: true
  },
  {
    id: 'prod-m-4',
    storeId: 'store-2',
    name: 'حقيبة MIX الفاخرة',
    price: 349,
    originalPrice: 489,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=400&h=400&fit=crop',
    category: 'إكسسوارات',
    description: 'حقيبة يد نسائية من الجلد الطبيعي الفاخر بتصميم كلاسيكي عصري مطعم بالحلي والمقابض الذهبية الراقية.',
    rating: 4.7,
    stock: 15,
    salesCount: 88,
    isOffer: true,
    offerText: 'خصم خاص 28%',
    featured: true
  },
  {
    id: 'prod-m-5',
    storeId: 'store-1',
    name: 'سوار MIX الرياضي',
    price: 129,
    originalPrice: 179,
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?q=80&w=400&h=400&fit=crop',
    category: 'ساعات',
    description: 'سوار رياضي خفيف الوزن ومقاوم للتعرق لتتبع حركتك ومعدل ضربات القلب ونظام النوم طوال اليوم بدقة.',
    rating: 4.5,
    stock: 60,
    salesCount: 210,
    isOffer: true,
    offerText: 'خصم خاص 28%',
    featured: true
  },
  {
    id: 'prod-m-6',
    storeId: 'store-6',
    name: 'وجبة برجر الذواقة المزدوجة',
    price: 45,
    originalPrice: 60,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&h=400&fit=crop',
    category: 'مطاعم',
    description: 'شريحتان من اللحم البقري المشوي مع الجبن السويسري والخضروات الطازجة والصلصة الخاصة المميزة.',
    rating: 4.8,
    stock: 100,
    salesCount: 350,
    isOffer: true,
    offerText: 'خصم 25%',
    featured: true
  },
  {
    id: 'prod-m-7',
    storeId: 'store-2',
    name: 'جاكيت شتوي كلاسيكي فخم',
    price: 249,
    originalPrice: 349,
    image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=400&h=400&fit=crop',
    category: 'ملابس',
    description: 'جاكيت رجالي أنيق مبطن يوفر الدفء والأناقة في آن واحد.',
    rating: 4.7,
    stock: 40,
    salesCount: 120,
    isOffer: true,
    offerText: 'خصم الشتاء',
    featured: true
  },
  {
    id: 'prod-pc-1',
    storeId: 'store-phonecases',
    name: 'كفر جوال سيليكون شفاف مضاد للصدمات',
    price: 35,
    originalPrice: 59,
    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?q=80&w=400&h=400&fit=crop',
    category: 'كفرات',
    description: 'كفر سيليكون ناعم الملمس شفاف يبرز جمال هاتفك مع حماية ممتازة من الصدمات والخدوش.',
    rating: 4.7,
    stock: 200,
    salesCount: 540,
    isOffer: true,
    offerText: 'وفر 40%',
    featured: true
  },
  {
    id: 'prod-pc-2',
    storeId: 'store-phonecases',
    name: 'حامي شاشة نانو سيراميك 9H',
    price: 25,
    originalPrice: 45,
    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?q=80&w=400&h=400&fit=crop',
    category: 'حمايات شاشة',
    description: 'حامي شاشة من الزجاج المقوى بصلابة 9H يحمي شاشة هاتفك من الخدوش والكسر.',
    rating: 4.5,
    stock: 300,
    salesCount: 890,
    isOffer: true,
    offerText: 'خصم 44%',
    featured: true
  },
  {
    id: 'prod-pc-3',
    storeId: 'store-phonecases',
    name: 'كفر جوال جلد فاخر مع حامل بطاقات',
    price: 89,
    originalPrice: 129,
    image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?q=80&w=400&h=400&fit=crop',
    category: 'كفرات',
    description: 'كفر جلد طبيعي فاخر مع مكان لحمل البطاقات البنكية والنقود بتصميم أنيق وعملي.',
    rating: 4.8,
    stock: 150,
    salesCount: 320,
    isOffer: true,
    offerText: 'خصم 31%',
    featured: true
  },
  {
    id: 'prod-sm-1',
    storeId: 'store-supermarket',
    name: 'سلة الخضروات الطازجة',
    price: 45,
    originalPrice: 65,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&h=400&fit=crop',
    category: 'مواد غذائية',
    description: 'سلة خضروات طازجة متنوعة تشمل الطماطم والخيار والفلفل والخس والبقدونس.',
    rating: 4.6,
    stock: 50,
    salesCount: 1200,
    isOffer: true,
    offerText: 'خصم 30%',
    featured: true
  },
  {
    id: 'prod-sm-2',
    storeId: 'store-supermarket',
    name: 'حليب طازج كامل الدسم 1 لتر',
    price: 8,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400&h=400&fit=crop',
    category: 'مواد غذائية',
    description: 'حليب طازج كامل الدسم غني بالكالسيوم والفيتامينات.',
    rating: 4.8,
    stock: 200,
    salesCount: 3400,
    isOffer: false,
    featured: true
  },
  {
    id: 'prod-ht-1',
    storeId: 'store-hometools',
    name: 'طقم قدور جرانيت 10 قطع',
    price: 299,
    originalPrice: 449,
    image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=400&h=400&fit=crop',
    category: 'أدوات منزلية',
    description: 'طقم قدور جرانيت عالي الجودة غير قابل للالتصاق مع أغطية زجاجية محكمة الإغلاق.',
    rating: 4.9,
    stock: 30,
    salesCount: 450,
    isOffer: true,
    offerText: 'خصم 33%',
    featured: true
  },
  {
    id: 'prod-comp-1',
    storeId: 'store-computers',
    name: 'لابتوب ألعاب فائق الأداء',
    price: 5499,
    originalPrice: 6999,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=400&h=400&fit=crop',
    category: 'لابتوب',
    description: 'لابتوب ألعاب بمعالج Intel Core i9 وذاكرة 32GB رام وكرت شاشة RTX 4070.',
    rating: 4.9,
    stock: 15,
    salesCount: 89,
    isOffer: true,
    offerText: 'خصم 21%',
    featured: true
  },
  {
    id: 'prod-comp-2',
    storeId: 'store-computers',
    name: 'ماوس ألعاب لاسلكي RGB',
    price: 149,
    originalPrice: 229,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=400&h=400&fit=crop',
    category: 'ملحقات',
    description: 'ماوس ألعاب لاسلكي بدقة 16000 DPI مع إضاءة RGB قابلة للتخصيص.',
    rating: 4.7,
    stock: 50,
    salesCount: 230,
    isOffer: true,
    offerText: 'خصم 35%',
    featured: true
  }
];

export const INITIAL_BANNERS: MIXBanner[] = [
  {
    id: 'mb-1',
    title: 'عروض حصرية تصل إلى 50% داخل منصة MIX',
    subtitle: 'اكتشف آلاف المنتجات الفاخرة من المتاجر الكبرى الموثوقة مع شحن سريع وآمن.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&h=500&fit=crop',
    linkType: 'offer',
    linkValue: 'خصم حصرى بمناسبة تدشين المنصة الموحدة',
    active: true
  },
  {
    id: 'mb-2',
    title: 'أقوى العطور والبخور مع العتيبي للعود',
    subtitle: 'تسوق أفضل أنواع العود والدهن المعتق والخلطات الحصرية مباشرة بنقرة واحدة.',
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1200&h=500&fit=crop',
    linkType: 'store',
    linkValue: 'store-5',
    active: true
  },
  {
    id: 'mb-3',
    title: 'أناقة وتألق غير محدود مع مجوهرات رويال',
    subtitle: 'تصاميم فريدة من الألماس والذهب الخالص عيار 21 لتلائم مناسباتكم السعيدة.',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1200&h=500&fit=crop',
    linkType: 'store',
    linkValue: 'store-4',
    active: true
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    storeId: 'store-1',
    userName: 'خالد السديري',
    rating: 5,
    comment: 'جودة الهاتف رائعة جداً، والضمان معتمد. التوصيل في الرياض استغرق 3 ساعات فقط! خدمة ممتازة.',
    date: '2026-06-15'
  },
  {
    id: 'rev-2',
    storeId: 'store-5',
    userName: 'عبدالرحمن العتيبي',
    rating: 5,
    comment: 'دهن العود السيوفي لا يعلى عليه، رائحته فواحة جداً وتدوم لثلاثة أيام على الغترة. والعلبة فخمة جداً تصلح هدية ملكية.',
    date: '2026-06-20'
  },
  {
    id: 'rev-3',
    storeId: 'store-4',
    userName: 'سارة آل نهيان',
    rating: 5,
    comment: 'تصميم الخاتم رقيق جداً والألماس نقي وجميل. خدمة العملاء راقية جداً في متجر رويال.',
    date: '2026-06-25'
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'cp-1',
    storeId: 'store-1',
    code: 'TECH10',
    discountType: 'percent',
    value: 10,
    minOrderValue: 500,
    active: true
  },
  {
    id: 'cp-2',
    storeId: 'store-5',
    code: 'OUD15',
    discountType: 'percent',
    value: 15,
    minOrderValue: 300,
    active: true
  },
  {
    id: 'cp-3',
    storeId: 'store-2',
    code: 'FASHION50',
    discountType: 'fixed',
    value: 50,
    minOrderValue: 200,
    active: true
  },
  {
    id: 'cp-all',
    storeId: 'all',
    code: 'MIXNEW',
    discountType: 'percent',
    value: 5,
    minOrderValue: 100,
    active: true
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'order-1',
    storeId: 'store-1',
    storeName: 'تيك ستور | Tech Store',
    customerName: 'فهد الأحمد',
    customerEmail: 'fahad@example.com',
    customerPhone: '0501234567',
    customerAddress: 'الرياض - حي الياسمين - شارع الملك عبدالعزيز',
    items: [
      {
        productId: 'prod-1-1',
        productName: 'آيفون 14 برو ماكس (ذهبي ملكي)',
        quantity: 1,
        price: 4499,
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=400&h=400&fit=crop'
      }
    ],
    total: 4499,
    status: 'delivered',
    date: '2026-06-25 14:32'
  },
  {
    id: 'order-2',
    storeId: 'store-5',
    storeName: 'متجر العتيبي للعود والعطور',
    customerName: 'محمد الشهري',
    customerEmail: 'mohammed@example.com',
    customerPhone: '0547654321',
    customerAddress: 'مكة المكرمة - حي العوالي',
    items: [
      {
        productId: 'prod-5-3',
        productName: 'عطر العتيبي الخاص - ذهب 24 قيراط',
        quantity: 2,
        price: 450,
        image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=400&h=400&fit=crop'
      }
    ],
    total: 900,
    status: 'processing',
    date: '2026-06-27 10:15'
  }
];

// Helper functions for Local Storage Persistence
export const loadData = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    
    const parsed = JSON.parse(item);
    // Fix any corrupted Arabic text before returning
    const fixed = fixArabicInObject(parsed);
    
    // Save fixed data back to localStorage if it was corrupted
    if (JSON.stringify(fixed) !== item) {
      localStorage.setItem(key, JSON.stringify(fixed));
    }
    
    return fixed as T;
  } catch (error) {
    console.error(`Error loading key ${key} from localStorage`, error);
    return defaultValue;
  }
};

export const saveData = <T>(key: string, data: T): void => {
  try {
    const json = JSON.stringify(data);
    const prev = localStorage.getItem(key);
    if (prev === json) return;
    localStorage.setItem(key, json);
    window.dispatchEvent(new CustomEvent('local-storage-change', { detail: { key } }));
    window.dispatchEvent(new CustomEvent(`mix-realtime-${key}`, { detail: { data } }));
  } catch (error) {
    console.error(`Error saving key ${key} to localStorage`, error);
  }
};

// ===== قلب متجر صينات الهواتف (العتباوي) =====
// متجر جاهز متصل بالمنصة عبر بيانات الدخول المحددة، يُفتح مباشرة بدون تسجيل.
export const ALATBAWI_STORE_ID = 'store-alatbawi';
export const ALATBAWI_MERCHANT = {
  id: 'merchant-alatbawi',
  name: 'العتباوي',
  epithet: '📱 العتباوي للهواتف والإكسسوارات',
  email: 'gomay35736@fishnone.com',
  password: 'alatbawi123',
  role: 'merchant' as const,
  storeId: ALATBAWI_STORE_ID,
  status: 'approved' as const
};

const ALATBAWI_STORE: Store = {
  id: ALATBAWI_STORE_ID,
  name: 'العتباوي للهواتف والإكسسوارات',
  logo: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=200&h=200&fit=crop',
  cover: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&h=400&fit=crop',
  category: 'هواتف',
  description: 'العتباوي للهواتف والإكسسوارات - أحدث الهواتف الذكية والسماعات والشواحن والكفرات والإكسسوارات الفاخرة بأسعار مميزة. توصيل سريع وضمان حقيقي.',
  city: 'العبور',
  country: 'مصر',
  rating: 5.0,
  reviewsCount: 0,
  productsCount: 45,
  themeColor: {
    primary: '#6C63FF',
    secondary: '#030214',
    background: '#0a0a12',
    frameColor: '#1a1430',
    textColor: '#a8a0ff'
  },
  layoutType: 'grid',
  visualTemplate: 'default',
  banners: [
    {
      id: 'sb-alatbawi-1',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&h=400&fit=crop',
      title: 'أحدث الهواتف الذكية 2026',
      subtitle: 'آيفون وسامسونج بأقل الأسعار مع ضمان حقيقي',
      linkToCategory: 'هواتف ذكية'
    },
    {
      id: 'sb-alatbawi-2',
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=1200&h=400&fit=crop',
      title: 'إكسسوارات فاخرة',
      subtitle: 'شواحن - سماعات - كفرات - كابلات - بطاقات شحن',
      linkToCategory: 'إكسسوارات'
    }
  ],
  categories: ['هواتف ذكية', 'شواحن', 'سماعات', 'كفرات حماية', 'كابلات', 'بطاقات شحن', 'إكسسوارات'],
  featured: true,
  status: 'active',
  ownerId: 'merchant-alatbawi',
  commissionRate: 3,
  salesCount: 0,
  epithet: '📱 العتباوي للهواتف والإكسسوارات'
};


/**
 * يضمن وجود متجر العتباوي (قلب صينات الهواتف) وحساب التاجر في المنصة.
 * يُستدعى عند الإقلاع لربط القلب بالمنصة وتشغيله مباشرة.
 */
export const ensureAlatbawiStore = (): void => {
  try {
    const stores = JSON.parse(localStorage.getItem('mix_stores') || '[]');
    if (!stores.some((s: Store) => s.id === ALATBAWI_STORE_ID)) {
      stores.push(ALATBAWI_STORE);
      saveData('mix_stores', stores);
    }

    const users = JSON.parse(localStorage.getItem('mix_users') || '[]');
    if (!users.some((u: any) => u.email && u.email.toLowerCase() === ALATBAWI_MERCHANT.email.toLowerCase())) {
      users.push({ ...ALATBAWI_MERCHANT });
      saveData('mix_users', users);
    }
  } catch (error) {
    console.error('Error ensuring al-atbawi store:', error);
  }
};

// Global state initializer
export const initializeStorage = (): void => {
  try {
    if (!localStorage.getItem('mix_initialized')) {
      saveData('mix_categories', INITIAL_CATEGORIES);
      saveData('mix_stores', INITIAL_STORES);
      saveData('mix_products', INITIAL_PRODUCTS);
      saveData('mix_banners', INITIAL_BANNERS);
      saveData('mix_reviews', INITIAL_REVIEWS);
      saveData('mix_coupons', INITIAL_COUPONS);
      saveData('mix_orders', INITIAL_ORDERS);
      saveData('mix_initialized', 'true');
    }
    // تأكد من وجود قلب متجر صينات الهواتف (العتباوي) في كل إقلاع
    ensureAlatbawiStore();
  } catch (error) {
    console.error('Error initializing localStorage storage:', error);
  }
};

export const DEFAULT_PHONE_REPAIR_TEMPLATE = {
  id: 'tpl-phone-repair',
  name: 'قالب صيانة الهواتف',
  category: 'صيانة',
  colors: {
    primary: '#a855f7',
    secondary: '#06b6d4',
    accent: '#ec4899',
    background: '#09090b',
    surface: '#18181b',
    text: '#ffffff',
    textMuted: '#a1a1aa',
  },
  fonts: {
    heading: 'Cairo',
    body: 'Cairo',
  },
  animations: {
    glowEnabled: true,
    pulseEnabled: true,
    slideEnabled: true,
    hoverScale: true,
    neonEffect: true,
  },
  layout: {
    borderRadius: '16px',
    cardStyle: 'neon' as const,
    bannerStyle: 'fullscreen' as const,
    gridCols: 4,
    showCategoriesBar: true,
    showSearchBar: true,
    showRepairServices: true,
    showFeatures: true,
    showReviews: true,
    showAbout: true,
    sectionsOrder: ['slider', 'search', 'categories', 'products', 'services', 'features', 'reviews', 'about'],
  },
  branding: {
    tagline: 'مركز صيانة معتمد ⚡',
    subtitle: 'نقدم لكم أفضل خدمات صيانة الأجهزة الذكية مع باقة مميزة من أحدث الهواتف والإكسسوارات.',
    heroTitle: 'أقوى عروض الصيانة والتكنولوجيا ⚡',
    heroSubtitle: 'استكشف أقوى العروض والخدمات التقنية المتوفرة',
    ctaText: 'استكشف العرض الآن 🛍️',
    trustedBadge: 'شريك معتمد',
  },
  repairServices: [
    { id: 'rs-1', title: 'صيانة الشاشات', desc: 'تبديل شاشات أصلية مع ضمان ضد عيوب الصناعة', icon: '📱', price: 299 },
    { id: 'rs-2', title: 'تغيير البطارية', desc: 'استبدال بطاريات تدعم الشحن السريع ونسبة صحة 100%', icon: '🔋', price: 149 },
    { id: 'rs-3', title: 'إصلاح منفذ الشحن', desc: 'علاج مشاكل الشحن البطيء وعدم استجابة السلك', icon: '🔌', price: 99 },
    { id: 'rs-4', title: 'إصلاح السماعات والمايك', desc: 'تبديل سماعات المكالمات وسماعات الـ Stereo الخارجية', icon: '🔊', price: 79 },
    { id: 'rs-5', title: 'السوفت وير وفك الحسابات', desc: 'سوفت وير كامل، فك رمز القفل، وتخطي حسابات Google/iCloud', icon: '⚙️', price: 120 },
    { id: 'rs-6', title: 'إصلاح البوردة والآيسيهات', desc: 'صيانة الأعطال المعقدة في اللوحة الأم تحت الميكروسكوب', icon: '🔬', price: 390 },
  ],
  features: [
    { id: '1', title: 'قطع غيار أصلية ومضمونة', desc: 'نضمن لك استبدال الأجزاء المكسورة بأعلى الخامات جودة في السوق', icon: '📱' },
    { id: '2', title: 'صيانة فورية وسريعة', desc: 'نصلح جهازك فوراً خلال نفس اليوم مع إمكانية التوصيل', icon: '⚡' },
    { id: '3', title: 'دعم تقني وتواصل دائم', desc: 'نساعدك في فحص العيوب والإجابة على أي استفسارات مباشرة', icon: '💬' },
  ],
};

export const DEFAULT_STORE_TEMPLATES = [
  DEFAULT_PHONE_REPAIR_TEMPLATE,
  {
    id: 'tpl-clothing',
    name: 'قالب الملابس والأزياء',
    category: 'ملابس',
    colors: {
      primary: '#D4AF37',
      secondary: '#111111',
      accent: '#f59e0b',
      background: '#000000',
      surface: '#1a1a1a',
      text: '#ffffff',
      textMuted: '#a1a1aa',
    },
    fonts: { heading: 'Cairo', body: 'Cairo' },
    animations: { glowEnabled: false, pulseEnabled: false, slideEnabled: true, hoverScale: true, neonEffect: false },
    layout: {
      borderRadius: '12px',
      cardStyle: 'solid' as const,
      bannerStyle: 'fullscreen' as const,
      gridCols: 4,
      showCategoriesBar: true,
      showSearchBar: true,
      showRepairServices: false,
      showFeatures: true,
      showReviews: true,
      showAbout: true,
      sectionsOrder: ['slider', 'categories', 'products', 'features', 'reviews', 'about'],
    },
    branding: {
      tagline: 'أزياء عصرية فاخرة 🧥',
      subtitle: 'اكتشف أحدث صيحات الموضة والأزياء العصرية',
      heroTitle: 'خصومات نهاية الموسم الكبرى',
      heroSubtitle: 'استعرض مجموعتنا الحصرية من الملابس',
      ctaText: 'تسوق الآن 🛍️',
      trustedBadge: 'ماركة معتمدة',
    },
    repairServices: [],
    features: [
      { id: '1', title: 'توصيل سريع وموثوق', desc: 'نشحن الطلبيات مباشرة إلى منزلك بكل أمان وثقة', icon: '🚚' },
      { id: '2', title: 'ضمان الجودة والمنتج', desc: 'جميع منتجاتنا معتمدة وأصلية مع خدمات ما بعد البيع', icon: '🛡️' },
      { id: '3', title: 'دعم فني وتواصل مباشر', desc: 'فريقنا متواجد طوال اليوم للإجابة على استفساراتكم', icon: '💬' },
    ],
  },
];

export const DEFAULT_PAYMENT_GATEWAYS = [
  {
    id: 'gw-instapay',
    type: 'instapay' as const,
    name: 'InstaPay (انستا باي)',
    enabled: true,
    icon: '⚡',
    number: 'instapay@bank',
    accountHolderName: 'إدارة المتجر',
    extraInstructions: 'يرجى تحويل المبلغ عبر تطبيق InstaPay وإرفاق رقم المعاملة أو صورة الإيصال.',
    order: 1
  },
  {
    id: 'gw-vodafone',
    type: 'vodafoneCash' as const,
    name: 'فودافون كاش (Vodafone Cash)',
    enabled: true,
    icon: '📱',
    number: '01000000000',
    accountHolderName: 'حساب فودافون كاش',
    extraInstructions: 'قم بتحويل المبلغ إلى الرقم الموضح وإرفاق صورة الإيصال.',
    order: 2
  },
  {
    id: 'gw-bank-misr',
    type: 'bankMisr' as const,
    name: 'بنك مصر (Bank Misr)',
    enabled: true,
    icon: '🏦',
    bankName: 'بنك مصر',
    iban: 'EG000000000000000000000000000',
    accountHolderName: 'اسم المتجر',
    extraInstructions: 'يرجى التحويل المباشر على الحساب البنكي وإدخال رقم الحوالة.',
    order: 3
  },
  {
    id: 'gw-nbe',
    type: 'nbe' as const,
    name: 'البنك الأهلي المصري (NBE)',
    enabled: true,
    icon: '🏛️',
    bankName: 'البنك الأهلي المصري',
    iban: 'EG111111111111111111111111111',
    accountHolderName: 'اسم المتجر',
    extraInstructions: 'تحويل بنكي مباشر لمصرف الأهلي المصري.',
    order: 4
  },
  {
    id: 'gw-orange',
    type: 'orangeMoney' as const,
    name: 'أورانج كاش (Orange Cash)',
    enabled: true,
    icon: '🍊',
    number: '01200000000',
    extraInstructions: 'تحويل محفظة أورانج كاش.',
    order: 5
  },
  {
    id: 'gw-etisalat',
    type: 'etisalatCash' as const,
    name: 'اتصالات كاش (Etisalat Cash)',
    enabled: true,
    icon: '💚',
    number: '01100000000',
    extraInstructions: 'تحويل محفظة اتصالات كاش.',
    order: 6
  },
  {
    id: 'gw-cod',
    type: 'cod' as const,
    name: 'الدفع عند الاستلام (Cash On Delivery)',
    enabled: true,
    icon: '💵',
    extraInstructions: 'يتم دفع قيمة الطلب نقداً للمندوب عند استلام الشحنة.',
    order: 7
  },
  {
    id: 'gw-moyasar',
    type: 'moyasar' as const,
    name: 'مُيسر (Moyasar Gateway)',
    enabled: false,
    icon: '💳',
    extraInstructions: 'بوابة الدفع الإلكتروني ميسر لتسهيل عملية الشراء بالبطاقات.',
    order: 8
  },
  {
    id: 'gw-myfatoorah',
    type: 'myfatoorah' as const,
    name: 'ماي فاتورة (MyFatoorah)',
    enabled: false,
    icon: '🧾',
    extraInstructions: 'الدفع الإلكتروني المباشر عبر بوابة ماي فاتورة.',
    order: 9
  },
  {
    id: 'gw-stripe',
    type: 'stripe' as const,
    name: 'Stripe Global',
    enabled: false,
    icon: '🌐',
    extraInstructions: 'الدفع الآمن باستخدام بطاقات الفيزا والماستركارد عبر Stripe.',
    order: 10
  },
  {
    id: 'gw-paypal',
    type: 'paypal' as const,
    name: 'PayPal Online',
    enabled: false,
    icon: '🅿️',
    extraInstructions: 'الدفع الدولي عبر حساب PayPal.',
    order: 11
  },
  {
    id: 'gw-paymob',
    type: 'paymob' as const,
    name: 'Paymob Egypt',
    enabled: false,
    icon: '📲',
    extraInstructions: 'بوابة باي موب للمدفوعات الرقمية والتقسيط.',
    order: 12
  }
];

export const DEFAULT_CUSTOM_CHECKOUT_FIELDS = [
  { id: 'f-name', name: 'name', label: 'الاسم بالكامل', type: 'text' as const, required: true, enabled: true, placeholder: 'أدخل اسمك الثلاثي', order: 1 },
  { id: 'f-phone', name: 'phone', label: 'رقم الهاتف / الواتساب', type: 'tel' as const, required: true, enabled: true, placeholder: '010XXXXXXXX', order: 2 },
  { id: 'f-gov', name: 'governorate', label: 'المحافظة', type: 'text' as const, required: true, enabled: true, placeholder: 'مثال: القاهرة / الجيزة / مكة', order: 3 },
  { id: 'f-city', name: 'city', label: 'المدينة / المنطقة', type: 'text' as const, required: true, enabled: true, placeholder: 'اسم المدينة أو الحي', order: 4 },
  { id: 'f-address', name: 'address', label: 'العنوان التفصيلي', type: 'textarea' as const, required: true, enabled: true, placeholder: 'الشارع / رقم العمارة / رقم الشقة', order: 5 },
  { id: 'f-qty', name: 'quantity', label: 'الكمية المطلوب شراءها', type: 'number' as const, required: true, enabled: true, defaultValue: '1', order: 6 },
  { id: 'f-color', name: 'color', label: 'اللون المطلوب', type: 'text' as const, required: false, enabled: true, placeholder: 'أدخل اللون (اختياري)', order: 7 },
  { id: 'f-size', name: 'size', label: 'المقاس / السعة', type: 'text' as const, required: false, enabled: true, placeholder: 'مثال: 256GB / XL (اختياري)', order: 8 },
  { id: 'f-notes', name: 'notes', label: 'ملاحظات إضافية للتاجر', type: 'textarea' as const, required: false, enabled: true, placeholder: 'أي تفاصيل خاصة برغبتك في الشحنة', order: 9 },
];

