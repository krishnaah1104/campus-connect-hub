import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "./useProfile";

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────

export interface AnonymousSession {
  id: string;
  participant_1: string;
  participant_2: string;
  alias_1: string;
  alias_2: string;
  avatar_1: string;
  avatar_2: string;
  status: "active" | "ended" | "revealed";
  reveal_p1: boolean;
  reveal_p2: boolean;
  reported: boolean;
  dm_conversation_id: string | null;
  created_at: string;
  ended_at: string | null;
  // Computed helpers for the current user
  is_p1?: boolean;
  my_alias?: string;
  my_avatar?: string;
  peer_alias?: string;
  peer_avatar?: string;
  i_revealed?: boolean;
  peer_revealed?: boolean;
}

export interface AnonymousMessage {
  id: string;
  session_id: string;
  sender_alias: string;
  is_p1: boolean;
  content: string;
  created_at: string;
}

// ──────────────────────────────────────────────────────────────
// 1. Anonymous Lobby Presence (Live Online Students Counter)
// ──────────────────────────────────────────────────────────────

export function useAnonymousLobby() {
  const { data: user } = useSession();
  const uid = user?.id;
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!uid) return;

    const lobbyChannel = supabase.channel("anonymous_lobby", {
      config: { presence: { key: uid } },
    });

    lobbyChannel
      .on("presence", { event: "sync" }, () => {
        const state = lobbyChannel.presenceState();
        const count = Object.keys(state).length;
        setOnlineCount(Math.max(1, count));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
          await lobbyChannel.track({
            user_id: uid,
            online_at: new Date().toISOString(),
          });
        } else {
          setIsConnected(false);
        }
      });

    return () => {
      supabase.removeChannel(lobbyChannel);
    };
  }, [uid]);

  return { onlineCount, isConnected };
}

// ──────────────────────────────────────────────────────────────
// 2. Find or Join Matchmaking
// ──────────────────────────────────────────────────────────────

export function useFindMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      alias,
      avatar,
      topic = "general",
    }: {
      alias: string;
      avatar: string;
      topic?: string;
    }) => {
      const { data, error } = await supabase.rpc(
        "find_or_join_anonymous_match" as any,
        {
          p_alias: alias,
          p_avatar: avatar,
          p_topic: topic,
        }
      );

      if (error) throw error;
      return data as {
        status: "matched" | "waiting" | "already_matched" | "error";
        session_id?: string;
        is_p1?: boolean;
        my_alias?: string;
        peer_alias?: string;
        peer_avatar?: string;
      };
    },
    onSuccess: (res) => {
      if (res.status === "matched" || res.status === "already_matched") {
        queryClient.invalidateQueries({ queryKey: ["active_anonymous_session"] });
      }
    },
  });
}

// ──────────────────────────────────────────────────────────────
// 3. Cancel Queue
// ──────────────────────────────────────────────────────────────

export function useCancelQueue() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc(
        "cancel_anonymous_queue" as any
      );
      if (error) throw error;
      return data;
    },
  });
}

// ──────────────────────────────────────────────────────────────
// 4. Active Anonymous Session (with Realtime Subscription)
// ──────────────────────────────────────────────────────────────

