import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Flame, Zap, Star, Sun } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface LevelInfo {
  name: string;
  icon: React.ElementType;
  min: number;
  max: number;
  color: string;
  glow: string;
}

const LEVELS: LevelInfo[] = [
  { name: 'Искра', icon: Zap, min: 0, max: 3, color: 'text-muted-foreground', glow: 'from-muted/10' },
  { name: 'Пламя', icon: Flame, min: 3, max: 7, color: 'text-[hsl(var(--energy-neutral))]', glow: 'from-[hsl(var(--energy-neutral))]/10' },
  { name: 'Огонь', icon: Flame, min: 7, max: 14, color: 'text-destructive', glow: 'from-destructive/10' },
  { name: 'Звезда', icon: Star, min: 14, max: 30, color: 'text-primary', glow: 'from-primary/10' },
  { name: 'Сверхновая', icon: Sun, min: 30, max: 100, color: 'text-accent', glow: 'from-accent/10' },
];

function getLevel(total: number): { current: LevelInfo; progress: number; next: LevelInfo | null } {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (total >= LEVELS[i].min) {
      const current = LEVELS[i];
      const next = i < LEVELS.length - 1 ? LEVELS[i + 1] : null;
      const range = (next?.min ?? current.max) - current.min;
      const progress = Math.min(((total - current.min) / range) * 100, 100);
      return { current, progress, next };
    }
  }
  return { current: LEVELS[0], progress: 0, next: LEVELS[1] };
}

interface Props {
  totalEnergy: number;
  currentStreak: number;
}

export function EnergyLevel({ totalEnergy, currentStreak }: Props) {
  const { current, progress, next } = getLevel(totalEnergy);
  const Icon = current.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg"
    >
      <div className="rounded-2xl glass-strong p-5 relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${current.glow} to-transparent`} />
        <div className="relative">
          {/* Level header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                key={current.name}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-background/30 border border-border/30`}
              >
                <Icon className={`h-6 w-6 ${current.color}`} />
              </motion.div>
              <div>
                <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">Уровень энергии</p>
                <h3 className={`font-display text-xl ${current.color}`}>{current.name}</h3>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-background/30 px-3 py-1.5 border border-border/30">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-sm font-body font-semibold text-foreground">{totalEnergy}</span>
            </div>
          </div>

          {/* Progress bar */}
          {next && (
            <div className="space-y-2">
              <Progress
                value={progress}
                className="h-2.5 bg-background/30"
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground font-body">
                  {totalEnergy - current.min} / {next.min - current.min} фар
                </p>
                <p className="text-xs text-muted-foreground font-body flex items-center gap-1">
                  Далее: <span className="text-foreground font-medium">{next.name}</span>
                  {(() => { const NextIcon = next.icon; return <NextIcon className="h-3 w-3" />; })()}
                </p>
              </div>
            </div>
          )}

          {!next && (
            <p className="text-sm text-muted-foreground font-body text-center py-2">
              🌟 Максимальный уровень достигнут!
            </p>
          )}

          {/* Streak flame row */}
          {currentStreak > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: Math.min(currentStreak, 7) }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, y: 10 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: i * 0.05, type: 'spring' }}
                    className="-ml-1 first:ml-0"
                  >
                    <Flame className="h-4 w-4 text-[hsl(var(--energy-neutral))]" />
                  </motion.div>
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-body">
                {currentStreak} {currentStreak === 1 ? 'день' : currentStreak < 5 ? 'дня' : 'дней'} подряд
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
