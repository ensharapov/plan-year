
-- Buddy pairs table
CREATE TABLE public.buddy_pairs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a uuid NOT NULL,
  user_b uuid,
  invite_code text NOT NULL UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.buddy_pairs ENABLE ROW LEVEL SECURITY;

-- Users can see pairs they're part of
CREATE POLICY "Users can view own buddy pairs"
  ON public.buddy_pairs FOR SELECT TO authenticated
  USING (auth.uid() = user_a OR auth.uid() = user_b);

-- Users can create pairs (as user_a)
CREATE POLICY "Users can create buddy pairs"
  ON public.buddy_pairs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_a);

-- Users can update pairs they're part of (for accepting invites)
CREATE POLICY "Users can update buddy pairs"
  ON public.buddy_pairs FOR UPDATE TO authenticated
  USING (auth.uid() = user_a OR auth.uid() = user_b);

-- Allow anyone authenticated to look up an invite code (for joining)
CREATE POLICY "Users can find pairs by invite code"
  ON public.buddy_pairs FOR SELECT TO authenticated
  USING (status = 'pending' AND user_b IS NULL);
