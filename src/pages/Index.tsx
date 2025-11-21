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
import { Languages, Loader2, Wand2, Copy, Check, Volume2, VolumeX, Mic, MicOff, Instagram, BookOpen, Info, HelpCircle, Menu } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
import russiaFlag from "@/assets/flags/russia.png";
import koreaFlag from "@/assets/flags/south-korea.png";
import indiaFlag from "@/assets/flags/india.png";
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
    russian: string;
    korean: string;
    hindi: string;
  };
  culturalNotes?: string;
  detectedLanguage?: string;
}
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
const HISTORY_KEY = 'darija-translation-history';
const Index = () => {
  const {
    t,
    i18n
  } = useTranslation();
  const isOnline = useOnlineStatus();
  const [inputText, setInputText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("Darija");
  const [targetLanguage, setTargetLanguage] = useState("English");
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
  const [isSwapping, setIsSwapping] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Dynamic font size based on text length
  const getTextSize = (text: string) => {
    const length = text.length;
    if (length < 50) return 'text-3xl';
    if (length < 150) return 'text-2xl';
    if (length < 300) return 'text-xl';
    if (length < 500) return 'text-lg';
    return 'text-base';
  };

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
  }, {
    name: "Russian",
    code: "ru",
    icon: russiaFlag
  }, {
    name: "Korean",
    code: "ko",
    icon: koreaFlag
  }, {
    name: "Hindi",
    code: "hi",
    icon: indiaFlag
  }];
  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast.error(t('translation.enterText'));
      return;
    }
    setIsTranslating(true);
    setTranslations(null);
    setDetectedLanguage(null);
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
        setDetectedLanguage(data.detectedLanguage);
        toast.success(`${t('translation.detectedLanguage')} ${data.detectedLanguage}`);
      }

      // Add to history
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        text: inputText,
        sourceLanguage: data.detectedLanguage || sourceLanguage,
        targetLanguage: targetLanguage,
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
    setDetectedLanguage(null);
    setTranslations({
      translations: item.translations
    });
    toast.info(t('history.loaded'));
  };
  const handleSwapLanguages = () => {
    if (sourceLanguage === "Detect Language") {
      toast.error("Cannot swap with detect language");
      return;
    }
    setIsSwapping(true);
    setTimeout(() => {
      const temp = sourceLanguage;
      setSourceLanguage(targetLanguage);
      setTargetLanguage(temp);
      setTimeout(() => setIsSwapping(false), 300);
    }, 150);
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
      Turkish: "tr-TR",
      Russian: "ru-RU",
      Korean: "ko-KR",
      Hindi: "hi-IN"
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
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm'
        });
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
        const {
          data,
          error
        } = await supabase.functions.invoke('transcribe-audio', {
          body: {
            audio: base64Audio
          }
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
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col touch-pan-y relative">
      {/* Zellige corner decorations */}
      <div className="fixed top-0 left-0 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 pointer-events-none z-0 overflow-hidden">
        <img src={zelligeCorner} alt="" className="w-full h-full object-cover opacity-90" />
      </div>
      <div className="fixed top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 pointer-events-none z-0 overflow-hidden">
        <img src={zelligeCorner} alt="" className="w-full h-full object-cover opacity-90 scale-x-[-1]" />
      </div>
      <div className="fixed bottom-0 left-0 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 pointer-events-none z-0 overflow-hidden">
        <img src={zelligeCorner} alt="" className="w-full h-full object-cover opacity-90 scale-y-[-1]" />
      </div>
      <div className="fixed bottom-0 right-0 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 pointer-events-none z-0 overflow-hidden">
        <img src={zelligeCorner} alt="" className="w-full h-full object-cover opacity-90 scale-[-1]" />
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
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/dictionary">
                <Button 
                  variant="outline" 
                  className="group relative overflow-hidden gap-2.5 px-5 py-2.5 rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-background via-background/95 to-primary/5 backdrop-blur-md shadow-lg hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/40 transition-all duration-500 hover:scale-105 hover:-translate-y-1 animate-fade-in"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                  <BookOpen className="w-4 h-4 relative z-10 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 text-foreground group-hover:text-primary" />
                  <span className="font-bold text-sm tracking-wide relative z-10 text-foreground group-hover:text-primary transition-colors duration-300">{t('navigation.dictionary')}</span>
                </Button>
              </Link>
              
              <Link to="/about">
                <Button 
                  variant="outline" 
                  className="group relative overflow-hidden gap-2.5 px-5 py-2.5 rounded-2xl border-2 border-moroccan-gold/20 bg-gradient-to-br from-background via-background/95 to-moroccan-gold/5 backdrop-blur-md shadow-lg hover:shadow-2xl hover:shadow-moroccan-gold/20 hover:border-moroccan-gold/40 transition-all duration-500 hover:scale-105 hover:-translate-y-1 animate-fade-in"
                  style={{ animationDelay: '0.1s' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-moroccan-gold/5 via-moroccan-gold/10 to-moroccan-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                  <Info className="w-4 h-4 relative z-10 transition-all duration-500 group-hover:scale-125 text-foreground group-hover:text-moroccan-gold" />
                  <span className="font-bold text-sm tracking-wide relative z-10 text-foreground group-hover:text-moroccan-gold transition-colors duration-300">{t('navigation.about')}</span>
                </Button>
              </Link>
              
              <Link to="/faq">
                <Button 
                  variant="outline" 
                  className="group relative overflow-hidden gap-2.5 px-5 py-2.5 rounded-2xl border-2 border-moroccan-green/20 bg-gradient-to-br from-background via-background/95 to-moroccan-green/5 backdrop-blur-md shadow-lg hover:shadow-2xl hover:shadow-moroccan-green/20 hover:border-moroccan-green/40 transition-all duration-500 hover:scale-105 hover:-translate-y-1 animate-fade-in"
                  style={{ animationDelay: '0.2s' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-moroccan-green/5 via-moroccan-green/10 to-moroccan-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                  <HelpCircle className="w-4 h-4 relative z-10 transition-all duration-500 group-hover:rotate-180 group-hover:scale-110 text-foreground group-hover:text-moroccan-green" />
                  <span className="font-bold text-sm tracking-wide relative z-10 text-foreground group-hover:text-moroccan-green transition-colors duration-300">{t('navigation.faq')}</span>
                </Button>
              </Link>
            </div>

            {/* Mobile Navigation Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="md:hidden group relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-background via-background/95 to-primary/5 backdrop-blur-md shadow-lg hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/40 transition-all duration-500 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-moroccan-red/10 via-moroccan-gold/10 to-moroccan-green/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <Menu className="h-5 w-5 relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-700" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <SheetHeader>
                  <SheetTitle className="text-xl font-bold bg-gradient-to-r from-moroccan-red via-moroccan-gold to-moroccan-green bg-clip-text text-transparent">
                    {t('navigation.menu')}
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8">
                  <Link to="/dictionary" className="w-full">
                    <Button 
                      variant="outline" 
                      className="group relative overflow-hidden w-full justify-start gap-4 px-5 py-6 rounded-2xl border-2 border-primary/20 bg-gradient-to-r from-background to-primary/5 backdrop-blur-md shadow-lg hover:shadow-xl hover:shadow-primary/20 hover:border-primary/40 hover:translate-x-1 transition-all duration-500 animate-fade-in"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-moroccan-red/5 via-moroccan-gold/5 to-moroccan-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <BookOpen className="w-5 h-5 text-primary relative z-10 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                      <span className="font-bold text-base relative z-10 group-hover:text-primary transition-colors duration-300">{t('navigation.dictionary')}</span>
                      <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      </div>
                    </Button>
                  </Link>
                  
                  <Link to="/about" className="w-full">
                    <Button 
                      variant="outline" 
                      className="group relative overflow-hidden w-full justify-start gap-4 px-5 py-6 rounded-2xl border-2 border-moroccan-gold/20 bg-gradient-to-r from-background to-moroccan-gold/5 backdrop-blur-md shadow-lg hover:shadow-xl hover:shadow-moroccan-gold/20 hover:border-moroccan-gold/40 hover:translate-x-1 transition-all duration-500 animate-fade-in"
                      style={{ animationDelay: '0.1s' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-moroccan-gold/5 via-primary/5 to-moroccan-green/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <Info className="w-5 h-5 text-moroccan-gold relative z-10 transition-transform duration-300 group-hover:scale-125" />
                      <span className="font-bold text-base relative z-10 group-hover:text-moroccan-gold transition-colors duration-300">{t('navigation.about')}</span>
                      <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-2 h-2 rounded-full bg-moroccan-gold animate-pulse" />
                      </div>
                    </Button>
                  </Link>
                  
                  <Link to="/faq" className="w-full">
                    <Button 
                      variant="outline" 
                      className="group relative overflow-hidden w-full justify-start gap-4 px-5 py-6 rounded-2xl border-2 border-moroccan-green/20 bg-gradient-to-r from-background to-moroccan-green/5 backdrop-blur-md shadow-lg hover:shadow-xl hover:shadow-moroccan-green/20 hover:border-moroccan-green/40 hover:translate-x-1 transition-all duration-500 animate-fade-in"
                      style={{ animationDelay: '0.2s' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-moroccan-green/5 via-primary/5 to-moroccan-red/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <HelpCircle className="w-5 h-5 text-moroccan-green relative z-10 transition-transform duration-300 group-hover:rotate-180 group-hover:scale-110" />
                      <span className="font-bold text-base relative z-10 group-hover:text-moroccan-green transition-colors duration-300">{t('navigation.faq')}</span>
                      <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-2 h-2 rounded-full bg-moroccan-green animate-pulse" />
                      </div>
                    </Button>
                  </Link>
                  
                  <Link to="/contact" className="w-full">
                    <Button 
                      variant="outline" 
                      className="group relative overflow-hidden w-full justify-start gap-4 px-5 py-6 rounded-2xl border-2 border-moroccan-red/20 bg-gradient-to-r from-background to-moroccan-red/5 backdrop-blur-md shadow-lg hover:shadow-xl hover:shadow-moroccan-red/20 hover:border-moroccan-red/40 hover:translate-x-1 transition-all duration-500 animate-fade-in"
                      style={{ animationDelay: '0.3s' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-moroccan-red/5 via-moroccan-gold/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <Instagram className="w-5 h-5 text-moroccan-red relative z-10 transition-transform duration-300 group-hover:scale-110" />
                      <span className="font-bold text-base relative z-10 group-hover:text-moroccan-red transition-colors duration-300">{t('navigation.contact')}</span>
                      <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-2 h-2 rounded-full bg-moroccan-red animate-pulse" />
                      </div>
                    </Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center gap-2">
              <SettingsDialog selectedVoice={selectedVoice} setSelectedVoice={setSelectedVoice} availableVoices={availableVoices} />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Google Translate Layout */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-7xl flex-1">
        <Card className="overflow-hidden border-border/50 shadow-elegant hover:shadow-hover transition-all duration-500 bg-card/50 backdrop-blur-sm">
          {/* Language Selectors with Swap Button */}
          <div className="border-b border-border/50 p-3 sm:p-4 md:p-5 bg-gradient-to-r from-card via-muted/5 to-card px-[5px]">
            <div className="flex items-center gap-3 justify-center">
              {/* Source Language - Slightly Reduced */}
              <div className="flex-[0.85]">
                <Select value={sourceLanguage} onValueChange={value => {
                setSourceLanguage(value);
                setDetectedLanguage(null);
              }}>
                  <SelectTrigger className={`w-full h-14 bg-gradient-to-br from-background to-muted/30 border-2 border-border/70 hover:border-primary/50 hover:bg-gradient-to-br hover:from-primary/5 hover:to-accent/5 transition-all duration-300 rounded-2xl shadow-soft hover:shadow-moroccan group ${isSwapping ? 'scale-95 opacity-70' : 'scale-100 opacity-100'}`}>
                    <SelectValue>
                      <div className="flex items-center gap-3">
                        {sourceLanguage === "Detect Language" ? <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                            <Wand2 className="w-5 h-5 text-primary" />
                          </div> : <div className="relative">
                            <img src={languages.find(l => l.name === sourceLanguage)?.icon as string} alt={sourceLanguage} className="w-8 h-8 rounded-lg object-cover shadow-sm ring-2 ring-border/30 group-hover:ring-primary/50 transition-all" />
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/0 to-white/10 pointer-events-none" />
                          </div>}
                        <div className="flex-1 text-left">
                          <span className="font-semibold text-base block">{t(`languages.${sourceLanguage.toLowerCase().replace(' ', '')}`)}</span>
                        </div>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-xl border-2 border-border shadow-2xl z-[100] rounded-xl">
                  {languages.map(lang => <SelectItem key={lang.name} value={lang.name} className="cursor-pointer hover:bg-primary/10 focus:bg-primary/10 rounded-lg my-1 transition-all duration-200 hover:scale-[1.02]">
                      <div className="flex items-center gap-3 py-1">
                        {lang.name === "Detect Language" ? <div className="p-2 bg-primary/10 rounded-lg">
                            <Wand2 className="w-5 h-5 text-primary" />
                          </div> : <div className="relative">
                            <img src={lang.icon as string} alt={lang.name} className="w-7 h-7 rounded-lg object-cover shadow-sm ring-2 ring-border/20" />
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/0 to-white/10 pointer-events-none" />
                          </div>}
                        <span className="font-medium">{t(`languages.${lang.name.toLowerCase().replace(' ', '')}`)}</span>
                      </div>
                    </SelectItem>)}
                </SelectContent>
                </Select>
              </div>

              {/* Detected Language Badge */}
              {detectedLanguage && <div className="animate-fade-in">
                  <span className="text-xs bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-full border-2 border-primary shadow-moroccan font-medium whitespace-nowrap">
                    {t('translation.detectedLanguage')}: {detectedLanguage}
                  </span>
                </div>}

              {/* Detect Language Button */}
              {sourceLanguage !== "Detect Language" && <Button variant="outline" size="sm" onClick={() => setSourceLanguage("Detect Language")} className="h-12 w-12 p-0 bg-gradient-to-br from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 border-2 border-primary/30 hover:border-primary/50 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-moroccan" aria-label={t('languages.detectlanguage')}>
                  <Wand2 className="h-5 w-5" />
                </Button>}
              
              {/* Swap Button */}
              <Button variant="ghost" size="sm" onClick={handleSwapLanguages} disabled={sourceLanguage === "Detect Language" || isSwapping} className={`h-12 w-12 p-0 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-110 hover:shadow-moroccan disabled:opacity-50 disabled:cursor-not-allowed ${isSwapping ? 'animate-spin' : ''}`} aria-label="Swap languages">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 text-primary">
                  <path d="M7 16V4M7 4L3 8M7 4L11 8" />
                  <path d="M17 8V20M17 20L21 16M17 20L13 16" />
                </svg>
              </Button>
              
              {/* Target Language */}
              <div className="flex-1">
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger className={`flex-1 h-14 bg-gradient-to-br from-background to-muted/30 border-2 border-border/70 hover:border-accent/50 hover:bg-gradient-to-br hover:from-accent/5 hover:to-primary/5 transition-all duration-300 rounded-2xl shadow-soft hover:shadow-moroccan group ${isSwapping ? 'scale-95 opacity-70' : 'scale-100 opacity-100'}`}>
                  <SelectValue>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={languages.find(l => l.name === targetLanguage)?.icon as string} alt={targetLanguage} className="w-8 h-8 rounded-lg object-cover shadow-sm ring-2 ring-border/30 group-hover:ring-accent/50 transition-all" />
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/0 to-white/10 pointer-events-none" />
                      </div>
                      <span className="font-semibold text-base">{t(`languages.${targetLanguage.toLowerCase().replace(' ', '')}`)}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-xl border-2 border-border shadow-2xl z-[100] rounded-xl">
                  {languages.filter(lang => lang.name !== "Detect Language").map(lang => <SelectItem key={lang.name} value={lang.name} className="cursor-pointer hover:bg-accent/10 focus:bg-accent/10 rounded-lg my-1 transition-all duration-200 hover:scale-[1.02]">
                      <div className="flex items-center gap-3 py-1">
                        <div className="relative">
                          <img src={lang.icon as string} alt={lang.name} className="w-7 h-7 rounded-lg object-cover shadow-sm ring-2 ring-border/20" />
                          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/0 to-white/10 pointer-events-none" />
                        </div>
                        <span className="font-medium">{t(`languages.${lang.name.toLowerCase().replace(' ', '')}`)}</span>
                      </div>
                    </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border/50">
            {/* Source Column */}
            <div className="flex flex-col">
              
              {/* Source Text Input */}
              <div className="flex-1 p-4 sm:p-5 md:p-6">
                <div className={`relative p-5 sm:p-6 backdrop-blur-sm border border-border/50 rounded-lg shadow-moroccan transition-all duration-300 ${(() => {
                const themes: Record<string, string> = {
                  'Darija': 'border-l-4 border-l-red-600 bg-gradient-to-r from-red-50/10 to-green-50/10 dark:from-red-950/20 dark:to-green-950/20',
                  'French': 'border-l-4 border-l-blue-600 bg-gradient-to-r from-blue-50/10 via-white/5 to-red-50/10 dark:from-blue-950/20 dark:via-background/10 dark:to-red-950/20',
                  'Arabic': 'border-l-4 border-l-green-600 bg-gradient-to-r from-green-50/10 to-white/5 dark:from-green-950/20 dark:to-background/10',
                  'English': 'border-l-4 border-l-blue-700 bg-gradient-to-r from-red-50/10 via-white/5 to-blue-50/10 dark:from-red-950/20 dark:via-background/10 dark:to-blue-950/20',
                  'Spanish': 'border-l-4 border-l-red-600 bg-gradient-to-r from-red-50/10 to-yellow-50/10 dark:from-red-950/20 dark:to-yellow-950/20',
                  'German': 'border-l-4 border-l-yellow-500 bg-gradient-to-r from-red-50/10 via-yellow-50/10 to-zinc-100/10 dark:from-red-950/20 dark:via-yellow-950/20 dark:to-zinc-900/20',
                  'Italian': 'border-l-4 border-l-green-600 bg-gradient-to-r from-green-50/10 via-white/5 to-red-50/10 dark:from-green-950/20 dark:via-background/10 dark:to-red-950/20',
                  'Portuguese': 'border-l-4 border-l-green-700 bg-gradient-to-r from-green-50/10 to-red-50/10 dark:from-green-950/20 dark:to-red-950/20',
                  'Chinese': 'border-l-4 border-l-red-600 bg-gradient-to-r from-red-50/10 to-yellow-50/10 dark:from-red-950/20 dark:to-yellow-950/20',
                  'Japanese': 'border-l-4 border-l-red-600 bg-gradient-to-r from-red-50/10 to-white/5 dark:from-red-950/20 dark:to-background/10',
                  'Turkish': 'border-l-4 border-l-red-600 bg-gradient-to-r from-red-50/10 to-white/5 dark:from-red-950/20 dark:to-background/10',
                  'Russian': 'border-l-4 border-l-blue-600 bg-gradient-to-r from-blue-50/10 via-white/5 to-red-50/10 dark:from-blue-950/20 dark:via-background/10 dark:to-red-950/20',
                  'Korean': 'border-l-4 border-l-blue-700 bg-gradient-to-r from-blue-50/10 via-red-50/10 to-white/5 dark:from-blue-950/20 dark:via-red-950/20 dark:to-background/10',
                  'Hindi': 'border-l-4 border-l-orange-600 bg-gradient-to-r from-orange-50/10 via-white/5 to-green-50/10 dark:from-orange-950/20 dark:via-background/10 dark:to-green-950/20',
                  'Detect Language': 'border-l-4 border-l-primary bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20'
                };
                return themes[sourceLanguage] || '';
              })()}`}>
                  <Textarea placeholder={t('translation.placeholder')} value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleTranslate();
                    }
                  }} className={`${getTextSize(inputText)} resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 leading-relaxed placeholder:text-muted-foreground/60 bg-transparent min-h-[200px] transition-all duration-200`} />
                  <Button variant="ghost" size="sm" onClick={isRecording ? stopRecording : startRecording} disabled={isTranscribing} className={`absolute bottom-2 right-2 h-10 w-10 p-0 rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : 'hover:bg-primary/10'}`} aria-label={isRecording ? t('audio.stopRecording') : t('audio.startRecording')}>
                    {isTranscribing ? <Loader2 className="h-5 w-5 animate-spin" /> : isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
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
              </div>
            </div>

            {/* Target Column */}
            <div className="flex flex-col bg-gradient-to-br from-muted/10 to-card">
              {/* Translation Result */}
            <div className="flex-1 p-4 sm:p-5 md:p-6">
                {translations ? (() => {
                const getCountryTheme = (lang: string) => {
                  const themes: Record<string, string> = {
                    'Darija': 'border-l-4 border-l-red-600 bg-gradient-to-r from-red-50/10 to-green-50/10 dark:from-red-950/20 dark:to-green-950/20',
                    'French': 'border-l-4 border-l-blue-600 bg-gradient-to-r from-blue-50/10 via-white/5 to-red-50/10 dark:from-blue-950/20 dark:via-background/10 dark:to-red-950/20',
                    'Arabic': 'border-l-4 border-l-green-600 bg-gradient-to-r from-green-50/10 to-white/5 dark:from-green-950/20 dark:to-background/10',
                    'English': 'border-l-4 border-l-blue-700 bg-gradient-to-r from-red-50/10 via-white/5 to-blue-50/10 dark:from-red-950/20 dark:via-background/10 dark:to-blue-950/20',
                    'Spanish': 'border-l-4 border-l-red-600 bg-gradient-to-r from-red-50/10 to-yellow-50/10 dark:from-red-950/20 dark:to-yellow-950/20',
                    'German': 'border-l-4 border-l-yellow-500 bg-gradient-to-r from-red-50/10 via-yellow-50/10 to-zinc-100/10 dark:from-red-950/20 dark:via-yellow-950/20 dark:to-zinc-900/20',
                    'Italian': 'border-l-4 border-l-green-600 bg-gradient-to-r from-green-50/10 via-white/5 to-red-50/10 dark:from-green-950/20 dark:via-background/10 dark:to-red-950/20',
                    'Portuguese': 'border-l-4 border-l-green-700 bg-gradient-to-r from-green-50/10 to-red-50/10 dark:from-green-950/20 dark:to-red-950/20',
                    'Chinese': 'border-l-4 border-l-red-600 bg-gradient-to-r from-red-50/10 to-yellow-50/10 dark:from-red-950/20 dark:to-yellow-950/20',
                    'Japanese': 'border-l-4 border-l-red-600 bg-gradient-to-r from-red-50/10 to-white/5 dark:from-red-950/20 dark:to-background/10',
                    'Turkish': 'border-l-4 border-l-red-600 bg-gradient-to-r from-red-50/10 to-white/5 dark:from-red-950/20 dark:to-background/10',
                    'Russian': 'border-l-4 border-l-blue-600 bg-gradient-to-r from-blue-50/10 via-white/5 to-red-50/10 dark:from-blue-950/20 dark:via-background/10 dark:to-red-950/20',
                    'Korean': 'border-l-4 border-l-blue-700 bg-gradient-to-r from-blue-50/10 via-red-50/10 to-white/5 dark:from-blue-950/20 dark:via-red-950/20 dark:to-background/10',
                    'Hindi': 'border-l-4 border-l-orange-600 bg-gradient-to-r from-orange-50/10 via-white/5 to-green-50/10 dark:from-orange-950/20 dark:via-background/10 dark:to-green-950/20'
                  };
                  return themes[lang] || '';
                };
                const key = targetLanguage.toLowerCase() as keyof typeof translations.translations;
                const translation = translations.translations[key];
                return <div className={`p-5 sm:p-6 backdrop-blur-sm border border-border/50 rounded-lg shadow-moroccan transition-all duration-300 ${getCountryTheme(targetLanguage)}`}>
                        <div className="space-y-4">
                          <div className={`min-h-[200px] ${getTextSize(translation || '')} leading-relaxed text-foreground/90 transition-all duration-200`}>
                            {translation || <span className="text-muted-foreground italic text-base">{t('translation.willAppear')}</span>}
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-4 border-t border-border/50">
                            <Button variant="ghost" size="sm" onClick={() => handleCopyTranslation(translation, targetLanguage)} className="gap-2">
                              <Copy className="h-4 w-4" />
                              <span className="text-sm">{t('audio.copy')}</span>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => {
                        if (isSpeaking) {
                          handleStopSpeaking();
                        } else {
                          handleSpeakTranslation(translation, targetLanguage);
                        }
                      }} className="gap-2">
                              {isSpeaking ? <>
                                  <VolumeX className="h-4 w-4 animate-pulse" />
                                  <span className="text-sm">{t('audio.stop')}</span>
                                </> : <>
                                  <Volume2 className="h-4 w-4" />
                                  <span className="text-sm">{t('audio.play')}</span>
                                </>}
                            </Button>
                          </div>
                          
                          {/* Cultural Notes */}
                          {translations.culturalNotes && <div className="mt-6 p-5 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 rounded-xl border border-primary/20 shadow-moroccan animate-fade-in backdrop-blur-sm relative overflow-hidden">
                              {/* Decorative corner accent */}
                              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-bl-full" />
                              <div className="absolute bottom-0 left-0 w-16 h-16 bg-accent/10 rounded-tr-full" />
                              
                              <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="p-2 bg-primary/10 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                    </svg>
                                  </div>
                                  <p className="text-sm font-bold text-primary uppercase tracking-wider">
                                    {t('translation.culturalNotes')}
                                  </p>
                                </div>
                                <p className="text-sm text-foreground leading-relaxed pl-1 font-medium">
                                  {translations.culturalNotes}
                                </p>
                              </div>
                            </div>}
                        </div>
                      </div>;
              })() : <div className="flex flex-col items-center justify-center h-full text-muted-foreground min-h-[300px]">
                    <Languages className="w-16 h-16 mb-4 opacity-30" />
                    <p className="text-sm font-medium">{t('translation.willAppear')}</p>
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
      <footer className="bg-card/80 backdrop-blur-xl border-t border-border/50 mt-auto relative z-10">
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
            <Link to="/contact" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors font-medium">
              {t('navigation.contact')}
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
    </div>;
};
export default Index;