"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Heart, MoreVertical, UserX, ShieldX, Flag } from "lucide-react";
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

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const otherUserId = params.id as string;   // matched user's profile ID
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [matchName, setMatchName] = useState("...");
  const [matchPhoto, setMatchPhoto] = useState("");
  const [loading, setLoading] = useState(true);
  const [isOtherOnline, setIsOtherOnline] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    let cleanup: (() => void) | undefined;

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setMyUserId(user.id);

      // Load the other person's name and photo
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, photo_url")
        .eq("id", otherUserId)
        .single();
      if (profile) {
        setMatchName(profile.full_name);
        setMatchPhoto(profile.photo_url || "");
      }

      // Load existing messages between these two users
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),` +
          `and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: true });

      setMessages((data || []).map((m) => ({ ...m, is_me: m.sender_id === user.id })));
      setLoading(false);

      // Mark all received messages from the other user as read
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

      // Subscribe to new messages + read receipt updates in real-time
      const channel = supabase
        .channel(`chat-${[user.id, otherUserId].sort().join("-")}`)
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
                // Replace the optimistic temp message for our own sent messages
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
                // If the other person sent it, mark it as read immediately
                if (msg.sender_id === otherUserId) {
                  markAsRead();
                }
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
            // When the other user reads one of our messages, update its read status
            if (updated.sender_id === user.id && updated.receiver_id === otherUserId) {
              setMessages((prev) =>
                prev.map((m) => m.id === updated.id ? { ...m, read: updated.read } : m)
              );
            }
          }
        )
        .subscribe();

      // Presence: track current user online, watch if other user is online
      const presenceChannel = supabase.channel("online-users", {
        config: { presence: { key: user.id } },
      });

      presenceChannel
        .on("presence", { event: "sync" }, () => {
          const state = presenceChannel.presenceState();
          setIsOtherOnline(otherUserId in state);
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
        supabase.removeChannel(presenceChannel);
      };
    }

    init();
    return () => { cleanup?.(); };
  }, [otherUserId, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close menu on outside click
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

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !myUserId) return;

    const content = newMessage.trim();
    setNewMessage("");

    // Optimistic update
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
      fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to_user_id: otherUserId, title: `${matchName} sent you a message`, body: content.slice(0, 80), url: `/chat/${myUserId}` }),
      }).catch(() => {});
    }
  }

  function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0a0f" }}>
      {/* Header */}
      <header className="glass sticky top-0 z-50 flex items-center gap-3 px-4 py-3">
        <button onClick={() => router.back()} className="text-white/60 hover:text-white transition-colors">
          <ArrowLeft size={22} />
        </button>
        {matchPhoto ? (
          <div className="w-10 h-10 rounded-full overflow-hidden relative flex-shrink-0">
            <Image
              src={matchPhoto}
              alt={matchName}
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full btn-primary flex items-center justify-center font-bold text-white flex-shrink-0">
            {matchName.split(" ").map((n) => n[0]).join("").toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h2 className="text-white font-semibold text-sm">{matchName}</h2>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isOtherOnline ? "bg-green-400" : "bg-white/20"}`} />
            <span className={`text-xs ${isOtherOnline ? "text-green-400/60" : "text-white/30"}`}>
              {isOtherOnline ? "Online" : "Offline"}
            </span>
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
              <button
                onClick={handleUnmatch}
                className="w-full flex items-center gap-2 px-4 py-3 text-orange-400 text-sm hover:bg-white/5 transition-colors"
              >
                <UserX size={15} /> Unmatch
              </button>
              <button
                onClick={handleBlock}
                className="w-full flex items-center gap-2 px-4 py-3 text-red-400 text-sm hover:bg-white/5 transition-colors border-t border-white/5"
              >
                <ShieldX size={15} /> Block
              </button>
              <button
                onClick={() => { setShowMenu(false); setShowReport(true); }}
                className="w-full flex items-center gap-2 px-4 py-3 text-white/40 text-sm hover:bg-white/5 transition-colors border-t border-white/5"
              >
                <Flag size={15} /> Report
              </button>
            </div>
          )}
        </div>
      </header>

      {showReport && (
        <ReportModal
          reportedId={otherUserId}
          reportedName={matchName}
          onClose={() => setShowReport(false)}
        />
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
          <div className="text-center py-10 text-white/30 text-sm">
            No messages yet. Be the first to say hi!
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.is_me ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[75%]">
              <div
                className={`px-4 py-2.5 text-sm ${
                  msg.is_me ? "message-bubble-me text-white" : "message-bubble-them text-white/80"
                }`}
              >
                {msg.content}
              </div>
              <div className={`flex items-center gap-1 mt-1 ${msg.is_me ? "justify-end" : "justify-start"}`}>
                <span className="text-white/20 text-xs">{formatTime(msg.created_at)}</span>
                {msg.is_me && (
                  <span className={`text-xs leading-none ${msg.read ? "text-blue-400" : "text-white/25"}`}>
                    {msg.id.startsWith("temp-") ? "✓" : "✓✓"}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="glass border-t border-white/5 p-4 flex items-center gap-3"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
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
    </div>
  );
}
