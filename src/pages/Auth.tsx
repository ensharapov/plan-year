import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Compass, Sparkles, Mail, Lock, User, ArrowRight, Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type AuthMode = 'login' | 'register' | 'magic';

const Auth = () => {
  const { user, loading, isTelegram, signIn, signUp, signInWithMagicLink } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          {isTelegram && <p className="text-sm text-muted-foreground font-body">Вход через Telegram...</p>}
        </div>
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    let error: Error | null = null;

    if (mode === 'magic') {
      const result = await signInWithMagicLink(email);
      error = result.error;
      if (!error) {
        toast({ title: 'Ссылка отправлена!', description: 'Проверьте вашу почту для входа.' });
        setSubmitting(false);
        return;
      }
    } else if (mode === 'register') {
      const result = await signUp(email, password, displayName);
      error = result.error;
      if (!error) {
        toast({ title: 'Регистрация успешна!', description: 'Подтвердите email для входа.' });
      }
    } else {
      const result = await signIn(email, password);
      error = result.error;
    }

    if (error) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    }
    setSubmitting(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px] animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <motion.div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 glow-primary"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Compass className="h-8 w-8 text-primary" />
          </motion.div>
          <h1 className="font-display text-4xl font-medium tracking-tight text-foreground">
            Навигатор
          </h1>
          <p className="mt-2 font-display text-lg text-muted-foreground">
            Состояний
          </p>
        </div>

        {/* Card */}
        <div className="glass-strong rounded-2xl p-8">
          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div className="mb-6 text-center">
                <h2 className="font-display text-2xl text-foreground">
                  {mode === 'login' ? 'Добро пожаловать' : mode === 'register' ? 'Создать аккаунт' : 'Магическая ссылка'}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {mode === 'login' ? 'Войдите в свой навигатор' : mode === 'register' ? 'Начните свой путь' : 'Войдите без пароля'}
                </p>
              </div>

              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm text-muted-foreground">Имя</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Как вас зовут?"
                      className="pl-10 glass border-border/50"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-muted-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="pl-10 glass border-border/50"
                  />
                </div>
              </div>

              {mode !== 'magic' && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm text-muted-foreground">Пароль</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="pl-10 glass border-border/50"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-12 text-base font-medium transition-all duration-300 hover:glow-primary"
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? 'Войти' : mode === 'register' ? 'Создать аккаунт' : 'Отправить ссылку'}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </motion.form>
          </AnimatePresence>

          {/* Mode switchers */}
          <div className="mt-6 space-y-3 text-center text-sm">
            {mode === 'login' && (
              <>
                <button onClick={() => setMode('register')} className="text-muted-foreground hover:text-primary transition-colors">
                  Нет аккаунта? <span className="text-primary font-medium">Создать</span>
                </button>
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">или</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <button onClick={() => setMode('magic')} className="flex items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors mx-auto">
                  <Sparkles className="h-4 w-4" />
                  Войти по ссылке
                </button>
              </>
            )}
            {mode === 'register' && (
              <button onClick={() => setMode('login')} className="text-muted-foreground hover:text-primary transition-colors">
                Уже есть аккаунт? <span className="text-primary font-medium">Войти</span>
              </button>
            )}
            {mode === 'magic' && (
              <button onClick={() => setMode('login')} className="text-muted-foreground hover:text-primary transition-colors">
                Вернуться к <span className="text-primary font-medium">входу с паролем</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
