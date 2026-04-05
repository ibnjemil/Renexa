import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { User, Loader2 } from "lucide-react";
import { ClubChat } from "./ClubChat";

interface Conversation {
  id: string;
  other_user_id: string;
  other_name: string;
  other_avatar: string | null;
  last_message: string;
  updated_at: string;
  unread: number;
}

export function ClubInbox() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<string | null>(null);

  const fetchConversations = async () => {
    if (!user) return;
    setLoading(true);

    const { data: convs } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
      .order("updated_at", { ascending: false });

    if (!convs || convs.length === 0) { setLoading(false); return; }

    const otherIds = convs.map(c => c.participant_1 === user.id ? c.participant_2 : c.participant_1);
    const { data: profiles } = await supabase.from("profiles").select("id, name, avatar_url").in("id", otherIds);
    const profileMap = new Map((profiles || []).map(p => [p.id, p]));

    const convIds = convs.map(c => c.id);
    const { data: messages } = await supabase
      .from("direct_messages")
      .select("*")
      .in("conversation_id", convIds)
      .order("created_at", { ascending: false });

    const lastMessages = new Map<string, string>();
    const unreadCounts = new Map<string, number>();
    (messages || []).forEach(m => {
      if (!lastMessages.has(m.conversation_id)) lastMessages.set(m.conversation_id, m.content);
      if (!m.read && m.sender_id !== user.id) {
        unreadCounts.set(m.conversation_id, (unreadCounts.get(m.conversation_id) || 0) + 1);
      }
    });

    const enriched: Conversation[] = convs.map(c => {
      const otherId = c.participant_1 === user.id ? c.participant_2 : c.participant_1;
      const prof = profileMap.get(otherId);
      return {
        id: c.id,
        other_user_id: otherId,
        other_name: prof?.name || "Inventor",
        other_avatar: prof?.avatar_url || null,
        last_message: lastMessages.get(c.id) || "",
        updated_at: c.updated_at,
        unread: unreadCounts.get(c.id) || 0,
      };
    });

    setConversations(enriched);
    setLoading(false);
  };

  useEffect(() => { fetchConversations(); }, [user?.id]);

  // Desktop: side-by-side. Mobile: list or chat
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  if (isMobile && activeChat) {
    return <ClubChat conversationId={activeChat} onBack={() => { setActiveChat(null); fetchConversations(); }} />;
  }

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;
  }

  if (conversations.length === 0) {
    return <div className="text-center py-20 text-muted-foreground text-sm">No conversations yet. Find inventors and start chatting!</div>;
  }

  return (
    <div className="flex h-[calc(100vh-180px)]">
      {/* Contacts list */}
      <div className={`${activeChat && !isMobile ? "w-72 border-r border-border" : "w-full"} overflow-y-auto shrink-0`}>
        <div className="px-3 py-2 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Conversations</p>
        </div>
        {conversations.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveChat(c.id)}
            className={`flex items-center gap-3 w-full px-3 py-3 hover:bg-secondary/50 transition-colors text-left ${
              activeChat === c.id ? "bg-secondary/70" : ""
            }`}
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 relative">
              {c.other_avatar ? (
                <img src={c.other_avatar} className="w-full h-full rounded-full object-cover" alt="" />
              ) : (
                <User className="w-5 h-5 text-primary-foreground" />
              )}
              {c.unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-destructive text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {c.unread}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{c.other_name}</p>
              <p className="text-xs text-muted-foreground truncate">{c.last_message}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Chat area - desktop */}
      {!isMobile && (
        <div className="flex-1 min-w-0">
          {activeChat ? (
            <ClubChat conversationId={activeChat} onBack={() => { setActiveChat(null); fetchConversations(); }} />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      )}
    </div>
  );
}
