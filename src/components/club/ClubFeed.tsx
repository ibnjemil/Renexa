import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ClubPostCard } from "./ClubPostCard";
import { Loader2 } from "lucide-react";

interface Post {
  id: string;
  user_id: string;
  content: string;
  media_urls: string[];
  media_type: string;
  created_at: string;
  profiles: { name: string; avatar_url: string | null } | null;
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;
}

export function ClubFeed({ onViewProfile }: { onViewProfile?: (userId: string) => void }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    const { data: postsData } = await supabase
      .from("club_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!postsData) { setLoading(false); return; }

    const userIds = [...new Set(postsData.map(p => p.user_id))];
    const postIds = postsData.map(p => p.id);

    const [profilesRes, likesRes, commentsRes, myLikesRes] = await Promise.all([
      supabase.from("profiles").select("id, name, avatar_url").in("id", userIds),
      supabase.from("club_likes").select("post_id").in("post_id", postIds),
      supabase.from("club_comments").select("post_id").in("post_id", postIds),
      user ? supabase.from("club_likes").select("post_id").eq("user_id", user.id).in("post_id", postIds) : Promise.resolve({ data: [] }),
    ]);

    const profileMap = new Map((profilesRes.data || []).map(p => [p.id, p]));
    const likesCount = new Map<string, number>();
    (likesRes.data || []).forEach(l => likesCount.set(l.post_id, (likesCount.get(l.post_id) || 0) + 1));
    const commentsCount = new Map<string, number>();
    (commentsRes.data || []).forEach(c => commentsCount.set(c.post_id, (commentsCount.get(c.post_id) || 0) + 1));
    const myLikes = new Set((myLikesRes.data || []).map(l => l.post_id));

    const enriched: Post[] = postsData.map(p => ({
      ...p,
      media_urls: p.media_urls || [],
      media_type: p.media_type || "text",
      profiles: profileMap.get(p.user_id) || null,
      likes_count: likesCount.get(p.id) || 0,
      comments_count: commentsCount.get(p.id) || 0,
      liked_by_me: myLikes.has(p.id),
    }));

    setPosts(enriched);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground text-sm">
        No posts yet. Be the first to share something!
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {posts.filter(p => p.media_type !== "reel").map(post => (
        <ClubPostCard key={post.id} post={post} onUpdate={fetchPosts} onViewProfile={onViewProfile} />
      ))}
    </div>
  );
}
