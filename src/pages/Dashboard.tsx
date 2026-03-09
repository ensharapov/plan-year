import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useHeadlights } from '@/hooks/useHeadlights';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useEnergyHistory } from '@/hooks/useEnergyHistory';
import { Compass, LogOut, Flame, MapPin, Zap, Check, Sparkles, Plus, Skull, Heart } from 'lucide-react';
import { EnergyChart } from '@/components/dashboard/EnergyChart';
import { EnergyLevel } from '@/components/dashboard/EnergyLevel';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BuddySection } from '@/components/BuddySection';
import { NotificationBanner, NotificationToggle } from '@/components/NotificationBanner';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { headlight, loading: hlLoading, saving, setTodayHeadlight, completeHeadlight } = useHeadlights();
  const { destination, streak, onboardingCompleted, loading: dashLoading } = useDashboardData();
  const { history: energyHistory, loading: historyLoading } = useEnergyHistory();

  const [input, setInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!dashLoading && !onboardingCompleted) {
      navigate('/', { replace: true });
    }
  }, [dashLoading, onboardingCompleted, navigate]);

  useEffect(() => {
    if (headlight?.content) setInput(headlight.content);
  }, [headlight]);

  const loading = hlLoading || dashLoading || historyLoading;

  const handleSetHeadlight = async () => {
    if (!input.trim()) return;
    await setTodayHeadlight(input.trim());
    setIsEditing(false);
  };

  const handleComplete = async () => {
    await completeHeadlight();
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Compass className="h-8 w-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  const hasHeadlight = headlight && headlight.content;
  const isCompleted = headlight?.completed;
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Путешественник';

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background */}
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
        <div className="flex items-center gap-4">
          {/* Streak badge */}
          {streak && streak.current_streak > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 border border-primary/20"
            >
              <Flame className="h-4 w-4 text-primary" />
              <span className="text-sm font-body font-semibold text-primary">{streak.current_streak}</span>
            </motion.div>
          )}
          <NotificationToggle />
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-2 text-muted-foreground hover:text-foreground">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center px-6 pt-8 pb-20 md:pt-16">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <p className="text-muted-foreground text-sm font-body mb-1">
            {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="font-display text-3xl text-foreground md:text-4xl">
            Привет, <span className="text-gradient-primary">{displayName}</span>
          </h1>
        </motion.div>

        {/* Push notification opt-in banner */}
        <NotificationBanner />

        {/* Destination card */}
        {destination && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full max-w-lg mb-8"
          >
            <div className="rounded-2xl glass-strong p-5 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
              <div className="relative flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-body uppercase tracking-wider mb-1">Адрес в навигаторе</p>
                  <p className="text-foreground font-display text-lg leading-snug">{destination}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Headlight section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-lg"
        >
          <div className="rounded-3xl glass-strong p-6 md:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-energy-neutral/3 to-transparent" />

            <div className="relative">
              {/* Section header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-energy-neutral/10">
                  <Zap className="h-6 w-6 text-[hsl(var(--energy-neutral))]" />
                </div>
                <div>
                  <h2 className="font-display text-2xl text-foreground">Фары на сегодня</h2>
                  <p className="text-sm text-muted-foreground font-body">Одно действие в кайф</p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {/* No headlight set yet */}
                {!hasHeadlight && !isEditing && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8"
                  >
                    <p className="text-muted-foreground font-body mb-6 leading-relaxed">
                      Какое одно действие в кайф ты можешь сделать сегодня,
                      чтобы продвинуться к своему Адресу?
                    </p>
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="gap-2 rounded-2xl bg-primary px-6 py-5 text-primary-foreground hover:bg-primary/90"
                    >
                      <Plus className="h-5 w-5" />
                      Включить фары
                    </Button>
                  </motion.div>
                )}

                {/* Editing */}
                {isEditing && !isCompleted && (
                  <motion.div
                    key="editing"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <Textarea
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder="Например: Позвонить Ивану и обсудить партнёрство..."
                      className="min-h-[100px] rounded-xl bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground/50 resize-none mb-4 font-body"
                      autoFocus
                    />
                    <div className="flex gap-3">
                      <Button
                        variant="ghost"
                        onClick={() => { setIsEditing(false); setInput(headlight?.content ?? ''); }}
                        className="flex-1 rounded-xl"
                      >
                        Отмена
                      </Button>
                      <Button
                        onClick={handleSetHeadlight}
                        disabled={!input.trim() || saving}
                        className="flex-1 gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Sparkles className="h-4 w-4" />
                        Зажечь фары
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Headlight set, not completed */}
                {hasHeadlight && !isEditing && !isCompleted && (
                  <motion.div
                    key="active"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div
                      className="rounded-xl bg-background/30 border border-border/30 p-4 mb-5 cursor-pointer hover:border-primary/30 transition-colors"
                      onClick={() => setIsEditing(true)}
                    >
                      <p className="text-foreground font-body leading-relaxed">{headlight!.content}</p>
                    </div>
                    <Button
                      onClick={handleComplete}
                      disabled={saving}
                      className="w-full gap-3 rounded-2xl bg-[hsl(var(--energy-positive))] px-6 py-6 text-lg font-body font-semibold text-white hover:bg-[hsl(var(--energy-positive))]/90 transition-all"
                    >
                      <Check className="h-5 w-5" />
                      Сделано! 🔥
                    </Button>
                  </motion.div>
                )}

                {/* Completed */}
                {isCompleted && (
                  <motion.div
                    key="completed"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.3, 1] }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[hsl(var(--energy-positive))]/10 border-2 border-[hsl(var(--energy-positive))]/30"
                    >
                      <Check className="h-10 w-10 text-[hsl(var(--energy-positive))]" />
                    </motion.div>
                    <h3 className="font-display text-2xl text-foreground mb-2">Отлично! 🎉</h3>
                    <p className="text-muted-foreground font-body text-sm">
                      Сегодня ты продвинулся к своему Адресу
                    </p>
                    <p className="text-foreground/60 font-body text-sm mt-3 rounded-lg bg-background/30 p-3 inline-block">
                      {headlight!.content}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Energy Level & Progress */}
        {streak && (
          <div className="w-full max-w-lg mt-8 space-y-4">
            <EnergyLevel
              totalEnergy={streak.total_energy_logged}
              currentStreak={streak.current_streak}
            />
            <EnergyChart history={energyHistory} />
          </div>
        )}

        {/* Transformer quick access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-lg mt-6"
        >
          <button
            onClick={() => navigate('/transformer')}
            className="w-full rounded-2xl glass p-5 flex items-center gap-4 hover:border-destructive/20 transition-all group cursor-pointer"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 group-hover:bg-destructive/15 transition-colors">
              <Skull className="h-6 w-6 text-destructive" />
            </div>
            <div className="text-left flex-1">
              <p className="text-foreground font-body font-medium">Трансформатор</p>
              <p className="text-xs text-muted-foreground font-body">Победи внутреннего монстра</p>
            </div>
            <Sparkles className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        </motion.div>

        {/* Desire Trainer quick access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-lg mt-3"
        >
          <button
            onClick={() => navigate('/desires')}
            className="w-full rounded-2xl glass p-5 flex items-center gap-4 hover:border-primary/20 transition-all group cursor-pointer"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <div className="text-left flex-1">
              <p className="text-foreground font-body font-medium">Тренажёр хотелок</p>
              <p className="text-xs text-muted-foreground font-body">Раскачай мышцу желания</p>
            </div>
            <Flame className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        </motion.div>

        {/* Buddy section */}
        <BuddySection />
      </main>

      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-2 w-2 rounded-full"
                style={{
                  background: `hsl(${Math.random() * 60 + 240}, 80%, 60%)`,
                }}
                initial={{
                  x: 0,
                  y: 0,
                  scale: 0,
                }}
                animate={{
                  x: (Math.random() - 0.5) * 400,
                  y: (Math.random() - 0.5) * 400,
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: Math.random() * 0.3,
                  ease: 'easeOut',
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
