import { WifiOff } from 'lucide-react';
import { Card } from './ui/card';
import { useTranslation } from 'react-i18next';

export function OfflineScreen() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 space-y-6 text-center">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-orange-500/10 border border-orange-500/20">
            <WifiOff className="w-10 h-10 text-orange-500" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('offline.noConnection')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('offline.offlineMessage')}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('offline.reconnectMessage')}
        </p>
      </Card>
    </div>
  );
}
