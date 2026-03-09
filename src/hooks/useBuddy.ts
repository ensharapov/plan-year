import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface BuddyPair {
  id: string;
  user_a: string;
  user_b: string | null;
  invite_code: string;
  status: string;
}

export interface BuddyHeadlight {
  content: string;
  completed: boolean;
  date: string;
}

export function useBuddy() {
  const { user } = useAuth();
  const [pair, setPair] = useState<BuddyPair | null>(null);
  const [buddyName, setBuddyName] = useState<string | null>(null);
  const [buddyHeadlight, setBuddyHeadlight] = useState<BuddyHeadlight | null>(null);
  const [todayInteraction, setTodayInteraction] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const loadBuddyData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Find active pair
    const { data: pairs } = await supabase
      .from('buddy_pairs')
      .select('*')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .eq('status', 'active')
      .limit(1);

    const activePair = (pairs && pairs.length > 0) ? pairs[0] as unknown as BuddyPair : null;

    if (!activePair) {
      // Check for pending invite created by this user
      const { data: pending } = await supabase
        .from('buddy_pairs')
        .select('*')
        .eq('user_a', user.id)
        .eq('status', 'pending')
        .limit(1);

      setPair((pending && pending.length > 0) ? pending[0] as unknown as BuddyPair : null);
      setLoading(false);
      return;
    }

    setPair(activePair);

    const buddyId = activePair.user_a === user.id ? activePair.user_b : activePair.user_a;
    if (!buddyId) { setLoading(false); return; }

    // Load buddy name
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', buddyId)
      .single();
    setBuddyName(profile?.display_name || 'Бадди');

    // Load buddy's today headlight
    const { data: hl } = await supabase
      .from('headlights')
      .select('content, completed, date')
      .eq('user_id', buddyId)
      .eq('date', today)
      .maybeSingle();
    setBuddyHeadlight(hl as BuddyHeadlight | null);

    // Check if already sent "Кайфануть" today
    const { data: interactions } = await supabase
      .from('buddy_interactions')
      .select('id')
      .eq('sender_id', user.id)
      .eq('receiver_id', buddyId)
      .gte('created_at', `${today}T00:00:00`)
      .limit(1);
    setTodayInteraction((interactions?.length ?? 0) > 0);

    setLoading(false);
  }, [user, today]);

  useEffect(() => { loadBuddyData(); }, [loadBuddyData]);

  const createInvite = useCallback(async () => {
    if (!user) return null;
    setConnecting(true);
    const { data, error } = await supabase
      .from('buddy_pairs')
      .insert({ user_a: user.id })
      .select()
      .single();
    setConnecting(false);
    if (data) {
      setPair(data as unknown as BuddyPair);
      return (data as unknown as BuddyPair).invite_code;
    }
    return null;
  }, [user]);

  const joinByCode = useCallback(async (code: string) => {
    if (!user) return false;
    setConnecting(true);

    // Find pending pair with this code
    const { data: found } = await supabase
      .from('buddy_pairs')
      .select('*')
      .eq('invite_code', code.toLowerCase().trim())
      .eq('status', 'pending')
      .is('user_b', null)
      .limit(1);

    const target = found && found.length > 0 ? found[0] : null;
    if (!target || (target as any).user_a === user.id) {
      setConnecting(false);
      return false;
    }

    const { error } = await supabase
      .from('buddy_pairs')
      .update({ user_b: user.id, status: 'active' })
      .eq('id', (target as any).id);

    setConnecting(false);
    if (!error) {
      await loadBuddyData();
      return true;
    }
    return false;
  }, [user, loadBuddyData]);

  const sendKaif = useCallback(async () => {
    if (!user || !pair) return;
    const buddyId = pair.user_a === user.id ? pair.user_b : pair.user_a;
    if (!buddyId) return;

    await supabase.from('buddy_interactions').insert({
      sender_id: user.id,
      receiver_id: buddyId,
      energy_type: 'kaif',
      message: '🔥 Кайфую за тебя!',
    });
    setTodayInteraction(true);
  }, [user, pair]);

  return {
    pair,
    buddyName,
    buddyHeadlight,
    todayInteraction,
    loading,
    connecting,
    createInvite,
    joinByCode,
    sendKaif,
  };
}
