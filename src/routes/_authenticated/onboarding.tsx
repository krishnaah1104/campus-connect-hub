import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, Lock, Search, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";

import {
  BATCHES,
  COURSES,
  DEGREES,
  HOSTELS,
  INDIAN_STATES,
  LIFE_STATUSES,
  degreeLockedFor,
  initialsOf,
} from "@/lib/campus";
import { useMyProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your campus profile — ScaleX" },
      {
        name: "description",
        content: "Fifteen seconds, zero typing. Pick your batch, degree, hostel, state and status.",
      },
      { property: "og:title", content: "Set up your campus profile — ScaleX" },
      {
        property: "og:description",
        content: "Fifteen seconds, zero typing. Pick your batch, degree, hostel, state and status.",
      },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile, user, isLoading } = useMyProfile();

  const [name, setName] = useState("");
  const [batch, setBatch] = useState<string | null>(null);
  const [course, setCourse] = useState<string | null>(null);
  const [degree, setDegree] = useState<string | null>(null);
  const [hostel, setHostel] = useState<string | null>(null);
  const [state, setState] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName((v) => v || profile.full_name || "");
    setBatch((v) => v ?? profile.batch);
    setCourse((v) => v ?? profile.course);
    setDegree((v) => v ?? profile.degree);
    setHostel((v) => v ?? profile.hostel);
    setState((v) => v ?? profile.home_state);
    setStatus((v) => v || profile.life_status || "");
  }, [profile]);

  const locked = degreeLockedFor(batch);
  useEffect(() => {
    if (locked) setDegree("BITS");
    if (batch !== "2030") setCourse(null);
  }, [batch, locked]);

  const filled = [name, batch, degree, hostel, state, status].filter(Boolean).length;
  const progress = Math.round((filled / 6) * 100);

  const save = async () => {
    if (!user) return;
    if (!name || !batch || !degree || !hostel || !state) {
      toast.error("Please complete batch, degree, hostel and home state.");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: name,
        batch,
        course,
        degree,
        hostel,
        home_state: state,
        life_status: status || null,
        onboarding_complete: true,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Could not save your profile.");
      return;
    }
    await queryClient.invalidateQueries();
    toast.success("Welcome to campus 🎉");
    navigate({ to: "/explore" });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-xl space-y-4 p-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-card" />
        ))}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-surface-deep">
      <div className="mx-auto w-full max-w-xl px-5 py-8">
        <div className="glass-panel flex items-center gap-3 rounded-2xl p-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full border border-primary/40 bg-secondary text-sm font-bold">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              initialsOf(name || profile?.email)
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold tracking-tight">
              {name || "Your name"}
            </p>
            <p className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success" />
              <span className="truncate">{profile?.email}</span>
            </p>
          </div>
        </div>

        <Field label="What should campus call you?">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="h-12 w-full rounded-xl border border-input bg-card px-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
          />
        </Field>

        <Field label="What's your graduating batch?">
          <Pills options={[...BATCHES]} value={batch} onChange={setBatch} />
        </Field>

        {batch === "2030" && (
          <Field label="Course / Specialization">
            <Pills options={[...COURSES]} value={course} onChange={setCourse} />
          </Field>
        )}

        <Field label="Degree">
          <Pills
            options={[...DEGREES]}
            value={degree}
            onChange={setDegree}
            disabled={locked}
            lockedValue={locked ? "BITS" : ""}
          />
          {locked && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              Degree is automatically assigned for this batch.
            </p>
          )}
        </Field>

        <Field label="Where do you stay?">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {HOSTELS.map((h) => (
              <button
                key={h}
                onClick={() => setHostel(h)}
                className={`flex h-14 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-medium transition-all duration-200 ${
                  hostel === h
                    ? "border-primary bg-primary/15 text-primary shadow-glow"
                    : "border-border bg-card text-foreground/85 hover:bg-secondary"
                }`}
              >
                <span>{h === "Day Scholar" ? "🚗" : "🏢"}</span>
                {h}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Home state / region">
          <StateSelect value={state} onChange={setState} />
        </Field>

        <Field label="What are you up to right now?">
          <div className="flex flex-wrap gap-2">
            {LIFE_STATUSES.map((s) => {
              const label = `${s.emoji} ${s.label}`;
              const active = status === label;
              return (
                <button
                  key={s.label}
                  onClick={() => setStatus(active ? "" : label)}
                  className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-all duration-200 ${
                    active
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border bg-card text-foreground/85 hover:bg-secondary"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="mt-3">
            <input
              value={status}
              maxLength={80}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="Or write your own status…"
              className="h-11 w-full rounded-xl border border-input bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="mt-1 text-right text-[11px] text-muted-foreground">
              {status.length}/80
            </p>
          </div>
        </Field>

        <div className="mt-8">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Profile {progress}% complete</span>
            <span>{progress === 100 ? "Ready!" : "Almost ready!"}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, background: "var(--gradient-brand)" }}
            />
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="mt-5 h-14 w-full rounded-full text-base font-semibold text-primary-foreground transition-transform duration-200 hover:scale-[1.01] disabled:opacity-60"
            style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-glow)" }}
          >
            {saving ? "Saving…" : "Enter Campus →"}
          </button>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="mb-3 text-lg font-semibold tracking-tight">{label}</h2>
      {children}
    </section>
  );
}

function Pills({
  options,
  value,
  onChange,
  disabled,
  lockedValue,
}: {
  options: string[];
  value: string | null;
  onChange: (v: string) => void;
  disabled?: boolean;
  lockedValue?: string;
}) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
      {options.map((option) => {
        const active = value === option;
        const isDisabled = disabled && option !== lockedValue;
        return (
          <button
            key={option}
            disabled={isDisabled}
            onClick={() => onChange(option)}
            className={`flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-5 text-sm font-medium transition-all duration-200 ${
              active
                ? "border-primary bg-primary/15 text-primary shadow-glow"
                : "border-border bg-card text-foreground/85 hover:bg-secondary"
            } ${isDisabled ? "cursor-not-allowed opacity-40" : ""}`}
          >
            {active && <Check className="h-4 w-4" />}
            {option}
          </button>
        );
      })}
    </div>
  );
}

export function StateSelect({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const results = useMemo(
    () => INDIAN_STATES.filter((s) => s.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 w-full items-center justify-between rounded-xl border border-input bg-card px-4 text-sm transition-colors hover:bg-secondary"
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {value ?? "Select your home state"}
        </span>
        <span className="flex items-center gap-2">
          {value && (
            <X
              className="h-4 w-4 text-muted-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
            />
          )}
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </span>
      </button>
      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-card">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search states…"
              className="h-11 w-full bg-transparent text-sm outline-none"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto">
            {results.map((s) => (
              <li key={s}>
                <button
                  onClick={() => {
                    onChange(s);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-secondary"
                >
                  {s}
                </button>
              </li>
            ))}
            {results.length === 0 && (
              <li className="px-4 py-3 text-sm text-muted-foreground">No states found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
