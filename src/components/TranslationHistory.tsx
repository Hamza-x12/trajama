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
          {history.map((item) => (
            <div
              key={item.id}
              className="group p-5 rounded-xl border border-border/40 bg-gradient-to-br from-card to-muted/10 hover:border-primary/50 hover:shadow-moroccan hover:scale-[1.02] transition-all duration-300 cursor-pointer relative"
              onClick={() => onSelectItem(item)}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 w-8 h-8 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-destructive/10 hover:text-destructive rounded-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteItem(item.id);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
              
              <div className="pr-10">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 flex-wrap">
                  <div className="flex items-center gap-1.5 font-semibold bg-gradient-to-r from-primary/20 to-primary/10 text-primary px-3 py-1 rounded-lg border border-primary/30">
                    <span>{item.sourceLanguage}</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/50">
                    <path d="M5 12h14"/>
                    <path d="m12 5 7 7-7 7"/>
                  </svg>
                  <div className="flex items-center gap-1.5 font-semibold bg-gradient-to-r from-accent/20 to-accent/10 text-accent-foreground px-3 py-1 rounded-lg border border-accent/30">
                    <span>{item.targetLanguage}</span>
                  </div>
                  <span className="opacity-50">•</span>
                  <span className="font-medium">{format(item.timestamp, 'MMM d, yyyy • h:mm a')}</span>
                </div>
                <p className="text-sm text-foreground/90 line-clamp-2 leading-relaxed font-medium">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
