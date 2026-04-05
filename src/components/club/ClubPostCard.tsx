import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Heart, MessageCircle, Send, Share2, MoreHorizontal, Trash2, User, ExternalLink, Volume2, VolumeX, Users } from "lucide-react";
import { toast } from "sonner";
import { ClubComments } from "./ClubComments";
import { SendToFriendModal } from "./SendToFriendModal";

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

export function ClubPostCard({ post, onUpdate, onViewProfile }: { post: Post; onUpdate: () => void; onViewProfile?: (userId: string) => void }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(post.liked_by_me);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showMenu, setShowMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showSendToFriend, setShowSendToFriend] = useState(false);
  const [currentMediaIdx, setCurrentMediaIdx] = useState(0);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isVideo = post.media_type === "video" || post.media_type === "reel";

  // Auto play/pause video on scroll visibility
  useEffect(() => {
    if (!isVideo) return;
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [isVideo, currentMediaIdx]);

  const handleLike = async () => {
    if (!user) { toast.error("Sign in to like"); return; }
    if (liked) {
      await supabase.from("club_likes").delete().eq("user_id", user.id).eq("post_id", post.id);
      setLiked(false);
      setLikesCount(c => c - 1);
    } else {
      await supabase.from("club_likes").insert({ user_id: user.id, post_id: post.id });
      setLiked(true);
      setLikesCount(c => c + 1);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    await supabase.from("club_posts").delete().eq("id", post.id);
    toast.success("Post deleted");
    onUpdate();
  };

  const postUrl = `${window.location.origin}/?post=${post.id}`;

  const handleShareExternal = (platform: string) => {
    const text = encodeURIComponent(post.content || "Check out this invention!");
    const url = encodeURIComponent(postUrl);
    const links: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
    };
    window.open(links[platform], "_blank", "noopener,noreferrer");
    setShowShareMenu(false);
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
  };

  return (
    <div className="bg-background" ref={containerRef}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5">
        <button onClick={() => onViewProfile?.(post.user_id)} className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 ring-2 ring-primary/20">
            {post.profiles?.avatar_url ? (
              <img src={post.profiles.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
            ) : (
              <User className="w-4 h-4 text-primary-foreground" />
            )}
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold leading-tight">{post.profiles?.name || "Inventor"}</p>
            <p className="text-[10px] text-muted-foreground">{timeAgo(post.created_at)}</p>
          </div>
        </button>

        {user?.id === post.user_id && (
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-1">
              <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 bg-card border border-border rounded-xl shadow-lg py-1 z-20 w-36">
                <button onClick={handleDelete} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-secondary">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Media */}
      {post.media_urls.length > 0 && (
        <div className="relative aspect-square bg-secondary overflow-hidden">
          {isVideo ? (
            <>
              <video
                ref={videoRef}
                src={post.media_urls[currentMediaIdx]}
                className="w-full h-full object-cover"
                playsInline
                muted={muted}
                loop
                preload="metadata"
              />
              {/* Audio control */}
              <button
                onClick={() => setMuted(m => !m)}
                className="absolute bottom-3 right-3 z-10 w-8 h-8 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center"
              >
                {muted ? <VolumeX className="w-4 h-4 text-foreground" /> : <Volume2 className="w-4 h-4 text-foreground" />}
              </button>
            </>
          ) : (
            <img
              src={post.media_urls[currentMediaIdx]}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
          {post.media_urls.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
              {post.media_urls.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentMediaIdx(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentMediaIdx ? "bg-primary" : "bg-foreground/30"}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-3 sm:px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <button onClick={handleLike} className="active:scale-90 transition-transform">
            <Heart className={`w-[22px] h-[22px] transition-colors ${liked ? "fill-destructive text-destructive" : "text-foreground"}`} />
          </button>
          <button onClick={() => setShowComments(!showComments)} className="active:scale-90 transition-transform">
            <MessageCircle className="w-[22px] h-[22px] text-foreground" />
          </button>
          <button onClick={() => setShowSendToFriend(true)} className="active:scale-90 transition-transform">
            <Send className="w-[20px] h-[20px] text-foreground" />
          </button>
        </div>
        <button onClick={() => setShowShareMenu(!showShareMenu)} className="active:scale-90 transition-transform">
          <Share2 className="w-[20px] h-[20px] text-foreground" />
        </button>
      </div>

      {/* Share menu */}
      {showShareMenu && (
        <div className="px-3 sm:px-4 pb-2">
          <div className="bg-card border border-border rounded-xl p-2 flex flex-wrap gap-2">
            {[
              { key: "twitter", label: "𝕏" },
              { key: "facebook", label: "FB" },
              { key: "whatsapp", label: "WA" },
              { key: "telegram", label: "TG" },
            ].map(p => (
              <button key={p.key} onClick={() => handleShareExternal(p.key)}
                className="px-3 py-1.5 bg-secondary rounded-lg text-xs font-semibold hover:bg-secondary/80 transition-colors">
                {p.label}
              </button>
            ))}
            <button onClick={() => { navigator.clipboard.writeText(postUrl); toast.success("Link copied!"); setShowShareMenu(false); }}
              className="px-3 py-1.5 bg-secondary rounded-lg text-xs font-semibold hover:bg-secondary/80 transition-colors flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> Copy
            </button>
          </div>
        </div>
      )}

      {/* Likes & Caption */}
      <div className="px-3 sm:px-4 pb-2 space-y-1">
        {likesCount > 0 && (
          <p className="text-xs font-semibold">{likesCount} like{likesCount !== 1 ? "s" : ""}</p>
        )}
        {post.content && (
          <p className="text-sm">
            <button onClick={() => onViewProfile?.(post.user_id)} className="font-semibold mr-1.5 hover:underline">
              {post.profiles?.name || "Inventor"}
            </button>
            {post.content}
          </p>
        )}
        {post.comments_count > 0 && !showComments && (
          <button onClick={() => setShowComments(true)} className="text-xs text-muted-foreground">
            View all {post.comments_count} comment{post.comments_count !== 1 ? "s" : ""}
          </button>
        )}
      </div>

      {showComments && <ClubComments postId={post.id} />}

      {showSendToFriend && (
        <SendToFriendModal
          postId={post.id}
          mediaUrl={post.media_urls[0] || null}
          mediaType={post.media_type}
          content={post.content}
          onClose={() => setShowSendToFriend(false)}
        />
      )}
    </div>
  );
}
