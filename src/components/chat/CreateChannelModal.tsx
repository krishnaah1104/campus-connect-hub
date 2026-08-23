import { useState } from "react";
import {
  Hash,
  Sparkles,
  Users,
  X,
  ShieldCheck,
  Pin,
  Check,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import { useCreateChannel, type Channel } from "@/hooks/useChat";
import { BATCHES, CLUBS, HOSTELS } from "@/lib/campus";

const EMOJI_PRESETS = [
  "🚀",
  "🤖",
  "💻",
  "🎓",
  "🏢",
  "⚡",
  "🎨",
  "🏆",
  "📢",
  "📚",
  "🧠",
  "🔥",
  "⚽",
  "🎵",
  "🌐",
  "💬",
];

const CATEGORIES = [
  { key: "batch", label: "🎓 Batch Channel", desc: "For specific graduating years" },
  { key: "hostel", label: "🏢 Hostel Space", desc: "For Uniworld hostels & resident wings" },
  { key: "club", label: "👥 Club Space", desc: "For technical & cultural campus clubs" },
  { key: "academics", label: "⚡ Academics / Track", desc: "Curriculum, study groups & projects" },
  { key: "general", label: "💬 General Community", desc: "Campus-wide discussions & announcements" },
] as const;

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChannelCreated: (channel: Channel) => void;
}

