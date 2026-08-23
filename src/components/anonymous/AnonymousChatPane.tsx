import { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Send,
  Sparkles,
  Flag,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkle,
} from "lucide-react";
import { toast } from "sonner";
import {
  ANON_ICEBREAKERS,
} from "@/lib/campus";
import {
  useAnonymousMessages,
  useSendAnonymousMessage,
  useRevealIdentity,
  useLeaveSession,
  useReportSession,
  type AnonymousSession,
} from "@/hooks/useAnonymous";
import { formatRelativeTime } from "@/components/chat/ChatListItem";

interface AnonymousChatPaneProps {
  session: AnonymousSession;
  onExit: () => void;
}

export function AnonymousChatPane({ session, onExit }: AnonymousChatPaneProps) {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading: isMessagesLoading } =
    useAnonymousMessages(session.id);
  const sendMessage = useSendAnonymousMessage();
  const revealIdentity = useRevealIdentity();
  const leaveSession = useLeaveSession();
  const reportSession = useReportSession();

  const [input, setInput] = useState("");
  const [revealedResult, setRevealedResult] = useState<{
    conversation_id?: string | undefined;
    peer_id?: string | undefined;
  } | null>(null);

  const isP1 = session.is_p1 ?? true;
  const myAlias = session.my_alias || (isP1 ? session.alias_1 : session.alias_2);
  const peerAlias =
    session.peer_alias || (isP1 ? session.alias_2 : session.alias_1);
  const peerAvatar =
    session.peer_avatar || (isP1 ? session.avatar_2 : session.avatar_1);

  const isEnded = session.status === "ended";
  const isRevealed = session.status === "revealed";
  const iRevealed = session.i_revealed || (isP1 ? session.reveal_p1 : session.reveal_p2);
  const peerRevealed =
    session.peer_revealed || (isP1 ? session.reveal_p2 : session.reveal_p1);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  const handleSend = (textOverride?: string) => {
    const text = (textOverride || input).trim();
    if (!text || isEnded) return;

    sendMessage.mutate(
      {
        sessionId: session.id,
        senderAlias: myAlias,
        isP1,
        content: text,
      },
      {
        onError: () => toast.error("Failed to send message. Session may be ended."),
      }
    );

    if (!textOverride) setInput("");
  };

  const handleReveal = () => {
    if (iRevealed || isEnded) return;

    revealIdentity.mutate(session.id, {
      onSuccess: (res) => {
        if (res.status === "both_revealed") {
          toast.success("Mutual match! Both profiles revealed! 🎉");
          setRevealedResult({
            conversation_id: res.conversation_id,
            peer_id: res.peer_id,
          });
        } else {
          toast.info("Reveal requested! Waiting for your peer to agree. ✨");
        }
      },
      onError: () => toast.error("Couldn't request profile reveal."),
    });
  };

  const handleLeave = () => {
    if (confirm("Are you sure you want to leave this anonymous match?")) {
      leaveSession.mutate(session.id, {
        onSuccess: () => {
          toast("Session ended.");
          onExit();
        },
      });
    }
  };

  const handleReport = () => {
    if (
      confirm(
        "Report this session for safety moderation? This will immediately end the chat."
      )
    ) {
      reportSession.mutate(session.id, {
        onSuccess: () => {
          onExit();
        },
      });
    }
  };

  return (
    <div className="flex h-[calc(100vh-73px-60px)] lg:h-[calc(100vh-73px)] w-full flex-col bg-surface-deep">
      {/* ─── Top Navigation / Header ─── */}
      <div className="flex items-center justify-between border-b border-border/80 bg-card/70 px-4 py-3 backdrop-blur-md">
        {/* Peer Info */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-secondary border border-primary/20 text-xl shadow-sm">
            {peerAvatar}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-bold text-foreground">
                {peerAlias}
              </span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                <ShieldCheck className="h-3 w-3" />
                Verified Student
              </span>
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {isEnded
                ? "Session ended"
                : isRevealed
                ? "Profiles revealed! ✨"
                : `You are chatting as ${myAlias}`}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Reveal Profile Button */}
          {!isEnded && !isRevealed && (
            <button
              onClick={handleReveal}
              disabled={revealIdentity.isPending || iRevealed}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                iRevealed
                  ? "border border-primary/40 bg-primary/15 text-primary opacity-90 cursor-default"
                  : peerRevealed
                  ? "animate-bounce bg-success text-success-foreground shadow-glow"
                  : "bg-primary text-primary-foreground hover:scale-105 shadow-glow"
              }`}
              title="Reveal your real profile (Requires mutual agreement)"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>
                {iRevealed
                  ? "Requested ✨"
                  : peerRevealed
                  ? "Peer wants to reveal! 👀"
                  : "Reveal Profile"}
              </span>
            </button>
          )}

          {/* Skip / Leave Button */}
          <button
            onClick={handleLeave}
            className="flex items-center gap-1 rounded-xl border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-destructive/15 hover:text-destructive hover:border-destructive/30 transition-colors"
            title="Leave / Next match"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Next Match</span>
          </button>

          {/* Report Button */}
          <button
            onClick={handleReport}
            className="grid h-8 w-8 place-items-center rounded-xl text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-colors"
            title="Report inappropriate behavior"
          >
            <Flag className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ─── Reveal Status Banners ─── */}
      {peerRevealed && !iRevealed && !isEnded && !isRevealed && (
        <div className="flex items-center justify-between gap-3 border-b border-primary/30 bg-primary/10 px-4 py-2 text-xs">
          <div className="flex items-center gap-2">
            <Sparkle className="h-4 w-4 text-primary animate-spin" />
            <span className="text-foreground">
              <strong>{peerAlias}</strong> just agreed to reveal identities!
            </span>
          </div>
          <button
            onClick={handleReveal}
            className="rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground"
          >
            Reveal Mine Too
          </button>
        </div>
      )}

      {iRevealed && !peerRevealed && !isEnded && !isRevealed && (
        <div className="flex items-center gap-2 border-b border-primary/20 bg-primary/5 px-4 py-2 text-xs text-primary">
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          <span>
            You requested to reveal. Your profile will be unlocked as soon as{" "}
            <strong>{peerAlias}</strong> agrees!
          </span>
        </div>
      )}

      {/* ─── Mutual Reveal Celebration Card ─── */}
      {isRevealed && (
        <div className="m-4 rounded-3xl border border-success/30 bg-success/10 p-5 text-center shadow-lg space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-success/20 px-3 py-1 text-xs font-bold text-success">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Mutual Match Unlocked! 🎉</span>
          </div>
          <h3 className="text-lg font-black text-foreground">
            You & {peerAlias} revealed your profiles!
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            A permanent Direct Message conversation has been established between you both.
          </p>
          <div>
            <button
              onClick={() => {
                if (session.dm_conversation_id) {
                  navigate({
                    to: "/chat",
                    search: revealedResult?.peer_id ? { peer: revealedResult.peer_id } : {},
                  });
                } else {
                  navigate({ to: "/chat" });
                }
              }}
              className="inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-extrabold text-primary-foreground shadow-glow transition-transform hover:scale-105"
              style={{ background: "var(--gradient-brand)" }}
            >
              <span>Continue Chatting in Direct Messages</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── Disconnected Banner ─── */}
      {isEnded && !isRevealed && (
        <div className="m-4 flex items-center justify-between rounded-2xl border border-border bg-card/90 p-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span>This match has ended. Peer disconnected.</span>
          </div>
          <button
            onClick={onExit}
            className="rounded-xl px-3 py-1.5 text-xs font-bold text-primary-foreground"
            style={{ background: "var(--gradient-brand)" }}
          >
            Find Next Match
          </button>
        </div>
      )}

      {/* ─── Messages Feed ─── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Welcome Notice */}
        <div className="my-3 text-center">
          <span className="inline-block rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] text-muted-foreground">
            Matched with <strong>{peerAlias}</strong> · 100% Anonymous & Secure
          </span>
        </div>

        {isMessagesLoading ? (
          <div className="space-y-3 p-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 w-48 animate-pulse rounded-2xl bg-card" />
            ))}
          </div>
        ) : (
          (messages ?? []).map((msg) => {
            const isMine = msg.is_p1 === isP1;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-sm sm:max-w-md rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    isMine
                      ? "rounded-tr-none text-primary-foreground font-medium"
                      : "rounded-tl-none border border-border/80 bg-card text-foreground"
                  }`}
                  style={isMine ? { background: "var(--gradient-brand)" } : undefined}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
                <span className="mt-1 px-1 text-[10px] text-muted-foreground">
                  {formatRelativeTime(msg.created_at)}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ─── Campus Icebreaker Prompts ─── */}
      {!isEnded && (!messages || messages.length < 3) && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto border-t border-border/40 bg-card/40 px-3 py-2">
          {ANON_ICEBREAKERS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handleSend(prompt)}
              className="shrink-0 rounded-full border border-border/70 bg-card/80 px-3 py-1 text-[11px] text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* ─── Message Input Bar ─── */}
      <div className="border-t border-border bg-card/80 p-3 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isEnded || sendMessage.isPending}
            placeholder={
              isEnded
                ? "Match has ended."
                : `Message as ${myAlias}…`
            }
            className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-card px-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!input.trim() || isEnded || sendMessage.isPending}
            className="grid h-11 w-11 place-items-center rounded-xl text-primary-foreground transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
            style={{ background: "var(--gradient-brand)" }}
            aria-label="Send message"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
