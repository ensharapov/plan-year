import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export function NotificationBanner() {
  const { supported, permission, isSubscribed, loading, subscribe, unsubscribe } = usePushNotifications();
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('push_banner_dismissed') === 'true';
  });

  if (!supported || isSubscribed || permission === 'denied' || dismissed) {
    return null;
  }

  const handleSubscribe = async () => {
    const success = await subscribe();
    if (success) {
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('push_banner_dismissed', 'true');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="w-full max-w-lg mb-6"
      >
        <div className="rounded-2xl glass-strong p-5 relative overflow-hidden border border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5" />

          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 z-10 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative flex items-start gap-4">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15"
            >
              <Bell className="h-6 w-6 text-primary" />
            </motion.div>

            <div className="flex-1 pr-4">
              <h3 className="font-display text-lg text-foreground mb-1">
                Не теряй свою волну 🌊
              </h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed mb-4">
                Включи уведомления — мы напомним зажечь Фары, 
                пока энергия на пике. Без спама, только кайф.
              </p>

              <Button
                onClick={handleSubscribe}
                disabled={loading}
                className="gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
              >
                <Sparkles className="h-4 w-4" />
                {loading ? 'Подключаю...' : 'Включить уведомления'}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function NotificationToggle() {
  const { supported, isSubscribed, loading, subscribe, unsubscribe } = usePushNotifications();

  if (!supported) return null;

  return (
    <button
      onClick={isSubscribed ? unsubscribe : subscribe}
      disabled={loading}
      className="flex items-center gap-2 rounded-xl glass px-3 py-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
    >
      {isSubscribed ? (
        <>
          <BellOff className="h-4 w-4" />
          <span className="hidden md:inline">Выкл</span>
        </>
      ) : (
        <>
          <Bell className="h-4 w-4" />
          <span className="hidden md:inline">Вкл</span>
        </>
      )}
    </button>
  );
}
