import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { X, Image, Film, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function CreatePostModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video" | "reel" | "text">("text");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    const isVideo = selected[0].type.startsWith("video/");
    setMediaType(isVideo ? "video" : "image");
    setFiles(selected);
    setPreviews(selected.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!content.trim() && files.length === 0) {
      toast.error("Add some content or media");
      return;
    }

    setUploading(true);

    let mediaUrls: string[] = [];
    if (files.length > 0) {
      for (const file of files) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("club-media").upload(path, file);
        if (error) {
          toast.error("Upload failed: " + error.message);
          setUploading(false);
          return;
        }
        const { data: urlData } = supabase.storage.from("club-media").getPublicUrl(path);
        mediaUrls.push(urlData.publicUrl);
      }
    }

    const { error } = await supabase.from("club_posts").insert({
      user_id: user.id,
      content: content.trim(),
      media_urls: mediaUrls,
      media_type: files.length > 0 ? mediaType : "text",
    });

    if (error) {
      toast.error("Failed to create post");
    } else {
      toast.success("Post created!");
      onClose();
    }
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <button onClick={onClose}><X className="w-5 h-5" /></button>
          <h2 className="font-display font-bold text-sm">Create Post</h2>
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="text-primary font-semibold text-sm disabled:opacity-40"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Share"}
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What's on your mind, inventor?"
            className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none resize-none min-h-[80px]"
            rows={3}
          />

          {/* Preview */}
          {previews.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {previews.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
                  {mediaType === "video" || mediaType === "reel" ? (
                    <video src={url} className="w-full h-full object-cover" controls />
                  ) : (
                    <img src={url} className="w-full h-full object-cover" alt="" />
                  )}
                  <button
                    onClick={() => {
                      setFiles(f => f.filter((_, idx) => idx !== i));
                      setPreviews(p => p.filter((_, idx) => idx !== i));
                    }}
                    className="absolute top-1 right-1 bg-background/80 p-1 rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Media buttons */}
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <button
              onClick={() => {
                if (fileRef.current) {
                  fileRef.current.accept = "image/*";
                  fileRef.current.click();
                }
              }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Image className="w-5 h-5 text-primary" /> Photo
            </button>
            <button
              onClick={() => {
                if (fileRef.current) {
                  fileRef.current.accept = "video/*";
                  fileRef.current.click();
                }
              }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Film className="w-5 h-5 text-accent" /> Video / Reel
            </button>
          </div>

          <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFiles} />
        </div>
      </div>
    </div>
  );
}
