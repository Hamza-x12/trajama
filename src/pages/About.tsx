import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import tarjamaLogo from "@/assets/tarjama-logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SettingsDialog } from "@/components/SettingsDialog";

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link to="/">
                <img src={tarjamaLogo} alt="Tarjama Logo" className="w-12 h-12 sm:w-14 sm:h-14" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t('about.title')}</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">{t('about.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SettingsDialog selectedVoice="" setSelectedVoice={() => {}} availableVoices={[]} />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t('navigation.backToTranslator')}
            </Button>
          </Link>
        </div>

        <Card className="border-border/50 shadow-elegant bg-card/50 backdrop-blur-sm">
          <div className="p-4 sm:p-6 md:p-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-3 sm:mb-4">
              About Tarjama
            </h2>
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Tarjama</strong> is a specialized translation tool designed specifically for Moroccan Darija (الدارجة المغربية). Unlike generic translators, Tarjama understands the unique linguistic nuances of Moroccan Arabic dialect, including regional variations, cultural idioms, and colloquial expressions.
              </p>
              <p>
                Spoken by over 30 million people, Darija incorporates influences from Berber (Amazigh), French, Spanish, and Modern Standard Arabic, making it distinct from other Arabic dialects. Our AI-powered translation service preserves these cultural and linguistic subtleties to deliver accurate, context-aware translations.
              </p>
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-3 sm:p-4 rounded-lg border border-primary/20">
                <h3 className="font-semibold text-foreground mb-2">Key Features:</h3>
                <ul className="space-y-1.5 text-xs sm:text-sm">
                  <li>✓ Support for 11+ languages including French, English, Arabic, Spanish, German, Italian, Portuguese, Chinese, Japanese, and Turkish</li>
                  <li>✓ Cultural intelligence that preserves tone, idioms, and regional dialects</li>
                  <li>✓ Voice input for spoken Darija translation</li>
                  <li>✓ Text-to-speech pronunciation in all languages</li>
                  <li>✓ Offline mode with downloadable language packs</li>
                  <li>✓ Translation history to save and review past translations</li>
                  <li>✓ 100% free with no limits</li>
                </ul>
              </div>
              <p>
                Perfect for Moroccan expatriates staying connected with home, language learners exploring Darija, travelers visiting Morocco, business professionals working with Moroccan partners, and anyone interested in Moroccan culture and language.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default About;
