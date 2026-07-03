-- =====================================================================
-- BrewNest — Specialty Coffee Cafe Database Schema & Seed Script
-- Execute this script in your Supabase SQL Editor.
-- =====================================================================

-- Enable necessary Extensions
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- 1. Profiles & User Roles
-- ---------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  avatar_url text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  role text not null default 'customer' check (role in ('customer', 'admin', 'barista', 'manager')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 2. Categories
-- ---------------------------------------------------------------------

create table if not exists public.categories (
  id text primary key,
  label text not null,
  icon text,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 3. Products
-- ---------------------------------------------------------------------

create table if not exists public.products (
  id text primary key,
  name text not null,
  description text,
  long_description text,
  price numeric(10, 2) not null,
  image text,
  category text references public.categories(id) on delete set null,
  rating numeric(3, 2) default 5.00,
  review_count integer default 0,
  calories integer,
  prep_time text,
  tags text[] default '{}'::text[],
  ingredients text[] default '{}'::text[],
  is_popular boolean default false,
  is_new boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 4. Inventory
-- ---------------------------------------------------------------------

create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade unique,
  stock_quantity integer not null default 0,
  low_stock_threshold integer not null default 10,
  is_available boolean not null default true,
  restock_date timestamp with time zone,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 5. Cart & Wishlist Items
-- ---------------------------------------------------------------------

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0 and quantity <= 99),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, product_id)
);

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, product_id)
);

-- ---------------------------------------------------------------------
-- 6. Coupons
-- ---------------------------------------------------------------------

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null check (type in ('percentage', 'fixed')),
  value numeric(10, 2) not null,
  label text,
  max_uses integer,
  used_count integer not null default 0,
  min_order numeric(10, 2) not null default 0.00,
  expires_at timestamp with time zone,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 7. Orders & Order Items
-- ---------------------------------------------------------------------

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  order_number text not null unique,
  delivery_type text not null default 'pickup' check (delivery_type in ('pickup', 'delivery')),
  delivery_address text,
  pickup_location text,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  notes text,
  payment_method text not null default 'card',
  card_last4 text,
  subtotal numeric(10, 2) not null,
  discount numeric(10, 2) not null default 0.00,
  tax_amount numeric(10, 2) not null default 0.00,
  delivery_fee numeric(10, 2) not null default 0.00,
  total numeric(10, 2) not null,
  coupon_code text,
  status text not null default 'confirmed' check (status in ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  product_name text not null,
  product_image text,
  price numeric(10, 2) not null,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 8. Reviews
-- ---------------------------------------------------------------------

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  title text not null,
  body text,
  helpful_count integer not null default 0,
  is_approved boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (product_id, user_id)
);

-- ---------------------------------------------------------------------
-- 9. Reservations
-- ---------------------------------------------------------------------

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  date date not null,
  time text not null,
  party_size integer not null check (party_size >= 1 and party_size <= 20),
  location text not null default 'maple',
  notes text,
  status text not null default 'confirmed' check (status in ('pending', 'confirmed', 'cancelled', 'completed', 'no-show')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 10. Customer Addresses
-- ---------------------------------------------------------------------

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  address text not null,
  city text not null,
  zip text not null,
  is_default boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 11. Support & Engagement (Contact Messages & Newsletter)
-- ---------------------------------------------------------------------

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text not null default 'unread' check (status in ('unread', 'read', 'archived')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ---------------------------------------------------------------------
-- 12. Notifications
-- ---------------------------------------------------------------------

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('order', 'reservation', 'promo', 'system', 'review')),
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- 1. Profiles
alter table public.profiles enable row level security;
create policy "Public read profiles" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- 2. User Roles
alter table public.user_roles enable row level security;
create policy "Users can read own role" on public.user_roles for select using (auth.uid() = user_id);

-- 3. Categories
alter table public.categories enable row level security;
create policy "Allow public read categories" on public.categories for select using (true);

-- 4. Products
alter table public.products enable row level security;
create policy "Allow public read products" on public.products for select using (true);

-- 5. Inventory
alter table public.inventory enable row level security;
create policy "Allow public read inventory availability" on public.inventory for select using (true);

-- 6. Cart Items
alter table public.cart_items enable row level security;
create policy "Users can view own cart items" on public.cart_items for select using (auth.uid() = user_id);
create policy "Users can insert own cart items" on public.cart_items for insert with check (auth.uid() = user_id);
create policy "Users can update own cart items" on public.cart_items for update using (auth.uid() = user_id);
create policy "Users can delete own cart items" on public.cart_items for delete using (auth.uid() = user_id);

-- 7. Wishlist Items
alter table public.wishlist_items enable row level security;
create policy "Users can view own wishlist" on public.wishlist_items for select using (auth.uid() = user_id);
create policy "Users can insert own wishlist" on public.wishlist_items for insert with check (auth.uid() = user_id);
create policy "Users can delete own wishlist" on public.wishlist_items for delete using (auth.uid() = user_id);

-- 8. Coupons
alter table public.coupons enable row level security;
create policy "Allow public read active coupons" on public.coupons for select using (is_active = true);

-- 9. Orders
alter table public.orders enable row level security;
create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users can insert own orders" on public.orders for insert with check (auth.uid() = user_id or user_id is null);

-- 10. Order Items
alter table public.order_items enable row level security;
create policy "Users can view own order items" on public.order_items for select using (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id and (orders.user_id = auth.uid() or orders.user_id is null)
  )
);
create policy "Users can insert own order items" on public.order_items for insert with check (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id and (orders.user_id = auth.uid() or orders.user_id is null)
  )
);

