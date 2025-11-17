import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

interface TranslationCardProps {
  language: string;
  translation: string;
  culturalNotes?: string;
  icon?: string;
}

export const TranslationCard = ({ language, translation, culturalNotes, icon }: TranslationCardProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const getLanguageColor = (lang: string) => {
    const colors: Record<string, string> = {
      'Darija': 'text-primary',
      'French': 'text-secondary',
      'Arabic': 'text-accent',
      'English': 'text-muted-foreground'
    };
    return colors[lang] || 'text-foreground';
  };

  const getLanguageCode = (lang: string): string => {
    const codes: Record<string, string> = {
      'Darija': 'ar-MA',
      'French': 'fr-FR',
      'Arabic': 'ar-SA',
      'English': 'en-US',
      'Spanish': 'es-ES',
      'Turkish': 'tr-TR'
    };
    return codes[lang] || 'en-US';
  };

  const handleSpeak = () => {
    if (!translation || translation === '') {
      toast.error("No translation to speak");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(translation);
    utterance.lang = getLanguageCode(language);
    utterance.rate = 0.9;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast.error("Speech synthesis failed");
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 shadow-moroccan transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {icon && <span className="text-2xl">{icon}</span>}
            <Label className={cn("text-lg font-semibold", getLanguageColor(language))}>
              {language}
            </Label>
          </div>
          <div className="flex items-center gap-2">
            {translation && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSpeak}
                className={cn("h-8 w-8", isSpeaking && "text-primary")}
                title="Speak translation"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            )}
            {culturalNotes && (
              <span className="text-xs bg-accent/20 text-accent-foreground px-2 py-1 rounded-full">
                Cultural Note
              </span>
            )}
          </div>
        </div>
        
        <p className="text-foreground/90 text-base leading-relaxed min-h-[3rem]">
          {translation || <span className="text-muted-foreground italic">Translation will appear here...</span>}
        </p>
        
        {culturalNotes && (
          <div className="mt-3 p-3 bg-accent/10 rounded-lg border-l-2 border-accent">
            <p className="text-sm text-foreground/80 italic">{culturalNotes}</p>
          </div>
        )}
      </div>
    </Card>
  );
};
