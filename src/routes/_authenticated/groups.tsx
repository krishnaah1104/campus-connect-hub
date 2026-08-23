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
      setSelectedChannelId(channels[0]!.id);
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
    if (!messageInput.trim() || !selectedChannelId) return;

    sendChannelMessage.mutate(
      {
        channelId: selectedChannelId,
        content: messageInput.trim(),
      },
      {
        onError: () => toast.error("Failed to send message."),
      }
    );

    setMessageInput("");
  };

  const handleReaction = (msg: ChannelMessage, emoji: string) => {
    if (!user) return;
    toggleReaction.mutate({
      messageId: msg.id,
      channelId: msg.channel_id,
      emoji,
      userId: user.id,
      currentReactions: msg.reactions || {},
    });
  };

  const handleBackToList = () => {
    setSelectedChannelId(null);
    setShowChannelInfo(false);
  };

  const handleDeleteChannel = (channel: Channel) => {
    if (
      confirm(
        `Are you sure you want to delete "${channel.name}"? All messages will be permanently lost.`
      )
    ) {
      deleteChannel.mutate(channel.id, {
        onSuccess: () => {
          setSelectedChannelId(null);
          setShowChannelInfo(false);
        },
      });
    }
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
            <h1 className="text-xl font-bold tracking-tight text-foreground">Group Channels</h1>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-glow transition-transform hover:scale-105"
                  style={{ background: "var(--gradient-brand)" }}
                  title="Create a new campus group space (Admin)"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>New Space</span>
                </button>
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
          <div className="flex-1 overflow-y-auto px-2 py-1">
            {isChannelsLoading ? (
              <div className="space-y-1 p-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-card" />
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
              <div className="space-y-0.5">
                {filteredChannels.map((channel) => {
                  const isSelected = channel.id === selectedChannelId;
                  const defaultIcon =
                    channel.category === "batch"
                      ? "🎓"
                      : channel.category === "hostel"
                      ? "🏢"
                      : channel.category === "club"
                      ? "👥"
                      : "💬";
                  return (
                    <ChatListItem
                      key={channel.id}
                      name={channel.name}
                      icon={channel.icon || defaultIcon}
                      subtitle={`${channel.member_count} students · ${channel.category_label}`}
                      lastMessage={channel.description}
                      isGroup
                      isActive={isSelected}
                      onClick={() => setSelectedChannelId(channel.id)}
                    />
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
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-base font-bold shadow-sm border border-primary/20 bg-secondary"
                  >
                    {activeChannel.icon ? (
                      <span>{activeChannel.icon}</span>
                    ) : (
                      <Hash className="h-5 w-5 text-primary" />
                    )}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-bold text-foreground">
                        {activeChannel.name}
                      </span>
                      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        {activeChannel.category_label}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {activeChannel.description || `${activeChannel.member_count} campus members`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowChannelInfo((v) => !v)}
                    className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  >
                    <Users className="h-3.5 w-3.5 text-primary" />
                    <span>{activeChannel.member_count}</span>
                    <span className="hidden sm:inline">members</span>
                  </button>

                  <button
                    onClick={() => setShowChannelInfo((v) => !v)}
                    className={`grid h-8 w-8 place-items-center rounded-xl border transition-colors ${
                      showChannelInfo
                        ? "bg-primary/20 text-primary border-primary/40"
                        : "border-border/70 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                    title="Channel details"
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
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {/* Channel Welcome */}
                <div className="rounded-3xl border border-border/60 bg-card/40 p-6 text-center my-4 max-w-lg mx-auto shadow-sm">
                  <div
                    className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl text-primary-foreground shadow-sm"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    {activeChannel.icon ? (
                      <span className="text-2xl">{activeChannel.icon}</span>
                    ) : (
                      <Hash className="h-7 w-7" />
                    )}
                  </div>
                  <h3 className="text-base font-bold text-foreground">
                    Welcome to #{activeChannel.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {activeChannel.description ||
                      `This is the verified SST campus space for ${activeChannel.category_label}. Join the conversation!`}
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
                  (channelMessages ?? []).map((msg, index, arr) => {
                    const prevMsg = index > 0 ? arr[index - 1] : null;
                    const isSameSenderAsPrev =
                      prevMsg &&
                      prevMsg.sender_id === msg.sender_id &&
                      new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() <
                        5 * 60 * 1000;

                    const isFirstInGroup = !isSameSenderAsPrev;
                    const isMe = msg.sender_id === user?.id;

                    return (
                      <div
                        key={msg.id}
                        className={`group flex items-start gap-3 ${
                          isFirstInGroup ? "mt-4 pt-1" : "mt-0.5"
                        }`}
                      >
                        {/* Avatar Column */}
                        {isFirstInGroup ? (
                          <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-2xl border border-primary/25 bg-secondary text-xs font-bold shadow-sm mt-0.5">
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
                        ) : (
                          <span className="w-9 shrink-0" />
                        )}

                        <div className="min-w-0 flex-1">
                          {/* Sender Info (Only on first message in group) */}
                          {isFirstInGroup && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-foreground">
                                {msg.sender?.full_name ?? "Student"}
                              </span>
                              {msg.sender?.batch && (
                                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                  {msg.sender.batch}
                                </span>
                              )}
                              <span className="text-[10px] text-muted-foreground font-medium">
                                {formatRelativeTime(msg.created_at)}
                              </span>
                            </div>
                          )}

                          {/* Message Bubble */}
                          <div className="flex items-center gap-2">
                            <div
                              className={`rounded-2xl px-4 py-2 text-sm max-w-xl shadow-sm ${
                                isFirstInGroup ? "rounded-tl-none" : ""
                              } ${
                                isMe
                                  ? "bg-primary/15 border border-primary/30 text-foreground"
                                  : "border border-border/60 bg-card/80 text-foreground/90"
                              }`}
                            >
                              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                            </div>

                            {/* Timestamp on hover for grouped consecutive messages */}
                            {!isFirstInGroup && (
                              <span className="text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                                {formatRelativeTime(msg.created_at)}
                              </span>
                            )}
                          </div>

                          {/* Reactions */}
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            {Object.entries(msg.reactions || {}).map(([emoji, count]) => (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(msg, emoji)}
                                className="flex items-center gap-1 rounded-full border border-border bg-card/60 px-2 py-0.5 text-[11px] hover:border-primary/50 transition-colors shadow-sm"
                              >
                                <span>{emoji}</span>
                                <span className="text-[10px] font-semibold text-muted-foreground">
                                  {count as number}
                                </span>
                              </button>
                            ))}

                            {/* Quick reaction picker on hover */}
                            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {REACTION_PALETTE.filter(
                                (e) => !Object.keys(msg.reactions || {}).includes(e)
                              )
                                .slice(0, 3)
                                .map((emoji) => (
                                  <button
                                    key={emoji}
                                    onClick={() => handleReaction(msg, emoji)}
                                    className="rounded-full border border-border/40 bg-card/60 px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                    title={`React with ${emoji}`}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
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
                    placeholder={`Message #${activeChannel.name}…`}
                    className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-card px-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
                    disabled={sendChannelMessage.isPending}
                  />

                  <button
                    type="submit"
                    disabled={!messageInput.trim() || sendChannelMessage.isPending}
                    className="grid h-11 w-11 place-items-center rounded-xl text-primary-foreground transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-sm"
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
              <p className="text-sm font-bold text-foreground">Channel Details</p>
              <button
                onClick={() => setShowChannelInfo(false)}
                className="grid h-7 w-7 place-items-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <p className="font-semibold uppercase tracking-wider text-muted-foreground">
                  About
                </p>
                <p className="mt-1 text-foreground/90 leading-relaxed">
                  {activeChannel.description || "Campus discussion channel for verified SST students."}
                </p>
              </div>

              <div>
                <p className="font-semibold uppercase tracking-wider text-muted-foreground">
                  Enrolled Students
                </p>
                <p className="mt-1 text-foreground/90 font-medium">
                  {activeChannel.member_count} verified members
                </p>
              </div>

              <div>
                <p className="font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Active Batchmates
                </p>
                <div className="space-y-2">
                  {(directoryStudents ?? []).slice(0, 8).map((student) => (
                    <div key={student.id} className="flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-secondary text-[10px] font-bold overflow-hidden border border-primary/20">
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
                      <div className="min-w-0 flex-1 truncate">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {student.full_name}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {[student.batch, student.hostel].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Channel Moderation */}
              {isAdmin && (
                <div className="pt-4 border-t border-border/60">
                  <button
                    onClick={() => handleDeleteChannel(activeChannel)}
                    disabled={deleteChannel.isPending}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Space (Admin)</span>
                  </button>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* ─── Admin Create Channel Modal ─── */}
        <CreateChannelModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onChannelCreated={(newChan) => {
            setSelectedChannelId(newChan.id);
            toast.success(`Space #${newChan.name} created!`);
          }}
        />
      </div>
    </AppShell>
  );
}
