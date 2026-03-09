import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const steps = [
  { label: 'Не хочу', icon: '🌑' },
  { label: 'Хочу', icon: '🌟' },
  { label: 'Желания', icon: '🔥' },
  { label: 'Точка А', icon: '📍' },
  { label: 'Навигатор', icon: '🧭' },
];

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-1.5 md:gap-3">
      {steps.map((step, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <div key={i} className="flex items-center gap-1.5 md:gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                className={`
                  relative flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl text-sm font-body font-medium transition-all duration-500
                  ${isCompleted ? 'bg-primary text-primary-foreground glow-primary' : ''}
                  ${isActive ? 'bg-primary/20 text-primary border border-primary/50 glow-primary' : ''}
                  ${!isActive && !isCompleted ? 'bg-muted/50 text-muted-foreground border border-border/30' : ''}
                `}
                animate={isActive ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : <span className="text-xs md:text-sm">{step.icon}</span>}
              </motion.div>
              <span className={`text-[10px] md:text-xs font-body hidden md:block ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px w-4 md:w-8 mb-5 md:mb-6 ${isCompleted ? 'bg-primary/60' : 'bg-border/40'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
