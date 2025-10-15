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
  const getLanguageColor = (lang: string) => {
    const colors: Record<string, string> = {
      'Darija': 'text-primary',
      'French': 'text-secondary',
      'Arabic': 'text-accent',
      'English': 'text-muted-foreground'
    };
    return colors[lang] || 'text-foreground';
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
          {culturalNotes && (
            <span className="text-xs bg-accent/20 text-accent-foreground px-2 py-1 rounded-full">
              Cultural Note
            </span>
          )}
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
