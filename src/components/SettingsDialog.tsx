import { Settings, Download, Trash2, Loader2, Palette, Type, RotateCcw, Info, FileDown, FileUp, History, HelpCircle } from "lucide-react";
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
  const { offlineLanguages, downloadLanguage, removeLanguage, downloadProgress } = useOfflineLanguages();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [currentProgress, setCurrentProgress] = useState<{ [key: string]: number }>({});
  const [fontSize, setFontSize] = useState(16);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  
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
      toast.success(t('offline.downloaded'));
    } catch (error) {
      toast.error(t('offline.downloadFailed'));
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

  const handleRemove = (code: string) => {
    removeLanguage(code);
    toast.success(t('offline.removed'));
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
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Settings className="h-5 w-5" />
          <span className="sr-only">{t('settings.title')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300">
        <DialogHeader className="animate-in slide-in-from-top-2 duration-300">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-5 w-5 text-primary animate-spin-slow" style={{ animationDuration: '3s' }} />
            {t('settings.title')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Language Selection */}
          <div className="space-y-2 animate-in slide-in-from-left-3 duration-300 delay-100">
            <Label htmlFor="language" className="flex items-center gap-2 text-base font-semibold">
              <span>🌍</span> {t('settings.language')}
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
          <div className="space-y-2 animate-in slide-in-from-left-3 duration-300 delay-150">
            <Label htmlFor="theme" className="flex items-center gap-2 text-base font-semibold">
              <Palette className="h-4 w-4 text-primary" /> {t('settings.theme')}
            </Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger id="theme">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">☀️ {t('settings.lightMode')}</SelectItem>
                <SelectItem value="dark">🌙 {t('settings.darkMode')}</SelectItem>
                <SelectItem value="system">💻 {t('settings.systemMode')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Font Size Control */}
          <div className="space-y-2 animate-in slide-in-from-left-3 duration-300 delay-200">
            <div className="flex items-center justify-between">
              <Label htmlFor="fontSize" className="flex items-center gap-2 text-base font-semibold">
                <Type className="h-4 w-4 text-primary" /> {t('settings.fontSize')}
              </Label>
              <span className="text-sm text-muted-foreground">{fontSize}px</span>
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
            <div className="space-y-3 animate-in slide-in-from-left-3 duration-300 delay-250">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoVoice">{t('settings.autoVoiceSelect')}</Label>
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
                <Label htmlFor="voice">{t('settings.voice')}</Label>
                <Select 
                  value={selectedVoice} 
                  onValueChange={setSelectedVoice}
                  disabled={autoVoiceSelect}
                >
                  <SelectTrigger id="voice">
                    <SelectValue placeholder={t('settings.selectVoice')} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                  {availableVoices.map((voice) => (
                    <SelectItem key={voice.name} value={voice.name}>
                      {voice.name.split(' ').slice(0, 2).join(' ')} ({voice.lang})
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
          <div className="space-y-3 animate-in slide-in-from-left-3 duration-300 delay-300">
            <div className="flex items-center justify-between">
              <Label htmlFor="profanityFilter" className="flex items-center gap-2 text-base font-semibold">
                🛡️ {t('settings.profanityFilter')}
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

          {/* Offline Languages */}
          <div className="space-y-3 animate-in slide-in-from-left-3 duration-300 delay-350">
            <div>
              <Label className="flex items-center gap-2 text-base font-semibold">
                📦 {t('offline.title')}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Download AI translation models for offline use. Each model enables translation between that language and English.
              </p>
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {offlineLanguages.map((lang) => (
                <div
                  key={lang.code}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{lang.name}</p>
                    <p className="text-xs text-muted-foreground">~{lang.size} AI model</p>
                    {downloading === lang.code && currentProgress[lang.code] !== undefined && (
                      <div className="mt-2 space-y-1">
                        <Progress value={currentProgress[lang.code]} className="h-2" />
                        <p className="text-xs text-muted-foreground text-center">{currentProgress[lang.code]}%</p>
                      </div>
                    )}
                  </div>
                  {lang.downloaded ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(lang.code)}
                      className="h-8"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {t('offline.remove')}
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleDownload(lang.code)}
                      disabled={downloading === lang.code}
                      className="h-8 min-w-[100px]"
                    >
                      {downloading === lang.code ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          {currentProgress[lang.code]}%
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-1" />
                          {t('offline.download')}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Advanced Settings */}
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen} className="animate-in slide-in-from-left-3 duration-300 delay-400">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-accent transition-colors">
              <Label className="flex items-center gap-2 text-base font-semibold cursor-pointer">
                ⚙️ {t('settings.advanced')}
              </Label>
              <span className={`transition-transform duration-200 ${advancedOpen ? 'rotate-180' : ''}`}>▼</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-3">
              {/* Clear History */}
              <Button
                variant="outline"
                className="w-full justify-start gap-2 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                onClick={handleClearHistory}
              >
                <History className="h-4 w-4" />
                {t('settings.clearHistory')}
              </Button>

              {/* Export Settings */}
              <Button
                variant="outline"
                className="w-full justify-start gap-2 hover:bg-primary/10 transition-all duration-200"
                onClick={handleExportSettings}
              >
                <FileDown className="h-4 w-4" />
                {t('settings.exportSettings')}
              </Button>

              {/* Import Settings */}
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportSettings}
                  className="hidden"
                  id="import-settings"
                />
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 hover:bg-primary/10 transition-all duration-200"
                  onClick={() => document.getElementById('import-settings')?.click()}
                >
                  <FileUp className="h-4 w-4" />
                  {t('settings.importSettings')}
                </Button>
              </div>

              {/* Reset Settings */}
              <Button
                variant="outline"
                className="w-full justify-start gap-2 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                onClick={handleResetSettings}
              >
                <RotateCcw className="h-4 w-4" />
                {t('settings.resetSettings')}
              </Button>

              {/* App Info */}
              <div className="p-3 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="h-4 w-4" />
                  <span>{t('settings.appVersion')}: 2.0.0</span>
                </div>
              </div>
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
