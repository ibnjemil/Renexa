import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Search, User, UserPlus, UserMinus, Mail, Phone, Loader2, Camera, Send, Share2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  verified: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
  is_following: boolean;
}

export function ClubSearch({ initialUserId }: { initialUserId?: string }) {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfiles = async (search?: string) => {
    setLoading(true);
    let q = supabase.from("profiles").select("*");
    if (search) q = q.ilike("name", `%${search}%`);
    if (initialUserId && !search) q = q.eq("id", initialUserId);
    const { data } = await q.limit(20);

    if (!data) { setLoading(false); return; }

    const ids = data.map(p => p.id);
    const [followersRes, followingRes, postsRes, myFollowsRes] = await Promise.all([
      supabase.from("club_follows").select("following_id").in("following_id", ids),
      supabase.from("club_follows").select("follower_id").in("follower_id", ids),
      supabase.from("club_posts").select("user_id").in("user_id", ids),
      user ? supabase.from("club_follows").select("following_id").eq("follower_id", user.id).in("following_id", ids) : Promise.resolve({ data: [] }),
    ]);

    const followersCount = new Map<string, number>();
    (followersRes.data || []).forEach(f => followersCount.set(f.following_id, (followersCount.get(f.following_id) || 0) + 1));
    const followingCount = new Map<string, number>();
    (followingRes.data || []).forEach(f => followingCount.set(f.follower_id, (followingCount.get(f.follower_id) || 0) + 1));
    const postsCount = new Map<string, number>();
    (postsRes.data || []).forEach(p => postsCount.set(p.user_id, (postsCount.get(p.user_id) || 0) + 1));
    const myFollows = new Set((myFollowsRes.data || []).map(f => f.following_id));

    const enriched: Profile[] = data.map(p => ({
      ...p,
      followers_count: followersCount.get(p.id) || 0,
      following_count: followingCount.get(p.id) || 0,
      posts_count: postsCount.get(p.id) || 0,
      is_following: myFollows.has(p.id),
    }));

    setProfiles(enriched);
    if (initialUserId && enriched.length > 0) setSelectedProfile(enriched[0]);
    setLoading(false);
  };

  useEffect(() => { fetchProfiles(); }, [initialUserId, user?.id]);

  const handleFollow = async (profile: Profile) => {
    if (!user) { toast.error("Sign in to follow"); return; }
    if (profile.is_following) {
      await supabase.from("club_follows").delete().eq("follower_id", user.id).eq("following_id", profile.id);
      toast.success(`Unfollowed ${profile.name}`);
    } else {
      await supabase.from("club_follows").insert({ follower_id: user.id, following_id: profile.id });
      toast.success(`Following ${profile.name}`);
    }
    fetchProfiles(query || undefined);
  };

  const handleStartConversation = async (profileId: string) => {
    if (!user) return;
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .or(`and(participant_1.eq.${user.id},participant_2.eq.${profileId}),and(participant_1.eq.${profileId},participant_2.eq.${user.id})`)
      .maybeSingle();

    if (existing) {
      toast.success("Opening conversation...");
    } else {
      const { error } = await supabase
        .from("conversations")
        .insert({ participant_1: user.id, participant_2: profileId });
      if (error) toast.error("Could not start conversation");
      else toast.success("Conversation started! Check your inbox.");
    }
  };

  if (selectedProfile) {
    return <ProfileView profile={selectedProfile} onBack={() => setSelectedProfile(null)} onFollow={handleFollow} onMessage={handleStartConversation} onRefresh={() => fetchProfiles(query || undefined)} />;
  }

  return (
    <div className="p-3 sm:p-4 space-y-3">
      <form onSubmit={e => { e.preventDefault(); fetchProfiles(query); }} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search inventors..."
          className="w-full bg-secondary border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
        />
      </form>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-2">
          {profiles.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedProfile(p)}
              className="flex items-center justify-between w-full bg-card border border-border rounded-xl p-3 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
                  ) : (
                    <User className="w-5 h-5 text-primary-foreground" />
                  )}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.posts_count} posts · {p.followers_count} followers</p>
                </div>
              </div>
              {user && user.id !== p.id && (
                <button
                  onClick={e => { e.stopPropagation(); handleFollow(p); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    p.is_following ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground"
                  }`}
                >
                  {p.is_following ? "Following" : "Follow"}
                </button>
              )}
            </button>
          ))}
          {profiles.length === 0 && !loading && (
            <p className="text-center text-muted-foreground text-sm py-10">No inventors found</p>
          )}
        </div>
      )}
    </div>
  );
}

function ProfileView({
  profile,
  onBack,
  onFollow,
  onMessage,
  onRefresh,
}: {
  profile: Profile;
  onBack: () => void;
  onFollow: (p: Profile) => void;
  onMessage: (id: string) => void;
  onRefresh: () => void;
}) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isOwnProfile = user?.id === profile.id;

  useEffect(() => {
    supabase
      .from("club_posts")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setPosts(data || []));
  }, [profile.id]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `avatars/${user.id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("club-media")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error("Upload failed");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("club-media").getPublicUrl(path);
    await supabase.from("profiles").update({ avatar_url: urlData.publicUrl }).eq("id", user.id);
    toast.success("Profile photo updated!");
    setUploading(false);
    onRefresh();
  };

  const handleShareProfile = (platform?: string) => {
    const url = `${window.location.origin}/inventor-club?profile=${profile.id}`;
    if (platform) {
      const text = encodeURIComponent(`Check out ${profile.name}'s profile!`);
      const encodedUrl = encodeURIComponent(url);
      const links: Record<string, string> = {
        twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`,
        whatsapp: `https://wa.me/?text=${text}%20${encodedUrl}`,
      };
      window.open(links[platform], "_blank", "noopener,noreferrer");
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Profile link copied!");
    }
  };

  return (
    <div className="space-y-0">
      <div className="p-3 sm:p-4 space-y-4">
        <button onClick={onBack} className="text-xs text-primary font-medium">&larr; Back</button>

        <div className="flex items-start gap-4 sm:gap-5">
          {/* Avatar with upload for own profile */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
              ) : (
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
              )}
            </div>
            {isOwnProfile && (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md"
                >
                  <Camera className="w-3 h-3" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-2">
            <h2 className="font-display font-bold text-base sm:text-lg truncate">{profile.name}</h2>
            <div className="flex gap-4 sm:gap-5 text-xs">
              <span><strong>{profile.posts_count}</strong> posts</span>
              <span><strong>{profile.followers_count}</strong> followers</span>
              <span><strong>{profile.following_count}</strong> following</span>
            </div>
          </div>
        </div>

        {profile.bio && <p className="text-sm text-muted-foreground">{profile.bio}</p>}

        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          {profile.email && (
            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{profile.email}</span>
          )}
          {profile.phone && (
            <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{profile.phone}</span>
          )}
        </div>

        {/* Actions */}
        {user && user.id !== profile.id && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onFollow(profile)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                profile.is_following ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground"
              }`}
            >
              {profile.is_following ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {profile.is_following ? "Unfollow" : "Follow"}
            </button>
            <button
              onClick={() => onMessage(profile.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold bg-secondary text-foreground"
            >
              <Send className="w-4 h-4" /> Message
            </button>
          </div>
        )}

        {/* Share profile */}
        <div className="flex items-center gap-2">
          <button onClick={() => handleShareProfile()} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-lg text-xs font-medium hover:bg-secondary/80 transition-colors">
            <Share2 className="w-3 h-3" /> Share Profile
          </button>
          <button onClick={() => handleShareProfile("whatsapp")} className="px-3 py-1.5 bg-secondary rounded-lg text-xs font-medium hover:bg-secondary/80 transition-colors">WA</button>
          <button onClick={() => handleShareProfile("twitter")} className="px-3 py-1.5 bg-secondary rounded-lg text-xs font-medium hover:bg-secondary/80 transition-colors">𝕏</button>
        </div>
      </div>

      {/* Post grid */}
      <div className="grid grid-cols-3 gap-0.5">
        {posts.map(p => (
          <div key={p.id} className="aspect-square bg-secondary overflow-hidden">
            {p.media_urls && p.media_urls.length > 0 ? (
              p.media_type === "video" || p.media_type === "reel" ? (
                <video src={p.media_urls[0]} className="w-full h-full object-cover" preload="metadata" />
              ) : (
                <img src={p.media_urls[0]} className="w-full h-full object-cover" alt="" loading="lazy" />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center p-2">
                <p className="text-[10px] text-muted-foreground text-center line-clamp-4">{p.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
