import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { TranslationCard } from "@/components/TranslationCard";
import { TranslationHistory } from "@/components/TranslationHistory";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Languages, Loader2, Wand2, Copy, Check, Mic, Square } from "lucide-react";
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
  detectedLanguage?: string;
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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const retryAttemptedRef = useRef(false);

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
    { name: "Detect Language", icon: "🔍" },
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
      
      // Show detected language if available
      if (data.detectedLanguage) {
        toast.success(`Detected language: ${data.detectedLanguage}`);
      }
      
      // Add to history
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        text: inputText,
        sourceLanguage: data.detectedLanguage || sourceLanguage,
        timestamp: Date.now(),
        translations: data.translations
      };
      setHistory(prev => [historyItem, ...prev].slice(0, 50)); // Keep last 50 items
      
      if (!data.detectedLanguage) {
        toast.success("Translation complete!");
      }
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

  const handleCopyTranslation = (text: string, languageName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(languageName);
    toast.success(`${languageName} translation copied!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startRecording = async () => {
    try {
      // Check for microphone permission first
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        toast.error("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
        return;
      }

      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.maxAlternatives = 1;
      recognitionInstance.lang = sourceLanguage === 'Darija' ? 'ar-MA' : 
                                   sourceLanguage === 'French' ? 'fr-FR' :
                                   sourceLanguage === 'Arabic' ? 'ar-SA' :
                                   sourceLanguage === 'Spanish' ? 'es-ES' :
                                   sourceLanguage === 'German' ? 'de-DE' :
                                   sourceLanguage === 'Italian' ? 'it-IT' :
                                   sourceLanguage === 'Portuguese' ? 'pt-PT' :
                                   sourceLanguage === 'Chinese' ? 'zh-CN' :
                                   sourceLanguage === 'Japanese' ? 'ja-JP' :
                                   sourceLanguage === 'Turkish' ? 'tr-TR' : 'en-US';

      recognitionInstance.onresult = (event: any) => {
        retryAttemptedRef.current = false;
        const transcript = event.results[0][0].transcript;
        setInputText(prev => prev + (prev ? ' ' : '') + transcript);
        toast.success("Text captured!");
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);

        // Retry once on transient network errors
        if (event.error === 'network' && !retryAttemptedRef.current) {
          retryAttemptedRef.current = true;
          toast.info("Network issue, retrying...");
          try {
            recognitionInstance.stop();
            setTimeout(() => {
              try {
                recognitionInstance.start();
                setIsRecording(true);
              } catch (e) {
                console.error('Retry start failed:', e);
                setIsRecording(false);
                toast.error("Speech service unavailable. Please try again shortly.");
              }
            }, 600);
          } catch (e) {
            console.error('Retry setup failed:', e);
            setIsRecording(false);
            toast.error("Speech service unavailable. Please try again shortly.");
          }
          return;
        }

        setIsRecording(false);
        
        if (event.error === 'network') {
          toast.error("Network error. Speech recognition needs internet connection. Please check your connection.");
        } else if (event.error === 'not-allowed') {
          toast.error("Microphone permission denied. Please allow microphone access.");
        } else if (event.error === 'no-speech') {
          toast.error("No speech detected. Please try again.");
        } else {
          toast.error(`Speech recognition error: ${event.error}`);
        }
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
      };

      retryAttemptedRef.current = false;
      recognitionInstance.start();
      setRecognition(recognitionInstance);
      setIsRecording(true);
      toast.info("Speak now...");
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecording(false);
      toast.error("Could not access microphone. Please grant permission.");
    }
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
      toast.success("Recording stopped");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src={tarjamaLogo} alt="Tarjama Logo" className="w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16" />
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground tracking-tight">Tarjama</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Professional multilingual translation</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content - Google Translate Layout */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-7xl flex-1">
        <Card className="overflow-hidden border-border/50 shadow-elegant hover:shadow-hover transition-all duration-500 bg-card/50 backdrop-blur-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/50">
            {/* Source Column */}
            <div className="flex flex-col">
              {/* Source Language Selector */}
              <div className="border-b border-border/50 p-3 sm:p-4 md:p-5 bg-gradient-to-r from-card to-muted/10 overflow-x-auto">
                <div className="flex gap-1.5 sm:gap-2 flex-nowrap sm:flex-wrap min-w-max sm:min-w-0">
                  {languages.map((lang) => (
                    <Button
                      key={lang.name}
                      variant={sourceLanguage === lang.name ? "default" : "ghost"}
                      onClick={() => setSourceLanguage(lang.name)}
                      className={`gap-1.5 sm:gap-2 h-8 sm:h-9 md:h-10 px-2.5 sm:px-3 md:px-4 font-medium transition-all duration-300 flex-shrink-0 ${
                        sourceLanguage === lang.name 
                          ? 'shadow-moroccan scale-105' 
                          : 'hover:scale-105'
                      } ${lang.name === "Detect Language" ? 'border-2 border-primary/30' : ''}`}
                      size="sm"
                    >
                      {lang.name === "Detect Language" ? (
                        <Wand2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      ) : (
                        <span className="text-sm sm:text-base">{lang.icon}</span>
                      )}
                      <span className="text-xs sm:text-sm whitespace-nowrap">{lang.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Source Text Input */}
              <div className="flex-1 p-4 sm:p-5 md:p-6">
                <div className="relative">
                  <Textarea
                    placeholder="Enter text to translate..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-[180px] sm:min-h-[250px] md:min-h-[300px] text-base sm:text-lg resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 pr-12 leading-relaxed placeholder:text-muted-foreground/60"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`absolute right-2 top-2 ${isRecording ? 'text-red-500 animate-pulse' : ''}`}
                    title={isRecording ? "Stop recording" : "Start recording"}
                  >
                    {isRecording ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              {/* Translate Button */}
              <div className="border-t border-border/50 p-3 sm:p-4 md:p-5 bg-gradient-to-r from-muted/10 to-card">
                <Button
                  onClick={handleTranslate}
                  disabled={isTranslating || !inputText.trim()}
                  className="w-full h-10 sm:h-11 md:h-12 text-sm sm:text-base font-semibold shadow-moroccan hover:shadow-hover transition-all duration-300 hover:scale-[1.02]"
                  size="lg"
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2" />
                      <span className="hidden sm:inline">Translating...</span>
                      <span className="sm:hidden">Translating</span>
                    </>
                  ) : (
                    <>
                      <Languages className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Translate
                    </>
                  )}
                </Button>
                
                {/* Cultural Notes */}
                {translations?.culturalNotes && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg sm:rounded-xl border border-accent/30 shadow-soft">
                    <p className="text-[10px] sm:text-xs text-accent-foreground font-semibold mb-2 uppercase tracking-wide">Cultural Notes</p>
                    <p className="text-xs sm:text-sm text-foreground/80 italic leading-relaxed break-words">{translations.culturalNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Target Column */}
            <div className="flex flex-col bg-gradient-to-br from-muted/10 to-card">
              {/* Target Languages Tabs */}
              <div className="border-b border-border/50 p-3 sm:p-4 md:p-5 bg-gradient-to-r from-card to-muted/10">
                <div className="text-xs sm:text-sm font-semibold text-foreground tracking-wide uppercase">
                  Translations
                </div>
              </div>
              
              {/* Translation Results */}
              <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto max-h-[400px] sm:max-h-[500px] md:max-h-[600px]">
                {translations ? (
                  <div className="space-y-3 sm:space-y-4 md:space-y-6">
                    {languages
                      .filter(lang => lang.name !== "Detect Language" && lang.name !== translations.detectedLanguage)
                      .map((lang) => {
                      const key = lang.name.toLowerCase() as keyof typeof translations.translations;
                      const translation = translations.translations[key];
                      
                      return (
                        <div key={lang.name} className="relative">
                          <TranslationCard
                            language={lang.name}
                            translation={translation}
                            icon={lang.icon}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyTranslation(translation, lang.name)}
                            className="absolute top-4 right-12 h-8 w-8 p-0 hover:bg-primary/10"
                          >
                            {copiedId === lang.name ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            )}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Languages className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-3 sm:mb-4 opacity-30" />
                    <p className="text-xs sm:text-sm font-medium">Translations will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-4 sm:mt-6 md:mt-8">
            <TranslationHistory
              history={history}
              onSelectItem={handleSelectHistoryItem}
              onClearHistory={handleClearHistory}
              onDeleteItem={handleDeleteHistoryItem}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border/50 mt-auto">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-7xl">
          {/* Copyright */}
          <div className="text-center mb-3 sm:mb-4">
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Copyright © 2025 Tarjama. Tous droits réservés.
            </p>
          </div>

          {/* Name and Instagram Link */}
          <div className="text-center">
            <a 
              href="https://www.instagram.com/_7amza_ft_/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5 sm:gap-2 font-medium"
            >
              <span>Hamza Elkhouja</span>
              <span className="text-sm sm:text-base">📷</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
