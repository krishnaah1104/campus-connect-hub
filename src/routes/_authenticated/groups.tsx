import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Hash,
  Info,
  Pin,
  Plus,
  Send,
  ShieldCheck,
  Trash2,
  Users,
  UsersRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { ChatEmptyState } from "@/components/chat/ChatEmptyState";
import { ChatListItem, formatRelativeTime } from "@/components/chat/ChatListItem";
import { ChatSearchBar } from "@/components/chat/ChatSearchBar";
import { CreateChannelModal } from "@/components/chat/CreateChannelModal";
import { useDirectory, useMyProfile } from "@/hooks/useProfile";
import { useIsAdmin } from "@/hooks/useAdmin";
import {
  useChannels,
  useChannelMessages,
  useDeleteChannel,
  useSendChannelMessage,
  useToggleReaction,
  type Channel,
  type ChannelMessage,
} from "@/hooks/useChat";
import { initialsOf } from "@/lib/campus";

export const Route = createFileRoute("/_authenticated/groups")({
  head: () => ({
    meta: [
      { title: "Group Channels — ScaleX" },
      {
        name: "description",
        content: "Auto-enrolled batch, hostel, club and project channels for SST students.",
      },
      { property: "og:title", content: "Group Channels — ScaleX" },
      {
        property: "og:description",
        content: "Auto-enrolled batch, hostel, club and project channels for SST students.",
      },
    ],
  }),
  component: GroupsRoute,
});

const CATEGORIES = [
  { key: "all", label: "All Channels" },
  { key: "batch", label: "🎓 Batch" },
  { key: "hostel", label: "🏢 Hostels" },
  { key: "club", label: "👥 Clubs" },
  { key: "academics", label: "⚡ Academics" },
  { key: "general", label: "💬 General" },
] as const;

const REACTION_PALETTE = ["👍", "🔥", "🚀", "🧠", "🎉", "❤️"];