export function useActiveAnonymousSession() {
  const { data: user } = useSession();
  const uid = user?.id;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["active_anonymous_session", uid],
    enabled: !!uid,
    refetchOnWindowFocus: true,
    queryFn: async (): Promise<AnonymousSession | null> => {
      if (!uid) return null;

      const { data, error } = await supabase
        .from("anonymous_sessions" as any)
        .select("*")
        .eq("status", "active")
        .or(`participant_1.eq.${uid},participant_2.eq.${uid}`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn("[useActiveAnonymousSession] error:", error.message);
        return null;
      }

      if (!data) return null;

      const raw = data as any;
      const is_p1 = raw.participant_1 === uid;
      return {
        ...raw,
        is_p1,
        my_alias: is_p1 ? raw.alias_1 : raw.alias_2,
        my_avatar: is_p1 ? raw.avatar_1 : raw.avatar_2,
        peer_alias: is_p1 ? raw.alias_2 : raw.alias_1,
        peer_avatar: is_p1 ? raw.avatar_2 : raw.avatar_1,
        i_revealed: is_p1 ? raw.reveal_p1 : raw.reveal_p2,
        peer_revealed: is_p1 ? raw.reveal_p2 : raw.reveal_p1,
      };
    },
  });

  const activeSessionId = query.data?.id;

  // Realtime listener for active session state changes (status change, reveal flags)
  useEffect(() => {
    if (!activeSessionId) return;

    const channel = supabase
      .channel(`anon_sess_state:${activeSessionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "anonymous_sessions",
          filter: `id=eq.${activeSessionId}`,
        },
        (payload) => {
          const updated = payload.new as any;
          if (uid) {
            const is_p1 = updated.participant_1 === uid;
            const enriched: AnonymousSession = {
              ...updated,
              is_p1,
              my_alias: is_p1 ? updated.alias_1 : updated.alias_2,
              my_avatar: is_p1 ? updated.avatar_1 : updated.avatar_2,
              peer_alias: is_p1 ? updated.alias_2 : updated.alias_1,
              peer_avatar: is_p1 ? updated.avatar_2 : updated.avatar_1,
              i_revealed: is_p1 ? updated.reveal_p1 : updated.reveal_p2,
              peer_revealed: is_p1 ? updated.reveal_p2 : updated.reveal_p1,
            };
            queryClient.setQueryData(
              ["active_anonymous_session", uid],
              enriched
            );

            // If session was revealed or ended, invalidate past sessions and conversations
            if (updated.status !== "active") {
              queryClient.invalidateQueries({ queryKey: ["anonymous_past_sessions"] });
              queryClient.invalidateQueries({ queryKey: ["conversations"] });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeSessionId, uid, queryClient]);

  return query;
}

// ──────────────────────────────────────────────────────────────
// 5. Past Anonymous Sessions History
// ──────────────────────────────────────────────────────────────

export function useAnonymousPastSessions() {
  const { data: user } = useSession();
  const uid = user?.id;

  return useQuery({
    queryKey: ["anonymous_past_sessions", uid],
    enabled: !!uid,
    queryFn: async (): Promise<AnonymousSession[]> => {
      if (!uid) return [];

      const { data, error } = await supabase
        .from("anonymous_sessions" as any)
        .select("*")
        .or(`participant_1.eq.${uid},participant_2.eq.${uid}`)
        .in("status", ["ended", "revealed"])
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        console.warn("[useAnonymousPastSessions] error:", error.message);
        return [];
      }

      return (data ?? []).map((raw: any) => {
        const is_p1 = raw.participant_1 === uid;
        return {
          ...raw,
          is_p1,
          my_alias: is_p1 ? raw.alias_1 : raw.alias_2,
          my_avatar: is_p1 ? raw.avatar_1 : raw.avatar_2,
          peer_alias: is_p1 ? raw.alias_2 : raw.alias_1,
          peer_avatar: is_p1 ? raw.avatar_2 : raw.avatar_1,
          i_revealed: is_p1 ? raw.reveal_p1 : raw.reveal_p2,
          peer_revealed: is_p1 ? raw.reveal_p2 : raw.reveal_p1,
        };
      });
    },
  });
}

// ──────────────────────────────────────────────────────────────
// 6. Anonymous Messages (Query & Realtime)
// ──────────────────────────────────────────────────────────────

export function useAnonymousMessages(sessionId: string | null) {
  const queryClient = useQueryClient();
  const subRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    if (subRef.current) {
      supabase.removeChannel(subRef.current);
      subRef.current = null;
    }

    const channel = supabase
      .channel(`anon_msgs:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "anonymous_messages",
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const incoming = payload.new as AnonymousMessage;
          queryClient.setQueryData<AnonymousMessage[]>(
            ["anonymous_messages", sessionId],
            (old) => {
              if (!old) return [incoming];
              if (old.some((m) => m.id === incoming.id)) return old;
              return [...old, incoming];
            }
          );
        }
      )
      .subscribe();

    subRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      subRef.current = null;
    };
  }, [sessionId, queryClient]);

  return useQuery({
    queryKey: ["anonymous_messages", sessionId],
    enabled: !!sessionId,
    queryFn: async (): Promise<AnonymousMessage[]> => {
      if (!sessionId) return [];

      const { data, error } = await supabase
        .from("anonymous_messages" as any)
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) {
        console.warn("[useAnonymousMessages] error:", error.message);
        return [];
      }

      return (data ?? []) as AnonymousMessage[];
    },
  });
}

