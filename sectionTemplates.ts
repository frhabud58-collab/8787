/**
 * Section Management System
 */

export interface StoreSection {
  id: string;
  type: string;
  title: string;
  enabled: boolean;
  order: number;
}

export const SECTION_TEMPLATES = [
  { type: 'hero_banner', name: 'البنر الرئيسي', icon: '🖼️' },
  { type: 'categories', name: 'الأقسام', icon: '📂' },
  { type: 'products', name: 'المنتجات', icon: '📦' },
  { type: 'services', name: 'الخدمات', icon: '🛠️' },
  { type: 'features', name: 'المميزات', icon: '⭐' },
  { type: 'reviews', name: 'التقييمات', icon: '💬' },
  { type: 'offers', name: 'العروض', icon: '🏷️' },
  { type: 'contact', name: 'تواصل معنا', icon: '📞' },
];

export function getDefaultSections(businessType: string): StoreSection[] {
  const defaults: Record<string, StoreSection[]> = {
    phone_repair: [
      { id: 's1', type: 'hero_banner', title: 'البنر الرئيسي', enabled: true, order: 0 },
      { id: 's2', type: 'services', title: 'خدمات الصيانة', enabled: true, order: 1 },
      { id: 's3', type: 'features', title: 'مميزاتنا', enabled: true, order: 2 },
      { id: 's4', type: 'reviews', title: 'آراء العملاء', enabled: true, order: 3 },
      { id: 's5', type: 'contact', title: 'تواصل معنا', enabled: true, order: 4 },
    ],
    phone_sales: [
      { id: 's1', type: 'hero_banner', title: 'البنر الرئيسي', enabled: true, order: 0 },
      { id: 's2', type: 'categories', title: 'الأقسام', enabled: true, order: 1 },
      { id: 's3', type: 'products', title: 'المنتجات', enabled: true, order: 2 },
      { id: 's4', type: 'offers', title: 'العروض', enabled: true, order: 3 },
      { id: 's5', type: 'reviews', title: 'التقييمات', enabled: true, order: 4 },
    ],
    restaurant: [
      { id: 's1', type: 'hero_banner', title: 'البنر الرئيسي', enabled: true, order: 0 },
      { id: 's2', type: 'categories', title: 'أقسام القائمة', enabled: true, order: 1 },
      { id: 's3', type: 'products', title: 'الوجبات المميزة', enabled: true, order: 2 },
      { id: 's4', type: 'offers', title: 'العروض', enabled: true, order: 3 },
      { id: 's5', type: 'reviews', title: 'آراء العملاء', enabled: true, order: 4 },
    ],
  };
  
  return defaults[businessType] || defaults['phone_sales'];
}