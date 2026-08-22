-- Migration: 20260823041500_create_campus_chat_and_channels.sql
-- Campus chat system for SST verified students: DM + Group Channels
-- Designed for supabase-js realtime subscriptions

-- ═══════════════════════════════════════════════════════════════
-- 1. DIRECT MESSAGE CONVERSATIONS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_2 uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message_text text,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT different_participants CHECK (participant_1 <> participant_2)
);

-- Prevent duplicate DM threads between the same two students
CREATE UNIQUE INDEX idx_unique_conversation_pair
  ON public.conversations (LEAST(participant_1, participant_2), GREATEST(participant_1, participant_2));

CREATE INDEX idx_conversations_p1 ON public.conversations(participant_1);
CREATE INDEX idx_conversations_p2 ON public.conversations(participant_2);
CREATE INDEX idx_conversations_last_msg ON public.conversations(last_message_at DESC);

-- Reuse the existing set_updated_at trigger function from profiles migration
CREATE TRIGGER conversations_set_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- 2. DIRECT MESSAGES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 4000),
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_dm_conversation ON public.direct_messages(conversation_id, created_at ASC);
CREATE INDEX idx_dm_sender ON public.direct_messages(sender_id);
CREATE INDEX idx_dm_unread ON public.direct_messages(conversation_id, read_at) WHERE read_at IS NULL;

-- Auto-update conversation.last_message when a new DM is inserted
CREATE OR REPLACE FUNCTION public.handle_new_direct_message()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.conversations
  SET last_message_text = NEW.content,
      last_message_at   = NEW.created_at,
      updated_at         = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_direct_message_created
  AFTER INSERT ON public.direct_messages
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_direct_message();

-- Helper: find-or-create a conversation between two students (called from frontend)
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(user_a uuid, user_b uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  conv_id uuid;
BEGIN
  -- Look for existing conversation (order-independent)
  SELECT id INTO conv_id
  FROM public.conversations
  WHERE LEAST(participant_1, participant_2) = LEAST(user_a, user_b)
    AND GREATEST(participant_1, participant_2) = GREATEST(user_a, user_b);

  IF conv_id IS NOT NULL THEN
    RETURN conv_id;
  END IF;

  -- Create a new one
  INSERT INTO public.conversations (participant_1, participant_2)
  VALUES (user_a, user_b)
  RETURNING id INTO conv_id;

  RETURN conv_id;
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 3. GROUP CHANNELS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.channels (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('batch','hostel','club','academics','general')),
  category_label text NOT NULL,
  pinned_notice text,
  icon text,
  is_auto_enrolled boolean NOT NULL DEFAULT true,
  -- Filter columns: used by auto-enrollment trigger to match student profiles
  batch_filter text,
  hostel_filter text,
  club_filter text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_channels_category ON public.channels(category);

CREATE TRIGGER channels_set_updated_at
  BEFORE UPDATE ON public.channels
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ═══════════════════════════════════════════════════════════════
-- 4. CHANNEL MEMBERSHIPS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.channel_members (
  channel_id text NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('member','moderator','admin')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (channel_id, user_id)
);

CREATE INDEX idx_cm_user ON public.channel_members(user_id);

-- ═══════════════════════════════════════════════════════════════
-- 5. CHANNEL MESSAGES
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.channel_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id text NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 4000),
  reactions jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_chm_channel ON public.channel_messages(channel_id, created_at ASC);
CREATE INDEX idx_chm_sender ON public.channel_messages(sender_id);

-- ═══════════════════════════════════════════════════════════════
-- 6. AUTO-ENROLLMENT TRIGGER
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.auto_enroll_student_in_channels()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Batch channels
  IF NEW.batch IS NOT NULL AND NEW.batch <> '' THEN
    INSERT INTO public.channel_members (channel_id, user_id)
    SELECT id, NEW.id FROM public.channels
    WHERE category = 'batch' AND batch_filter = NEW.batch
    ON CONFLICT DO NOTHING;
  END IF;

  -- Hostel channels
  IF NEW.hostel IS NOT NULL AND NEW.hostel <> '' THEN
    INSERT INTO public.channel_members (channel_id, user_id)
    SELECT id, NEW.id FROM public.channels
    WHERE category = 'hostel' AND hostel_filter = NEW.hostel
    ON CONFLICT DO NOTHING;
  END IF;

  -- General & academic channels (auto-enrolled for everyone)
  INSERT INTO public.channel_members (channel_id, user_id)
  SELECT id, NEW.id FROM public.channels
  WHERE category IN ('academics','general') AND is_auto_enrolled = true
  ON CONFLICT DO NOTHING;

  -- Club channels matching the student's enrolled clubs
  IF NEW.clubs IS NOT NULL AND array_length(NEW.clubs, 1) > 0 THEN
    INSERT INTO public.channel_members (channel_id, user_id)
    SELECT id, NEW.id FROM public.channels
    WHERE category = 'club' AND club_filter = ANY(NEW.clubs)
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_auto_enroll
  AFTER INSERT OR UPDATE OF batch, hostel, clubs ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.auto_enroll_student_in_channels();

-- ═══════════════════════════════════════════════════════════════
-- 7. ROW-LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.conversations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_messages    ENABLE ROW LEVEL SECURITY;

-- Conversations: participants only
CREATE POLICY "View own conversations" ON public.conversations
  FOR SELECT TO authenticated
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Create conversation" ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Update own conversation" ON public.conversations
  FOR UPDATE TO authenticated
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Direct messages: only conversation participants
CREATE POLICY "View conversation messages" ON public.direct_messages
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

CREATE POLICY "Send message" ON public.direct_messages
  FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

CREATE POLICY "Mark messages read" ON public.direct_messages
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id
        AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

-- Channels: all authenticated students can view
CREATE POLICY "View channels" ON public.channels
  FOR SELECT TO authenticated USING (true);

-- Channel members: view all, manage own
CREATE POLICY "View channel members" ON public.channel_members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Join channel" ON public.channel_members
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Leave channel" ON public.channel_members
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Channel messages: view all, post as self
CREATE POLICY "View channel messages" ON public.channel_messages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Post channel message" ON public.channel_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Update reactions" ON public.channel_messages
  FOR UPDATE TO authenticated USING (true);

-- ═══════════════════════════════════════════════════════════════
-- 8. GRANTS
-- ═══════════════════════════════════════════════════════════════

GRANT SELECT, INSERT, UPDATE       ON public.conversations      TO authenticated;
GRANT SELECT, INSERT, UPDATE       ON public.direct_messages     TO authenticated;
GRANT SELECT                       ON public.channels            TO authenticated;
GRANT SELECT, INSERT, DELETE       ON public.channel_members     TO authenticated;
GRANT SELECT, INSERT, UPDATE       ON public.channel_messages    TO authenticated;

GRANT ALL ON public.conversations      TO service_role;
GRANT ALL ON public.direct_messages    TO service_role;
GRANT ALL ON public.channels           TO service_role;
GRANT ALL ON public.channel_members    TO service_role;
GRANT ALL ON public.channel_messages   TO service_role;

-- Revoke direct execution of internal trigger functions
REVOKE EXECUTE ON FUNCTION public.handle_new_direct_message()       FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_enroll_student_in_channels() FROM PUBLIC, anon, authenticated;
-- Keep get_or_create_conversation callable by authenticated users
GRANT EXECUTE ON FUNCTION public.get_or_create_conversation(uuid, uuid) TO authenticated;

-- ═══════════════════════════════════════════════════════════════
-- 9. SUPABASE REALTIME
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.direct_messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.channel_messages REPLICA IDENTITY FULL;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

