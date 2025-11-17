import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TranslationCardProps {
  language: string;
  translation: string;
  culturalNotes?: string;
  icon?: string;
}

export const TranslationCard = ({ language, translation, culturalNotes, icon }: TranslationCardProps) => {
  // Check if icon is an image path (contains .png, .jpg, etc.) or emoji
  const isImageIcon = typeof icon === 'string' && (icon.includes('.png') || icon.includes('.jpg') || icon.includes('.svg'));

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
      'Turkish': 'border-l-4 border-l-red-600 bg-gradient-to-r from-red-50/10 to-white/5 dark:from-red-950/20 dark:to-background/10'
    };
    return themes[lang] || '';
  };

  return (
    <Card className={cn(
      "p-6 backdrop-blur-sm border-border/50 shadow-moroccan transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
      getCountryTheme(language)
    )}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {icon && (
            isImageIcon ? (
              <img src={icon} alt={language} className="w-6 h-6 rounded object-cover" />
            ) : (
              <span className="text-2xl">{icon}</span>
            )
          )}
          <Label className={cn("text-lg font-semibold", getLanguageColor(language))}>
            {language}
          </Label>
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
