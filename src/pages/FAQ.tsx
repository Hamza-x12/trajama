import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import tarjamaLogo from "@/assets/tarjama-logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SettingsDialog } from "@/components/SettingsDialog";

const FAQ = () => {
  const { t } = useTranslation();

  const faqs = [
    { 
      q: "What is Darija?", 
      a: "Darija (الدارجة) is the colloquial Arabic dialect spoken in Morocco. It's distinct from Modern Standard Arabic and incorporates vocabulary and grammar from Berber (Amazigh), French, Spanish, and Arabic. Darija is the everyday language used by Moroccans in daily conversations, different from the formal Arabic used in official documents and media." 
    },
    { 
      q: "How do I translate Darija to French?", 
      a: "Simply enter your Darija text in the input field, select \"Darija\" as your source language (or use \"Detect Language\"), and click the translate button. Tarjama will automatically provide translations in French along with 10 other languages. You can also use voice input to speak in Darija and get instant translations." 
    },
    { 
      q: "Is Tarjama translator free?", 
      a: "Yes! Tarjama is completely free to use with no limitations. You can translate as many texts as you want, use voice input, access text-to-speech, download offline language packs, and save your translation history—all at no cost." 
    },
    { 
      q: "What languages does Tarjama support?", 
      a: "Tarjama supports Moroccan Darija and 10 additional languages: French, English, Modern Standard Arabic, Spanish, German, Italian, Portuguese, Chinese, Japanese, and Turkish. You can translate from any of these languages to Darija or from Darija to any of them." 
    },
    { 
      q: "How accurate is Darija translation?", 
      a: "Tarjama uses advanced AI models specifically trained on Moroccan Darija to provide highly accurate translations. Our system understands cultural context, regional variations, and colloquial expressions. While no automated translation is perfect, Tarjama is designed to preserve the meaning, tone, and cultural nuances of Darija better than generic translation tools." 
    },
    { 
      q: "Can I use Tarjama offline?", 
      a: "Yes! Tarjama supports offline translation. You can download language packs while connected to the internet, and then use them without any connection. This feature is perfect for travelers in Morocco or situations where internet access is limited." 
    },
    { 
      q: "How do I use voice input for Darija translation?", 
      a: "Click the microphone button at the bottom right of the text input area. Speak your Darija text clearly, and Tarjama will automatically transcribe your speech and convert it to text. Then simply click translate to get translations in all supported languages. This feature makes it easy to translate spoken conversations in real-time." 
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

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{t('faq.pageTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default FAQ;
