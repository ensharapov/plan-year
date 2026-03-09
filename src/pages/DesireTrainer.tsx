import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, Sparkles, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SwipeCard } from '@/components/session/SwipeCard';
import { DESIRE_CARDS, type DesireCard } from '@/data/desireCards';

export default function DesireTrainer() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<DesireCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<DesireCard[]>([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    // Shuffle cards each time
    const shuffled = [...DESIRE_CARDS].sort(() => Math.random() - 0.5);
    setCards(shuffled);
  }, []);

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    const card = cards[currentIndex];
    if (direction === 'right' && card) {
      setLiked(prev => [...prev, card]);
    }
    setTimeout(() => {
      if (currentIndex + 1 >= cards.length) {
        setFinished(true);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    }, 300);
  }, [cards, currentIndex]);

  const handleRestart = () => {
    const shuffled = [...DESIRE_CARDS].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setLiked([]);
    setFinished(false);
  };

  const remaining = cards.length - currentIndex;

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[150px] animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[130px] animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
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
        {!finished && (
          <span className="text-sm text-muted-foreground font-body">
            {remaining} из {cards.length}
          </span>
        )}
      </header>

      <main className="relative z-10 flex flex-col items-center px-6 pt-4 pb-20">
        <AnimatePresence mode="wait">
          {!finished ? (
            <motion.div
              key="swipe"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-sm"
            >
              <div className="text-center mb-6">
                <h1 className="font-display text-2xl text-foreground md:text-3xl">
                  Тренажёр хотелок
                </h1>
                <p className="text-muted-foreground text-sm font-body mt-1">
                  Свайпай то, что откликается в теле 🔥
                </p>
              </div>

              {/* Card stack */}
              <div className="relative h-[420px] w-full">
                {cards.slice(currentIndex, currentIndex + 2).map((card, i) => (
                  <SwipeCard
                    key={card.key + currentIndex}
                    card={card}
                    isTop={i === 0}
                    onSwipe={handleSwipe}
                  />
                ))}
              </div>

              {/* Liked counter */}
              {liked.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-24 text-center"
                >
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-body text-primary border border-primary/20">
                    <Flame className="h-4 w-4" />
                    {liked.length} откликнулось
                  </span>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-lg space-y-6"
            >
              <div className="text-center space-y-3">
                <motion.div
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 glow-primary"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <Heart className="h-8 w-8 text-primary" />
                </motion.div>
                <h2 className="font-display text-3xl text-foreground">
                  Твои <span className="text-gradient-primary">хотелки</span>
                </h2>
                <p className="text-muted-foreground text-sm font-body">
                  {liked.length > 0
                    ? `${liked.length} из ${cards.length} — вот что откликнулось в теле`
                    : 'Ничего не откликнулось — попробуй ещё раз с чистой головой'}
                </p>
              </div>

              {liked.length > 0 && (
                <div className="grid gap-3">
                  {liked.map((card, i) => (
                    <motion.div
                      key={card.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-xl glass p-4 flex items-center gap-3"
                    >
                      <span className="text-2xl">{card.emoji}</span>
                      <div className="flex-1">
                        <p className="text-foreground font-body text-sm font-medium">{card.title}</p>
                        <span className="text-xs text-muted-foreground font-body">{card.tierLabel}</span>
                      </div>
                      <Flame className="h-4 w-4 text-primary/50" />
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleRestart}
                  className="flex-1 gap-2 rounded-2xl py-5"
                >
                  <Sparkles className="h-4 w-4" />
                  Ещё раз
                </Button>
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 gap-2 rounded-2xl py-5 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  На дашборд
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
