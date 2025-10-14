import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Clock } from "lucide-react";

interface HistoryItem {
  id: string;
  text: string;
  sourceLanguage: string;
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
    return (
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Translation History</h3>
        </div>
        <p className="text-sm text-muted-foreground">No translation history yet</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Translation History</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearHistory}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All
        </Button>
      </div>
      
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="group p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-accent/5 transition-all cursor-pointer relative"
              onClick={() => onSelectItem(item)}
            >
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteItem(item.id);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
              
              <div className="flex items-start gap-2 mb-2">
                <span className="text-xs font-medium text-primary">
                  {item.sourceLanguage}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(item.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-foreground/90 line-clamp-2">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
