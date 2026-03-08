import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { Download, Monitor, Shield, Zap } from "lucide-react";
import tarjamaLogo from "@/assets/tarjama-logo.png";
import windowsLogo from "@/assets/windows-logo.png";

const DOWNLOAD_URL = "https://github.com/Hamza-x12/trajama/releases/download/Tarjama/Tarjama_v1.2.1_setup.exe";

export function DesktopAppPromo() {
  const { t } = useTranslation();

  return (
    <Card className="relative overflow-hidden border-accent/30 bg-gradient-to-br from-accent/5 via-background to-primary/5 shadow-elegant hover:shadow-hover transition-all duration-500 group h-full">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-accent/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative p-5 sm:p-6 flex flex-col h-full">
        {/* Top section */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative shrink-0">
            <img src={tarjamaLogo} alt="Tarjama" className="w-16 h-16 object-contain group-hover:scale-105 transition-transform duration-300" />
          </div>
          <div className="min-w-0 pt-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg sm:text-xl font-bold text-foreground">Tarjama Desktop</h3>
              <Badge className="bg-accent/20 text-accent border-0 text-[10px] px-1.5 py-0 font-semibold">
                FREE
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{t('desktopApp.subtitle')}</p>
          </div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {[
            { icon: Zap, label: "Fast & Light" },
            { icon: Monitor, label: "Native App" },
            { icon: Shield, label: "Offline Ready" },
            { icon: Download, label: "Auto Updates" },
          ].map((feat) => (
            <div key={feat.label} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              <feat.icon className="w-3.5 h-3.5 text-accent shrink-0" />
              {feat.label}
            </div>
          ))}
        </div>

        {/* Platform & version */}
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className="border-accent/30 text-accent gap-1.5 text-xs">
            <img src={windowsLogo} alt="" className="w-4 h-4" />
            Windows 10/11
          </Badge>
          <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground text-xs">
            v1.2.1
          </Badge>
        </div>

        {/* Download button */}
        <a href={DOWNLOAD_URL} target="_blank" rel="noopener noreferrer" className="block">
          <div className="relative w-full h-14 rounded-xl bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--primary))] flex items-center justify-center gap-3 cursor-pointer shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group/btn">
            <img src={windowsLogo} alt="" className="w-6 h-6 brightness-0 invert" />
            <span className="text-primary-foreground font-bold text-base tracking-wide">
              {t('desktopApp.download')}
            </span>
          </div>
        </a>

        <p className="text-[11px] text-muted-foreground text-center mt-2.5 opacity-70">
          {t('desktopApp.windowsOnly')}
        </p>
      </div>
    </Card>
  );
}
