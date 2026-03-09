import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Loader2, Compass } from 'lucide-react';
import { useYearlySession } from '@/hooks/useYearlySession';
import { StepIndicator } from '@/components/session/StepIndicator';
import { StepNegativeStates } from '@/components/session/StepNegativeStates';
import { StepReframe } from '@/components/session/StepReframe';
import { StepDesireDiscovery } from '@/components/session/StepDesireDiscovery';
import { StepPointA } from '@/components/session/StepPointA';
import { StepDestination } from '@/components/session/StepDestination';
import { SessionSummary } from '@/components/session/SessionSummary';
import type { DesireCard } from '@/data/desireCards';

export default function YearlySession() {
  const {
    loading,
    saving,
    data,
    saveNegativeStates,
    savePointA,
    saveDestination,
    updateStep,
    completeSession,
  } = useYearlySession();

  const [likedDesires, setLikedDesires] = useState<DesireCard[]>([]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Steps: 1=Negative, 2=Reframe, 3=DesireDiscovery, 4=PointA, 5=Destination, 6=Summary
  const handleStep1Next = async (states: typeof data.negativeStates) => {
    await saveNegativeStates(states);
    await updateStep(2);
  };

  const handleStep2Next = async (states: typeof data.negativeStates) => {
    await saveNegativeStates(states);
    await updateStep(3);
  };

  const handleStep3Next = async (desires: DesireCard[]) => {
    setLikedDesires(desires);
    await updateStep(4);
  };

  const handleStep4Next = async (content: string, energy: number) => {
    await savePointA(content, energy);
    await updateStep(5);
  };

  const handleComplete = async (content: string, resonance: number) => {
    await saveDestination(content, resonance);
    await completeSession();
  };

  const isSummary = data.currentStep >= 6;

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[150px] animate-glow-pulse" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[130px] animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-center px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Compass className="h-4 w-4 text-primary" />
          </div>
          <span className="font-display text-lg text-foreground">Годовая сессия {new Date().getFullYear()}</span>
        </div>
      </header>

      {/* Step indicator */}
      {!isSummary && (
        <div className="relative z-10 px-6 pb-8">
          <StepIndicator currentStep={data.currentStep} />
        </div>
      )}

      {/* Content */}
      <main className="relative z-10 px-6 pb-20">
        <AnimatePresence mode="wait">
          {data.currentStep === 1 && (
            <StepNegativeStates
              key="step1"
              initial={data.negativeStates}
              onNext={handleStep1Next}
              saving={saving}
            />
          )}
          {data.currentStep === 2 && (
            <StepReframe
              key="step2"
              states={data.negativeStates}
              onNext={handleStep2Next}
              onBack={() => updateStep(1)}
              saving={saving}
            />
          )}
          {data.currentStep === 3 && data.sessionId && (
            <StepDesireDiscovery
              key="step3"
              sessionId={data.sessionId}
              onNext={handleStep3Next}
              onBack={() => updateStep(2)}
              saving={saving}
            />
          )}
          {data.currentStep === 4 && (
            <StepPointA
              key="step4"
              initial={data.pointA}
              onNext={handleStep4Next}
              onBack={() => updateStep(3)}
              saving={saving}
            />
          )}
          {data.currentStep === 5 && (
            <StepDestination
              key="step5"
              initial={data.destination}
              likedDesires={likedDesires}
              onComplete={handleComplete}
              onBack={() => updateStep(4)}
              saving={saving}
            />
          )}
          {isSummary && (
            <SessionSummary key="summary" data={data} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
