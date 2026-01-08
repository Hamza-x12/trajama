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
import { ZelligeCorners } from "@/components/ZelligeCorners";

const FAQ = () => {
  const { t } = useTranslation();

  const faqs = [
    { q: t('faq.q1'), a: t('faq.a1'), icon: "🇲🇦", category: "About Darija" },
    { q: t('faq.q2'), a: t('faq.a2'), icon: "🔄", category: "Using Tarjama" },
    { q: t('faq.q3'), a: t('faq.a3'), icon: "💰", category: "Pricing" },
    { q: t('faq.q4'), a: t('faq.a4'), icon: "🌍", category: "Features" },
    { q: t('faq.q5'), a: t('faq.a5'), icon: "✅", category: "Features" },
    { q: t('faq.q6'), a: t('faq.a6'), icon: "📱", category: "Features" },
    { q: t('faq.q7'), a: t('faq.a7'), icon: "🎤", category: "Using Tarjama" },
    { q: t('faq.q8'), a: t('faq.a8'), icon: "📱", category: "Features" },
    { q: t('faq.q9'), a: t('faq.a9'), icon: "💾", category: "Features" },
    { q: t('faq.q10'), a: t('faq.a10'), icon: "🔍", category: "Features" },
    { q: t('faq.q11'), a: t('faq.a11'), icon: "🗑️", category: "Using Tarjama" },
    { q: t('faq.q12'), a: t('faq.a12'), icon: "📚", category: "Features" },
  ];

  return (
    <>
      <Helmet>
        <title>FAQ - Tarjama Darija Translator Questions & Answers</title>
        <meta name="description" content="Get answers to frequently asked questions about Tarjama, the free Moroccan Darija translator. Learn about features, usage, and translation accuracy." />
        <link rel="canonical" href="https://tarjama.lovable.app/faq" />
        <meta property="og:title" content="FAQ - Tarjama Darija Translator Questions & Answers" />
        <meta property="og:description" content="Get answers to frequently asked questions about Tarjama, the free Moroccan Darija translator. Learn about features, usage, and translation accuracy." />
        <meta property="og:url" content="https://tarjama.lovable.app/faq" />
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
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t('faq.title')}</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">{t('faq.subtitle')}</p>
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
              <CardTitle className="text-2xl sm:text-3xl">{t('faq.pageTitle')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full space-y-3">
              {faqs.map((faq, index) => (
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
          <p className="text-muted-foreground mb-4">{t('faq.cantFindAnswer')}</p>
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

export default FAQ;