-- 11. Reviews
alter table public.reviews enable row level security;
create policy "Allow public read approved reviews" on public.reviews for select using (is_approved = true);
create policy "Users can view own reviews" on public.reviews for select using (auth.uid() = user_id);
create policy "Users can insert own reviews" on public.reviews for insert with check (auth.uid() = user_id);
create policy "Users can delete own reviews" on public.reviews for delete using (auth.uid() = user_id);

-- 12. Reservations
alter table public.reservations enable row level security;
create policy "Users can view own reservations" on public.reservations for select using (auth.uid() = user_id);
create policy "Users can insert own reservations" on public.reservations for insert with check (auth.uid() = user_id or user_id is null);
create policy "Users can update own reservations" on public.reservations for update using (auth.uid() = user_id);

-- 13. Addresses
alter table public.addresses enable row level security;
create policy "Users can view own addresses" on public.addresses for select using (auth.uid() = user_id);
create policy "Users can insert own addresses" on public.addresses for insert with check (auth.uid() = user_id);
create policy "Users can update own addresses" on public.addresses for update using (auth.uid() = user_id);
create policy "Users can delete own addresses" on public.addresses for delete using (auth.uid() = user_id);

-- 14. Contact Messages
alter table public.contact_messages enable row level security;
create policy "Allow public insert messages" on public.contact_messages for insert with check (true);

-- 15. Newsletter Subscribers
alter table public.newsletter_subscribers enable row level security;
create policy "Allow public insert subscribers" on public.newsletter_subscribers for insert with check (true);
create policy "Allow public select subscribers" on public.newsletter_subscribers for select using (true);

-- 16. Notifications
alter table public.notifications enable row level security;
create policy "Users can view own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on public.notifications for update using (auth.uid() = user_id);
create policy "Users can delete own notifications" on public.notifications for delete using (auth.uid() = user_id);


-- =====================================================================
-- SEED DATA
-- =====================================================================

-- 1. Categories
insert into public.categories (id, label, icon, sort_order) values
  ('coffee', 'Coffee', '☕', 1),
  ('espresso', 'Espresso', '⚡', 2),
  ('latte', 'Latte', '🥛', 3),
  ('mocha', 'Mocha', '🍫', 4),
  ('tea', 'Tea', '🍵', 5),
  ('cold-coffee', 'Cold Coffee', '🧊', 6),
  ('breakfast', 'Breakfast', '🍳', 7),
  ('bakery', 'Bakery', '🥐', 8),
  ('desserts', 'Desserts', '🍰', 9)
on conflict (id) do update set
  label = excluded.label,
  icon = excluded.icon,
  sort_order = excluded.sort_order;

