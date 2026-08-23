import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Bell,
  Compass,
  LogOut,
  Menu,
  MessageCircle,
  ShieldCheck,
  User,
  UsersRound,
  X,
  Zap,
} from "lucide-react";

import { initialsOf } from "@/lib/campus";
import { useMyProfile } from "@/hooks/useProfile";
import { useConversations } from "@/hooks/useChat";
import { supabase } from "@/integrations/supabase/client";

const TABS = [
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/groups", label: "Groups", icon: UsersRound },
  { to: "/activities", label: "Activities", icon: Zap },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [sidebar, setSidebar] = useState(false);
  const [bell, setBell] = useState(false);
  const [markedReadAt, setMarkedReadAt] = useState<string | null>(null);
  const { data: profile, isLoading } = useMyProfile();
  const { data: conversations } = useConversations();

  useEffect(() => {
    if (!isLoading && profile && !profile.onboarding_complete) {
      navigate({ to: "/onboarding" });
    }
  }, [isLoading, profile, navigate]);

  useEffect(() => {
    setSidebar(false);
    setBell(false);
  }, [pathname]);

  // Build real notification list from unread DMs
  const dmNotifications = useMemo(() => {
    if (!conversations) return [];
    return conversations
      .filter((c) => (c.unread_count ?? 0) > 0)
      .map((c) => ({
        id: c.id,
        peerId: c.peer?.id,
        peerName: c.peer?.full_name ?? "A classmate",
        peerAvatar: c.peer?.avatar_url,
        lastMessage: c.last_message_text,
        lastMessageAt: c.last_message_at,
        unreadCount: c.unread_count ?? 0,
      }));
  }, [conversations]);

  // Total unread messages count across all active conversations
  const unread = useMemo(() => {
    const activeNotifs = markedReadAt
      ? dmNotifications.filter(
          (n) => new Date(n.lastMessageAt) > new Date(markedReadAt)
        )
      : dmNotifications;
    return activeNotifs.reduce((sum, n) => sum + (n.unreadCount || 1), 0);
  }, [dmNotifications, markedReadAt]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-surface-deep pb-24 lg:pb-0">
      <header className="sticky top-0 z-40 glass-panel border-x-0 border-t-0">
        <div className="mx-auto grid max-w-[1400px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <button
            aria-label="Open menu"
            onClick={() => setSidebar(true)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border text-foreground transition-colors hover:bg-secondary lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/explore" className="flex min-w-0 items-center gap-2.5">
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-black text-primary-foreground"
              style={{ background: "var(--gradient-brand)" }}
            >
              S
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold tracking-tight text-foreground">
                ScaleX
              </span>
              <span className="block truncate text-[11px] text-muted-foreground">
                Scaler School of Technology
              </span>
            </span>
          </Link>
          <div className="relative flex shrink-0 items-center gap-2">
            <button
              aria-label="Notifications"
              onClick={() => setBell((v) => !v)}
              className="relative grid h-10 w-10 place-items-center rounded-xl border border-border transition-colors hover:bg-secondary"
            >
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {unread}
                </span>
              )}
            </button>
            <Link to="/profile" aria-label="My profile" className="relative">
              <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-primary/40 bg-secondary text-xs font-bold text-foreground">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  initialsOf(profile?.full_name)
                )}
              </span>
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-success" />
            </Link>

            {bell && (
              <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-popover shadow-card">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <p className="text-sm font-semibold">Notifications</p>
                  {dmNotifications.length > 0 && (
                    <button
                      onClick={() => setMarkedReadAt(new Date().toISOString())}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                {dmNotifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center px-6">
                    <Bell className="h-8 w-8 text-muted-foreground/40 mb-2" />
                    <p className="text-sm font-semibold text-foreground/80">All caught up!</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      New messages from campus peers will appear here.
                    </p>
                  </div>
                ) : (
                  <ul className="max-h-80 overflow-y-auto">
                    {dmNotifications.map((n) => (
                      <li key={n.id} className="border-b border-border/60 last:border-0">
                        <button
                          onClick={() => {
                            setBell(false);
                            navigate({ to: "/chat", search: { peer: n.peerId } });
                          }}
                          className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-secondary/60 transition-colors"
                        >
                          {/* Avatar */}
                          <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-primary/30 bg-secondary text-xs font-bold">
                            {n.peerAvatar ? (
                              <img src={n.peerAvatar} alt="" className="h-full w-full object-cover" />
                            ) : (
                              initialsOf(n.peerName)
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1.5">
                              <span className="block truncate text-sm font-semibold text-foreground">
                                {n.peerName}
                              </span>
                              {n.unreadCount > 1 && (
                                <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">
                                  {n.unreadCount}
                                </span>
                              )}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {n.lastMessage ?? "Sent you a message"}
                            </span>
                          </span>
                          <span className="shrink-0 text-[10px] text-muted-foreground">
                            💬
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1400px]">
        <aside className="sticky top-[73px] hidden h-[calc(100vh-73px)] w-64 shrink-0 flex-col border-r border-border px-3 py-5 lg:flex">
          <SidebarLinks unreadCount={unread} />
          <div className="mt-auto space-y-3 pt-4">
            <VerifiedBadge />
            <SignOutButton onClick={signOut} />
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {sidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            onClick={() => setSidebar(false)}
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col border-r border-border bg-sidebar px-3 py-5">
            <div className="mb-4 flex items-center justify-between px-2">
              <p className="text-sm font-bold">Menu</p>
              <button onClick={() => setSidebar(false)} aria-label="Close">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <SidebarLinks unreadCount={unread} />
            </div>
            <div className="mt-auto space-y-3 pt-4">
              <VerifiedBadge />
              <SignOutButton onClick={signOut} />
            </div>
          </div>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 lg:hidden">
        <div className="glass-panel mx-auto flex max-w-md items-center justify-between gap-1 rounded-2xl p-1.5">
          {TABS.map((tab) => {
            const active = pathname.startsWith(tab.to);
            const hasUnread = tab.to === "/chat" && unread > 0;
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={`relative flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition-all duration-200 ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="relative">
                  <tab.icon className="h-5 w-5" />
                  {hasUnread && (
                    <span className="absolute -top-1 -right-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground shadow-sm">
                      {unread > 99 ? "99+" : unread}
                    </span>
                  )}
                </div>
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function SidebarLinks({ unreadCount }: { unreadCount: number }) {
  return (
    <div className="space-y-6">
      <Section title="Main">
        <NavItem to="/explore" icon={Compass} label="Explore Directory" />
        <NavItem
          to="/chat"
          icon={MessageCircle}
          label="Direct Messages"
          badge={unreadCount > 0 ? unreadCount : undefined}
        />
        <NavItem to="/groups" icon={UsersRound} label="Group Channels" />
        <NavItem to="/activities" icon={Zap} label="Campus Activities" />
      </Section>
      <Section title="Account">
        <NavItem to="/profile" icon={User} label="My Profile" />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function NavItem({
  to,
  icon: Icon,
  label,
  soon,
  badge,
}: {
  to: string;
  icon: typeof Compass;
  label: string;
  soon?: boolean;
  badge?: number;
}) {
  return (
    <Link
      to={to}
      activeProps={{ className: "bg-primary/12 text-primary" }}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/85 transition-colors duration-200 hover:bg-secondary"
    >
      <div className="relative shrink-0">
        <Icon className="h-4.5 w-4.5" />
        {typeof badge === "number" && badge > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
        )}
      </div>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {typeof badge === "number" && badge > 0 && (
        <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
      {soon && (
        <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
          Soon
        </span>
      )}
    </Link>
  );
}

function VerifiedBadge() {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-success/25 bg-success/10 px-3 py-2 text-xs font-medium text-success">
      <ShieldCheck className="h-4 w-4 shrink-0" />
      Verified SST Student
    </div>
  );
}

function SignOutButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </button>
  );
}
