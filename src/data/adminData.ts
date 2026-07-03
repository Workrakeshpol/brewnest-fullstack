/* ── Admin Dashboard Data ───────────────────────────────────── */

export interface AdminOrder {
  id: string;
  customer: string;
  email: string;
  date: string;
  items: number;
  total: number;
  status: 'completed' | 'processing' | 'cancelled' | 'pending';
  type: 'pickup' | 'delivery';
  payment: 'card' | 'cash' | 'apple-pay';
}

export interface AdminProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sold: number;
  status: 'active' | 'inactive';
  image: string;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  spent: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  joined: string;
  lastOrder: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff' | 'viewer';
  status: 'active' | 'inactive';
  lastLogin: string;
  avatar: string;
}

export interface AdminCoupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  uses: number;
  maxUses: number;
  status: 'active' | 'expired' | 'scheduled';
  expires: string;
}

export interface AdminReview {
  id: string;
  product: string;
  customer: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  status: 'published' | 'pending' | 'hidden';
}

export interface AdminReservation {
  id: string;
  customer: string;
  date: string;
  time: string;
  partySize: number;
  location: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  phone: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  products: number;
  revenue: number;
  status: 'active' | 'inactive';
}

export interface AdminInventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  supplier: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

/* ── Revenue chart data ─────────────────────────────────────── */
export const revenueData = [
  { month: 'Jan', revenue: 12400, orders: 340, target: 13000 },
  { month: 'Feb', revenue: 14800, orders: 410, target: 14000 },
  { month: 'Mar', revenue: 16200, orders: 460, target: 15000 },
  { month: 'Apr', revenue: 13900, orders: 390, target: 15500 },
  { month: 'May', revenue: 18500, orders: 520, target: 16000 },
  { month: 'Jun', revenue: 21300, orders: 590, target: 17000 },
  { month: 'Jul', revenue: 24800, orders: 680, target: 18000 },
  { month: 'Aug', revenue: 23100, orders: 640, target: 18500 },
  { month: 'Sep', revenue: 19600, orders: 550, target: 19000 },
  { month: 'Oct', revenue: 27400, orders: 750, target: 19500 },
  { month: 'Nov', revenue: 31200, orders: 860, target: 20000 },
  { month: 'Dec', revenue: 35800, orders: 980, target: 21000 },
];

export const categoryRevenueData = [
  { name: 'Espresso', value: 28500, color: '#c4861f' },
  { name: 'Latte', value: 22300, color: '#dfa738' },
  { name: 'Cold Coffee', value: 18700, color: '#5e7c53' },
  { name: 'Bakery', value: 15200, color: '#7d6140' },
  { name: 'Breakfast', value: 12400, color: '#b89e78' },
  { name: 'Desserts', value: 9800, color: '#9c7d54' },
];

export const hourlyTrafficData = [
  { hour: '6am', customers: 12 },
  { hour: '7am', customers: 28 },
  { hour: '8am', customers: 45 },
  { hour: '9am', customers: 52 },
  { hour: '10am', customers: 38 },
  { hour: '11am', customers: 34 },
  { hour: '12pm', customers: 48 },
  { hour: '1pm', customers: 42 },
  { hour: '2pm', customers: 30 },
  { hour: '3pm', customers: 36 },
  { hour: '4pm', customers: 40 },
  { hour: '5pm', customers: 35 },
  { hour: '6pm', customers: 28 },
  { hour: '7pm', customers: 18 },
];

export const weeklyOrdersData = [
  { day: 'Mon', orders: 142, revenue: 4200 },
  { day: 'Tue', orders: 128, revenue: 3800 },
  { day: 'Wed', orders: 165, revenue: 5100 },
  { day: 'Thu', orders: 151, revenue: 4600 },
  { day: 'Fri', orders: 198, revenue: 6200 },
  { day: 'Sat', orders: 234, revenue: 7800 },
  { day: 'Sun', orders: 176, revenue: 5400 },
];

