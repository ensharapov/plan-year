import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBuddy } from '@/hooks/useBuddy';
import { Users, Copy, Check, Zap, Sparkles, Link, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export function BuddySection() {
  const {
    pair, buddyName, buddyHeadlight, todayInteraction,
    loading, connecting, createInvite, joinByCode, sendKaif,
  } = useBuddy();
  const { toast } = useToast();

  const [showConnect, setShowConnect] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [kaifSent, setKaifSent] = useState(false);
  const [showKaifAnimation, setShowKaifAnimation] = useState(false);

  if (loading) return null;

  const isActive = pair?.status === 'active' && pair?.user_b;
  const isPending = pair?.status === 'pending' && !pair?.user_b;

  const handleCopy = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateInvite = async () => {
    const code = await createInvite();
    if (code) {
      toast({ title: 'Код создан!', description: `Отправь код ${code} своему бадди` });
    }
  };

  const handleJoin = async () => {
    if (!codeInput.trim()) return;
    const ok = await joinByCode(codeInput);
    if (ok) {
      toast({ title: '🎉 Связка установлена!', description: 'Теперь вы бадди' });
      setShowConnect(false);
    } else {
      toast({ title: 'Не найдено', description: 'Код не найден или уже использован', variant: 'destructive' });
    }
  };

  const handleKaif = async () => {
    setShowKaifAnimation(true);
    await sendKaif();
    setKaifSent(true);
    setTimeout(() => setShowKaifAnimation(false), 2500);
  };

  // ======= NO BUDDY YET =======
  if (!pair && !showConnect) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-lg mt-3"
      >
        <button
          onClick={() => setShowConnect(true)}
          className="w-full rounded-2xl glass p-5 flex items-center gap-4 hover:border-accent/20 transition-all group cursor-pointer"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 group-hover:bg-accent/15 transition-colors">
            <Users className="h-6 w-6 text-accent" />
          </div>
          <div className="text-left flex-1">
            <p className="text-foreground font-body font-medium">Найти Бадди</p>
            <p className="text-xs text-muted-foreground font-body">Связка с партнёром для взаимной поддержки</p>
          </div>
          <Link className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
        </button>
      </motion.div>
    );
  }

  // ======= CONNECT FLOW =======
  if (!isActive) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg mt-3"
      >
        <div className="rounded-2xl glass-strong p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <Users className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-display text-xl text-foreground">Связка с Бадди</h3>
              <p className="text-xs text-muted-foreground font-body">Создай код или введи код партнёра</p>
            </div>
          </div>

          {/* Pending invite - show code */}
          {isPending && pair && (
            <div className="rounded-xl bg-background/30 border border-border/30 p-4 text-center space-y-3">
              <p className="text-sm text-muted-foreground font-body">Твой код для партнёра:</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-mono font-bold text-foreground tracking-widest">
                  {pair.invite_code.toUpperCase()}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(pair.invite_code)}
                  className="text-muted-foreground"
                >
                  {copied ? <Check className="h-4 w-4 text-[hsl(var(--energy-positive))]" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground font-body">Ожидаем подключения партнёра...</p>
            </div>
          )}

          {/* Enter code */}
          {!isPending && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={codeInput}
                  onChange={e => setCodeInput(e.target.value)}
                  placeholder="Введи код партнёра"
                  className="font-mono text-center text-lg tracking-wider uppercase"
                  maxLength={8}
                />
                <Button
                  onClick={handleJoin}
                  disabled={!codeInput.trim() || connecting}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 px-6"
                >
                  {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Связать'}
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-xs text-muted-foreground font-body">или</span>
                <div className="flex-1 h-px bg-border/50" />
              </div>

              <Button
                variant="outline"
                onClick={handleCreateInvite}
                disabled={connecting}
                className="w-full gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Создать свой код
              </Button>
            </div>
          )}

          {showConnect && !isPending && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConnect(false)}
              className="w-full text-muted-foreground"
            >
              Отмена
            </Button>
          )}
        </div>
      </motion.div>
    );
  }

  // ======= ACTIVE BUDDY =======
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="w-full max-w-lg mt-6"
    >
      <div className="rounded-2xl glass-strong p-6 space-y-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent" />

        <div className="relative">
          {/* Buddy header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <Users className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-display text-xl text-foreground">
                Бадди: <span className="text-gradient-primary">{buddyName}</span>
              </h3>
            </div>
          </div>

          {/* Buddy's headlight */}
          <div className="rounded-xl bg-background/30 border border-border/30 p-4 mb-4">
            {buddyHeadlight ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-[hsl(var(--energy-neutral))]" />
                  <span className="text-xs text-muted-foreground font-body">Фары бадди на сегодня</span>
                  {buddyHeadlight.completed && (
                    <span className="ml-auto text-xs text-[hsl(var(--energy-positive))] font-body font-semibold flex items-center gap-1">
                      <Check className="h-3 w-3" /> Сделано!
                    </span>
                  )}
                </div>
                <p className="text-sm text-foreground/80 font-body">{buddyHeadlight.content}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground font-body text-center py-2">
                {buddyName} ещё не включил фары сегодня
              </p>
            )}
          </div>

          {/* Кайфануть button */}
          <div className="relative">
            <AnimatePresence>
              {showKaifAnimation && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
                >
                  {[...Array(15)].map((_, i) => (
                    <motion.span
                      key={i}
                      className="absolute text-xl"
                      initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                      animate={{
                        x: (Math.random() - 0.5) * 200,
                        y: (Math.random() - 0.5) * 200 - 50,
                        scale: [0, 1.5, 0],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        delay: Math.random() * 0.3,
                        ease: 'easeOut',
                      }}
                    >
                      {['🔥', '⚡', '💜', '✨', '🎉'][i % 5]}
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: todayInteraction || kaifSent ? 1 : 1.02 }}
              whileTap={{ scale: todayInteraction || kaifSent ? 1 : 0.97 }}
              onClick={handleKaif}
              disabled={todayInteraction || kaifSent}
              className={`w-full rounded-2xl py-5 flex items-center justify-center gap-3 font-body font-semibold text-lg transition-all ${
                todayInteraction || kaifSent
                  ? 'bg-accent/10 text-accent/50 cursor-default'
                  : 'bg-gradient-to-r from-accent to-primary text-white shadow-lg hover:shadow-accent/20 cursor-pointer'
              }`}
            >
              {todayInteraction || kaifSent ? (
                <>
                  <Check className="h-5 w-5" />
                  Энергия отправлена! 💜
                </>
              ) : (
                <>
                  <motion.span
                    className="text-2xl"
                    animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  >
                    🔥
                  </motion.span>
                  Кайфануть!
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
