-- Migration: 20260823070000_create_anonymous_matching.sql
-- Anonymous Campus Matching ("Vibe Mode") for ScaleX
-- Atomic matchmaking, privacy-first message schema, mutual reveal → DM conversion

-- ═══════════════════════════════════════════════════════════════
-- 1. ANONYMOUS QUEUE (Waiting Room)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.anonymous_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  alias text NOT NULL DEFAULT 'Campus Ghost',
  avatar text NOT NULL DEFAULT '👻',
  topic_tag text NOT NULL DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- No SELECT for authenticated — prevents snooping who's waiting
ALTER TABLE public.anonymous_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Queue own insert" ON public.anonymous_queue
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Queue own delete" ON public.anonymous_queue
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Allow the RPC (security definer) to read/write via service_role
GRANT ALL ON public.anonymous_queue TO service_role;
GRANT INSERT, DELETE ON public.anonymous_queue TO authenticated;

-- ═══════════════════════════════════════════════════════════════
-- 2. ANONYMOUS SESSIONS
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.anonymous_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_2 uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  alias_1 text NOT NULL,
  alias_2 text NOT NULL,
  avatar_1 text NOT NULL DEFAULT '🦊',
  avatar_2 text NOT NULL DEFAULT '🦉',
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'ended', 'revealed')),
  reveal_p1 boolean NOT NULL DEFAULT false,
  reveal_p2 boolean NOT NULL DEFAULT false,
  reported boolean NOT NULL DEFAULT false,
  dm_conversation_id uuid REFERENCES public.conversations(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  CONSTRAINT different_anon_participants CHECK (participant_1 <> participant_2)
);

CREATE INDEX idx_anon_sessions_p1 ON public.anonymous_sessions(participant_1);
CREATE INDEX idx_anon_sessions_p2 ON public.anonymous_sessions(participant_2);
CREATE INDEX idx_anon_sessions_status ON public.anonymous_sessions(status) WHERE status = 'active';

ALTER TABLE public.anonymous_sessions ENABLE ROW LEVEL SECURITY;

-- Students can view their own sessions (but participant columns are visible — 
-- privacy is enforced at the frontend by never showing the other's real ID)
CREATE POLICY "View own sessions" ON public.anonymous_sessions
  FOR SELECT TO authenticated
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Students can update their own reveal flag or report
CREATE POLICY "Update own session" ON public.anonymous_sessions
  FOR UPDATE TO authenticated
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

GRANT SELECT, UPDATE ON public.anonymous_sessions TO authenticated;
GRANT ALL ON public.anonymous_sessions TO service_role;

-- ═══════════════════════════════════════════════════════════════
-- 3. ANONYMOUS MESSAGES (Privacy-First: no sender_id exposed)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.anonymous_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.anonymous_sessions(id) ON DELETE CASCADE,
  sender_alias text NOT NULL,
  is_p1 boolean NOT NULL,
  content text NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_anon_messages_session ON public.anonymous_messages(session_id, created_at ASC);

ALTER TABLE public.anonymous_messages ENABLE ROW LEVEL SECURITY;

-- Students can read messages in their own sessions
CREATE POLICY "View session messages" ON public.anonymous_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.anonymous_sessions s
      WHERE s.id = session_id
        AND (s.participant_1 = auth.uid() OR s.participant_2 = auth.uid())
    )
  );

-- Students can insert messages in their own active sessions with correct is_p1
CREATE POLICY "Send session message" ON public.anonymous_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.anonymous_sessions s
      WHERE s.id = session_id
        AND s.status = 'active'
        AND (
          (s.participant_1 = auth.uid() AND is_p1 = true)
          OR
          (s.participant_2 = auth.uid() AND is_p1 = false)
        )
    )
  );

GRANT SELECT, INSERT ON public.anonymous_messages TO authenticated;
GRANT ALL ON public.anonymous_messages TO service_role;