/* ── Orders ─────────────────────────────────────────────────── */
export const adminOrders: AdminOrder[] = [
  { id: '#ORD-2847', customer: 'Emily Carter', email: 'emily.c@email.com', date: 'Dec 15, 2024', items: 3, total: 18.50, status: 'completed', type: 'pickup', payment: 'card' },
  { id: '#ORD-2846', customer: 'Marcus Lee', email: 'marcus.lee@email.com', date: 'Dec 15, 2024', items: 2, total: 12.75, status: 'processing', type: 'delivery', payment: 'apple-pay' },
  { id: '#ORD-2845', customer: 'Sofia Ramirez', email: 'sofia.r@email.com', date: 'Dec 14, 2024', items: 5, total: 32.20, status: 'completed', type: 'pickup', payment: 'card' },
  { id: '#ORD-2844', customer: 'James Okafor', email: 'james.o@email.com', date: 'Dec 14, 2024', items: 1, total: 6.50, status: 'pending', type: 'pickup', payment: 'cash' },
  { id: '#ORD-2843', customer: 'Priya Sharma', email: 'priya.s@email.com', date: 'Dec 14, 2024', items: 4, total: 24.00, status: 'cancelled', type: 'delivery', payment: 'card' },
  { id: '#ORD-2842', customer: 'Liam Walsh', email: 'liam.w@email.com', date: 'Dec 13, 2024', items: 2, total: 11.25, status: 'completed', type: 'pickup', payment: 'apple-pay' },
  { id: '#ORD-2841', customer: 'Ava Thompson', email: 'ava.t@email.com', date: 'Dec 13, 2024', items: 6, total: 38.70, status: 'completed', type: 'delivery', payment: 'card' },
  { id: '#ORD-2840', customer: 'Noah Chen', email: 'noah.c@email.com', date: 'Dec 13, 2024', items: 3, total: 15.50, status: 'processing', type: 'pickup', payment: 'card' },
  { id: '#ORD-2839', customer: 'Isabella Moore', email: 'bella.m@email.com', date: 'Dec 12, 2024', items: 2, total: 9.75, status: 'completed', type: 'pickup', payment: 'cash' },
  { id: '#ORD-2838', customer: 'Ethan Park', email: 'ethan.p@email.com', date: 'Dec 12, 2024', items: 4, total: 22.00, status: 'pending', type: 'delivery', payment: 'apple-pay' },
  { id: '#ORD-2837', customer: 'Mia Johnson', email: 'mia.j@email.com', date: 'Dec 12, 2024', items: 1, total: 5.50, status: 'completed', type: 'pickup', payment: 'card' },
  { id: '#ORD-2836', customer: 'Lucas Davis', email: 'lucas.d@email.com', date: 'Dec 11, 2024', items: 3, total: 17.25, status: 'cancelled', type: 'pickup', payment: 'cash' },
];

/* ── Products ───────────────────────────────────────────────── */
export const adminProducts: AdminProduct[] = [
  { id: 'p1', name: 'Single-Origin Espresso', category: 'Espresso', price: 4.50, stock: 999, sold: 421, status: 'active', image: '/images/espresso.jpg' },
  { id: 'p2', name: 'Classic Latte', category: 'Latte', price: 5.00, stock: 999, sold: 356, status: 'active', image: '/images/cappuccino.jpg' },
  { id: 'p3', name: 'Slow Cold Brew', category: 'Cold Coffee', price: 4.75, stock: 999, sold: 312, status: 'active', image: '/images/cold-brew.jpg' },
  { id: 'p4', name: 'Butter Croissant', category: 'Bakery', price: 3.75, stock: 48, sold: 345, status: 'active', image: '/images/bakery-croissant.jpg' },
  { id: 'p5', name: 'Avocado Toast', category: 'Breakfast', price: 8.50, stock: 999, sold: 234, status: 'active', image: '/images/breakfast-avocado-toast.jpg' },
  { id: 'p6', name: 'Tiramisu', category: 'Desserts', price: 6.50, stock: 24, sold: 234, status: 'active', image: '/images/dessert-tiramisu.jpg' },
  { id: 'p7', name: 'Pour Over (V60)', category: 'Coffee', price: 5.50, stock: 999, sold: 189, status: 'active', image: '/images/pour-over.jpg' },
  { id: 'p8', name: 'Matcha Latte', category: 'Tea', price: 5.50, stock: 999, sold: 234, status: 'active', image: '/images/tea-matcha.jpg' },
  { id: 'p9', name: 'Classic Mocha', category: 'Mocha', price: 5.75, stock: 999, sold: 198, status: 'active', image: '/images/mocha.jpg' },
  { id: 'p10', name: 'Almond Croissant', category: 'Bakery', price: 4.75, stock: 12, sold: 278, status: 'active', image: '/images/bakery-croissant.jpg' },
  { id: 'p11', name: 'Nitro Cold Brew', category: 'Cold Coffee', price: 5.50, stock: 999, sold: 189, status: 'inactive', image: '/images/cold-brew.jpg' },
  { id: 'p12', name: 'Fudge Brownie', category: 'Desserts', price: 4.50, stock: 0, sold: 189, status: 'inactive', image: '/images/dessert-brownie.jpg' },
];

