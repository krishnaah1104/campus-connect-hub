import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession, useMyProfile, type Profile } from "./useProfile";

// ──────────────────────────────────────────────────────────────
// Shared Types
// ──────────────────────────────────────────────────────────────

export interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_text: string | null;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  /** The other person in the conversation (resolved from profiles join) */
  peer: Profile | null;
  unread_count?: number;
}

export interface Channel {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: "batch" | "hostel" | "club" | "academics" | "general";
  category_label: string;
  pinned_notice: string | null;
  icon: string | null;
  is_auto_enrolled: boolean;
  member_count: number;
}

export interface ChannelMessage {
  id: string;
  channel_id: string;
  sender_id: string;
  content: string;
  reactions: Record<string, number>;
  created_at: string;
  sender: Profile | null;
}

// ──────────────────────────────────────────────────────────────
// 1. Conversations (DM thread list with global realtime listener)
// ──────────────────────────────────────────────────────────────

/**
 * Fetches all DM threads the current user participates in,
 * resolving the peer profile for each conversation and listening
 * in real-time to any incoming direct messages.
 */
export function useConversations() {
  const { data: user } = useSession();
  const uid = user?.id;
  const queryClient = useQueryClient();

  // Global realtime listener for incoming messages and conversation updates
  useEffect(() => {
    if (!uid) return;

    const channelName = `global_dm_realtime_${uid}_${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "direct_messages",
        },
        async (payload) => {
          // Instantly refetch conversations to update unread badge and notification count
          await queryClient.refetchQueries({ queryKey: ["conversations", uid] });

          // If an incoming message was sent by someone else, notify with a toast alert
          if (payload.eventType === "INSERT") {
            const newMsg = payload.new as DirectMessage;
            if (newMsg && newMsg.sender_id !== uid) {
              const { data: sender } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", newMsg.sender_id)
                .maybeSingle();

              const senderName = sender?.full_name || "A classmate";
              toast.info(`Message from ${senderName}`, {
                description:
                  newMsg.content.length > 50
                    ? `${newMsg.content.slice(0, 50)}…`
                    : newMsg.content,
              });
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "conversations",
        },
        async () => {
          await queryClient.refetchQueries({ queryKey: ["conversations", uid] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [uid, queryClient]);

  return useQuery({
    queryKey: ["conversations", uid],
    enabled: !!uid,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      if (!uid) return [];

      // Fetch conversations + both participant profiles in a single query
      const { data, error } = await supabase
        .from("conversations" as any)
        .select("*")
        .or(`participant_1.eq.${uid},participant_2.eq.${uid}`)
        .order("last_message_at", { ascending: false });

      if (error) {
        console.warn("[useConversations] query failed:", error.message);
        return [];
      }

      if (!data || data.length === 0) return [];

      // Gather all peer IDs and batch-fetch their profiles
      const peerIds = (data as any[]).map((row: any) =>
        row.participant_1 === uid ? row.participant_2 : row.participant_1
      );

      const { data: peerProfiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", peerIds);

      const profileMap = new Map<string, Profile>();
      for (const p of (peerProfiles ?? []) as Profile[]) {
        profileMap.set(p.id, p);
      }

      // Count unread messages per conversation
      const { data: unreadData } = await supabase
        .from("direct_messages" as any)
        .select("conversation_id")
        .in("conversation_id", (data as any[]).map((d: any) => d.id))
        .neq("sender_id", uid)
        .is("read_at", null);

      const unreadCounts = new Map<string, number>();
      for (const row of (unreadData ?? []) as any[]) {
        unreadCounts.set(row.conversation_id, (unreadCounts.get(row.conversation_id) ?? 0) + 1);
      }

      return (data as any[]).map((row: any): Conversation => {
        const peerId = row.participant_1 === uid ? row.participant_2 : row.participant_1;
        return {
          ...row,
          peer: profileMap.get(peerId) ?? null,
          unread_count: unreadCounts.get(row.id) ?? 0,
        };
      });
    },
  });
}

// ──────────────────────────────────────────────────────────────
// 2. Direct Messages (within a single conversation)
// ──────────────────────────────────────────────────────────────

/**
 * Fetches messages for a conversation and subscribes to realtime INSERTs.
 * Includes deduplication: if the optimistic message already exists, the
 * realtime payload is silently dropped.
 */
export function useDirectMessages(conversationId: string | null) {
  const queryClient = useQueryClient();
  const subRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    // Clean up any stale subscription before creating a new one
    if (subRef.current) {
      supabase.removeChannel(subRef.current);
      subRef.current = null;
    }

    const channel = supabase
      .channel(`dm:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const incoming = payload.new as DirectMessage;
          queryClient.setQueryData<DirectMessage[]>(
            ["direct_messages", conversationId],
            (old) => {
              if (!old) return [incoming];
              // Dedup: skip if this message ID already exists (from optimistic update)
              if (old.some((m) => m.id === incoming.id)) return old;
              return [...old, incoming];
            }
          );
          // Also refresh the conversation list to update last_message
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
      )
      .subscribe();

    subRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      subRef.current = null;
    };
  }, [conversationId, queryClient]);

  return useQuery({
    queryKey: ["direct_messages", conversationId],
    enabled: !!conversationId,
    queryFn: async (): Promise<DirectMessage[]> => {
      if (!conversationId) return [];

      const { data, error } = await supabase
        .from("direct_messages" as any)
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) {
        console.warn("[useDirectMessages] query failed:", error.message);
        return [];
      }

      return (data ?? []) as DirectMessage[];
    },
  });
}

