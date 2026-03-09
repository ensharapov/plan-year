import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

// Check if running inside Telegram WebView
export function isTelegramWebApp(): boolean {
  try {
    // 1. Direct object check (if scripts loaded fast enough)
    if ((window as any).Telegram?.WebApp?.initData) {
      return true;
    }
    // 2. Fallback check: look for tgWebAppStartParam or tgWebAppData in URL
    // since Telegram injects this before the script finishes evaluating
    const searchParams = new URLSearchParams(window.location.hash.slice(1) || window.location.search);
    if (searchParams.has('tgWebAppData') || searchParams.has('tgWebAppStartParam')) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function getTelegramWebApp() {
  return (window as any).Telegram?.WebApp;
}

export function useTelegramAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isTelegram = isTelegramWebApp();

  const authenticate = useCallback(async () => {
    const tg = getTelegramWebApp();
    if (!tg?.initData) {
      setError('Not in Telegram WebApp');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('telegram-auth', {
        body: { initData: tg.initData },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      // Set the session in Supabase client
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });

      if (sessionError) throw sessionError;

      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка авторизации через Telegram';
      setError(msg);
      console.error('Telegram auth error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { isTelegram, loading, error, authenticate };
}
