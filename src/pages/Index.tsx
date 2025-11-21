import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { TranslationCard } from "@/components/TranslationCard";
import { TranslationHistory } from "@/components/TranslationHistory";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SettingsDialog } from "@/components/SettingsDialog";
import { InstallPrompt } from "@/components/InstallPrompt";
import { OfflineScreen } from "@/components/OfflineScreen";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Languages, Loader2, Wand2, Copy, Check, Volume2, VolumeX, Mic, MicOff, Instagram } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
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
import zelligeCorner from "@/assets/zellige-corner.png";
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
  const { t, i18n } = useTranslation();
  const isOnline = useOnlineStatus();
  const [inputText, setInputText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("Darija");
  const [translations, setTranslations] = useState<TranslationResult | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingLanguage, setSpeakingLanguage] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Show offline screen if not online
  if (!isOnline) {
    return <OfflineScreen />;
  }

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

    // Load available voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // Auto-select first English voice if none selected
      if (voices.length > 0 && !selectedVoice) {
        const englishVoice = voices.find(v => v.lang.startsWith('en'));
        if (englishVoice) {
          setSelectedVoice(englishVoice.name);
        }
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Set document direction based on language
    const currentLang = i18n.language;
    document.documentElement.dir = currentLang === 'ar' || currentLang === 'dar' ? 'rtl' : 'ltr';
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);
  const languages = [{
    name: "Detect Language",
    code: "auto",
    icon: "🔍"
  }, {
    name: "Darija",
    code: "dar",
    icon: moroccoFlag
  }, {
    name: "French",
    code: "fr",
    icon: franceFlag
  }, {
    name: "Arabic",
    code: "ar",
    icon: saudiArabiaFlag
  }, {
    name: "English",
    code: "en",
    icon: ukFlag
  }, {
    name: "Spanish",
    code: "es",
    icon: spainFlag
  }, {
    name: "German",
    code: "de",
    icon: germanyFlag
  }, {
    name: "Italian",
    code: "it",
    icon: italyFlag
  }, {
    name: "Portuguese",
    code: "pt",
    icon: portugalFlag
  }, {
    name: "Chinese",
    code: "zh",
    icon: chinaFlag
  }, {
    name: "Japanese",
    code: "ja",
    icon: japanFlag
  }, {
    name: "Turkish",
    code: "tr",
    icon: turkeyFlag
  }];
  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast.error(t('translation.enterText'));
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
          targetLanguages: languages.filter(l => l.name !== sourceLanguage).map(l => l.name),
          uiLanguage: i18n.language
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
        toast.success(`${t('translation.detectedLanguage')} ${data.detectedLanguage}`);
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
        toast.success(t('translation.complete'));
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error(t('translation.failed'));
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
    toast.info(t('history.loaded'));
  };
  const handleClearHistory = () => {
    setHistory([]);
    toast.success(t('history.cleared'));
  };
  const handleDeleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    toast.success(t('history.removed'));
  };
  const handleSpeakTranslation = (text: string, languageName: string) => {
    if (!text?.trim()) {
      toast.error(t('audio.play'));
      return;
    }
    if (typeof window === "undefined" || !window.speechSynthesis) {
      toast.error("Speech synthesis not supported in your browser");
      return;
    }
    
    setIsSpeaking(true);
    setSpeakingLanguage(languageName);
    
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

      // Use selected voice if it matches the language, otherwise find best match
      let voice = availableVoices.find(v => v.name === selectedVoice && v.lang.startsWith(langCode.split('-')[0]));
      
      if (!voice) {
        const exactMatch = availableVoices.find(v => v.lang.toLowerCase() === langCode.toLowerCase());
        const baseLang = langCode.split("-")[0].toLowerCase();
        voice = exactMatch || availableVoices.find(v => v.lang.toLowerCase().startsWith(baseLang));
      }
      
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        toast.success(t('audio.playing'));
      };
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      utterance.onerror = event => {
        console.error("Speech synthesis error", event);
        setIsSpeaking(false);
        toast.error(`Speech error: ${event.error || "Unknown error"}`);
      };
      window.speechSynthesis.speak(utterance);
    } catch (error: any) {
      console.error("Speech synthesis failure", error);
      setIsSpeaking(false);
      toast.error(`Error: ${error.message || "Failed to generate speech"}`);
    }
  };

  const handleStopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setSpeakingLanguage(null);
    toast.info(t('audio.stopped'));
  };
  const handleCopyTranslation = (text: string, languageName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(languageName);
    toast.success(`${languageName} ${t('translation.copied')}`);
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
      toast.success(t('audio.recording'));
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error(t('audio.recordingFailed'));
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info(t('audio.processing'));
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
        toast.success(t('audio.transcriptionComplete'));
      };
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error(t('audio.transcriptionFailed'));
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col touch-pan-y relative">
      {/* Zellige corner decorations */}
      <div className="fixed top-0 left-0 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 pointer-events-none z-0 overflow-hidden">
        <img 
          src={zelligeCorner} 
          alt="" 
          className="w-full h-full object-cover opacity-90"
        />
      </div>
      <div className="fixed top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 pointer-events-none z-0 overflow-hidden">
        <img 
          src={zelligeCorner} 
          alt="" 
          className="w-full h-full object-cover opacity-90 scale-x-[-1]"
        />
      </div>
      <div className="fixed bottom-0 left-0 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 pointer-events-none z-0 overflow-hidden">
        <img 
          src={zelligeCorner} 
          alt="" 
          className="w-full h-full object-cover opacity-90 scale-y-[-1]"
        />
      </div>
      <div className="fixed bottom-0 right-0 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 pointer-events-none z-0 overflow-hidden">
        <img 
          src={zelligeCorner} 
          alt="" 
          className="w-full h-full object-cover opacity-90 scale-[-1]"
        />
      </div>
      
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50 shadow-soft touch-none relative">
        <div className="container mx-auto px-4 sm:px-4 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-3">
              <img src={tarjamaLogo} alt="Tarjama Logo" className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" />
              <div>
                <h1 className="text-xl sm:text-xl md:text-2xl font-bold text-foreground tracking-tight">{t('app.title')}</h1>
                <p className="text-xs sm:text-xs text-muted-foreground hidden sm:block">{t('app.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SettingsDialog 
                selectedVoice={selectedVoice}
                setSelectedVoice={setSelectedVoice}
                availableVoices={availableVoices}
              />
              <ThemeToggle />
            </div>
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
                      <span className="text-xs sm:text-sm whitespace-nowrap">{t(`languages.${lang.name.toLowerCase().replace(' ', '')}`)}</span>
                    </Button>)}
                </div>
              </div>
              
              {/* Source Text Input */}
              <div className="flex-1 p-4 sm:p-5 md:p-6">
                <div className="relative">
                  <Textarea placeholder={t('translation.placeholder')} value={inputText} onChange={e => setInputText(e.target.value)} className="text-base sm:text-lg resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 leading-relaxed placeholder:text-muted-foreground/60 mx-0 my-0 px-[10px] py-[10px]" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isTranscribing}
                    className={`absolute bottom-2 right-2 h-10 w-10 p-0 rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : 'hover:bg-primary/10'}`}
                    aria-label={isRecording ? t('audio.stopRecording') : t('audio.startRecording')}
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
                      <span className="hidden sm:inline">{t('translation.translating')}</span>
                      <span className="sm:hidden">{t('translation.translate')}</span>
                    </> : <>
                      <Languages className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      {t('translation.translate')}
                    </>}
                </Button>
                
                {/* Cultural Notes */}
                {translations?.culturalNotes && <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg sm:rounded-xl border border-accent/30 shadow-soft">
                    <p className="text-[10px] sm:text-xs text-accent-foreground font-semibold mb-2 uppercase tracking-wide">{t('translation.culturalNotes')}</p>
                    <p className="text-xs sm:text-sm text-foreground/80 italic leading-relaxed break-words">{translations.culturalNotes}</p>
                  </div>}
              </div>
            </div>

            {/* Target Column */}
            <div className="flex flex-col bg-gradient-to-br from-muted/10 to-card">
              {/* Target Languages Tabs */}
              <div className="border-b border-border/50 p-3 sm:p-4 md:p-5 bg-gradient-to-r from-card to-muted/10">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-xs sm:text-sm font-semibold text-foreground tracking-wide uppercase">
                    {t('translation.translations')}
                  </div>
                  {isSpeaking && (
                    <div className="flex items-center gap-2">
                    <Button
                      onClick={handleStopSpeaking}
                      variant="destructive"
                      size="sm"
                      className="h-8 gap-1"
                    >
                      <VolumeX className="h-3 w-3" />
                      <span className="text-xs">{t('audio.stop')}</span>
                    </Button>
                  </div>
                  )}
                </div>
              </div>
              
              {/* Translation Results */}
              <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto max-h-[400px] sm:max-h-[500px] md:max-h-[600px]">
                {translations ? <div className="space-y-3 sm:space-y-4 md:space-y-6">
                    {languages.filter(lang => lang.name !== "Detect Language" && lang.name !== translations.detectedLanguage).map(lang => {
                  const key = lang.name.toLowerCase() as keyof typeof translations.translations;
                  const translation = translations.translations[key];
                  return <TranslationCard 
                    key={lang.name}
                    language={lang.name}
                    languageCode={lang.code}
                    translation={translation}
                    flag={lang.icon}
                    onSpeak={(text: string) => handleSpeakTranslation(text, lang.name)}
                    onCopy={(text: string) => handleCopyTranslation(text, lang.name)}
                    isSpeaking={isSpeaking && speakingLanguage === lang.name}
                    onStopSpeaking={handleStopSpeaking}
                  />;
                })}
                  </div> : <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Languages className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mb-3 sm:mb-4 opacity-30" />
                    <p className="text-xs sm:text-sm font-medium">{t('translation.willAppear')}</p>
                  </div>}
              </div>
            </div>
          </div>
        </Card>

        {/* About Tarjama Section */}
        <Card className="mt-4 sm:mt-6 md:mt-8 border-border/50 shadow-elegant bg-card/50 backdrop-blur-sm">
          <div className="p-4 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4">
              About Tarjama
            </h2>
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Tarjama</strong> is a specialized translation tool designed specifically for Moroccan Darija (الدارجة المغربية). Unlike generic translators, Tarjama understands the unique linguistic nuances of Moroccan Arabic dialect, including regional variations, cultural idioms, and colloquial expressions.
              </p>
              <p>
                Spoken by over 30 million people, Darija incorporates influences from Berber (Amazigh), French, Spanish, and Modern Standard Arabic, making it distinct from other Arabic dialects. Our AI-powered translation service preserves these cultural and linguistic subtleties to deliver accurate, context-aware translations.
              </p>
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-3 sm:p-4 rounded-lg border border-primary/20">
                <h3 className="font-semibold text-foreground mb-2">Key Features:</h3>
                <ul className="space-y-1.5 text-xs sm:text-sm">
                  <li>✓ Support for 11+ languages including French, English, Arabic, Spanish, German, Italian, Portuguese, Chinese, Japanese, and Turkish</li>
                  <li>✓ Cultural intelligence that preserves tone, idioms, and regional dialects</li>
                  <li>✓ Voice input for spoken Darija translation</li>
                  <li>✓ Text-to-speech pronunciation in all languages</li>
                  <li>✓ Offline mode with downloadable language packs</li>
                  <li>✓ Translation history to save and review past translations</li>
                  <li>✓ 100% free with no limits</li>
                </ul>
              </div>
              <p>
                Perfect for Moroccan expatriates staying connected with home, language learners exploring Darija, travelers visiting Morocco, business professionals working with Moroccan partners, and anyone interested in Moroccan culture and language.
              </p>
            </div>
          </div>
        </Card>

        {/* FAQ Section */}
        <Card className="mt-4 sm:mt-6 md:mt-8 border-border/50 shadow-elegant bg-card/50 backdrop-blur-sm">
          <div className="p-4 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4 sm:mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4 sm:space-y-6">
              {/* FAQ 1 */}
              <div className="border-b border-border/30 pb-4">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                  What is Darija?
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Darija (الدارجة) is the colloquial Arabic dialect spoken in Morocco. It's distinct from Modern Standard Arabic and incorporates vocabulary and grammar from Berber (Amazigh), French, Spanish, and Arabic. Darija is the everyday language used by Moroccans in daily conversations, different from the formal Arabic used in official documents and media.
                </p>
              </div>

              {/* FAQ 2 */}
              <div className="border-b border-border/30 pb-4">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                  How do I translate Darija to French?
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Simply enter your Darija text in the input field, select "Darija" as your source language (or use "Detect Language"), and click the translate button. Tarjama will automatically provide translations in French along with 10 other languages. You can also use voice input to speak in Darija and get instant translations.
                </p>
              </div>

              {/* FAQ 3 */}
              <div className="border-b border-border/30 pb-4">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                  Is Tarjama translator free?
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Yes! Tarjama is completely free to use with no limitations. You can translate as many texts as you want, use voice input, access text-to-speech, download offline language packs, and save your translation history—all at no cost.
                </p>
              </div>

              {/* FAQ 4 */}
              <div className="border-b border-border/30 pb-4">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                  What languages does Tarjama support?
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Tarjama supports Moroccan Darija and 10 additional languages: French, English, Modern Standard Arabic, Spanish, German, Italian, Portuguese, Chinese, Japanese, and Turkish. You can translate from any of these languages to Darija or from Darija to any of them.
                </p>
              </div>

              {/* FAQ 5 */}
              <div className="border-b border-border/30 pb-4">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                  How accurate is Darija translation?
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Tarjama uses advanced AI models specifically trained on Moroccan Darija to provide highly accurate translations. Our system understands cultural context, regional variations, and colloquial expressions. While no automated translation is perfect, Tarjama is designed to preserve the meaning, tone, and cultural nuances of Darija better than generic translation tools.
                </p>
              </div>

              {/* FAQ 6 */}
              <div className="border-b border-border/30 pb-4">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                  Can I use Tarjama offline?
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Yes! Tarjama supports offline translation. You can download language packs while connected to the internet, and then use them without any connection. This feature is perfect for travelers in Morocco or situations where internet access is limited.
                </p>
              </div>

              {/* FAQ 7 */}
              <div className="pb-4">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                  How do I use voice input for Darija translation?
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Click the microphone button at the bottom right of the text input area. Speak your Darija text clearly, and Tarjama will automatically transcribe your speech and convert it to text. Then simply click translate to get translations in all supported languages. This feature makes it easy to translate spoken conversations in real-time.
                </p>
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
          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-4">
            <Link to="/dictionary" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
              {t('navigation.dictionary')}
            </Link>
            <Link to="/about" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
              {t('navigation.about')}
            </Link>
            <Link to="/faq" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
              {t('navigation.faq')}
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-center mb-3 sm:mb-4">
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {t('footer.copyright')}
            </p>
          </div>

          {/* Name and Instagram Link */}
          <div className="text-center">
            <a href="https://www.instagram.com/_7amza_ft_/" target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5 sm:gap-2 font-medium">
              <span>Hamza Elkhouja</span>
              <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </a>
          </div>
        </div>
      </footer>

      <InstallPrompt />
    </div>
  );
};
export default Index;