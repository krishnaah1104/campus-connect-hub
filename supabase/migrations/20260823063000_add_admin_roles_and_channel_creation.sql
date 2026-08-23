-- Migration: 20260823063000_add_admin_roles_and_channel_creation.sql
-- Description: Admin authorization, channel creation RLS, and auto-enrollment triggers.

-- 1. Helper function: check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF uid IS NULL THEN RETURN false; END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = uid
      AND ('admin' = ANY(roles))
  );
END;
$$;

-- 2. Secure channels table with RLS (Only Admin can insert, update, or delete channels)
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View channels" ON public.channels;
DROP POLICY IF EXISTS "Admin can insert channels" ON public.channels;
DROP POLICY IF EXISTS "Admin can update channels" ON public.channels;
DROP POLICY IF EXISTS "Admin can delete channels" ON public.channels;

-- All students can view channels
CREATE POLICY "View channels" ON public.channels
  FOR SELECT TO authenticated USING (true);

-- Only Admin can create new channels
CREATE POLICY "Admin can insert channels" ON public.channels
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- Only Admin can update channels (e.g. pinned notice, description)
CREATE POLICY "Admin can update channels" ON public.channels
  FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Only Admin can delete channels
CREATE POLICY "Admin can delete channels" ON public.channels
  FOR DELETE TO authenticated
  USING (public.is_admin(auth.uid()));

-- 3. Auto-enroll matching students when admin creates a new channel
CREATE OR REPLACE FUNCTION public.auto_enroll_new_channel_members()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- General / Academic channels -> enroll all onboarded students
  IF NEW.is_auto_enrolled AND NEW.category IN ('academics', 'general') THEN
    INSERT INTO public.channel_members (channel_id, user_id)
    SELECT NEW.id, p.id FROM public.profiles p WHERE p.onboarding_complete = true
    ON CONFLICT DO NOTHING;
  END IF;

  -- Batch channels -> enroll students in matching batch
  IF NEW.category = 'batch' AND NEW.batch_filter IS NOT NULL AND NEW.batch_filter <> '' THEN
    INSERT INTO public.channel_members (channel_id, user_id)
    SELECT NEW.id, p.id FROM public.profiles p WHERE p.batch = NEW.batch_filter
    ON CONFLICT DO NOTHING;
  END IF;

  -- Hostel channels -> enroll students in that hostel
  IF NEW.category = 'hostel' AND NEW.hostel_filter IS NOT NULL AND NEW.hostel_filter <> '' THEN
    INSERT INTO public.channel_members (channel_id, user_id)
    SELECT NEW.id, p.id FROM public.profiles p WHERE p.hostel = NEW.hostel_filter
    ON CONFLICT DO NOTHING;
  END IF;

  -- Club channels -> enroll students who selected this club
  IF NEW.category = 'club' AND NEW.club_filter IS NOT NULL AND NEW.club_filter <> '' THEN
    INSERT INTO public.channel_members (channel_id, user_id)
    SELECT NEW.id, p.id FROM public.profiles p WHERE NEW.club_filter = ANY(p.clubs)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Always enroll the creator (admin) with role 'admin'
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.channel_members (channel_id, user_id, role)
    VALUES (NEW.id, auth.uid(), 'admin')
    ON CONFLICT (channel_id, user_id) DO UPDATE SET role = 'admin';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_channel_created_auto_enroll ON public.channels;
CREATE TRIGGER on_channel_created_auto_enroll
  AFTER INSERT ON public.channels
  FOR EACH ROW EXECUTE FUNCTION public.auto_enroll_new_channel_members();

GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;
