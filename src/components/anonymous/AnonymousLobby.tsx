import { useState, useEffect } from "react";
import {
  Sparkles,
  Users,
  Shuffle,
  ShieldCheck,
  Radio,
  Clock,
  X,
  Zap,
} from "lucide-react";
import {
  ANON_TOPICS,
  getRandomAnonIdentity,
  type AnonIdentity,
} from "@/lib/campus";
import {
  useAnonymousLobby,
  useAnonymousPastSessions,
  type AnonymousSession,
} from "@/hooks/useAnonymous";
import { AnonymousSessionCard } from "./AnonymousSessionCard";

interface AnonymousLobbyProps {
  isSearching: boolean;
  onStartSearch: (identity: AnonIdentity, topic: string) => void;
  onCancelSearch: () => void;
  onSelectPastSession?: (session: AnonymousSession) => void;
}

export function AnonymousLobby({
  isSearching,
  onStartSearch,
  onCancelSearch,
  onSelectPastSession,
}: AnonymousLobbyProps) {
  const { onlineCount } = useAnonymousLobby();
  const { data: pastSessions, isLoading: isHistoryLoading } =
    useAnonymousPastSessions();

  const [selectedTopic, setSelectedTopic] = useState<string>("general");
  const [currentIdentity, setCurrentIdentity] = useState<AnonIdentity>(() =>
    getRandomAnonIdentity()
  );
  const [searchSeconds, setSearchSeconds] = useState(0);

  // Timer while searching
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSearching) {
      setSearchSeconds(0);
      interval = setInterval(() => {
        setSearchSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSearching]);

  const handleReroll = () => {
    let next = getRandomAnonIdentity();
    while (next.alias === currentIdentity.alias) {
      next = getRandomAnonIdentity();
    }
    setCurrentIdentity(next);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">
      {/* ─── Hero Section ─── */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Vibe Mode · SST Campus Matching</span>
        </div>

        <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          Meet Someone New, Anonymously.
        </h1>

        <p className="mx-auto max-w-md text-xs text-muted-foreground sm:text-sm leading-relaxed">
          1-on-1 instant matching with randomized campus pseudonyms. Zero social
          anxiety. Reveal your real profiles only if you both vibe!
        </p>

        {/* Live Presence Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
          </span>
          <span className="font-semibold text-foreground">
            {onlineCount} {onlineCount === 1 ? "student" : "students"} live on campus
          </span>
        </div>
      </div>

      {/* ─── Matching Card ─── */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/80 p-6 shadow-card backdrop-blur-xl">
        {isSearching ? (
          /* Searching State */
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-6">
            <div className="relative">
              {/* Radar pulse ripples */}
              <div className="absolute -inset-4 animate-ping rounded-full bg-primary/20" />
              <div className="absolute -inset-8 animate-pulse rounded-full bg-primary/10" />

              <span
                className="relative grid h-20 w-20 place-items-center rounded-3xl text-3xl text-primary-foreground shadow-glow"
                style={{ background: "var(--gradient-brand)" }}
              >
                {currentIdentity.avatar}
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-foreground">
                Matching as {currentIdentity.alias}…
              </h3>
              <p className="text-xs text-muted-foreground">
                Searching for an online SST student in{" "}
                <span className="font-semibold text-primary">
                  {ANON_TOPICS.find((t) => t.key === selectedTopic)?.label}
                </span>
              </p>
              <p className="text-xs font-mono text-primary font-bold">
                ⏱ {formatTimer(searchSeconds)}
              </p>
            </div>

            <button
              onClick={onCancelSearch}
              className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Cancel Search</span>
            </button>
          </div>
        ) : (
          /* Idle State: Choose Topic & Disguise */
          <div className="space-y-6">
            {/* Identity Preview & Reroll */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    Your Disguise For This Round
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl">{currentIdentity.avatar}</span>
                    <span className="text-base font-extrabold text-foreground">
                      {currentIdentity.alias}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReroll}
                  className="flex items-center gap-1 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  title="Generate a new pseudonym"
                >
                  <Shuffle className="h-3.5 w-3.5" />
                  <span>Reroll</span>
                </button>
              </div>
            </div>

            {/* Topic Filter Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Pick a Match Mood / Topic
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ANON_TOPICS.map((topic) => {
                  const active = selectedTopic === topic.key;
                  return (
                    <button
                      key={topic.key}
                      onClick={() => setSelectedTopic(topic.key)}
                      className={`flex flex-col items-start rounded-2xl border p-3 text-left transition-all ${
                        active
                          ? "border-primary bg-primary/15 shadow-sm ring-1 ring-primary/40"
                          : "border-border bg-card/60 hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="text-base mb-1">{topic.emoji}</span>
                      <span className="text-xs font-bold text-foreground">
                        {topic.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground line-clamp-1">
                        {topic.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Big Action Button */}
            <button
              onClick={() => onStartSearch(currentIdentity, selectedTopic)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-extrabold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] active:scale-[0.99]"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Zap className="h-4 w-4" />
              <span>Find a Vibe Match</span>
            </button>
          </div>
        )}
      </div>

      {/* ─── Safety & Trust Banner ─── */}
      <div className="flex items-start gap-3 rounded-2xl border border-success/20 bg-success/5 p-4 text-xs text-muted-foreground">
        <ShieldCheck className="h-5 w-5 text-success shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-foreground">
            100% SST Campus Verified Anonymity
          </p>
          <p className="text-[11px] leading-relaxed">
            Every participant is an authenticated Scaler student. Your real identity
            is protected and will <strong>never be revealed</strong> unless both of you
            mutually agree to click "Reveal Profile" during chat.
          </p>
        </div>
      </div>

      {/* ─── Past Sessions History ─── */}
      {pastSessions && pastSessions.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border/60">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>Recent Vibe Matches</span>
          </div>

          <div className="space-y-2">
            {pastSessions.map((sess) => (
              <AnonymousSessionCard
                key={sess.id}
                session={sess}
                onClick={() => onSelectPastSession?.(sess)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