// ──────────────────────────────────────────────────────────────
// 3. Send Direct Message (with optimistic update)
// ──────────────────────────────────────────────────────────────

export function useSendDirectMessage() {
  const queryClient = useQueryClient();
  const { data: user } = useSession();

  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
    }: {
      conversationId: string;
      content: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("direct_messages" as any)
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: content.trim(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as DirectMessage;
    },
    // Optimistic update: append message immediately before server confirms
    onMutate: async ({ conversationId, content }) => {
      if (!user) return;
      await queryClient.cancelQueries({ queryKey: ["direct_messages", conversationId] });

      const optimisticMsg: DirectMessage = {
        id: `optimistic-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
        read_at: null,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData<DirectMessage[]>(
        ["direct_messages", conversationId],
        (old) => (old ? [...old, optimisticMsg] : [optimisticMsg])
      );

      return { optimisticMsg };
    },
    onSuccess: (serverMsg, _vars, context) => {
      // Replace the optimistic message with the real server message
      if (context?.optimisticMsg) {
        queryClient.setQueryData<DirectMessage[]>(
          ["direct_messages", serverMsg.conversation_id],
          (old) =>
            (old ?? []).map((m) =>
              m.id === context.optimisticMsg.id ? serverMsg : m
            )
        );
      }
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (_err, vars, context) => {
      // Roll back optimistic message on failure
      if (context?.optimisticMsg) {
        queryClient.setQueryData<DirectMessage[]>(
          ["direct_messages", vars.conversationId],
          (old) =>
            (old ?? []).filter((m) => m.id !== context.optimisticMsg.id)
        );
      }
    },
  });
}

// ──────────────────────────────────────────────────────────────
// 4. Start / Find Conversation (uses DB RPC)
// ──────────────────────────────────────────────────────────────

/**
 * Calls the get_or_create_conversation RPC to find an existing
 * conversation between two users or create a new one atomically.
 */
export function useStartConversation() {
  const queryClient = useQueryClient();
  const { data: user } = useSession();

  return useMutation({
    mutationFn: async (peerId: string): Promise<string> => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.rpc(
        "get_or_create_conversation" as any,
        { user_a: user.id, user_b: peerId }
      );

      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

// ──────────────────────────────────────────────────────────────
// 5. Mark Messages Read
// ──────────────────────────────────────────────────────────────

export function useMarkMessagesRead() {
  const queryClient = useQueryClient();
  const { data: user } = useSession();

  return useCallback(
    async (conversationId: string) => {
      if (!user) return;

      await supabase
        .from("direct_messages" as any)
        .update({ read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .neq("sender_id", user.id)
        .is("read_at", null);

      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    [user, queryClient]
  );
}

// ══════════════════════════════════════════════════════════════
//  GROUP CHANNELS
// ══════════════════════════════════════════════════════════════

// ──────────────────────────────────────────────────────────────
// 6. Channel List
// ──────────────────────────────────────────────────────────────

export function useChannels() {
  return useQuery({
    queryKey: ["channels"],
    staleTime: 1000 * 60 * 5, // channels rarely change
    queryFn: async (): Promise<Channel[]> => {
      const { data, error } = await supabase
        .from("channels" as any)
        .select("*, members:channel_members(count)")
        .order("category", { ascending: true });

      if (error) {
        console.warn("[useChannels] query failed:", error.message);
        return [];
      }

      return (data ?? []).map((c: any): Channel => ({
        ...c,
        member_count: c.members?.[0]?.count ?? 0,
      }));
    },
  });
}

// ──────────────────────────────────────────────────────────────
// 7. Channel Messages (with realtime subscription)
// ──────────────────────────────────────────────────────────────

export function useChannelMessages(channelId: string | null) {
  const queryClient = useQueryClient();
  const subRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!channelId) return;

    if (subRef.current) {
      supabase.removeChannel(subRef.current);
      subRef.current = null;
    }

    const channel = supabase
      .channel(`ch:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "channel_messages",
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          const incoming = payload.new as any;

          // Fetch sender profile for the new message
          const { data: sender } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", incoming.sender_id)
            .maybeSingle();

          const msg: ChannelMessage = {
            ...incoming,
            sender: (sender as Profile) ?? null,
          };

          queryClient.setQueryData<ChannelMessage[]>(
            ["channel_messages", channelId],
            (old) => {
              if (!old) return [msg];
              // Dedup
              if (old.some((m) => m.id === msg.id)) return old;
              return [...old, msg];
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
  }, [channelId, queryClient]);

  return useQuery({
    queryKey: ["channel_messages", channelId],
    enabled: !!channelId,
    queryFn: async (): Promise<ChannelMessage[]> => {
      if (!channelId) return [];

      const { data, error } = await supabase
        .from("channel_messages" as any)
        .select("*")
        .eq("channel_id", channelId)
        .order("created_at", { ascending: true });

      if (error) {
        console.warn("[useChannelMessages] query failed:", error.message);
        return [];
      }

      if (!data || data.length === 0) return [];

      // Batch-fetch sender profiles
      const senderIds = [...new Set((data as any[]).map((m: any) => m.sender_id))];
      const { data: senderProfiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", senderIds);

      const profileMap = new Map<string, Profile>();
      for (const p of (senderProfiles ?? []) as Profile[]) {
        profileMap.set(p.id, p);
      }

      return (data as any[]).map((m: any): ChannelMessage => ({
        ...m,
        sender: profileMap.get(m.sender_id) ?? null,
      }));
    },
  });
}

// ──────────────────────────────────────────────────────────────
// 8. Send Channel Message
// ──────────────────────────────────────────────────────────────

export function useSendChannelMessage() {
  const queryClient = useQueryClient();
  const { data: user } = useSession();
  const { data: myProfile } = useMyProfile();

  return useMutation({
    mutationFn: async ({
      channelId,
      content,
    }: {
      channelId: string;
      content: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("channel_messages" as any)
        .insert({
          channel_id: channelId,
          sender_id: user.id,
          content: content.trim(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as any;
    },
    // Optimistic insert
    onMutate: async ({ channelId, content }) => {
      if (!user) return;
      await queryClient.cancelQueries({ queryKey: ["channel_messages", channelId] });

      const optimistic: ChannelMessage = {
        id: `optimistic-${Date.now()}`,
        channel_id: channelId,
        sender_id: user.id,
        content: content.trim(),
        reactions: {},
        created_at: new Date().toISOString(),
        sender: myProfile ?? null,
      };

      queryClient.setQueryData<ChannelMessage[]>(
        ["channel_messages", channelId],
        (old) => (old ? [...old, optimistic] : [optimistic])
      );

      return { optimistic };
    },
    onSuccess: (serverMsg, _vars, context) => {
      if (context?.optimistic) {
        queryClient.setQueryData<ChannelMessage[]>(
          ["channel_messages", serverMsg.channel_id],
          (old) =>
            (old ?? []).map((m) =>
              m.id === context.optimistic.id
                ? { ...serverMsg, sender: context.optimistic.sender }
                : m
            )
        );
      }
    },
    onError: (_err, vars, context) => {
      if (context?.optimistic) {
        queryClient.setQueryData<ChannelMessage[]>(
          ["channel_messages", vars.channelId],
          (old) =>
            (old ?? []).filter((m) => m.id !== context.optimistic.id)
        );
      }
    },
  });
}

// ──────────────────────────────────────────────────────────────
// 9. Toggle Reaction
// ──────────────────────────────────────────────────────────────

export function useToggleReaction() {
  const queryClient = useQueryClient();
  const { data: user } = useSession();

  return useMutation({
    mutationFn: async ({
      messageId,
      channelId,
      emoji,
      currentReactions,
    }: {
      messageId: string;
      channelId: string;
      emoji: string;
      currentReactions: Record<string, number>;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const updated = { ...currentReactions };
      updated[emoji] = (updated[emoji] ?? 0) + 1;

      const { error } = await supabase
        .from("channel_messages" as any)
        .update({ reactions: updated })
        .eq("id", messageId);

      if (error) throw error;

      return { messageId, channelId, reactions: updated };
    },
    onSuccess: ({ messageId, channelId, reactions }) => {
      queryClient.setQueryData<ChannelMessage[]>(
        ["channel_messages", channelId],
        (old) =>
          (old ?? []).map((m) =>
            m.id === messageId ? { ...m, reactions } : m
          )
      );
    },
  });
}

// ──────────────────────────────────────────────────────────────
// 10. Channel Management (Admin Only)
// ──────────────────────────────────────────────────────────────

export interface CreateChannelInput {
  name: string;
  slug?: string;
  description?: string;
  category: "batch" | "hostel" | "club" | "academics" | "general";
  category_label?: string;
  pinned_notice?: string;
  icon?: string;
  is_auto_enrolled?: boolean;
  batch_filter?: string | null;
  hostel_filter?: string | null;
  club_filter?: string | null;
}

export function useCreateChannel() {
  const queryClient = useQueryClient();
  const { data: user } = useSession();

  return useMutation({
    mutationFn: async (input: CreateChannelInput): Promise<Channel> => {
      if (!user) throw new Error("Not authenticated");

      const cleanSlug = (
        input.slug?.trim() ||
        input.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );

      const id = `ch-${cleanSlug || Date.now()}`;

      const categoryLabels: Record<string, string> = {
        batch: "Batch",
        hostel: "Hostel",
        club: "Club",
        academics: "Academics",
        general: "General",
      };

      const category_label =
        input.category_label || categoryLabels[input.category] || "General";

      const { data, error } = await supabase
        .from("channels" as any)
        .insert({
          id,
          name: input.name.trim(),
          slug: cleanSlug,
          description: input.description?.trim() || null,
          category: input.category,
          category_label,
          pinned_notice: input.pinned_notice?.trim() || null,
          icon: input.icon?.trim() || "💬",
          is_auto_enrolled: input.is_auto_enrolled ?? true,
          batch_filter: input.batch_filter ?? null,
          hostel_filter: input.hostel_filter ?? null,
          club_filter: input.club_filter ?? null,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        member_count: 1,
      } as Channel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    },
  });
}

export function useDeleteChannel() {
  const queryClient = useQueryClient();
  const { data: user } = useSession();

  return useMutation({
    mutationFn: async (channelId: string) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("channels" as any)
        .delete()
        .eq("id", channelId);

      if (error) throw error;
      return channelId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    },
  });
}

