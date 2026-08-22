-- Migration: 20260823041500_create_campus_chat_and_channels.sql
-- Description: Creates 1-on-1 Direct Messaging and Campus Group Channels with RLS and Realtime for SST students.

-- 1. Direct Message Conversations Table
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

-- Ensure only one 1-on-1 conversation exists between any two students
CREATE UNIQUE INDEX idx_unique_conversation_pair 
ON public.conversations (LEAST(participant_1, participant_2), GREATEST(participant_1, participant_2));

CREATE INDEX idx_conversations_p1 ON public.conversations(participant_1);
CREATE INDEX idx_conversations_p2 ON public.conversations(participant_2);
CREATE INDEX idx_conversations_last_msg_at ON public.conversations(last_message_at DESC);

-- 2. Direct Messages Table
CREATE TABLE public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_direct_messages_conversation ON public.direct_messages(conversation_id, created_at ASC);
CREATE INDEX idx_direct_messages_sender ON public.direct_messages(sender_id);

-- 3. Group Channels Table
CREATE TABLE public.channels (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('batch', 'hostel', 'club', 'academics', 'general')),
  category_label text NOT NULL,
  pinned_notice text,
  icon text,
  is_auto_enrolled boolean NOT NULL DEFAULT true,
  batch_filter text,
  hostel_filter text,
  club_filter text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_channels_category ON public.channels(category);

-- 4. Channel Memberships Table
CREATE TABLE public.channel_members (
  channel_id text NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (channel_id, user_id)
);

CREATE INDEX idx_channel_members_user ON public.channel_members(user_id);

-- 5. Channel Messages Table
CREATE TABLE public.channel_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id text NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  reactions jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_channel_messages_channel ON public.channel_messages(channel_id, created_at ASC);
CREATE INDEX idx_channel_messages_sender ON public.channel_messages(sender_id);

-- 6. Trigger to automatically update conversation last_message
CREATE OR REPLACE FUNCTION public.handle_new_direct_message()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.conversations
  SET 
    last_message_text = NEW.content,
    last_message_at = NEW.created_at,
    updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_direct_message_created
AFTER INSERT ON public.direct_messages
FOR EACH ROW EXECUTE FUNCTION public.handle_new_direct_message();

-- 7. Trigger to auto-enroll students into batch, hostel & club channels when profile updates
CREATE OR REPLACE FUNCTION public.auto_enroll_student_in_channels()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Auto-enroll by batch
  IF NEW.batch IS NOT NULL AND NEW.batch <> '' THEN
    INSERT INTO public.channel_members (channel_id, user_id)
    SELECT id, NEW.id FROM public.channels 
    WHERE category = 'batch' AND batch_filter = NEW.batch
    ON CONFLICT DO NOTHING;
  END IF;

  -- Auto-enroll by hostel
  IF NEW.hostel IS NOT NULL AND NEW.hostel <> '' THEN
    INSERT INTO public.channel_members (channel_id, user_id)
    SELECT id, NEW.id FROM public.channels 
    WHERE category = 'hostel' AND hostel_filter = NEW.hostel
    ON CONFLICT DO NOTHING;
  END IF;

  -- Auto-enroll in general / academic spaces
  INSERT INTO public.channel_members (channel_id, user_id)
  SELECT id, NEW.id FROM public.channels 
  WHERE category IN ('academics', 'general') AND is_auto_enrolled = true
  ON CONFLICT DO NOTHING;

  -- Auto-enroll in enrolled clubs
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

-- 8. Row Level Security (RLS) Policies
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_messages ENABLE ROW LEVEL SECURITY;

-- Conversations: Only participants can view or modify their conversations
CREATE POLICY "Students can view their own conversations" ON public.conversations
  FOR SELECT TO authenticated
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Students can create conversation with another student" ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Participants can update conversation metadata" ON public.conversations
  FOR UPDATE TO authenticated
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Direct Messages: Only conversation participants can view; only sender can send
CREATE POLICY "Participants can view conversation messages" ON public.direct_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = direct_messages.conversation_id
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

CREATE POLICY "Students can insert messages as sender" ON public.direct_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = direct_messages.conversation_id
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

CREATE POLICY "Recipients can mark direct messages as read" ON public.direct_messages
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = direct_messages.conversation_id
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

-- Channels: All authenticated verified campus students can view channels
CREATE POLICY "Authenticated students can view all campus channels" ON public.channels
  FOR SELECT TO authenticated USING (true);

-- Channel Members: View memberships and manage own enrollment
CREATE POLICY "Students can view channel members" ON public.channel_members
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Students can join or leave channels for themselves" ON public.channel_members
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can leave channels" ON public.channel_members
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Channel Messages: View and post messages in channels
CREATE POLICY "Students can view channel messages" ON public.channel_messages
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Students can post messages to channels" ON public.channel_messages
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Students can update reactions on channel messages" ON public.channel_messages
  FOR UPDATE TO authenticated USING (true);

