-- Trigger-only functions: not callable via the API
REVOKE ALL ON FUNCTION public.auto_enroll_new_channel_members() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.auto_enroll_student_in_channels() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_direct_message() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.populate_dm_recipient() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- App RPCs: signed-in students only
REVOKE ALL ON FUNCTION public.cancel_anonymous_queue() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.find_or_join_anonymous_match(text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.leave_anonymous_session(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.reveal_anonymous_identity(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_or_create_conversation(uuid, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.cancel_anonymous_queue() TO authenticated;
GRANT EXECUTE ON FUNCTION public.find_or_join_anonymous_match(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.leave_anonymous_session(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reveal_anonymous_identity(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_conversation(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;