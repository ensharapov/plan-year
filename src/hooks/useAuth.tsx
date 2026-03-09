import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { isTelegramWebApp, getTelegramWebApp } from '@/hooks/useTelegramAuth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isTelegram: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isTelegram = isTelegramWebApp();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      // Don't set loading=false here if we still need to do Telegram auth
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session.user);
        setLoading(false);
        return;
      }

      // No existing session — try Telegram auto-auth
      if (isTelegram) {
        console.log('[Auth] Telegram WebApp detected, attempting auto-auth...');
        try {
          const tg = getTelegramWebApp();
          if (tg?.initData) {
            console.log('[Auth] initData present, calling telegram-auth function...');
            const { data, error: fnError } = await supabase.functions.invoke('telegram-auth', {
              body: { initData: tg.initData },
            });

            if (fnError) {
              console.error('[Auth] Telegram auth function error:', fnError);
            } else if (data?.error) {
              console.error('[Auth] Telegram auth returned error:', data.error);
            } else if (data?.access_token && data?.refresh_token) {
              console.log('[Auth] Telegram auth success, setting session...');
              const { error: sessionError } = await supabase.auth.setSession({
                access_token: data.access_token,
                refresh_token: data.refresh_token,
              });
              if (sessionError) {
                console.error('[Auth] Failed to set session:', sessionError);
              }
              // onAuthStateChange will update user/session
              setLoading(false);
              return;
            }
          } else {
            console.log('[Auth] Telegram WebApp detected but no initData');
          }
        } catch (err) {
          console.error('[Auth] Telegram auth error:', err);
        }
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: displayName },
      },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isTelegram, signUp, signIn, signInWithMagicLink, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
