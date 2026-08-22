import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCheck,
  Compass,
  MessageCircle,
  MessageSquarePlus,
  Paperclip,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { ChatEmptyState } from "@/components/chat/ChatEmptyState";
import { ChatListItem, formatRelativeTime } from "@/components/chat/ChatListItem";
import { ChatSearchBar } from "@/components/chat/ChatSearchBar";
import { useDirectory, useMyProfile, type Profile } from "@/hooks/useProfile";
import {
  useConversations,
  useDirectMessages,
  useSendDirectMessage,
  useStartConversation,
  useMarkMessagesRead,
  type Conversation,
  type DirectMessage,
} from "@/hooks/useChat";
import { initialsOf } from "@/lib/campus";

interface SearchParams {
  peer?: string;
}

export const Route = createFileRoute("/_authenticated/chat")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    peer: typeof search.peer === "string" ? search.peer : undefined,
  }),
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

const QUICK_PROMPTS = [
  "👋 Hey! Free to connect?",
  "🚀 Want to team up for the Hackathon?",
  "📚 Have doubts in DSA / System Design?",
  "🏢 Are you at Uniworld hostel?",
];

function ChatRoute() {
  const { peer: peerQuery } = Route.useSearch();
  const navigate = useNavigate();
  const { data: myProfile, user } = useMyProfile();
  const { data: directoryStudents, isLoading: isDirLoading } = useDirectory();

  // Supabase-backed state
  const { data: conversations, isLoading: isConversationsLoading } = useConversations();
  const startConversation = useStartConversation();
  const markRead = useMarkMessagesRead();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [selectedPeerId, setSelectedPeerId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [newMessageText, setNewMessageText] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [peerSearchQuery, setPeerSearchQuery] = useState("");

  // Messages for the active conversation
  const { data: messages } = useDirectMessages(activeConversationId);
  const sendMessage = useSendDirectMessage();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle deep-link: ?peer=<userId>
  useEffect(() => {
    if (!peerQuery || !user) return;

    setSelectedPeerId(peerQuery);

    // Find existing conversation with this peer or create one
    const existing = conversations?.find(
      (c) => c.peer?.id === peerQuery
    );

    if (existing) {
      setActiveConversationId(existing.id);
    } else {
      startConversation.mutate(peerQuery, {
        onSuccess: (convId) => {
          setActiveConversationId(convId);
        },
        onError: () => {
          toast.error("Couldn't start conversation. Try again.");
        },
      });
    }
  }, [peerQuery, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mark messages as read when viewing a conversation
  useEffect(() => {
    if (activeConversationId) {
      markRead(activeConversationId);
    }
  }, [activeConversationId, messages?.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Resolve the active conversation's peer profile
  const activePeer = useMemo((): Profile | null => {
    if (!activeConversationId || !conversations) return null;
    const conv = conversations.find((c) => c.id === activeConversationId);
    if (conv?.peer) return conv.peer;

    // Fallback: look up the peer from directory
    if (selectedPeerId && directoryStudents) {
      return directoryStudents.find((s) => s.id === selectedPeerId) ?? null;
    }
    return null;
  }, [activeConversationId, conversations, selectedPeerId, directoryStudents]);

  const peerSubtitle = useMemo(() => {
    if (!activePeer) return "";
    return [activePeer.batch, activePeer.degree, activePeer.course, activePeer.hostel]
      .filter(Boolean)
      .join(" · ");
  }, [activePeer]);

  // Scroll to bottom of message list on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  // Filter conversations by search + tab
  const filteredConversations = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (conversations ?? []).filter((c) => {
      if (activeTab === "unread" && (c.unread_count ?? 0) === 0) return false;
      if (!q) return true;
      const hay = [
        c.peer?.full_name,
        c.peer?.batch,
        c.peer?.hostel,
        c.last_message_text,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [conversations, search, activeTab]);

  // Filter directory for new chat modal
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

  // ── Handlers ──────────────────────────────────────────────

  const handleSendMessage = (textOverride?: string) => {
    const text = (textOverride || newMessageText).trim();
    if (!text || !activeConversationId) return;

    sendMessage.mutate(
      { conversationId: activeConversationId, content: text },
      {
        onError: () => toast.error("Message failed to send. Try again."),
      }
    );

    setNewMessageText("");
  };

  const handleSelectConversation = (conv: Conversation) => {
    setActiveConversationId(conv.id);
    setSelectedPeerId(conv.peer?.id ?? null);
    markRead(conv.id);
  };

  const handleStartChatWithStudent = (student: Profile) => {
    setShowNewChatModal(false);
    setSelectedPeerId(student.id);

    // Check if conversation already exists
    const existing = conversations?.find((c) => c.peer?.id === student.id);
    if (existing) {
      setActiveConversationId(existing.id);
      return;
    }

    // Create a new conversation via RPC
    startConversation.mutate(student.id, {
      onSuccess: (convId) => {
        setActiveConversationId(convId);
      },
      onError: () => toast.error("Couldn't start conversation."),
    });
  };

  const handleBackToList = () => {
    setActiveConversationId(null);
    setSelectedPeerId(null);
  };

  // ── Render ────────────────────────────────────────────────

  const totalUnread = (conversations ?? []).reduce((s, c) => s + (c.unread_count ?? 0), 0);

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-73px-60px)] lg:h-[calc(100vh-73px)] w-full overflow-hidden bg-surface-deep">

        {/* ─── Left Pane: Conversation List ─── */}
        <aside
          className={`flex h-full w-full flex-col border-r border-border bg-card/40 lg:w-96 lg:shrink-0 ${
            activeConversationId ? "hidden lg:flex" : "flex"
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

          {/* Search */}
          <div className="px-3 pt-3">
            <ChatSearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search chats, batchmates..."
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1.5 px-3 pt-3 pb-2 text-xs font-medium border-b border-border/40">
            <button
              onClick={() => setActiveTab("all")}
              className={`rounded-lg px-2.5 py-1 transition-colors ${
                activeTab === "all"
                  ? "bg-primary/15 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({(conversations ?? []).length})
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={`rounded-lg px-2.5 py-1 transition-colors ${
                activeTab === "unread"
                  ? "bg-primary/15 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Unread ({totalUnread})
            </button>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="ml-auto flex items-center gap-1 text-[11px] text-primary hover:underline"
            >
              <Compass className="h-3 w-3" />
              Browse Peers
            </button>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {isConversationsLoading ? (
              <div className="space-y-1 p-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-[72px] animate-pulse rounded-xl bg-card" />
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
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
                {filteredConversations.map((conv) => {
                  const isSelected = conv.id === activeConversationId;
                  return (
                    <div
                      key={conv.id}
                      className={isSelected ? "bg-primary/10 border-l-2 border-primary" : ""}
                    >
                      <ChatListItem
                        name={conv.peer?.full_name || "Campus Student"}
                        subtitle={
                          [conv.peer?.batch, conv.peer?.degree, conv.peer?.hostel]
                            .filter(Boolean)
                            .join(" · ")
                        }
                        lastMessage={conv.last_message_text}
                        lastMessageAt={conv.last_message_at}
                        unreadCount={conv.unread_count ?? 0}
                        onClick={() => handleSelectConversation(conv)}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* ─── Right Pane: Active Conversation ─── */}
        <main
          className={`flex h-full flex-1 flex-col bg-surface-deep ${
            !activeConversationId ? "hidden lg:flex" : "flex"
          }`}
        >
          {activeConversationId && activePeer ? (
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/80 bg-card/60 px-4 py-3 backdrop-blur-md">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={handleBackToList}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-border text-foreground transition-colors hover:bg-secondary lg:hidden"
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-primary/30 bg-secondary text-sm font-bold">
                    {activePeer.avatar_url ? (
                      <img
                        src={activePeer.avatar_url}
                        alt={activePeer.full_name ?? ""}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      initialsOf(activePeer.full_name)
                    )}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-bold text-foreground">
                        {activePeer.full_name}
                      </span>
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-success/10 px-1.5 py-0.5 text-[10px] font-medium text-success">
                        <ShieldCheck className="h-3 w-3" />
                        Verified
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {peerSubtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toast("Voice calls are coming soon.")}
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

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Security badge */}
                <div className="flex justify-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/60 px-3 py-1 text-[11px] text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-success" />
                    Verified communication within SST campus network.
                  </span>
                </div>

                {(!messages || messages.length === 0) ? (
                  <div className="py-12 text-center">
                    <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-semibold">Start the conversation</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Say hello to {activePeer.full_name?.split(" ")[0]}! Tap any quick starter below:
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
                  messages.map((msg) => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-md rounded-2xl px-4 py-2.5 text-sm ${
                            isMe
                              ? "bg-primary text-primary-foreground rounded-br-sm shadow-md"
                              : "glass-panel bg-card/90 text-foreground rounded-bl-sm"
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          <div
                            className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                              isMe ? "text-primary-foreground/75" : "text-muted-foreground"
                            }`}
                          >
                            <span>{formatRelativeTime(msg.created_at)}</span>
                            {isMe && (
                              <CheckCheck
                                className={`h-3 w-3 ${
                                  msg.read_at ? "text-primary-foreground" : "text-primary-foreground/50"
                                }`}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts */}
              {messages && messages.length > 0 && (
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

              {/* Input */}
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
                    onClick={() => toast("Attachments coming soon.")}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    title="Attach file"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>

                  <input
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    placeholder={`Message ${activePeer.full_name?.split(" ")[0] ?? "student"}…`}
                    className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-card px-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-ring"
                    disabled={sendMessage.isPending}
                  />

                  <button
                    type="submit"
                    disabled={!newMessageText.trim() || sendMessage.isPending}
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
            /* Empty state — no conversation selected */
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

      {/* ─── New Chat Modal ─── */}
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
                    onClick={() => handleStartChatWithStudent(student)}
                    disabled={startConversation.isPending}
                    className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors hover:bg-secondary/70 disabled:opacity-60"
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
                        {[student.batch, student.degree, student.hostel]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                      {student.skills && student.skills.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {student.skills.slice(0, 3).map((sk) => (
                            <span
                              key={sk}
                              className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary"
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
