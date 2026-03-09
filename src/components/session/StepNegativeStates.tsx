import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ArrowRight, Skull } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { NegativeState } from '@/hooks/useYearlySession';

interface Props {
  initial: NegativeState[];
  onNext: (states: NegativeState[]) => void;
  saving: boolean;
}

export function StepNegativeStates({ initial, onNext, saving }: Props) {
  const [states, setStates] = useState<NegativeState[]>(
    initial.length > 0 ? initial : [{ content: '', reframed_content: null, sort_order: 0 }]
  );
  const [input, setInput] = useState('');

  const addState = () => {
    if (!input.trim()) return;
    setStates(prev => [...prev, { content: input.trim(), reframed_content: null, sort_order: prev.length }]);
    setInput('');
  };

  const removeState = (index: number) => {
    setStates(prev => prev.filter((_, i) => i !== index));
  };

  const filledStates = states.filter(s => s.content.trim());
  const canProceed = filledStates.length >= 1;

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
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10"
          animate={{ rotate: [0, -3, 3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Skull className="h-8 w-8 text-destructive" />
        </motion.div>
        <h2 className="font-display text-3xl text-foreground md:text-4xl">
          Чего я <span className="text-destructive">НЕ</span> хочу?
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
          Выгрузите всё, что вызывает сопротивление. Не фильтруйте — просто пишите. 
          Это ваш личный «слив» негатива.
        </p>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addState()}
          placeholder="Я не хочу..."
          className="glass border-destructive/20 focus-visible:ring-destructive/40"
        />
        <Button
          onClick={addState}
          disabled={!input.trim()}
          size="icon"
          variant="outline"
          className="shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        <AnimatePresence mode="popLayout">
          {states.filter(s => s.content.trim()).map((state, index) => (
            <motion.div
              key={`${state.content}-${index}`}
              layout
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -100 }}
              transition={{ duration: 0.3 }}
              className="glass group flex items-center gap-3 rounded-xl px-4 py-3 border-destructive/10 hover:border-destructive/30 transition-colors"
            >
              <span className="h-2 w-2 shrink-0 rounded-full bg-destructive/60" />
              <span className="flex-1 text-sm text-foreground/90">{state.content}</span>
              <button
                onClick={() => removeState(index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filledStates.length === 0 && (
        <p className="text-center text-sm text-muted-foreground/60 italic">
          Добавьте хотя бы одно состояние, чтобы продолжить
        </p>
      )}

      {/* Next */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={() => onNext(filledStates)}
          disabled={!canProceed || saving}
          className="gap-2 rounded-xl px-6"
        >
          Далее — рефрейминг
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
