import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { TranslationCard } from "@/components/TranslationCard";
import { TranslationHistory } from "@/components/TranslationHistory";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Languages, Loader2, Wand2, Copy, Check, Volume2, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import tarjamaLogo from "@/assets/tarjama-logo.png";
import moroccoFlag from "@/assets/flags/morocco.png";
import ukFlag from "@/assets/flags/uk.png";
import franceFlag from "@/assets/flags/france.png";
import spainFlag from "@/assets/flags/spain.png";
import saudiArabiaFlag from "@/assets/flags/saudi-arabia.png";
import germanyFlag from "@/assets/flags/germany.png";
import italyFlag from "@/assets/flags/italy.png";
import portugalFlag from "@/assets/flags/portugal.png";
import chinaFlag from "@/assets/flags/china.png";
import japanFlag from "@/assets/flags/japan.png";
import turkeyFlag from "@/assets/flags/turkey.png";
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
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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
  const languages = [{
    name: "Detect Language",
    icon: "🔍"
  }, {
    name: "Darija",
    icon: moroccoFlag
  }, {
    name: "French",
    icon: franceFlag
  }, {
    name: "Arabic",
    icon: saudiArabiaFlag
  }, {
    name: "English",
    icon: ukFlag
  }, {
    name: "Spanish",
    icon: spainFlag
  }, {
    name: "German",
    icon: germanyFlag
  }, {
    name: "Italian",
    icon: italyFlag
  }, {
    name: "Portuguese",
    icon: portugalFlag
  }, {
    name: "Chinese",
    icon: chinaFlag
  }, {
    name: "Japanese",
    icon: japanFlag
  }, {
    name: "Turkish",
    icon: turkeyFlag
  }];
  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to translate");
      return;
    }
    setIsTranslating(true);
    setTranslations(null);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('translate-darija', {
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
    setTranslations({
      translations: item.translations
    });
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
  const handleSpeakTranslation = (text: string, languageName: string) => {
    if (!text?.trim()) {
      toast.error("No translation to speak");
      return;
    }
    if (typeof window === "undefined" || !window.speechSynthesis) {
      toast.error("Speech synthesis not supported in your browser");
      return;
    }
    const languageCodes: Record<string, string> = {
      Darija: "ar-MA",
      Arabic: "ar-SA",
      French: "fr-FR",
      English: "en-US",
      Spanish: "es-ES",
      German: "de-DE",
      Italian: "it-IT",
      Portuguese: "pt-PT",
      Chinese: "zh-CN",
      Japanese: "ja-JP",
      Turkish: "tr-TR"
    };
    try {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      const langCode = languageCodes[languageName] || "en-US";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const exactMatch = voices.find(voice => voice.lang.toLowerCase() === langCode.toLowerCase());
        const baseLang = langCode.split("-")[0].toLowerCase();
        const baseMatch = exactMatch || voices.find(voice => voice.lang.toLowerCase().startsWith(baseLang));
        if (baseMatch) {
          utterance.voice = baseMatch;
        }
      }
      utterance.onstart = () => {
        toast.success(`Playing ${languageName} translation`);
      };
      utterance.onerror = event => {
        console.error("Speech synthesis error", event);
        toast.error(`Speech error: ${event.error || "Unknown error"}`);
      };
      window.speechSynthesis.speak(utterance);
    } catch (error: any) {
      console.error("Speech synthesis failure", error);
      toast.error(`Error: ${error.message || "Failed to generate speech"}`);
    }
  };
  const handleCopyTranslation = (text: string, languageName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(languageName);
    toast.success(`${languageName} translation copied!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording started");
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error("Failed to start recording. Please check microphone permissions.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info("Processing audio...");
    }
  }, [isRecording]);

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        const { data, error } = await supabase.functions.invoke('transcribe-audio', {
          body: { audio: base64Audio }
        });

        if (error) throw error;
        if (data.error) {
          toast.error(data.error);
          return;
        }

        setInputText(data.text);
        toast.success("Transcription complete!");
      };
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error("Failed to transcribe audio. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col">
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
                  {languages.map(lang => <Button key={lang.name} variant={sourceLanguage === lang.name ? "default" : "ghost"} onClick={() => setSourceLanguage(lang.name)} className={`gap-1.5 sm:gap-2 h-8 sm:h-9 md:h-10 px-2.5 sm:px-3 md:px-4 font-medium transition-all duration-300 flex-shrink-0 ${sourceLanguage === lang.name ? 'shadow-moroccan scale-105' : 'hover:scale-105'} ${lang.name === "Detect Language" ? 'border-2 border-primary/30' : ''}`} size="sm">
                      {lang.name === "Detect Language" ? <Wand2 className="w-3 h-3 sm:w-4 sm:h-4" /> : <img src={lang.icon as string} alt={lang.name} className="w-4 h-4 sm:w-5 sm:h-5 rounded object-cover" />}
                      <span className="text-xs sm:text-sm whitespace-nowrap">{lang.name}</span>
                    </Button>)}
                </div>
              </div>
              
              {/* Source Text Input */}
              <div className="flex-1 p-4 sm:p-5 md:p-6">
                <div className="relative">
                  <Textarea placeholder="Enter text to translate..." value={inputText} onChange={e => setInputText(e.target.value)} className="text-base sm:text-lg resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 leading-relaxed placeholder:text-muted-foreground/60 mx-0 my-0 px-[10px] py-[10px]" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isTranscribing}
                    className={`absolute bottom-2 right-2 h-10 w-10 p-0 rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : 'hover:bg-primary/10'}`}
                    aria-label={isRecording ? "Stop recording" : "Start recording"}
                  >
                    {isTranscribing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : isRecording ? (
                      <MicOff className="h-5 w-5" />
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Translate Button */}
              <div className="border-t border-border/50 p-3 sm:p-4 md:p-5 bg-gradient-to-r from-muted/10 to-card">
                <Button onClick={handleTranslate} disabled={isTranslating || !inputText.trim()} className="w-full h-10 sm:h-11 md:h-12 text-sm sm:text-base font-semibold shadow-moroccan hover:shadow-hover transition-all duration-300 hover:scale-[1.02]" size="lg">
                  {isTranslating ? <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2" />
                      <span className="hidden sm:inline">Translating...</span>
                      <span className="sm:hidden">Translating</span>
                    </> : <>
                      <Languages className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Translate
                    </>}
                </Button>
                
                {/* Cultural Notes */}
                {translations?.culturalNotes && <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg sm:rounded-xl border border-accent/30 shadow-soft">
                    <p className="text-[10px] sm:text-xs text-accent-foreground font-semibold mb-2 uppercase tracking-wide">Cultural Notes</p>
                    <p className="text-xs sm:text-sm text-foreground/80 italic leading-relaxed break-words">{translations.culturalNotes}</p>
                  </div>}
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
                {translations ? <div className="space-y-3 sm:space-y-4 md:space-y-6">
                    {languages.filter(lang => lang.name !== "Detect Language" && lang.name !== translations.detectedLanguage).map(lang => {
                  const key = lang.name.toLowerCase() as keyof typeof translations.translations;
                  const translation = translations.translations[key];
                  return <div key={lang.name} className="relative">
                          <TranslationCard language={lang.name} translation={translation} icon={lang.icon} />
                          <div className="absolute top-4 right-4 flex flex-col gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleSpeakTranslation(translation, lang.name)} className="h-8 w-8 p-0 hover:bg-primary/10" aria-label={`Play ${lang.name} translation`}>
                              <Volume2 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleCopyTranslation(translation, lang.name)} className="h-8 w-8 p-0 hover:bg-primary/10" aria-label={`Copy ${lang.name} translation`}>
                              {copiedId === lang.name ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />}
                            </Button>
                          </div>
                        </div>;
                })}
                  </div> : <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Languages className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-3 sm:mb-4 opacity-30" />
                    <p className="text-xs sm:text-sm font-medium">Translations will appear here</p>
                  </div>}
              </div>
            </div>
          </div>
        </Card>

        {/* History Section */}
        {history.length > 0 && <div className="mt-4 sm:mt-6 md:mt-8">
            <TranslationHistory history={history} onSelectItem={handleSelectHistoryItem} onClearHistory={handleClearHistory} onDeleteItem={handleDeleteHistoryItem} />
          </div>}

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
            <a href="https://www.instagram.com/_7amza_ft_/" target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5 sm:gap-2 font-medium">
              <span>Hamza Elkhouja</span>
              <span className="text-sm sm:text-base">📷</span>
            </a>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;