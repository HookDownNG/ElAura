-- Migration: Clean up obsolete influencer columns and add UGC specific columns

-- 1. Add creator_category if not present
ALTER TABLE IF EXISTS public.creators
  ADD COLUMN IF NOT EXISTS creator_category TEXT CHECK (creator_category IN ('human_ugc', 'ai_ugc', 'hybrid'));

-- 2. Add shipping_address for product dispatch to UGC creators
ALTER TABLE IF EXISTS public.creators
  ADD COLUMN IF NOT EXISTS shipping_address TEXT;

-- 3. Drop obsolete audience-based influencer columns
ALTER TABLE IF EXISTS public.creators
  DROP COLUMN IF EXISTS audience_size,
  DROP COLUMN IF EXISTS audience_locations,
  DROP COLUMN IF EXISTS audience_demographic;
