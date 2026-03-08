import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import {
  Settings, Globe2, Palette, Type, Volume2, Shield, MessageCircle,
  Info, Languages, Check, History, RotateCcw, FileDown, FileUp, HelpCircle,
  Sun, Moon, Monitor, ArrowLeft, Bell, Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import moroccoFlag from "@/assets/flags/morocco.png";
import ukFlag from "@/assets/flags/uk.png";
import franceFlag from "@/assets/flags/france.png";
import saudiArabiaFlag from "@/assets/flags/saudi-arabia.png";

type SettingsSection = "general" | "voice" | "safety" | "sahbi" | "advanced";

const sections: { id: SettingsSection; icon: typeof Settings; labelKey: string }[] = [
  { id: "general", icon: Settings, labelKey: "settings.general" },
  { id: "voice", icon: Volume2, labelKey: "settings.voiceSection" },
  { id: "safety", icon: Shield, labelKey: "settings.safetySection" },
  { id: "sahbi", icon: MessageCircle, labelKey: "settings.sahbiSettings" },
  { id: "advanced", icon: Info, labelKey: "settings.advanced" },
];

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<SettingsSection>("general");
  const [fontSize, setFontSize] = useState(16);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [autoVoiceSelect, setAutoVoiceSelect] = useState(true);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [profanityFilterEnabled, setProfanityFilterEnabled] = useState(true);
  const [sahbiDarijaScript, setSahbiDarijaScript] = useState<'latin' | 'arabic' | 'both'>(() => {
    const saved = localStorage.getItem('sahbiDarijaScript');
    return (saved as 'latin' | 'arabic' | 'both') || 'both';
  });
  const [includeTranslation, setIncludeTranslation] = useState(() => {
    const saved = localStorage.getItem('sahbiIncludeTranslation');
    return saved !== 'false';
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('notificationsEnabled') !== 'false';
  });

  // Load saved settings
  useEffect(() => {
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
      setFontSize(parseInt(savedFontSize));
    }
    const savedAutoVoice = localStorage.getItem('autoVoiceSelect');
    if (savedAutoVoice) setAutoVoiceSelect(savedAutoVoice === 'true');
    const savedSpeechRate = localStorage.getItem('speechRate');
    if (savedSpeechRate) setSpeechRate(parseFloat(savedSpeechRate));
    const savedProfanity = localStorage.getItem('profanityFilterEnabled');
    if (savedProfanity) setProfanityFilterEnabled(savedProfanity !== 'false');
    const savedVoice = localStorage.getItem('selectedVoice');
    if (savedVoice) setSelectedVoice(savedVoice);
  }, []);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis?.getVoices() || [];
      setAvailableVoices(voices);
    };
    loadVoices();
    window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
  }, []);

  const uiLanguages = [
    { code: 'en', name: 'English', flag: ukFlag },
    { code: 'ar', name: 'العربية', flag: saudiArabiaFlag },
    { code: 'fr', name: 'Français', flag: franceFlag },
    { code: 'dar', name: 'الدارجة', flag: moroccoFlag },
  ];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
    document.documentElement.dir = langCode === 'ar' || langCode === 'dar' ? 'rtl' : 'ltr';
  };

  const handleFontSizeChange = (value: number[]) => {
    const size = value[0];
    setFontSize(size);
    document.documentElement.style.fontSize = `${size}px`;
    localStorage.setItem('fontSize', size.toString());
  };

  const handleAutoVoiceToggle = (checked: boolean) => {
    setAutoVoiceSelect(checked);
    localStorage.setItem('autoVoiceSelect', checked.toString());
  };

  const handleSpeechRateChange = (value: number[]) => {
    const rate = value[0];
    setSpeechRate(rate);
    localStorage.setItem('speechRate', rate.toString());
  };

  const handleVoiceChange = (voice: string) => {
    setSelectedVoice(voice);
    localStorage.setItem('selectedVoice', voice);
  };

  const handleProfanityFilterToggle = (checked: boolean) => {
    setProfanityFilterEnabled(checked);
    localStorage.setItem('profanityFilterEnabled', checked.toString());
  };

  const handleNotificationsToggle = (checked: boolean) => {
    setNotificationsEnabled(checked);
    localStorage.setItem('notificationsEnabled', checked.toString());
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
      language: i18n.language, theme, fontSize, speechRate, autoVoiceSelect, profanityFilterEnabled,
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
          if (settings.speechRate) setSpeechRate(settings.speechRate);
          if (typeof settings.autoVoiceSelect === 'boolean') setAutoVoiceSelect(settings.autoVoiceSelect);
          if (typeof settings.profanityFilterEnabled === 'boolean') setProfanityFilterEnabled(settings.profanityFilterEnabled);
          toast.success(t('settings.importSuccess'));
        } catch {
          toast.error(t('settings.importError'));
        }
      };
      reader.readAsText(file);
    }
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case "general":
        return (
          <div className="space-y-8">
            <SectionHeader title={t('settings.general')} description={t('settings.generalDesc')} />

            {/* Language */}
            <SettingRow icon={Globe2} label={t('settings.language')}>
              <Select value={i18n.language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {uiLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        <img src={lang.flag} alt={lang.name} className="w-5 h-5 rounded object-cover" />
                        <span>{lang.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingRow>

            <Separator />

            {/* Theme */}
            <SettingRow icon={Palette} label={t('settings.theme')}>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-[200px]">
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
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                      {t('settings.systemMode')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </SettingRow>

            <Separator />

            {/* Font Size */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/15">
                    <Type className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <Label className="text-sm font-medium">{t('settings.fontSize')}</Label>
                </div>
                <span className="text-sm font-mono font-semibold px-2.5 py-1 rounded-md bg-muted">{fontSize}px</span>
              </div>
              <Slider min={12} max={20} step={1} value={[fontSize]} onValueChange={handleFontSizeChange} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t('settings.small')}</span>
                <span>{t('settings.medium')}</span>
                <span>{t('settings.large')}</span>
              </div>
            </div>

            <Separator />

            {/* Notifications */}
            <SettingRow icon={Bell} label={t('settings.notifications')} description={t('settings.notificationsDesc')}>
              <Switch checked={notificationsEnabled} onCheckedChange={handleNotificationsToggle} />
            </SettingRow>
          </div>
        );

      case "voice":
        return (
          <div className="space-y-8">
            <SectionHeader title={t('settings.voiceSection')} description={t('settings.voiceSectionDesc')} />

            {/* Auto Voice Select */}
            <SettingRow icon={Volume2} label={t('settings.autoVoiceSelect')} description={t('settings.autoVoiceDescription')}>
              <Switch checked={autoVoiceSelect} onCheckedChange={handleAutoVoiceToggle} />
            </SettingRow>

            <Separator />

            {/* Manual Voice Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/15">
                  <Volume2 className="h-4 w-4 text-secondary" />
                </div>
                <Label className="text-sm font-medium">{t('settings.voice')}</Label>
              </div>
              <Select value={selectedVoice} onValueChange={handleVoiceChange} disabled={autoVoiceSelect}>
                <SelectTrigger className={autoVoiceSelect ? 'opacity-50' : ''}>
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

            <Separator />

            {/* Speech Rate */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/15">
                    <Volume2 className="h-4 w-4 text-secondary" />
                  </div>
                  <Label className="text-sm font-medium">{t('settings.speechRate')}</Label>
                </div>
                <span className="text-sm font-mono font-semibold px-2.5 py-1 rounded-md bg-muted">{speechRate.toFixed(1)}x</span>
              </div>
              <Slider min={0.5} max={2.0} step={0.1} value={[speechRate]} onValueChange={handleSpeechRateChange} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t('settings.slower')}</span>
                <span>{t('settings.normal')}</span>
                <span>{t('settings.faster')}</span>
              </div>
            </div>

            <Separator />

            {/* Voice Preview */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">{t('settings.voicePreview')}</Label>
              <Button
                variant="outline"
                onClick={() => {
                  const utterance = new SpeechSynthesisUtterance("مرحبا، كيداير؟");
                  utterance.rate = speechRate;
                  if (selectedVoice) {
                    const voice = availableVoices.find(v => v.name === selectedVoice);
                    if (voice) utterance.voice = voice;
                  }
                  window.speechSynthesis?.speak(utterance);
                }}
                className="w-full gap-2"
              >
                <Play className="h-4 w-4" />
                {t('settings.testVoice')}
              </Button>
            </div>
          </div>
        );

      case "safety":
        return (
          <div className="space-y-8">
            <SectionHeader title={t('settings.safetySection')} description={t('settings.safetySectionDesc')} />

            {/* Profanity Filter */}
            <SettingRow icon={Shield} label={t('settings.profanityFilter')} description={t('settings.profanityFilterDescription')}>
              <Switch checked={profanityFilterEnabled} onCheckedChange={handleProfanityFilterToggle} />
            </SettingRow>
          </div>
        );

      case "sahbi":
        return (
          <div className="space-y-8">
            <SectionHeader title={t('settings.sahbiSettings')} description={t('settings.sahbiDescription')} />

            {/* Darija Script */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">{t('settings.darijaScript')}</Label>
              <RadioGroup
                value={sahbiDarijaScript}
                onValueChange={(value: 'latin' | 'arabic' | 'both') => {
                  setSahbiDarijaScript(value);
                  localStorage.setItem('sahbiDarijaScript', value);
                  toast.success(t('settings.sahbiScriptUpdated'));
                }}
                className="space-y-2"
              >
                {[
                  { value: 'both', label: t('settings.scriptBoth'), desc: t('settings.scriptBothDesc') },
                  { value: 'latin', label: t('settings.scriptLatin'), desc: t('settings.scriptLatinDesc') },
                  { value: 'arabic', label: t('settings.scriptArabic'), desc: t('settings.scriptArabicDesc') },
                ].map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-3 p-4 rounded-xl border bg-card hover:bg-muted/50 transition-colors cursor-pointer">
                    <RadioGroupItem value={opt.value} id={`script-${opt.value}`} />
                    <Label htmlFor={`script-${opt.value}`} className="flex-1 cursor-pointer">
                      <span className="font-medium">{opt.label}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Separator />

            {/* Open Sahbi Button */}
            <Button variant="outline" onClick={() => navigate('/sahbi')} className="w-full gap-2">
              <MessageCircle className="h-4 w-4" />
              {t('settings.openSahbi')}
            </Button>
          </div>
        );

      case "advanced":
        return (
          <div className="space-y-8">
            <SectionHeader title={t('settings.advanced')} description={t('settings.advancedDesc')} />

            {/* Clear History */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">{t('settings.clearHistory')}</Label>
              <p className="text-xs text-muted-foreground">{t('settings.clearHistoryDesc')}</p>
              <Button variant="outline" onClick={handleClearHistory} className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-colors">
                <History className="h-4 w-4" />
                {t('settings.clearHistory')}
              </Button>
            </div>

            <Separator />

            {/* Reset */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">{t('settings.reset')}</Label>
              <p className="text-xs text-muted-foreground">{t('settings.resetDesc')}</p>
              <Button variant="outline" onClick={handleResetSettings} className="gap-2 hover:bg-amber-100 dark:hover:bg-amber-900 hover:border-amber-500 transition-colors">
                <RotateCcw className="h-4 w-4" />
                {t('settings.reset')}
              </Button>
            </div>

            <Separator />

            {/* Export / Import */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">{t('settings.exportImport')}</Label>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleExportSettings} className="flex-1 gap-2">
                  <FileDown className="h-4 w-4" />
                  {t('settings.export')}
                </Button>
                <Button variant="outline" onClick={() => document.getElementById('import-settings-page')?.click()} className="flex-1 gap-2">
                  <FileUp className="h-4 w-4" />
                  {t('settings.import')}
                </Button>
              </div>
              <input type="file" accept=".json" onChange={handleImportSettings} className="hidden" id="import-settings-page" />
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('settings.title')} - Tarjama</title>
        <meta name="description" content="Configure your Tarjama translation preferences" />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Top bar */}
        <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">{t('settings.title')}</h1>
          </div>
        </div>

        <div className="flex-1 max-w-5xl mx-auto w-full flex">
          {/* Sidebar navigation */}
          <nav className="w-56 shrink-0 border-r py-4 pr-2 hidden md:block sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
            <div className="space-y-1 px-2">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {t(section.labelKey)}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Mobile tabs */}
          <div className="md:hidden border-b overflow-x-auto flex px-2 py-2 gap-1 sticky top-14 bg-background z-10">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {t(section.labelKey)}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <main className="flex-1 py-8 px-6 md:px-10 max-w-2xl">
            {renderSectionContent()}
          </main>
        </div>
      </div>
    </>
  );
}

// Reusable sub-components
function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-1">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function SettingRow({ icon: Icon, label, description, children }: {
  icon: typeof Settings;
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="p-2 rounded-lg bg-muted/50 shrink-0">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <Label className="text-sm font-medium">{label}</Label>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
