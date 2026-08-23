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
import { type AnonIdentity } from "@/lib/campus";

export const Route = createFileRoute("/_authenticated/anonymous")({
  head: () => ({
    meta: [
      { title: "Vibe Mode — Anonymous Campus Matching" },
      {
        name: "description",
        content:
          "Instant 1-on-1 anonymous matching with verified Scaler School of Technology peers.",
      },
      { property: "og:title", content: "Vibe Mode — Anonymous Campus Matching" },
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
  const [currentSearchIdentity, setCurrentSearchIdentity] =
    useState<AnonIdentity | null>(null);
  const [currentSearchTopic, setCurrentSearchTopic] = useState<string>("general");
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
        if (!currentSearchIdentity) return;
        try {
          const res = await findMatch.mutateAsync({
            alias: currentSearchIdentity.alias,
            avatar: currentSearchIdentity.avatar,
            topic: currentSearchTopic,
          });

          if (res.status === "matched" || res.status === "already_matched") {
            setIsSearching(false);
            await refetchActiveSession();
            toast.success("Match found! Entering Vibe room! 🎉");
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
    currentSearchIdentity,
    currentSearchTopic,
    findMatch,
    refetchActiveSession,
  ]);

  const handleStartSearch = async (identity: AnonIdentity, topic: string) => {
    setCurrentSearchIdentity(identity);
    setCurrentSearchTopic(topic);
    setIsSearching(true);

    try {
      const res = await findMatch.mutateAsync({
        alias: identity.alias,
        avatar: identity.avatar,
        topic,
      });

      if (res.status === "matched" || res.status === "already_matched") {
        setIsSearching(false);
        await refetchActiveSession();
        toast.success("Instant match found! 🎉");
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