/* ── Categories ────────────────────────────────────────────── */
export const adminCategories: AdminCategory[] = [
  { id: 'c1', name: 'Coffee', products: 5, revenue: 18600, status: 'active' },
  { id: 'c2', name: 'Espresso', products: 5, revenue: 28500, status: 'active' },
  { id: 'c3', name: 'Latte', products: 5, revenue: 22300, status: 'active' },
  { id: 'c4', name: 'Mocha', products: 4, revenue: 14200, status: 'active' },
  { id: 'c5', name: 'Tea', products: 5, revenue: 8900, status: 'active' },
  { id: 'c6', name: 'Cold Coffee', products: 6, revenue: 18700, status: 'active' },
  { id: 'c7', name: 'Breakfast', products: 5, revenue: 12400, status: 'active' },
  { id: 'c8', name: 'Bakery', products: 5, revenue: 15200, status: 'active' },
  { id: 'c9', name: 'Desserts', products: 5, revenue: 9800, status: 'active' },
];

/* ── Inventory ─────────────────────────────────────────────── */
export const adminInventory: AdminInventoryItem[] = [
  { id: 'i1', name: 'Ethiopian Yirgacheffe Beans', sku: 'BEAN-ETH-001', category: 'Beans', stock: 85, minStock: 20, unit: 'kg', supplier: 'Direct Trade Co.', status: 'in-stock' },
  { id: 'i2', name: 'Colombian Huila Beans', sku: 'BEAN-COL-002', category: 'Beans', stock: 12, minStock: 20, unit: 'kg', supplier: 'Direct Trade Co.', status: 'low-stock' },
  { id: 'i3', name: 'Whole Milk', sku: 'MILK-WH-001', category: 'Dairy', stock: 120, minStock: 30, unit: 'L', supplier: 'Local Dairy Farm', status: 'in-stock' },
  { id: 'i4', name: 'Oat Milk', sku: 'MILK-OAT-002', category: 'Dairy', stock: 45, minStock: 15, unit: 'L', supplier: 'Oatly', status: 'in-stock' },
  { id: 'i5', name: 'Almond Milk', sku: 'MILK-ALM-003', category: 'Dairy', stock: 8, minStock: 15, unit: 'L', supplier: 'Califia Farms', status: 'low-stock' },
  { id: 'i6', name: 'Vanilla Syrup', sku: 'SYR-VAN-001', category: 'Syrups', stock: 24, minStock: 10, unit: 'bottles', supplier: 'Monin', status: 'in-stock' },
  { id: 'i7', name: 'Caramel Syrup', sku: 'SYR-CAR-002', category: 'Syrups', stock: 6, minStock: 10, unit: 'bottles', supplier: 'Monin', status: 'low-stock' },
  { id: 'i8', name: 'Croissant Dough', sku: 'BAK-CRO-001', category: 'Bakery', stock: 48, minStock: 20, unit: 'units', supplier: 'In-house', status: 'in-stock' },
  { id: 'i9', name: 'Dark Chocolate (70%)', sku: 'CHO-DRK-001', category: 'Ingredients', stock: 0, minStock: 5, unit: 'kg', supplier: 'Valrhona', status: 'out-of-stock' },
  { id: 'i10', name: 'Matcha Powder', sku: 'MAT-CER-001', category: 'Tea', stock: 3, minStock: 5, unit: 'kg', supplier: 'Uji Matcha Co.', status: 'low-stock' },
  { id: 'i11', name: 'Coffee Filters (V60)', sku: 'SUP-FIL-001', category: 'Supplies', stock: 200, minStock: 50, unit: 'units', supplier: 'Hario', status: 'in-stock' },
  { id: 'i12', name: 'Espresso Beans (House)', sku: 'BEAN-HSE-003', category: 'Beans', stock: 65, minStock: 25, unit: 'kg', supplier: 'In-house Roastery', status: 'in-stock' },
];

