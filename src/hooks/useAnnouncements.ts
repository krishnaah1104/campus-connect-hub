import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession, type Profile } from "./useProfile";

export interface CampusAnnouncement {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  category: "announcement" | "hackathon" | "club_event" | "workshop" | "sports" | "general";
  event_date: string | null;
  link_url: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  creator?: Profile | null;
}

export function useAnnouncements() {
  const queryClient = useQueryClient();
  const subRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    const channelName = `announcements_realtime_${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "campus_announcements",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["campus_announcements"] });
        }
      )
      .subscribe();

    subRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      subRef.current = null;
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["campus_announcements"],
    queryFn: async (): Promise<CampusAnnouncement[]> => {
      const { data, error } = await supabase
        .from("campus_announcements" as any)
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("[useAnnouncements] query error:", error.message);
        return [];
      }

      if (!data || data.length === 0) return [];

      // Fetch creator profiles
      const creatorIds = Array.from(new Set((data as any[]).map((d) => d.creator_id)));
      const { data: creators } = await supabase
        .from("profiles")
        .select("*")
        .in("id", creatorIds);

      const creatorMap = new Map<string, Profile>();
      for (const p of (creators ?? []) as Profile[]) {
        creatorMap.set(p.id, p);
      }

      return (data as any[]).map((row: any) => ({
        ...row,
        creator: creatorMap.get(row.creator_id) ?? null,
      }));
    },
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  const { data: user } = useSession();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      category = "announcement",
      event_date,
      link_url,
      is_pinned = false,
    }: {
      title: string;
      description: string;
      category?: string;
      event_date?: string | null;
      link_url?: string | null;
      is_pinned?: boolean;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("campus_announcements" as any)
        .insert({
          creator_id: user.id,
          title: title.trim(),
          description: description.trim(),
          category,
          event_date: event_date?.trim() || null,
          link_url: link_url?.trim() || null,
          is_pinned,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campus_announcements"] });
      toast.success("Announcement posted to Campus Activities! 📢");
    },
    onError: (err: any) => {
      toast.error("Failed to post announcement. " + (err?.message ?? ""));
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("campus_announcements" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campus_announcements"] });
      toast.success("Announcement deleted.");
    },
    onError: (err: any) => {
      toast.error("Failed to delete announcement. " + (err?.message ?? ""));
    },
  });
}
