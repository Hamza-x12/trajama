import { WifiOff, Download } from 'lucide-react';
import { useOfflineLanguages } from '@/hooks/useOfflineLanguages';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useTranslation } from 'react-i18next';

export function OfflineScreen() {
  const { offlineLanguages } = useOfflineLanguages();
  const { t } = useTranslation();
  const downloadedLanguages = offlineLanguages.filter(lang => lang.downloaded);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 space-y-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 rounded-full bg-muted/50">
            <WifiOff className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold">{t('offline.noConnection')}</h1>
          <p className="text-muted-foreground">
            {t('offline.offlineMessage')}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">
              {t('offline.downloadedLanguages')}
            </h2>
          </div>

          {downloadedLanguages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {downloadedLanguages.map((lang) => (
                <div
                  key={lang.code}
                  className="p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="font-medium">{lang.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {lang.size}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border border-dashed border-border rounded-lg">
              <p className="text-muted-foreground">
                {t('offline.noDownloadedLanguages')}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {t('offline.downloadLanguagesWhenOnline')}
              </p>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            {t('offline.reconnectMessage')}
          </p>
        </div>
      </Card>
    </div>
  );
}
