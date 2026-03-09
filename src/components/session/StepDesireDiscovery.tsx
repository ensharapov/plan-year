import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Flame, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SwipeCard } from '@/components/session/SwipeCard';
import { DESIRE_CARDS, type DesireCard } from '@/data/desireCards';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  sessionId: string;
  onNext: (likedDesires: DesireCard[]) => void;
  onBack: () => void;
  saving: boolean;
}

export function StepDesireDiscovery({ sessionId, onNext, onBack, saving }: Props) {
  const { user } = useAuth();
  const [cards, setCards] = useState<DesireCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<DesireCard[]>([]);
  const [done, setDone] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Shuffle and load
  useEffect(() => {
    const loadExisting = async () => {
      if (!user) return;
      // Check for existing swipes
      const { data: existing } = await supabase
        .from('session_desires')
        .select('desire_key, liked')
        .eq('session_id', sessionId);

      if (existing && existing.length > 0) {
        // Already swiped - show results
        const likedKeys = new Set(existing.filter(e => e.liked).map(e => e.desire_key));
        setLiked(DESIRE_CARDS.filter(c => likedKeys.has(c.key)));
        setDone(true);
      } else {
        // Shuffle cards
        const shuffled = [...DESIRE_CARDS].sort(() => Math.random() - 0.5);
        setCards(shuffled);
      }
      setLoaded(true);
    };
    loadExisting();
  }, [user, sessionId]);

  const handleSwipe = useCallback(async (direction: 'left' | 'right') => {
    if (!user || currentIndex >= cards.length) return;

    const card = cards[currentIndex];
    const isLiked = direction === 'right';

    // Save to DB
    await supabase.from('session_desires').insert({
      user_id: user.id,
      session_id: sessionId,
      desire_key: card.key,
      liked: isLiked,
    });

    if (isLiked) {
      setLiked(prev => [...prev, card]);
    }

    // Small delay for animation
    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      if (nextIndex >= cards.length) {
        setDone(true);
      }
    }, 300);
  }, [user, sessionId, cards, currentIndex]);

  if (!loaded) return null;

  // Showcase of True Desires
  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-lg space-y-8"
      >
        <div className="text-center space-y-3">
          <motion.div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 glow-primary"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="h-8 w-8 text-primary" />
          </motion.div>
          <h2 className="font-display text-3xl text-foreground md:text-4xl">
            Витрина <span className="text-gradient-primary">истинных желаний</span>
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            {liked.length > 0
              ? 'Это то, что вызвало отклик в теле. Не в голове — в теле.'
              : 'Ни одно желание не вызвало отклика. Это тоже важный сигнал — возможно, ваши истинные желания ещё не в этом списке.'}
          </p>
        </div>

        {liked.length > 0 && (
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {liked.map((card, i) => (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-4 flex items-center gap-4 border-primary/10"
              >
                <span className="text-3xl">{card.emoji}</span>
                <div className="flex-1">
                  <h4 className="text-sm font-body font-medium text-foreground">{card.title}</h4>
                  <p className="text-xs text-muted-foreground">{card.tierLabel}</p>
                </div>
                <Flame className="h-4 w-4 text-orange-400 shrink-0" />
              </motion.div>
            ))}
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Button>
          <Button
            onClick={() => onNext(liked)}
            disabled={saving}
            className="gap-2 rounded-xl px-6"
          >
            Далее — Точка А
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    );
  }

  // Swipe interface
  const remaining = cards.length - currentIndex;
  const progress = cards.length > 0 ? ((currentIndex) / cards.length) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-lg space-y-6"
    >
      <div className="text-center space-y-3">
        <motion.div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Flame className="h-8 w-8 text-orange-400" />
        </motion.div>
        <h2 className="font-display text-3xl text-foreground md:text-4xl">
          Что <span className="text-gradient-primary">откликается</span>?
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Не думайте — чувствуйте. Свайп вправо <span className="text-orange-400">🔥</span> только если 
          почувствовали искру в теле. Влево <span className="text-blue-400">🥶</span> — если только «в голове».
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-1">
        <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground font-body">
          <span>Откликнулось: {liked.length}</span>
          <span>Осталось: {remaining}</span>
        </div>
      </div>

      {/* Card stack */}
      <div className="relative mx-auto h-[420px] w-full max-w-[340px]">
        <AnimatePresence>
          {cards.slice(currentIndex, currentIndex + 2).reverse().map((card, stackIndex) => (
            <SwipeCard
              key={card.key}
              card={card}
              isTop={stackIndex === (Math.min(cards.length - currentIndex, 2) - 1)}
              onSwipe={handleSwipe}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Skip back */}
      <div className="flex justify-start pt-16">
        <Button variant="ghost" onClick={onBack} className="gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          Назад
        </Button>
      </div>
    </motion.div>
  );
}
