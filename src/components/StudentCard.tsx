import { Bus, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { initialsOf } from "@/lib/campus";
import type { Profile } from "@/hooks/useProfile";

export function StudentCard({ student, onOpen }: { student: Profile; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="group w-full rounded-3xl border border-border/80 bg-card/90 p-4 text-left transition-all duration-200 hover:border-primary/40 hover:shadow-glow hover:bg-card"
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
        <span className="grid h-13 w-13 shrink-0 place-items-center overflow-hidden rounded-2xl border border-primary/30 bg-secondary text-sm font-bold shadow-sm">
          {student.avatar_url ? (
            <img src={student.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            initialsOf(student.full_name)
          )}
        </span>

        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-sm font-bold text-foreground">{student.full_name}</span>
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success" />
          </div>

          {/* College Leadership Title */}
          {student.title ? (
            <span className="mt-0.5 inline-flex items-center gap-1 truncate text-[11px] font-semibold text-primary">
              <Sparkles className="h-2.5 w-2.5 shrink-0" />
              <span className="truncate">{student.title}</span>
            </span>
          ) : (
            <span className="block truncate text-xs text-muted-foreground">
              {[student.batch, student.degree, student.course].filter(Boolean).join(" • ")}
            </span>
          )}
        </div>
      </div>

      {student.life_status && (
        <p className="mt-2.5 truncate text-xs text-foreground/80 leading-relaxed">
          {student.life_status}
        </p>
      )}

      {/* Pill tags row */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {(student.skills ?? []).slice(0, 3).map((s) => (
          <span
            key={s}
            className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary"
          >
            {s}
          </span>
        ))}
        {(student.achievements ?? []).slice(0, 2).map((a) => (
          <span
            key={a}
            className="rounded-full border border-amber-500/30 bg-amber-500/12 px-2 py-0.5 text-[10px] font-semibold text-amber-300"
          >
            {a}
          </span>
        ))}
        {student.bus_opted && (
          <span className="inline-flex items-center gap-0.5 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            <Bus className="h-2.5 w-2.5" />
            Bus
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
        <span>{student.hostel ? `🏢 ${student.hostel}` : "—"}</span>
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
