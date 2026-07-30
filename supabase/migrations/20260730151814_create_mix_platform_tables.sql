/*
# MIX Platform — Core tables with real-time sync

Creates the core data tables for the MIX multi-merchant platform:
stores, products, store_requests, users, orders, reviews, banners, coupons.

All tables use `TO anon, authenticated` policies because the app currently
uses a local/hybrid auth model (not Supabase Auth). This allows the anon-key
frontend client to read and write all shared platform data.

## New Tables
1. `stores` — merchant stores with full config (theme, layout, payment gateways, etc.)
2. `products` — products belonging to stores
3. `store_requests` — pending merchant store creation requests (visible to admin)
4. `app_users` — platform users (merchants, customers, admins)
5. `orders` — customer orders
6. `reviews` — store reviews
7. `banners` — platform-wide and store-specific banners
8. `coupons` — discount coupons

## Security
- RLS enabled on all tables.
- All policies use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)`
  because the platform data is intentionally shared across all users (single-tenant model).
- This allows the anon-key client to perform full CRUD on all platform data.

## Real-time
- All tables are added to the Supabase real-time publication so the frontend
  can subscribe to INSERT/UPDATE/DELETE events and update the UI instantly.
*/

-- ============================================================
-- 1. STORES
-- ============================================================
CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT DEFAULT '',
  cover TEXT DEFAULT '',
  category TEXT DEFAULT '',
  business_type TEXT,
  phone_condition TEXT,
  description TEXT DEFAULT '',
  city TEXT DEFAULT '',
  district TEXT,
  neighborhood TEXT,
  store_phone TEXT,
  seo_description TEXT,
  seo_keywords TEXT,
  slug TEXT,
  country TEXT DEFAULT '',
  rating NUMERIC DEFAULT 5.0,
  reviews_count INT DEFAULT 0,
  products_count INT DEFAULT 0,
  theme_color JSONB DEFAULT '{"primary":"#D4AF37","secondary":"#111111","background":"#050505","frameColor":"#141414","textColor":"#d4d4d8"}',
  layout_type TEXT DEFAULT 'luxury',
  visual_template TEXT DEFAULT 'multicategory',
  banners JSONB DEFAULT '[]',
  categories JSONB DEFAULT '[]',
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active',
  owner_id TEXT DEFAULT '',
  commission_rate NUMERIC DEFAULT 5,
  sales_count INT DEFAULT 0,
  repair_services JSONB DEFAULT '[]',
  features JSONB DEFAULT '[]',
  sections_order JSONB DEFAULT '[]',
  section_visibility JSONB DEFAULT '{}',
  store_location JSONB DEFAULT '{}',
  services_list JSONB DEFAULT '[]',
  font_family TEXT,
  border_radius TEXT,
  shadow_type TEXT,
  currency TEXT DEFAULT 'ر.س',
  payment_gateways JSONB DEFAULT '[]',
  custom_checkout_fields JSONB DEFAULT '[]',
  epithet TEXT,
  template_config JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_stores" ON stores;
CREATE POLICY "anon_select_stores" ON stores FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_stores" ON stores;
CREATE POLICY "anon_insert_stores" ON stores FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_stores" ON stores;
CREATE POLICY "anon_update_stores" ON stores FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_stores" ON stores;
CREATE POLICY "anon_delete_stores" ON stores FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 2. PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  original_price NUMERIC,
  image TEXT DEFAULT '',
  images JSONB DEFAULT '[]',
  category TEXT DEFAULT '',
  description TEXT DEFAULT '',
  rating NUMERIC DEFAULT 5,
  stock INT DEFAULT 0,
  sales_count INT DEFAULT 0,
  is_offer BOOLEAN DEFAULT false,
  offer_text TEXT,
  featured BOOLEAN DEFAULT false,
  condition TEXT,
  warranty TEXT,
  specs JSONB DEFAULT '{}',
  brand TEXT,
  device_model TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products" ON products FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "anon_delete_products" ON products FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 3. STORE_REQUESTS (merchant onboarding requests → admin dashboard)
