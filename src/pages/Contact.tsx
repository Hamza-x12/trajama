import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";
import tarjamaLogo from "@/assets/tarjama-logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SettingsDialog } from "@/components/SettingsDialog";
import { ContactForm } from "@/components/ContactForm";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const { t } = useTranslation();
  
  return (
    <>
      <Helmet>
        <title>Contact Tarjama - Get Support for Darija Translation</title>
        <meta name="description" content="Contact Tarjama for support, feedback, or inquiries about our Moroccan Darija translation service. We're here to help with all your translation needs." />
        <link rel="canonical" href="https://tarjama.lovable.app/contact" />
        <meta property="og:title" content="Contact Tarjama - Get Support for Darija Translation" />
        <meta property="og:description" content="Contact Tarjama for support, feedback, or inquiries about our Moroccan Darija translation service. We're here to help with all your translation needs." />
        <meta property="og:url" content="https://tarjama.lovable.app/contact" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link to="/">
                <img src={tarjamaLogo} alt="Tarjama Logo" className="w-12 h-12 sm:w-14 sm:h-14" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t('contact.title')}</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">{t('contact.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SettingsDialog selectedVoice="" setSelectedVoice={() => {}} availableVoices={[]} />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t('navigation.backToTranslator')}
            </Button>
          </Link>
        </div>

        <ContactForm pageSource="Contact Page" />
      </main>
    </div>
    </>
  );
};

export default Contact;
