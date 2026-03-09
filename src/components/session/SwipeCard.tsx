import { useState, useCallback } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Flame, Snowflake } from 'lucide-react';
import type { DesireCard } from '@/data/desireCards';

interface Props {
  card: DesireCard;
  onSwipe: (direction: 'left' | 'right') => void;
  isTop: boolean;
}

export function SwipeCard({ card, onSwipe, isTop }: Props) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-25, 0, 25]);
  const fireOpacity = useTransform(x, [0, 100, 200], [0, 0.5, 1]);
  const iceOpacity = useTransform(x, [-200, -100, 0], [1, 0.5, 0]);
  const scale = useTransform(x, [-300, 0, 300], [0.95, 1, 0.95]);

  const [exitX, setExitX] = useState(0);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      setExitX(500);
      onSwipe('right');
    } else if (info.offset.x < -threshold) {
      setExitX(-500);
      onSwipe('left');
    }
  }, [onSwipe]);

  const handleButtonSwipe = (direction: 'left' | 'right') => {
    setExitX(direction === 'right' ? 500 : -500);
    onSwipe(direction);
  };

  if (!isTop) {
    return (
      <motion.div
        className="absolute inset-0 rounded-3xl glass-strong overflow-hidden"
        style={{ scale: 0.95, y: 10 }}
        initial={false}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-30`} />
      </motion.div>
    );
  }

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
      style={{ x, rotate, scale }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      animate={exitX !== 0 ? { x: exitX, opacity: 0, transition: { duration: 0.3 } } : {}}
    >
      <div className="relative h-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl" style={{ background: 'hsl(230, 25%, 10%)' }}>
        {/* Gradient bg */}
        <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient}`} />
        {/* Light accent at top-left */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08)_0%,transparent_50%)]" />

        {/* Fire overlay (right swipe) */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-orange-500/30 to-red-500/30 rounded-3xl"
          style={{ opacity: fireOpacity }}
        />
        <motion.div
          className="absolute top-6 right-6 flex items-center gap-2 rounded-xl bg-orange-500/90 px-4 py-2 text-sm font-body font-semibold text-white shadow-lg z-10"
          style={{ opacity: fireOpacity }}
        >
          <Flame className="h-4 w-4" /> ОТКЛИКАЕТСЯ!
        </motion.div>

        {/* Ice overlay (left swipe) */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-slate-500/20 rounded-3xl"
          style={{ opacity: iceOpacity }}
        />
        <motion.div
          className="absolute top-6 left-6 flex items-center gap-2 rounded-xl bg-blue-500/80 px-4 py-2 text-sm font-body font-semibold text-white shadow-lg z-10"
          style={{ opacity: iceOpacity }}
        >
          <Snowflake className="h-4 w-4" /> НЕ МОЁ
        </motion.div>

        {/* Card content */}
        <div className="relative z-[1] flex h-full flex-col items-center justify-center p-8 text-center">
          <motion.span
            className="text-8xl mb-6 drop-shadow-lg"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            {card.emoji}
          </motion.span>

          <span className="inline-block rounded-full bg-white/15 backdrop-blur-sm px-4 py-1.5 text-xs font-body text-white/90 mb-4 border border-white/15">
            {card.tierLabel}
          </span>

          <h3 className="font-display text-3xl text-white mb-3 md:text-4xl drop-shadow-md">
            {card.title}
          </h3>

          <p className="text-white/70 text-sm leading-relaxed max-w-xs font-body">
            {card.description}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute -bottom-20 left-0 right-0 flex items-center justify-center gap-8">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleButtonSwipe('left')}
          className="flex h-16 w-16 items-center justify-center rounded-full glass border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors"
        >
          <Snowflake className="h-7 w-7" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleButtonSwipe('right')}
          className="flex h-20 w-20 items-center justify-center rounded-full glass border-orange-500/30 text-orange-400 hover:bg-orange-500/10 transition-colors glow-primary"
        >
          <Flame className="h-9 w-9" />
        </motion.button>
      </div>
    </motion.div>
  );
}