/* ── Reservations ──────────────────────────────────────────── */
export const adminReservations: AdminReservation[] = [
  { id: 'RES-101', customer: 'Emily Carter', date: 'Dec 16, 2024', time: '10:00 AM', partySize: 2, location: 'Maple Street', status: 'confirmed', phone: '(503) 555-0142' },
  { id: 'RES-102', customer: 'Marcus Lee', date: 'Dec 16, 2024', time: '12:30 PM', partySize: 4, location: 'Riverside', status: 'confirmed', phone: '(503) 555-0188' },
  { id: 'RES-103', customer: 'Sofia Ramirez', date: 'Dec 16, 2024', time: '2:00 PM', partySize: 3, location: 'Maple Street', status: 'pending', phone: '(503) 555-0203' },
  { id: 'RES-104', customer: 'James Okafor', date: 'Dec 17, 2024', time: '9:00 AM', partySize: 1, location: 'Eastside', status: 'confirmed', phone: '(503) 555-0199' },
  { id: 'RES-105', customer: 'Priya Sharma', date: 'Dec 17, 2024', time: '1:00 PM', partySize: 6, location: 'Maple Street', status: 'pending', phone: '(503) 555-0211' },
  { id: 'RES-106', customer: 'Liam Walsh', date: 'Dec 18, 2024', time: '11:00 AM', partySize: 2, location: 'Riverside', status: 'confirmed', phone: '(503) 555-0167' },
  { id: 'RES-107', customer: 'Ava Thompson', date: 'Dec 18, 2024', time: '3:30 PM', partySize: 5, location: 'Maple Street', status: 'cancelled', phone: '(503) 555-0145' },
  { id: 'RES-108', customer: 'Noah Chen', date: 'Dec 19, 2024', time: '10:30 AM', partySize: 4, location: 'Eastside', status: 'pending', phone: '(503) 555-0178' },
];

/* ── Customers ─────────────────────────────────────────────── */
export const adminCustomers: AdminCustomer[] = [
  { id: 'CUST-001', name: 'Emily Carter', email: 'emily.c@email.com', phone: '(503) 555-0142', orders: 47, spent: 412.50, tier: 'Gold', joined: 'Mar 2023', lastOrder: 'Dec 15, 2024' },
  { id: 'CUST-002', name: 'Marcus Lee', email: 'marcus.lee@email.com', phone: '(503) 555-0188', orders: 32, spent: 298.75, tier: 'Gold', joined: 'Jun 2023', lastOrder: 'Dec 15, 2024' },
  { id: 'CUST-003', name: 'Sofia Ramirez', email: 'sofia.r@email.com', phone: '(503) 555-0203', orders: 28, spent: 245.00, tier: 'Silver', joined: 'Aug 2023', lastOrder: 'Dec 14, 2024' },
  { id: 'CUST-004', name: 'James Okafor', email: 'james.o@email.com', phone: '(503) 555-0199', orders: 19, spent: 178.25, tier: 'Silver', joined: 'Oct 2023', lastOrder: 'Dec 14, 2024' },
  { id: 'CUST-005', name: 'Priya Sharma', email: 'priya.s@email.com', phone: '(503) 555-0211', orders: 15, spent: 132.00, tier: 'Bronze', joined: 'Jan 2024', lastOrder: 'Dec 14, 2024' },
  { id: 'CUST-006', name: 'Liam Walsh', email: 'liam.w@email.com', phone: '(503) 555-0167', orders: 52, spent: 489.50, tier: 'Platinum', joined: 'Feb 2023', lastOrder: 'Dec 13, 2024' },
  { id: 'CUST-007', name: 'Ava Thompson', email: 'ava.t@email.com', phone: '(503) 555-0145', orders: 24, spent: 215.75, tier: 'Silver', joined: 'Jul 2023', lastOrder: 'Dec 13, 2024' },
  { id: 'CUST-008', name: 'Noah Chen', email: 'noah.c@email.com', phone: '(503) 555-0178', orders: 8, spent: 67.50, tier: 'Bronze', joined: 'Sep 2024', lastOrder: 'Dec 13, 2024' },
  { id: 'CUST-009', name: 'Isabella Moore', email: 'bella.m@email.com', phone: '(503) 555-0156', orders: 31, spent: 287.00, tier: 'Gold', joined: 'May 2023', lastOrder: 'Dec 12, 2024' },
  { id: 'CUST-010', name: 'Ethan Park', email: 'ethan.p@email.com', phone: '(503) 555-0134', orders: 12, spent: 98.25, tier: 'Bronze', joined: 'Nov 2024', lastOrder: 'Dec 12, 2024' },
];

