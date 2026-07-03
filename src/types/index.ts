/* ── BrewNest Unified TypeScript Definitions ─────────────────── */

/**
 * User profile from the 'profiles' table.
 */
export interface Profile {
  id: string; // auth.users.id
  email: string;
  name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
}

/**
 * User role from the 'user_roles' table.
 */
export type UserRoleType = 'customer' | 'admin' | 'barista' | 'manager';

export interface UserRole {
  id: string;
  user_id: string;
  role: UserRoleType;
  created_at: string;
}

/**
 * Product category from the 'categories' table.
 */
export interface Category {
  id: string;
  label: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

/**
 * Specialty coffee product from the 'products' table.
 */
export interface Product {
  id: string;
  name: string;
  description: string | null;
  long_description: string | null;
  price: number;
  image: string | null;
  category: string | null;
  rating: number;
  review_count: number;
  calories: number | null;
  prep_time: string | null;
  tags: string[];
  ingredients: string[];
  is_popular: boolean;
  is_new: boolean;
  created_at: string;
}

/**
 * Inventory records from the 'inventory' table.
 */
export interface Inventory {
  id: string;
  product_id: string;
  stock_quantity: number;
  low_stock_threshold: number;
  is_available: boolean;
  restock_date: string | null;
  updated_at: string;
}

/**
 * Shopping cart item from the 'cart_items' table.
 */
export interface DBCartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  products?: Product;
}

/**
 * Wishlist record from the 'wishlist_items' table.
 */
export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products?: Product;
}

/**
 * Coupon codes from the 'coupons' table.
 */
export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  label: string | null;
  max_uses: number | null;
  used_count: number;
  min_order: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

/**
 * Order record from the 'orders' table.
 */
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type DeliveryType = 'pickup' | 'delivery';

export interface Order {
  id: string;
  user_id: string | null;
  order_number: string;
  delivery_type: DeliveryType;
  delivery_address: string | null;
  pickup_location: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  notes: string | null;
  payment_method: string;
  card_last4: string | null;
  subtotal: number;
  discount: number;
  tax_amount: number;
  delivery_fee: number;
  total: number;
  coupon_code: string | null;
  status: OrderStatus;
  created_at: string;
  order_items?: OrderItem[];
}

/**
 * Order items from the 'order_items' table.
 */
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
  created_at: string;
}

/**
 * Product review from the 'reviews' table.
 */
export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  author: string;
  rating: number;
  title: string;
  body: string | null;
  helpful_count: number;
  is_approved: boolean;
  created_at: string;
}

/**
 * Seat/table reservation from the 'reservations' table.
 */
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';

export interface Reservation {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  date: string;
  time: string;
  party_size: number;
  location: string;
  notes: string | null;
  status: ReservationStatus;
  created_at: string;
}

/**
 * Saved shipping address from the 'addresses' table.
 */
export interface Address {
  id: string;
  user_id: string;
  label: string;
  address: string;
  city: string;
  zip: string;
  is_default: boolean;
  created_at: string;
}

/**
 * Newsletter subscriber details from the 'newsletter_subscribers' table.
 */
export interface NewsletterSubscriber {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

/**
 * Contact/support messages from the 'contact_messages' table.
 */
export type MessageStatus = 'unread' | 'read' | 'archived';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: MessageStatus;
  created_at: string;
}

/**
 * Alert notification from the 'notifications' table.
 */
export type NotificationType = 'order' | 'reservation' | 'promo' | 'system' | 'review';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

/**
 * Client side cart item structure.
 */
export interface CartItem {
  id: string; // product_id
  name: string;
  price: number;
  image: string;
  quantity: number;
}
