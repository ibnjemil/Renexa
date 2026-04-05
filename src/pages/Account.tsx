import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";
import {
  User, Package, MessageSquare, Settings, LogOut, Plus, Brain,
  Mail, Camera, Edit3, Shield, Clock, ChevronRight, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useInventions } from "@/hooks/useInventions";
import { supabase as sb } from "@/integrations/supabase/client";
import { InventionCard } from "@/components/InventionCard";

interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  updated_at: string;
  otherName?: string;
  lastMessage?: string;
}

const AI_HISTORY_KEY = "rja_ai_chat_history";

function getAIChatHistory(): { role: string; content: string }[] {
  const stored = localStorage.getItem(AI_HISTORY_KEY);
  return stored ? JSON.parse(stored) : [];
}

const Account = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, loading, signOut, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "inventions" | "inbox" | "ai-history" | "settings">("overview");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const aiHistory = getAIChatHistory();

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user, navigate]);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setBio(profile.bio || "");
      setPhone(profile.phone || "");
      setAvatarPreview(profile.avatar_url || "");
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    const fetchConversations = async () => {
      const { data } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      if (data) {
        const enriched = await Promise.all(
          data.map(async (c) => {
            const otherId = c.participant_1 === user.id ? c.participant_2 : c.participant_1;
            const { data: otherProfile } = await supabase
              .from("profiles")
              .select("name")
              .eq("id", otherId)
              .single();
            const { data: lastMsg } = await supabase
              .from("direct_messages")
              .select("content")
              .eq("conversation_id", c.id)
              .order("created_at", { ascending: false })
              .limit(1)
              .single();
            return {
              ...c,
              otherName: otherProfile?.name || "Unknown",
              lastMessage: lastMsg?.content || "",
            };
          })
        );
        setConversations(enriched);
      }
    };
    fetchConversations();
  }, [user]);

  const { inventions: myInventions, refetch: refetchInventions } = useInventions({ userId: user?.id });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    let avatarUrl = profile?.avatar_url || null;

    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop();
      const path = `avatars/${user.id}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("club-media")
        .upload(path, avatarFile, { upsert: true });
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from("club-media").getPublicUrl(path);
        avatarUrl = urlData.publicUrl;
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update({ name, bio, phone, avatar_url: avatarUrl })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated!");
      setEditingProfile(false);
      setAvatarFile(null);
      await refreshProfile();
    }
  };

  const handleDeleteInvention = async (id: string) => {
    await sb.from("inventions").delete().eq("id", id);
    toast.success("Invention deleted");
    refetchInventions();
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Delete your account? This action cannot be undone.")) return;
    toast.error("Account deletion is not yet available. Contact support.");
  };

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !profile) return null;

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: User },
    { key: "inventions" as const, label: "My Inventions", icon: Package },
    { key: "inbox" as const, label: "Inbox", icon: Mail },
    { key: "ai-history" as const, label: "AI History", icon: Brain },
    { key: "settings" as const, label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen pt-16">
      <div className="container max-w-5xl py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8"
        >
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-border">
              {avatarPreview ? (
                <img src={avatarPreview} className="w-full h-full object-cover" alt="Avatar" />
              ) : (
                <User className="w-8 h-8 text-primary" />
              )}
            </div>
            {editingProfile && (
              <label className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-2xl cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-5 h-5 text-foreground" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold">{profile.name}</h1>
              {profile.verified && (
                <Shield className="w-4 h-4 text-primary" />
              )}
              {isAdmin && (
                <span className="text-[10px] font-display tracking-widest bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">ADMIN</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            {profile.bio && <p className="text-sm text-muted-foreground mt-1">{profile.bio}</p>}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/post")}
              className="text-xs font-display"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Post Invention
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-xs text-muted-foreground"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" /> Logout
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Overview */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Inventions", value: myInventions.length, icon: Package },
                  { label: "Messages", value: conversations.length, icon: MessageSquare },
                  { label: "AI Sessions", value: aiHistory.filter((m) => m.role === "user").length, icon: Brain },
                  { label: "Member Since", value: new Date(profile.created_at).toLocaleDateString("en", { month: "short", year: "numeric" }), icon: Clock },
                ].map((stat) => (
                  <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 space-y-2">
                    <stat.icon className="w-4 h-4 text-primary" />
                    <div className="text-2xl font-display font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Quick actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: "Post an Invention", desc: "Share your latest creation", icon: Plus, path: "/post" },
                  { label: "AI Brainstorm", desc: "Refine ideas with AI", icon: Brain, path: "/brainstorm" },
                  { label: "Inventor Club", desc: "Connect with creators", icon: MessageSquare, path: "/inventor-club" },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className="flex items-center gap-3 p-4 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <action.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold">{action.label}</div>
                      <div className="text-xs text-muted-foreground">{action.desc}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>

              {/* Recent inventions preview */}
              {myInventions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-display font-semibold text-sm">Recent Inventions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {myInventions.slice(0, 2).map((inv) => (
                      <InventionCard key={inv.id} invention={inv} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* My Inventions */}
          {activeTab === "inventions" && (
            <div className="space-y-4">
              <Button onClick={() => navigate("/post")} className="bg-primary text-primary-foreground text-xs hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-1" /> Post New Invention
              </Button>
              {myInventions.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <Package className="w-10 h-10 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground text-sm">No inventions posted yet</p>
                  <Button variant="outline" size="sm" onClick={() => navigate("/post")} className="text-xs">
                    Post Your First Invention
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myInventions.map((inv) => (
                    <div key={inv.id} className="relative group">
                      <InventionCard invention={inv} />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteInvention(inv.id);
                        }}
                        className="absolute top-2 right-2 bg-destructive/80 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      >
                        <Trash2 className="w-3 h-3 text-destructive-foreground" />
                      </button>
                      {!inv.verified && (
                        <div className="absolute bottom-2 left-2 bg-primary/20 text-primary px-2 py-0.5 rounded-full text-[10px] font-display tracking-wider">
                          PENDING REVIEW
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Inbox */}
          {activeTab === "inbox" && (
            <div className="space-y-3">
              {conversations.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <Mail className="w-10 h-10 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground text-sm">No conversations yet</p>
                  <Button variant="outline" size="sm" onClick={() => navigate("/inventor-club")} className="text-xs">
                    Find Inventors to Chat With
                  </Button>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => navigate(`/inventor-club/chat/${conv.id}`)}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold">{conv.otherName}</div>
                      <div className="text-xs text-muted-foreground truncate">{conv.lastMessage || "No messages yet"}</div>
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}

          {/* AI History */}
          {activeTab === "ai-history" && (
            <div className="space-y-3">
              {aiHistory.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <Brain className="w-10 h-10 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground text-sm">No AI brainstorm sessions yet</p>
                  <Button variant="outline" size="sm" onClick={() => navigate("/brainstorm")} className="text-xs">
                    Start Brainstorming
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {aiHistory.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground ml-auto max-w-md"
                          : "bg-card border border-border mr-auto max-w-2xl"
                      }`}
                    >
                      <div className="text-[10px] font-display tracking-wider mb-1 opacity-60">
                        {msg.role === "user" ? "YOU" : "AI"}
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content.slice(0, 300)}{msg.content.length > 300 ? "..." : ""}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings */}
          {activeTab === "settings" && (
            <div className="space-y-6 max-w-lg">
              {/* Profile editing */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-sm">Profile Information</h3>
                  <button
                    onClick={() => {
                      if (editingProfile) handleSaveProfile();
                      else setEditingProfile(true);
                    }}
                    className="text-xs text-primary font-medium"
                  >
                    {editingProfile ? "Save" : "Edit"}
                  </button>
                </div>

                {editingProfile ? (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-display tracking-widest text-muted-foreground">NAME</label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-display tracking-widest text-muted-foreground">BIO</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 resize-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-display tracking-widest text-muted-foreground">PHONE</label>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile} className="bg-primary text-primary-foreground text-xs flex-1">
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setEditingProfile(false)} className="text-xs">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span>{profile.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span>{profile.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone</span>
                      <span>{profile.phone || "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bio</span>
                      <span className="text-right max-w-[200px] truncate">{profile.bio || "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Verified</span>
                      <span>{profile.verified ? "✓ Yes" : "No"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Joined</span>
                      <span>{new Date(profile.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <h3 className="font-display font-semibold text-sm">Security</h3>
                <Button
                  variant="outline"
                  className="w-full text-xs"
                  onClick={async () => {
                    const { error } = await supabase.auth.resetPasswordForEmail(profile.email);
                    if (error) toast.error(error.message);
                    else toast.success("Password reset email sent!");
                  }}
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1" /> Send Password Reset Email
                </Button>
              </div>

              {/* Danger zone */}
              <div className="bg-card border border-destructive/20 rounded-2xl p-5 space-y-3">
                <h3 className="font-display font-semibold text-sm text-destructive">Danger Zone</h3>
                <p className="text-xs text-muted-foreground">Deleting your account is permanent and cannot be undone.</p>
                <Button variant="destructive" className="w-full text-xs" onClick={handleDeleteAccount}>
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Account
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Account;
