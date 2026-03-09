import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface DashboardData {
  destination: string | null;
  streak: { current_streak: number; longest_streak: number; total_energy_logged: number } | null;
  onboardingCompleted: boolean;
}

export function useDashboardData() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({
    destination: null,
    streak: null,
    onboardingCompleted: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const [profileRes, destRes, streakRes] = await Promise.all([
        supabase.from('profiles').select('onboarding_completed').eq('user_id', user.id).single(),
        supabase.from('destinations').select('content').eq('user_id', user.id).eq('is_active', true).maybeSingle(),
        supabase.from('streaks').select('current_streak, longest_streak, total_energy_logged').eq('user_id', user.id).single(),
      ]);

      setData({
        onboardingCompleted: profileRes.data?.onboarding_completed ?? false,
        destination: destRes.data?.content ?? null,
        streak: streakRes.data ?? null,
      });
      setLoading(false);
    };
    load();
  }, [user]);

  return { ...data, loading };
}
