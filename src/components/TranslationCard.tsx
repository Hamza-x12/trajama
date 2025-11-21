import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Volume2, Copy, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface TranslationCardProps {
  language: string;
  languageCode: string;
  translation: string;
  culturalNotes?: string;
  flag?: string;
  icon?: string;
  onSpeak: (text: string, language: string) => void;
  onCopy: (text: string) => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
}

export const TranslationCard = ({ 
  language, 
  languageCode,
  translation, 
  culturalNotes, 
  icon,
  flag, 
  onSpeak,
  onCopy,
  isSpeaking,
  onStopSpeaking
}: TranslationCardProps) => {
  // Use flag if provided, otherwise icon
  const displayIcon = flag || icon;
  const isImageIcon = typeof displayIcon === 'string' && displayIcon.length > 2;

  const getLanguageColor = (lang: string) => {
    const colors: Record<string, string> = {
      'Darija': 'text-primary',
      'French': 'text-secondary',
      'Arabic': 'text-accent',
      'English': 'text-muted-foreground'
    };
    return colors[lang] || 'text-foreground';
  };

  const getCountryTheme = (lang: string) => {
    const themes: Record<string, string> = {
      'Darija': 'border-l-4 border-l-red-600 bg-gradient-to-r from-red-50/10 to-green-50/10 dark:from-red-950/20 dark:to-green-950/20',
      'French': 'border-l-4 border-l-blue-600 bg-gradient-to-r from-blue-50/10 via-white/5 to-red-50/10 dark:from-blue-950/20 dark:via-background/10 dark:to-red-950/20',
      'Arabic': 'border-l-4 border-l-green-600 bg-gradient-to-r from-green-50/10 to-white/5 dark:from-green-950/20 dark:to-background/10',
      'English': 'border-l-4 border-l-blue-700 bg-gradient-to-r from-red-50/10 via-white/5 to-blue-50/10 dark:from-red-950/20 dark:via-background/10 dark:to-blue-950/20',
      'Spanish': 'border-l-4 border-l-red-600 bg-gradient-to-r from-red-50/10 to-yellow-50/10 dark:from-red-950/20 dark:to-yellow-950/20',
      'German': 'border-l-4 border-l-yellow-500 bg-gradient-to-r from-red-50/10 via-yellow-50/10 to-zinc-100/10 dark:from-red-950/20 dark:via-yellow-950/20 dark:to-zinc-900/20',
      'Italian': 'border-l-4 border-l-green-600 bg-gradient-to-r from-green-50/10 via-white/5 to-red-50/10 dark:from-green-950/20 dark:via-background/10 dark:to-red-950/20',
      'Portuguese': 'border-l-4 border-l-green-700 bg-gradient-to-r from-green-50/10 to-red-50/10 dark:from-green-950/20 dark:to-red-950/20',
      'Chinese': 'border-l-4 border-l-red-600 bg-gradient-to-r from-red-50/10 to-yellow-50/10 dark:from-red-950/20 dark:to-yellow-950/20',
      'Japanese': 'border-l-4 border-l-red-600 bg-gradient-to-r from-red-50/10 to-white/5 dark:from-red-950/20 dark:to-background/10',
      'Turkish': 'border-l-4 border-l-red-600 bg-gradient-to-r from-red-50/10 to-white/5 dark:from-red-950/20 dark:to-background/10',
      'Russian': 'border-l-4 border-l-blue-600 bg-gradient-to-r from-blue-50/10 via-white/5 to-red-50/10 dark:from-blue-950/20 dark:via-background/10 dark:to-red-950/20',
      'Korean': 'border-l-4 border-l-blue-700 bg-gradient-to-r from-blue-50/10 via-red-50/10 to-white/5 dark:from-blue-950/20 dark:via-red-950/20 dark:to-background/10',
      'Hindi': 'border-l-4 border-l-orange-600 bg-gradient-to-r from-orange-50/10 via-white/5 to-green-50/10 dark:from-orange-950/20 dark:via-background/10 dark:to-green-950/20'
    };
    return themes[lang] || '';
  };

  return (
    <Card className={cn(
      "p-5 sm:p-6 backdrop-blur-sm border-border/50 shadow-moroccan transition-all duration-300 hover:shadow-lg active:scale-[0.98] touch-pan-y",
      getCountryTheme(language)
    )}>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2 flex-1 min-w-0">
            {displayIcon && (
              isImageIcon ? (
                <img src={displayIcon} alt={language} className="w-7 h-7 sm:w-6 sm:h-6 rounded object-cover flex-shrink-0" />
              ) : (
                <span className="text-2xl flex-shrink-0">{displayIcon}</span>
              )
            )}
            <Label className={cn("text-base sm:text-lg font-semibold truncate", getLanguageColor(language))}>
              {language}
            </Label>
          </div>
          
          {/* Touch-friendly action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCopy(translation)}
              disabled={!translation}
              className="h-11 w-11 sm:h-9 sm:w-9 touch-manipulation active:scale-90 transition-transform"
            >
              <Copy className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => isSpeaking ? onStopSpeaking() : onSpeak(translation, languageCode)}
              disabled={!translation}
              className="h-11 w-11 sm:h-9 sm:w-9 touch-manipulation active:scale-90 transition-transform"
            >
              {isSpeaking ? (
                <VolumeX className="h-5 w-5 sm:h-4 sm:w-4 animate-pulse" />
              ) : (
                <Volume2 className="h-5 w-5 sm:h-4 sm:w-4" />
              )}
            </Button>
          </div>
        </div>
        
        <p className="text-foreground/90 text-base sm:text-base leading-relaxed min-h-[4rem] select-text">
          {translation || <span className="text-muted-foreground italic">Translation will appear here...</span>}
        </p>
        
        {culturalNotes && (
          <div className="mt-3 p-4 sm:p-3 bg-accent/10 rounded-lg border-l-2 border-accent">
            <p className="text-sm sm:text-sm text-foreground/80 italic leading-relaxed">{culturalNotes}</p>
          </div>
        )}
      </div>
    </Card>
  );
};
