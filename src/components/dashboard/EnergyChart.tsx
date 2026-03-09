import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { EnergyDay } from '@/hooks/useEnergyHistory';

interface Props {
  history: EnergyDay[];
}

export function EnergyChart({ history }: Props) {
  const chartData = history.map(d => ({
    name: d.label,
    energy: d.completed ? Math.max(d.energy, 1) : 0,
    completed: d.completed,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg"
    >
      <div className="rounded-2xl glass-strong p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg text-foreground">Энергия за неделю</h3>
              <p className="text-xs text-muted-foreground font-body">
                {history.filter(d => d.completed).length} из {history.length} дней
              </p>
            </div>
          </div>

          <div className="h-[120px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontFamily: 'Inter' }}
                />
                <YAxis hide domain={[0, 'auto']} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                    fontFamily: 'Inter',
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [value > 0 ? `⚡ ${value}` : '—', 'Энергия']}
                />
                <Area
                  type="monotone"
                  dataKey="energy"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#energyGrad)"
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    return payload.completed ? (
                      <circle cx={cx} cy={cy} r={4} fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth={2} />
                    ) : (
                      <circle cx={cx} cy={cy} r={3} fill="hsl(var(--muted-foreground))" opacity={0.3} />
                    );
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
