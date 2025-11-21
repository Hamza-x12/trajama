import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Globe, Zap, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import tarjamaLogo from "@/assets/tarjama-logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SettingsDialog } from "@/components/SettingsDialog";

const About = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Globe className="w-8 h-8 text-primary" />,
      title: t('about.feature1Title'),
      description: t('about.feature1Description'),
    },
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: t('about.feature2Title'),
      description: t('about.feature2Description'),
    },
    {
      icon: <Heart className="w-8 h-8 text-primary" />,
      title: t('about.feature3Title'),
      description: t('about.feature3Description'),
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: t('about.feature4Title'),
      description: t('about.feature4Description'),
    },
  ];

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

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t('navigation.backToTranslator')}
            </Button>
          </Link>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl">{t('about.welcomeTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('about.welcomeText')}
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-elegant transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('about.missionTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              {t('about.missionText')}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default About;
