import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Send, User } from "lucide-react";
import { toast } from "sonner";

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile: { name: string; avatar_url: string | null } | null;
}

export function ClubComments({ postId }: { postId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    const { data } = await supabase
      .from("club_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (!data) { setLoading(false); return; }

    const userIds = [...new Set(data.map(c => c.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("id, name, avatar_url").in("id", userIds);
    const profileMap = new Map((profiles || []).map(p => [p.id, p]));

    setComments(data.map(c => ({ ...c, profile: profileMap.get(c.user_id) || null })));
    setLoading(false);
  };

  useEffect(() => { fetchComments(); }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Sign in to comment"); return; }
    if (!newComment.trim()) return;

    await supabase.from("club_comments").insert({
      user_id: user.id,
      post_id: postId,
      content: newComment.trim(),
    });

    setNewComment("");
    fetchComments();
  };

  return (
    <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
      {loading ? (
        <p className="text-xs text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {comments.map(c => (
            <div key={c.id} className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                {c.profile?.avatar_url ? (
                  <img src={c.profile.avatar_url} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
              <p className="text-sm">
                <span className="font-semibold mr-1">{c.profile?.name || "User"}</span>
                {c.content}
              </p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
        />
        <button type="submit" className="text-primary font-semibold text-sm disabled:opacity-40" disabled={!newComment.trim()}>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