-- ============================================================
CREATE TABLE IF NOT EXISTS store_requests (
  id TEXT PRIMARY KEY,
  merchant_name TEXT NOT NULL,
  merchant_email TEXT NOT NULL,
  merchant_password TEXT,
  store_name TEXT NOT NULL,
  store_category TEXT DEFAULT '',
  store_description TEXT,
  store_city TEXT,
  store_district TEXT,
  store_neighborhood TEXT,
  store_phone TEXT,
  store_logo TEXT,
  store_cover TEXT,
  visual_template TEXT,
  commission_rate NUMERIC DEFAULT 3,
  status TEXT DEFAULT 'pending',
  approved_at TIMESTAMPTZ,
  store_id TEXT,
  merchant_user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE store_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_store_requests" ON store_requests;
CREATE POLICY "anon_select_store_requests" ON store_requests FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_store_requests" ON store_requests;
CREATE POLICY "anon_insert_store_requests" ON store_requests FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_store_requests" ON store_requests;
CREATE POLICY "anon_update_store_requests" ON store_requests FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_store_requests" ON store_requests;
CREATE POLICY "anon_delete_store_requests" ON store_requests FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 4. APP_USERS (platform users: merchants, customers, admins)
-- ============================================================
CREATE TABLE IF NOT EXISTS app_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT,
  role TEXT DEFAULT 'user',
  store_id TEXT,
  status TEXT DEFAULT 'active',
  epithet TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_app_users" ON app_users;
CREATE POLICY "anon_select_app_users" ON app_users FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_app_users" ON app_users;
CREATE POLICY "anon_insert_app_users" ON app_users FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_app_users" ON app_users;
CREATE POLICY "anon_update_app_users" ON app_users FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_app_users" ON app_users;
CREATE POLICY "anon_delete_app_users" ON app_users FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 5. ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  store_name TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  items JSONB DEFAULT '[]',
  total NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  date TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_orders" ON orders;
CREATE POLICY "anon_update_orders" ON orders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_orders" ON orders;
CREATE POLICY "anon_delete_orders" ON orders FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 6. REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  user_name TEXT,
  rating NUMERIC DEFAULT 5,
  comment TEXT,
  date TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_reviews" ON reviews;
CREATE POLICY "anon_select_reviews" ON reviews FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_reviews" ON reviews;
CREATE POLICY "anon_insert_reviews" ON reviews FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_reviews" ON reviews;
CREATE POLICY "anon_update_reviews" ON reviews FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_reviews" ON reviews;
CREATE POLICY "anon_delete_reviews" ON reviews FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 7. BANNERS
-- ============================================================
CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY,
  title TEXT DEFAULT '',
  subtitle TEXT DEFAULT '',
  image TEXT DEFAULT '',
  video_url TEXT,
  link_type TEXT DEFAULT 'offer',
  link_value TEXT,
  active BOOLEAN DEFAULT true,
  position TEXT DEFAULT 'hero',
  button_text TEXT,
  button_link TEXT,
  is_global BOOLEAN DEFAULT false,
  force_all_stores BOOLEAN DEFAULT false,
  store_id TEXT,
  sort_order INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_banners" ON banners;
CREATE POLICY "anon_select_banners" ON banners FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_banners" ON banners;
CREATE POLICY "anon_insert_banners" ON banners FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_banners" ON banners;
CREATE POLICY "anon_update_banners" ON banners FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_banners" ON banners;
CREATE POLICY "anon_delete_banners" ON banners FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 8. COUPONS
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  store_id TEXT,
  code TEXT NOT NULL,
  discount_type TEXT DEFAULT 'percent',
  value NUMERIC DEFAULT 0,
  min_order_value NUMERIC DEFAULT 0,
  active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_coupons" ON coupons;
CREATE POLICY "anon_select_coupons" ON coupons FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_coupons" ON coupons;
CREATE POLICY "anon_insert_coupons" ON coupons FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_coupons" ON coupons;
CREATE POLICY "anon_update_coupons" ON coupons FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_coupons" ON coupons;
CREATE POLICY "anon_delete_coupons" ON coupons FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- REAL-TIME PUBLICATION
-- Add all tables to the real-time publication so the frontend
-- can subscribe to INSERT/UPDATE/DELETE events.
-- ============================================================
DO $$
BEGIN
  -- Add tables to supabase_realtime publication if not already there
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'stores'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE stores;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE products;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'store_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE store_requests;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'app_users'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE app_users;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE orders;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'reviews'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'banners'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE banners;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'coupons'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE coupons;
  END IF;
END $$;
