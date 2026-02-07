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

// Language color themes based on flag colors
const getLanguageColors = (language: string): { primary: string; secondary: string; gradient: string } => {
  const langLower = language.toLowerCase();
  
  const colorMap: Record<string, { primary: string; secondary: string; gradient: string }> = {
    darija: { primary: "#c1272d", secondary: "#006233", gradient: "from-[#c1272d] to-[#006233]" },
    moroccan: { primary: "#c1272d", secondary: "#006233", gradient: "from-[#c1272d] to-[#006233]" },
    english: { primary: "#012169", secondary: "#C8102E", gradient: "from-[#012169] via-[#FFFFFF] to-[#C8102E]" },
    french: { primary: "#0055A4", secondary: "#EF4135", gradient: "from-[#0055A4] via-[#FFFFFF] to-[#EF4135]" },
    arabic: { primary: "#006C35", secondary: "#CE1126", gradient: "from-[#006C35] to-[#CE1126]" },
    spanish: { primary: "#AA151B", secondary: "#F1BF00", gradient: "from-[#AA151B] to-[#F1BF00]" },
    german: { primary: "#000000", secondary: "#DD0000", gradient: "from-[#000000] via-[#DD0000] to-[#FFCE00]" },
    italian: { primary: "#009246", secondary: "#CE2B37", gradient: "from-[#009246] via-[#FFFFFF] to-[#CE2B37]" },
    portuguese: { primary: "#006600", secondary: "#FF0000", gradient: "from-[#006600] to-[#FF0000]" },
    chinese: { primary: "#DE2910", secondary: "#FFDE00", gradient: "from-[#DE2910] to-[#FFDE00]" },
    japanese: { primary: "#BC002D", secondary: "#FFFFFF", gradient: "from-[#BC002D] to-[#FFFFFF]" },
    turkish: { primary: "#E30A17", secondary: "#FFFFFF", gradient: "from-[#E30A17] to-[#FFFFFF]" },
    russian: { primary: "#0039A6", secondary: "#D52B1E", gradient: "from-[#FFFFFF] via-[#0039A6] to-[#D52B1E]" },
    korean: { primary: "#003478", secondary: "#C60C30", gradient: "from-[#003478] to-[#C60C30]" },
    hindi: { primary: "#FF9933", secondary: "#138808", gradient: "from-[#FF9933] via-[#FFFFFF] to-[#138808]" },
  };

  return colorMap[langLower] || { primary: "#6366f1", secondary: "#8b5cf6", gradient: "from-primary to-accent" };
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
            const sourceColors = getLanguageColors(item.sourceLanguage);
            const targetColors = getLanguageColors(item.targetLanguage);
            
            return (
              <div
                key={item.id}
                className="group p-5 rounded-xl border border-border/40 bg-gradient-to-br from-card to-muted/10 hover:border-primary/50 hover:shadow-moroccan hover:scale-[1.02] transition-all duration-300 cursor-pointer relative overflow-hidden"
                onClick={() => onSelectItem(item)}
              >
                {/* Source language color accent - left side */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${sourceColors.gradient}`}
                />
                
                {/* Target language color accent - right side */}
                <div 
                  className={`absolute right-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${targetColors.gradient}`}
                />
                
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
                
                <div className="pr-10 pl-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 flex-wrap">
                    <div 
                      className="flex items-center gap-1.5 font-semibold px-3 py-1 rounded-lg border"
                      style={{ 
                        background: `linear-gradient(135deg, ${sourceColors.primary}20, ${sourceColors.secondary}15)`,
                        borderColor: `${sourceColors.primary}40`,
                        color: sourceColors.primary
                      }}
                    >
                      <span>{item.sourceLanguage}</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/50">
                      <path d="M5 12h14"/>
                      <path d="m12 5 7 7-7 7"/>
                    </svg>
                    <div 
                      className="flex items-center gap-1.5 font-semibold px-3 py-1 rounded-lg border"
                      style={{ 
                        background: `linear-gradient(135deg, ${targetColors.primary}20, ${targetColors.secondary}15)`,
                        borderColor: `${targetColors.primary}40`,
                        color: targetColors.primary
                      }}
                    >
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
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
};
