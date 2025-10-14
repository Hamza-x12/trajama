import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { TranslationCard } from "@/components/TranslationCard";
import { TranslationHistory } from "@/components/TranslationHistory";
import { Languages, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import tarjamaLogo from "@/assets/tarjama-logo.png";

interface TranslationResult {
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
  };
  culturalNotes?: string;
}

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
    chinese: string;
    japanese: string;
    turkish: string;
  };
}

const HISTORY_KEY = 'darija-translation-history';

const Index = () => {
  const [inputText, setInputText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("Darija");
  const [translations, setTranslations] = useState<TranslationResult | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Failed to parse history:', error);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const languages = [
    { name: "Darija", icon: "🇲🇦" },
    { name: "French", icon: "🇫🇷" },
    { name: "Arabic", icon: "🇸🇦" },
    { name: "English", icon: "🇬🇧" },
    { name: "Spanish", icon: "🇪🇸" },
    { name: "German", icon: "🇩🇪" },
    { name: "Italian", icon: "🇮🇹" },
    { name: "Portuguese", icon: "🇵🇹" },
    { name: "Chinese", icon: "🇨🇳" },
    { name: "Japanese", icon: "🇯🇵" },
    { name: "Turkish", icon: "🇹🇷" }
  ];

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to translate");
      return;
    }

    setIsTranslating(true);
    setTranslations(null);

    try {
      const { data, error } = await supabase.functions.invoke('translate-darija', {
        body: {
          text: inputText,
          sourceLanguage,
          targetLanguages: languages.filter(l => l.name !== sourceLanguage).map(l => l.name)
        }
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setTranslations(data);
      
      // Add to history
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        text: inputText,
        sourceLanguage,
        timestamp: Date.now(),
        translations: data.translations
      };
      setHistory(prev => [historyItem, ...prev].slice(0, 50)); // Keep last 50 items
      
      toast.success("Translation complete!");
    } catch (error) {
      console.error('Translation error:', error);
      toast.error("Translation failed. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSelectHistoryItem = (item: HistoryItem) => {
    setInputText(item.text);
    setSourceLanguage(item.sourceLanguage);
    setTranslations({ translations: item.translations });
    toast.info("Translation loaded from history");
  };

  const handleClearHistory = () => {
    setHistory([]);
    toast.success("History cleared");
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    toast.success("Item removed from history");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center gap-3">
            <img src={tarjamaLogo} alt="Tarjama Logo" className="w-16 h-16" />
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Tarjama</h1>
              <p className="text-xs text-muted-foreground">Professional multilingual translation</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Google Translate Layout */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Card className="overflow-hidden border-border/50 shadow-elegant hover:shadow-hover transition-all duration-500 bg-card/50 backdrop-blur-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/50">
            {/* Source Column */}
            <div className="flex flex-col">
              {/* Source Language Selector */}
              <div className="border-b border-border/50 p-5 bg-gradient-to-r from-card to-muted/10">
                <div className="flex gap-2 flex-wrap">
                  {languages.map((lang) => (
                    <Button
                      key={lang.name}
                      variant={sourceLanguage === lang.name ? "default" : "ghost"}
                      onClick={() => setSourceLanguage(lang.name)}
                      className={`gap-2 h-10 px-4 font-medium transition-all duration-300 ${
                        sourceLanguage === lang.name 
                          ? 'shadow-moroccan scale-105' 
                          : 'hover:scale-105'
                      }`}
                      size="sm"
                    >
                      <span className="text-base">{lang.icon}</span>
                      <span className="text-sm">{lang.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Source Text Input */}
              <div className="flex-1 p-6">
                <Textarea
                  placeholder="Enter text to translate..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[320px] text-lg resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 leading-relaxed placeholder:text-muted-foreground/60"
                />
              </div>

              {/* Translate Button */}
              <div className="border-t border-border/50 p-5 bg-gradient-to-r from-muted/10 to-card">
                <Button
                  onClick={handleTranslate}
                  disabled={isTranslating || !inputText.trim()}
                  className="w-full h-12 text-base font-semibold shadow-moroccan hover:shadow-hover transition-all duration-300 hover:scale-[1.02]"
                  size="lg"
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Translating...
                    </>
                  ) : (
                    <>
                      <Languages className="w-5 h-5 mr-2" />
                      Translate
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Target Column */}
            <div className="flex flex-col bg-gradient-to-br from-muted/10 to-card">
              {/* Target Languages Tabs */}
              <div className="border-b border-border/50 p-5 bg-gradient-to-r from-card to-muted/10">
                <div className="text-sm font-semibold text-foreground tracking-wide uppercase">
                  Translations
                </div>
              </div>
              
              {/* Translation Results */}
              <div className="flex-1 p-6 overflow-y-auto">
                {translations ? (
                  <div className="space-y-6">
                    {languages.map((lang) => {
                      const key = lang.name.toLowerCase() as keyof typeof translations.translations;
                      const translation = translations.translations[key];
                      
                      return (
                        <div key={lang.name} className="space-y-3 p-4 rounded-xl bg-card/50 border border-border/30 hover:border-primary/30 hover:shadow-soft transition-all duration-300">
                          <div className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
                            <span className="text-lg">{lang.icon}</span>
                            <span className="tracking-wide">{lang.name}</span>
                          </div>
                          <p className="text-lg text-foreground/90 leading-relaxed font-medium">
                            {translation}
                          </p>
                          {lang.name === "Darija" && translations.culturalNotes && (
                            <div className="mt-4 p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl border border-accent/30 shadow-soft">
                              <p className="text-xs text-accent-foreground font-semibold mb-2 uppercase tracking-wide">Cultural Notes</p>
                              <p className="text-sm text-foreground/80 italic leading-relaxed">{translations.culturalNotes}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Languages className="w-16 h-16 mb-4 opacity-30" />
                    <p className="text-sm font-medium">Translations will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-8">
            <TranslationHistory
              history={history}
              onSelectItem={handleSelectHistoryItem}
              onClearHistory={handleClearHistory}
              onDeleteItem={handleDeleteHistoryItem}
            />
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-10 text-center pb-8">
          <p className="text-sm text-muted-foreground font-medium">
            Culturally aware translations for Moroccan Darija with 11 languages
          </p>
          <p className="text-xs text-muted-foreground/70 mt-2">
            Professional multilingual translation
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Tarjama
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
