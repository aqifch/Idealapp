/**
 * Supabase Data Sync Utilities
 * 
 * Professional data synchronization between TypeScript interfaces and Supabase database.
 * Handles all CRUD operations with proper error handling and data mapping.
 */

import { supabase } from '../config/supabase';
import { Product, Category, Deal, Banner } from '../data/mockData';
import { toast } from 'sonner';

// ============================================
// DATA MAPPING FUNCTIONS
// ============================================

/**
 * Map Product interface to database columns
 */
const mapProductToDb = (product: Product | Partial<Product>) => ({
  id: product.id!,
  name: product.name!,
  rating: product.rating ?? 5.0,
  image: product.image!,
  price: product.price!,
  original_price: product.originalPrice ?? null,
  discount: product.discount ?? 0,
  category: product.category ?? null,
  description: product.description ?? null,
  in_stock: product.inStock ?? true,
  is_popular: product.isPopular ?? false,
  is_spicy: product.isSpicy ?? false,
  is_veg: product.isVeg ?? false,
  is_favorite: product.isFavorite ?? false,
  sizes: product.sizes || [],
});

/**
 * Map database row to Product interface
 */
const mapDbToProduct = (row: any): Product => ({
  id: row.id,
  name: row.name,
  rating: row.rating ?? 5.0,
  image: row.image,
  price: row.price,
  originalPrice: row.original_price,
  discount: row.discount ?? 0,
  category: row.category,
  description: row.description,
  inStock: row.in_stock ?? true,
  isPopular: row.is_popular ?? false,
  isSpicy: row.is_spicy ?? false,
  isVeg: row.is_veg ?? false,
  isFavorite: row.is_favorite ?? false,
  sizes: Array.isArray(row.sizes) ? row.sizes : (typeof row.sizes === 'string' ? JSON.parse(row.sizes) : []),
});

/**
 * Map Category interface to database columns
 */
const mapCategoryToDb = (category: Category | Partial<Category>) => ({
  id: category.id!,
  name: category.name!,
  image: category.image!,
  icon: category.icon ?? null,
  color: category.color ?? null,
  description: category.description ?? null,
  is_active: category.isActive ?? true,
  display_order: category.displayOrder ?? 0,
});

/**
 * Map database row to Category interface
 */
const mapDbToCategory = (row: any): Category => ({
  id: row.id,
  name: row.name,
  image: row.image,
  icon: row.icon,
  color: row.color,
  description: row.description,
  isActive: row.is_active ?? true,
  displayOrder: row.display_order ?? 0,
});

/**
 * Map Deal interface to database columns
 */
const mapDealToDb = (deal: Deal | Partial<Deal>) => {
  // Convert date strings to ISO timestamps
  const startDate = deal.startDate 
    ? (deal.startDate.includes('T') ? deal.startDate : `${deal.startDate}T00:00:00Z`)
    : new Date().toISOString();
  const endDate = deal.endDate 
    ? (deal.endDate.includes('T') ? deal.endDate : `${deal.endDate}T23:59:59Z`)
    : new Date().toISOString();

  return {
    id: deal.id!,
    title: deal.title!,
    description: deal.description!,
    discount_percentage: deal.discountPercentage!,
    coupon_code: deal.couponCode!,
    start_date: startDate,
    end_date: endDate,
    is_active: deal.isActive ?? true,
    image: deal.image!,
    background_color: deal.backgroundColor ?? '#FF9F40',
    text_color: deal.textColor ?? '#FFFFFF',
    display_order: deal.displayOrder ?? 0,
    template: deal.template ?? 'featured_grid',
    product_id: deal.productId ?? null,
  };
};

/**
 * Map database row to Deal interface
 */
