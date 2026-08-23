-- Migration: 20260823094800_create_campus_announcements.sql
-- Description: Creates campus_announcements table with RLS permitting Instructors
--              and students with college titles/positions to post announcements.

-- 1. Create campus_announcements table
CREATE TABLE IF NOT EXISTS public.campus_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'announcement',
  event_date text,
  link_url text,
  is_pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Performance indexes
CREATE INDEX IF NOT EXISTS idx_announcements_created ON public.campus_announcements (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_creator ON public.campus_announcements (creator_id);
CREATE INDEX IF NOT EXISTS idx_announcements_category ON public.campus_announcements (category);

-- 3. Enable RLS
ALTER TABLE public.campus_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_announcements REPLICA IDENTITY FULL;

-- 4. RLS Policies
-- All verified students/instructors can view announcements
CREATE POLICY "View announcements"
  ON public.campus_announcements
  FOR SELECT
  TO authenticated
  USING (true);

-- Only users with a non-empty title/position or instructors can create announcements
CREATE POLICY "Create announcements by titled members"
  ON public.campus_announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = creator_id
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.title IS NOT NULL
        AND trim(profiles.title) <> ''
    )
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

-- 5. Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.campus_announcements;

-- 6. Trigger for updated_at
CREATE OR REPLACE TRIGGER set_announcements_updated_at
  BEFORE UPDATE ON public.campus_announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 7. Grant execution & permissions
GRANT ALL ON TABLE public.campus_announcements TO authenticated;
