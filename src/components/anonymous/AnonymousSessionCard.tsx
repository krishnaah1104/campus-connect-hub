import { formatRelativeTime } from "@/components/chat/ChatListItem";
import { type AnonymousSession } from "@/hooks/useAnonymous";
import { Sparkles, MessageCircle, Clock } from "lucide-react";

interface AnonymousSessionCardProps {
  session: AnonymousSession;
  onClick?: () => void;
}

export function AnonymousSessionCard({
  session,
  onClick,
}: AnonymousSessionCardProps) {
  const isRevealed = session.status === "revealed";

  return (
    <div
      onClick={onClick}
      className="glass-panel flex items-center justify-between gap-3 rounded-2xl p-3.5 transition-colors hover:bg-secondary/40"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-card border border-border text-lg shadow-sm">
          {session.peer_avatar || "👻"}
        </span>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-bold text-foreground">
              {session.peer_alias || "Anonymous Peer"}
            </p>
            {isRevealed && (
              <span className="flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
                <Sparkles className="h-2.5 w-2.5" />
                Revealed
              </span>
            )}
          </div>

          <p className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
            <Clock className="h-3 w-3" />
            <span>{formatRelativeTime(session.created_at)}</span>
            <span>·</span>
            <span>as {session.my_alias}</span>
          </p>
        </div>
      </div>

      <div className="shrink-0">
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-border/60 text-muted-foreground">
          <MessageCircle className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}
