import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Compass, LogOut, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

const Index = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { onboardingCompleted, loading } = useDashboardData();

  // Redirect to dashboard if onboarding is done
  useEffect(() => {
    if (!loading && onboardingCompleted) {
      navigate('/dashboard', { replace: true });
    }
  }, [loading, onboardingCompleted, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-1/5 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[150px] animate-glow-pulse" />
        <div className="absolute bottom-1/5 right-1/3 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[130px] animate-glow-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Compass className="h-5 w-5 text-primary" />
          </div>
          <span className="font-display text-xl text-foreground">Навигатор</span>
        </div>
        <Button variant="ghost" size="sm" onClick={signOut} className="gap-2 text-muted-foreground hover:text-foreground">
          <LogOut className="h-4 w-4" />
          Выйти
        </Button>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-20 pb-10 md:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl text-center"
        >
          <motion.div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 glow-primary"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="h-10 w-10 text-primary" />
          </motion.div>

          <h1 className="font-display text-5xl font-medium tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Добро пожаловать,
            <br />
            <span className="text-gradient-primary">
              {user?.user_metadata?.display_name || 'Путешественник'}
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-lg text-lg text-muted-foreground leading-relaxed">
            Ваш навигатор состояний готов к работе. Начните с годовой сессии планирования, чтобы определить свой маршрут.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10"
          >
            <Button
              size="lg"
              onClick={() => navigate('/session')}
              className="gap-3 rounded-2xl bg-primary px-8 py-6 text-lg font-medium text-primary-foreground transition-all duration-300 hover:glow-primary hover:bg-primary/90"
            >
              <Compass className="h-5 w-5" />
              Начать годовую сессию
            </Button>
          </motion.div>
        </motion.div>

        {/* Decorative floating elements */}
        <div className="pointer-events-none absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-primary/30"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 3) * 20}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.5,
              }}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
