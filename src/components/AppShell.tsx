import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Bell,
  BookmarkCheck,
  Car,
  Compass,
  Lightbulb,
  LogOut,
  Menu,
  MessageCircle,
  Settings,
  Shield,
  ShieldCheck,
  User,
  UsersRound,
  X,
  Zap,
} from "lucide-react";

import { initialsOf } from "@/lib/campus";
import { useMyProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";

const TABS = [
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/groups", label: "Groups", icon: UsersRound },
  { to: "/activities", label: "Activities", icon: Zap },
] as const;

const NOTIFICATIONS = [
  { icon: "💬", text: "Rahul Sharma sent you a direct message", time: "2m ago", unread: true },
  { icon: "🤖", text: "New member joined AI/ML Club channel", time: "1h ago", unread: true },
  { icon: "👀", text: "Your profile was viewed by 14 batchmates", time: "3h ago", unread: true },
  { icon: "🏆", text: "Hackathon team activity updated in #hackathons", time: "1d ago", unread: false },
];

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [sidebar, setSidebar] = useState(false);
  const [bell, setBell] = useState(false);
  const [read, setRead] = useState(false);
  const { data: profile, isLoading } = useMyProfile();

  useEffect(() => {
    if (!isLoading && profile && !profile.onboarding_complete) {
      navigate({ to: "/onboarding" });
    }
  }, [isLoading, profile, navigate]);

  useEffect(() => {
    setSidebar(false);
    setBell(false);
  }, [pathname]);

  const unread = read ? 0 : NOTIFICATIONS.filter((n) => n.unread).length;

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
                ScaleX Connect
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
                  <button
                    onClick={() => setRead(true)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Mark all as read
                  </button>
                </div>
                <ul className="max-h-80 overflow-y-auto">
                  {NOTIFICATIONS.map((n) => (
                    <li
                      key={n.text}
                      className="flex gap-3 border-b border-border/60 px-4 py-3 last:border-0"
                    >
                      <span className="text-lg">{n.icon}</span>
                      <span className="min-w-0">
                        <span className="block text-sm text-foreground/90">{n.text}</span>
                        <span className="block text-xs text-muted-foreground">{n.time}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1400px]">
        <aside className="sticky top-[73px] hidden h-[calc(100vh-73px)] w-64 shrink-0 flex-col border-r border-border px-3 py-5 lg:flex">
          <SidebarLinks />
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
              <SidebarLinks />
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
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition-all duration-200 ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function SidebarLinks() {
  return (
    <div className="space-y-6">
      <Section title="Main">
        <NavItem to="/explore" icon={Compass} label="Explore Directory" />
        <NavItem to="/chat" icon={MessageCircle} label="Direct Messages" />
        <NavItem to="/groups" icon={UsersRound} label="Group Channels" />
        <NavItem to="/activities" icon={Zap} label="Campus Activities" />
      </Section>
      <Section title="Campus tools">
        <NavItem to="/activities" icon={Car} label="Ride Pool" soon />
        <NavItem to="/activities" icon={Lightbulb} label="Doubt Matching" soon />
        <NavItem to="/activities" icon={Shield} label="Anonymous Space" soon />
      </Section>
      <Section title="Account">
        <NavItem to="/profile" icon={User} label="My Profile" />
        <NavItem to="/profile" icon={BookmarkCheck} label="Saved Profiles" soon />
        <NavItem to="/profile" icon={Settings} label="Preferences & Privacy" soon />
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
}: {
  to: string;
  icon: typeof Compass;
  label: string;
  soon?: boolean;
}) {
  return (
    <Link
      to={to}
      activeProps={{ className: "bg-primary/12 text-primary" }}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/85 transition-colors duration-200 hover:bg-secondary"
    >
      <Icon className="h-4.5 w-4.5 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
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
