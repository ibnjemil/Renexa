import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { X, Send, User, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

interface Props {
  postId: string;
  mediaUrl: string | null;
  mediaType: string;
  content: string;
  onClose: () => void;
}

interface Friend {
  id: string;
  name: string;
  avatar_url: string | null;
  sent: boolean;
}

export function SendToFriendModal({ postId, mediaUrl, mediaType, content, onClose }: Props) {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchFriends = async () => {
      // Get people user follows or has conversations with
      const [followsRes, convsRes] = await Promise.all([
        supabase.from("club_follows").select("following_id").eq("follower_id", user.id),
        supabase.from("conversations").select("participant_1, participant_2")
          .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`),
      ]);

      const ids = new Set<string>();
      (followsRes.data || []).forEach(f => ids.add(f.following_id));
      (convsRes.data || []).forEach(c => {
        if (c.participant_1 !== user.id) ids.add(c.participant_1);
        if (c.participant_2 !== user.id) ids.add(c.participant_2);
      });

      if (ids.size === 0) { setLoading(false); return; }

      const { data: profiles } = await supabase.from("profiles").select("id, name, avatar_url").in("id", [...ids]);
      setFriends((profiles || []).map(p => ({ ...p, sent: false })));
      setLoading(false);
    };
    fetchFriends();
  }, [user?.id]);

  const handleSend = async (friendId: string) => {
    if (!user) return;
    setSending(friendId);

    // Find or create conversation
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .or(`and(participant_1.eq.${user.id},participant_2.eq.${friendId}),and(participant_1.eq.${friendId},participant_2.eq.${user.id})`)
      .maybeSingle();

    let convId: string;
    if (existing) {
      convId = existing.id;
    } else {
      const { data: newConv, error } = await supabase
        .from("conversations")
        .insert({ participant_1: user.id, participant_2: friendId })
        .select("id")
        .single();
      if (error || !newConv) {
        toast.error("Failed to send");
        setSending(null);
        return;
      }
      convId = newConv.id;
    }

    // Build message with media attachment info
    let msgContent = "";
    if (mediaUrl) {
      msgContent = `📎 Shared a ${mediaType === "video" || mediaType === "reel" ? "video" : "post"}\n${mediaUrl}`;
    }
    if (content) {
      msgContent += msgContent ? `\n\n"${content.slice(0, 100)}"` : `📎 Shared: "${content.slice(0, 200)}"`;
    }

    await supabase.from("direct_messages").insert({
      conversation_id: convId,
      sender_id: user.id,
      content: msgContent,
    });

    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", convId);

    setFriends(prev => prev.map(f => f.id === friendId ? { ...f, sent: true } : f));
    setSending(null);
    toast.success("Sent!");
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-background/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full max-w-md sm:mx-4 max-h-[70vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-display font-bold text-sm">Send to Friend</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>

        <div className="overflow-y-auto p-3 space-y-1" style={{ maxHeight: "50vh" }}>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : friends.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">Follow people to send them content!</p>
          ) : (
            friends.map(f => (
              <div key={f.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                    {f.avatar_url ? (
                      <img src={f.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
                    ) : (
                      <User className="w-5 h-5 text-primary-foreground" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{f.name}</span>
                </div>
                <button
                  onClick={() => handleSend(f.id)}
                  disabled={f.sent || sending === f.id}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    f.sent
                      ? "bg-secondary text-muted-foreground"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {sending === f.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : f.sent ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
