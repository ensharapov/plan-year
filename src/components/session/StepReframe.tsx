import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { NegativeState } from '@/hooks/useYearlySession';

interface Props {
  states: NegativeState[];
  onNext: (states: NegativeState[]) => void;
  onBack: () => void;
  saving: boolean;
}

export function StepReframe({ states, onNext, onBack, saving }: Props) {
  const [reframed, setReframed] = useState<NegativeState[]>(states);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setReframed(states.map(s => ({ ...s })));
  }, []);

  const current = reframed[activeIndex];
  const allReframed = reframed.every(s => s.reframed_content?.trim());

  const updateReframe = (value: string) => {
    setReframed(prev =>
      prev.map((s, i) => (i === activeIndex ? { ...s, reframed_content: value } : s))
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-lg space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles className="h-8 w-8 text-primary" />
        </motion.div>
        <h2 className="font-display text-3xl text-foreground md:text-4xl">
          А чего я <span className="text-gradient-primary">ХОЧУ</span>?
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
          Переверните каждое «не хочу» в «хочу». Не «избежать боли», а «прийти к радости».
        </p>
      </div>

      {/* Card counter */}
      <div className="flex items-center justify-center gap-2">
        {reframed.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === activeIndex ? 'w-8 bg-primary' : reframed[i].reframed_content?.trim() ? 'w-2 bg-primary/40' : 'w-2 bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>

      {/* Transform card */}
      {current && (
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, rotateY: 90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="space-y-4"
        >
          {/* Negative */}
          <div className="glass rounded-xl p-4 border-destructive/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-destructive" />
              <span className="text-xs text-muted-foreground font-body uppercase tracking-wider">Не хочу</span>
            </div>
            <p className="text-foreground/80 text-sm">{current.content}</p>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <RefreshCw className="h-5 w-5 text-primary/60 rotate-90" />
            </motion.div>
          </div>

          {/* Positive */}
          <div className="glass rounded-xl p-4 border-primary/20 glow-primary">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground font-body uppercase tracking-wider">Хочу вместо этого</span>
            </div>
            <Textarea
              value={current.reframed_content ?? ''}
              onChange={e => updateReframe(e.target.value)}
              placeholder="Я хочу..."
              className="glass border-primary/20 focus-visible:ring-primary/40 min-h-[80px] resize-none"
            />
          </div>
        </motion.div>
      )}

      {/* Navigation between cards */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {activeIndex > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setActiveIndex(i => i - 1)}>
              ← Пред.
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {activeIndex < reframed.length - 1 && (
            <Button variant="ghost" size="sm" onClick={() => setActiveIndex(i => i + 1)}>
              След. →
            </Button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Назад
        </Button>
        <Button
          onClick={() => onNext(reframed)}
          disabled={!allReframed || saving}
          className="gap-2 rounded-xl px-6"
        >
          Далее — Точка А
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
