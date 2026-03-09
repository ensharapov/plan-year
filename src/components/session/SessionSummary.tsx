import { motion } from 'framer-motion';
import { Compass, MapPin, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SessionData } from '@/hooks/useYearlySession';
import { useNavigate } from 'react-router-dom';

interface Props {
  data: SessionData;
}

export function SessionSummary({ data }: Props) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-lg space-y-8"
    >
      {/* Celebration */}
      <div className="text-center space-y-4">
        <motion.div
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 glow-primary"
          animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles className="h-10 w-10 text-primary" />
        </motion.div>
        <h2 className="font-display text-4xl text-foreground md:text-5xl">
          Маршрут <span className="text-gradient-primary">проложен!</span>
        </h2>
        <p className="text-muted-foreground text-sm">
          Вы сделали первый и самый важный шаг — определили направление.
        </p>
      </div>

      {/* Summary cards */}
      <div className="space-y-4">
        {/* Point A */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-5 space-y-2"
        >
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent" />
            <span className="text-xs text-muted-foreground font-body uppercase tracking-wider">Точка А — Сейчас</span>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">{data.pointA.content}</p>
          {data.pointA.energy_level && (
            <div className="flex items-center gap-2 mt-2">
              <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${(data.pointA.energy_level / 10) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{data.pointA.energy_level}/10</span>
            </div>
          )}
        </motion.div>

        {/* Arrow */}
        <div className="flex justify-center">
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ArrowRight className="h-5 w-5 text-primary/40 rotate-90" />
          </motion.div>
        </div>

        {/* Destination */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-xl p-5 space-y-2 gradient-border glow-primary"
        >
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground font-body uppercase tracking-wider">Адрес в навигаторе</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed font-medium">{data.destination.content}</p>
          {data.destination.resonance_level && (
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map(i => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: i <= data.destination.resonance_level! ? 1 : 0.2, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className={`text-sm ${i <= data.destination.resonance_level! ? 'text-primary' : 'text-muted-foreground/30'}`}
                >
                  ★
                </motion.span>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Reframed states preview */}
      {data.negativeStates.filter(s => s.reframed_content).length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="glass rounded-xl p-5 space-y-3"
        >
          <span className="text-xs text-muted-foreground font-body uppercase tracking-wider">
            Трансформированные состояния
          </span>
          <div className="space-y-2">
            {data.negativeStates.filter(s => s.reframed_content).map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Sparkles className="h-3 w-3 text-primary mt-1 shrink-0" />
                <span className="text-foreground/80">{s.reframed_content}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="text-center pt-4"
      >
        <Button
          onClick={() => navigate('/dashboard')}
          size="lg"
          className="gap-3 rounded-2xl px-8 py-6 text-lg glow-primary"
        >
          <Compass className="h-5 w-5" />
          В навигатор
        </Button>
      </motion.div>
    </motion.div>
  );
}
