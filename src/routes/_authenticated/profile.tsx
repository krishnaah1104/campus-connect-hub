import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Award,
  BookOpen,
  Briefcase,
  Bus,
  Camera,
  Check,
  Compass,
  Edit3,
  ExternalLink,
  Github,
  Globe,
  Heart,
  Linkedin,
  Lock,
  MapPin,
  Save,
  ShieldCheck,
  Sparkles,
  Twitter,
  Unlock,
  Users,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { TagInput } from "@/components/TagInput";
import { useMyProfile, type Profile } from "@/hooks/useProfile";
import {
  ACHIEVEMENTS,
  BATCHES,
  CLUBS,
  COURSES,
  DEGREES,
  HOSTELS,
  INDIAN_STATES,
  LIFE_STATUSES,
  ROLES,
  SKILLS,
  degreeLockedFor,
  initialsOf,
} from "@/lib/campus";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — ScaleX" },
      {
        name: "description",
        content: "View and edit your verified student dossier on ScaleX.",
      },
      { property: "og:title", content: "My Profile — ScaleX" },
      {
        property: "og:description",
        content: "View and edit your verified student dossier on ScaleX.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { data: profile, isLoading, user } = useMyProfile();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable form state
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [lifeStatus, setLifeStatus] = useState("");
  const [batch, setBatch] = useState<string | null>(null);
  const [degree, setDegree] = useState<string | null>(null);
  const [course, setCourse] = useState<string | null>(null);
  const [hostel, setHostel] = useState<string | null>(null);
  const [homeState, setHomeState] = useState<string | null>(null);
  const [busOpted, setBusOpted] = useState(false);
  const [cgpa, setCgpa] = useState<string>("");
  const [cgpaPublic, setCgpaPublic] = useState(false);

  const [skills, setSkills] = useState<string[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [clubs, setClubs] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);

  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  // Sync profile data to form state
  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name || "");
    setTitle(profile.title || "");
    setBio(profile.bio || "");
    setLifeStatus(profile.life_status || "");
    setBatch(profile.batch || null);
    setDegree(profile.degree || null);
    setCourse(profile.course || null);
    setHostel(profile.hostel || null);
    setHomeState(profile.home_state || null);
    setBusOpted(Boolean(profile.bus_opted));
    setCgpa(profile.cgpa ? String(profile.cgpa) : "");
    setCgpaPublic(Boolean(profile.cgpa_public));

    setSkills(profile.skills ?? []);
    setAchievements(profile.achievements ?? []);
    setClubs(profile.clubs ?? []);
    setInterests(profile.interests ?? []);

    setGithubUrl(profile.github_url || "");
    setLinkedinUrl(profile.linkedin_url || "");
    setTwitterUrl(profile.twitter_url || "");
    setPortfolioUrl(profile.portfolio_url || "");
  }, [profile]);

  const toggleClub = (clubName: string) => {
    setClubs((prev) =>
      prev.includes(clubName) ? prev.filter((c) => c !== clubName) : [...prev, clubName]
    );
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const parsedCgpa = cgpa.trim() ? parseFloat(cgpa) : null;
    if (parsedCgpa !== null && (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10)) {
      toast.error("Please enter a valid CGPA between 0.00 and 10.00");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim() || null,
        title: title.trim() || null,
        bio: bio.trim() || null,
        life_status: lifeStatus.trim() || null,
        batch,
        degree,
        course,
        hostel,
        home_state: homeState,
        bus_opted: busOpted,
        cgpa: parsedCgpa,
        cgpa_public: cgpaPublic,
        skills,
        achievements,
        clubs,
        interests,
        github_url: githubUrl.trim() || null,
        linkedin_url: linkedinUrl.trim() || null,
        twitter_url: twitterUrl.trim() || null,
        portfolio_url: portfolioUrl.trim() || null,
      })
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      toast.error("Could not update profile: " + error.message);
      return;
    }

    await queryClient.invalidateQueries({ queryKey: ["profile"] });
    await queryClient.invalidateQueries({ queryKey: ["directory"] });
    toast.success("Profile updated successfully ✨");
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (profile) {
      setFullName(profile.full_name || "");
      setTitle(profile.title || "");
      setBio(profile.bio || "");
      setLifeStatus(profile.life_status || "");
      setBatch(profile.batch || null);
      setDegree(profile.degree || null);
      setCourse(profile.course || null);
      setHostel(profile.hostel || null);
      setHomeState(profile.home_state || null);
      setBusOpted(Boolean(profile.bus_opted));
      setCgpa(profile.cgpa ? String(profile.cgpa) : "");
      setCgpaPublic(Boolean(profile.cgpa_public));
      setSkills(profile.skills ?? []);
      setAchievements(profile.achievements ?? []);
      setClubs(profile.clubs ?? []);
      setInterests(profile.interests ?? []);
      setGithubUrl(profile.github_url || "");
      setLinkedinUrl(profile.linkedin_url || "");
      setTwitterUrl(profile.twitter_url || "");
      setPortfolioUrl(profile.portfolio_url || "");
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-48 rounded-xl bg-card" />
            <div className="h-44 rounded-3xl bg-card" />
            <div className="h-32 rounded-2xl bg-card" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (!profile) {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl px-4 py-8 text-center">
          <p className="text-muted-foreground text-sm">Profile not found.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-6 lg:px-8">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight lg:text-3xl">
              {isEditing ? "Edit Profile Dossier" : "My Profile Dossier"}
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isEditing
                ? "Update your college leadership, verified skills, achievements, transit and bio."
                : "Your verified student profile as visible to classmates and campus recruiters."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="rounded-xl border border-border px-3.5 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-50"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{saving ? "Saving…" : "Save Changes"}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* VIEW MODE */}
        {/* ═══════════════════════════════════════════════════════ */}
        {!isEditing ? (
          <div className="mt-6 space-y-5">
            {/* Hero Card */}
            <div className="glass-panel overflow-hidden rounded-3xl">
              <div
                className="h-28"
                style={{ background: "var(--gradient-brand)", opacity: 0.45 }}
              />

              <div className="px-6 pb-6">
                <div className="relative -mt-14 mb-4 flex items-end justify-between">
                  <span className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-3xl border-4 border-card bg-secondary text-2xl font-bold text-foreground shadow-card">
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
                      aria-label="Avatar info"
                      onClick={() =>
                        toast("Profile avatar is synced from your college Google account.")
                      }
                      className="absolute inset-0 grid place-items-center bg-background/60 opacity-0 transition-opacity hover:opacity-100"
                    >
                      <Camera className="h-6 w-6" />
                    </button>
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    {profile.bus_opted && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        <Bus className="h-3.5 w-3.5" />
                        Bus Commuter
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                      <ShieldCheck className="h-4 w-4" />
                      Verified SST
                    </span>
                  </div>
                </div>

                <h2 className="text-2xl font-extrabold tracking-tight">
                  {profile.full_name ?? "Student"}
                </h2>

                {/* College Position / Instructor Badge */}
                {profile.title && (
                  <div
                    className={`mt-1 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold ${
                      profile.title.toLowerCase().includes("instructor")
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "bg-primary/15 text-primary border border-primary/25"
                    }`}
                  >
                    {profile.title.toLowerCase().includes("instructor") ? (
                      <Sparkles className="h-3.5 w-3.5 text-purple-300" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                    )}
                    <span>{profile.title}</span>
                  </div>
                )}

                <p className="mt-1 text-xs text-muted-foreground">
                  {[profile.batch, profile.degree, profile.course, profile.hostel]
                    .filter(Boolean)
                    .join(" · ")}
                </p>

                {profile.home_state && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {profile.home_state}
                  </p>
                )}

                {/* Social links row */}
                {(profile.github_url || profile.linkedin_url || profile.twitter_url || profile.portfolio_url) && (
                  <div className="mt-3.5 flex flex-wrap items-center gap-2">
                    {profile.github_url && (
                      <a
                        href={profile.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 py-1.5 text-xs text-foreground/85 transition-colors hover:border-primary hover:text-primary"
                      >
                        <Github className="h-3.5 w-3.5" />
                        GitHub
                      </a>
                    )}
                    {profile.linkedin_url && (
                      <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 py-1.5 text-xs text-foreground/85 transition-colors hover:border-primary hover:text-primary"
                      >
                        <Linkedin className="h-3.5 w-3.5" />
                        LinkedIn
                      </a>
                    )}
                    {profile.twitter_url && (
                      <a
                        href={profile.twitter_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 py-1.5 text-xs text-foreground/85 transition-colors hover:border-primary hover:text-primary"
                      >
                        <Twitter className="h-3.5 w-3.5" />
                        Twitter
                      </a>
                    )}
                    {profile.portfolio_url && (
                      <a
                        href={profile.portfolio_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 py-1.5 text-xs text-foreground/85 transition-colors hover:border-primary hover:text-primary"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        Portfolio
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Life Status */}
            {profile.life_status && (
              <div className="rounded-2xl border border-border/80 bg-card/80 px-4 py-3 text-sm text-foreground/90">
                <span className="font-semibold text-xs text-muted-foreground mr-2 uppercase tracking-wider">
                  Status:
                </span>
                {profile.life_status}
              </div>
            )}

            {/* Bio */}
            {profile.bio && (
              <div className="rounded-2xl border border-border/80 bg-card/80 p-4">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  About Me
                </p>
                <p className="whitespace-pre-wrap text-sm text-foreground/85 leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="rounded-2xl border border-border/80 bg-card/80 p-5">
                <p className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
                  <Zap className="h-3.5 w-3.5" />
                  Technical Skills ({profile.skills.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {profile.achievements && profile.achievements.length > 0 && (
              <div className="rounded-2xl border border-amber-500/20 bg-card/80 p-5">
                <p className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
                  <Award className="h-4 w-4" />
                  Achievements & Credentials ({profile.achievements.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.achievements.map((ach) => (
                    <span
                      key={ach}
                      className="rounded-full border border-amber-500/30 bg-amber-500/12 px-3 py-1 text-xs font-semibold text-amber-300"
                    >
                      {ach}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Clubs & Communities */}
            {profile.clubs && profile.clubs.length > 0 && (
              <div className="rounded-2xl border border-border/80 bg-card/80 p-5">
                <p className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  Clubs & Campus Organizations ({profile.clubs.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.clubs.map((club) => (
                    <span
                      key={club}
                      className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground/90"
                    >
                      {club}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Interests & Hobbies */}
            {profile.interests && profile.interests.length > 0 && (
              <div className="rounded-2xl border border-border/80 bg-card/80 p-5">
                <p className="mb-2.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent-foreground">
                  <Heart className="h-3.5 w-3.5 text-accent" />
                  Hobbies & Interests ({profile.interests.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.interests.map((interest) => (
                    <span
                      key={interest}
                      className="rounded-full border border-accent/25 bg-accent/15 px-3 py-1 text-xs font-medium text-accent-foreground"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Academic & Transit Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-2xl border border-border bg-card p-3.5">
                <p className="text-[11px] text-muted-foreground">Batch & Degree</p>
                <p className="mt-1 font-bold text-foreground">
                  {profile.batch ?? "—"} ({profile.degree ?? "—"})
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-3.5">
                <p className="text-[11px] text-muted-foreground">Hostel</p>
                <p className="mt-1 font-bold text-foreground">{profile.hostel ?? "—"}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-3.5">
                <p className="text-[11px] text-muted-foreground">College Bus</p>
                <p className="mt-1 font-bold text-foreground">
                  {profile.bus_opted ? "🚌 Yes (Opted)" : "No"}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-3.5">
                <p className="text-[11px] text-muted-foreground">CGPA Visibility</p>
                <p className="mt-1 font-bold text-foreground">
                  {profile.cgpa_public && profile.cgpa ? `${profile.cgpa} (Public)` : "🔒 Private"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ═══════════════════════════════════════════════════════ */
          /* EDIT MODE */
          /* ═══════════════════════════════════════════════════════ */
          <div className="mt-6 space-y-6">
            {/* Section 1: Basic Identity & College Position */}
            <div className="rounded-3xl border border-border bg-card/60 p-5 backdrop-blur-md space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" />
                1. Basic Info & College Leadership Title
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Full Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="mt-1.5 h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground">
                      College Position / Title
                    </label>
                    <span className="text-[11px] text-primary font-medium">
                      Instructors & leaders can post announcements
                    </span>
                  </div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Instructor, VP of AI Club, Lead Organizer, Hostel Incharge"
                    className="mt-1.5 h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />

                  {/* Role Presets */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {ROLES.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setTitle(role)}
                        className={`rounded-lg border px-2 py-0.5 text-[11px] transition-colors ${
                          title === role
                            ? "border-primary bg-primary/20 text-primary font-bold shadow-sm"
                            : "border-border/70 bg-card/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
                        }`}
                      >
                        {role === "Instructor" ? "🎓 " + role : role}
                      </button>
                    ))}
                  </div>

                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Your official role at SST (e.g. Instructor, Club Lead, Hostel Incharge). Allows posting campus announcements.
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Life Status</label>
                <div className="mt-1.5 flex flex-wrap gap-1.5 mb-2">
                  {LIFE_STATUSES.map((st) => (
                    <button
                      key={st.label}
                      type="button"
                      onClick={() => setLifeStatus(`${st.emoji} ${st.label}`)}
                      className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${lifeStatus === `${st.emoji} ${st.label}`
                          ? "border-primary bg-primary/15 text-primary font-semibold"
                          : "border-border bg-card/80 text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      {st.emoji} {st.label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={lifeStatus}
                  onChange={(e) => setLifeStatus(e.target.value)}
                  placeholder="Or type custom status: e.g. 🚀 Building an open source compiler"
                  className="h-10 w-full rounded-xl border border-input bg-card px-3.5 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  About Me / Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a short bio about what you're working on, learning, or looking to collaborate on…"
                  className="mt-1.5 w-full rounded-xl border border-input bg-card p-3 text-xs outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
            </div>

            {/* Section 2: Technical Skills */}
            <div className="rounded-3xl border border-border bg-card/60 p-5 backdrop-blur-md space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Zap className="h-4 w-4" />
                2. Technical Skills
              </h3>
              <p className="text-xs text-muted-foreground">
                Type your languages, frameworks, or tools and press <strong>comma</strong> or{" "}
                <strong>Enter</strong>. Tags are automatically normalized (e.g. <code>c++</code> →{" "}
                <code>C++</code>, <code>go</code> → <code>Go</code>) and become filterable across
                campus Explore.
              </p>
              <TagInput
                tags={skills}
                onChange={setSkills}
                placeholder="Type skill (e.g. C++, Go, React, DSA, System Design) + Enter"
                suggestions={SKILLS}
                tone="primary"
              />
            </div>

            {/* Section 3: Achievements & Credentials */}
            <div className="rounded-3xl border border-amber-500/20 bg-card/60 p-5 backdrop-blur-md space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Award className="h-4 w-4" />
                3. Achievements & Past Credentials
              </h3>
              <p className="text-xs text-muted-foreground">
                Notable achievements, open source programs, hackathon wins, or past research (e.g.{" "}
                <code>GSoC 2024</code>, <code>LFX Mentee</code>, <code>ICPC Regionalist</code>,{" "}
                <code>AI Research Intern</code>).
              </p>
              <TagInput
                tags={achievements}
                onChange={setAchievements}
                placeholder="Type achievement (e.g. GSoC, LFX, ICPC, SIH Winner) + Enter"
                suggestions={ACHIEVEMENTS}
                tone="warning"
              />
            </div>

            {/* Section 4: Clubs & Campus Communities */}
            <div className="rounded-3xl border border-border bg-card/60 p-5 backdrop-blur-md space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                4. Clubs & Organizations
              </h3>
              <p className="text-xs text-muted-foreground">
                Tap the clubs you are actively a part of at SST:
              </p>
              <div className="flex flex-wrap gap-2">
                {CLUBS.map((club) => {
                  const active = clubs.includes(club);
                  return (
                    <button
                      key={club}
                      type="button"
                      onClick={() => toggleClub(club)}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${active
                          ? "border-primary bg-primary/20 text-primary shadow-sm"
                          : "border-border bg-card/80 text-foreground/80 hover:bg-secondary"
                        }`}
                    >
                      {active && <Check className="h-3 w-3" />}
                      <span>{club}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 5: Hobbies & Personal Interests */}
            <div className="rounded-3xl border border-border bg-card/60 p-5 backdrop-blur-md space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-accent-foreground flex items-center gap-1.5">
                <Heart className="h-4 w-4 text-accent" />
                5. Hobbies & Personal Interests
              </h3>
              <p className="text-xs text-muted-foreground">
                What are you looking to participate in? (e.g.{" "}
                <code>Eager to participate in Hackathons</code>, <code>Cricket Player</code>,{" "}
                <code>Competitive Programming</code>, <code>Quant Modeling</code>, <code>Open Source</code>).
              </p>
              <TagInput
                tags={interests}
                onChange={setInterests}
                placeholder="Type hobby / interest (e.g. Hackathon Squad, Cricket) + Enter"
                suggestions={[
                  "Hackathon Squad",
                  "Cricket Player",
                  "Competitive Programming",
                  "Quant Modeling",
                  "Open Source",
                  "Badminton",
                  "Chess",
                  "Robotics Prototyping",
                ]}
                tone="accent"
              />
            </div>

            {/* Section 6: Campus Transit & Academics */}
            <div className="rounded-3xl border border-border bg-card/60 p-5 backdrop-blur-md space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Compass className="h-4 w-4" />
                6. Campus Living, Transit & Academics
              </h3>

              <div className="grid gap-4 sm:grid-cols-3">
                {/* Hostel */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Hostel</label>
                  <select
                    value={hostel ?? ""}
                    onChange={(e) => setHostel(e.target.value || null)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-input bg-card px-3 text-xs outline-none"
                  >
                    <option value="">Select hostel…</option>
                    {HOSTELS.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Home State */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Home State</label>
                  <select
                    value={homeState ?? ""}
                    onChange={(e) => setHomeState(e.target.value || null)}
                    className="mt-1.5 h-11 w-full rounded-xl border border-input bg-card px-3 text-xs outline-none"
                  >
                    <option value="">Select state…</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* College Bus Opted */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    College Bus Transit
                  </label>
                  <div className="mt-1.5 flex h-11 items-center gap-2 rounded-xl border border-input bg-card px-3">
                    <Bus className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs flex-1">Opted for College Bus?</span>
                    <button
                      type="button"
                      onClick={() => setBusOpted((v) => !v)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${busOpted
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                        }`}
                    >
                      {busOpted ? "YES" : "NO"}
                    </button>
                  </div>
                </div>
              </div>

              {/* CGPA & Privacy */}
              <div className="pt-2 border-t border-border/50 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Cumulative CGPA (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    placeholder="e.g. 9.42"
                    className="mt-1.5 h-11 w-full rounded-xl border border-input bg-card px-3.5 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    CGPA Visibility
                  </label>
                  <button
                    type="button"
                    onClick={() => setCgpaPublic((v) => !v)}
                    className="mt-1.5 flex h-11 w-full items-center justify-between rounded-xl border border-input bg-card px-3.5 text-xs transition-colors hover:bg-secondary/60"
                  >
                    <span className="flex items-center gap-1.5">
                      {cgpaPublic ? (
                        <Unlock className="h-4 w-4 text-success" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span>
                        {cgpaPublic ? "Public to batchmates" : "Private (Only visible to you)"}
                      </span>
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${cgpaPublic
                          ? "bg-success/15 text-success"
                          : "bg-muted text-muted-foreground"
                        }`}
                    >
                      {cgpaPublic ? "PUBLIC" : "PRIVATE"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Section 7: Social & Portfolio Links */}
            <div className="rounded-3xl border border-border bg-card/60 p-5 backdrop-blur-md space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Globe className="h-4 w-4" />
                7. Social & Portfolio Profiles
              </h3>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Github className="h-3 w-3" /> GitHub URL
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className="mt-1 h-10 w-full rounded-xl border border-input bg-card px-3 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Linkedin className="h-3 w-3" /> LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="mt-1 h-10 w-full rounded-xl border border-input bg-card px-3 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Twitter className="h-3 w-3" /> Twitter / X URL
                  </label>
                  <input
                    type="url"
                    value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    placeholder="https://x.com/username"
                    className="mt-1 h-10 w-full rounded-xl border border-input bg-card px-3 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Globe className="h-3 w-3" /> Personal Portfolio / Website
                  </label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://yourportfolio.dev"
                    className="mt-1 h-10 w-full rounded-xl border border-input bg-card px-3 text-xs outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Action buttons at bottom */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="rounded-xl border border-border px-5 py-2.5 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-50"
                style={{ background: "var(--gradient-brand)" }}
              >
                <Save className="h-4 w-4" />
                <span>{saving ? "Saving Changes…" : "Save Complete Profile"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