/* ── Users (staff) ─────────────────────────────────────────── */
export const adminUsers: AdminUser[] = [
  { id: 'U-001', name: 'Maya Chen', email: 'maya@brewnest.cafe', role: 'admin', status: 'active', lastLogin: '2 hours ago', avatar: 'M' },
  { id: 'U-002', name: 'David Park', email: 'david@brewnest.cafe', role: 'manager', status: 'active', lastLogin: '5 hours ago', avatar: 'D' },
  { id: 'U-003', name: 'Sarah Johnson', email: 'sarah@brewnest.cafe', role: 'staff', status: 'active', lastLogin: '1 day ago', avatar: 'S' },
  { id: 'U-004', name: 'Mike Rodriguez', email: 'mike@brewnest.cafe', role: 'staff', status: 'inactive', lastLogin: '2 weeks ago', avatar: 'M' },
  { id: 'U-005', name: 'Lisa Wang', email: 'lisa@brewnest.cafe', role: 'manager', status: 'active', lastLogin: '3 hours ago', avatar: 'L' },
  { id: 'U-006', name: 'Tom Anderson', email: 'tom@brewnest.cafe', role: 'viewer', status: 'active', lastLogin: '6 hours ago', avatar: 'T' },
  { id: 'U-007', name: 'Jessica Brown', email: 'jessica@brewnest.cafe', role: 'staff', status: 'active', lastLogin: '1 hour ago', avatar: 'J' },
  { id: 'U-008', name: 'Kevin Martinez', email: 'kevin@brewnest.cafe', role: 'staff', status: 'inactive', lastLogin: '1 month ago', avatar: 'K' },
];

/* ── Coupons ───────────────────────────────────────────────── */
export const adminCoupons: AdminCoupon[] = [
  { id: 'CPN-001', code: 'WELCOME10', type: 'percentage', value: 10, uses: 342, maxUses: 1000, status: 'active', expires: 'Dec 31, 2024' },
  { id: 'CPN-002', code: 'BREWNEST15', type: 'percentage', value: 15, uses: 189, maxUses: 500, status: 'active', expires: 'Jan 15, 2025' },
  { id: 'CPN-003', code: 'SAVE5', type: 'fixed', value: 5, uses: 456, maxUses: 1000, status: 'active', expires: 'Dec 31, 2024' },
  { id: 'CPN-004', code: 'FREESHIP', type: 'fixed', value: 3.50, uses: 234, maxUses: 500, status: 'active', expires: 'Jan 31, 2025' },
  { id: 'CPN-005', code: 'SUMMER20', type: 'percentage', value: 20, uses: 500, maxUses: 500, status: 'expired', expires: 'Sep 30, 2024' },
  { id: 'CPN-006', code: 'WINTER25', type: 'percentage', value: 25, uses: 0, maxUses: 200, status: 'scheduled', expires: 'Jan 01, 2025' },
  { id: 'CPN-007', code: 'FLASH50', type: 'fixed', value: 10, uses: 78, maxUses: 100, status: 'active', expires: 'Dec 20, 2024' },
];

/* ── Reviews ───────────────────────────────────────────────── */
export const adminReviews: AdminReview[] = [
  { id: 'RV-001', product: 'Single-Origin Espresso', customer: 'Emily Carter', rating: 5, title: 'Absolutely perfect', body: 'This has become my go-to order. The flavor is rich and balanced.', date: '2 weeks ago', status: 'published' },
  { id: 'RV-002', product: 'Classic Latte', customer: 'Marcus Lee', rating: 5, title: 'Best in Portland', body: "I've tried every specialty coffee shop in this city and BrewNest is in a league of its own.", date: '1 month ago', status: 'published' },
  { id: 'RV-003', product: 'Slow Cold Brew', customer: 'Sofia Ramirez', rating: 4, title: 'Really good, small wait', body: 'Great quality and the staff are lovely. Sometimes there is a bit of a wait.', date: '1 month ago', status: 'published' },
  { id: 'RV-004', product: 'Pour Over (V60)', customer: 'James Okafor', rating: 5, title: 'Converted me from tea', body: 'I was never a coffee person until a friend dragged me here. The barista walked me through the options.', date: '2 months ago', status: 'pending' },
  { id: 'RV-005', product: 'Matcha Latte', customer: 'Priya Sharma', rating: 4, title: 'Delicious but pricey', body: 'The quality is undeniable. Definitely on the pricier side for daily coffee.', date: '3 months ago', status: 'published' },
  { id: 'RV-006', product: 'Butter Croissant', customer: 'Liam Walsh', rating: 5, title: 'Better than Paris', body: 'I lived in France for 3 years and this croissant rivals any I had there.', date: '1 week ago', status: 'pending' },
  { id: 'RV-007', product: 'Tiramisu', customer: 'Ava Thompson', rating: 3, title: 'Good but not authentic', body: 'The flavor was nice but the texture was a bit too dense for my taste.', date: '2 weeks ago', status: 'hidden' },
];
