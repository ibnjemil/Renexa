import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Heart, Send, Share2, User, Volume2, VolumeX, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { SendToFriendModal } from "./SendToFriendModal";

interface Reel {
  id: string;
  user_id: string;
  content: string;
  media_urls: string[];
  media_type: string | null;
  created_at: string;
  profile_name: string;
  avatar_url: string | null;
  likes_count: number;
  liked_by_me: boolean;
}

export function ClubReels() {
  const { user } = useAuth();
  const [reels, setReels] = useState<Reel[]>([]);
  const [muted, setMuted] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Touch swipe refs
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const isDragging = useRef(false);
  const dragOffset = useRef(0);
  const [visualOffset, setVisualOffset] = useState(0);
  const isTransitioning = useRef(false);

  useEffect(() => {
    const fetchReels = async () => {
      const { data } = await supabase
        .from("club_posts")
        .select("*")
        .in("media_type", ["video", "reel", "image"])
        .order("created_at", { ascending: false })
        .limit(30);

      if (!data || data.length === 0) return;

      const userIds = [...new Set(data.map(p => p.user_id))];
      const postIds = data.map(p => p.id);
      const [profilesRes, likesRes, myLikesRes] = await Promise.all([
        supabase.from("profiles").select("id, name, avatar_url").in("id", userIds),
        supabase.from("club_likes").select("post_id").in("post_id", postIds),
        user ? supabase.from("club_likes").select("post_id").eq("user_id", user.id).in("post_id", postIds) : Promise.resolve({ data: [] }),
      ]);

      const profileMap = new Map((profilesRes.data || []).map(p => [p.id, p]));
      const likesCount = new Map<string, number>();
      (likesRes.data || []).forEach(l => likesCount.set(l.post_id, (likesCount.get(l.post_id) || 0) + 1));
      const myLikes = new Set((myLikesRes.data || []).map(l => l.post_id));

      setReels(data.map(p => ({
        ...p,
        media_urls: p.media_urls || [],
        profile_name: profileMap.get(p.user_id)?.name || "Inventor",
        avatar_url: profileMap.get(p.user_id)?.avatar_url || null,
        likes_count: likesCount.get(p.id) || 0,
        liked_by_me: myLikes.has(p.id),
      })));
    };
    fetchReels();
  }, [user?.id]);

  const handleLike = async (reel: Reel) => {
    if (!user) { toast.error("Sign in to like"); return; }
    if (reel.liked_by_me) {
      await supabase.from("club_likes").delete().eq("user_id", user.id).eq("post_id", reel.id);
    } else {
      await supabase.from("club_likes").insert({ user_id: user.id, post_id: reel.id });
    }
    setReels(prev => prev.map(r => r.id === reel.id ? {
      ...r, liked_by_me: !r.liked_by_me,
      likes_count: r.liked_by_me ? r.likes_count - 1 : r.likes_count + 1
    } : r));
  };

  const goTo = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(reels.length - 1, idx));
    isTransitioning.current = true;
    setCurrentIndex(clamped);
    setVisualOffset(0);
    setTimeout(() => { isTransitioning.current = false; }, 350);
  }, [reels.length]);

  // Touch handlers — each reel is exactly containerHeight tall
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isTransitioning.current) return;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    isDragging.current = true;
    dragOffset.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const dy = e.touches[0].clientY - touchStartY.current;
    dragOffset.current = dy;
    setVisualOffset(dy);
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const velocity = Math.abs(dragOffset.current) / (Date.now() - touchStartTime.current + 1);
    const threshold = 50;

    if (dragOffset.current < -threshold || (dragOffset.current < -20 && velocity > 0.3)) {
      goTo(currentIndex + 1);
    } else if (dragOffset.current > threshold || (dragOffset.current > 20 && velocity > 0.3)) {
      goTo(currentIndex - 1);
    } else {
      setVisualOffset(0);
    }
  };

  // Mouse wheel for desktop — debounced so one scroll = one reel
  const wheelLock = useRef(false);
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (wheelLock.current || isTransitioning.current) return;
    if (Math.abs(e.deltaY) < 30) return;
    wheelLock.current = true;
    if (e.deltaY > 0) goTo(currentIndex + 1);
    else goTo(currentIndex - 1);
    setTimeout(() => { wheelLock.current = false; }, 500);
  };

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isTransitioning.current) return;
      if (e.key === "ArrowDown") goTo(currentIndex + 1);
      if (e.key === "ArrowUp") goTo(currentIndex - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentIndex, goTo]);

  if (reels.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground text-sm">
        No reels yet. Upload a video to get started!
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden bg-black touch-none"
      style={{ height: "calc(100vh - 180px)" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Only render the current reel ± 1 for performance */}
      {reels.map((reel, idx) => {
        if (Math.abs(idx - currentIndex) > 1) return null;
        const offset = (idx - currentIndex) * 100;
        const pixelOffset = idx === currentIndex ? visualOffset : 0;
        return (
          <div
            key={reel.id}
            className="absolute inset-0 w-full"
            style={{
              transform: `translateY(calc(${offset}% + ${pixelOffset}px))`,
              transition: visualOffset === 0 ? "transform 0.3s ease-out" : "none",
              height: "100%",
            }}
          >
            <ReelItem
              reel={reel}
              muted={muted}
              isActive={idx === currentIndex}
              onToggleMute={() => setMuted(m => !m)}
              onLike={() => handleLike(reel)}
            />
          </div>
        );
      })}

      {/* Indicators */}
      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-20">
        {reels.slice(0, 20).map((_, i) => (
          <button key={i} onClick={() => goTo(i)} className={`w-1 rounded-full transition-all ${i === currentIndex ? "h-4 bg-primary" : "h-1.5 bg-white/30"}`} />
        ))}
      </div>
    </div>
  );
}

