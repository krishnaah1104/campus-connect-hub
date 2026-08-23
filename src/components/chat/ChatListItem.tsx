import { cn } from "@/lib/utils";

// ──────────────────────────────────────────────────────────────
// Utility: generate a stable avatar color from a name string
// ──────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-rose-500",
];

export function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length] ?? "bg-slate-500";
}

export function getInitials(name: string): string {
  return (name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

// ──────────────────────────────────────────────────────────────
// formatRelativeTime — WhatsApp-style time formatting
// ──────────────────────────────────────────────────────────────
export function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (isToday) return timeStr;
  if (isYesterday) return "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

// ──────────────────────────────────────────────────────────────
// ChatListItem — single 2-line row in DM or Channel list
// ──────────────────────────────────────────────────────────────
interface ChatListItemProps {
  name: string;
  avatarUrl?: string | null;
  subtitle?: string;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  unreadCount?: number;
  isActive?: boolean;
  isGroup?: boolean;
  icon?: string | null;
  onClick?: () => void;
}

export function ChatListItem({
  name,
  avatarUrl,
  subtitle,
  lastMessage,
  lastMessageAt,
  unreadCount = 0,
  isActive = false,
  isGroup = false,
  icon,
  onClick,
}: ChatListItemProps) {
  const initials = getInitials(name);
  const bgColor = avatarColor(name);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3.5 py-3 transition-colors border-b border-border/40 last:border-b-0 text-left rounded-xl my-0.5",
        isActive
          ? "bg-primary/15 border-transparent text-foreground shadow-sm ring-1 ring-primary/30"
          : "hover:bg-secondary/60 active:bg-secondary/80 text-foreground"
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div
          className={cn(
            "w-11 h-11 rounded-2xl flex items-center justify-center text-white text-sm font-bold overflow-hidden shadow-sm border border-primary/20",
            isGroup ? "bg-secondary text-primary" : bgColor
          )}
        >
          {icon ? (
            <span className="text-lg">{icon}</span>
          ) : avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </div>
      </div>

      {/* 2-Line Content */}
      <div className="flex-1 min-w-0">
        {/* Line 1: Name + Time */}
        <div className="flex items-center justify-between gap-2">
          <span className={cn("text-sm truncate", isActive ? "font-bold text-foreground" : "font-semibold text-foreground")}>
            {name}
          </span>
          {lastMessageAt && (
            <span className="text-[11px] text-muted-foreground shrink-0 font-medium">
              {formatRelativeTime(lastMessageAt)}
            </span>
          )}
        </div>

        {/* Line 2: Message preview (or subtitle) + Unread Badge */}
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground truncate leading-tight">
            {lastMessage ?? (subtitle ?? "No messages yet")}
          </span>
          {unreadCount > 0 && (
            <span className="shrink-0 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
