
CREATE TABLE public.inventions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  inventor_name TEXT NOT NULL DEFAULT '',
  inventor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  location TEXT DEFAULT '',
  thumbnail TEXT DEFAULT '',
  gallery TEXT[] DEFAULT '{}',
  video_url TEXT DEFAULT '',
  explanation TEXT NOT NULL DEFAULT '',
  use_case TEXT NOT NULL DEFAULT '',
  industrial_application TEXT DEFAULT '',
  prototype_date TEXT DEFAULT '',
  patent_status TEXT NOT NULL DEFAULT 'none',
  milestone TEXT DEFAULT '',
  velocity_score INTEGER NOT NULL DEFAULT 10,
  feasibility_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT false,
  global_priority BOOLEAN NOT NULL DEFAULT false,
  fraud_flag BOOLEAN NOT NULL DEFAULT false,
  category TEXT NOT NULL DEFAULT 'Other',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.inventions ENABLE ROW LEVEL SECURITY;

-- Everyone can view verified inventions
CREATE POLICY "Verified inventions are viewable by everyone"
  ON public.inventions FOR SELECT
  USING (verified = true);

-- Admins can view all inventions
CREATE POLICY "Admins can view all inventions"
  ON public.inventions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own inventions
CREATE POLICY "Users can view own inventions"
  ON public.inventions FOR SELECT
  TO authenticated
  USING (auth.uid() = inventor_id);

-- Authenticated users can create inventions
CREATE POLICY "Users can create inventions"
  ON public.inventions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = inventor_id);

-- Users can update their own inventions
CREATE POLICY "Users can update own inventions"
  ON public.inventions FOR UPDATE
  TO authenticated
  USING (auth.uid() = inventor_id);

-- Admins can update any invention
CREATE POLICY "Admins can update any invention"
  ON public.inventions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete inventions
CREATE POLICY "Admins can delete inventions"
  ON public.inventions FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Users can delete their own inventions
CREATE POLICY "Users can delete own inventions"
  ON public.inventions FOR DELETE
  TO authenticated
  USING (auth.uid() = inventor_id);
