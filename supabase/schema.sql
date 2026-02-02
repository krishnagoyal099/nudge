-- DANGER: This will delete all data
-- Rebuild everything from scratch

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop tables in dependency order
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.blink_links CASCADE;
DROP TABLE IF EXISTS public.links CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ============================================================================
-- Users
-- ============================================================================
CREATE TABLE public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  public_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  tier TEXT DEFAULT 'free'
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE INDEX IF NOT EXISTS idx_users_public_key ON public.users(public_key);

-- ============================================================================
-- Links (used by the app payment page)
-- ============================================================================
CREATE TABLE public.links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  owner_id TEXT NOT NULL REFERENCES public.users(public_key),
  stealth_public_key TEXT,
  title TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  total_received NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read links" ON public.links
  FOR SELECT USING (true);

CREATE POLICY "Users can create links" ON public.links
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own links" ON public.links
  FOR UPDATE USING (owner_id IN (SELECT public_key FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their own links" ON public.links
  FOR DELETE USING (owner_id IN (SELECT public_key FROM public.users WHERE id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_links_owner_id ON public.links(owner_id);
CREATE INDEX IF NOT EXISTS idx_links_created_at ON public.links(created_at);
CREATE INDEX IF NOT EXISTS idx_links_stealth_public_key ON public.links(stealth_public_key);

-- ============================================================================
-- Blink Links (API: /api/links)
-- ============================================================================
CREATE TABLE public.blink_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  stealth_public_key TEXT NOT NULL,
  label TEXT NOT NULL,
  blink_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.blink_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read blink links" ON public.blink_links
  FOR SELECT USING (true);

CREATE POLICY "Users can create blink links" ON public.blink_links
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete blink links" ON public.blink_links
  FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_blink_links_user_id ON public.blink_links(user_id);
CREATE INDEX IF NOT EXISTS idx_blink_links_created_at ON public.blink_links(created_at);

-- ============================================================================
-- Transactions
-- ============================================================================
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID REFERENCES public.links(id),
  amount NUMERIC NOT NULL,
  sender TEXT,
  signature TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'confirmed',
  is_withdrawn BOOLEAN DEFAULT false,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read transactions" ON public.transactions
  FOR SELECT USING (true);

CREATE POLICY "System insert transactions" ON public.transactions
  FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_transactions_link_id ON public.transactions(link_id);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON public.transactions(timestamp);
