import { Settings, Download, Trash2, Loader2 } from "lucide-react";
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
import { useOfflineLanguages } from "@/hooks/useOfflineLanguages";
import { useState } from "react";
import { toast } from "sonner";
import moroccoFlag from "@/assets/flags/morocco.png";
import ukFlag from "@/assets/flags/uk.png";
import franceFlag from "@/assets/flags/france.png";
import saudiArabiaFlag from "@/assets/flags/saudi-arabia.png";
import { Separator } from "@/components/ui/separator";

interface SettingsDialogProps {
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
  availableVoices: SpeechSynthesisVoice[];
}

export function SettingsDialog({ selectedVoice, setSelectedVoice, availableVoices }: SettingsDialogProps) {
  const { t, i18n } = useTranslation();
  const { offlineLanguages, downloadLanguage, removeLanguage } = useOfflineLanguages();
  const [downloading, setDownloading] = useState<string | null>(null);

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
    try {
      await downloadLanguage(code);
      toast.success(t('offline.downloaded'));
    } catch (error) {
      toast.error(t('offline.downloadFailed'));
    } finally {
      setDownloading(null);
    }
  };

  const handleRemove = (code: string) => {
    removeLanguage(code);
    toast.success(t('offline.removed'));
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

          <Separator />

          {/* Offline Languages */}
          <div className="space-y-3">
            <div>
              <Label>{t('offline.title')}</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {t('offline.description')}
              </p>
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {offlineLanguages.map((lang) => (
                <div
                  key={lang.code}
                  className="flex items-center justify-between p-2 rounded-lg border bg-card"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium">{lang.name}</p>
                    <p className="text-xs text-muted-foreground">{lang.size}</p>
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
                      className="h-8"
                    >
                      {downloading === lang.code ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          {t('offline.downloading')}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
