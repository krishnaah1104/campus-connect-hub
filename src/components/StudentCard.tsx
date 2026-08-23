import { Bus, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { initialsOf } from "@/lib/campus";
import type { Profile } from "@/hooks/useProfile";

export function StudentCard({ student, onOpen }: { student: Profile; onOpen: () => void }) {
  const allSkills = student.skills ?? [];
  const allAchievements = student.achievements ?? [];

  // Optimal badge allocation up to max 6 total
  let skillCount = 3;
  let achCount = 3;

  if (allSkills.length < 3) {
    skillCount = allSkills.length;
    achCount = Math.min(allAchievements.length, 6 - skillCount);
  } else if (allAchievements.length < 3) {
    achCount = allAchievements.length;
    skillCount = Math.min(allSkills.length, 6 - achCount);
  }

  const displayedSkills = allSkills.slice(0, skillCount);
  const displayedAchievements = allAchievements.slice(0, achCount);
  const remainingBadges =
    allSkills.length - displayedSkills.length + (allAchievements.length - displayedAchievements.length);

  const academicInfo = [student.batch, student.degree, student.course].filter(Boolean).join(" • ");

  return (
    <button
      onClick={onOpen}
      className="group flex h-full flex-col justify-between rounded-3xl border border-border/80 bg-card/90 p-4 text-left transition-all duration-200 hover:border-primary/40 hover:shadow-glow hover:bg-card"
    >
      <div>
        {/* Top Header: Avatar + Name + Title + Academic Info */}
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-primary/30 bg-secondary text-sm font-bold shadow-sm">
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

            {/* College Leadership Title (if any) */}
            {student.title && (
              <div className="mt-0.5 flex items-center gap-1 text-[11px] font-semibold text-primary truncate">
                <Sparkles className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate">{student.title}</span>
              </div>
            )}

            {/* Always visible Batch • Degree • Course */}
            {academicInfo && (
              <span className="block truncate text-xs text-muted-foreground mt-0.5">
                {academicInfo}
              </span>
            )}
          </div>
        </div>

        {/* Life Status / Bio */}
        {student.life_status ? (
          <p className="mt-2.5 line-clamp-2 text-xs text-foreground/80 leading-relaxed">
            {student.life_status}
          </p>
        ) : student.bio ? (
          <p className="mt-2.5 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
            {student.bio}
          </p>
        ) : null}

        {/* Pill tags row (balanced max 6 badges) */}
        {(displayedSkills.length > 0 || displayedAchievements.length > 0 || student.bus_opted) && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {displayedSkills.map((s) => (
              <span
                key={s}
                className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary"
              >
                {s}
              </span>
            ))}

            {displayedAchievements.map((a) => (
              <span
                key={a}
                className="rounded-full border border-amber-500/30 bg-amber-500/12 px-2 py-0.5 text-[10px] font-semibold text-amber-300"
              >
                {a}
              </span>
            ))}

            {student.bus_opted && (
              <span className="inline-flex items-center gap-0.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-medium text-cyan-300">
                <Bus className="h-2.5 w-2.5" />
                Bus
              </span>
            )}

            {remainingBadges > 0 && (
              <span className="rounded-full border border-border bg-secondary/70 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                +{remainingBadges} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Row: Hostel & State */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground pt-2.5 border-t border-border/40">
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
