import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Compass,
  MessageCircle,
  MessageSquarePlus,
  MoreVertical,
  Paperclip,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { ChatEmptyState } from "@/components/chat/ChatEmptyState";
import { ChatListItem, formatRelativeTime } from "@/components/chat/ChatListItem";
import { ChatSearchBar } from "@/components/chat/ChatSearchBar";
import { useDirectory, useMyProfile, type Profile } from "@/hooks/useProfile";
import { initialsOf } from "@/lib/campus";

interface SearchParams {
  peer?: string;
}

export const Route = createFileRoute("/_authenticated/chat")({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      peer: typeof search.peer === "string" ? search.peer : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Direct Messages — ScaleX Connect" },
      {
        name: "description",
        content: "One-on-one instant messaging with verified SST campus batchmates and peers.",
      },
      { property: "og:title", content: "Direct Messages — ScaleX Connect" },
      {
        property: "og:description",
        content: "One-on-one instant messaging with verified SST campus batchmates and peers.",
      },
    ],
  }),
  component: ChatRoute,
});

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
}

interface Thread {
  peerId: string;
  peerName: string;
  peerAvatar?: string | null;
  subtitle: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageAt: string;
  messages: Message[];
}

const DEFAULT_CONVERSATIONS: Thread[] = [
  {
    peerId: "demo-1",
    peerName: "Rahul Sharma",
    subtitle: "2028 · BITS · CS + AI · Uniworld 1",
    unreadCount: 1,
    lastMessage: "Hey! Are you participating in the upcoming AI/ML hackathon this weekend?",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    messages: [
      {
        id: "m1",
        senderId: "demo-1",
        text: "Hey! Saw your profile on the explore directory.",
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        status: "read",
      },
      {
        id: "m2",
        senderId: "me",
        text: "Hey Rahul! Good to connect.",
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        status: "read",
      },
      {
        id: "m3",
        senderId: "demo-1",
        text: "Are you participating in the upcoming AI/ML hackathon this weekend?",
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        status: "read",
      },
    ],
  },
  {
    peerId: "demo-2",
    peerName: "Ananya Iyer",
    subtitle: "2027 · BITS · CS + AI · Uniworld 2",
    unreadCount: 0,
    lastMessage: "Shared the DSA graph traversal notes in the group too!",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    messages: [
      {
        id: "m20",
        senderId: "demo-2",
        text: "Hey! Did you get a chance to check the LeetCode daily problem?",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        status: "read",
      },
      {
        id: "m21",
        senderId: "me",
        text: "Yes, solved it using Dijkstra algorithm!",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5).toISOString(),
        status: "read",
      },
      {
        id: "m22",
        senderId: "demo-2",
        text: "Shared the DSA graph traversal notes in the group too!",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        status: "read",
      },
    ],
  },
  {
    peerId: "demo-3",
    peerName: "Vikram Malhotra",
    subtitle: "2029 · IITM · CS + AI · Day Scholar",
    unreadCount: 0,
    lastMessage: "Let's meet at the library cafeteria after 4 PM.",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    messages: [
      {
        id: "m30",
        senderId: "demo-3",
        text: "Let's meet at the library cafeteria after 4 PM.",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        status: "read",
      },
    ],
  },
];

const QUICK_PROMPTS = [
  "👋 Hey! Free to connect?",
  "🚀 Want to team up for the Hackathon?",
  "📚 Have doubts in DSA / System Design?",
  "🏢 Are you at Uniworld hostel?",
];

