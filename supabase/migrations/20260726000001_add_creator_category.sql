-- Migration: Add creator_category to creators table (human_ugc, ai_ugc, hybrid)

ALTER TABLE IF EXISTS public.creators
  ADD COLUMN IF NOT EXISTS creator_category TEXT CHECK (creator_category IN ('human_ugc', 'ai_ugc', 'hybrid'));
