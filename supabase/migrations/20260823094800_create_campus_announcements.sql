-- Migration: 20260823094800_create_campus_announcements.sql
-- Description: Creates campus_announcements table and ensures club_name column exists.

-- 1. Create campus_announcements table
CREATE TABLE IF NOT EXISTS public.campus_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'announcement',
  club_name text,
  event_date text,
  link_url text,
  is_pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Add column explicitly in case table was created in an earlier run without it
ALTER TABLE public.campus_announcements
  ADD COLUMN IF NOT EXISTS club_name text;

-- 3. Performance indexes
CREATE INDEX IF NOT EXISTS idx_announcements_created ON public.campus_announcements (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_creator ON public.campus_announcements (creator_id);
CREATE INDEX IF NOT EXISTS idx_announcements_category ON public.campus_announcements (category);
CREATE INDEX IF NOT EXISTS idx_announcements_club ON public.campus_announcements (club_name);

-- 4. Enable RLS
ALTER TABLE public.campus_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_announcements REPLICA IDENTITY FULL;

-- 5. Drop existing policies to prevent "already exists" conflict on re-run
DROP POLICY IF EXISTS "View announcements" ON public.campus_announcements;
DROP POLICY IF EXISTS "Create announcements by titled members" ON public.campus_announcements;
DROP POLICY IF EXISTS "Update own announcements" ON public.campus_announcements;
DROP POLICY IF EXISTS "Delete own announcements" ON public.campus_announcements;

-- All verified students/instructors can view announcements
CREATE POLICY "View announcements"
  ON public.campus_announcements
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can create announcements
CREATE POLICY "Create announcements by titled members"
  ON public.campus_announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = creator_id
  );

-- Creators and admins can update their own announcements
CREATE POLICY "Update own announcements"
  ON public.campus_announcements
  FOR UPDATE
  TO authenticated
  USING (
    creator_id = auth.uid()
    OR (SELECT public.is_admin(auth.uid()))
  )
  WITH CHECK (
    creator_id = auth.uid()
    OR (SELECT public.is_admin(auth.uid()))
  );

-- Creators and admins can delete announcements
CREATE POLICY "Delete own announcements"
  ON public.campus_announcements
  FOR DELETE
  TO authenticated
  USING (
    creator_id = auth.uid()
    OR (SELECT public.is_admin(auth.uid()))
  );

-- 6. Realtime publication (safely check if already in publication)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'campus_announcements'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.campus_announcements;
  END IF;
END $$;

-- 7. Trigger for updated_at
DROP TRIGGER IF EXISTS set_announcements_updated_at ON public.campus_announcements;
CREATE TRIGGER set_announcements_updated_at
  BEFORE UPDATE ON public.campus_announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 8. Grant execution & permissions
GRANT ALL ON TABLE public.campus_announcements TO authenticated;
