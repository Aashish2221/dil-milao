"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, MoreVertical, UserX, ShieldX, Flag, Crown } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import ReportModal from "@/components/ReportModal";

type Message = {
  id: string;
  content: string;
  sender_id: string;
  receiver_id?: string;
  created_at: string;
  is_me?: boolean;
  read?: boolean;
};

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="message-bubble-them px-4 py-3 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-white/40"
            style={{ animation: `typingDot 1.2s ease infinite`, animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const otherUserId = params.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [matchName, setMatchName] = useState("...");
  const [matchPhoto, setMatchPhoto] = useState("");
  const [loading, setLoading] = useState(true);
  const [isOtherOnline, setIsOtherOnline] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [myMsgCount, setMyMsgCount] = useState(0);

  const FREE_MSG_LIMIT = 3;
  const menuRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const broadcastChannelRef = useRef<any>(null);

  useEffect(() => {
    const supabase = createClient();
    let cleanup: (() => void) | undefined;

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setMyUserId(user.id);

      const { data: myProfile } = await supabase
        .from("profiles")
        .select("is_premium, premium_expires_at")
        .eq("id", user.id)
        .single();
      const premiumActive =
        myProfile?.is_premium === true &&
        (!myProfile.premium_expires_at || new Date(myProfile.premium_expires_at) > new Date());
      setIsPremium(premiumActive);

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, photo_url")
        .eq("id", otherUserId)
        .single();
      if (profile) {
        setMatchName(profile.full_name);
        setMatchPhoto(profile.photo_url || "");
      }

      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),` +
          `and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });

      const mapped = (data || []).map((m) => ({ ...m, is_me: m.sender_id === user.id }));
      setMessages(mapped);
      setMyMsgCount(mapped.filter((m) => m.is_me).length);
      setLoading(false);

      const myId = user.id;
      async function markAsRead() {
        await supabase
          .from("messages")
          .update({ read: true })
          .eq("receiver_id", myId)
          .eq("sender_id", otherUserId)
          .eq("read", false);
      }
      await markAsRead();

      // Messages + read receipts channel
      const channelName = `chat-${[user.id, otherUserId].sort().join("-")}`;
      const channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          (payload) => {
            const msg = payload.new as Message;
            const isRelevant =
              (msg.sender_id === user.id && msg.receiver_id === otherUserId) ||
              (msg.sender_id === otherUserId && msg.receiver_id === user.id);
            if (isRelevant) {
              setMessages((prev) => {
                if (prev.find((m) => m.id === msg.id)) return prev;
                if (msg.sender_id === user.id) {
                  const tempIdx = prev.findIndex(
                    (m) => m.id.startsWith("temp-") && m.content === msg.content
                  );
                  if (tempIdx !== -1) {
                    const updated = [...prev];
                    updated[tempIdx] = { ...msg, is_me: true };
                    return updated;
                  }
                }
                if (msg.sender_id === otherUserId) markAsRead();
                return [...prev, { ...msg, is_me: msg.sender_id === user.id }];
              });
            }
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "messages" },
          (payload) => {
            const updated = payload.new as Message;
            if (updated.sender_id === user.id && updated.receiver_id === otherUserId) {
              setMessages((prev) =>
                prev.map((m) => m.id === updated.id ? { ...m, read: updated.read } : m)
              );
            }
          }
        )
        .subscribe();

      // Broadcast channel for typing events
      const typingChannel = supabase.channel(`typing-${channelName}`);
      typingChannel
        .on("broadcast", { event: "typing" }, ({ payload }: { payload: { user_id: string } }) => {
          if (payload.user_id === otherUserId) {
            setIsOtherTyping(true);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => setIsOtherTyping(false), 2500);
          }
        })
        .subscribe();

      broadcastChannelRef.current = typingChannel;

      // Presence for online status
      const presenceChannel = supabase.channel("online-users", {
        config: { presence: { key: user.id } },
      });
      presenceChannel
        .on("presence", { event: "sync" }, () => {
          setIsOtherOnline(otherUserId in presenceChannel.presenceState());
        })
        .on("presence", { event: "join" }, ({ key }: { key: string }) => {
          if (key === otherUserId) setIsOtherOnline(true);
        })
        .on("presence", { event: "leave" }, ({ key }: { key: string }) => {
          if (key === otherUserId) setIsOtherOnline(false);
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await presenceChannel.track({ online_at: new Date().toISOString() });
          }
        });

      cleanup = () => {
        supabase.removeChannel(channel);
        supabase.removeChannel(typingChannel);
        supabase.removeChannel(presenceChannel);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      };
    }

    init();
    return () => { cleanup?.(); };
  }, [otherUserId, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherTyping]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const removeMatchAndMessages = useCallback(async () => {
    if (!myUserId) return;
    const supabase = createClient();
    await supabase.from("matches").delete()
      .or(`and(user_id.eq.${myUserId},matched_user_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},matched_user_id.eq.${myUserId})`);
    await supabase.from("messages").delete()
      .or(`and(sender_id.eq.${myUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${myUserId})`);
  }, [myUserId, otherUserId]);

  async function handleUnmatch() {
    if (!confirm("Unmatch with this person? Your conversation will also be deleted.")) return;
    setShowMenu(false);
    await removeMatchAndMessages();
    router.push("/matches");
  }

  async function handleBlock() {
    if (!confirm("Block this person? They won't be able to contact you and you won't see them again.")) return;
    setShowMenu(false);
    if (!myUserId) return;
    const supabase = createClient();
    await supabase.from("blocks").insert({ blocker_id: myUserId, blocked_id: otherUserId });
    await removeMatchAndMessages();
    router.push("/discover");
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNewMessage(e.target.value);
    // Broadcast typing event (fire-and-forget)
    if (broadcastChannelRef.current && myUserId) {
      broadcastChannelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: { user_id: myUserId },
      });
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !myUserId) return;
    if (!isPremium && myMsgCount >= FREE_MSG_LIMIT) return;

    const content = newMessage.trim();
    setNewMessage("");

    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, content, sender_id: myUserId, created_at: new Date().toISOString(), is_me: true },
    ]);

    const supabase = createClient();
    const { error } = await supabase.from("messages").insert({
      sender_id: myUserId,
      receiver_id: otherUserId,
      content,
    });

    if (error) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      alert("Failed to send message. Please try again.");
    } else {
      setMyMsgCount((c) => c + 1);
      fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to_user_id: otherUserId,
          title: `${matchName} sent you a message`,
          body: content.slice(0, 80),
          url: `/chat/${myUserId}`,
          type: "message",
        }),
      }).catch(() => {});
    }
  }

  // Group messages with date separators
  const messagesWithDates: Array<Message | { type: "date"; label: string; key: string }> = [];
  let lastDate = "";
  for (const msg of messages) {
    const dateLabel = formatDateLabel(msg.created_at);
    if (dateLabel !== lastDate) {
      messagesWithDates.push({ type: "date", label: dateLabel, key: `date-${msg.id}` });
      lastDate = dateLabel;
    }
    messagesWithDates.push(msg);
  }

  // ID of the last message sent by me that has been read
  const lastReadMsgId = [...messages].reverse().find((m) => m.is_me && m.read && !m.id.startsWith("temp-"))?.id;

  return (
    <>
      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-4px); }
        }
      `}</style>

      <div className="min-h-screen flex flex-col" style={{ background: "#0a0a0f" }}>
        {/* Header */}
        <header className="glass sticky top-0 z-50 flex items-center gap-3 px-4 py-3">
          <button onClick={() => router.back()} className="text-white/60 hover:text-white transition-colors">
            <ArrowLeft size={22} />
          </button>
          {matchPhoto ? (
            <div className="w-10 h-10 rounded-full overflow-hidden relative flex-shrink-0">
              <Image src={matchPhoto} alt={matchName} fill className="object-cover" sizes="40px" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full btn-primary flex items-center justify-center font-bold text-white flex-shrink-0">
              {matchName.split(" ").map((n) => n[0]).join("").toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-semibold text-sm truncate">{matchName}</h2>
            <div className="flex items-center gap-1">
              {isOtherTyping ? (
                <span className="text-xs text-red-400/70 italic">typing…</span>
              ) : (
                <>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isOtherOnline ? "bg-green-400" : "bg-white/20"}`} />
                  <span className={`text-xs ${isOtherOnline ? "text-green-400/60" : "text-white/30"}`}>
                    {isOtherOnline ? "Online" : "Offline"}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu((o) => !o)}
              className="p-2 text-white/40 hover:text-white/70 transition-colors"
            >
              <MoreVertical size={20} />
            </button>
            {showMenu && (
              <div
                className="absolute right-0 top-10 rounded-xl overflow-hidden shadow-2xl z-50 min-w-[160px]"
                style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <button onClick={handleUnmatch} className="w-full flex items-center gap-2 px-4 py-3 text-orange-400 text-sm hover:bg-white/5 transition-colors">
                  <UserX size={15} /> Unmatch
                </button>
                <button onClick={handleBlock} className="w-full flex items-center gap-2 px-4 py-3 text-red-400 text-sm hover:bg-white/5 transition-colors border-t border-white/5">
                  <ShieldX size={15} /> Block
                </button>
                <button onClick={() => { setShowMenu(false); setShowReport(true); }} className="w-full flex items-center gap-2 px-4 py-3 text-white/40 text-sm hover:bg-white/5 transition-colors border-t border-white/5">
                  <Flag size={15} /> Report
                </button>
              </div>
            )}
          </div>
        </header>

        {showReport && (
          <ReportModal reportedId={otherUserId} reportedName={matchName} onClose={() => setShowReport(false)} />
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          <div className="text-center mb-4">
            <span className="glass px-4 py-1 rounded-full text-white/30 text-xs">
              You matched! Say hello 👋
            </span>
          </div>

          {loading && (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/20 text-sm">No messages yet.</p>
              <p className="text-white/30 text-sm mt-1">Break the ice — say something!</p>
            </div>
          )}

          {messagesWithDates.map((item) => {
            if ("type" in item && item.type === "date") {
              return (
                <div key={item.key} className="flex items-center gap-3 my-2">
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-white/25 text-[10px] font-medium">{item.label}</span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>
              );
            }
            const msg = item as Message;
            return (
              <div key={msg.id} className={`flex ${msg.is_me ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[75%]">
                  <div className={`px-4 py-2.5 text-sm ${msg.is_me ? "message-bubble-me text-white" : "message-bubble-them text-white/80"}`}>
                    {msg.content}
                  </div>
                  <div className={`flex items-center gap-1 mt-1 ${msg.is_me ? "justify-end" : "justify-start"}`}>
                    <span className="text-white/20 text-xs">{formatTime(msg.created_at)}</span>
                    {msg.is_me && (
                      <span className={`text-xs leading-none ${msg.read ? "text-blue-400" : "text-white/25"}`}>
                        {msg.id.startsWith("temp-") ? "✓" : "✓✓"}
                      </span>
                    )}
                    {msg.id === lastReadMsgId && (
                      <span className="text-blue-400/70 text-[10px]">Seen</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isOtherTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="glass border-t border-white/5">
          {!isPremium && myMsgCount >= FREE_MSG_LIMIT ? (
            <div className="p-4 text-center">
              <Crown size={24} className="text-yellow-400 mx-auto mb-2" />
              <p className="text-white font-semibold text-sm mb-1">Message limit reached</p>
              <p className="text-white/40 text-xs mb-3">
                Free users can send {FREE_MSG_LIMIT} messages per conversation. Upgrade to chat freely!
              </p>
              <a href="/premium" className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-white text-sm font-semibold">
                <Crown size={14} /> Go Premium — ₹199/mo
              </a>
            </div>
          ) : (
            <form onSubmit={sendMessage} className="p-4 flex items-center gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Type a message..."
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-white placeholder-white/20 focus:outline-none focus:border-red-400/40 text-sm transition-colors"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="btn-primary w-11 h-11 rounded-full flex items-center justify-center disabled:opacity-30"
              >
                <Send size={18} className="text-white" />
              </button>
            </form>
          )}
          {!isPremium && myMsgCount < FREE_MSG_LIMIT && (
            <p className="text-center text-white/20 text-[10px] pb-2">
              {FREE_MSG_LIMIT - myMsgCount} free message{FREE_MSG_LIMIT - myMsgCount !== 1 ? "s" : ""} remaining —{" "}
              <a href="/premium" className="text-yellow-400/60 hover:text-yellow-400 transition-colors">Go Premium</a> for unlimited
            </p>
          )}
        </div>
      </div>
    </>
  );
}