export function CreateChannelModal({
  isOpen,
  onClose,
  onChannelCreated,
}: CreateChannelModalProps) {
  const createChannel = useCreateChannel();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [customSlug, setCustomSlug] = useState(false);
  const [category, setCategory] = useState<
    "batch" | "hostel" | "club" | "academics" | "general"
  >("general");
  const [description, setDescription] = useState("");
  const [pinnedNotice, setPinnedNotice] = useState("");
  const [icon, setIcon] = useState("💬");
  const [isAutoEnrolled, setIsAutoEnrolled] = useState(true);

  // Dynamic filter state
  const [batchFilter, setBatchFilter] = useState<string>(BATCHES[0]);
  const [hostelFilter, setHostelFilter] = useState<string>(HOSTELS[0]);
  const [clubFilter, setClubFilter] = useState<string>(CLUBS[0]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!customSlug) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanName = name.trim();
    if (!cleanName) {
      toast.error("Please provide a name for the channel.");
      return;
    }

    const cleanSlug = (
      slug.trim() ||
      cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    );

    const categoryLabels: Record<string, string> = {
      batch: `Batch ${batchFilter}`,
      hostel: `${hostelFilter} Hostel`,
      club: `${clubFilter} Club`,
      academics: "Academics",
      general: "General",
    };

    createChannel.mutate(
      {
        name: cleanName,
        slug: cleanSlug,
        description: description.trim() || undefined,
        category,
        category_label: categoryLabels[category],
        pinned_notice: pinnedNotice.trim() || undefined,
        icon: icon.trim() || "💬",
        is_auto_enrolled: isAutoEnrolled,
        batch_filter: category === "batch" ? batchFilter : null,
        hostel_filter: category === "hostel" ? hostelFilter : null,
        club_filter: category === "club" ? clubFilter : null,
      },
      {
        onSuccess: (newChannel) => {
          toast.success(`Group "${newChannel.name}" created successfully! 🎉`);
          onChannelCreated(newChannel);
          onClose();
        },
        onError: (err: any) => {
          toast.error(
            "Failed to create group: " +
              (err?.message ?? "You must be an authorized admin.")
          );
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-border/80 bg-popover shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span
              className="grid h-8 w-8 place-items-center rounded-xl text-primary-foreground"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-extrabold tracking-tight text-foreground">
                  Create Campus Space
                </h2>
                <span className="flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                  <ShieldCheck className="h-3 w-3" />
                  Admin Only
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Provision a verified group channel for SST students
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto p-6 space-y-4">
          {/* Channel Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Space / Group Name <span className="text-primary">*</span>
            </label>
            <div className="flex items-center gap-2">
              {/* Emoji Icon Preview */}
              <div className="relative">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border bg-card text-xl">
                  {icon}
                </span>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. AI/ML Core, Hackathon Squad, Batch 2028"
                className="h-11 flex-1 rounded-xl border border-input bg-card px-3.5 text-sm font-medium text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
          </div>

          {/* Curated Emoji Picker */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Select Icon
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              {EMOJI_PRESETS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`grid h-8 w-8 place-items-center rounded-lg border text-sm transition-transform ${
                    icon === emoji
                      ? "border-primary bg-primary/20 scale-110 shadow-sm"
                      : "border-border/60 bg-card/60 hover:bg-secondary hover:scale-105"
                  }`}
                >
                  {emoji}
                </button>
              ))}
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                maxLength={4}
                placeholder="Custom"
                className="h-8 w-16 rounded-lg border border-input bg-card px-2 text-center text-xs outline-none focus:border-primary/50"
              />
            </div>
          </div>

          {/* Category Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Channel Category
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition-all ${
                    category === cat.key
                      ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary/40"
                      : "border-border bg-card/50 hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="text-xs font-bold text-foreground">
                    {cat.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {cat.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Context-aware Dynamic Filters */}
          {category === "batch" && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3.5 space-y-1.5">
              <label className="text-xs font-semibold text-primary flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Target Batch
              </label>
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="h-9 w-full rounded-xl border border-input bg-card px-3 text-xs font-semibold text-foreground outline-none"
              >
                {BATCHES.map((b) => (
                  <option key={b} value={b}>
                    Batch {b}
                  </option>
                ))}
              </select>
            </div>
          )}

          {category === "hostel" && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3.5 space-y-1.5">
              <label className="text-xs font-semibold text-primary flex items-center gap-1.5">
                🏢 Target Hostel
              </label>
              <select
                value={hostelFilter}
                onChange={(e) => setHostelFilter(e.target.value)}
                className="h-9 w-full rounded-xl border border-input bg-card px-3 text-xs font-semibold text-foreground outline-none"
              >
                {HOSTELS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
          )}

          {category === "club" && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3.5 space-y-1.5">
              <label className="text-xs font-semibold text-primary flex items-center gap-1.5">
                👥 Target Club
              </label>
              <select
                value={clubFilter}
                onChange={(e) => setClubFilter(e.target.value)}
                className="h-9 w-full rounded-xl border border-input bg-card px-3 text-xs font-semibold text-foreground outline-none"
              >
                {CLUBS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What is this channel about? Guidelines, resources, collaboration..."
              className="w-full rounded-xl border border-input bg-card p-3 text-xs text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Pinned Announcement Notice */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Pin className="h-3 w-3 rotate-45" /> Pinned Banner Notice (Optional)
            </label>
            <input
              type="text"
              value={pinnedNotice}
              onChange={(e) => setPinnedNotice(e.target.value)}
              placeholder="e.g. Next squad sync on Discord this Friday at 8 PM"
              className="h-10 w-full rounded-xl border border-input bg-card px-3 text-xs text-foreground outline-none focus:border-primary/50"
            />
          </div>

          {/* Auto-enrollment toggle */}
          <label className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-3 cursor-pointer hover:bg-card">
            <input
              type="checkbox"
              checked={isAutoEnrolled}
              onChange={(e) => setIsAutoEnrolled(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary accent-primary"
            />
            <div className="text-xs">
              <p className="font-semibold text-foreground">
                Auto-enroll matching campus students
              </p>
              <p className="text-[11px] text-muted-foreground">
                Automatically add all students who match this batch, hostel or club filter.
              </p>
            </div>
          </label>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/80">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createChannel.isPending || !name.trim()}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{createChannel.isPending ? "Creating Space…" : "Create Campus Space"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
