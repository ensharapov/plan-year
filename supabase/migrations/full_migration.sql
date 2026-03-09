
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Subscription status enum
CREATE TYPE public.subscription_status AS ENUM ('free', 'trial', 'active', 'cancelled', 'expired');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  subscription_status subscription_status NOT NULL DEFAULT 'free',
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Session status enum
CREATE TYPE public.session_status AS ENUM ('in_progress', 'completed');

-- Yearly sessions
CREATE TABLE public.yearly_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
  current_step INTEGER NOT NULL DEFAULT 1,
  status session_status NOT NULL DEFAULT 'in_progress',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, year)
);
ALTER TABLE public.yearly_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON public.yearly_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.yearly_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.yearly_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Negative states (Step 1: What I DON'T want)
CREATE TABLE public.negative_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.yearly_sessions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  reframed_content TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.negative_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own negative_states" ON public.negative_states FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own negative_states" ON public.negative_states FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own negative_states" ON public.negative_states FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own negative_states" ON public.negative_states FOR DELETE USING (auth.uid() = user_id);

-- Point A (Current reality)
CREATE TABLE public.point_a (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.yearly_sessions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.point_a ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own point_a" ON public.point_a FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own point_a" ON public.point_a FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own point_a" ON public.point_a FOR UPDATE USING (auth.uid() = user_id);

-- Destinations (Address in Navigator / Point B)
CREATE TABLE public.destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.yearly_sessions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  resonance_level INTEGER CHECK (resonance_level BETWEEN 1 AND 10),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own destinations" ON public.destinations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own destinations" ON public.destinations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own destinations" ON public.destinations FOR UPDATE USING (auth.uid() = user_id);

-- Headlights (Daily actions)
CREATE TABLE public.headlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.headlights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own headlights" ON public.headlights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own headlights" ON public.headlights FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own headlights" ON public.headlights FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own headlights" ON public.headlights FOR DELETE USING (auth.uid() = user_id);

-- State transforms (Negative -> Positive reframing tool)
CREATE TABLE public.state_transforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  negative_state TEXT NOT NULL,
  positive_state TEXT,
  energy_before INTEGER CHECK (energy_before BETWEEN 1 AND 10),
  energy_after INTEGER CHECK (energy_after BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.state_transforms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transforms" ON public.state_transforms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transforms" ON public.state_transforms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transforms" ON public.state_transforms FOR UPDATE USING (auth.uid() = user_id);

-- Buddy interactions
CREATE TABLE public.buddy_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  energy_type TEXT NOT NULL DEFAULT 'support',
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.buddy_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own buddy interactions" ON public.buddy_interactions
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send buddy interactions" ON public.buddy_interactions
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Energy streaks
CREATE TABLE public.streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  total_energy_logged INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streaks" ON public.streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streaks" ON public.streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streaks" ON public.streaks FOR UPDATE USING (auth.uid() = user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_yearly_sessions_updated_at BEFORE UPDATE ON public.yearly_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_point_a_updated_at BEFORE UPDATE ON public.point_a FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_destinations_updated_at BEFORE UPDATE ON public.destinations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_streaks_updated_at BEFORE UPDATE ON public.streaks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile and streak on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  INSERT INTO public.streaks (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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

CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own push subscriptions"
ON public.push_subscriptions FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
ALTER TABLE public.profiles ADD COLUMN telegram_id bigint UNIQUE;ALTER TABLE public.profiles ADD COLUMN headlight_reset_hour integer NOT NULL DEFAULT 5;