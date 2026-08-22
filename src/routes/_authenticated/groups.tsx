import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Bell,
  Hash,
  Info,
  Layers,
  MessageSquare,
  Pin,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  UsersRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { ChatEmptyState } from "@/components/chat/ChatEmptyState";
import { ChatListItem, formatRelativeTime } from "@/components/chat/ChatListItem";
import { ChatSearchBar } from "@/components/chat/ChatSearchBar";
import { useDirectory, useMyProfile } from "@/hooks/useProfile";
import { initialsOf } from "@/lib/campus";

export const Route = createFileRoute("/_authenticated/groups")({
  head: () => ({
    meta: [
      { title: "Group Channels — ScaleX Connect" },
      {
        name: "description",
        content: "Auto-enrolled batch, hostel, club and project channels for SST students.",
      },
      { property: "og:title", content: "Group Channels — ScaleX Connect" },
      {
        property: "og:description",
        content: "Auto-enrolled batch, hostel, club and project channels for SST students.",
      },
    ],
  }),
  component: GroupsRoute,
});

interface ChannelMessage {
  id: string;
  senderName: string;
  senderAvatar?: string | null;
  senderBatch?: string;
  text: string;
  timestamp: string;
  reactions?: { emoji: string; count: number }[];
}

interface Channel {
  id: string;
  name: string;
  category: "batch" | "hostel" | "club" | "academics" | "general";
  categoryLabel: string;
  topic: string;
  pinnedNotice?: string;
  memberCount: number;
  unreadCount: number;
  lastMessage: string;
  lastMessageAt: string;
  messages: ChannelMessage[];
}

