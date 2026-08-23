import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Profile = Tables<"profiles">;

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user ?? null;
    },
  });
}

export function useMyProfile() {
  const { data: user, isLoading: userLoading } = useSession();
  const query = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (error) {
        console.warn("[useMyProfile] fetch error:", error.message);
        return null;
      }
      return data as Profile | null;
    },
  });
  return { ...query, user, isLoading: userLoading || query.isLoading };
}

export function useDirectory() {
  return useQuery({
    queryKey: ["directory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("onboarding_complete", true)
        .order("created_at", { ascending: false });
      if (error) {
        console.warn("[useDirectory] fetch error:", error.message);
        return [];
      }
      return (data ?? []) as Profile[];
    },
  });
}
