import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Volume2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface WordExample {
  darija: string;
  arabic: string;
  french: string;
  english: string;
}

interface WordDetail {
  darija: string;
  french: string;
  english: string;
  category: string;
  type?: string; // noun, verb, adjective, pronoun, etc.
  definition?: string;
  examples?: WordExample[];
  relatedWords?: string[];
  pronunciation?: string;
}

interface WordDetailDialogProps {
  word: WordDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlayAudio?: (text: string, language: string) => void;
}

export function WordDetailDialog({ word, open, onOpenChange, onPlayAudio }: WordDetailDialogProps) {
  if (!word) return null;

  const handlePlayAudio = (text: string, language: string) => {
    if (onPlayAudio) {
      onPlayAudio(text, language);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-primary flex items-center gap-3">
            {word.darija}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePlayAudio(word.darija, "Darija")}
              className="h-8 w-8"
            >
              <Volume2 className="h-5 w-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Word Type and Category */}
          <div className="flex items-center gap-2 flex-wrap">
            {word.type && (
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {word.type.toUpperCase()}
              </Badge>
            )}
            <Badge variant="outline" className="text-sm px-3 py-1">
              {word.category}
            </Badge>
          </div>

          {/* Pronunciation */}
          {word.pronunciation && (
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">Pronunciation:</span>
              <span className="text-lg text-muted-foreground italic">{word.pronunciation}</span>
            </div>
          )}

          {/* Translations */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🇫🇷</span>
              <div className="flex-1 flex items-center justify-between">
                <span className="text-lg">{word.french}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePlayAudio(word.french, "French")}
                  className="h-8 w-8"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🇬🇧</span>
              <div className="flex-1 flex items-center justify-between">
                <span className="text-lg">{word.english}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePlayAudio(word.english, "English")}
                  className="h-8 w-8"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Definition */}
          {word.definition && (
            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Definition</h3>
              <p className="text-base text-muted-foreground">{word.definition}</p>
            </div>
          )}

          {/* Examples */}
          {word.examples && word.examples.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Examples</h3>
              <div className="space-y-4">
                {word.examples.map((example, index) => (
                  <Card key={index} className="p-4 bg-gradient-to-br from-card to-muted/5">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Badge className="bg-primary text-primary-foreground mt-1">Darija</Badge>
                        <div className="flex-1 flex items-center justify-between">
                          <p className="text-base font-medium">{example.darija}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePlayAudio(example.darija, "Darija")}
                            className="h-8 w-8 shrink-0"
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <Badge className="bg-yellow-500 text-white mt-1">Arabic</Badge>
                        <div className="flex-1 flex items-center justify-between">
                          <p className="text-base" dir="rtl">{example.arabic}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePlayAudio(example.arabic, "Arabic")}
                            className="h-8 w-8 shrink-0"
                          >
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Badge className="bg-secondary text-secondary-foreground mt-1">English</Badge>
                        <p className="text-base flex-1">{example.english}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Related Words */}
          {word.relatedWords && word.relatedWords.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Related Words</h3>
              <div className="flex flex-wrap gap-2">
                {word.relatedWords.map((relatedWord, index) => (
                  <Badge key={index} variant="outline" className="text-sm px-3 py-1 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                    {relatedWord}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
