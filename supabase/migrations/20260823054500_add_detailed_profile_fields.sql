-- Migration: 20260823054500_add_detailed_profile_fields.sql
-- Description: Adds detailed profile fields (college title, interests, bus_opted, social URLs)
--              and GIN indexes for fast dynamic array filtering across Explore Directory.

-- 1. Add detailed profile columns to public.profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS interests text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS bus_opted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS github_url text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS twitter_url text,
  ADD COLUMN IF NOT EXISTS portfolio_url text;

-- 2. GIN Indexes for high-performance multi-attribute array filtering
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON public.profiles USING GIN (skills);
CREATE INDEX IF NOT EXISTS idx_profiles_achievements ON public.profiles USING GIN (achievements);
CREATE INDEX IF NOT EXISTS idx_profiles_clubs ON public.profiles USING GIN (clubs);
CREATE INDEX IF NOT EXISTS idx_profiles_interests ON public.profiles USING GIN (interests);
CREATE INDEX IF NOT EXISTS idx_profiles_title ON public.profiles (title) WHERE title IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_bus_opted ON public.profiles (bus_opted);