// ──────────────────────────────────────────────────────────────
// 7. Send Anonymous Message (with Optimistic Update)
// ──────────────────────────────────────────────────────────────

export function useSendAnonymousMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      senderAlias,
      isP1,
      content,
    }: {
      sessionId: string;
      senderAlias: string;
      isP1: boolean;
      content: string;
    }) => {
      const { data, error } = await supabase
        .from("anonymous_messages" as any)
        .insert({
          session_id: sessionId,
          sender_alias: senderAlias,
          is_p1: isP1,
          content: content.trim(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as AnonymousMessage;
    },
    onMutate: async ({ sessionId, senderAlias, isP1, content }) => {
      await queryClient.cancelQueries({ queryKey: ["anonymous_messages", sessionId] });

      const optimistic: AnonymousMessage = {
        id: `optimistic-${Date.now()}`,
        session_id: sessionId,
        sender_alias: senderAlias,
        is_p1: isP1,
        content: content.trim(),
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData<AnonymousMessage[]>(
        ["anonymous_messages", sessionId],
        (old) => (old ? [...old, optimistic] : [optimistic])
      );

      return { optimistic };
    },
    onSuccess: (serverMsg, _vars, context) => {
      if (context?.optimistic) {
        queryClient.setQueryData<AnonymousMessage[]>(
          ["anonymous_messages", serverMsg.session_id],
          (old) =>
            (old ?? []).map((m) =>
              m.id === context.optimistic.id ? serverMsg : m
            )
        );
      }
    },
  });
}

// ──────────────────────────────────────────────────────────────
// 8. Reveal Identity
// ──────────────────────────────────────────────────────────────

export function useRevealIdentity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase.rpc(
        "reveal_anonymous_identity" as any,
        {
          p_session_id: sessionId,
        }
      );

      if (error) throw error;
      return data as {
        status: "waiting_for_peer" | "both_revealed" | "error";
        conversation_id?: string;
        peer_id?: string;
        message?: string;
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["active_anonymous_session"] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

// ──────────────────────────────────────────────────────────────
// 9. Leave / Skip Session
// ──────────────────────────────────────────────────────────────

export function useLeaveSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase.rpc(
        "leave_anonymous_session" as any,
        {
          p_session_id: sessionId,
        }
      );

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.setQueryData(["active_anonymous_session"], null);
      queryClient.invalidateQueries({ queryKey: ["active_anonymous_session"] });
      queryClient.invalidateQueries({ queryKey: ["anonymous_past_sessions"] });
    },
  });
}

// ──────────────────────────────────────────────────────────────
// 10. Report Session
// ──────────────────────────────────────────────────────────────

export function useReportSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from("anonymous_sessions" as any)
        .update({ reported: true, status: "ended", ended_at: new Date().toISOString() })
        .eq("id", sessionId);

      if (error) throw error;
      return sessionId;
    },
    onSuccess: () => {
      toast.success("Session reported and ended. Thank you for keeping campus safe.");
      queryClient.setQueryData(["active_anonymous_session"], null);
      queryClient.invalidateQueries({ queryKey: ["active_anonymous_session"] });
    },
  });
}