const CHANNELS: Channel[] = [
  {
    id: "batch-2028",
    name: "#batch-2028-official",
    category: "batch",
    categoryLabel: "Batch 2028",
    topic: "Academic updates, schedule announcements, and batchwide discussions",
    pinnedNotice: "Mid-term project review submissions are due on Friday 11:59 PM.",
    memberCount: 240,
    unreadCount: 4,
    lastMessage: "Harsh: Has everyone pushed their assignment pull requests?",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    messages: [
      {
        id: "g1",
        senderName: "Aman Verma",
        senderBatch: "2028",
        text: "Are the labs in Block B open today for the robotics demo?",
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        reactions: [{ emoji: "👍", count: 8 }],
      },
      {
        id: "g2",
        senderName: "Priya Nair",
        senderBatch: "2028",
        text: "Yes, open till 8 PM. TA is also around to help with calibrations.",
        timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        reactions: [{ emoji: "🔥", count: 4 }],
      },
      {
        id: "g3",
        senderName: "Harsh Vardhan",
        senderBatch: "2028",
        text: "Has everyone pushed their assignment pull requests?",
        timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
        reactions: [{ emoji: "🚀", count: 12 }],
      },
    ],
  },
  {
    id: "aiml-club",
    name: "#ai-ml-club",
    category: "club",
    categoryLabel: "AI/ML Club",
    topic: "LLMs, Computer Vision, Kaggle competitions, and weekend paper readings",
    pinnedNotice: "Paper reading on MoE Architectures this Sunday at 7 PM on Discord/Campus Meet.",
    memberCount: 185,
    unreadCount: 2,
    lastMessage: "Ananya: We just released the starter dataset for the campus hackathon!",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    messages: [
      {
        id: "aiml-1",
        senderName: "Devansh Rao",
        senderBatch: "2027",
        text: "Anyone experimenting with local quantization on the lab RTX 4090s?",
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        reactions: [{ emoji: "🤖", count: 6 }],
      },
      {
        id: "aiml-2",
        senderName: "Ananya Iyer",
        senderBatch: "2027",
        text: "We just released the starter dataset for the campus hackathon! Check it out in the drive link.",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        reactions: [
          { emoji: "🎉", count: 15 },
          { emoji: "⚡", count: 9 },
        ],
      },
    ],
  },
  {
    id: "uw1-lounge",
    name: "#uniworld-1-common",
    category: "hostel",
    categoryLabel: "Hostel UW1",
    topic: "Hostel activities, mess menus, weekend movie screenings, and sports",
    pinnedNotice: "Table tennis tournament bracket published in the common room notice board.",
    memberCount: 310,
    unreadCount: 0,
    lastMessage: "Siddharth: Who is up for badminton in court 2 right now?",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    messages: [
      {
        id: "uw-1",
        senderName: "Siddharth Gupta",
        senderBatch: "2028",
        text: "Who is up for badminton in court 2 right now? Need 1 more for doubles.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        reactions: [{ emoji: "🏸", count: 5 }],
      },
    ],
  },
  {
    id: "uw2-lounge",
    name: "#uniworld-2-common",
    category: "hostel",
    categoryLabel: "Hostel UW2",
    topic: "Uniworld 2 hostel community updates, study groups, and announcements",
    pinnedNotice: "Quiet study hours starting from 10 PM on floor 3 lounge.",
    memberCount: 290,
    unreadCount: 0,
    lastMessage: "Kavya: Anyone got a spare Type-C to HDMI adapter for the presentation?",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    messages: [
      {
        id: "uw2-1",
        senderName: "Kavya Sen",
        senderBatch: "2029",
        text: "Anyone got a spare Type-C to HDMI adapter for the presentation?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        reactions: [{ emoji: "🔌", count: 2 }],
      },
    ],
  },
  {
    id: "dsa-interview-prep",
    name: "#dsa-and-interview-prep",
    category: "academics",
    categoryLabel: "DSA & Placements",
    topic: "Daily LeetCode discussions, mock interviews, and system design breakdowns",
    pinnedNotice: "Solving Dynamic Programming & Graph BFS/DFS patterns this week.",
    memberCount: 420,
    unreadCount: 1,
    lastMessage: "Rohan: Discussing today's LeetCode Hard problem (Tree DP) at 6 PM.",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    messages: [
      {
        id: "dsa-1",
        senderName: "Rohan Mukherjee",
        senderBatch: "2027",
        text: "Discussing today's LeetCode Hard problem (Tree DP) at 6 PM. Join the study room if interested!",
        timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
        reactions: [{ emoji: "🧠", count: 18 }],
      },
    ],
  },
  {
    id: "web-dev-club",
    name: "#web-dev-club",
    category: "club",
    categoryLabel: "Web Dev Club",
    topic: "Full-stack development, React, Next.js, Rust, and open source building",
    pinnedNotice: "Next sprint: Building campus tools & open-sourcing SST utility micro-apps.",
    memberCount: 215,
    unreadCount: 0,
    lastMessage: "Tanmay: PR for the updated campus directory component has been merged!",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    messages: [
      {
        id: "web-1",
        senderName: "Tanmay Shah",
        senderBatch: "2028",
        text: "PR for the updated campus directory component has been merged! Big thanks to everyone who reviewed.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        reactions: [{ emoji: "🚀", count: 14 }],
      },
    ],
  },
];

const CATEGORIES = [
  { key: "all", label: "All Channels" },
  { key: "batch", label: "🎓 Batch" },
  { key: "hostel", label: "🏢 Hostels" },
  { key: "club", label: "👥 Clubs" },
  { key: "academics", label: "⚡ Academics" },
] as const;