-- 2. Products (Coffee Items from menuData.ts)
insert into public.products (
  id, name, description, long_description, price, image, category, rating, review_count, calories, prep_time, tags, ingredients, is_popular, is_new
) values
  (
    'house-drip',
    'House Drip Coffee',
    'Our daily rotating single-origin, brewed strong and smooth.',
    'A classic cup done right. We rotate our house drip weekly, featuring single-origin beans from our favorite farms. Each batch is roasted in-house and brewed fresh every 30 minutes to ensure peak flavor.',
    3.50,
    '/images/beans.jpg',
    'coffee',
    4.50,
    312,
    5,
    '3 min',
    array['hot', 'vegetarian', 'signature'],
    array['Single-origin coffee', 'Filtered water'],
    true,
    false
  ),
  (
    'pour-over-v60',
    'Pour Over (V60)',
    'Hand-poured V60 highlighting the unique terroir of each bean.',
    'A meticulous single-cup brewing method using a Hario V60 dripper. Our baristas carefully control water temperature, pour rate, and bloom time to extract the fullest expression of each bean''s character.',
    5.50,
    '/images/pour-over.jpg',
    'coffee',
    4.80,
    189,
    5,
    '5 min',
    array['hot', 'vegetarian', 'signature'],
    array['Single-origin coffee (20g)', 'Filtered water (300ml)'],
    true,
    false
  ),
  (
    'chemex',
    'Chemex',
    'Thick-paper filter brew producing a crystal-clear, delicate cup.',
    'Brewed in an iconic Chemex carafe with proprietary bonded filters that remove most oils and fines. The result is a remarkably clean, tea-like cup that highlights delicate floral and fruity notes.',
    6.00,
    '/images/pour-over.jpg',
    'coffee',
    4.70,
    98,
    5,
    '6 min',
    array['hot', 'vegetarian'],
    array['Single-origin coffee (30g)', 'Filtered water (500ml)'],
    false,
    false
  ),
  (
    'cold-brew-tonic',
    'Cold Brew Tonic',
    'Cold brew over tonic water with a twist of orange peel.',
    'Our 18-hour cold brew poured over ice and topped with sparkling tonic water and fresh orange peel. A refreshing, effervescent drink that balances deep coffee richness with bright citrus notes.',
    5.50,
    '/images/cold-brew.jpg',
    'coffee',
    4.60,
    134,
    15,
    '3 min',
    array['iced', 'vegan', 'gluten-free', 'seasonal'],
    array['Cold brew concentrate', 'Tonic water', 'Orange peel'],
    false,
    true
  ),
  (
    'single-origin-espresso',
    'Single-Origin Espresso',
    'Ethiopian Yirgacheffe — bright, floral, with notes of bergamot.',
    'A double shot of our featured single-origin espresso, pulled from Ethiopian Yirgacheffe beans. Bright and floral with pronounced notes of bergamot, jasmine, and stone fruit.',
    4.50,
    '/images/espresso.jpg',
    'espresso',
    4.90,
    421,
    5,
    '2 min',
    array['hot', 'vegan', 'gluten-free', 'signature'],
    array['Single-origin espresso beans (18g)'],
    true,
    false
  ),
  (
    'cortado',
    'Cortado',
    'Equal parts espresso and warm milk — silky and balanced.',
    'A Spanish classic: equal parts double espresso and warm, lightly steamed milk. The milk is textured but not frothy, cutting the acidity of the espresso while preserving its flavor. Served in a small Gibraltar glass.',
    4.50,
    '/images/espresso.jpg',
    'espresso',
    4.70,
    167,
    30,
    '3 min',
    array['hot', 'vegetarian', 'gluten-free'],
    array['Double espresso', 'Steamed milk'],
    false,
    false
  ),
  (
    'flat-white',
    'Flat White',
    'Ristretto shots with steamed milk — silky and balanced.',
    'An Australian favorite. Two ristretto shots (shorter, sweeter espresso pulls) topped with thin, velvety microfoam steamed milk. The result is a remarkably smooth, balanced drink.',
    5.00,
    '/images/cappuccino.jpg',
    'espresso',
    4.80,
    289,
    80,
    '3 min',
    array['hot', 'vegetarian', 'gluten-free'],
    array['Double ristretto', 'Steamed whole milk'],
    true,
    false
  ),
  (
    'classic-latte',
    'Classic Latte',
    'Double shot with silky steamed milk and a thin layer of foam.',
    'The café standard, perfected. Two shots of our house espresso blend combined with 10oz of silky steamed milk and topped with a thin layer of microfoam. Smooth, creamy, and approachable.',
    5.00,
    '/images/cappuccino.jpg',
    'latte',
    4.60,
    356,
    120,
    '3 min',
    array['hot', 'vegetarian', 'gluten-free'],
    array['Double espresso', 'Steamed milk', 'Microfoam'],
    false,
    false
  ),
  (
    'vanilla-latte',
    'Vanilla Latte',
    'House-made vanilla syrup, double espresso, and steamed milk.',
    'Our classic latte elevated with house-made vanilla bean syrup — we steep real Madagascar vanilla pods into organic cane sugar syrup. Two shots of espresso, steamed milk, and just the right amount of sweetness.',
    5.50,
    '/images/cappuccino.jpg',
    'latte',
    4.70,
    278,
    180,
    '3 min',
    array['hot', 'vegetarian', 'gluten-free'],
    array['Double espresso', 'Steamed milk', 'Vanilla bean syrup'],
    true,
    false
  ),
  (
    'classic-mocha',
    'Classic Mocha',
    'Double espresso, dark chocolate ganache, and steamed milk.',
    'A decadent fusion of coffee and chocolate. We melt 70% dark chocolate ganache into double espresso, then top with steamed milk and a thin layer of foam. Finished with a dusting of cocoa powder.',
    5.75,
    '/images/mocha.jpg',
    'mocha',
    4.70,
    198,
    240,
    '4 min',
    array['hot', 'vegetarian', 'gluten-free', 'signature'],
    array['Double espresso', 'Dark chocolate ganache', 'Steamed milk', 'Cocoa powder'],
    true,
    false
  ),
  (
    'slow-cold-brew',
    'Slow Cold Brew',
    '18-hour steeped, naturally sweet and impossibly smooth.',
    'We steep coarse-ground coffee in cold water for 18 hours, then filter it through paper. The slow, cold extraction produces a naturally sweet, low-acid coffee with chocolate and caramel notes.',
    4.75,
    '/images/cold-brew.jpg',
    'cold-coffee',
    4.70,
    312,
    15,
    '2 min',
    array['iced', 'vegan', 'gluten-free', 'sugar-free', 'signature'],
    array['Cold brew concentrate', 'Ice'],
    true,
    false
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  long_description = excluded.long_description,
  price = excluded.price,
  image = excluded.image,
  category = excluded.category,
  rating = excluded.rating,
  review_count = excluded.review_count,
  calories = excluded.calories,
  prep_time = excluded.prep_time,
  tags = excluded.tags,
  ingredients = excluded.ingredients,
  is_popular = excluded.is_popular,
  is_new = excluded.is_new;

-- 3. Inventory for seeded products
insert into public.inventory (product_id, stock_quantity, low_stock_threshold, is_available) values
  ('house-drip', 150, 15, true),
  ('pour-over-v60', 80, 10, true),
  ('chemex', 45, 5, true),
  ('cold-brew-tonic', 60, 8, true),
  ('single-origin-espresso', 120, 12, true),
  ('cortado', 95, 10, true),
  ('flat-white', 110, 15, true),
  ('classic-latte', 200, 20, true),
  ('vanilla-latte', 180, 15, true),
  ('classic-mocha', 85, 10, true),
  ('slow-cold-brew', 100, 10, true)
on conflict (product_id) do update set
  stock_quantity = excluded.stock_quantity,
  low_stock_threshold = excluded.low_stock_threshold,
  is_available = excluded.is_available;

-- 4. Coupons
insert into public.coupons (code, type, value, label, max_uses, min_order, is_active) values
  ('BREWNEW10', 'percentage', 10.00, '10% off for new customers', 500, 0.00, true),
  ('COFFEELOVER', 'fixed', 5.00, '$5 off on orders above $25', 200, 25.00, true),
  ('VIPBEANS', 'percentage', 20.00, '20% exclusive discount', 50, 40.00, true)
on conflict (code) do update set
  type = excluded.type,
  value = excluded.value,
  label = excluded.label,
  max_uses = excluded.max_uses,
  min_order = excluded.min_order,
  is_active = excluded.is_active;
