import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

import { Button } from '@/components/ui/button';
import { Compass, Loader2, Send } from 'lucide-react';

const Auth = () => {
  const { user, loading, isTelegram } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          {isTelegram && <p className="text-sm text-muted-foreground font-body">Вход через Telegram...</p>}
        </div>
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px] animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <motion.div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 glow-primary"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Compass className="h-8 w-8 text-primary" />
          </motion.div>
          <h1 className="font-display text-4xl font-medium tracking-tight text-foreground">
            Навигатор
          </h1>
          <p className="mt-2 font-display text-lg text-muted-foreground">
            Состояний
          </p>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-2xl p-8 text-center space-y-4">
          <h2 className="font-display text-2xl text-foreground">
            Вход только через Telegram
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Пожалуйста, откройте это приложение внутри нашего Telegram-бота.
          </p>
          <Button
            onClick={() => window.location.href = 'https://t.me/roskosh_byt_soboy_bot/headlights'}
            className="mt-6 w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-12 text-base font-medium transition-all duration-300 hover:glow-primary"
          >
            <Send className="h-4 w-4" />
            Открыть бота в Telegram
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
