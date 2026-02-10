'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSimulation } from '@/hooks/useSimulation';
import { SimulationChat } from '@/components/simulation/SimulationChat';
import { LiveClientCall } from '@/components/simulation/LiveClientCall';
import { ResultsSummary } from '@/components/simulation/ResultsSummary';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDiagnosticStore } from '@/stores/diagnostic.store';
import { cn } from '@/lib/utils';
import type { SimulationScenarioType, DifficultyLevel } from '@/types';
import { MessageSquare, Play, ArrowLeft, ArrowRight, Phone, X, Loader2, Brain, Sparkles, ClipboardCheck } from 'lucide-react';

type SimulationMode = 'chat' | 'voice' | null;

// Type for session data passed to ResultsSummary
interface SessionData {
  sessionId: string;
  traineeId: string;
  traineeName?: string;
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  scenarioType: string;
  difficultyLevel: string;
  clientPersona: {
    name: string;
    personality: string;
    background: string;
    budget: string;
  };
  conversationTurns: Array<{
    speaker: 'trainee' | 'client';
    message: string;
    timestamp: Date;
  }>;
}

export default function SimulationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, isRTL } = useLanguage();
  const diagnosticStore = useDiagnosticStore();
  const isDiagnosticMode = searchParams.get('diagnostic') === 'true';
  const diagnosticAutoStarted = useRef(false);
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenarioType | null>(
    isDiagnosticMode ? 'objection_handling' : null
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('medium');
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [simulationMode, setSimulationMode] = useState<SimulationMode>(null);

  // Localized scenarios
  const scenarios: { type: SimulationScenarioType; title: string; description: string }[] = [
    { type: 'property_showing', title: t.simulations.scenarios.propertyShowing, description: t.simulations.scenarioDescriptions.propertyShowing },
    { type: 'price_negotiation', title: t.simulations.scenarios.priceNegotiation, description: t.simulations.scenarioDescriptions.priceNegotiation },
    { type: 'objection_handling', title: t.simulations.scenarios.objectionHandling, description: t.simulations.scenarioDescriptions.objectionHandling },
    { type: 'first_contact', title: t.simulations.scenarios.firstContact, description: t.simulations.scenarioDescriptions.firstContact },
    { type: 'closing_deal', title: t.simulations.scenarios.closingDeal, description: t.simulations.scenarioDescriptions.closingDeal },
    { type: 'difficult_client', title: t.simulations.scenarios.difficultClient, description: t.simulations.scenarioDescriptions.difficultClient },
  ];

  // Localized difficulties
  const difficulties: { level: DifficultyLevel; label: string; color: string }[] = [
    { level: 'easy', label: t.simulations.difficulty.easy, color: 'bg-success/10 text-success border-success/20' },
    { level: 'medium', label: t.simulations.difficulty.medium, color: 'bg-warning/10 text-warning border-warning/20' },
    { level: 'hard', label: t.simulations.difficulty.hard, color: 'bg-destructive/10 text-destructive border-destructive/20' },
  ];

  const {
    status,
    sessionId,
    analysis,
    clientPersona,
    messages,
    elapsedTimeSeconds,
    startSimulation,
    sendMessage,
    endSimulation,
    reset,
  } = useSimulation();

  // Track session start time
  const sessionStartTimeRef = useRef<string>(new Date().toISOString());

  // Auto-start chat mode in diagnostic mode
  useEffect(() => {
    if (isDiagnosticMode && !diagnosticAutoStarted.current && status === 'idle') {
      diagnosticAutoStarted.current = true;
      setSimulationMode('chat');
      sessionStartTimeRef.current = new Date().toISOString();
      startSimulation({
        scenarioType: 'objection_handling',
        difficultyLevel: 'medium',
        recordSession: false,
      });
    }
  }, [isDiagnosticMode, status, startSimulation]);

  const handleStartClick = () => {
    if (!selectedScenario) return;
    setShowModeSelector(true);
  };

  const handleModeSelect = async (mode: SimulationMode) => {
    setSimulationMode(mode);
    setShowModeSelector(false);

    if (mode === 'chat') {
      sessionStartTimeRef.current = new Date().toISOString();
      await startSimulation({
        scenarioType: selectedScenario!,
        difficultyLevel: selectedDifficulty,
        recordSession: false,
      });
    }
  };

  // Build session data for PDF export
  const buildSessionData = (): SessionData | undefined => {
    if (!sessionId || !clientPersona || !selectedScenario) return undefined;

    return {
      sessionId,
      traineeId: 'current-user', // This would come from auth context in production
      traineeName: undefined,
      startTime: sessionStartTimeRef.current,
      endTime: new Date().toISOString(),
      durationSeconds: elapsedTimeSeconds,
      scenarioType: selectedScenario,
      difficultyLevel: selectedDifficulty,
      clientPersona: {
        name: clientPersona.name,
        personality: clientPersona.personality,
        background: clientPersona.background,
        budget: clientPersona.budget,
      },
      conversationTurns: messages.map(m => ({
        speaker: m.speaker,
        message: m.message,
        timestamp: m.timestamp,
      })),
    };
  };

  const handleViewFullReport = () => {
    router.push('/reports');
  };

  const handlePracticeAgain = () => {
    reset();
    setSelectedScenario(null);
    setSimulationMode(null);
  };

  const handleVoiceCallEnd = () => {
    reset();
    setSimulationMode(null);
  };

  // RTL-aware arrow
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  // Analyzing state - show loading indicator
  if (status === 'analyzing' || status === 'ending') {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-6">
            {/* Animated AI Brain Icon */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center animate-pulse">
                <Brain className="h-12 w-12 text-primary" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-6 w-6 text-yellow-500 animate-bounce" />
              </div>
              <div className="absolute -bottom-1 -left-1">
                <div className="w-4 h-4 rounded-full bg-primary animate-ping" />
              </div>
            </div>

            {/* Loading Text */}
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                {isRTL ? 'جاري تحليل المحادثة...' : 'Analyzing Conversation...'}
              </h3>
              <p className="text-muted-foreground max-w-md">
                {isRTL
                  ? 'الذكاء الاصطناعي يقوم بتحليل أداءك وتقديم تقييم شامل. يرجى الانتظار قليلاً.'
                  : 'AI is analyzing your performance and preparing a comprehensive evaluation. Please wait a moment.'}
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                {isRTL ? 'قد يستغرق هذا بضع ثوان...' : 'This may take a few seconds...'}
              </span>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">
                  {isRTL ? 'تحليل الحوار' : 'Analyzing dialogue'}
                </span>
              </div>
              <div className="w-8 h-0.5 bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary/50 animate-pulse" />
                <span className="text-xs text-muted-foreground">
                  {isRTL ? 'إعداد التقييم' : 'Preparing evaluation'}
                </span>
              </div>
              <div className="w-8 h-0.5 bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted" />
                <span className="text-xs text-muted-foreground">
                  {isRTL ? 'النتيجة النهائية' : 'Final results'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'completed' && analysis) {
    // Diagnostic mode: store session ID and redirect back to assessment
    if (isDiagnosticMode && sessionId) {
      return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          {/* Diagnostic banner */}
          <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
            <ClipboardCheck className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-sm font-semibold text-primary">
                {t.diagnostic.stepOf} 1/2: {t.diagnostic.step1Title}
              </p>
              <p className="text-xs text-muted-foreground">
                {isRTL ? 'تم إكمال المحاكاة النصية بنجاح!' : 'Chat simulation completed successfully!'}
              </p>
            </div>
          </div>
          <ResultsSummary
            analysis={analysis}
            onViewFullReport={() => {}}
            onPracticeAgain={() => {}}
            sessionData={buildSessionData()}
          />
          <div className="mt-6 flex justify-center">
            <Button
              className="btn-gradient h-12 px-8 text-lg"
              onClick={() => {
                diagnosticStore.setChatComplete(sessionId);
                router.push('/assessment');
              }}
            >
              {t.diagnostic.continueAssessment}
              {isRTL ? <ArrowLeft className="h-5 w-5 mr-2" /> : <ArrowRight className="h-5 w-5 ml-2" />}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={handlePracticeAgain}>
            <BackArrow className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
            {t.simulations.backToScenarios}
          </Button>
        </div>
        <ResultsSummary
          analysis={analysis}
          onViewFullReport={handleViewFullReport}
          onPracticeAgain={handlePracticeAgain}
          sessionData={buildSessionData()}
        />
      </div>
    );
  }

  // Voice Call Mode - Uses the existing ElevenLabs real-time call system
  if (simulationMode === 'voice' && selectedScenario) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <LiveClientCall
          scenarioType={selectedScenario}
          difficultyLevel={selectedDifficulty}
          onEnd={handleVoiceCallEnd}
          onBack={() => {
            setSimulationMode(null);
          }}
        />
      </div>
    );
  }

  // Chat Simulation Mode
  if ((status === 'ready' || status === 'in_progress') && simulationMode === 'chat') {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {isDiagnosticMode && (
          <div className="mb-4 p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
            <ClipboardCheck className="h-5 w-5 text-primary shrink-0" />
            <p className="text-sm font-medium text-primary">
              {t.diagnostic.stepOf} 1/2: {t.diagnostic.step1Title}
            </p>
          </div>
        )}
        <SimulationChat
          onSendMessage={sendMessage}
          onEndSimulation={endSimulation}
        />
      </div>
    );
  }

  // Mode Selection Modal
  const ModeSelector = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <Card className="w-full max-w-md mx-4 animate-slide-up">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className={cn("absolute top-2", isRTL ? "left-2" : "right-2")}
            onClick={() => setShowModeSelector(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="text-center text-foreground">{t.simulations.chooseMode}</CardTitle>
          <CardDescription className="text-center">
            {t.simulations.selectModeDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Chat Mode */}
          <button
            onClick={() => handleModeSelect('chat')}
            className="w-full p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="h-7 w-7 text-primary" />
              </div>
              <div className={cn("flex-1", isRTL ? "text-right" : "text-left")}>
                <h3 className="font-semibold text-lg text-foreground">{t.simulations.chatMode}</h3>
                <p className="text-sm text-muted-foreground">{t.simulations.chatModeDescription}</p>
              </div>
            </div>
          </button>

          {/* Voice Mode */}
          <button
            onClick={() => handleModeSelect('voice')}
            className="w-full p-6 rounded-xl border-2 border-border hover:border-success hover:bg-success/5 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center group-hover:bg-success/20 transition-colors">
                <Phone className="h-7 w-7 text-success" />
              </div>
              <div className={cn("flex-1", isRTL ? "text-right" : "text-left")}>
                <h3 className="font-semibold text-lg text-foreground">{t.simulations.voiceMode}</h3>
                <p className="text-sm text-muted-foreground">{t.simulations.voiceModeDescription}</p>
                <Badge variant="secondary" className="mt-1 bg-warning/10 text-warning border-warning/20">
                  {t.simulations.voiceCallInArabic}
                </Badge>
              </div>
            </div>
          </button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">{t.simulations.title}</h1>
        <p className="text-muted-foreground">
          {t.simulations.subtitle}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 text-foreground">{t.simulations.chooseScenario}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {scenarios.map((scenario) => (
              <Card
                key={scenario.type}
                className={cn(
                  "cursor-pointer transition-all card-hover",
                  selectedScenario === scenario.type && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedScenario(scenario.type)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-foreground">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    {scenario.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{scenario.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="text-foreground">{t.simulations.startSimulation}</CardTitle>
              <CardDescription>
                {t.simulations.configureSession}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block text-foreground">{t.simulations.difficultyLevel}</label>
                <div className="flex gap-2 flex-wrap">
                  {difficulties.map((diff) => (
                    <Badge
                      key={diff.level}
                      variant="outline"
                      className={cn(
                        "cursor-pointer transition-all",
                        selectedDifficulty === diff.level ? diff.color : "hover:bg-muted"
                      )}
                      onClick={() => setSelectedDifficulty(diff.level)}
                    >
                      {diff.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedScenario && (
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <p className="text-sm font-medium text-foreground">{t.simulations.selected}:</p>
                  <p className="text-sm text-muted-foreground">
                    {scenarios.find(s => s.type === selectedScenario)?.title} - {difficulties.find(d => d.level === selectedDifficulty)?.label}
                  </p>
                </div>
              )}

              <Button
                className="w-full btn-gradient"
                disabled={!selectedScenario || status === 'initializing'}
                onClick={handleStartClick}
              >
                <Play className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                {status === 'initializing' ? t.simulations.starting : t.simulations.startSimulation}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mode Selection Modal */}
      {showModeSelector && <ModeSelector />}
    </div>
  );
}
