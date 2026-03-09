import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Transform {
  id: string;
  negative_state: string;
  positive_state: string | null;
  energy_before: number | null;
  energy_after: number | null;
  created_at: string;
}

export function useStateTransformer() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<Transform[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    setHistoryLoading(true);
    const { data } = await supabase
      .from('state_transforms')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    setHistory((data as Transform[]) ?? []);
    setHistoryLoading(false);
  }, [user]);

  const saveTransform = useCallback(async (
    negative_state: string,
    positive_state: string,
    energy_before: number,
    energy_after: number
  ) => {
    if (!user) return;
    setSaving(true);
    const { data } = await supabase
      .from('state_transforms')
      .insert({
        user_id: user.id,
        negative_state,
        positive_state,
        energy_before,
        energy_after,
      })
      .select()
      .single();
    if (data) setHistory(prev => [data as Transform, ...prev]);
    setSaving(false);
    return data;
  }, [user]);

  return { saving, history, historyLoading, loadHistory, saveTransform };
}
