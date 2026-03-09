import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Users, Zap, Flame, Target, BarChart3, ArrowLeft, Sparkles, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface AdminStats {
  totalUsers: number;
  onboardedUsers: number;
  totalSessions: number;
  totalHeadlights: number;
  totalTransforms: number;
  todayHeadlights: number;
  avgStreak: number;
  maxStreak: number;
  totalEnergy: number;
  funnel: Record<string, number>;
  recentUsers: Array<{
    display_name: string | null;
    telegram_id: number | null;
    onboarding_completed: boolean;
    created_at: string;
  }>;
}

const stepLabels: Record<string, string> = {
  '1': 'Негативные состояния',
  '2': 'Рефрейминг',
  '3': 'Открытие желаний',
  '4': 'Точка А',
  '5': 'Адрес назначения',
  'completed': 'Завершили ✅',
};

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      setLoading(true);
      const { data, error: fnError } = await supabase.functions.invoke('admin-stats');
      
      if (fnError) {
        setError(fnError.message);
      } else if (data?.error) {
        setError(data.error);
      } else {
        setStats(data);
      }
      setLoading(false);
    };

    fetchStats();
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="text-center space-y-4">
          <p className="text-destructive font-medium">{error}</p>
          <Button variant="outline" onClick={() => navigate('/')}>Назад</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 glass-strong border-b border-border/50 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-display text-xl text-foreground">Админ-панель</h1>
          </div>
          <span className="text-xs text-muted-foreground">только для admin</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {loading || !stats ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Users} label="Всего пользователей" value={stats.totalUsers} />
              <StatCard icon={Target} label="Прошли онбординг" value={stats.onboardedUsers} accent />
              <StatCard icon={Zap} label="Фар сегодня" value={stats.todayHeadlights} />
              <StatCard icon={Flame} label="Макс. стрик" value={stats.maxStreak} />
            </div>

            {/* Activity */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard icon={BarChart3} label="Всего фар" value={stats.totalHeadlights} />
              <StatCard icon={Sparkles} label="Трансформаций" value={stats.totalTransforms} />
              <StatCard icon={Zap} label="Средний стрик" value={stats.avgStreak} />
            </div>

            {/* Onboarding Funnel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-strong rounded-2xl p-6 space-y-4"
            >
              <h2 className="font-display text-lg text-foreground">Воронка онбординга</h2>
              <div className="space-y-3">
                {Object.entries(stats.funnel).map(([step, count]) => {
                  const maxCount = Math.max(...Object.values(stats.funnel), 1);
                  const pct = (count / maxCount) * 100;
                  return (
                    <div key={step} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{stepLabels[step] || `Шаг ${step}`}</span>
                        <span className="font-medium text-foreground">{count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${step === 'completed' ? 'bg-green-500' : 'bg-primary'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: Number(step === 'completed' ? 6 : step) * 0.1 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Recent Users */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-strong rounded-2xl p-6 space-y-4"
            >
              <h2 className="font-display text-lg text-foreground">Последние пользователи</h2>
              <div className="space-y-3">
                {stats.recentUsers.map((u, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`h-2 w-2 rounded-full ${u.onboarding_completed ? 'bg-green-500' : 'bg-amber-400'}`} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{u.display_name || 'Без имени'}</p>
                        <p className="text-xs text-muted-foreground">
                          {u.telegram_id ? (
                            <span className="flex items-center gap-1"><Send className="h-3 w-3" /> TG</span>
                          ) : 'Email'}
                          {' · '}
                          {new Date(u.created_at).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${u.onboarding_completed ? 'bg-green-500/10 text-green-500' : 'bg-amber-400/10 text-amber-500'}`}>
                      {u.onboarding_completed ? 'Готов' : 'Онбординг'}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: number; accent?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-strong rounded-xl p-4 space-y-2"
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${accent ? 'bg-green-500/10' : 'bg-primary/10'}`}>
        <Icon className={`h-5 w-5 ${accent ? 'text-green-500' : 'text-primary'}`} />
      </div>
      <p className="text-2xl font-display font-medium text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </motion.div>
  );
}
