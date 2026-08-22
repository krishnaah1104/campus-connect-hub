import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Sparkles, Trophy, X } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { StudentCard } from "@/components/StudentCard";
import { ProfileDrawer } from "@/components/ProfileDrawer";
import {
  ACHIEVEMENTS,
  BATCHES,
  CLUBS,
  DEGREES,
  HOSTELS,
  INDIAN_STATES,
  ROLES,
  SKILLS,
} from "@/lib/campus";
import { useDirectory, type Profile } from "@/hooks/useProfile";

export const Route = createFileRoute("/_authenticated/explore")({
  head: () => ({
    meta: [
      { title: "Explore Campus — ScaleX Connect" },
      {
        name: "description",
        content:
          "Search every verified student by hostel, batch, degree, skills, clubs and achievements.",
      },
      { property: "og:title", content: "Explore Campus — ScaleX Connect" },
      {
        property: "og:description",
        content:
          "Search every verified student by hostel, batch, degree, skills, clubs and achievements.",
      },
    ],
  }),
  component: ExplorePage,
});

type Filters = Record<string, string[]>;

const GROUPS: { key: string; label: string; options: readonly string[] }[] = [
  { key: "hostel", label: "🏢 Hostel", options: HOSTELS },
  { key: "batch", label: "🎓 Batch", options: BATCHES },
  { key: "degree", label: "📜 Degree", options: DEGREES },
  { key: "home_state", label: "📍 State", options: INDIAN_STATES },
  { key: "clubs", label: "👥 Clubs", options: CLUBS },
  { key: "skills", label: "⚡ Skills", options: SKILLS },
  { key: "achievements", label: "🏆 Achievements", options: ACHIEVEMENTS },
  { key: "roles", label: "👑 Roles", options: ROLES },
];

function ExplorePage() {
  const { data: students, isLoading } = useDirectory();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({});
  const [sheet, setSheet] = useState<string | null>(null);
  const [selected, setSelected] = useState<Profile | null>(null);

  const activeCount = Object.values(filters).flat().length;

  const toggle = (key: string, value: string) =>
    setFilters((prev) => {
      const current = prev[key] ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (students ?? []).filter((s) => {
      for (const { key } of GROUPS) {
        const picked = filters[key] ?? [];
        if (picked.length === 0) continue;
        const raw = (s as unknown as Record<string, unknown>)[key];
        const values = Array.isArray(raw) ? (raw as string[]) : raw ? [String(raw)] : [];
        if (!picked.some((p) => values.includes(p))) return false;
      }
      if (!q) return true;
      const haystack = [
        s.full_name,
        s.bio,
        s.home_state,
        s.life_status,
        s.batch,
        s.degree,
        s.hostel,
        ...(s.skills ?? []),
        ...(s.clubs ?? []),
        ...(s.achievements ?? []),
        ...(s.roles ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [students, query, filters]);

  const stats = useMemo(() => {
    const list = students ?? [];
    const clubs = new Set(list.flatMap((s) => s.clubs ?? []));
    const skills = new Set(list.flatMap((s) => s.skills ?? []));
    return { students: list.length, clubs: clubs.size, skills: skills.size };
  }, [students]);

  return (
    <AppShell>
      <div className="px-4 py-6 lg:px-8">
        <h1 className="text-2xl font-extrabold tracking-tight lg:text-3xl">Explore Campus</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Find the right people for whatever you're doing.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Stat icon={<Sparkles className="h-3.5 w-3.5" />} value={stats.students} label="Students" />
          <Stat icon={<Trophy className="h-3.5 w-3.5" />} value={stats.clubs} label="Clubs" />
          <Stat icon={<Sparkles className="h-3.5 w-3.5" />} value={stats.skills} label="Skills" />
        </div>

        <div className="mt-5 flex gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-input bg-card px-4 focus-within:ring-2 focus-within:ring-ring">
            <Search className="h-4.5 w-4.5 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search students, skills, clubs, achievements…"
              className="h-12 w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear search">
                <X className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            )}
          </div>
          <button
            onClick={() => setSheet("all")}
            className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-border bg-card transition-colors hover:bg-secondary"
            aria-label="Filters"
          >
            <SlidersHorizontal className="h-5 w-5" />
            {activeCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        <div className="no-scrollbar mt-3 flex snap-x gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilters({})}
            className={`h-9 shrink-0 snap-start rounded-full border px-4 text-xs font-medium transition-colors ${
              activeCount === 0
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-card text-foreground/85"
            }`}
          >
            All
          </button>
          {GROUPS.map((g) => {
            const count = filters[g.key]?.length ?? 0;
            return (
              <button
                key={g.key}
                onClick={() => setSheet(g.key)}
                className={`h-9 shrink-0 snap-start rounded-full border px-4 text-xs font-medium transition-colors ${
                  count > 0
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-card text-foreground/85 hover:bg-secondary"
                }`}
              >
                {g.label} {count > 0 && `· ${count}`}
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Showing {results.length} matching {results.length === 1 ? "student" : "students"}
          {(activeCount > 0 || query) && (
            <button
              onClick={() => {
                setFilters({});
                setQuery("");
              }}
              className="ml-2 text-primary hover:underline"
            >
              Reset
            </button>
          )}
        </p>

        {isLoading ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-card" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="text-sm font-semibold">No students match yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              As classmates finish onboarding, they'll show up here instantly.
            </p>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((s) => (
              <StudentCard key={s.id} student={s} onOpen={() => setSelected(s)} />
            ))}
          </div>
        )}
      </div>

      {sheet && (
        <FilterSheet
          groups={sheet === "all" ? GROUPS : GROUPS.filter((g) => g.key === sheet)}
          filters={filters}
          toggle={toggle}
          onReset={() => setFilters({})}
          onClose={() => setSheet(null)}
          count={results.length}
        />
      )}

      {selected && <ProfileDrawer student={selected} onClose={() => setSelected(null)} />}
    </AppShell>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground">
      <span className="text-primary">{icon}</span>
      <span className="font-semibold text-foreground">{value}</span> {label}
    </span>
  );
}

function FilterSheet({
  groups,
  filters,
  toggle,
  onReset,
  onClose,
  count,
}: {
  groups: typeof GROUPS;
  filters: Filters;
  toggle: (key: string, value: string) => void;
  onReset: () => void;
  onClose: () => void;
  count: number;
}) {
  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close filters"
        onClick={onClose}
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
      />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-3xl border border-border bg-popover lg:inset-y-0 lg:left-auto lg:right-0 lg:max-h-none lg:w-[26rem] lg:rounded-none lg:rounded-l-3xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="text-base font-semibold">Filters</p>
          <button onClick={onClose} aria-label="Close">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
          {groups.map((g) => (
            <div key={g.key}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {g.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {g.options.map((option) => {
                  const active = (filters[g.key] ?? []).includes(option);
                  return (
                    <button
                      key={option}
                      onClick={() => toggle(g.key, option)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border bg-card text-foreground/85 hover:bg-secondary"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 border-t border-border p-4">
          <button
            onClick={onReset}
            className="h-12 flex-1 rounded-xl border border-border text-sm font-medium transition-colors hover:bg-secondary"
          >
            Reset All
          </button>
          <button
            onClick={onClose}
            className="h-12 flex-[2] rounded-xl text-sm font-semibold text-primary-foreground"
            style={{ background: "var(--gradient-brand)" }}
          >
            Show {count} students
          </button>
        </div>
      </div>
    </div>
  );
}
