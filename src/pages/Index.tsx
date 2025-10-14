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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-moroccan">
              <Languages className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Darija Translator
              </h1>
              <p className="text-sm text-muted-foreground">Moroccan Arabic Translation with Cultural Intelligence</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Input Section */}
        <Card className="p-6 mb-8 bg-card/50 backdrop-blur-sm border-border/50 shadow-moroccan">
          <div className="space-y-4">
            <div>
              <Label htmlFor="source-lang" className="text-base font-semibold mb-3 block">
                Source Language
              </Label>
              <div className="flex gap-2 flex-wrap">
                {languages.map((lang) => (
                  <Button
                    key={lang.name}
                    variant={sourceLanguage === lang.name ? "default" : "outline"}
                    onClick={() => setSourceLanguage(lang.name)}
                    className="gap-2"
                  >
                    <span>{lang.icon}</span>
                    {lang.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="input-text" className="text-base font-semibold mb-3 block">
                Enter Text
              </Label>
              <Textarea
                id="input-text"
                placeholder="Type your text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[150px] text-base resize-none bg-background/50"
              />
            </div>

            <Button
              onClick={handleTranslate}
              disabled={isTranslating || !inputText.trim()}
              className="w-full sm:w-auto gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
              size="lg"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Languages className="w-4 h-4" />
                  Translate
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Results Section */}
        {translations && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-foreground">Translations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {languages.map((lang) => {
                const key = lang.name.toLowerCase() as keyof typeof translations.translations;
                return (
                  <TranslationCard
                    key={lang.name}
                    language={lang.name}
                    translation={translations.translations[key]}
                    culturalNotes={lang.name === "Darija" ? translations.culturalNotes : undefined}
                    icon={lang.icon}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Info Section */}
        <Card className="mt-8 p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <h3 className="text-lg font-semibold mb-3 text-foreground">About This Translator</h3>
          <ul className="space-y-2 text-sm text-foreground/80">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Bidirectional translation between Darija and French, Arabic, English</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Preserves cultural context, tone, and emotional nuance</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Explains idioms, slang, and regional variations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Supports both Arabic script and Latin transliteration</span>
            </li>
          </ul>
        </Card>
      </main>
    </div>
  );
};

export default Index;
