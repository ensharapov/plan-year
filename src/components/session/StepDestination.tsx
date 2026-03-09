import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Compass, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { DesireCard } from '@/data/desireCards';

interface Props {
  initial: { content: string; resonance_level: number | null };
  likedDesires?: DesireCard[];
  onComplete: (content: string, resonance: number) => void;
  onBack: () => void;
  saving: boolean;
}

export function StepDestination({ initial, likedDesires = [], onComplete, onBack, saving }: Props) {
  const [content, setContent] = useState(initial.content);
  const [resonance, setResonance] = useState(initial.resonance_level ?? 0);

  const canProceed = content.trim().length >= 10 && resonance > 0;

  const handleSelectDesire = (desire: DesireCard) => {
    setContent(prev => prev ? prev + '\n' + desire.title + ' — ' + desire.description : desire.title + ' — ' + desire.description);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-lg space-y-8"
    >
      <div className="text-center space-y-3">
        <motion.div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 glow-primary"
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Compass className="h-8 w-8 text-primary" />
        </motion.div>
        <h2 className="font-display text-3xl text-foreground md:text-4xl">
          Адрес в <span className="text-gradient-primary">навигаторе</span>
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
          Куда вы хотите прийти? Опишите состояние, в которое хотите попасть через год.
          {likedDesires.length > 0 && ' Используйте ваши откликнувшиеся желания как вдохновение.'}
        </p>
      </div>

      {/* Liked desires as inspiration chips */}
      {likedDesires.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground font-body uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> Ваши отклики — нажмите чтобы добавить
          </span>
          <div className="flex flex-wrap gap-2">
            {likedDesires.map(d => (
              <motion.button
                key={d.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelectDesire(d)}
                className="glass rounded-lg px-3 py-1.5 text-xs font-body text-foreground/80 border-primary/10 hover:border-primary/30 transition-colors flex items-center gap-1.5"
              >
                <span>{d.emoji}</span> {d.title}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="glass rounded-xl p-5 space-y-3 gradient-border">
          <label className="text-xs text-muted-foreground font-body uppercase tracking-wider">
            Моя вдохновляющая цель
          </label>
          <Textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Через год я хочу быть в состоянии, где..."
            className="glass border-primary/20 focus-visible:ring-primary/40 min-h-[120px] resize-none"
          />
        </div>

        <div className="glass rounded-xl p-5 space-y-4">
          <label className="text-xs text-muted-foreground font-body uppercase tracking-wider">
            Насколько это откликается? (резонанс)
          </label>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map(level => (
              <motion.button
                key={level}
                onClick={() => setResonance(level)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="relative"
              >
                <Star
                  className={`h-8 w-8 transition-all duration-300 ${
                    level <= resonance ? 'text-primary fill-primary' : 'text-muted-foreground/30'
                  }`}
                />
                {level <= resonance && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 rounded-full bg-primary/20 blur-md -z-10"
                  />
                )}
              </motion.button>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground">
            {resonance === 0 && 'Оцените силу отклика'}
            {resonance === 1 && 'Слабо, но чувствуется'}
            {resonance === 2 && 'Есть интерес'}
            {resonance === 3 && 'Притягивает'}
            {resonance === 4 && 'Сильно откликается'}
            {resonance === 5 && '🔥 Мурашки! Это оно!'}
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Назад
        </Button>
        <Button
          onClick={() => onComplete(content, resonance)}
          disabled={!canProceed || saving}
          className="gap-2 rounded-xl px-6 glow-primary"
        >
          <Compass className="h-4 w-4" />
          Завершить сессию
        </Button>
      </div>
    </motion.div>
  );
}
