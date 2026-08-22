import { MapPin, MessageCircle, ShieldCheck, X } from "lucide-react";
import { initialsOf } from "@/lib/campus";
import type { Profile } from "@/hooks/useProfile";

export function ProfileDrawer({
  student,
  onClose,
}: {
  student: Profile;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close profile"
        onClick={onClose}
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
      />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col overflow-hidden rounded-t-3xl border border-border bg-popover lg:inset-y-0 lg:left-auto lg:right-0 lg:max-h-none lg:w-[28rem] lg:rounded-none lg:rounded-l-3xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="text-sm font-semibold">Student dossier</p>
          <button onClick={onClose} aria-label="Close">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-primary/30 bg-secondary text-lg font-bold">
              {student.avatar_url ? (
                <img src={student.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                initialsOf(student.full_name)
              )}
            </span>
            <span className="min-w-0">
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="truncate text-xl font-bold tracking-tight">
                  {student.full_name}
                </span>
                <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {[student.batch, student.degree, student.course].filter(Boolean).join(" • ")}
              </span>
              {student.home_state && (
                <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {student.home_state}
                </span>
              )}
            </span>
          </div>

          {student.life_status && (
            <p className="mt-4 rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground/85">
              {student.life_status}
            </p>
          )}

          {student.bio && <p className="mt-4 text-sm text-foreground/80">{student.bio}</p>}

          <Group title="Skills" items={student.skills} tone="primary" />
          <Group title="Clubs" items={student.clubs} tone="muted" />
          <Group title="Achievements" items={student.achievements} tone="warning" />
          <Group title="Leadership" items={student.roles} tone="muted" />

          <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
            <Info label="Hostel" value={student.hostel} />
            <Info
              label="CGPA"
              value={student.cgpa_public && student.cgpa ? String(student.cgpa) : "Private"}
            />
          </div>
        </div>

        <div className="border-t border-border p-4">
          <button
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-primary-foreground"
            style={{ background: "var(--gradient-brand)" }}
          >
            <MessageCircle className="h-4 w-4" />
            Message {student.full_name?.split(" ")[0] ?? "student"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Group({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[] | null;
  tone: "primary" | "warning" | "muted";
}) {
  if (!items || items.length === 0) return null;
  const cls =
    tone === "primary"
      ? "bg-primary/12 text-primary"
      : tone === "warning"
        ? "bg-warning/15 text-warning"
        : "bg-secondary text-foreground/85";
  return (
    <div className="mt-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${cls}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-sm font-medium">{value ?? "—"}</p>
    </div>
  );
}
