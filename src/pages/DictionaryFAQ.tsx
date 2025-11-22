import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import tarjamaLogo from "@/assets/tarjama-logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SettingsDialog } from "@/components/SettingsDialog";
import { MessageCircle } from "lucide-react";

const DictionaryFAQ = () => {
  const { t } = useTranslation();

  const dictionaryFaqs = [
    { 
      q: t('dictionary.faq1Q'),
      a: t('dictionary.faq1A'),
      icon: "📖", 
      category: t('dictionary.faq1Category')
    },
    { 
      q: t('dictionary.faq2Q'),
      a: t('dictionary.faq2A'),
      icon: "ℹ️", 
      category: t('dictionary.faq2Category')
    },
    { 
      q: t('dictionary.faq3Q'),
      a: t('dictionary.faq3A'),
      icon: "🔊", 
      category: t('dictionary.faq3Category')
    },
    { 
      q: t('dictionary.faq4Q'),
      a: t('dictionary.faq4A'),
      icon: "📚", 
      category: t('dictionary.faq4Category')
    },
    { 
      q: t('dictionary.faq5Q'),
      a: t('dictionary.faq5A'),
      icon: "💡", 
      category: t('dictionary.faq5Category')
    },
    { 
      q: t('dictionary.faq6Q'),
      a: t('dictionary.faq6A'),
      icon: "🔗", 
      category: t('dictionary.faq6Category')
    },
  ];

  return (
    <>
      <Helmet>
        <title>Dictionary FAQ - Tarjama Darija Dictionary Help</title>
        <meta name="description" content="Learn how to use the Tarjama Darija Dictionary. Get help with pronunciation, examples, and exploring Moroccan Arabic vocabulary." />
        <link rel="canonical" href="https://tarjama.lovable.app/dictionary/faq" />
        <meta property="og:title" content="Dictionary FAQ - Tarjama Darija Dictionary Help" />
        <meta property="og:description" content="Learn how to use the Tarjama Darija Dictionary. Get help with pronunciation, examples, and exploring Moroccan Arabic vocabulary." />
        <meta property="og:url" content="https://tarjama.lovable.app/dictionary/faq" />
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
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t('dictionary.faqTitle')}</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">{t('dictionary.faqSubtitle')}</p>
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
          <Link to="/dictionary">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t('dictionary.backToDictionary')}
            </Button>
          </Link>
        </div>

        <Card className="border-border/50 shadow-elegant bg-card/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <path d="M12 17h.01"/>
                </svg>
              </div>
              <CardTitle className="text-2xl sm:text-3xl">{t('dictionary.helpTitle')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full space-y-3">
              {dictionaryFaqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border border-border/50 rounded-xl px-5 py-1 bg-gradient-to-br from-card to-muted/20 hover:border-primary/50 hover:shadow-moroccan transition-all duration-300"
                >
                  <AccordionTrigger className="text-left hover:no-underline group">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-1 group-hover:scale-110 transition-transform">{faq.icon}</span>
                      <div className="flex-1">
                        <span className="text-xs font-semibold text-primary/70 uppercase tracking-wider mb-1 block">{faq.category}</span>
                        <span className="font-semibold text-base group-hover:text-primary transition-colors">{faq.q}</span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pt-4 pb-2 pl-11 leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">{t('dictionary.stillHaveQuestions')}</p>
          <Link to="/contact">
            <Button variant="default" size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all">
              <MessageCircle className="w-5 h-5" />
              {t('faq.contactUs')}
            </Button>
          </Link>
        </div>
      </main>
    </div>
    </>
  );
};

export default DictionaryFAQ;
