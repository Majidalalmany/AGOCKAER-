import { Category } from '../types';

export const CATEGORY_DEFAULT_LOGOS: Record<string, string> = {
  'محلات عصائر ومرطبات': 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=400&q=80',
  'سوبرماركت وبقالة': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
  'محلات ملابس وموضة': 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=400&q=80',
  'مطاعم ومقاهي': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
  'مطاعم وجبات سريعة': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
  'مخابز وحلويات': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80',
  'صيدليات ومستلزمات طبية': 'https://images.unsplash.com/photo-1586015555751-63c3d0c29676?auto=format&fit=crop&w=400&q=80',
  'إلكترونيات وجوالات': 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=400&q=80',
  'بهارات وعطارة': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80',
  'بهارات وتوابل': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80'
};

export const DEFAULT_STORE_LOGO = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80';

export function getCategoryDefaultLogo(
  categoryId?: string,
  categoryName?: string,
  categories: Category[] = []
): string {
  // 1. Try finding by category object
  const category = categories.find(c => c.id === categoryId || c.name === categoryName);
  if (category) {
    if (category.coverUrl) return category.coverUrl;
    if (CATEGORY_DEFAULT_LOGOS[category.name]) {
      return CATEGORY_DEFAULT_LOGOS[category.name];
    }
  }

  // 2. Try by categoryName string
  if (categoryName && CATEGORY_DEFAULT_LOGOS[categoryName]) {
    return CATEGORY_DEFAULT_LOGOS[categoryName];
  }

  // 3. Fallback search by keyword matching
  if (categoryName) {
    const lower = categoryName.toLowerCase();
    if (lower.includes('عصير') || lower.includes('مشروب')) return CATEGORY_DEFAULT_LOGOS['محلات عصائر ومرطبات'];
    if (lower.includes('سوبر') || lower.includes('بقالة')) return CATEGORY_DEFAULT_LOGOS['سوبرماركت وبقالة'];
    if (lower.includes('ملابس') || lower.includes('موضة') || lower.includes('أزياء')) return CATEGORY_DEFAULT_LOGOS['محلات ملابس وموضة'];
    if (lower.includes('مطعم') || lower.includes('برجر') || lower.includes('مأكولات')) return CATEGORY_DEFAULT_LOGOS['مطاعم ومقاهي'];
    if (lower.includes('مخبز') || lower.includes('حلويات') || lower.includes('كيك')) return CATEGORY_DEFAULT_LOGOS['مخابز وحلويات'];
    if (lower.includes('صيدل') || lower.includes('دواء') || lower.includes('طب')) return CATEGORY_DEFAULT_LOGOS['صيدليات ومستلزمات طبية'];
    if (lower.includes('إلكترون') || lower.includes('جوال')) return CATEGORY_DEFAULT_LOGOS['إلكترونيات وجوالات'];
    if (lower.includes('بهار') || lower.includes('عطارة') || lower.includes('توابل')) return CATEGORY_DEFAULT_LOGOS['بهارات وعطارة'];
  }

  return DEFAULT_STORE_LOGO;
}
