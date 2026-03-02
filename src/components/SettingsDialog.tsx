import { Settings, Download, Trash2, Loader2, Palette, Type, RotateCcw, Info, FileDown, FileUp, History, HelpCircle, Pause, Play, Globe2, Moon, Sun, Monitor, Languages, Volume2, Shield, CloudDownload, Check, MessageCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTranslation } from "react-i18next";
import { useOfflineLanguages } from "@/hooks/useOfflineLanguages";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useTheme } from "next-themes";
import moroccoFlag from "@/assets/flags/morocco.png";
import ukFlag from "@/assets/flags/uk.png";
import franceFlag from "@/assets/flags/france.png";
import saudiArabiaFlag from "@/assets/flags/saudi-arabia.png";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

interface SettingsDialogProps {
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  availableVoices: SpeechSynthesisVoice[];
  autoVoiceSelect?: boolean;
  setAutoVoiceSelect?: (auto: boolean) => void;
  speechRate?: number;
  setSpeechRate?: (rate: number) => void;
  profanityFilterEnabled?: boolean;
  setProfanityFilterEnabled?: (enabled: boolean) => void;
  onShowTutorial?: () => void;
}

export function SettingsDialog({ 
  selectedVoice, 
  setSelectedVoice, 
  availableVoices,
  autoVoiceSelect = true,
  setAutoVoiceSelect,
  speechRate = 1.0,
  setSpeechRate,
  profanityFilterEnabled = true,
  setProfanityFilterEnabled,
  onShowTutorial
}: SettingsDialogProps) {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { 
    offlineLanguages, 
    downloadLanguage, 
    removeLanguage, 
    downloadProgress,
    downloadStates,
    pauseDownload,
    resumeDownload
  } = useOfflineLanguages();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [currentProgress, setCurrentProgress] = useState<{ [key: string]: number }>({});
  const [fontSize, setFontSize] = useState(16);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [sahbiDarijaScript, setSahbiDarijaScript] = useState<'latin' | 'arabic' | 'both'>(() => {
    const saved = localStorage.getItem('sahbiDarijaScript');
    return (saved as 'latin' | 'arabic' | 'both') || 'both';
  });
  
  useEffect(() => {
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
      const size = parseInt(savedFontSize);
      setFontSize(size);
      document.documentElement.style.fontSize = `${size}px`;
    }
  }, []);

  const handleAutoVoiceToggle = (checked: boolean) => {
    if (setAutoVoiceSelect) {
      setAutoVoiceSelect(checked);
      localStorage.setItem('autoVoiceSelect', checked.toString());
    }
  };

  const handleSpeechRateChange = (value: number[]) => {
    if (setSpeechRate) {
      const rate = value[0];
      setSpeechRate(rate);
      localStorage.setItem('speechRate', rate.toString());
    }
  };

  const handleProfanityFilterToggle = (checked: boolean) => {
    if (setProfanityFilterEnabled) {
      setProfanityFilterEnabled(checked);
      localStorage.setItem('profanityFilterEnabled', checked.toString());
    }
  };

  const languages = [
    { code: 'en', name: 'English', flag: ukFlag },
    { code: 'ar', name: 'العربية', flag: saudiArabiaFlag },
    { code: 'fr', name: 'Français', flag: franceFlag },
    { code: 'dar', name: 'الدارجة', flag: moroccoFlag },
  ];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
    // Set document direction for RTL languages
    document.documentElement.dir = langCode === 'ar' || langCode === 'dar' ? 'rtl' : 'ltr';
  };

  const handleDownload = async (code: string) => {
    setDownloading(code);
    setCurrentProgress(prev => ({ ...prev, [code]: 0 }));
    try {
      await downloadLanguage(code, (progress) => {
        setCurrentProgress(prev => ({ ...prev, [code]: progress }));
      });
      toast.success(t('settings.offlineDownloaded'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage !== 'Download paused') {
        toast.error(t('settings.offlineDownloadError'));
      }
    } finally {
      setDownloading(null);
      setTimeout(() => {
        setCurrentProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[code];
          return newProgress;
        });
      }, 1000);
    }
  };

  const handlePause = (code: string) => {
    pauseDownload(code);
    toast.info(t('settings.downloadPaused'));
  };

  const handleResume = async (code: string) => {
    setDownloading(code);
    try {
      setCurrentProgress(prev => ({ ...prev, [code]: downloadProgress[code] || 0 }));
      await resumeDownload(code, (progress) => {
        setCurrentProgress(prev => ({ ...prev, [code]: progress }));
      });
      toast.success(t('settings.offlineDownloaded'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage !== 'Download paused') {
        toast.error(t('settings.offlineDownloadError'));
      }
    } finally {
      setDownloading(null);
    }
  };

  const handleRemove = (code: string) => {
    removeLanguage(code);
    toast.success(t('settings.offlineRemoved'));
  };

  const handleFontSizeChange = (value: number[]) => {
    const size = value[0];
    setFontSize(size);
    document.documentElement.style.fontSize = `${size}px`;
    localStorage.setItem('fontSize', size.toString());
  };

  const handleClearHistory = () => {
    localStorage.removeItem('translationHistory');
    toast.success(t('settings.historyClearedSuccess'));
  };

  const handleResetSettings = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleExportSettings = () => {
    const settings = {
      language: i18n.language,
      theme,
      fontSize,
      speechRate,
      autoVoiceSelect,
      profanityFilterEnabled,
    };
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tarjama-settings.json';
    a.click();
    toast.success(t('settings.exportSuccess'));
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const settings = JSON.parse(e.target?.result as string);
          if (settings.language) handleLanguageChange(settings.language);
          if (settings.theme) setTheme(settings.theme);
          if (settings.fontSize) handleFontSizeChange([settings.fontSize]);
          if (settings.speechRate && setSpeechRate) setSpeechRate(settings.speechRate);
          if (typeof settings.autoVoiceSelect === 'boolean' && setAutoVoiceSelect) setAutoVoiceSelect(settings.autoVoiceSelect);
          if (typeof settings.profanityFilterEnabled === 'boolean' && setProfanityFilterEnabled) setProfanityFilterEnabled(settings.profanityFilterEnabled);
          toast.success(t('settings.importSuccess'));
        } catch (error) {
          toast.error(t('settings.importError'));
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 hover:scale-110 transition-transform duration-200">
          <Settings className="h-5 w-5 hover:rotate-90 transition-transform duration-500" />
          <span className="sr-only">{t('settings.title')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300">
        <DialogHeader className="animate-in slide-in-from-top-2 duration-300 pb-2">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            <div className="p-2 rounded-lg bg-primary/10 animate-pulse">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            {t('settings.title')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Language Selection */}
          <div className="space-y-3 animate-in slide-in-from-left-3 duration-300 delay-100 group">
            <Label htmlFor="language" className="flex items-center gap-2 text-base font-semibold">
              <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Globe2 className="h-4 w-4 text-primary" />
              </div>
              {t('settings.language')}
            </Label>
            <Select value={i18n.language} onValueChange={handleLanguageChange}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex items-center gap-2">
                      <img src={lang.flag} alt={lang.name} className="w-5 h-5 rounded object-cover" />
                      <span>{lang.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Theme Selection */}
          <div className="space-y-3 animate-in slide-in-from-left-3 duration-300 delay-150 group">
            <Label htmlFor="theme" className="flex items-center gap-2 text-base font-semibold">
              <div className="p-1.5 rounded-md bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                <Palette className="h-4 w-4 text-secondary" />
              </div>
              {t('settings.theme')}
            </Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-amber-500" />
                    {t('settings.lightMode')}
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-blue-500" />
                    {t('settings.darkMode')}
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-gray-500" />
                    {t('settings.systemMode')}
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Font Size Control */}
          <div className="space-y-3 animate-in slide-in-from-left-3 duration-300 delay-200 group">
            <div className="flex items-center justify-between">
              <Label htmlFor="fontSize" className="flex items-center gap-2 text-base font-semibold">
                <div className="p-1.5 rounded-md bg-accent/10 group-hover:bg-accent/20 transition-colors">
                  <Type className="h-4 w-4 text-accent-foreground" />
                </div>
                {t('settings.fontSize')}
              </Label>
              <span className="text-sm font-mono font-semibold px-2 py-1 rounded-md bg-muted">{fontSize}px</span>
            </div>
            <Slider
              id="fontSize"
              min={12}
              max={20}
              step={1}
              value={[fontSize]}
              onValueChange={handleFontSizeChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t('settings.small')}</span>
              <span>{t('settings.medium')}</span>
              <span>{t('settings.large')}</span>
            </div>
          </div>

          <Separator />

          {/* Voice Selection */}
          {availableVoices.length > 0 && (
            <div className="space-y-3 animate-in slide-in-from-left-3 duration-300 delay-250 group">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <div className="p-1.5 rounded-md bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                  <Volume2 className="h-4 w-4 text-secondary" />
                </div>
                {t('settings.voice')}
              </Label>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                <Label htmlFor="autoVoice" className="cursor-pointer">{t('settings.autoVoiceSelect')}</Label>
                <Switch
                  id="autoVoice"
                  checked={autoVoiceSelect}
                  onCheckedChange={handleAutoVoiceToggle}
                  disabled={!setAutoVoiceSelect}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t('settings.autoVoiceDescription')}
              </p>
              
              <div className="space-y-2">
                <Select 
                  value={selectedVoice} 
                  onValueChange={setSelectedVoice}
                  disabled={autoVoiceSelect}
                >
                  <SelectTrigger id="voice" className={autoVoiceSelect ? 'opacity-50' : ''}>
                    <SelectValue placeholder={t('settings.selectVoice')} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                  {availableVoices.map((voice) => (
                    <SelectItem key={voice.name} value={voice.name}>
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-3 w-3 text-muted-foreground" />
                        <span>{voice.name.split(' ').slice(0, 2).join(' ')}</span>
                        <span className="text-xs text-muted-foreground">({voice.lang})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Speech Rate Control */}
            {setSpeechRate && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="speechRate">{t('settings.speechRate')}</Label>
                  <span className="text-sm text-muted-foreground">{speechRate.toFixed(1)}x</span>
                </div>
                <Slider
                  id="speechRate"
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  value={[speechRate]}
                  onValueChange={handleSpeechRateChange}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{t('settings.slower')}</span>
                  <span>{t('settings.normal')}</span>
                  <span>{t('settings.faster')}</span>
                </div>
              </div>
            )}
            </div>
          )}

          <Separator />

          {/* Profanity Filter */}
          <div className="space-y-3 animate-in slide-in-from-left-3 duration-300 delay-300 group">
            <div className="flex items-center justify-between">
              <Label htmlFor="profanityFilter" className="flex items-center gap-2 text-base font-semibold">
                <div className="p-1.5 rounded-md bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
                  <Shield className="h-4 w-4 text-destructive" />
                </div>
                {t('settings.profanityFilter')}
              </Label>
              <Switch
                id="profanityFilter"
                checked={profanityFilterEnabled}
                onCheckedChange={handleProfanityFilterToggle}
                disabled={!setProfanityFilterEnabled}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t('settings.profanityFilterDescription')}
            </p>
          </div>

          <Separator />

          {/* Sahbi Settings */}
          <div className="space-y-3 animate-in slide-in-from-left-3 duration-300 delay-325 group">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <div className="p-1.5 rounded-md bg-gradient-to-r from-primary/10 to-amber-500/10 group-hover:from-primary/20 group-hover:to-amber-500/20 transition-colors">
                  <MessageCircle className="h-4 w-4 text-primary" />
                </div>
                {t('settings.sahbiSettings')}
              </Label>
              <Link to="/sahbi">
                <Button variant="outline" size="sm" className="text-xs">
                  {t('settings.openSahbi')}
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('settings.sahbiDescription')}
            </p>
            
            <div className="space-y-3 p-4 rounded-xl border bg-muted/30">
              <Label className="text-sm font-medium">{t('settings.darijaScript')}</Label>
              <RadioGroup
                value={sahbiDarijaScript}
                onValueChange={(value: 'latin' | 'arabic' | 'both') => {
                  setSahbiDarijaScript(value);
                  localStorage.setItem('sahbiDarijaScript', value);
                  toast.success(t('settings.sahbiScriptUpdated'));
                }}
                className="grid grid-cols-1 gap-2"
              >
                <div className="flex items-center space-x-3 p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="both" id="script-both" />
                  <Label htmlFor="script-both" className="flex-1 cursor-pointer">
                    <span className="font-medium">{t('settings.scriptBoth')}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{t('settings.scriptBothDesc')}</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="latin" id="script-latin" />
                  <Label htmlFor="script-latin" className="flex-1 cursor-pointer">
                    <span className="font-medium">{t('settings.scriptLatin')}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{t('settings.scriptLatinDesc')}</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors cursor-pointer">
                  <RadioGroupItem value="arabic" id="script-arabic" />
                  <Label htmlFor="script-arabic" className="flex-1 cursor-pointer">
                    <span className="font-medium">{t('settings.scriptArabic')}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{t('settings.scriptArabicDesc')}</p>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <Separator />

          {/* Offline Languages */}
          <div className="space-y-3 animate-in slide-in-from-left-3 duration-300 delay-350 group">
            <div>
              <Label className="flex items-center gap-2 text-base font-semibold">
                <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <CloudDownload className="h-4 w-4 text-primary" />
                </div>
                {t('settings.offlineLanguages')}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {t('settings.offlineLanguagesDescription')}
              </p>
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {offlineLanguages.map((lang) => (
                <div
                  key={lang.code}
                  className="flex items-center justify-between p-4 rounded-xl border-2 bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Languages className="h-4 w-4 text-primary" />
                      <p className="text-sm font-semibold">{lang.name}</p>
                      {lang.downloaded && (
                        <div className="ml-auto">
                          <Check className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">~{lang.size}</p>
                    {(currentProgress[lang.code] !== undefined || downloadStates[lang.code] === 'paused') && (
                      <div className="mt-3 space-y-2">
                        <div className="relative">
                          <Progress 
                            value={currentProgress[lang.code] || downloadProgress[lang.code] || 0} 
                            className="h-3 bg-muted rounded-full overflow-hidden"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-primary-foreground drop-shadow-sm">
                              {Math.round(currentProgress[lang.code] || downloadProgress[lang.code] || 0)}%
                            </span>
                          </div>
                        </div>
                        {downloadStates[lang.code] === 'paused' && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                            <Pause className="h-3 w-3" />
                            {t('settings.paused')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex gap-2">
                    {lang.downloaded ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemove(lang.code)}
                        className="hover:scale-110 transition-transform shadow-md"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : downloadStates[lang.code] === 'downloading' ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="font-mono font-semibold min-w-[60px]"
                        >
                          {Math.round(currentProgress[lang.code] || 0)}%
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePause(lang.code)}
                          className="hover:bg-amber-100 dark:hover:bg-amber-900 hover:scale-110 transition-all"
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      </>
                    ) : downloadStates[lang.code] === 'paused' ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="font-mono font-semibold min-w-[60px]"
                        >
                          {Math.round(downloadProgress[lang.code] || 0)}%
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleResume(lang.code)}
                          className="bg-green-500 hover:bg-green-600 hover:scale-110 transition-all shadow-md"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleDownload(lang.code)}
                        disabled={downloading === lang.code}
                        className="bg-primary hover:bg-primary/90 hover:scale-110 transition-all shadow-md group-hover:shadow-lg"
                      >
                        {downloading === lang.code ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Advanced Settings */}
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen} className="animate-in slide-in-from-left-3 duration-300 delay-400">
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between hover:bg-muted/50 transition-all duration-200 group">
                <span className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Info className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-semibold">{t('settings.advanced')}</span>
                </span>
                <RotateCcw className={`h-4 w-4 transition-all duration-300 ${advancedOpen ? 'rotate-180 text-primary' : 'text-muted-foreground'}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearHistory}
                  className="flex-1 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all"
                >
                  <History className="h-4 w-4 mr-2" />
                  {t('settings.clearHistory')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetSettings}
                  className="flex-1 hover:bg-amber-100 dark:hover:bg-amber-900 hover:border-amber-500 transition-all"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {t('settings.reset')}
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportSettings}
                  className="flex-1 hover:bg-green-100 dark:hover:bg-green-900 hover:border-green-500 transition-all"
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  {t('settings.export')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('import-settings')?.click()}
                  className="flex-1 hover:bg-blue-100 dark:hover:bg-blue-900 hover:border-blue-500 transition-all"
                >
                  <FileUp className="h-4 w-4 mr-2" />
                  {t('settings.import')}
                </Button>
              </div>


              {/* Hidden file input for import */}
              <input
                type="file"
                accept=".json"
                onChange={handleImportSettings}
                className="hidden"
                id="import-settings"
              />
              
              {onShowTutorial && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onShowTutorial}
                  className="w-full hover:bg-purple-100 dark:hover:bg-purple-900 hover:border-purple-500 transition-all"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  {t('settings.showTutorial')}
                </Button>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Show Tutorial Button */}
          {onShowTutorial && (
            <div className="space-y-2 animate-in slide-in-from-left-3 duration-300 delay-450">
              <Button
                variant="outline"
                onClick={onShowTutorial}
                className="w-full gap-2 hover-scale hover:bg-primary/10 transition-all duration-200"
              >
                <HelpCircle className="h-4 w-4 text-primary" />
                {t('settings.helpTutorial')}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
