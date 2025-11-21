import { Settings } from "lucide-react";
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
import { useTranslation } from "react-i18next";
import moroccoFlag from "@/assets/flags/morocco.png";
import ukFlag from "@/assets/flags/uk.png";
import franceFlag from "@/assets/flags/france.png";
import saudiArabiaFlag from "@/assets/flags/saudi-arabia.png";

interface SettingsDialogProps {
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  availableVoices: SpeechSynthesisVoice[];
}

export function SettingsDialog({ selectedVoice, setSelectedVoice, availableVoices }: SettingsDialogProps) {
  const { t, i18n } = useTranslation();

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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Settings className="h-5 w-5" />
          <span className="sr-only">{t('settings.title')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('settings.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Language Selection */}
          <div className="space-y-2">
            <Label htmlFor="language">{t('settings.language')}</Label>
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

          {/* Voice Selection */}
          {availableVoices.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="voice">{t('settings.voice')}</Label>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