const mapDbToDeal = (row: any): Deal => {
  // Convert timestamps to date strings (YYYY-MM-DD format)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    discountPercentage: row.discount_percentage,
    couponCode: row.coupon_code,
    startDate: formatDate(row.start_date),
    endDate: formatDate(row.end_date),
    isActive: row.is_active ?? true,
    image: row.image,
    backgroundColor: row.background_color,
    textColor: row.text_color,
    displayOrder: row.display_order ?? 0,
    template: row.template ?? 'featured_grid',
    productId: row.product_id,
  };
};

/**
 * Map Banner interface to database columns
 */
const mapBannerToDb = (banner: Banner | Partial<Banner>) => ({
  id: banner.id!,
  type: banner.type!,
  title: banner.title ?? null,
  subtitle: banner.subtitle ?? null,
  description: banner.description ?? null,
  image: banner.image!,
  button_text: banner.buttonText ?? null,
  button_link: banner.buttonLink ?? null,
  is_active: banner.isActive ?? true,
  display_order: banner.displayOrder ?? 0,
  display_style: banner.displayStyle ?? 'image-text-button',
  animation_type: banner.animationType ?? 'fade',
  button_style: banner.buttonStyle ?? 'gradient',
  text_position: banner.textPosition ?? 'left',
  overlay_opacity: banner.overlayOpacity ?? 70,
  text_color: banner.textColor ?? null,
  overlay_color: banner.overlayColor ?? null,
  button_color: banner.buttonColor ?? null,
});

/**
 * Map database row to Banner interface
 */
const mapDbToBanner = (row: any): Banner => ({
  id: row.id,
  type: row.type,
  title: row.title,
  subtitle: row.subtitle,
  description: row.description,
  image: row.image,
  buttonText: row.button_text,
  buttonLink: row.button_link,
  isActive: row.is_active ?? true,
  displayOrder: row.display_order ?? 0,
  displayStyle: row.display_style ?? 'image-text-button',
  animationType: row.animation_type ?? 'fade',
  buttonStyle: row.button_style ?? 'gradient',
  textPosition: row.text_position ?? 'left',
  overlayOpacity: row.overlay_opacity ?? 70,
  textColor: row.text_color,
  overlayColor: row.overlay_color,
  buttonColor: row.button_color,
});

// ============================================
// PRODUCTS CRUD OPERATIONS
// ============================================

export const fetchProductsFromSupabase = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapDbToProduct);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const saveProductToSupabase = async (product: Product | Partial<Product>): Promise<boolean> => {
  try {
    const dbData = mapProductToDb(product);
    const { error } = await supabase
      .from('products')
      .upsert(dbData, { onConflict: 'id' });

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Error saving product:', error);
    toast.error(`Failed to save product: ${error.message}`);
    return false;
  }
};

export const deleteProductFromSupabase = async (productId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Error deleting product:', error);
    toast.error(`Failed to delete product: ${error.message}`);
    return false;
  }
};

// ============================================
// CATEGORIES CRUD OPERATIONS
// ============================================

export const fetchCategoriesFromSupabase = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return (data || []).map(mapDbToCategory);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const saveCategoryToSupabase = async (category: Category | Partial<Category>): Promise<boolean> => {
  try {
    const dbData = mapCategoryToDb(category);
    const { error } = await supabase
      .from('categories')
      .upsert(dbData, { onConflict: 'id' });

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Error saving category:', error);
    toast.error(`Failed to save category: ${error.message}`);
    return false;
  }
};

export const deleteCategoryFromSupabase = async (categoryId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Error deleting category:', error);
    toast.error(`Failed to delete category: ${error.message}`);
    return false;
  }
};

// ============================================
// DEALS CRUD OPERATIONS
// ============================================

export const fetchDealsFromSupabase = async (): Promise<Deal[]> => {
  try {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return (data || []).map(mapDbToDeal);
  } catch (error: any) {
    console.error('Error fetching deals:', error);
    return [];
  }
};

