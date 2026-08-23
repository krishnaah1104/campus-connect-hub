import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Award,
  Bus,
  Check,
  Compass,
  Heart,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";

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
  SKILLS,
} from "@/lib/campus";
import { useDirectory, type Profile } from "@/hooks/useProfile";

export const Route = createFileRoute("/_authenticated/explore")({
  head: () => ({
    meta: [
      { title: "Explore Campus — ScaleX" },
      {
        name: "description",
        content:
          "Search every verified student by title, hostel, batch, degree, skills, clubs and achievements.",
      },
      { property: "og:title", content: "Explore Campus — ScaleX" },
      {
        property: "og:description",
        content:
          "Search every verified student by title, hostel, batch, degree, skills, clubs and achievements.",
      },
    ],
  }),
  component: ExplorePage,
});

type Filters = Record<string, string[]>;

export function ExplorePage() {
  const { data: students, isLoading } = useDirectory();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({});
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null);

  // Dynamic filter groups computed from live data + base lists
  const filterGroups = useMemo(() => {
    const list = students ?? [];

    const dynamicSkills = Array.from(
      new Set([...SKILLS, ...list.flatMap((s) => s.skills ?? [])])
    ).filter(Boolean);

    const dynamicAchievements = Array.from(
      new Set([...ACHIEVEMENTS, ...list.flatMap((s) => s.achievements ?? [])])
    ).filter(Boolean);

    const dynamicClubs = Array.from(
      new Set([...CLUBS, ...list.flatMap((s) => s.clubs ?? [])])
    ).filter(Boolean);

    const dynamicInterests = Array.from(
      new Set(list.flatMap((s) => s.interests ?? []))
    ).filter(Boolean);

    return [
      { key: "hostel", label: "🏢 Hostel", options: HOSTELS as readonly string[] },
      { key: "batch", label: "🎓 Batch", options: BATCHES as readonly string[] },
      { key: "degree", label: "📜 Degree", options: DEGREES as readonly string[] },
      { key: "skills", label: "⚡ Skills", options: dynamicSkills },
      { key: "achievements", label: "🏆 Achievements", options: dynamicAchievements },
      { key: "clubs", label: "👥 Clubs", options: dynamicClubs },
      { key: "interests", label: "❤️ Interests", options: dynamicInterests },
      { key: "bus_opted", label: "🚌 Bus Commuter", options: ["Bus Opted"] },
      { key: "home_state", label: "📍 State", options: INDIAN_STATES as readonly string[] },
    ];
  }, [students]);

  const activeFilterCount = Object.values(filters).flat().length;

  const toggleFilter = (key: string, value: string) => {
    setFilters((prev) => {
      const current = prev[key] ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      if (next.length === 0) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return { ...prev, [key]: next };
    });
  };

  const clearAllFilters = () => {
    setFilters({});
    setQuery("");
  };

  // Filtered results
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    return (students ?? []).filter((s) => {
      // Attribute filter checks
      for (const [key, picked] of Object.entries(filters)) {
        if (!picked || picked.length === 0) continue;

        if (key === "bus_opted") {
          if (!s.bus_opted) return false;
          continue;
        }

        const raw = (s as unknown as Record<string, unknown>)[key];
        const values: string[] = Array.isArray(raw)
          ? (raw as string[])
          : raw
            ? [String(raw)]
            : [];

        // Student must match at least one of the picked options in this category
        const matches = picked.some((p) =>
          values.some((v) => v.toLowerCase() === p.toLowerCase())
        );
        if (!matches) return false;
      }

      // Text search query check
      if (!q) return true;

      const haystack = [
        s.full_name,
        s.title,
        s.bio,
        s.home_state,
        s.life_status,
        s.batch,
        s.degree,
        s.course,
        s.hostel,
        ...(s.skills ?? []),
        ...(s.clubs ?? []),
        ...(s.achievements ?? []),
        ...(s.interests ?? []),
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
      <div className="px-4 py-6 lg:px-8 space-y-4">
        {/* Simple Page Title */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground lg:text-3xl">
            Explore
          </h1>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-2xl border border-input bg-card px-4 focus-within:ring-2 focus-within:ring-primary/20">
            <Search className="h-4.5 w-4.5 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, title, skill (e.g. Go, C++), achievement, hostel…"
              className="h-12 w-full min-w-0 bg-transparent text-xs sm:text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button onClick={() => setQuery("")} aria-label="Clear search">
                <X className="h-4 w-4 shrink-0 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          <button
            onClick={() => setSheetOpen(true)}
            className="relative grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-border bg-card transition-colors hover:bg-secondary"
            aria-label="Filter directory"
            title="Filter directory"
          >
            <SlidersHorizontal className="h-5 w-5" />
            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-sm">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Quick Filter Horizontal Scroll */}
        <div className="no-scrollbar mt-3 flex items-center gap-1.5 overflow-x-auto pb-1">
          {/* Quick Bus Commuter toggle */}
          <button
            onClick={() => toggleFilter("bus_opted", "Bus Opted")}
            className={`shrink-0 inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${filters["bus_opted"]?.includes("Bus Opted")
                ? "border-primary bg-primary/20 text-primary"
                : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
              }`}
          >
            <Bus className="h-3.5 w-3.5" />
            <span>Bus Commuters</span>
          </button>

          {/* Quick Hostels */}
          {HOSTELS.map((h) => {
            const active = filters["hostel"]?.includes(h);
            return (
              <button
                key={h}
                onClick={() => toggleFilter("hostel", h)}
                className={`shrink-0 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${active
                    ? "border-primary bg-primary/15 text-primary font-semibold"
                    : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
                  }`}
              >
                🏢 {h}
              </button>
            );
          })}

          {/* Quick Batches */}
          {BATCHES.map((b) => {
            const active = filters["batch"]?.includes(b);
            return (
              <button
                key={b}
                onClick={() => toggleFilter("batch", b)}
                className={`shrink-0 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${active
                    ? "border-primary bg-primary/15 text-primary font-semibold"
                    : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
                  }`}
              >
                🎓 {b}
              </button>
            );
          })}

          {/* More filters button */}
          <button
            onClick={() => setSheetOpen(true)}
            className="shrink-0 rounded-xl border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
          >
            + All Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="shrink-0 rounded-xl px-2 py-1 text-xs text-destructive hover:underline"
            >
              Reset
            </button>
          )}
        </div>

        {/* Results count info */}
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <p>
            Showing <strong>{results.length}</strong> {results.length === 1 ? "student" : "students"}
            {activeFilterCount > 0 && " (filtered)"}
          </p>
          {activeFilterCount > 0 && (
            <button onClick={clearAllFilters} className="text-primary hover:underline">
              Clear filters
            </button>
          )}
        </div>

        {/* Student Cards Grid */}
        <div className="mt-4">
          {isLoading ? (
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-44 animate-pulse rounded-3xl bg-card" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="grid place-items-center rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">
                <Search className="h-6 w-6" />
              </div>
              <p className="text-base font-bold">No students found</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                No verified students match your active filters or search terms. Try searching another
                skill or clearing filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-4 rounded-xl px-4 py-2 text-xs font-semibold text-primary-foreground"
                style={{ background: "var(--gradient-brand)" }}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onOpen={() => setSelectedStudent(student)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Detailed Filter Modal / Sheet ─── */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />

          <div className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border bg-popover shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-base font-bold">Filter Campus Directory</h2>
                <p className="text-xs text-muted-foreground">
                  Select attributes to find specific batchmates and peers
                </p>
              </div>
              <button
                onClick={() => setSheetOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {filterGroups.map((group) => {
                const picked = filters[group.key] ?? [];
                if (group.options.length === 0) return null;

                return (
                  <div key={group.key} className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {group.label}
                      </p>
                      {picked.length > 0 && (
                        <button
                          onClick={() => {
                            setFilters((prev) => {
                              const copy = { ...prev };
                              delete copy[group.key];
                              return copy;
                            });
                          }}
                          className="text-[11px] text-primary hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {group.options.map((opt) => {
                        const isSelected = picked.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggleFilter(group.key, opt)}
                            className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${isSelected
                                ? "border-primary bg-primary/20 text-primary font-semibold shadow-sm"
                                : "border-border bg-card text-foreground/80 hover:bg-secondary"
                              }`}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-border bg-card/60 px-6 py-4">
              <button
                onClick={clearAllFilters}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Reset all
              </button>
              <button
                onClick={() => setSheetOpen(false)}
                className="rounded-xl px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-glow"
                style={{ background: "var(--gradient-brand)" }}
              >
                Show {results.length} {results.length === 1 ? "Student" : "Students"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Student Profile Dossier Drawer ─── */}
      {selectedStudent && (
        <ProfileDrawer
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </AppShell>
  );
}