function GroupsRoute() {
  const { data: myProfile } = useMyProfile();
  const { data: directoryStudents } = useDirectory();

  const [channels, setChannels] = useState<Channel[]>(CHANNELS);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>("batch-2028");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [messageInput, setMessageInput] = useState("");
  const [showChannelInfo, setShowChannelInfo] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChannel = useMemo(() => {
    return channels.find((c) => c.id === selectedChannelId) || channels[0] || null;
  }, [channels, selectedChannelId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChannel?.messages]);

  const filteredChannels = useMemo(() => {
    const q = search.trim().toLowerCase();
    return channels.filter((c) => {
      if (activeCategory !== "all" && c.category !== activeCategory) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.topic.toLowerCase().includes(q) ||
        c.categoryLabel.toLowerCase().includes(q)
      );
    });
  }, [channels, search, activeCategory]);

  const handleSendMessage = () => {
    const text = messageInput.trim();
    if (!text || !activeChannel) return;

    const newMsg: ChannelMessage = {
      id: `cmsg-${Date.now()}`,
      senderName: myProfile?.full_name || "You",
      senderAvatar: myProfile?.avatar_url,
      senderBatch: myProfile?.batch || "Student",
      text,
      timestamp: new Date().toISOString(),
      reactions: [],
    };

    setChannels((prev) =>
      prev.map((c) => {
        if (c.id === activeChannel.id) {
          return {
            ...c,
            lastMessage: `${myProfile?.full_name?.split(" ")[0] || "You"}: ${text}`,
            lastMessageAt: new Date().toISOString(),
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    setMessageInput("");
  };

  const handleAddReaction = (msgId: string, emoji: string) => {
    if (!activeChannel) return;
    setChannels((prev) =>
      prev.map((c) => {
        if (c.id === activeChannel.id) {
          return {
            ...c,
            messages: c.messages.map((m) => {
              if (m.id === msgId) {
                const existing = m.reactions?.find((r) => r.emoji === emoji);
                if (existing) {
                  return {
                    ...m,
                    reactions: m.reactions?.map((r) =>
                      r.emoji === emoji ? { ...r, count: r.count + 1 } : r
                    ),
                  };
                }
                return {
                  ...m,
                  reactions: [...(m.reactions || []), { emoji, count: 1 }],
                };
              }
              return m;
            }),
          };
        }
        return c;
      })
    );
  };

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-73px-60px)] lg:h-[calc(100vh-73px)] w-full overflow-hidden bg-surface-deep">
        {/* Left pane: Channel List */}
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
            <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              <Users className="h-3.5 w-3.5" />
              <span>{channels.length} Spaces</span>
            </span>
          </div>

          {/* Search bar */}
          <div className="px-3 pt-3">
            <ChatSearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search channels, topics..."
            />
          </div>

          {/* Category Filter Pills */}
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-3 pt-3 pb-2 border-b border-border/40">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-xs transition-colors ${
                    active
                      ? "bg-primary/15 text-primary font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Channels list */}
          <div className="flex-1 overflow-y-auto">
            {filteredChannels.length === 0 ? (
              <div className="p-4">
                <ChatEmptyState
                  icon={UsersRound}
                  message="No channels found matching your search."
                />
              </div>
            ) : (
              <div>
                {filteredChannels.map((channel) => {
                  const isSelected = channel.id === activeChannel?.id;
                  return (
                    <div
                      key={channel.id}
                      className={isSelected ? "bg-primary/10 border-l-2 border-primary" : ""}
                    >
                      <ChatListItem
                        name={channel.name}
                        subtitle={`${channel.memberCount} students · ${channel.categoryLabel}`}
                        lastMessage={channel.lastMessage}
                        lastMessageAt={channel.lastMessageAt}
                        unreadCount={channel.unreadCount}
                        isGroup={true}
                        onClick={() => {
                          setSelectedChannelId(channel.id);
                          setChannels((prev) =>
                            prev.map((c) =>
                              c.id === channel.id ? { ...c, unreadCount: 0 } : c
                            )
                          );
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* Right pane: Active Channel Chat View */}
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
                    onClick={() => setSelectedChannelId(null)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-border text-foreground transition-colors hover:bg-secondary lg:hidden"
                    aria-label="Back to channels"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-bold text-primary-foreground"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    <Hash className="h-5 w-5" />
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-bold text-foreground">
                        {activeChannel.name}
                      </span>
                      <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground/80">
                        {activeChannel.categoryLabel}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {activeChannel.topic}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground mr-2">
                    <Users className="h-3.5 w-3.5" />
                    {activeChannel.memberCount} members
                  </span>
                  <button
                    onClick={() => setShowChannelInfo((v) => !v)}
                    className={`grid h-8 w-8 place-items-center rounded-lg border border-border/60 transition-colors ${
                      showChannelInfo
                        ? "bg-primary/20 text-primary border-primary/40"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                    title="Channel Information & Members"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Pinned announcement banner */}
              {activeChannel.pinnedNotice && (
                <div className="flex items-center gap-2.5 bg-primary/10 border-b border-primary/20 px-4 py-2 text-xs text-foreground">
                  <Pin className="h-3.5 w-3.5 text-primary shrink-0 rotate-45" />
                  <span className="font-semibold text-primary shrink-0">Pinned:</span>
                  <p className="truncate text-foreground/90">{activeChannel.pinnedNotice}</p>
                </div>
              )}

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Channel Welcome Hero */}
                <div className="rounded-2xl border border-border/60 bg-card/40 p-5 text-center my-4">
                  <div
                    className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-2xl text-primary-foreground"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    <Hash className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">
                    Welcome to {activeChannel.name}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
                    This is the verified SST campus space for {activeChannel.categoryLabel}. All
                    enrolled batchmates and club members are automatically added here.
                  </p>
                </div>

                {/* Message list */}
                {activeChannel.messages.map((msg) => {
                  const isMe =
                    myProfile?.full_name &&
                    msg.senderName.toLowerCase() === myProfile.full_name.toLowerCase();

                  return (
                    <div key={msg.id} className="flex gap-3 group">
                      <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-primary/25 bg-secondary text-xs font-bold">
                        {msg.senderAvatar ? (
                          <img
                            src={msg.senderAvatar}
                            alt={msg.senderName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          initialsOf(msg.senderName)
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground hover:underline cursor-pointer">
                            {msg.senderName}
                          </span>
                          {msg.senderBatch && (
                            <span className="rounded bg-primary/10 px-1.5 py-0.2 text-[10px] font-medium text-primary">
                              {msg.senderBatch}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {formatRelativeTime(msg.timestamp)}
                          </span>
                        </div>

                        <div className="mt-1 rounded-2xl rounded-tl-none border border-border/40 bg-card/70 px-4 py-2.5 text-sm text-foreground/90 inline-block max-w-xl">
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                        </div>

                        {/* Reaction badges */}
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          {msg.reactions?.map((r) => (
                            <button
                              key={r.emoji}
                              onClick={() => handleAddReaction(msg.id, r.emoji)}
                              className="flex items-center gap-1 rounded-full border border-border bg-card/60 px-2 py-0.5 text-[11px] hover:border-primary/50 transition-colors"
                            >
                              <span>{r.emoji}</span>
                              <span className="text-[10px] font-semibold text-muted-foreground">
                                {r.count}
                              </span>
                            </button>
                          ))}
                          <button
                            onClick={() => handleAddReaction(msg.id, "👍")}
                            className="opacity-0 group-hover:opacity-100 rounded-full border border-border/40 bg-card/40 px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-opacity"
                            title="Add reaction"
                          >
                            + React
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
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
                  />

                  <button
                    type="submit"
                    disabled={!messageInput.trim()}
                    className="grid h-11 w-11 place-items-center rounded-xl text-primary-foreground transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    style={{ background: "var(--gradient-brand)" }}
                    aria-label="Send message to channel"
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
                message="Select any channel from the list to view conversations and participate."
              />
            </div>
          )}
        </main>

        {/* Right Info Drawer (Optional toggled panel) */}
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
                <p className="font-semibold uppercase tracking-wider text-muted-foreground">About</p>
                <p className="mt-1 text-foreground/90">{activeChannel.topic}</p>
              </div>

              <div>
                <p className="font-semibold uppercase tracking-wider text-muted-foreground">Members</p>
                <p className="mt-1 text-foreground/90 font-medium">
                  {activeChannel.memberCount} enrolled students
                </p>
              </div>

              <div>
                <p className="font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Active in this space
                </p>
                <div className="space-y-2">
                  {(directoryStudents ?? []).slice(0, 6).map((student) => (
                    <div key={student.id} className="flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-secondary text-[10px] font-bold">
                        {initialsOf(student.full_name)}
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
            </div>
          </aside>
        )}
      </div>
    </AppShell>
  );
}
