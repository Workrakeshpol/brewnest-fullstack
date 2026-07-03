/* ── Dashboard Data Types ───────────────────────────────────── */

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'completed' | 'processing' | 'cancelled';
  total: number;
  items: OrderItem[];
  type: 'pickup' | 'delivery';
  location: string;
}

export interface Reservation {
  id: string;
  date: string;
  time: string;
  partySize: number;
  location: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  city: string;
  zip: string;
  isDefault?: boolean;
}

export interface AppNotification {
  id: string;
  type: 'order' | 'reservation' | 'promo' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  memberSince: string;
  loyaltyPoints: number;
  tier: 'Bronze' | 'Silver' | 'Gold';
  totalOrders: number;
  totalSpent: number;
}

/* ── Seed Data ──────────────────────────────────────────────── */

export const userProfile: UserProfile = {
  name: 'Maya Chen',
  email: 'maya.chen@example.com',
  phone: '(503) 555-0142',
  avatar: 'MC',
  memberSince: 'March 2022',
  loyaltyPoints: 1240,
  tier: 'Gold',
  totalOrders: 47,
  totalSpent: 682.50,
};

export const orders: Order[] = [
  {
    id: 'BN-2024-0142',
    date: 'Jun 28, 2024',
    status: 'completed',
    total: 18.75,
    type: 'pickup',
    location: 'Maple Street',
    items: [
      { name: 'Single-Origin Espresso', quantity: 2, price: 4.50, image: '/images/espresso.jpg' },
      { name: 'Butter Croissant', quantity: 1, price: 3.75, image: '/images/bakery-croissant.jpg' },
      { name: 'Matcha Latte', quantity: 1, price: 5.50, image: '/images/tea-matcha.jpg' },
    ],
  },
  {
    id: 'BN-2024-0138',
    date: 'Jun 24, 2024',
    status: 'completed',
    total: 24.50,
    type: 'delivery',
    location: 'Maple Street',
    items: [
      { name: 'Classic Mocha', quantity: 2, price: 5.75, image: '/images/mocha.jpg' },
      { name: 'Almond Croissant', quantity: 2, price: 4.75, image: '/images/bakery-croissant.jpg' },
      { name: 'Slow Cold Brew', quantity: 1, price: 4.75, image: '/images/cold-brew.jpg' },
    ],
  },
  {
    id: 'BN-2024-0131',
    date: 'Jun 18, 2024',
    status: 'completed',
    total: 15.25,
    type: 'pickup',
    location: 'Riverside District',
    items: [
      { name: 'Flat White', quantity: 1, price: 5.00, image: '/images/cappuccino.jpg' },
      { name: 'Avocado Toast', quantity: 1, price: 8.50, image: '/images/breakfast-avocado-toast.jpg' },
    ],
  },
  {
    id: 'BN-2024-0125',
    date: 'Jun 10, 2024',
    status: 'completed',
    total: 32.00,
    type: 'delivery',
    location: 'Maple Street',
    items: [
      { name: 'Pour Over (V60)', quantity: 2, price: 5.50, image: '/images/pour-over.jpg' },
      { name: 'Tiramisu', quantity: 2, price: 6.50, image: '/images/dessert-tiramisu.jpg' },
      { name: 'Cinnamon Roll', quantity: 2, price: 4.50, image: '/images/bakery-cinnamon-roll.jpg' },
    ],
  },
  {
    id: 'BN-2024-0148',
    date: 'Jun 30, 2024',
    status: 'processing',
    total: 12.25,
    type: 'pickup',
    location: 'Maple Street',
    items: [
      { name: 'Vanilla Latte', quantity: 1, price: 5.50, image: '/images/cappuccino.jpg' },
      { name: 'Blueberry Muffin', quantity: 1, price: 3.50, image: '/images/bakery-muffin.jpg' },
      { name: 'Iced Americano', quantity: 1, price: 4.50, image: '/images/cold-brew.jpg' },
    ],
  },
];

export const reservations: Reservation[] = [
  {
    id: 'RSV-0089',
    date: 'Jul 5, 2024',
    time: '10:00 AM',
    partySize: 4,
    location: 'Maple Street',
    status: 'upcoming',
    notes: 'Window table preferred',
  },
  {
    id: 'RSV-0082',
    date: 'Jun 22, 2024',
    time: '2:30 PM',
    partySize: 2,
    location: 'Riverside District',
    status: 'completed',
  },
  {
    id: 'RSV-0074',
    date: 'Jun 8, 2024',
    time: '9:00 AM',
    partySize: 6,
    location: 'Maple Street',
    status: 'completed',
    notes: 'Birthday celebration',
  },
];

export const savedAddresses: SavedAddress[] = [
  {
    id: 'addr-1',
    label: 'Home',
    address: '128 Maple Street, Apt 4B',
    city: 'Portland',
    zip: '97201',
    isDefault: true,
  },
  {
    id: 'addr-2',
    label: 'Work',
    address: '500 SW Washington St, Suite 1200',
    city: 'Portland',
    zip: '97204',
  },
];

export const notifications: AppNotification[] = [
  {
    id: 'n1',
    type: 'order',
    title: 'Order Ready for Pickup',
    message: 'Your order BN-2024-0148 is ready at Maple Street. See you soon!',
    time: '5 min ago',
    read: false,
  },
  {
    id: 'n2',
    type: 'promo',
    title: 'Double Points Weekend',
    message: 'Earn 2× loyalty points on all orders this weekend. Maximize your rewards!',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 'n3',
    type: 'reservation',
    title: 'Reservation Confirmed',
    message: 'Your table for 4 at Maple Street on Jul 5 is confirmed for 10:00 AM.',
    time: '1 day ago',
    read: true,
  },
  {
    id: 'n4',
    type: 'system',
    title: 'Welcome to Gold Tier',
    message: 'You have been upgraded to Gold tier! Enjoy exclusive perks and rewards.',
    time: '3 days ago',
    read: true,
  },
  {
    id: 'n5',
    type: 'order',
    title: 'Order Delivered',
    message: 'Your order BN-2024-0138 has been delivered. Rate your experience!',
    time: '5 days ago',
    read: true,
  },
];
