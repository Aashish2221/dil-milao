"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Heart } from "lucide-react";
import { createClient } from "@/lib/supabase";

type Message = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_me?: boolean;
};

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const otherUserId = params.id as string;   // matched user's profile ID
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [matchName, setMatchName] = useState("...");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    let cleanup: (() => void) | undefined;

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setMyUserId(user.id);

      // Load the other person's name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", otherUserId)
        .single();
      if (profile) setMatchName(profile.full_name);

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

      // Subscribe to new messages in real-time
      const channel = supabase
        .channel(`chat-${[user.id, otherUserId].sort().join("-")}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          (payload) => {
            const msg = payload.new as Message;
            const isRelevant =
              (msg.sender_id === user.id && (msg as unknown as Record<string, string>).receiver_id === otherUserId) ||
              (msg.sender_id === otherUserId && (msg as unknown as Record<string, string>).receiver_id === user.id);
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
                return [...prev, { ...msg, is_me: msg.sender_id === user.id }];
              });
            }
          }
        )
        .subscribe();

      cleanup = () => { supabase.removeChannel(channel); };
    }

    init();
    return () => { cleanup?.(); };
  }, [otherUserId, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      alert("Failed to send message. Please try again.");
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
        <div className="w-10 h-10 rounded-full btn-primary flex items-center justify-center font-bold text-white">
          {matchName.split(" ").map((n) => n[0]).join("").toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="text-white font-semibold text-sm">{matchName}</h2>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-green-400/60 text-xs">Online</span>
          </div>
        </div>
        <Heart size={20} fill="#ff6b6b" className="text-red-400" />
      </header>

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
              <div className={`text-white/20 text-xs mt-1 ${msg.is_me ? "text-right" : "text-left"}`}>
                {formatTime(msg.created_at)}
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