const isVideoType = (type: string | null) => type === "video" || type === "reel";

function ReelItem({
  reel, muted, isActive, onToggleMute, onLike,
}: {
  reel: Reel; muted: boolean; isActive: boolean; onToggleMute: () => void; onLike: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showShare, setShowShare] = useState(false);
  const [showSendToFriend, setShowSendToFriend] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isActive) {
      video.currentTime = 0;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isActive]);

  // Close share popup on outside click
  useEffect(() => {
    if (!showShare) return;
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShowShare(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showShare]);

  const handleShare = (platform?: string) => {
    const url = `${window.location.origin}/?reel=${reel.id}`;
    if (platform) {
      const text = encodeURIComponent("Check out this reel!");
      const encodedUrl = encodeURIComponent(url);
      const links: Record<string, string> = {
        twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`,
        whatsapp: `https://wa.me/?text=${text}%20${encodedUrl}`,
        telegram: `https://t.me/share/url?url=${encodedUrl}&text=${text}`,
      };
      window.open(links[platform], "_blank", "noopener,noreferrer");
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    }
    setShowShare(false);
  };

  return (
    <div className="relative flex items-center justify-center h-full w-full bg-black">
      {reel.media_urls[0] && isVideoType(reel.media_type) ? (
        <video
          ref={videoRef}
          src={reel.media_urls[0]}
          className="w-full h-full object-contain"
          loop
          playsInline
          muted={muted}
          preload="metadata"
        />
      ) : reel.media_urls[0] ? (
        <img
          src={reel.media_urls[0]}
          className="w-full h-full object-contain"
          alt=""
        />
      ) : null}

      {/* Right side icons */}
      <div className="absolute bottom-20 right-2 flex flex-col items-center gap-4 z-10">
        <button onClick={onLike} className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform">
          <Heart className={`w-5 h-5 ${reel.liked_by_me ? "fill-destructive text-destructive" : "text-white"}`} />
          <span className="text-white text-[9px]">{reel.likes_count}</span>
        </button>
        <button onClick={() => setShowSendToFriend(true)} className="active:scale-90 transition-transform">
          <Send className="w-4 h-4 text-white" />
        </button>
        <div ref={shareRef} className="relative">
          <button onClick={() => setShowShare(!showShare)} className="active:scale-90 transition-transform">
            <Share2 className="w-4 h-4 text-white" />
          </button>
          {showShare && (
            <div className="absolute bottom-0 right-8 z-20 bg-card/95 backdrop-blur-sm border border-border rounded-xl p-2 flex flex-col gap-1.5 shadow-lg">
              {["whatsapp", "twitter", "telegram"].map(p => (
                <button key={p} onClick={() => handleShare(p)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-secondary transition-colors capitalize">
                  {p}
                </button>
              ))}
              <button onClick={() => handleShare()}
                className="px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-secondary transition-colors flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> Copy Link
              </button>
            </div>
          )}
        </div>
        {isVideoType(reel.media_type) && (
          <button onClick={onToggleMute}>
            {muted ? <VolumeX className="w-3.5 h-3.5 text-white/80" /> : <Volume2 className="w-3.5 h-3.5 text-white/80" />}
          </button>
        )}
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-4 left-3 right-14 z-10">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-7 h-7 rounded-full bg-secondary/50 flex items-center justify-center shrink-0">
            {reel.avatar_url ? (
              <img src={reel.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
            ) : (
              <User className="w-3.5 h-3.5 text-white" />
            )}
          </div>
          <span className="text-white font-semibold text-xs">{reel.profile_name}</span>
        </div>
        {reel.content && <p className="text-white/90 text-[11px] line-clamp-2">{reel.content}</p>}
      </div>

      {showSendToFriend && (
        <SendToFriendModal
          postId={reel.id}
          mediaUrl={reel.media_urls[0] || null}
          mediaType="video"
          content={reel.content}
          onClose={() => setShowSendToFriend(false)}
        />
      )}
    </div>
  );
}
