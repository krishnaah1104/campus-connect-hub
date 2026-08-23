import { useNavigate } from "@tanstack/react-router";
import {
  Award,
  BookOpen,
  Bus,
  ExternalLink,
  Github,
  Globe,
  Heart,
  Linkedin,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Twitter,
  Users,
  X,
  Zap,
} from "lucide-react";
import { initialsOf } from "@/lib/campus";
import type { Profile } from "@/hooks/useProfile";

export function ProfileDrawer({
  student,
  onClose,
}: {
  student: Profile | null | undefined;
  onClose: () => void;
}) {
  const navigate = useNavigate();

  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        aria-label="Close profile"
        onClick={onClose}
        className="absolute inset-0 bg-background/70 backdrop-blur-sm"
      />

      {/* Drawer */}
      <div className="absolute inset-x-0 bottom-0 flex max-h-[90vh] flex-col overflow-hidden rounded-t-3xl border border-border bg-popover shadow-2xl lg:inset-y-0 lg:left-auto lg:right-0 lg:max-h-none lg:w-[30rem] lg:rounded-none lg:rounded-l-3xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="text-sm font-bold tracking-tight">Verified Student Dossier</p>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Identity Header */}
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-primary/40 bg-secondary text-xl font-bold">
              {student.avatar_url ? (
                <img src={student.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                initialsOf(student.full_name)
              )}
            </span>

            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-1.5">
                <h3 className="truncate text-xl font-extrabold tracking-tight">
                  {student.full_name}
                </h3>
                <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
              </div>

              {/* College Leadership Title */}
              {student.title && (
                <div className="mt-1 inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">
                  <Sparkles className="h-3 w-3" />
                  <span>{student.title}</span>
                </div>
              )}

              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {[student.batch, student.degree, student.course].filter(Boolean).join(" • ")}
              </p>

              {student.home_state && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{student.home_state}</span>
                </p>
              )}
            </div>
          </div>

          {/* Quick Badges Row (Bus & Living) */}
          <div className="flex flex-wrap items-center gap-2">
            {student.bus_opted && (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                <Bus className="h-3 w-3" />
                College Bus Commuter
              </span>
            )}
            {student.hostel && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                🏢 {student.hostel}
              </span>
            )}
          </div>

          {/* Life Status */}
          {student.life_status && (
            <div className="rounded-xl border border-border bg-card/80 px-3.5 py-2.5 text-xs text-foreground/90 leading-relaxed">
              <span className="font-semibold text-muted-foreground mr-1.5">Status:</span>
              {student.life_status}
            </div>
          )}

          {/* Bio */}
          {student.bio && (
            <div className="rounded-xl border border-border bg-card/80 p-3.5 text-xs text-foreground/85 leading-relaxed">
              <p className="font-semibold text-muted-foreground mb-1 text-[11px] uppercase tracking-wider">
                About
              </p>
              <p className="whitespace-pre-wrap">{student.bio}</p>
            </div>
          )}

          {/* Technical Skills */}
          {student.skills && student.skills.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                <Zap className="h-3.5 w-3.5" />
                Skills ({student.skills.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {student.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Achievements & Credentials */}
          {student.achievements && student.achievements.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Award className="h-3.5 w-3.5" />
                Achievements & Credentials ({student.achievements.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {student.achievements.map((ach) => (
                  <span
                    key={ach}
                    className="rounded-full border border-amber-500/30 bg-amber-500/12 px-2.5 py-0.5 text-xs font-medium text-amber-300"
                  >
                    {ach}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Clubs */}
          {student.clubs && student.clubs.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                Clubs ({student.clubs.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {student.clubs.map((club) => (
                  <span
                    key={club}
                    className="rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-foreground/90"
                  >
                    {club}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hobbies & Interests */}
          {student.interests && student.interests.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent-foreground">
                <Heart className="h-3.5 w-3.5 text-accent" />
                Interests & Hobbies ({student.interests.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {student.interests.map((interest) => (
                  <span
                    key={interest}
                    className="rounded-full border border-accent/25 bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent-foreground"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Academic info grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-border bg-card px-3 py-2.5">
              <p className="text-[11px] text-muted-foreground">Hostel</p>
              <p className="mt-0.5 font-medium text-foreground">{student.hostel ?? "—"}</p>
            </div>
            <div className="rounded-xl border border-border bg-card px-3 py-2.5">
              <p className="text-[11px] text-muted-foreground">CGPA</p>
              <p className="mt-0.5 font-medium text-foreground">
                {student.cgpa_public && student.cgpa ? String(student.cgpa) : "🔒 Private"}
              </p>
            </div>
          </div>

          {/* Social Profiles */}
          {(student.github_url || student.linkedin_url || student.twitter_url || student.portfolio_url) && (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Social Profiles
              </p>
              <div className="flex flex-wrap gap-2">
                {student.github_url && (
                  <a
                    href={student.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 py-1.5 text-xs text-foreground hover:border-primary hover:text-primary"
                  >
                    <Github className="h-3.5 w-3.5" />
                    GitHub
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                )}
                {student.linkedin_url && (
                  <a
                    href={student.linkedin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 py-1.5 text-xs text-foreground hover:border-primary hover:text-primary"
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                    LinkedIn
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                )}
                {student.twitter_url && (
                  <a
                    href={student.twitter_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 py-1.5 text-xs text-foreground hover:border-primary hover:text-primary"
                  >
                    <Twitter className="h-3.5 w-3.5" />
                    Twitter
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                )}
                {student.portfolio_url && (
                  <a
                    href={student.portfolio_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 py-1.5 text-xs text-foreground hover:border-primary hover:text-primary"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    Portfolio
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="border-t border-border p-4 bg-card/50">
          <button
            onClick={() => {
              onClose();
              navigate({ to: "/chat", search: { peer: student.id } });
            }}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.01]"
            style={{ background: "var(--gradient-brand)" }}
          >
            <MessageCircle className="h-4 w-4" />
            Message {student.full_name?.split(" ")[0] ?? "Student"}
          </button>
        </div>
      </div>
    </div>
  );
}
