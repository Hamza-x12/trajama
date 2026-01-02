import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Mic,
  Volume2,
  Wifi,
  WifiOff,
  Settings,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Languages,
  Download,
  ImagePlus,
  Sparkles,
  Globe,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingTutorialProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ONBOARDING_KEY = "onboarding_completed";

export const OnboardingTutorial = ({ open, onOpenChange }: OnboardingTutorialProps) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: t("onboarding.welcome.title"),
      description: t("onboarding.welcome.description"),
      icon: Languages,
      gradient: "from-primary via-secondary to-accent",
      content: (
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30 blur-3xl rounded-full scale-150" />
            <div className="relative flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg">
              <Languages className="h-16 w-16 text-primary-foreground animate-pulse" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-accent animate-bounce" />
            <Globe className="absolute -bottom-2 -left-2 h-6 w-6 text-secondary animate-float" />
          </div>
          <div className="space-y-2 max-w-sm">
            <p className="text-lg font-medium text-foreground">
              {t("onboarding.welcome.content")}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: t("onboarding.voice.title"),
      description: t("onboarding.voice.description"),
      icon: Mic,
      gradient: "from-blue-500 to-cyan-400",
      content: (
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center justify-center gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <Mic className="h-10 w-10 text-white" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-blue-400/50 animate-ping" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <Zap className="h-6 w-6 text-accent animate-pulse" />
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="relative">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                <Volume2 className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
          <div className="w-full max-w-sm space-y-3">
            {[t("onboarding.voice.step1"), t("onboarding.voice.step2"), t("onboarding.voice.step3")].map((step, i) => (
              <div 
                key={i} 
                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                  {i + 1}
                </div>
                <span className="text-sm text-foreground">{step}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: t("onboarding.image.title"),
      description: t("onboarding.image.description"),
      icon: ImagePlus,
      gradient: "from-green-500 to-emerald-400",
      content: (
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center justify-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-2xl blur-xl animate-pulse" />
              <div className="relative flex items-center justify-center w-24 h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                <ImagePlus className="h-10 w-10 text-white" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Sparkles className="h-5 w-5 text-accent animate-spin" style={{ animationDuration: '3s' }} />
              <ArrowRight className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg">
              <Languages className="h-10 w-10 text-white" />
            </div>
          </div>
          <div className="w-full max-w-sm space-y-3">
            {[t("onboarding.image.step1"), t("onboarding.image.step2"), t("onboarding.image.step3")].map((step, i) => (
              <div 
                key={i} 
                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 shadow-sm transition-all hover:shadow-md hover:border-green-500/20"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-semibold text-sm">
                  {i + 1}
                </div>
                <span className="text-sm text-foreground">{step}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: t("onboarding.offline.title"),
      description: t("onboarding.offline.description"),
      icon: WifiOff,
      gradient: "from-orange-500 to-amber-400",
      content: (
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center justify-center gap-6">
            <div className="relative">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 border-2 border-dashed border-muted-foreground/30">
                <Wifi className="h-10 w-10 text-muted-foreground/50" />
                <X className="absolute h-6 w-6 text-destructive" />
              </div>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-xl animate-pulse" />
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg">
                <Download className="h-10 w-10 text-white animate-bounce" />
              </div>
            </div>
          </div>
          <div className="w-full max-w-sm space-y-3">
            {[t("onboarding.offline.step1"), t("onboarding.offline.step2"), t("onboarding.offline.step3")].map((step, i) => (
              <div 
                key={i} 
                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 shadow-sm transition-all hover:shadow-md hover:border-orange-500/20"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold text-sm">
                  {i + 1}
                </div>
                <span className="text-sm text-foreground">{step}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: t("onboarding.settings.title"),
      description: t("onboarding.settings.description"),
      icon: Settings,
      gradient: "from-purple-500 to-violet-400",
      content: (
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-2xl" />
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 shadow-lg">
              <Settings className="h-12 w-12 text-white animate-spin" style={{ animationDuration: '4s' }} />
            </div>
          </div>
          <div className="w-full max-w-sm space-y-3">
            {[t("onboarding.settings.step1"), t("onboarding.settings.step2"), t("onboarding.settings.step3"), t("onboarding.settings.step4")].map((step, i) => (
              <div 
                key={i} 
                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 shadow-sm transition-all hover:shadow-md hover:border-purple-500/20"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold text-sm">
                  {i + 1}
                </div>
                <span className="text-sm text-foreground">{step}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: t("onboarding.complete.title"),
      description: t("onboarding.complete.description"),
      icon: CheckCircle2,
      gradient: "from-green-500 to-emerald-400",
      content: (
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/30 blur-3xl rounded-full scale-150 animate-pulse" />
            <div className="relative flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
              <CheckCircle2 className="h-16 w-16 text-white" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-accent animate-bounce" />
            <Sparkles className="absolute -bottom-2 -left-2 h-6 w-6 text-primary animate-bounce" style={{ animationDelay: '200ms' }} />
          </div>
          <div className="space-y-2 max-w-sm">
            <p className="text-lg text-muted-foreground">
              {t("onboarding.complete.content")}
            </p>
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    onOpenChange(false);
    setCurrentStep(0);
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    onOpenChange(false);
    setCurrentStep(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden border-0 bg-transparent shadow-none">
        <div className="relative bg-card rounded-2xl overflow-hidden shadow-2xl border border-border/50">
          {/* Gradient header */}
          <div className={cn(
            "relative h-2 bg-gradient-to-r",
            currentStepData.gradient
          )} />
          
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-muted/80 hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
          
          {/* Header */}
          <div className="px-6 pt-8 pb-4 text-center space-y-2">
            <div className={cn(
              "inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br mb-3",
              currentStepData.gradient
            )}>
              <Icon className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              {currentStepData.title}
            </h2>
            <p className="text-muted-foreground">
              {currentStepData.description}
            </p>
          </div>

          {/* Content */}
          <div 
            key={currentStep}
            className="px-6 pb-6 min-h-[280px] flex items-center justify-center animate-in fade-in-0 slide-in-from-right-4 duration-300"
          >
            {currentStepData.content}
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 pb-4">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === currentStep 
                    ? "w-8 bg-primary" 
                    : index < currentStep
                      ? "w-2 bg-primary/50"
                      : "w-2 bg-muted-foreground/30"
                )}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-border/50 bg-muted/30">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("onboarding.previous")}
            </Button>
            
            <div className="flex gap-2">
              {currentStep < steps.length - 1 && (
                <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
                  {t("onboarding.skip")}
                </Button>
              )}
              <Button 
                onClick={handleNext} 
                className={cn(
                  "gap-2 bg-gradient-to-r text-white shadow-lg hover:shadow-xl transition-all",
                  currentStepData.gradient
                )}
              >
                {currentStep === steps.length - 1 ? t("onboarding.finish") : t("onboarding.next")}
                {currentStep < steps.length - 1 && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompletedOnboarding) {
      setTimeout(() => setShowOnboarding(true), 1000);
    }
  }, []);

  const restartOnboarding = () => {
    setShowOnboarding(true);
  };

  return { showOnboarding, setShowOnboarding, restartOnboarding };
};
