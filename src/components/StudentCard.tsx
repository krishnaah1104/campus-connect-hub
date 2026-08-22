import { MapPin, ShieldCheck } from "lucide-react";
import { initialsOf } from "@/lib/campus";
import type { Profile } from "@/hooks/useProfile";

export function StudentCard({ student, onOpen }: { student: Profile; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="group w-full rounded-2xl border border-border bg-card p-4 text-left transition-all duration-200 hover:border-primary/40 hover:shadow-glow"
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border border-primary/30 bg-secondary text-sm font-bold">
          {student.avatar_url ? (
            <img src={student.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            initialsOf(student.full_name)
          )}
        </span>
        <span className="min-w-0">
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-sm font-semibold">{student.full_name}</span>
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success" />
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {[student.batch, student.degree, student.course].filter(Boolean).join(" • ")}
          </span>
        </span>
      </div>

      {student.life_status && (
        <p className="mt-3 truncate text-xs text-foreground/80">{student.life_status}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {(student.skills ?? []).slice(0, 3).map((s) => (
          <span
            key={s}
            className="rounded-full bg-primary/12 px-2 py-0.5 text-[11px] font-medium text-primary"
          >
            {s}
          </span>
        ))}
        {(student.achievements ?? []).slice(0, 2).map((a) => (
          <span
            key={a}
            className="rounded-full bg-warning/15 px-2 py-0.5 text-[11px] font-medium text-warning"
          >
            {a}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
        {student.hostel && <span>🏢 {student.hostel}</span>}
        {student.home_state && (
          <span className="flex min-w-0 items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{student.home_state}</span>
          </span>
        )}
      </div>
    </button>
  );
}