function GroupsRoute() {
  const { data: myProfile, user } = useMyProfile();
  const { data: directoryStudents } = useDirectory();
  const { isAdmin } = useIsAdmin();

  // Supabase-backed state
  const { data: channels, isLoading: isChannelsLoading } = useChannels();
  const sendChannelMessage = useSendChannelMessage();
  const toggleReaction = useToggleReaction();
  const deleteChannel = useDeleteChannel();

  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [messageInput, setMessageInput] = useState("");
  const [showChannelInfo, setShowChannelInfo] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Messages for the active channel
  const { data: channelMessages, isLoading: isMessagesLoading } =
    useChannelMessages(selectedChannelId);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-select first channel on initial load
  useEffect(() => {
    if (!selectedChannelId && channels && channels.length > 0) {
      setSelectedChannelId(channels[0].id);
    }
  }, [channels, selectedChannelId]);

  const activeChannel = useMemo((): Channel | null => {
    if (!selectedChannelId || !channels) return null;
    return channels.find((c) => c.id === selectedChannelId) ?? null;
  }, [channels, selectedChannelId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [channelMessages?.length]);

  // Filter channels
  const filteredChannels = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (channels ?? []).filter((c) => {
      if (activeCategory !== "all" && c.category !== activeCategory) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q) ||
        c.category_label.toLowerCase().includes(q)
      );
    });
  }, [channels, search, activeCategory]);

  // ── Handlers ────────────────────────────────────────────

  const handleSendMessage = () => {
    const text = messageInput.trim();
    if (!text || !selectedChannelId) return;

    sendChannelMessage.mutate(
      { channelId: selectedChannelId, content: text },
      {
        onError: () => toast.error("Message failed to send."),
      }
    );

    setMessageInput("");
  };

  const handleReaction = (msg: ChannelMessage, emoji: string) => {
    toggleReaction.mutate({
      messageId: msg.id,
      channelId: msg.channel_id,
      emoji,
      currentReactions: msg.reactions,
    });
  };

  const handleBackToList = () => {
    setSelectedChannelId(null);
    setShowChannelInfo(false);
  };

  // ── Render ──────────────────────────────────────────────

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-73px-60px)] lg:h-[calc(100vh-73px)] w-full overflow-hidden bg-surface-deep">

        {/* ─── Left Pane: Channel List ─── */}
        <aside
          className={`flex h-full w-full flex-col border-r border-border bg-card/40 lg:w-96 lg:shrink-0 ${
            selectedChannelId ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/80 px-4 py-3.5">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Group Channels</h1>
              <p className="text-xs text-muted-foreground">
                Auto-enrolled campus communities
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin ? (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-glow transition-transform hover:scale-105"
                  style={{ background: "var(--gradient-brand)" }}
                  title="Create a new campus group space (Admin)"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>New Space</span>
                </button>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  <Users className="h-3.5 w-3.5" />
                  <span>{(channels ?? []).length} Spaces</span>
                </span>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="px-3 pt-3">
            <ChatSearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search channels, topics..."
            />
          </div>

          {/* Category Pills */}
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-3 pt-3 pb-2 border-b border-border/40">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`shrink-0 rounded-lg px-2.5 py-1 text-xs transition-colors ${
                  activeCategory === cat.key
                    ? "bg-primary/15 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Channel List */}
          <div className="flex-1 overflow-y-auto">
            {isChannelsLoading ? (
              <div className="space-y-1 p-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-[72px] animate-pulse rounded-xl bg-card" />
                ))}
              </div>
            ) : filteredChannels.length === 0 ? (
              <div className="p-4">
                <ChatEmptyState
                  icon={UsersRound}
                  message="No channels found matching your search."
                />
              </div>
            ) : (
              <div>
                {filteredChannels.map((channel) => {
                  const isSelected = channel.id === selectedChannelId;
                  return (
                    <div
                      key={channel.id}
                      className={isSelected ? "bg-primary/10 border-l-2 border-primary" : ""}
                    >
                      <ChatListItem
                        name={channel.name}
                        subtitle={`${channel.member_count} students · ${channel.category_label}`}
                        lastMessage={channel.description}
                        isGroup
                        onClick={() => setSelectedChannelId(channel.id)}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* ─── Right Pane: Active Channel ─── */}
        <main
          className={`flex h-full flex-1 flex-col bg-surface-deep ${
            !selectedChannelId ? "hidden lg:flex" : "flex"
          }`}
        >
          {activeChannel ? (
            <div className="flex h-full flex-col">
              {/* Channel Header */}
              <div className="flex items-center justify-between border-b border-border/80 bg-card/60 px-4 py-3 backdrop-blur-md">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={handleBackToList}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-border text-foreground transition-colors hover:bg-secondary lg:hidden"
                    aria-label="Back to channels"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-bold text-primary-foreground"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    {activeChannel.icon ? (
                      <span className="text-lg">{activeChannel.icon}</span>
                    ) : (
                      <Hash className="h-5 w-5" />
                    )}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-bold text-foreground">
                        {activeChannel.name}
                      </span>
                      <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground/80">
                        {activeChannel.category_label}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {activeChannel.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground mr-2">
                    <Users className="h-3.5 w-3.5" />
                    {activeChannel.member_count} members
                  </span>
                  <button
                    onClick={() => setShowChannelInfo((v) => !v)}
                    className={`grid h-8 w-8 place-items-center rounded-lg border border-border/60 transition-colors ${
                      showChannelInfo
                        ? "bg-primary/20 text-primary border-primary/40"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                    title="Channel info"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Pinned Notice */}
              {activeChannel.pinned_notice && (
                <div className="flex items-center gap-2.5 bg-primary/10 border-b border-primary/20 px-4 py-2 text-xs text-foreground">
                  <Pin className="h-3.5 w-3.5 text-primary shrink-0 rotate-45" />
                  <span className="font-semibold text-primary shrink-0">Pinned:</span>
                  <p className="truncate text-foreground/90">{activeChannel.pinned_notice}</p>
                </div>
              )}

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Channel Welcome */}
                <div className="rounded-2xl border border-border/60 bg-card/40 p-5 text-center my-4">
                  <div
                    className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-2xl text-primary-foreground"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    {activeChannel.icon ? (
                      <span className="text-xl">{activeChannel.icon}</span>
                    ) : (
                      <Hash className="h-6 w-6" />
                    )}
                  </div>
                  <h3 className="text-base font-bold text-foreground">
                    Welcome to {activeChannel.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
                    {activeChannel.description ||
                      `This is the verified SST campus space for ${activeChannel.category_label}.`}
                  </p>
                </div>

                {isMessagesLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="h-9 w-9 animate-pulse rounded-full bg-card" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-24 animate-pulse rounded bg-card" />
                          <div className="h-10 w-3/4 animate-pulse rounded-xl bg-card" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  (channelMessages ?? []).map((msg) => (
                    <div key={msg.id} className="flex gap-3 group">
                      <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-primary/25 bg-secondary text-xs font-bold">
                        {msg.sender?.avatar_url ? (
                          <img
                            src={msg.sender.avatar_url}
                            alt={msg.sender.full_name ?? ""}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          initialsOf(msg.sender?.full_name)
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">
                            {msg.sender?.full_name ?? "Student"}
                          </span>
                          {msg.sender?.batch && (
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                              {msg.sender.batch}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {formatRelativeTime(msg.created_at)}
                          </span>
                        </div>

                        <div className="mt-1 rounded-2xl rounded-tl-none border border-border/40 bg-card/70 px-4 py-2.5 text-sm text-foreground/90 inline-block max-w-xl">
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>

                        {/* Reactions */}
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          {Object.entries(msg.reactions || {}).map(([emoji, count]) => (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(msg, emoji)}
                              className="flex items-center gap-1 rounded-full border border-border bg-card/60 px-2 py-0.5 text-[11px] hover:border-primary/50 transition-colors"
                            >
                              <span>{emoji}</span>
                              <span className="text-[10px] font-semibold text-muted-foreground">
                                {count as number}
                              </span>
                            </button>
                          ))}
                          {/* Quick reaction picker (visible on hover) */}
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {REACTION_PALETTE.filter(
                              (e) => !Object.keys(msg.reactions || {}).includes(e)
                            )
                              .slice(0, 3)
                              .map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleReaction(msg, emoji)}
                                  className="rounded-full border border-border/40 bg-card/40 px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                                  title={`React with ${emoji}`}
                                >
                                  {emoji}
                                </button>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t border-border bg-card/80 p-3 backdrop-blur-md">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={`Message ${activeChannel.name}…`}
                    className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-card px-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
                    disabled={sendChannelMessage.isPending}
                  />

                  <button
                    type="submit"
                    disabled={!messageInput.trim() || sendChannelMessage.isPending}
                    className="grid h-11 w-11 place-items-center rounded-xl text-primary-foreground transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    style={{ background: "var(--gradient-brand)" }}
                    aria-label="Send message"
                  >
                    <Send className="h-4.5 w-4.5" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="grid h-full place-items-center p-6 text-center">
              <ChatEmptyState
                icon={UsersRound}
                message="Select a channel from the list to view conversations and participate."
              />
            </div>
          )}
        </main>

        {/* ─── Channel Info Sidebar ─── */}
        {showChannelInfo && activeChannel && (
          <aside className="w-80 border-l border-border bg-card/40 p-4 overflow-y-auto hidden xl:block">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <p className="text-sm font-bold">Channel Details</p>
              <button
                onClick={() => setShowChannelInfo(false)}
                className="grid h-6 w-6 place-items-center rounded hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <p className="font-semibold uppercase tracking-wider text-muted-foreground">
                  About
                </p>
                <p className="mt-1 text-foreground/90">
                  {activeChannel.description}
                </p>
              </div>

              <div>
                <p className="font-semibold uppercase tracking-wider text-muted-foreground">
                  Members
                </p>
                <p className="mt-1 text-foreground/90 font-medium">
                  {activeChannel.member_count} enrolled students
                </p>
              </div>

              <div>
                <p className="font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Active in this space
                </p>
                <div className="space-y-2">
                  {(directoryStudents ?? []).slice(0, 8).map((student) => (
                    <div key={student.id} className="flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-secondary text-[10px] font-bold overflow-hidden">
                        {student.avatar_url ? (
                          <img
                            src={student.avatar_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          initialsOf(student.full_name)
                        )}
                      </span>
                      <span className="truncate font-medium text-foreground">
                        {student.full_name}
                      </span>
                      <span className="ml-auto text-[10px] text-muted-foreground">
                        {student.batch}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Moderation Actions */}
              {isAdmin && (
                <div className="pt-3 border-t border-border/80">
                  <p className="font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1 text-[10px]">
                    <ShieldCheck className="h-3 w-3 text-primary" /> Admin Controls
                  </p>
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Are you sure you want to delete the space "${activeChannel.name}"? This action cannot be undone.`
                        )
                      ) {
                        deleteChannel.mutate(activeChannel.id, {
                          onSuccess: () => {
                            toast.success(`Space "${activeChannel.name}" deleted.`);
                            setSelectedChannelId(null);
                          },
                          onError: () => toast.error("Failed to delete channel."),
                        });
                      }
                    }}
                    disabled={deleteChannel.isPending}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{deleteChannel.isPending ? "Deleting…" : "Delete Space"}</span>
                  </button>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Admin Create Channel Modal */}
      <CreateChannelModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onChannelCreated={(newCh) => setSelectedChannelId(newCh.id)}
      />
    </AppShell>
  );
}

