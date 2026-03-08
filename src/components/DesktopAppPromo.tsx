import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { Monitor, Download, ExternalLink } from "lucide-react";
import tarjamaLogo from "@/assets/tarjama-logo.png";

const DOWNLOAD_URL = "https://github.com/Hamza-x12/trajama/releases/download/Tarjama/Tarjama_v1.2.1_setup.exe";

export function DesktopAppPromo() {
  const { t } = useTranslation();

  return (
    <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-elegant hover:shadow-moroccan transition-all duration-500 group h-full">
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -z-10" />
      
      <CardContent className="p-6 sm:p-8 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl shadow-md group-hover:scale-110 transition-transform duration-300">
            <Monitor className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{t('desktopApp.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('desktopApp.subtitle')}</p>
          </div>
        </div>

        {/* Logo & description */}
        <div className="flex-1 flex flex-col items-center text-center gap-4 mb-6">
          <img src={tarjamaLogo} alt="Tarjama" className="w-20 h-20 group-hover:scale-110 transition-transform duration-300" />
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t('desktopApp.description')}
            </p>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline" className="border-primary/30 text-primary">
                <Monitor className="w-3 h-3 mr-1" />
                Windows
              </Badge>
              <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
                v1.2.1
              </Badge>
            </div>
          </div>
        </div>

        {/* Download button */}
        <a href={DOWNLOAD_URL} target="_blank" rel="noopener noreferrer" className="w-full">
          <Button className="w-full gap-2 h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all">
            <Download className="w-5 h-5" />
            {t('desktopApp.download')}
            <ExternalLink className="w-4 h-4 opacity-60" />
          </Button>
        </a>

        <p className="text-xs text-muted-foreground text-center mt-3">
          {t('desktopApp.windowsOnly')}
        </p>
      </CardContent>
    </Card>
  );
}
