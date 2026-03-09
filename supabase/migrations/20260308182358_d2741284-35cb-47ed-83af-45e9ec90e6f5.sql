
CREATE TABLE public.session_desires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id uuid NOT NULL REFERENCES public.yearly_sessions(id) ON DELETE CASCADE,
  desire_key text NOT NULL,
  liked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(session_id, desire_key)
);

ALTER TABLE public.session_desires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own session_desires"
  ON public.session_desires FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own session_desires"
  ON public.session_desires FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own session_desires"
  ON public.session_desires FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
