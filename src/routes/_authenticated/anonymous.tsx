import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { AnonymousLobby } from "@/components/anonymous/AnonymousLobby";
import { AnonymousChatPane } from "@/components/anonymous/AnonymousChatPane";
import {
  useActiveAnonymousSession,
  useFindMatch,
  useCancelQueue,
  type AnonymousSession,
} from "@/hooks/useAnonymous";

export const Route = createFileRoute("/_authenticated/anonymous")({
  head: () => ({
    meta: [
      { title: "Anonymous Connect — ScaleX" },
      {
        name: "description",
        content:
          "Instant 1-on-1 anonymous matching with verified Scaler School of Technology peers.",
      },
      { property: "og:title", content: "Anonymous Connect — ScaleX" },
      {
        property: "og:description",
        content:
          "Instant 1-on-1 anonymous matching with verified Scaler School of Technology peers.",
      },
    ],
  }),
  component: AnonymousRoute,
});

function AnonymousRoute() {
  const { data: activeSession, refetch: refetchActiveSession } =
    useActiveAnonymousSession();
  const findMatch = useFindMatch();
  const cancelQueue = useCancelQueue();

  const [isSearching, setIsSearching] = useState(false);
  const [selectedPastSession, setSelectedPastSession] =
    useState<AnonymousSession | null>(null);

  // If an active session is detected, stop searching immediately
  useEffect(() => {
    if (activeSession && activeSession.status === "active") {
      setIsSearching(false);
    }
  }, [activeSession]);

  // Polling loop while in queue
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSearching && !activeSession) {
      timer = setInterval(async () => {
        try {
          const res = await findMatch.mutateAsync({
            alias: "Anonymous Student",
            avatar: "🎭",
            topic: "general",
          });

          if (res.status === "matched" || res.status === "already_matched") {
            setIsSearching(false);
            await refetchActiveSession();
            toast.success("Match found! Connected! 🎉");
          }
        } catch (e) {
          console.warn("[matchmaking poll error]", e);
        }
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [
    isSearching,
    activeSession,
    findMatch,
    refetchActiveSession,
  ]);

  const handleStartSearch = async () => {
    setIsSearching(true);

    try {
      const res = await findMatch.mutateAsync({
        alias: "Anonymous Student",
        avatar: "🎭",
        topic: "general",
      });

      if (res.status === "matched" || res.status === "already_matched") {
        setIsSearching(false);
        await refetchActiveSession();
        toast.success("Connected with a batchmate! 🎉");
      }
    } catch (err: any) {
      setIsSearching(false);
      toast.error("Couldn't start matching. " + (err?.message ?? ""));
    }
  };

  const handleCancelSearch = async () => {
    setIsSearching(false);
    try {
      await cancelQueue.mutateAsync();
      toast("Matching cancelled.");
    } catch (e) {
      console.warn("Cancel queue error:", e);
    }
  };

  const currentDisplaySession = activeSession || selectedPastSession;

  return (
    <AppShell>
      {currentDisplaySession ? (
        <AnonymousChatPane
          session={currentDisplaySession}
          onExit={() => {
            setSelectedPastSession(null);
            refetchActiveSession();
          }}
        />
      ) : (
        <AnonymousLobby
          isSearching={isSearching}
          onStartSearch={handleStartSearch}
          onCancelSearch={handleCancelSearch}
          onSelectPastSession={(sess) => setSelectedPastSession(sess)}
        />
      )}
    </AppShell>
  );
}
