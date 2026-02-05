import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Globe, Mic, Volume2, History } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import tarjamaLogo from "@/assets/tarjama-logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SettingsDialog } from "@/components/SettingsDialog";
import { ZelligeCorners } from "@/components/ZelligeCorners";
import { SahbiLandingSection } from "@/components/SahbiLandingSection";

const About = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>About Tarjama - Moroccan Darija Translation Tool</title>
        <meta name="description" content="Learn about Tarjama, the free Moroccan Darija translator with voice input, offline support, and cultural context preservation. Supporting 11+ languages." />
        <link rel="canonical" href="https://tarjama.lovable.app/about" />
        <meta property="og:title" content="About Tarjama - Moroccan Darija Translation Tool" />
        <meta property="og:description" content="Learn about Tarjama, the free Moroccan Darija translator with voice input, offline support, and cultural context preservation. Supporting 11+ languages." />
        <meta property="og:url" content="https://tarjama.lovable.app/about" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <ZelligeCorners size="md" opacity={0.35} />
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

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t('navigation.backToTranslator')}
            </Button>
          </Link>
        </div>

        <Card className="mb-8 border-border/50 shadow-elegant bg-gradient-to-br from-card/50 to-muted/30 backdrop-blur-sm overflow-hidden animate-fade-in">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl -z-10" />
          <div className="p-6 sm:p-8 md:p-10 relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl shadow-moroccan">
                <Globe className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                {t('about.mainTitle')}
              </h2>
            </div>
            <div className="space-y-4 sm:space-y-5 text-sm sm:text-base text-muted-foreground leading-relaxed">
              <p className="text-lg">
                <strong className="text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Tarjama</strong> {t('about.mainDescription1')}
              </p>
              <p className="pl-4 border-l-4 border-primary/30">
                {t('about.mainDescription2')}
              </p>
            </div>
          </div>
        </Card>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="border-border/50 shadow-elegant bg-card/50 backdrop-blur-sm hover:shadow-moroccan hover:scale-105 hover:-translate-y-1 transition-all duration-300 animate-fade-in group">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300 group-hover:scale-110">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors">{t('about.feature1Title')}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t('about.feature1Description')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-elegant bg-card/50 backdrop-blur-sm hover:shadow-moroccan hover:scale-105 hover:-translate-y-1 transition-all duration-300 animate-fade-in [animation-delay:100ms] group">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 group-hover:from-accent/30 group-hover:to-accent/20 transition-all duration-300 group-hover:scale-110">
                  <Mic className="w-8 h-8 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-2 text-foreground group-hover:text-accent-foreground transition-colors">{t('about.feature2Title')}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t('about.feature2Description')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-elegant bg-card/50 backdrop-blur-sm hover:shadow-moroccan hover:scale-105 hover:-translate-y-1 transition-all duration-300 animate-fade-in [animation-delay:200ms] group">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 group-hover:from-primary/30 group-hover:to-accent/20 transition-all duration-300 group-hover:scale-110">
                  <Volume2 className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors">{t('about.feature3Title')}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t('about.feature3Description')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-elegant bg-card/50 backdrop-blur-sm hover:shadow-moroccan hover:scale-105 hover:-translate-y-1 transition-all duration-300 animate-fade-in [animation-delay:300ms] group">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-accent/20 to-primary/10 group-hover:from-accent/30 group-hover:to-primary/20 transition-all duration-300 group-hover:scale-110">
                  <History className="w-8 h-8 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold mb-2 text-foreground group-hover:text-accent-foreground transition-colors">{t('about.feature4Title')}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{t('about.feature4Description')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50 shadow-elegant bg-card/50 backdrop-blur-sm overflow-hidden animate-fade-in">
          <div className="p-6 sm:p-8 md:p-10 relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-accent/5 rounded-full blur-3xl" />
            <div className="space-y-4 sm:space-y-5 text-sm sm:text-base text-muted-foreground leading-relaxed relative z-10">
              <p className="text-lg leading-relaxed">
                {t('about.targetAudience')}
              </p>
              <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-5 sm:p-6 rounded-2xl border-2 border-primary/30 shadow-moroccan backdrop-blur-sm relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex items-center gap-3 relative z-10">
                  <span className="text-3xl animate-bounce">🎉</span>
                  <p className="text-foreground font-bold text-lg">
                    {t('about.freeFeature')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Sahbi Section */}
        <SahbiLandingSection />
      </main>
    </div>
    </>
  );
};

export default About;
