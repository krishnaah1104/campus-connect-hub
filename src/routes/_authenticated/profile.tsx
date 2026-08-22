import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Camera,
  Edit3,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { useMyProfile } from "@/hooks/useProfile";
import { initialsOf } from "@/lib/campus";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — ScaleX Connect" },
      {
        name: "description",
        content:
          "View and edit your verified student profile on ScaleX Connect.",
      },
      { property: "og:title", content: "My Profile — ScaleX Connect" },
      {
        property: "og:description",
        content:
          "View and edit your verified student profile on ScaleX Connect.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { data: profile, isLoading } = useMyProfile();
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate({ to: "/onboarding" });
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="px-4 py-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded-xl bg-secondary" />
            <div className="h-32 rounded-2xl bg-secondary" />
            <div className="h-20 rounded-2xl bg-secondary" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell>
        <div className="px-4 py-6 lg:px-8">
          <p className="text-sm text-muted-foreground">Profile not found.</p>
        </div>
      </AppShell>
    );
  }

  const chips = [
    ...(profile.skills ?? []).map((s) => ({
      label: s,
      cls: "bg-primary/12 text-primary",
    })),
    ...(profile.clubs ?? []).map((c) => ({
      label: c,
      cls: "bg-secondary text-foreground/85",
    })),
    ...(profile.achievements ?? []).map((a) => ({
      label: a,
      cls: "bg-warning/15 text-warning",
    })),
    ...(profile.roles ?? []).map((r) => ({
      label: r,
      cls: "bg-secondary text-foreground/85",
    })),
  ];

  return (
    <AppShell>
      <div className="px-4 py-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight lg:text-3xl">
            My Profile
          </h1>
          <button
            id="edit-profile-btn"
            onClick={handleEdit}
            className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </button>
        </div>

        {/* Hero card */}
        <div className="glass-panel mt-6 overflow-hidden rounded-3xl">
          {/* Cover gradient strip */}
          <div
            className="h-24"
            style={{ background: "var(--gradient-brand)", opacity: 0.35 }}
          />

          <div className="px-5 pb-6">
            {/* Avatar */}
            <div className="relative -mt-12 mb-4 flex items-end justify-between">
              <span className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-card bg-secondary text-xl font-bold text-foreground">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name ?? ""}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initialsOf(profile.full_name)
                )}
                <button
                  aria-label="Change avatar"
                  onClick={() =>
                    toast("Avatar upload coming soon — connect your Google photo for now.")
                  }
                  className="absolute inset-0 grid place-items-center bg-background/60 opacity-0 transition-opacity hover:opacity-100"
                >
                  <Camera className="h-5 w-5" />
                </button>
              </span>

              <span className="flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified
              </span>
            </div>

            <p className="text-xl font-bold tracking-tight">
              {profile.full_name ?? "—"}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {[profile.batch, profile.degree, profile.course]
                .filter(Boolean)
                .join(" · ")}
            </p>

            {profile.home_state && (
              <span className="mt-1.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {profile.home_state}
              </span>
            )}
          </div>
        </div>

        {/* Life status */}
        {profile.life_status && (
          <div className="mt-4 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground/85">
            {profile.life_status}
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <div className="mt-4 rounded-2xl border border-border bg-card px-4 py-3">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Bio
            </p>
            <p className="text-sm text-foreground/85">{profile.bio}</p>
          </div>
        )}

        {/* Chips */}
        {chips.length > 0 && (
          <div className="mt-4 rounded-2xl border border-border bg-card px-4 py-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Skills & Interests
            </p>
            <div className="flex flex-wrap gap-1.5">
              {chips.map(({ label, cls }) => (
                <span
                  key={label}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${cls}`}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Details grid */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <InfoBox label="Hostel" value={profile.hostel} />
          <InfoBox
            label="CGPA"
            value={
              profile.cgpa_public && profile.cgpa
                ? String(profile.cgpa)
                : "Private"
            }
          />
        </div>

        {/* Social links placeholder — fields land in next schema migration */}

        {/* Empty-state CTA if profile is sparse */}
        {!profile.bio && chips.length === 0 && (
          <div className="mt-6 grid place-items-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
            <p className="text-sm font-semibold">Your profile looks a bit empty</p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Fill in your skills, clubs, bio and more so batchmates can find and
              connect with you.
            </p>
            <button
              onClick={handleEdit}
              className="mt-4 rounded-xl px-4 py-2 text-sm font-semibold text-primary-foreground"
              style={{ background: "var(--gradient-brand)" }}
            >
              Complete your profile
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-sm font-medium">{value ?? "—"}</p>
    </div>
  );
}