-- ═══════════════════════════════════════════════════════════════
-- 4. ATOMIC MATCHMAKING RPC
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.find_or_join_anonymous_match(
  p_alias text,
  p_avatar text,
  p_topic text DEFAULT 'general'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_waiting record;
  v_session_id uuid;
  v_curr_user uuid := auth.uid();
BEGIN
  IF v_curr_user IS NULL THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Not authenticated');
  END IF;

  -- Check if user already has an active session
  SELECT id INTO v_session_id
  FROM public.anonymous_sessions
  WHERE status = 'active'
    AND (participant_1 = v_curr_user OR participant_2 = v_curr_user)
  LIMIT 1;

  IF v_session_id IS NOT NULL THEN
    -- Return existing active session
    RETURN jsonb_build_object(
      'status', 'already_matched',
      'session_id', v_session_id
    );
  END IF;

  -- Try to find a waiting peer (FIFO, skip locked to prevent races)
  SELECT * INTO v_waiting
  FROM public.anonymous_queue
  WHERE user_id <> v_curr_user
    AND topic_tag = p_topic
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_waiting.id IS NOT NULL THEN
    -- Match found! Remove matched peer from queue
    DELETE FROM public.anonymous_queue WHERE id = v_waiting.id;
    -- Also remove current user from queue (if they were somehow there)
    DELETE FROM public.anonymous_queue WHERE user_id = v_curr_user;

    -- Create active session
    INSERT INTO public.anonymous_sessions (
      participant_1, participant_2,
      alias_1, alias_2,
      avatar_1, avatar_2
    ) VALUES (
      v_waiting.user_id, v_curr_user,
      v_waiting.alias, p_alias,
      v_waiting.avatar, p_avatar
    ) RETURNING id INTO v_session_id;

    RETURN jsonb_build_object(
      'status', 'matched',
      'session_id', v_session_id,
      'is_p1', false,
      'my_alias', p_alias,
      'my_avatar', p_avatar,
      'peer_alias', v_waiting.alias,
      'peer_avatar', v_waiting.avatar
    );
  ELSE
    -- No match yet — join the queue
    INSERT INTO public.anonymous_queue (user_id, alias, avatar, topic_tag)
    VALUES (v_curr_user, p_alias, p_avatar, p_topic)
    ON CONFLICT (user_id)
    DO UPDATE SET alias = p_alias, avatar = p_avatar, topic_tag = p_topic, created_at = now();

    RETURN jsonb_build_object('status', 'waiting');
  END IF;
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 5. REVEAL IDENTITY RPC
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.reveal_anonymous_identity(p_session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session record;
  v_curr_user uuid := auth.uid();
  v_conv_id uuid;
BEGIN
  SELECT * INTO v_session
  FROM public.anonymous_sessions
  WHERE id = p_session_id
    AND status = 'active'
    AND (participant_1 = v_curr_user OR participant_2 = v_curr_user);

  IF v_session.id IS NULL THEN
    RETURN jsonb_build_object('status', 'error', 'message', 'Session not found or already ended');
  END IF;

  -- Set the reveal flag for the current user
  IF v_session.participant_1 = v_curr_user THEN
    UPDATE public.anonymous_sessions SET reveal_p1 = true WHERE id = p_session_id;
    -- Refresh
    SELECT * INTO v_session FROM public.anonymous_sessions WHERE id = p_session_id;
  ELSE
    UPDATE public.anonymous_sessions SET reveal_p2 = true WHERE id = p_session_id;
    SELECT * INTO v_session FROM public.anonymous_sessions WHERE id = p_session_id;
  END IF;

  -- Check if both have revealed
  IF v_session.reveal_p1 AND v_session.reveal_p2 THEN
    -- Create a real DM conversation between the two students
    SELECT public.get_or_create_conversation(v_session.participant_1, v_session.participant_2)
    INTO v_conv_id;

    -- Update session status
    UPDATE public.anonymous_sessions
    SET status = 'revealed',
        dm_conversation_id = v_conv_id,
        ended_at = now()
    WHERE id = p_session_id;

    RETURN jsonb_build_object(
      'status', 'both_revealed',
      'conversation_id', v_conv_id,
      'peer_id', CASE
        WHEN v_session.participant_1 = v_curr_user THEN v_session.participant_2
        ELSE v_session.participant_1
      END
    );
  END IF;

  RETURN jsonb_build_object('status', 'waiting_for_peer');
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 6. LEAVE SESSION RPC
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.leave_anonymous_session(p_session_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_curr_user uuid := auth.uid();
BEGIN
  UPDATE public.anonymous_sessions
  SET status = 'ended', ended_at = now()
  WHERE id = p_session_id
    AND status = 'active'
    AND (participant_1 = v_curr_user OR participant_2 = v_curr_user);

  -- Also remove from queue if they were somehow still there
  DELETE FROM public.anonymous_queue WHERE user_id = v_curr_user;

  RETURN jsonb_build_object('status', 'left');
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 7. CANCEL QUEUE RPC
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.cancel_anonymous_queue()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.anonymous_queue WHERE user_id = auth.uid();
  RETURN jsonb_build_object('status', 'cancelled');
END;
$$;

-- ═══════════════════════════════════════════════════════════════
-- 8. REALTIME PUBLICATION
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.anonymous_sessions REPLICA IDENTITY FULL;
ALTER TABLE public.anonymous_messages REPLICA IDENTITY FULL;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.anonymous_sessions;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.anonymous_messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- 9. GRANTS
-- ═══════════════════════════════════════════════════════════════

GRANT EXECUTE ON FUNCTION public.find_or_join_anonymous_match(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reveal_anonymous_identity(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.leave_anonymous_session(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_anonymous_queue() TO authenticated;
