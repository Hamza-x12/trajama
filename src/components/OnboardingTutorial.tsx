import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
      color: "text-primary",
      content: (
        <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-center p-8">
            <Languages className="h-24 w-24 text-primary animate-pulse" />
          </div>
          <p className="text-center text-muted-foreground">
            {t("onboarding.welcome.content")}
          </p>
        </div>
      ),
    },
    {
      title: t("onboarding.voice.title"),
      description: t("onboarding.voice.description"),
      icon: Mic,
      color: "text-blue-500",
      content: (
        <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-center gap-4 p-8">
            <div className="relative">
              <Mic className="h-16 w-16 text-blue-500 animate-pulse" />
              <div className="absolute -inset-2 bg-blue-500/20 rounded-full animate-ping" />
            </div>
            <ArrowRight className="h-8 w-8 text-muted-foreground" />
            <Volume2 className="h-16 w-16 text-green-500 animate-bounce" />
          </div>
          <div className="space-y-2 text-sm">
            <p className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>{t("onboarding.voice.step1")}</span>
            </p>
            <p className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>{t("onboarding.voice.step2")}</span>
            </p>
            <p className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>{t("onboarding.voice.step3")}</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      title: t("onboarding.offline.title"),
      description: t("onboarding.offline.description"),
      icon: WifiOff,
      color: "text-orange-500",
      content: (
        <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-center gap-4 p-8">
            <div className="relative">
              <Wifi className="h-16 w-16 text-muted-foreground/50" />
              <X className="h-8 w-8 text-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <ArrowRight className="h-8 w-8 text-muted-foreground" />
            <Download className="h-16 w-16 text-orange-500 animate-bounce" />
          </div>
          <div className="space-y-2 text-sm">
            <p className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>{t("onboarding.offline.step1")}</span>
            </p>
            <p className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>{t("onboarding.offline.step2")}</span>
            </p>
            <p className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>{t("onboarding.offline.step3")}</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      title: t("onboarding.settings.title"),
      description: t("onboarding.settings.description"),
      icon: Settings,
      color: "text-purple-500",
      content: (
        <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-center p-8">
            <Settings className="h-20 w-20 text-purple-500 animate-spin" style={{ animationDuration: "3s" }} />
          </div>
          <div className="space-y-2 text-sm">
            <p className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>{t("onboarding.settings.step1")}</span>
            </p>
            <p className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>{t("onboarding.settings.step2")}</span>
            </p>
            <p className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>{t("onboarding.settings.step3")}</span>
            </p>
            <p className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>{t("onboarding.settings.step4")}</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      title: t("onboarding.complete.title"),
      description: t("onboarding.complete.description"),
      icon: CheckCircle2,
      color: "text-green-500",
      content: (
        <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-center p-8">
            <CheckCircle2 className="h-24 w-24 text-green-500 animate-bounce" />
          </div>
          <p className="text-center text-muted-foreground">
            {t("onboarding.complete.content")}
          </p>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
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
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
        <div className="relative">
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <DialogHeader className="p-6 pb-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-full bg-background/50", currentStepData.color)}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl">{currentStepData.title}</DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  {currentStepData.description}
                </DialogDescription>
              </div>
            </div>
            
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {t("onboarding.step", { current: currentStep + 1, total: steps.length })}
              </p>
            </div>
          </DialogHeader>

          <div className="p-6 pt-2 min-h-[300px]">
            {currentStepData.content}
          </div>

          <div className="flex items-center justify-between p-6 pt-4 border-t bg-muted/50">
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
                <Button variant="outline" onClick={handleSkip}>
                  {t("onboarding.skip")}
                </Button>
              )}
              <Button onClick={handleNext} className="gap-2">
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
