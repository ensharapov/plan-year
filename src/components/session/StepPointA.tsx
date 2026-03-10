import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';

interface Props {
  initial: { content: string; energy_level: number | null };
  onNext: (content: string, energy: number) => void;
  onBack: () => void;
  saving: boolean;
}

const energyLabels: Record<number, string> = {
  1: '😩 На дне',
  2: '😔 Тяжело',
  3: '😐 Нормально',
  4: '🙂 Неплохо',
  5: '😊 Хорошо',
  6: '✨ Отлично',
  7: '🔥 На подъёме',
  8: '💫 Вдохновлён',
  9: '⚡ Энергия бьёт ключом',
  10: '🚀 Максимум!',
};

export function StepPointA({ initial, onNext, onBack, saving }: Props) {
  const [content, setContent] = useState(() => localStorage.getItem('draft_step_pointa_content') || initial.content);
  const [energy, setEnergy] = useState(() => {
    const draft = localStorage.getItem('draft_step_pointa_energy');
    return draft ? Number(draft) : (initial.energy_level ?? 5);
  });

  useEffect(() => {
    localStorage.setItem('draft_step_pointa_content', content);
    localStorage.setItem('draft_step_pointa_energy', energy.toString());
  }, [content, energy]);

  const handleNext = () => {
    localStorage.removeItem('draft_step_pointa_content');
    localStorage.removeItem('draft_step_pointa_energy');
    onNext(content, energy);
  };

  const canProceed = content.trim().length >= 10;

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
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <MapPin className="h-8 w-8 text-accent" />
        </motion.div>
        <h2 className="font-display text-3xl text-foreground md:text-4xl">
          Точка <span className="text-gradient-primary">А</span>
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
          Опишите, где вы сейчас находитесь. Честно и без оценок. Это ваша отправная точка.
        </p>
      </div>

      <div className="space-y-6">
        <div className="glass rounded-xl p-5 space-y-3">
          <label className="text-xs text-muted-foreground font-body uppercase tracking-wider">
            Моя текущая реальность
          </label>
          <Textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Сейчас я нахожусь в ситуации, где..."
            className="glass border-accent/20 focus-visible:ring-accent/40 min-h-[120px] resize-none"
          />
        </div>

        <div className="glass rounded-xl p-5 space-y-4">
          <label className="text-xs text-muted-foreground font-body uppercase tracking-wider">
            Уровень энергии прямо сейчас
          </label>
          <Slider
            value={[energy]}
            onValueChange={v => setEnergy(v[0])}
            min={1}
            max={10}
            step={1}
            className="py-2"
          />
          <motion.div
            key={energy}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <span className="text-2xl">{energyLabels[energy]?.split(' ')[0]}</span>
            <p className="text-sm text-muted-foreground mt-1">{energyLabels[energy]?.split(' ').slice(1).join(' ')}</p>
          </motion.div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Назад
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed || saving}
          className="gap-2 rounded-xl px-6"
        >
          Далее — Навигатор
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
