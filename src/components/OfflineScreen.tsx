import { useState, useCallback } from 'react';
import { WifiOff, Download, Languages, Loader2, Copy, Check, Volume2, ArrowLeftRight, AlertTriangle } from 'lucide-react';
import { useOfflineLanguages } from '@/hooks/useOfflineLanguages';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { translateLocally, isModelLoaded } from '@/utils/localTranslation';
import type { ProgressCallback } from '@/utils/localTranslation';
import { Progress } from './ui/progress';

export function OfflineScreen() {
  const { offlineLanguages } = useOfflineLanguages();
  const { t } = useTranslation();
  const downloadedLanguages = offlineLanguages.filter(lang => lang.downloaded);

  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('English');
  const [targetLanguage, setTargetLanguage] = useState('Darija');
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [modelProgress, setModelProgress] = useState<{ downloading: boolean; progress: number; status: string }>({
    downloading: false, progress: 0, status: ''
  });

  // Map codes to names for available languages
  const codeToName: Record<string, string> = {
    ar: 'Arabic', fr: 'French', dar: 'Darija', en: 'English',
    es: 'Spanish', de: 'German', it: 'Italian', pt: 'Portuguese',
    zh: 'Chinese', ja: 'Japanese', tr: 'Turkish', ru: 'Russian',
    ko: 'Korean', hi: 'Hindi'
  };

  // Always include English + downloaded languages for selection
  const availableLanguages = [
    { code: 'en', name: 'English' },
    ...downloadedLanguages
      .filter(l => l.code !== 'en')
      .map(l => ({ code: l.code, name: codeToName[l.code] || l.name }))
  ];

  const handleSwapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setInputText(outputText);
    setOutputText('');
  };

  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) return;
    setIsTranslating(true);
    setOutputText('');

    try {
      const onProgress: ProgressCallback = (progress) => {
        if (progress.status === 'downloading') {
          setModelProgress({
            downloading: true,
            progress: progress.progress || 0,
            status: `${t('offline.downloadingModel')}${Math.round(progress.progress || 0)}%`
          });
        } else if (progress.status === 'loading') {
          setModelProgress({ downloading: true, progress: 100, status: t('offline.loadingModel') });
        } else if (progress.status === 'ready') {
          setModelProgress({ downloading: false, progress: 0, status: '' });
        }
      };

      const result = await translateLocally(inputText, sourceLanguage, targetLanguage, onProgress);
      setModelProgress({ downloading: false, progress: 0, status: '' });
      setOutputText(result);
    } catch (error) {
      console.error('Offline translation failed:', error);
      toast.error(t('offline.translationFailed'));
      setModelProgress({ downloading: false, progress: 0, status: '' });
    } finally {
      setIsTranslating(false);
    }
  }, [inputText, sourceLanguage, targetLanguage, t]);

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSpeak = (text: string) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const hasDownloads = downloadedLanguages.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col items-center p-4 pt-8">
      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-3 mb-6">
        <div className="p-3 rounded-full bg-orange-500/10 border border-orange-500/20">
          <WifiOff className="w-8 h-8 text-orange-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('offline.noConnection')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {hasDownloads ? t('offline.offlineTranslationAvailable') : t('offline.offlineMessage')}
          </p>
        </div>
      </div>

      {hasDownloads ? (
        /* Functional Translation UI */
        <Card className="max-w-2xl w-full p-5 space-y-4">
          {/* Language selectors */}
          <div className="flex items-center gap-2">
            <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map(lang => (
                  <SelectItem key={`src-${lang.code}`} value={lang.name}>{lang.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="ghost" size="icon" onClick={handleSwapLanguages} className="shrink-0">
              <ArrowLeftRight className="w-4 h-4" />
            </Button>

            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map(lang => (
                  <SelectItem key={`tgt-${lang.code}`} value={lang.name}>{lang.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Input */}
          <Textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={t('translation.placeholder')}
            rows={4}
            maxLength={1000}
            className="resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{inputText.length}/1000</span>
            <Button variant="ghost" size="sm" onClick={() => handleSpeak(inputText)} disabled={!inputText}>
              <Volume2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Model download progress */}
          {modelProgress.downloading && (
            <div className="space-y-2 p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground">{modelProgress.status}</p>
              <Progress value={modelProgress.progress} className="h-2" />
            </div>
          )}

          {/* Translate button */}
          <Button
            onClick={handleTranslate}
            disabled={isTranslating || !inputText.trim()}
            className="w-full gap-2"
          >
            {isTranslating ? (
              <><Loader2 className="w-4 h-4 animate-spin" />{t('translation.translating')}</>
            ) : (
              <><Languages className="w-4 h-4" />{t('translation.translate')}</>
            )}
          </Button>

          {/* Output */}
          {outputText && (
            <div className="p-4 rounded-lg bg-muted/30 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">{targetLanguage}</Badge>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleSpeak(outputText)}>
                    <Volume2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
                    {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
              </div>
              <p className="text-foreground text-lg">{outputText}</p>
            </div>
          )}

          {/* Downloaded languages info */}
          <div className="pt-3 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{t('offline.downloadedLanguages')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {downloadedLanguages.map(lang => (
                <Badge key={lang.code} variant="secondary" className="text-xs">
                  {lang.name}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      ) : (
        /* No downloaded languages — info only */
        <Card className="max-w-2xl w-full p-8 space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <AlertTriangle className="w-10 h-10 text-muted-foreground" />
            <p className="text-muted-foreground">{t('offline.noDownloadedLanguages')}</p>
            <p className="text-sm text-muted-foreground">{t('offline.downloadLanguagesWhenOnline')}</p>
          </div>
        </Card>
      )}

      <p className="text-sm text-muted-foreground text-center mt-6">
        {t('offline.reconnectMessage')}
      </p>
    </div>
  );
}
