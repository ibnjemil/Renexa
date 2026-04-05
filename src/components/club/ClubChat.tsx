import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Send, User, Image, Play } from "lucide-react";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

function isMediaUrl(url: string) {
  return /\.(jpg|jpeg|png|gif|webp|mp4|mov|webm)(\?.*)?$/i.test(url);
}

function isVideoUrl(url: string) {
  return /\.(mp4|mov|webm)(\?.*)?$/i.test(url);
}

function MessageBubble({ msg, isMe }: { msg: Message; isMe: boolean }) {
  // Check if message contains a media URL (shared post/reel)
  const lines = msg.content.split("\n");
  const mediaLine = lines.find(l => l.trim().startsWith("http") && isMediaUrl(l.trim()));
  const textLines = lines.filter(l => l !== mediaLine);

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[75%] rounded-2xl overflow-hidden ${
        isMe ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary text-foreground rounded-bl-md"
      }`}>
        {mediaLine && (
          <div className="w-full max-w-[280px]">
            {isVideoUrl(mediaLine.trim()) ? (
              <video
                src={mediaLine.trim()}
                className="w-full aspect-video object-cover"
                controls
                preload="metadata"
                playsInline
              />
            ) : (
              <img src={mediaLine.trim()} className="w-full aspect-square object-cover" alt="" loading="lazy" />
            )}
          </div>
        )}
        {textLines.filter(l => l.trim()).length > 0 && (
          <div className="px-3.5 py-2 text-sm whitespace-pre-wrap">
            {textLines.filter(l => l.trim()).join("\n")}
          </div>
        )}
      </div>
    </div>
  );
}

export function ClubChat({ conversationId, onBack }: { conversationId: string; onBack: () => void }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [otherName, setOtherName] = useState("Inventor");
  const [otherAvatar, setOtherAvatar] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    const { data: msgs } = await supabase
      .from("direct_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    setMessages(msgs || []);

    if (user && msgs) {
      const unreadIds = msgs.filter(m => !m.read && m.sender_id !== user.id).map(m => m.id);
      if (unreadIds.length > 0) {
        await supabase.from("direct_messages").update({ read: true }).in("id", unreadIds);
      }
    }

    const { data: conv } = await supabase.from("conversations").select("*").eq("id", conversationId).single();
    if (conv && user) {
      const otherId = conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1;
      const { data: profile } = await supabase.from("profiles").select("name, avatar_url").eq("id", otherId).single();
      if (profile) {
        setOtherName(profile.name);
        setOtherAvatar(profile.avatar_url);
      }
    }
  };

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "direct_messages",
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMsg.trim()) return;

    await supabase.from("direct_messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: newMsg.trim(),
    });

    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
    setNewMsg("");
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 180px)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button onClick={onBack} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
          {otherAvatar ? (
            <img src={otherAvatar} className="w-full h-full rounded-full object-cover" alt="" />
          ) : (
            <User className="w-4 h-4 text-primary-foreground" />
          )}
        </div>
        <span className="font-semibold text-sm">{otherName}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(m => (
          <MessageBubble key={m.id} msg={m} isMe={m.sender_id === user?.id} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="px-4 py-3 border-t border-border flex items-center gap-2">
        <input
          type="text"
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-secondary border border-border rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
        />
        <button type="submit" className="bg-primary text-primary-foreground p-2.5 rounded-full disabled:opacity-40" disabled={!newMsg.trim()}>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