-- 9. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.direct_messages TO authenticated;
GRANT SELECT ON public.channels TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.channel_members TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.channel_messages TO authenticated;

-- 10. Enable Supabase Realtime for instant live messaging
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_messages;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END;
$$;

-- 11. Initial Seed Data: Default Campus Channels for Scaler School of Technology
INSERT INTO public.channels (id, name, slug, description, category, category_label, pinned_notice, icon, is_auto_enrolled, batch_filter, hostel_filter, club_filter)
VALUES
  -- Official Batch Channels
  ('batch-2030', '#batch-2030-official', 'batch-2030-official', 'Official academic announcements, lecture updates, and discussions for Batch of 2030.', 'batch', 'Batch 2030', 'Welcome Batch of 2030 to SST! Check your orientation schedule.', '🎓', true, '2030', NULL, NULL),
  ('batch-2029', '#batch-2029-official', 'batch-2029-official', 'Academic coordination, assignment discussions, and notices for Batch of 2029.', 'batch', 'Batch 2029', 'DSA Assignment 3 problem set published in the portal.', '🎓', true, '2029', NULL, NULL),
  ('batch-2028', '#batch-2028-official', 'batch-2028-official', 'Academic updates, project submissions, and batch announcements for Batch of 2028.', 'batch', 'Batch 2028', 'Mid-term project review submissions are due on Friday 11:59 PM.', '🎓', true, '2028', NULL, NULL),
  ('batch-2027', '#batch-2027-official', 'batch-2027-official', 'Senior batch coordination, internships, placements, and capstone announcements.', 'batch', 'Batch 2027', 'Summer internship drive registrations open this week.', '🎓', true, '2027', NULL, NULL),

  -- Hostel Lounges
  ('uw1-common', '#uniworld-1-common', 'uniworld-1-common', 'Uniworld 1 hostel activities, mess menu, study lounges, and sports meetups.', 'hostel', 'Hostel UW1', 'Table tennis tournament bracket published in the common room notice board.', '🏢', true, NULL, 'Uniworld 1', NULL),
  ('uw2-common', '#uniworld-2-common', 'uniworld-2-common', 'Uniworld 2 hostel community updates, quiet study hours, and campus transit coordination.', 'hostel', 'Hostel UW2', 'Quiet study hours active from 10 PM onwards on floor 3 lounge.', '🏢', true, NULL, 'Uniworld 2', NULL),

  -- Club Channels
  ('aiml-club', '#ai-ml-club', 'ai-ml-club', 'Machine learning research, Kaggle hackathons, LLM experiments, and weekend paper readings.', 'club', 'AI/ML Club', 'Paper reading on Mixture of Experts (MoE) this Sunday at 7 PM.', '🤖', true, NULL, NULL, 'AI/ML Club'),
  ('web-dev-club', '#web-dev-club', 'web-dev-club', 'Full-stack engineering, React, TypeScript, cloud deployments, and open source building.', 'club', 'Web Dev Club', 'PR for the campus connect directory has been merged!', '💻', true, NULL, NULL, 'Web Dev Club'),
  ('robotics-club', '#robotics', 'robotics', 'Hardware prototyping, ROS, IoT, embedded systems, and robotics competitions.', 'club', 'Robotics', 'Hardware lab component kits available for pickup in Block B.', '🦾', true, NULL, NULL, 'Robotics'),
  ('finance-club', '#finance', 'finance', 'Algorithmic trading, quantitative finance, investing, and market analysis.', 'club', 'Finance', 'Weekly stock pitch & quant model session on Wednesday 8 PM.', '📈', true, NULL, NULL, 'Finance'),
  ('open-source-club', '#open-source', 'open-source', 'GSoC, LFX mentorships, GitHub collaborations, and campus tool contributions.', 'club', 'Open Source', 'Check out our repository issues list for good first issues.', '🌐', true, NULL, NULL, 'Open Source'),

  -- Academics & Doubt Channels
  ('dsa-and-interview-prep', '#dsa-and-interview-prep', 'dsa-and-interview-prep', 'Daily LeetCode discussions, mock interviews, dynamic programming, and graph algorithms.', 'academics', 'DSA & Prep', 'Solving Tree DP & Graph BFS/DFS patterns this week.', '⚡', true, NULL, NULL, NULL),
  ('hackathon-squads', '#hackathon-squads', 'hackathon-squads', 'Find teammates, ideate project concepts, and coordinate for internal and global hackathons.', 'academics', 'Hackathons', 'Forming squads for the upcoming 24h AI Hackathon. Post your skill stack!', '🏆', true, NULL, NULL, NULL),
  ('general-campus-hub', '#general-chit-chat', 'general-chit-chat', 'Open campus lounge for all SST students. Meet batchmates, share updates, and collaborate.', 'general', 'General', 'Keep discussions respectful and supportive across all batches.', '💬', true, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;
