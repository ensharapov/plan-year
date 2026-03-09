import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStateTransformer } from '@/hooks/useStateTransformer';
import { ArrowLeft, Skull, Sparkles, Zap, ArrowRight, RotateCcw, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';

type Phase = 'input' | 'transforming' | 'reframe' | 'result' | 'history';

export default function StateTransformer() {
  const navigate = useNavigate();
  const { saving, history, historyLoading, loadHistory, saveTransform } = useStateTransformer();

  const [phase, setPhase] = useState<Phase>('input');
  const [negative, setNegative] = useState('');
  const [positive, setPositive] = useState('');
  const [energyBefore, setEnergyBefore] = useState(3);
  const [energyAfter, setEnergyAfter] = useState(7);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleStartTransform = () => {
    if (!negative.trim()) return;
    setPhase('transforming');
    // Simulate transformation animation
    setTimeout(() => setPhase('reframe'), 2500);
  };

  const handleComplete = async () => {
    if (!positive.trim()) return;
    await saveTransform(negative.trim(), positive.trim(), energyBefore, energyAfter);
    setPhase('result');
  };

  const handleReset = () => {
    setNegative('');
    setPositive('');
    setEnergyBefore(3);
    setEnergyAfter(7);
    setPhase('input');
  };

  const energyColor = (val: number) => {
    if (val <= 3) return 'hsl(var(--energy-negative))';
    if (val <= 6) return 'hsl(var(--energy-neutral))';
    return 'hsl(var(--energy-positive))';
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full blur-[150px]"
          animate={{
            backgroundColor: phase === 'input' || phase === 'transforming'
              ? 'hsl(0 70% 50% / 0.06)'
              : 'hsl(262 80% 50% / 0.06)',
          }}
          transition={{ duration: 1.5 }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full blur-[130px]"
          animate={{
            backgroundColor: phase === 'result'
              ? 'hsl(142 60% 45% / 0.06)'
              : 'hsl(280 60% 50% / 0.05)',
          }}
          transition={{ duration: 1.5 }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPhase(phase === 'history' ? 'input' : 'history')}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <History className="h-4 w-4" />
          {phase === 'history' ? 'Новый' : 'История'}
        </Button>
      </header>

      <main className="relative z-10 flex flex-col items-center px-6 pt-4 pb-20 md:pt-12">
        <AnimatePresence mode="wait">
          {/* ======= INPUT PHASE ======= */}
          {phase === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-lg space-y-6"
            >
              {/* Title */}
              <div className="text-center space-y-3">
                <motion.div
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10"
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Skull className="h-8 w-8 text-destructive" />
                </motion.div>
                <h1 className="font-display text-3xl text-foreground md:text-4xl">
                  Трансформатор
                </h1>
                <p className="text-muted-foreground text-sm font-body">
                  Опиши «монстра» — что тебя сейчас тяготит, бесит или пугает?
                </p>
              </div>

              {/* Monster input */}
              <div className="rounded-2xl glass-strong p-6 space-y-5">
                <Textarea
                  value={negative}
                  onChange={e => setNegative(e.target.value)}
                  placeholder="Я должен делать X, но не хочу... / Меня бесит что... / Я боюсь что..."
                  className="min-h-[120px] rounded-xl bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground/50 resize-none font-body"
                  autoFocus
                />

                {/* Energy before */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground font-body">Уровень энергии сейчас</span>
                    <span
                      className="text-lg font-display font-semibold"
                      style={{ color: energyColor(energyBefore) }}
                    >
                      {energyBefore}/10
                    </span>
                  </div>
                  <Slider
                    value={[energyBefore]}
                    onValueChange={v => setEnergyBefore(v[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>

                <Button
                  onClick={handleStartTransform}
                  disabled={!negative.trim()}
                  className="w-full gap-3 rounded-2xl bg-destructive/80 hover:bg-destructive px-6 py-6 text-lg font-body font-semibold text-destructive-foreground"
                >
                  <Zap className="h-5 w-5" />
                  Трансформировать монстра
                </Button>
              </div>
            </motion.div>
          )}

          {/* ======= TRANSFORMING ANIMATION ======= */}
          {phase === 'transforming' && (
            <motion.div
              key="transforming"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 space-y-8"
            >
              {/* Monster being destroyed */}
              <div className="relative">
                <motion.div
                  className="flex h-32 w-32 items-center justify-center rounded-full bg-destructive/10 border-2 border-destructive/20"
                  animate={{
                    scale: [1, 1.2, 0.8, 1.1, 0],
                    rotate: [0, 10, -10, 15, 0],
                    borderColor: [
                      'hsl(var(--destructive) / 0.2)',
                      'hsl(var(--destructive) / 0.5)',
                      'hsl(var(--energy-neutral) / 0.5)',
                      'hsl(var(--primary) / 0.5)',
                      'hsl(var(--energy-positive) / 0.5)',
                    ],
                    backgroundColor: [
                      'hsl(var(--destructive) / 0.1)',
                      'hsl(var(--destructive) / 0.2)',
                      'hsl(var(--energy-neutral) / 0.1)',
                      'hsl(var(--primary) / 0.1)',
                      'hsl(var(--energy-positive) / 0.1)',
                    ],
                  }}
                  transition={{ duration: 2.5, ease: 'easeInOut' }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 0.5, 1.2, 1],
                      rotate: [0, -20, 20, -10, 0],
                    }}
                    transition={{ duration: 2.5, ease: 'easeInOut' }}
                  >
                    <Skull className="h-14 w-14 text-destructive" />
                  </motion.div>
                </motion.div>

                {/* Particles flying out */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 h-2 w-2 rounded-full"
                    style={{
                      background: i < 6
                        ? 'hsl(var(--destructive))'
                        : 'hsl(var(--primary))',
                    }}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                    animate={{
                      x: (Math.cos((i * Math.PI * 2) / 12)) * 120,
                      y: (Math.sin((i * Math.PI * 2) / 12)) * 120,
                      scale: [0, 1.5, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: 0.8 + i * 0.08,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </div>

              <motion.p
                className="text-muted-foreground font-body text-center"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Трансформируем энергию...
              </motion.p>
            </motion.div>
          )}

          {/* ======= REFRAME PHASE ======= */}
          {phase === 'reframe' && (
            <motion.div
              key="reframe"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-lg space-y-6"
            >
              <div className="text-center space-y-3">
                <motion.div
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 12 }}
                >
                  <Sparkles className="h-8 w-8 text-primary" />
                </motion.div>
                <h2 className="font-display text-3xl text-foreground">
                  Перефокусировка
                </h2>
                <p className="text-muted-foreground text-sm font-body">
                  Переформулируй из «Я должен» в «Я хочу». Что ты на самом деле хочешь?
                </p>
              </div>

              {/* Show original monster */}
              <div className="rounded-xl bg-destructive/5 border border-destructive/10 p-4">
                <div className="flex items-start gap-2">
                  <Skull className="h-4 w-4 text-destructive/50 mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground/60 font-body line-through decoration-destructive/30">{negative}</p>
                </div>
              </div>

              {/* Reframe input */}
              <div className="rounded-2xl glass-strong p-6 space-y-5">
                <div className="flex items-start gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground font-body">Я на самом деле хочу...</span>
                </div>
                <Textarea
                  value={positive}
                  onChange={e => setPositive(e.target.value)}
                  placeholder="Я хочу чувствовать свободу в... / Мне важно чтобы... / Я выбираю..."
                  className="min-h-[100px] rounded-xl bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground/50 resize-none font-body"
                  autoFocus
                />

                {/* Energy after */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground font-body">Уровень энергии после</span>
                    <span
                      className="text-lg font-display font-semibold"
                      style={{ color: energyColor(energyAfter) }}
                    >
                      {energyAfter}/10
                    </span>
                  </div>
                  <Slider
                    value={[energyAfter]}
                    onValueChange={v => setEnergyAfter(v[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>

                <Button
                  onClick={handleComplete}
                  disabled={!positive.trim() || saving}
                  className="w-full gap-3 rounded-2xl bg-primary hover:bg-primary/90 px-6 py-6 text-lg font-body font-semibold text-primary-foreground"
                >
                  <Sparkles className="h-5 w-5" />
                  Зафиксировать трансформацию
                </Button>
              </div>
            </motion.div>
          )}

          {/* ======= RESULT PHASE ======= */}
          {phase === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-lg space-y-6"
            >
              <div className="text-center space-y-3">
                <motion.div
                  className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[hsl(var(--energy-positive))]/10 border-2 border-[hsl(var(--energy-positive))]/30"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ duration: 0.6 }}
                >
                  <Sparkles className="h-10 w-10 text-[hsl(var(--energy-positive))]" />
                </motion.div>
                <h2 className="font-display text-3xl text-foreground">
                  Монстр <span className="text-gradient-primary">побеждён!</span> 🎉
                </h2>
              </div>

              {/* Before / After comparison */}
              <div className="space-y-3">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-xl bg-destructive/5 border border-destructive/10 p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Skull className="h-4 w-4 text-destructive/50" />
                    <span className="text-xs text-muted-foreground font-body uppercase tracking-wider">Было</span>
                    <span className="ml-auto text-sm font-body" style={{ color: energyColor(energyBefore) }}>
                      ⚡ {energyBefore}/10
                    </span>
                  </div>
                  <p className="text-sm text-foreground/60 font-body line-through decoration-destructive/30">{negative}</p>
                </motion.div>

                <div className="flex justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring' }}
                  >
                    <ArrowRight className="h-5 w-5 text-primary/40 rotate-90" />
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="rounded-xl bg-[hsl(var(--energy-positive))]/5 border border-[hsl(var(--energy-positive))]/15 p-4 glow-primary"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-xs text-muted-foreground font-body uppercase tracking-wider">Стало</span>
                    <span className="ml-auto text-sm font-body" style={{ color: energyColor(energyAfter) }}>
                      ⚡ {energyAfter}/10
                    </span>
                  </div>
                  <p className="text-sm text-foreground font-body font-medium">{positive}</p>
                </motion.div>
              </div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex gap-3 pt-4"
              >
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1 gap-2 rounded-2xl py-5"
                >
                  <RotateCcw className="h-4 w-4" />
                  Ещё монстр
                </Button>
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 gap-2 rounded-2xl py-5 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  На дашборд
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* ======= HISTORY ======= */}
          {phase === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-lg space-y-4"
            >
              <h2 className="font-display text-2xl text-foreground text-center mb-6">
                История трансформаций
              </h2>

              {history.length === 0 && !historyLoading && (
                <p className="text-center text-muted-foreground font-body text-sm py-12">
                  Пока нет трансформаций. Победи своего первого монстра!
                </p>
              )}

              {history.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl glass p-4 space-y-2"
                >
                  <div className="flex items-start gap-2">
                    <Skull className="h-3.5 w-3.5 text-destructive/40 mt-0.5 shrink-0" />
                    <p className="text-xs text-foreground/50 font-body line-through">{t.negative_state}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground/80 font-body">{t.positive_state}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-body">
                    <span style={{ color: energyColor(t.energy_before ?? 5) }}>⚡{t.energy_before}</span>
                    <span>→</span>
                    <span style={{ color: energyColor(t.energy_after ?? 5) }}>⚡{t.energy_after}</span>
                    <span className="ml-auto">
                      {new Date(t.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
