import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMyProfile, type Profile } from "./useProfile";

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
  peer?: Profile | null;
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
  member_count?: number;
}

export interface ChannelMessage {
  id: string;
  channel_id: string;
  sender_id: string;
  content: string;
  reactions: Record<string, string[]>;
  created_at: string;
  sender?: Profile | null;
}

// ──────────────────────────────────────────────────────────────
// 1. Direct Messages Hooks
// ──────────────────────────────────────────────────────────────

export function useConversations() {
  const { user } = useMyProfile();

  return useQuery({
    queryKey: ["conversations", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("conversations" as any)
        .select(`
          *,
          participant_1_profile:profiles!conversations_participant_1_fkey(*),
          participant_2_profile:profiles!conversations_participant_2_fkey(*)
        `)
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order("last_message_at", { ascending: false });

      if (error) {
        // Fallback for local development if table is not yet run in remote
        console.warn("Conversations table query:", error.message);
        return [];
      }

      return (data || []).map((row: any) => {
        const peer =
          row.participant_1 === user.id
            ? row.participant_2_profile
            : row.participant_1_profile;
        return {
          ...row,
          peer,
        } as Conversation;
      });
    },
  });
}

export function useDirectMessages(conversationId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`direct_messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          queryClient.setQueryData<DirectMessage[]>(
            ["direct_messages", conversationId],
            (old) => (old ? [...old, payload.new as DirectMessage] : [payload.new as DirectMessage])
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  return useQuery({
    queryKey: ["direct_messages", conversationId],
    enabled: !!conversationId,
    queryFn: async () => {
      if (!conversationId) return [];

      const { data, error } = await supabase
        .from("direct_messages" as any)
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) {
        console.warn("Direct messages query:", error.message);
        return [];
      }

      return (data || []) as DirectMessage[];
    },
  });
}

export function useSendDirectMessage() {
  const queryClient = useQueryClient();
  const { user } = useMyProfile();

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
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data as DirectMessage;
    },
    onSuccess: (newMsg) => {
      queryClient.setQueryData<DirectMessage[]>(
        ["direct_messages", newMsg.conversation_id],
        (old) => (old ? [...old, newMsg] : [newMsg])
      );
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

// ──────────────────────────────────────────────────────────────
// 2. Campus Group Channels Hooks
// ──────────────────────────────────────────────────────────────

export function useChannels() {
  return useQuery({
    queryKey: ["channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("channels" as any)
        .select("*, members:channel_members(count)")
        .order("category", { ascending: true });

      if (error) {
        console.warn("Channels query:", error.message);
        return [];
      }

      return (data || []).map((c: any) => ({
        ...c,
        member_count: c.members?.[0]?.count ?? 0,
      })) as Channel[];
    },
  });
}

export function useChannelMessages(channelId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!channelId) return;

    const sub = supabase
      .channel(`channel_messages:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "channel_messages",
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          // Fetch sender profile for the new message
          const { data: sender } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", (payload.new as any).sender_id)
            .maybeSingle();

          const messageWithSender: ChannelMessage = {
            ...(payload.new as any),
            sender: sender as Profile | null,
          };

          queryClient.setQueryData<ChannelMessage[]>(
            ["channel_messages", channelId],
            (old) => (old ? [...old, messageWithSender] : [messageWithSender])
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, [channelId, queryClient]);

  return useQuery({
    queryKey: ["channel_messages", channelId],
    enabled: !!channelId,
    queryFn: async () => {
      if (!channelId) return [];

      const { data, error } = await supabase
        .from("channel_messages" as any)
        .select(`
          *,
          sender:profiles!channel_messages_sender_id_fkey(*)
        `)
        .eq("channel_id", channelId)
        .order("created_at", { ascending: true });

      if (error) {
        console.warn("Channel messages query:", error.message);
        return [];
      }

      return (data || []) as ChannelMessage[];
    },
  });
}

export function useSendChannelMessage() {
  const queryClient = useQueryClient();
  const { user } = useMyProfile();

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
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ChannelMessage;
    },
    onSuccess: (newMsg) => {
      queryClient.invalidateQueries({
        queryKey: ["channel_messages", newMsg.channel_id],
      });
    },
  });
}