export const saveDealToSupabase = async (deal: Deal | Partial<Deal>): Promise<boolean> => {
  try {
    const dbData = mapDealToDb(deal);
    const { error } = await supabase
      .from('deals')
      .upsert(dbData, { onConflict: 'id' });

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Error saving deal:', error);
    toast.error(`Failed to save deal: ${error.message}`);
    return false;
  }
};

export const deleteDealFromSupabase = async (dealId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', dealId);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Error deleting deal:', error);
    toast.error(`Failed to delete deal: ${error.message}`);
    return false;
  }
};

// ============================================
// BANNERS CRUD OPERATIONS
// ============================================

export const fetchBannersFromSupabase = async (): Promise<Banner[]> => {
  try {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return (data || []).map(mapDbToBanner);
  } catch (error: any) {
    console.error('Error fetching banners:', error);
    return [];
  }
};

export const saveBannerToSupabase = async (banner: Banner | Partial<Banner>): Promise<boolean> => {
  try {
    const dbData = mapBannerToDb(banner);
    const { error } = await supabase
      .from('banners')
      .upsert(dbData, { onConflict: 'id' });

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Error saving banner:', error);
    toast.error(`Failed to save banner: ${error.message}`);
    return false;
  }
};

export const deleteBannerFromSupabase = async (bannerId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', bannerId);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Error deleting banner:', error);
    toast.error(`Failed to delete banner: ${error.message}`);
    return false;
  }
};

// ============================================
// BATCH OPERATIONS
// ============================================

export const syncAllDataToSupabase = async (
  products: Product[],
  categories: Category[],
  deals: Deal[],
  banners: Banner[]
): Promise<{ success: boolean; errors: string[] }> => {
  const errors: string[] = [];

  // Save all products
  for (const product of products) {
    const success = await saveProductToSupabase(product);
    if (!success) errors.push(`Product ${product.id}`);
  }

  // Save all categories
  for (const category of categories) {
    const success = await saveCategoryToSupabase(category);
    if (!success) errors.push(`Category ${category.id}`);
  }

  // Save all deals
  for (const deal of deals) {
    const success = await saveDealToSupabase(deal);
    if (!success) errors.push(`Deal ${deal.id}`);
  }

  // Save all banners
  for (const banner of banners) {
    const success = await saveBannerToSupabase(banner);
    if (!success) errors.push(`Banner ${banner.id}`);
  }

  return {
    success: errors.length === 0,
    errors,
  };
};

// ============================================
// NOTIFICATIONS CRUD OPERATIONS
// ============================================

export interface Notification {
  id: string;
  type: 'order' | 'promo' | 'reward' | 'delivery' | 'system' | 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  target_user_id?: string | null;
  is_broadcast: boolean;
  action_url?: string | null;
  image_url?: string | null;
  product_id?: string | null;
  deal_id?: string | null;
  is_read: boolean;
  automation_id?: string | null;
  campaign_id?: string | null;
  template_id?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
}

export const fetchNotificationsFromSupabase = async (userId?: string): Promise<Notification[]> => {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.or(`target_user_id.eq.${userId},is_broadcast.eq.true`);
    } else {
      query = query.eq('is_broadcast', true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []) as Notification[];
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    toast.error('Failed to fetch notifications');
    return [];
  }
};

export const createNotificationInSupabase = async (
  notification: Omit<Notification, 'id' | 'created_at'>
): Promise<Notification | null> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notification)
      .select()
      .single();

    if (error) throw error;
    return data as Notification;
  } catch (error: any) {
    console.error('Error creating notification:', error);
    toast.error('Failed to create notification');
    return null;
  }
};

export const updateNotificationInSupabase = async (
  id: string,
  updates: Partial<Notification>
): Promise<Notification | null> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Notification;
  } catch (error: any) {
    console.error('Error updating notification:', error);
    toast.error('Failed to update notification');
    return null;
  }
};

export const deleteNotificationFromSupabase = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    toast.error('Failed to delete notification');
    return false;
  }
};

export const markNotificationAsRead = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

