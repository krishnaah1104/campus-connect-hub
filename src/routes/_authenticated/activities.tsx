import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Zap,
  Users,
  Calendar,
  Sparkles,
  MessageCircle,
  Hash,
  ArrowRight,
  Compass,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useDirectory } from "@/hooks/useProfile";
import { useChannels } from "@/hooks/useChat";

export const Route = createFileRoute("/_authenticated/activities")({
  head: () => ({
    meta: [
      { title: "Campus Activities — ScaleX" },
      {
        name: "description",
        content:
          "Clubs, campus initiatives, hackathons and activities across Scaler School of Technology.",
      },
      { property: "og:title", content: "Campus Activities — ScaleX" },
      {
        property: "og:description",
        content:
          "Clubs, campus initiatives, hackathons and activities across Scaler School of Technology.",
      },
    ],
  }),
  component: ActivitiesPage,
});

function ActivitiesPage() {
  const navigate = useNavigate();
  const { data: students, isLoading: isDirLoading } = useDirectory();
  const { data: channels, isLoading: isChannelsLoading } = useChannels();

  const totalStudents = (students ?? []).length;
  const clubChannels = (channels ?? []).filter((c) => c.category === "club");
  const academicChannels = (channels ?? []).filter((c) => c.category === "academics");
  const totalChannels = (channels ?? []).length;

  return (
    <AppShell>
      <div className="px-4 py-6 lg:px-8 max-w-6xl mx-auto space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground lg:text-3xl">
            Campus Activities & Clubs
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Explore campus clubs, academic tracks, and student initiatives across SST.
          </p>
        </div>

        {/* Real Dynamic Campus Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="glass-panel flex flex-col items-center gap-1 rounded-2xl px-3 py-4 text-center border border-border/80 bg-card/60">
            <span
              className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground shadow-sm"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Users className="h-4 w-4" />
            </span>
            <p className="mt-1 text-xl font-extrabold tracking-tight text-foreground">
              {isDirLoading ? "—" : totalStudents}
            </p>
            <p className="text-[11px] text-muted-foreground font-medium">Verified Students</p>
          </div>

          <div className="glass-panel flex flex-col items-center gap-1 rounded-2xl px-3 py-4 text-center border border-border/80 bg-card/60">
            <span
              className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground shadow-sm"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Sparkles className="h-4 w-4" />
            </span>
            <p className="mt-1 text-xl font-extrabold tracking-tight text-foreground">
              {isChannelsLoading ? "—" : clubChannels.length}
            </p>
            <p className="text-[11px] text-muted-foreground font-medium">Active Club Spaces</p>
          </div>

          <div className="glass-panel flex flex-col items-center gap-1 rounded-2xl px-3 py-4 text-center border border-border/80 bg-card/60">
            <span
              className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground shadow-sm"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Zap className="h-4 w-4" />
            </span>
            <p className="mt-1 text-xl font-extrabold tracking-tight text-foreground">
              {isChannelsLoading ? "—" : academicChannels.length}
            </p>
            <p className="text-[11px] text-muted-foreground font-medium">Academic Tracks</p>
          </div>

          <div className="glass-panel flex flex-col items-center gap-1 rounded-2xl px-3 py-4 text-center border border-border/80 bg-card/60">
            <span
              className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground shadow-sm"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Hash className="h-4 w-4" />
            </span>
            <p className="mt-1 text-xl font-extrabold tracking-tight text-foreground">
              {isChannelsLoading ? "—" : totalChannels}
            </p>
            <p className="text-[11px] text-muted-foreground font-medium">Community Spaces</p>
          </div>
        </div>

        {/* Active Campus Club Spaces */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Active Campus Clubs & Communities
              </h2>
            </div>
            <Link
              to="/groups"
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <span>View All Spaces</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {isChannelsLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-card" />
              ))}
            </div>
          ) : clubChannels.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/40 p-8 text-center">
              <p className="text-sm font-semibold text-foreground">No club spaces created yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Club spaces can be created by campus administrators or requested through community leads.
              </p>
            </div>
          ) : (
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {clubChannels.map((club) => (
                <button
                  key={club.id}
                  onClick={() => navigate({ to: "/groups" })}
                  className="group flex flex-col justify-between rounded-3xl border border-border/80 bg-card/80 p-4 text-left transition-all hover:border-primary/40 hover:bg-card hover:shadow-glow"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-secondary text-lg border border-primary/20 shadow-sm">
                        {club.icon || "👥"}
                      </span>
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                        {club.member_count} {club.member_count === 1 ? "member" : "members"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {club.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                        {club.description || "Official campus club community space."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-primary pt-2 border-t border-border/40">
                    <span>Open Discussion</span>
                    <MessageCircle className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Campus Events — Real Status */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Upcoming Events & Hackathons
            </h2>
          </div>

          <div className="rounded-3xl border border-border/70 bg-card/40 p-8 text-center space-y-3">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary shadow-sm">
              <Calendar className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">
                No Events Scheduled This Week
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                Campus hackathons, sports leagues, and speaker sessions will be announced here once scheduled by club leads.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <Link
                to="/groups"
                className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm"
                style={{ background: "var(--gradient-brand)" }}
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>Join Club Discussions</span>
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Compass className="h-3.5 w-3.5" />
                <span>Explore Directory</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
