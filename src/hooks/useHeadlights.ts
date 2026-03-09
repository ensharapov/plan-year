import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Headlight {
  id: string;
  content: string;
  completed: boolean;
  completed_at: string | null;
  energy_level: number | null;
  date: string;
}

/**
 * Returns today's "headlight date" based on a custom reset hour.
 * E.g. if resetHour=5 and it's 03:00 local time, the headlight date is still "yesterday".
 */
function getHeadlightDate(resetHour: number): string {
  const now = new Date();
  const adjusted = new Date(now);
  // If current hour is before reset, it's still "yesterday's" headlight
  if (now.getHours() < resetHour) {
    adjusted.setDate(adjusted.getDate() - 1);
  }
  return `${adjusted.getFullYear()}-${String(adjusted.getMonth() + 1).padStart(2, '0')}-${String(adjusted.getDate()).padStart(2, '0')}`;
}

export function useHeadlights() {
  const { user } = useAuth();
  const [headlight, setHeadlight] = useState<Headlight | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetHour, setResetHour] = useState(5);

  const today = getHeadlightDate(resetHour);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);

      // Fetch reset hour from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('headlight_reset_hour')
        .eq('user_id', user.id)
        .single();

      const hour = (profile as any)?.headlight_reset_hour ?? 5;
      setResetHour(hour);
      const date = getHeadlightDate(hour);

      const { data } = await supabase
        .from('headlights')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .maybeSingle();

      setHeadlight(data as Headlight | null);
      setLoading(false);
    };
    load();
  }, [user]);

  const setTodayHeadlight = useCallback(async (content: string) => {
    if (!user) return;
    setSaving(true);

    if (headlight) {
      const { data } = await supabase
        .from('headlights')
        .update({ content })
        .eq('id', headlight.id)
        .select()
        .single();
      if (data) setHeadlight(data as Headlight);
    } else {
      const { data } = await supabase
        .from('headlights')
        .insert({ user_id: user.id, content, date: today })
        .select()
        .single();
      if (data) setHeadlight(data as Headlight);
    }
    setSaving(false);
  }, [user, headlight, today]);

  const completeHeadlight = useCallback(async () => {
    if (!user || !headlight) return;
    setSaving(true);

    const { data } = await supabase
      .from('headlights')
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq('id', headlight.id)
      .select()
      .single();

    if (data) setHeadlight(data as Headlight);

    // Update streak
    await supabase
      .from('streaks')
      .update({
        last_activity_date: today,
        current_streak: (await supabase
          .from('streaks')
          .select('current_streak, last_activity_date')
          .eq('user_id', user.id)
          .single()
          .then(r => {
            const s = r.data;
            if (!s) return 1;
            const lastDate = s.last_activity_date;
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
            return lastDate === yesterdayStr ? s.current_streak + 1 : 1;
          })),
        total_energy_logged: (await supabase
          .from('streaks')
          .select('total_energy_logged')
          .eq('user_id', user.id)
          .single()
          .then(r => (r.data?.total_energy_logged ?? 0) + 1)),
      })
      .eq('user_id', user.id);

    setSaving(false);
  }, [user, headlight, today]);

  return { headlight, loading, saving, resetHour, setTodayHeadlight, completeHeadlight };
}
