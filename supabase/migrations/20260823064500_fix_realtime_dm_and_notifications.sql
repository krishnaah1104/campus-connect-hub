-- Migration: 20260823064500_fix_realtime_dm_and_notifications.sql
-- Description: Adds direct recipient_id column to direct_messages, updates RLS policies
--              to direct column checks (required by Supabase Realtime for instant event broadcasting),
--              and sets full replica identity and publication on all chat tables.

-- 1. Add recipient_id column to direct_messages if not exists
ALTER TABLE public.direct_messages
  ADD COLUMN IF NOT EXISTS recipient_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. Backfill recipient_id for any existing direct_messages from conversations
UPDATE public.direct_messages dm
SET recipient_id = CASE
  WHEN c.participant_1 = dm.sender_id THEN c.participant_2
  ELSE c.participant_1
END
FROM public.conversations c
WHERE c.id = dm.conversation_id
  AND dm.recipient_id IS NULL;

-- 3. Trigger to automatically populate recipient_id on new direct_messages
CREATE OR REPLACE FUNCTION public.populate_dm_recipient()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.recipient_id IS NULL THEN
    SELECT CASE
      WHEN participant_1 = NEW.sender_id THEN participant_2
      ELSE participant_1
    END
    INTO NEW.recipient_id
    FROM public.conversations
    WHERE id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_populate_dm_recipient ON public.direct_messages;

CREATE TRIGGER trg_populate_dm_recipient
  BEFORE INSERT ON public.direct_messages
  FOR EACH ROW EXECUTE FUNCTION public.populate_dm_recipient();

-- 4. Clean, direct-column RLS policies on direct_messages (Enables Supabase Realtime WALrus engine)
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View conversation messages" ON public.direct_messages;
DROP POLICY IF EXISTS "View direct messages" ON public.direct_messages;
DROP POLICY IF EXISTS "Send message" ON public.direct_messages;
DROP POLICY IF EXISTS "Send direct message" ON public.direct_messages;
DROP POLICY IF EXISTS "Mark messages read" ON public.direct_messages;
DROP POLICY IF EXISTS "Mark direct messages read" ON public.direct_messages;

-- Direct column check for SELECT: sender or recipient
CREATE POLICY "View direct messages" ON public.direct_messages
  FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Sender can insert
CREATE POLICY "Send direct message" ON public.direct_messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Recipient or sender can mark read
CREATE POLICY "Mark direct messages read" ON public.direct_messages
  FOR UPDATE TO authenticated
  USING (auth.uid() = recipient_id OR auth.uid() = sender_id);

-- 5. Performance index for unread message counts
CREATE INDEX IF NOT EXISTS idx_dm_recipient_unread
  ON public.direct_messages (recipient_id, read_at)
  WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_dm_recipient
  ON public.direct_messages (recipient_id);

-- 6. Replica Identity FULL & Supabase Realtime Publication
ALTER TABLE public.direct_messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.channel_messages REPLICA IDENTITY FULL;
ALTER TABLE public.channels REPLICA IDENTITY FULL;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.channels;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
