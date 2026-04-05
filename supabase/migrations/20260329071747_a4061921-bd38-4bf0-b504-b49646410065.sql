
-- Club posts (images, videos, text)
CREATE TABLE public.club_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  media_urls TEXT[] DEFAULT '{}',
  media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video', 'reel', 'text')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Follows
CREATE TABLE public.club_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Likes
CREATE TABLE public.club_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.club_posts(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Comments
CREATE TABLE public.club_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  post_id UUID REFERENCES public.club_posts(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Conversations (DMs)
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  participant_2 UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(participant_1, participant_2)
);

-- Direct messages
CREATE TABLE public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.club_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

-- RLS: Posts are publicly readable, only owner can insert/update/delete
CREATE POLICY "Posts are viewable by everyone" ON public.club_posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON public.club_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.club_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.club_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS: Follows are publicly readable
CREATE POLICY "Follows are viewable by everyone" ON public.club_follows FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON public.club_follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.club_follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);

-- RLS: Likes are publicly readable
CREATE POLICY "Likes are viewable by everyone" ON public.club_likes FOR SELECT USING (true);
CREATE POLICY "Users can like" ON public.club_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON public.club_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS: Comments are publicly readable
CREATE POLICY "Comments are viewable by everyone" ON public.club_comments FOR SELECT USING (true);
CREATE POLICY "Users can comment" ON public.club_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.club_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS: Conversations only visible to participants
CREATE POLICY "Users can view own conversations" ON public.conversations FOR SELECT TO authenticated USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- RLS: Messages only visible to conversation participants
CREATE POLICY "Users can view own messages" ON public.direct_messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid()))
);
CREATE POLICY "Users can send messages" ON public.direct_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id AND
  EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid()))
);
CREATE POLICY "Users can mark messages read" ON public.direct_messages FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid()))
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;

-- Storage bucket for club media
INSERT INTO storage.buckets (id, name, public) VALUES ('club-media', 'club-media', true);

-- Storage policies
CREATE POLICY "Anyone can view club media" ON storage.objects FOR SELECT USING (bucket_id = 'club-media');
CREATE POLICY "Authenticated users can upload club media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'club-media');
CREATE POLICY "Users can delete own club media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'club-media' AND (storage.foldername(name))[1] = auth.uid()::text);
