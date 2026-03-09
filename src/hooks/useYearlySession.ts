import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface NegativeState {
  id?: string;
  content: string;
  reframed_content: string | null;
  sort_order: number;
}

export interface SessionData {
  sessionId: string | null;
  currentStep: number;
  negativeStates: NegativeState[];
  pointA: { content: string; energy_level: number | null };
  destination: { content: string; resonance_level: number | null };
}

export function useYearlySession() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<SessionData>({
    sessionId: null,
    currentStep: 1,
    negativeStates: [],
    pointA: { content: '', energy_level: null },
    destination: { content: '', resonance_level: null },
  });

  // Load or create session
  useEffect(() => {
    if (!user) return;
    const init = async () => {
      setLoading(true);
      const year = new Date().getFullYear();

      // Check for existing session
      const { data: existing } = await supabase
        .from('yearly_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('year', year)
        .maybeSingle();

      let sessionId: string;

      if (existing) {
        sessionId = existing.id;
        setData(prev => ({ ...prev, sessionId, currentStep: existing.current_step }));
      } else {
        const { data: created, error } = await supabase
          .from('yearly_sessions')
          .insert({ user_id: user.id, year })
          .select()
          .single();
        if (error || !created) {
          toast({ title: 'Ошибка', description: 'Не удалось создать сессию', variant: 'destructive' });
          setLoading(false);
          return;
        }
        sessionId = created.id;
        setData(prev => ({ ...prev, sessionId }));
      }

      // Load existing data
      const [negRes, pointRes, destRes] = await Promise.all([
        supabase.from('negative_states').select('*').eq('session_id', sessionId).order('sort_order'),
        supabase.from('point_a').select('*').eq('session_id', sessionId).maybeSingle(),
        supabase.from('destinations').select('*').eq('session_id', sessionId).maybeSingle(),
      ]);

      setData(prev => ({
        ...prev,
        sessionId,
        negativeStates: negRes.data?.map(n => ({
          id: n.id,
          content: n.content,
          reframed_content: n.reframed_content,
          sort_order: n.sort_order,
        })) ?? [],
        pointA: pointRes.data
          ? { content: pointRes.data.content, energy_level: pointRes.data.energy_level }
          : { content: '', energy_level: null },
        destination: destRes.data
          ? { content: destRes.data.content, resonance_level: destRes.data.resonance_level }
          : { content: '', resonance_level: null },
      }));
      setLoading(false);
    };
    init();
  }, [user]);

  const saveNegativeStates = useCallback(async (states: NegativeState[]) => {
    if (!user || !data.sessionId) return;
    setSaving(true);

    // Delete old, insert new
    await supabase.from('negative_states').delete().eq('session_id', data.sessionId);
    if (states.length > 0) {
      await supabase.from('negative_states').insert(
        states.map((s, i) => ({
          user_id: user.id,
          session_id: data.sessionId!,
          content: s.content,
          reframed_content: s.reframed_content,
          sort_order: i,
        }))
      );
    }
    setData(prev => ({ ...prev, negativeStates: states }));
    setSaving(false);
  }, [user, data.sessionId]);

  const savePointA = useCallback(async (content: string, energy_level: number | null) => {
    if (!user || !data.sessionId) return;
    setSaving(true);

    const { data: existing } = await supabase
      .from('point_a')
      .select('id')
      .eq('session_id', data.sessionId)
      .maybeSingle();

    if (existing) {
      await supabase.from('point_a').update({ content, energy_level }).eq('id', existing.id);
    } else {
      await supabase.from('point_a').insert({
        user_id: user.id,
        session_id: data.sessionId,
        content,
        energy_level,
      });
    }
    setData(prev => ({ ...prev, pointA: { content, energy_level } }));
    setSaving(false);
  }, [user, data.sessionId]);

  const saveDestination = useCallback(async (content: string, resonance_level: number | null) => {
    if (!user || !data.sessionId) return;
    setSaving(true);

    const { data: existing } = await supabase
      .from('destinations')
      .select('id')
      .eq('session_id', data.sessionId)
      .maybeSingle();

    if (existing) {
      await supabase.from('destinations').update({ content, resonance_level }).eq('id', existing.id);
    } else {
      await supabase.from('destinations').insert({
        user_id: user.id,
        session_id: data.sessionId!,
        content,
        resonance_level,
      });
    }
    setData(prev => ({ ...prev, destination: { content, resonance_level } }));
    setSaving(false);
  }, [user, data.sessionId]);

  const updateStep = useCallback(async (step: number) => {
    if (!data.sessionId) return;
    await supabase.from('yearly_sessions').update({ current_step: step }).eq('id', data.sessionId);
    setData(prev => ({ ...prev, currentStep: step }));
  }, [data.sessionId]);

  const completeSession = useCallback(async () => {
    if (!data.sessionId || !user) return;
    await supabase
      .from('yearly_sessions')
      .update({ status: 'completed' as const, current_step: 6 })
      .eq('id', data.sessionId);
    await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('user_id', user.id);
    setData(prev => ({ ...prev, currentStep: 6 }));
  }, [data.sessionId, user]);

  return {
    loading,
    saving,
    data,
    saveNegativeStates,
    savePointA,
    saveDestination,
    updateStep,
    completeSession,
  };
}
