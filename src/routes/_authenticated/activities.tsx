import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Zap,
  Users,
  Calendar,
  Sparkles,
  MessageCircle,
  Hash,
  ArrowRight,
  Compass,
  Plus,
  Pin,
  ExternalLink,
  ShieldCheck,
  Trash2,
  Lock,
  Megaphone,
  X,
  Tag,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { useDirectory, useMyProfile } from "@/hooks/useProfile";
import { useChannels } from "@/hooks/useChat";
import {
  useAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
  type CampusAnnouncement,
} from "@/hooks/useAnnouncements";
import { CLUBS, ROLES, initialsOf } from "@/lib/campus";
import { formatRelativeTime } from "@/components/chat/ChatListItem";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/activities")({
  head: () => ({
    meta: [
      { title: "Campus Activities & Announcements — ScaleX" },
      {
        name: "description",
        content:
          "Official campus announcements, club initiatives, and hackathons across Scaler School of Technology.",
      },
      { property: "og:title", content: "Campus Activities & Announcements — ScaleX" },
      {
        property: "og:description",
        content:
          "Official campus announcements, club initiatives, and hackathons across Scaler School of Technology.",
      },
    ],
  }),
  component: ActivitiesPage,
});

const CATEGORIES = [
  { key: "announcement", label: "📢 Announcement", color: "bg-primary/15 text-primary" },
  { key: "hackathon", label: "🚀 Hackathon", color: "bg-purple-500/15 text-purple-400" },
  { key: "club_event", label: "👥 Club Event", color: "bg-emerald-500/15 text-emerald-400" },
  { key: "workshop", label: "💡 Workshop", color: "bg-amber-500/15 text-amber-400" },
  { key: "sports", label: "⚽ Sports", color: "bg-rose-500/15 text-rose-400" },
  { key: "general", label: "💬 General", color: "bg-secondary text-foreground" },
] as const;

function ActivitiesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: myProfile, user } = useMyProfile();
  const { data: students, isLoading: isDirLoading } = useDirectory();
  const { data: channels, isLoading: isChannelsLoading } = useChannels();
  const { data: announcements, isLoading: isAnnouncementsLoading } = useAnnouncements();

  const createAnnouncement = useCreateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();

  const [selectedClubFilter, setSelectedClubFilter] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("announcement");
  const [selectedClub, setSelectedClub] = useState<string>("");
  const [customRole, setCustomRole] = useState<string>("");
  const [eventDate, setEventDate] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [isPinned, setIsPinned] = useState(false);

  const effectiveTitle = myProfile?.title?.trim() || customRole.trim();

  const totalStudents = (students ?? []).length;
  const clubChannels = (channels ?? []).filter((c) => c.category === "club");
  const academicChannels = (channels ?? []).filter((c) => c.category === "academics");
  const totalChannels = (channels ?? []).length;

  // Filtered announcements
  const filteredAnnouncements = (announcements ?? []).filter((a) => {
    if (selectedClubFilter === "all") return true;
    return a.club_name === selectedClubFilter;
  });

  const handleOpenModal = () => {
    if (myProfile?.title) {
      setCustomRole(myProfile.title);
    }
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Please provide both a title and description.");
      return;
    }

    // If user provided or changed their title, update their profile
    if (user && customRole.trim() && myProfile?.title !== customRole.trim()) {
      await supabase
        .from("profiles")
        .update({ title: customRole.trim() })
        .eq("id", user.id);
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      await queryClient.invalidateQueries({ queryKey: ["directory"] });
    }

    createAnnouncement.mutate(
      {
        title,
        description,
        category,
        club_name: selectedClub || null,
        event_date: eventDate || null,
        link_url: linkUrl || null,
        is_pinned: isPinned,
      },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false);
          setTitle("");
          setDescription("");
          setSelectedClub("");
          setEventDate("");
          setLinkUrl("");
          setIsPinned(false);
        },
      }
    );
  };

  const handleDelete = (announcement: CampusAnnouncement) => {
    if (confirm(`Delete announcement "${announcement.title}"?`)) {
      deleteAnnouncement.mutate(announcement.id);
    }
  };

  return (
    <AppShell>
      <div className="px-4 py-6 lg:px-8 max-w-6xl mx-auto space-y-8">
        {/* Page Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground lg:text-3xl">
              Campus Activities & Announcements
            </h1>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Official announcements, hackathons, and club initiatives across SST.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenModal}
              className="flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-glow transition-transform hover:scale-105"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Plus className="h-4 w-4" />
              <span>Post Announcement</span>
            </button>
          </div>
        </div>

        {/* Real Dynamic Campus Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="glass-panel flex flex-col items-center gap-1 rounded-2xl px-3 py-4 text-center border border-border/80 bg-card/60">
            <span
              className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground shadow-sm"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Users className="h-4 w-4" />
            </span>
            <p className="mt-1 text-xl font-extrabold tracking-tight text-foreground">
              {isDirLoading ? "—" : totalStudents}
            </p>
            <p className="text-[11px] text-muted-foreground font-medium">Verified Students</p>
          </div>

          <div className="glass-panel flex flex-col items-center gap-1 rounded-2xl px-3 py-4 text-center border border-border/80 bg-card/60">
            <span
              className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground shadow-sm"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Sparkles className="h-4 w-4" />
            </span>
            <p className="mt-1 text-xl font-extrabold tracking-tight text-foreground">
              {isChannelsLoading ? "—" : clubChannels.length}
            </p>
            <p className="text-[11px] text-muted-foreground font-medium">Active Club Spaces</p>
          </div>

          <div className="glass-panel flex flex-col items-center gap-1 rounded-2xl px-3 py-4 text-center border border-border/80 bg-card/60">
            <span
              className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground shadow-sm"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Zap className="h-4 w-4" />
            </span>
            <p className="mt-1 text-xl font-extrabold tracking-tight text-foreground">
              {isChannelsLoading ? "—" : academicChannels.length}
            </p>
            <p className="text-[11px] text-muted-foreground font-medium">Academic Tracks</p>
          </div>

          <div className="glass-panel flex flex-col items-center gap-1 rounded-2xl px-3 py-4 text-center border border-border/80 bg-card/60">
            <span
              className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground shadow-sm"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Hash className="h-4 w-4" />
            </span>
            <p className="mt-1 text-xl font-extrabold tracking-tight text-foreground">
              {isChannelsLoading ? "—" : totalChannels}
            </p>
            <p className="text-[11px] text-muted-foreground font-medium">Community Spaces</p>
          </div>
        </div>

        {/* ─── Official Campus Announcements Feed ─── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Official Campus Announcements
              </h2>
            </div>

            {/* Club Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs">
              <button
                onClick={() => setSelectedClubFilter("all")}
                className={`rounded-xl px-2.5 py-1 font-semibold transition-colors shrink-0 ${
                  selectedClubFilter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                All Feed
              </button>
              {CLUBS.map((club) => (
                <button
                  key={club}
                  onClick={() => setSelectedClubFilter(club)}
                  className={`rounded-xl px-2.5 py-1 font-semibold transition-colors shrink-0 ${
                    selectedClubFilter === club
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {club}
                </button>
              ))}
            </div>
          </div>

          {isAnnouncementsLoading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-3xl bg-card" />
              ))}
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className="rounded-3xl border border-border/70 bg-card/40 p-8 text-center space-y-3">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary shadow-sm">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-foreground">
                  {selectedClubFilter === "all"
                    ? "No Announcements Posted Yet"
                    : `No announcements for ${selectedClubFilter} yet`}
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Campus hackathons, club sessions, and faculty updates will appear here once announced by instructors and club leads.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleOpenModal}
                  className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create an Announcement</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredAnnouncements.map((item) => {
                const isCreator = user?.id === item.creator_id;
                const catObj =
                  CATEGORIES.find((c) => c.key === item.category) ?? CATEGORIES[0]!;

                return (
                  <div
                    key={item.id}
                    className={`glass-panel rounded-3xl border p-5 transition-all ${
                      item.is_pinned
                        ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                        : "border-border/80 bg-card/70 hover:border-primary/30"
                    }`}
                  >
                    {/* Top Row: Author Info + Category & Club Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-2xl border border-primary/20 bg-secondary text-xs font-bold">
                          {item.creator?.avatar_url ? (
                            <img
                              src={item.creator.avatar_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            initialsOf(item.creator?.full_name)
                          )}
                        </span>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-foreground truncate">
                              {item.creator?.full_name ?? "Campus Member"}
                            </span>
                            <ShieldCheck className="h-3.5 w-3.5 text-success shrink-0" />

                            {/* Creator Title / Role Badge */}
                            {item.creator?.title && (
                              <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary truncate max-w-[160px]">
                                {item.creator.title.toLowerCase().includes("instructor")
                                  ? "🎓 " + item.creator.title
                                  : "⚡ " + item.creator.title}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            {formatRelativeTime(item.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 shrink-0 justify-end">
                        {item.is_pinned && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                            <Pin className="h-3 w-3 rotate-45" />
                            Pinned
                          </span>
                        )}

                        {item.club_name && (
                          <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                            {item.club_name}
                          </span>
                        )}

                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${catObj.color}`}
                        >
                          {catObj.label}
                        </span>

                        {isCreator && (
                          <button
                            onClick={() => handleDelete(item)}
                            disabled={deleteAnnouncement.isPending}
                            className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-colors ml-1"
                            title="Delete announcement"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Announcement Content */}
                    <div className="mt-3.5 space-y-1.5">
                      <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                      <p className="text-xs text-foreground/85 whitespace-pre-wrap leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Meta Row: Date & Action Link */}
                    {(item.event_date || item.link_url) && (
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/40 text-xs">
                        {item.event_date ? (
                          <span className="inline-flex items-center gap-1 text-muted-foreground font-medium text-[11px]">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            <span>Date / Deadline: </span>
                            <strong className="text-foreground">{item.event_date}</strong>
                          </span>
                        ) : (
                          <span />
                        )}

                        {item.link_url && (
                          <a
                            href={
                              item.link_url.startsWith("http")
                                ? item.link_url
                                : `https://${item.link_url}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-primary hover:underline text-[11px]"
                          >
                            <span>Open Details & Registration</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ─── Active Campus Clubs & Communities ─── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Official SST Clubs & Communities
              </h2>
            </div>
            <Link
              to="/groups"
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <span>View All Spaces</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {isChannelsLoading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl bg-card" />
              ))}
            </div>
          ) : clubChannels.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/40 p-8 text-center">
              <p className="text-sm font-semibold text-foreground">No club spaces created yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Club spaces can be created by campus administrators or requested through community leads.
              </p>
            </div>
          ) : (
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {clubChannels.map((club) => (
                <button
                  key={club.id}
                  onClick={() => navigate({ to: "/groups" })}
                  className="group flex flex-col justify-between rounded-3xl border border-border/80 bg-card/80 p-4 text-left transition-all hover:border-primary/40 hover:bg-card hover:shadow-glow"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-secondary text-lg border border-primary/20 shadow-sm">
                        {club.icon || "👥"}
                      </span>
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                        {club.member_count} {club.member_count === 1 ? "member" : "members"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {club.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                        {club.description || "Official campus club community space."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-primary pt-2 border-t border-border/40">
                    <span>Open Discussion</span>
                    <MessageCircle className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ─── Create Announcement Modal ─── */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-border bg-popover shadow-2xl">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                  <h2 className="text-base font-bold text-foreground">Post Campus Announcement</h2>
                  <p className="text-xs text-muted-foreground">
                    Publish an official notice, club event, or hackathon
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Role / Position Section */}
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-primary flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Your Role / Position (Optional)</span>
                    </label>
                    <span className="text-[10px] text-muted-foreground">
                      {myProfile?.title ? `Profile: ${myProfile.title}` : "e.g. Instructor, VP, Student"}
                    </span>
                  </div>

                  <input
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="e.g. Instructor, VP of AI Club, Lead Organizer, Student"
                    className="h-10 w-full rounded-xl border border-input bg-card px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                  />

                  {/* Preset quick buttons */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {ROLES.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setCustomRole(role)}
                        className={`rounded-lg border px-2 py-0.5 text-[10px] transition-colors ${
                          customRole === role
                            ? "border-primary bg-primary/25 text-primary font-bold shadow-sm"
                            : "border-border/70 bg-card/80 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {role === "Instructor" ? "🎓 " + role : role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Announcement Title */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Announcement Title <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. AI Hackathon 2026 — Registrations Open!"
                    required
                    className="mt-1.5 h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Associated Club */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Associated Club (Optional)
                  </label>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedClub("")}
                      className={`rounded-xl border px-2.5 py-1 text-xs transition-all ${
                        selectedClub === ""
                          ? "border-primary bg-primary/15 text-primary font-bold shadow-sm"
                          : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      🌐 Campus-wide
                    </button>
                    {CLUBS.map((club) => (
                      <button
                        key={club}
                        type="button"
                        onClick={() => setSelectedClub(club)}
                        className={`rounded-xl border px-2.5 py-1 text-xs transition-all ${
                          selectedClub === club
                            ? "border-primary bg-primary/15 text-primary font-bold shadow-sm"
                            : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {club}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Category</label>
                  <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setCategory(cat.key)}
                        className={`rounded-xl border p-2 text-xs text-left transition-all ${
                          category === cat.key
                            ? "border-primary bg-primary/15 font-bold text-primary shadow-sm ring-1 ring-primary/30"
                            : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">
                    Description / Details <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Share all relevant event dates, eligibility, team size, venue, and participation details…"
                    required
                    className="mt-1.5 w-full rounded-xl border border-input bg-card p-3 text-xs outline-none focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed"
                  />
                </div>

                {/* Date & Link */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">
                      Date / Deadline (Optional)
                    </label>
                    <input
                      type="text"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      placeholder="e.g. Sep 15, 2026 at 7 PM"
                      className="mt-1.5 h-10 w-full rounded-xl border border-input bg-card px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">
                      Link / Form URL (Optional)
                    </label>
                    <input
                      type="text"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="e.g. forms.gle/xyz or hackathon.com"
                      className="mt-1.5 h-10 w-full rounded-xl border border-input bg-card px-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isPinnedCheck"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary/20"
                  />
                  <label htmlFor="isPinnedCheck" className="text-xs font-medium text-foreground cursor-pointer">
                    Pin this announcement to the top of the feed
                  </label>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createAnnouncement.isPending || !title.trim() || !description.trim()}
                    className="rounded-xl px-5 py-2 text-xs font-bold text-primary-foreground shadow-glow disabled:opacity-50"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    {createAnnouncement.isPending ? "Posting…" : "Publish Announcement"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
