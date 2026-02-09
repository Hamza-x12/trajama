import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Trash2, X } from "lucide-react";
import { format } from "date-fns";

interface HistoryItem {
  id: string;
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestamp: number;
  translations: {
    darija: string;
    french: string;
    arabic: string;
    english: string;
    spanish: string;
    german: string;
    italian: string;
    portuguese: string;
    chinese: string;
    japanese: string;
    turkish: string;
    russian: string;
    korean: string;
    hindi: string;
  };
}

interface TranslationHistoryProps {
  history: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
}

// Language country themes matching TranslationCard style
const getCountryTheme = (lang: string): string => {
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
    'Hindi': 'border-l-4 border-l-orange-600 bg-gradient-to-r from-orange-50/10 via-white/5 to-green-50/10 dark:from-orange-950/20 dark:via-background/10 dark:to-green-950/20',
  };
  return themes[lang] || '';
};

const getCountryThemeRight = (lang: string): string => {
  const themes: Record<string, string> = {
    'Darija': 'border-r-4 border-r-green-600',
    'French': 'border-r-4 border-r-red-600',
    'Arabic': 'border-r-4 border-r-green-600',
    'English': 'border-r-4 border-r-red-600',
    'Spanish': 'border-r-4 border-r-yellow-500',
    'German': 'border-r-4 border-r-red-600',
    'Italian': 'border-r-4 border-r-red-600',
    'Portuguese': 'border-r-4 border-r-red-600',
    'Chinese': 'border-r-4 border-r-yellow-500',
    'Japanese': 'border-r-4 border-r-red-600',
    'Turkish': 'border-r-4 border-r-red-600',
    'Russian': 'border-r-4 border-r-red-600',
    'Korean': 'border-r-4 border-r-red-600',
    'Hindi': 'border-r-4 border-r-green-600',
  };
  return themes[lang] || '';
};

const getLanguageBadgeColor = (lang: string): string => {
  const colors: Record<string, string> = {
    'Darija': 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800',
    'French': 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
    'Arabic': 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800',
    'English': 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
    'Spanish': 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800',
    'German': 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800',
    'Italian': 'text-green-600 bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800',
    'Portuguese': 'text-green-700 bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800',
    'Chinese': 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800',
    'Japanese': 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800',
    'Turkish': 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800',
    'Russian': 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
    'Korean': 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
    'Hindi': 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800',
  };
  return colors[lang] || 'text-muted-foreground bg-muted border-border';
};

export const TranslationHistory = ({ 
  history, 
  onSelectItem, 
  onClearHistory,
  onDeleteItem 
}: TranslationHistoryProps) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 shadow-elegant">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Translation History</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearHistory}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-300 font-medium"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All
        </Button>
      </div>

      <ScrollArea className="h-[320px] pr-4">
        <div className="space-y-3">
          {history.map((item) => {
            return (
              <div
                key={item.id}
                className={`group p-5 rounded-xl border border-border/40 hover:shadow-moroccan hover:scale-[1.02] transition-all duration-300 cursor-pointer relative overflow-hidden ${getCountryTheme(item.sourceLanguage)} ${getCountryThemeRight(item.targetLanguage)}`}
                onClick={() => onSelectItem(item)}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-5 w-8 h-8 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-destructive/10 hover:text-destructive rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteItem(item.id);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
                
                <div className="pr-10">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 flex-wrap">
                    <span className={`font-semibold px-3 py-1 rounded-lg border ${getLanguageBadgeColor(item.sourceLanguage)}`}>
                      {item.sourceLanguage}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/50">
                      <path d="M5 12h14"/>
                      <path d="m12 5 7 7-7 7"/>
                    </svg>
                    <span className={`font-semibold px-3 py-1 rounded-lg border ${getLanguageBadgeColor(item.targetLanguage)}`}>
                      {item.targetLanguage}
                    </span>
                    <span className="opacity-50">•</span>
                    <span className="font-medium">{format(item.timestamp, 'MMM d, yyyy • h:mm a')}</span>
                  </div>
                  <p className="text-sm text-foreground/90 line-clamp-2 leading-relaxed font-medium">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
};
