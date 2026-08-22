import { createFileRoute } from "@tanstack/react-router";
import { Zap, Rocket, Users, Trophy, Calendar, Star } from "lucide-react";
import { AppShell } from "@/components/AppShell";

const UPCOMING = [
  {
    icon: "🤖",
    title: "AI/ML Hackathon — Build in 24h",
    date: "Sep 6–7, 2026",
    tag: "Hackathon",
    tagColor: "bg-primary/12 text-primary",
    desc: "Form teams of 2–4, pick any AI track, ship something real.",
  },
  {
    icon: "🏋️",
    title: "Inter-Hostel Basketball League",
    date: "Sep 10, 2026",
    tag: "Sports",
    tagColor: "bg-warning/15 text-warning",
    desc: "UW1 vs UW2 vs Day Scholars. Sign your squad up before Sep 8.",
  },
  {
    icon: "🎤",
    title: "Open Mic Night — Campus Canteen",
    date: "Sep 12, 2026",
    tag: "Social",
    tagColor: "bg-success/15 text-success",
    desc: "Comedy, poetry, music — all welcome. 7 PM onwards.",
  },
  {
    icon: "💼",
    title: "Placement Prep Bootcamp",
    date: "Sep 14–18, 2026",
    tag: "Career",
    tagColor: "bg-secondary text-foreground/85",
    desc: "DSA, system design, mock interviews — coordinated by the career cell.",
  },
];

const STATS = [
  { icon: Rocket, value: "12", label: "Active clubs" },
  { icon: Users, value: "320+", label: "Participants this month" },
  { icon: Trophy, value: "4", label: "Upcoming events" },
  { icon: Star, value: "28", label: "Alumni mentors" },
];

export const Route = createFileRoute("/_authenticated/activities")({
  head: () => ({
    meta: [
      { title: "Campus Activities — ScaleX" },
      {
        name: "description",
        content:
          "Hackathons, sports leagues, open mics and placement prep — all campus events in one place.",
      },
      { property: "og:title", content: "Campus Activities — ScaleX" },
      {
        property: "og:description",
        content:
          "Hackathons, sports leagues, open mics and placement prep — all campus events in one place.",
      },
    ],
  }),
  component: ActivitiesPage,
});

function ActivitiesPage() {
  return (
    <AppShell>
      <div className="px-4 py-6 lg:px-8">
        <h1 className="text-2xl font-extrabold tracking-tight lg:text-3xl">
          Campus Activities
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hackathons, sports, social events and career sessions — all in one
          feed.
        </p>

        {/* Stats row */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div
              key={label}
              className="glass-panel flex flex-col items-center gap-1 rounded-2xl px-3 py-4 text-center"
            >
              <span
                className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground"
                style={{ background: "var(--gradient-brand)" }}
              >
                <Icon className="h-4 w-4" />
              </span>
              <p className="mt-1 text-xl font-extrabold tracking-tight">
                {value}
              </p>
              <p className="text-[11px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        {/* Upcoming events */}
        <div className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Upcoming
            </p>
          </div>
          <div className="space-y-3">
            {UPCOMING.map((ev) => (
              <div
                key={ev.title}
                className="glass-panel flex gap-4 rounded-2xl p-4"
              >
                <span className="mt-0.5 text-2xl">{ev.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-semibold text-foreground">{ev.title}</p>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${ev.tagColor}`}
                    >
                      {ev.tag}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-primary">{ev.date}</p>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {ev.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coming soon banner */}
        <div className="mt-8 grid place-items-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
          <span
            className="grid h-14 w-14 place-items-center rounded-2xl text-primary-foreground"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Zap className="h-6 w-6" />
          </span>
          <p className="mt-4 text-sm font-semibold">Full event engine coming soon</p>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            RSVP, team formation, reminders and live updates will be wired in
            next sprint.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
