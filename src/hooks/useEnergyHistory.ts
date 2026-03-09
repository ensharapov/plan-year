import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, subDays } from 'date-fns';

export interface EnergyDay {
  date: string;
  label: string;
  completed: boolean;
  energy: number;
}

const DAY_LABELS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

export function useEnergyHistory(days = 7) {
  const { user } = useAuth();
  const [history, setHistory] = useState<EnergyDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const startDate = format(subDays(new Date(), days - 1), 'yyyy-MM-dd');

      const { data } = await supabase
        .from('headlights')
        .select('date, completed, energy_level')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .order('date', { ascending: true });

      const map = new Map((data ?? []).map(d => [d.date, d]));
      const result: EnergyDay[] = [];

      for (let i = days - 1; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const dateStr = format(d, 'yyyy-MM-dd');
        const entry = map.get(dateStr);
        result.push({
          date: dateStr,
          label: DAY_LABELS[d.getDay()],
          completed: entry?.completed ?? false,
          energy: entry?.completed ? (entry.energy_level ?? 1) : 0,
        });
      }

      setHistory(result);
      setLoading(false);
    };
    load();
  }, [user, days]);

  return { history, loading };
}
