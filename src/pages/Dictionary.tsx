import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import tarjamaLogo from "@/assets/tarjama-logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SettingsDialog } from "@/components/SettingsDialog";

const Dictionary = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");

  const dictionaryEntries = [
    { darija: "صباح الخير", french: "Bonjour (matin)", english: "Good morning", category: "Greetings" },
    { darija: "مساء الخير", french: "Bonsoir", english: "Good evening", category: "Greetings" },
    { darija: "بسلامة", french: "Au revoir", english: "Goodbye", category: "Greetings" },
    { darija: "شكرا", french: "Merci", english: "Thank you", category: "Polite" },
    { darija: "عفاك", french: "S'il te plaît", english: "Please", category: "Polite" },
    { darija: "واخا", french: "D'accord", english: "Okay", category: "Common" },
    { darija: "معرفتش", french: "Je ne sais pas", english: "I don't know", category: "Common" },
    { darija: "فهمت", french: "J'ai compris", english: "I understood", category: "Common" },
    { darija: "كيداير", french: "Comment ça va?", english: "How are you?", category: "Greetings" },
    { darija: "بيخير", french: "Ça va bien", english: "I'm fine", category: "Greetings" },
  ];

  const filteredEntries = dictionaryEntries.filter(
    entry =>
      entry.darija.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.french.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.english.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link to="/">
                <img src={tarjamaLogo} alt="Tarjama Logo" className="w-12 h-12 sm:w-14 sm:h-14" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t('dictionary.title')}</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">{t('dictionary.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SettingsDialog selectedVoice="" setSelectedVoice={() => {}} availableVoices={[]} />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t('navigation.backToTranslator')}
            </Button>
          </Link>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('dictionary.searchTitle')}</CardTitle>
            <CardDescription>{t('dictionary.searchDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder={t('dictionary.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {filteredEntries.map((entry, index) => (
            <Card key={index} className="hover:shadow-elegant transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-primary">{entry.darija}</span>
                      <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                        {entry.category}
                      </span>
                    </div>
                    <div className="space-y-1 text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">🇫🇷</span>
                        {entry.french}
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">🇬🇧</span>
                        {entry.english}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEntries.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">{t('dictionary.noResults')}</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Dictionary;