function ChatRoute() {
  const { peer: peerQuery } = Route.useSearch();
  const navigate = useNavigate();
  const { data: myProfile } = useMyProfile();
  const { data: directoryStudents, isLoading: isDirLoading } = useDirectory();

  const [threads, setThreads] = useState<Thread[]>(DEFAULT_CONVERSATIONS);
  const [selectedPeerId, setSelectedPeerId] = useState<string | null>(peerQuery ?? null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "peers">("all");
  const [newMessageText, setNewMessageText] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [peerSearchQuery, setPeerSearchQuery] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync peer from query param
  useEffect(() => {
    if (peerQuery) {
      setSelectedPeerId(peerQuery);
    }
  }, [peerQuery]);

  // If a peer from directory is selected but not in threads, create a thread entry
  useEffect(() => {
    if (selectedPeerId && directoryStudents) {
      const existing = threads.find((t) => t.peerId === selectedPeerId);
      if (!existing) {
        const student = directoryStudents.find((s) => s.id === selectedPeerId);
        if (student) {
          const newThread: Thread = {
            peerId: student.id,
            peerName: student.full_name || "Campus Student",
            peerAvatar: student.avatar_url,
            subtitle: [student.batch, student.degree, student.course, student.hostel]
              .filter(Boolean)
              .join(" · "),
            unreadCount: 0,
            lastMessage: "Started a new conversation",
            lastMessageAt: new Date().toISOString(),
            messages: [],
          };
          setThreads((prev) => [newThread, ...prev]);
        }
      }
    }
  }, [selectedPeerId, directoryStudents, threads]);

  const activeThread = useMemo(() => {
    return threads.find((t) => t.peerId === selectedPeerId) || null;
  }, [threads, selectedPeerId]);

  // Scroll to bottom of message list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages]);

  const filteredThreads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return threads.filter((t) => {
      if (activeTab === "unread" && t.unreadCount === 0) return false;
      if (!q) return true;
      return (
        t.peerName.toLowerCase().includes(q) ||
        t.subtitle.toLowerCase().includes(q) ||
        t.lastMessage.toLowerCase().includes(q)
      );
    });
  }, [threads, search, activeTab]);

  const filteredDirectory = useMemo(() => {
    const q = peerSearchQuery.trim().toLowerCase();
    return (directoryStudents ?? []).filter((s) => {
      if (s.id === myProfile?.id) return false;
      if (!q) return true;
      return (
        s.full_name?.toLowerCase().includes(q) ||
        s.batch?.toLowerCase().includes(q) ||
        s.hostel?.toLowerCase().includes(q) ||
        (s.skills ?? []).some((sk) => sk.toLowerCase().includes(q))
      );
    });
  }, [directoryStudents, peerSearchQuery, myProfile]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || newMessageText).trim();
    if (!text || !selectedPeerId) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: "me",
      text,
      timestamp: new Date().toISOString(),
      status: "sent",
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.peerId === selectedPeerId) {
          return {
            ...t,
            lastMessage: text,
            lastMessageAt: new Date().toISOString(),
            messages: [...t.messages, newMsg],
          };
        }
        return t;
      })
    );

    setNewMessageText("");

    // Simulate friendly automatic peer reply after 2 seconds for demo
    if (selectedPeerId.startsWith("demo-")) {
      setTimeout(() => {
        const autoReply: Message = {
          id: `reply-${Date.now()}`,
          senderId: selectedPeerId,
          text: "Got it! Thanks for reaching out. Let's collaborate on this.",
          timestamp: new Date().toISOString(),
          status: "delivered",
        };
        setThreads((prev) =>
          prev.map((t) => {
            if (t.peerId === selectedPeerId) {
              return {
                ...t,
                lastMessage: autoReply.text,
                lastMessageAt: new Date().toISOString(),
                messages: [...t.messages, autoReply],
              };
            }
            return t;
          })
        );
      }, 1500);
    }
  };

  const handleSelectPeer = (peerId: string) => {
    setSelectedPeerId(peerId);
    setThreads((prev) =>
      prev.map((t) => (t.peerId === peerId ? { ...t, unreadCount: 0 } : t))
    );
  };

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-73px-60px)] lg:h-[calc(100vh-73px)] w-full overflow-hidden bg-surface-deep">
        {/* Left pane: Conversation List */}
        <aside
          className={`flex h-full w-full flex-col border-r border-border bg-card/40 lg:w-96 lg:shrink-0 ${
            selectedPeerId ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/80 px-4 py-3.5">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Direct Messages</h1>
              <p className="text-xs text-muted-foreground">
                Verified campus peers & batchmates
              </p>
            </div>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
              title="Start a new message"
            >
              <MessageSquarePlus className="h-4 w-4" />
              <span>New</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="px-3 pt-3">
            <ChatSearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search chats, batchmates..."
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1.5 px-3 pt-3 pb-2 text-xs font-medium border-b border-border/40">
            <button
              onClick={() => setActiveTab("all")}
              className={`rounded-lg px-2.5 py-1 transition-colors ${
                activeTab === "all"
                  ? "bg-primary/15 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({threads.length})
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={`rounded-lg px-2.5 py-1 transition-colors ${
                activeTab === "unread"
                  ? "bg-primary/15 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Unread (
              {threads.filter((t) => t.unreadCount > 0).length})
            </button>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="ml-auto flex items-center gap-1 text-[11px] text-primary hover:underline"
            >
              <Compass className="h-3 w-3" />
              Browse Peers
            </button>
          </div>

          {/* List of active chats */}
          <div className="flex-1 overflow-y-auto">
            {filteredThreads.length === 0 ? (
              <div className="p-4">
                <ChatEmptyState
                  icon={MessageCircle}
                  message={
                    search
                      ? "No conversations match your search."
                      : "No direct messages yet. Start a conversation with any verified student!"
                  }
                />
                {!search && (
                  <div className="mt-2 text-center">
                    <button
                      onClick={() => setShowNewChatModal(true)}
                      className="rounded-xl px-4 py-2 text-xs font-semibold text-primary-foreground"
                      style={{ background: "var(--gradient-brand)" }}
                    >
                      Browse Student Directory
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {filteredThreads.map((thread) => {
                  const isSelected = thread.peerId === selectedPeerId;
                  return (
                    <div
                      key={thread.peerId}
                      className={isSelected ? "bg-primary/10 border-l-2 border-primary" : ""}
                    >
                      <ChatListItem
                        name={thread.peerName}
                        subtitle={thread.subtitle}
                        lastMessage={thread.lastMessage}
                        lastMessageAt={thread.lastMessageAt}
                        unreadCount={thread.unreadCount}
                        onClick={() => handleSelectPeer(thread.peerId)}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* Right pane: Active Conversation or Placeholder */}
        <main
          className={`flex h-full flex-1 flex-col bg-surface-deep ${
            !selectedPeerId ? "hidden lg:flex" : "flex"
          }`}
        >
          {activeThread ? (
            <div className="flex h-full flex-col">
              {/* Conversation Top Header */}
              <div className="flex items-center justify-between border-b border-border/80 bg-card/60 px-4 py-3 backdrop-blur-md">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setSelectedPeerId(null)}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-border text-foreground transition-colors hover:bg-secondary lg:hidden"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-primary/30 bg-secondary text-sm font-bold">
                    {activeThread.peerAvatar ? (
                      <img
                        src={activeThread.peerAvatar}
                        alt={activeThread.peerName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initialsOf(activeThread.peerName)
                    )}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-bold text-foreground">
                        {activeThread.peerName}
                      </span>
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-success/10 px-1.5 py-0.2 text-[10px] font-medium text-success">
                        <ShieldCheck className="h-3 w-3" />
                        Verified
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {activeThread.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toast("Voice calls are coming soon to ScaleX Connect.")}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    title="Audio call"
                  >
                    <Phone className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toast("Video calls are coming soon.")}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    title="Video call"
                  >
                    <Video className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Security encryption pill */}
                <div className="flex justify-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/60 px-3 py-1 text-[11px] text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-success" />
                    Direct end-to-end verified communication within SST campus network.
                  </span>
                </div>

                {activeThread.messages.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold">Start the conversation</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Say hello to {activeThread.peerName}! Tap any quick starter below:
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                      {QUICK_PROMPTS.map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => handleSendMessage(prompt)}
                          className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground/90 transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  activeThread.messages.map((msg) => {
                    const isMe = msg.senderId === "me";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-md rounded-2xl px-4 py-2.5 text-sm ${
                            isMe
                              ? "bg-primary text-primary-foreground rounded-br-xs shadow-md"
                              : "glass-panel bg-card/90 text-foreground rounded-bl-xs"
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                          <div
                            className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                              isMe ? "text-primary-foreground/75" : "text-muted-foreground"
                            }`}
                          >
                            <span>{formatRelativeTime(msg.timestamp)}</span>
                            {isMe && <CheckCheck className="h-3 w-3" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Bar if thread has messages */}
              {activeThread.messages.length > 0 && (
                <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-1.5 bg-card/20 border-t border-border/30">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSendMessage(prompt)}
                      className="shrink-0 rounded-full border border-border/50 bg-card/60 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {/* Message Input Box */}
              <div className="border-t border-border bg-card/80 p-3 backdrop-blur-md">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={() => toast("Attachments are enabled for image and code snippets soon.")}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    title="Attach file or code"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>

                  <input
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    placeholder={`Message ${activeThread.peerName.split(" ")[0]}…`}
                    className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-card px-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
                  />

                  <button
                    type="submit"
                    disabled={!newMessageText.trim()}
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
              <div className="max-w-sm">
                <div
                  className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl text-primary-foreground shadow-glow"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  <MessageCircle className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Your Direct Messages</h2>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Select a student from the list or start a new chat with any classmate from the
                  campus directory.
                </p>
                <div className="mt-6 flex flex-col gap-2">
                  <button
                    onClick={() => setShowNewChatModal(true)}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-primary-foreground"
                    style={{ background: "var(--gradient-brand)" }}
                  >
                    <MessageSquarePlus className="h-4 w-4" />
                    New Conversation
                  </button>
                  <button
                    onClick={() => navigate({ to: "/explore" })}
                    className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary"
                  >
                    <Compass className="h-4 w-4" />
                    Explore Campus Directory
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* New Chat / Directory Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowNewChatModal(false)}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-border bg-popover shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-base font-bold">New Direct Message</h2>
                <p className="text-xs text-muted-foreground">
                  Pick any verified SST student to message
                </p>
              </div>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 border-b border-border/60">
              <ChatSearchBar
                value={peerSearchQuery}
                onChange={setPeerSearchQuery}
                placeholder="Search by name, batch, hostel, or skill..."
              />
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {isDirLoading ? (
                <div className="space-y-2 p-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-xl bg-card" />
                  ))}
                </div>
              ) : filteredDirectory.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm font-semibold">No students found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try another search term or invite batchmates to join.
                  </p>
                </div>
              ) : (
                filteredDirectory.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => {
                      setShowNewChatModal(false);
                      handleSelectPeer(student.id);
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors hover:bg-secondary/70"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-primary/30 bg-secondary text-sm font-bold">
                      {student.avatar_url ? (
                        <img
                          src={student.avatar_url}
                          alt={student.full_name ?? ""}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        initialsOf(student.full_name)
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm truncate">
                          {student.full_name}
                        </span>
                        <ShieldCheck className="h-3.5 w-3.5 text-success shrink-0" />
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {[student.batch, student.degree, student.hostel].filter(Boolean).join(" · ")}
                      </p>
                      {student.skills && student.skills.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {student.skills.slice(0, 3).map((sk) => (
                            <span
                              key={sk}
                              className="rounded-full bg-primary/10 px-2 py-0.2 text-[10px] text-primary"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
