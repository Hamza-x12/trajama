import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { TranslationCard } from "@/components/TranslationCard";
import { Languages, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TranslationResult {
  translations: {
    darija: string;
    french: string;
    arabic: string;
    english: string;
  };
  culturalNotes?: string;
}

const Index = () => {
  const [inputText, setInputText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("Darija");
  const [translations, setTranslations] = useState<TranslationResult | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const languages = [
    { name: "Darija", icon: "🇲🇦" },
    { name: "French", icon: "🇫🇷" },
    { name: "Arabic", icon: "🇸🇦" },
    { name: "English", icon: "🇬🇧" }
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
      toast.success("Translation complete!");
    } catch (error) {
      console.error('Translation error:', error);
      toast.error("Translation failed. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Languages className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">Darija Translator</h1>
          </div>
        </div>
      </header>

      {/* Main Content - Google Translate Layout */}
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        <Card className="overflow-hidden border-border">
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
            {/* Source Column */}
            <div className="flex flex-col">
              {/* Source Language Selector */}
              <div className="border-b border-border p-4">
                <div className="flex gap-2 flex-wrap">
                  {languages.map((lang) => (
                    <Button
                      key={lang.name}
                      variant={sourceLanguage === lang.name ? "default" : "ghost"}
                      onClick={() => setSourceLanguage(lang.name)}
                      className="gap-2 h-9"
                      size="sm"
                    >
                      <span>{lang.icon}</span>
                      {lang.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Source Text Input */}
              <div className="flex-1 p-4">
                <Textarea
                  placeholder="Enter text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[300px] text-lg resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                />
              </div>

              {/* Translate Button */}
              <div className="border-t border-border p-4">
                <Button
                  onClick={handleTranslate}
                  disabled={isTranslating || !inputText.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Translating...
                    </>
                  ) : (
                    "Translate"
                  )}
                </Button>
              </div>
            </div>

            {/* Target Column */}
            <div className="flex flex-col bg-muted/20">
              {/* Target Languages Tabs */}
              <div className="border-b border-border p-4">
                <div className="text-sm font-medium text-muted-foreground">
                  Translations
                </div>
              </div>
              
              {/* Translation Results */}
              <div className="flex-1 p-4 overflow-y-auto">
                {translations ? (
                  <div className="space-y-6">
                    {languages.map((lang) => {
                      const key = lang.name.toLowerCase() as keyof typeof translations.translations;
                      const translation = translations.translations[key];
                      
                      return (
                        <div key={lang.name} className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                            <span>{lang.icon}</span>
                            <span>{lang.name}</span>
                          </div>
                          <p className="text-lg text-foreground/90 leading-relaxed">
                            {translation}
                          </p>
                          {lang.name === "Darija" && translations.culturalNotes && (
                            <div className="mt-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
                              <p className="text-sm text-muted-foreground font-medium mb-1">Cultural Notes</p>
                              <p className="text-sm text-foreground/80 italic">{translations.culturalNotes}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    Translations will appear here
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Info Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Culturally aware translations for Moroccan Darija with French, Arabic, and English
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
