import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Sparkles, BookOpen, Globe, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import sahbiLogo from "@/assets/sahbi-logo.png";

interface SahbiLandingSectionProps {
  userAvatarUrl?: string;
  userInitial?: string;
  isLoggedIn?: boolean;
}

export const SahbiLandingSection = ({ 
  userAvatarUrl, 
  userInitial = "U",
  isLoggedIn = false 
}: SahbiLandingSectionProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const features = [
    {
      icon: MessageCircle,
      title: t('sahbiSection.feature1Title') || "Practice Darija",
      color: "text-moroccan-red"
    },
    {
      icon: BookOpen,
      title: t('sahbiSection.feature2Title') || "Cultural Insights",
      color: "text-moroccan-gold"
    },
    {
      icon: Globe,
      title: t('sahbiSection.feature3Title') || "Multilingual",
      color: "text-moroccan-green"
    },
    {
      icon: Zap,
      title: t('sahbiSection.feature4Title') || "Instant Answers",
      color: "text-primary"
    }
  ];

  return (
    <section className="py-6 sm:py-8">
      <Card className="relative overflow-hidden border-accent/30 bg-gradient-to-br from-accent/5 via-background to-primary/5 shadow-elegant hover:shadow-hover transition-all duration-500">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-accent/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative p-5 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Left side - Content */}
            <div className="space-y-4">
              {/* Header with logo */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src={sahbiLogo} 
                    alt="Sahbi" 
                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-lg"
                  />
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                      {t('sahbiSection.title') || "Meet Sahbi"}
                    </h2>
                    <Badge className="bg-accent/20 text-accent border-accent/30 hover:bg-accent/30 text-xs">
                      AI
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
                    {t('sahbiSection.subtitle') || "Your friendly Darija learning companion"}
                  </p>
                </div>
              </div>

              {/* Features - compact grid */}
              <div className="grid grid-cols-2 gap-2">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 p-2 rounded-lg bg-background/50 border border-border/50"
                  >
                    <feature.icon className={`w-4 h-4 ${feature.color} shrink-0`} />
                    <p className="font-medium text-xs text-foreground">{feature.title}</p>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="flex items-center gap-3">
                <Link to="/sahbi">
                  <Button 
                    size="default"
                    className="sahbi-button group gap-2 px-6 rounded-xl bg-gradient-to-r from-accent via-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground font-semibold shadow-moroccan hover:shadow-hover transition-all duration-500 hover:scale-105"
                  >
                    <img src={sahbiLogo} alt="" className="w-5 h-5 object-contain" />
                    <span>{t('sahbiSection.cta') || "Chat with Sahbi"}</span>
                  </Button>
                </Link>
                
                {/* User avatar indicator when logged in */}
                {isLoggedIn && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Avatar className="h-6 w-6 ring-2 ring-accent/50">
                      <AvatarImage src={userAvatarUrl} />
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">{t('sahbiSection.syncedMessage') || "Synced"}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Chat Preview (minimalist style) - Clickable */}
            <div 
              className="relative cursor-pointer group"
              onClick={() => navigate('/sahbi')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/sahbi')}
            >
              <div className="bg-card/95 dark:bg-[hsl(225,25%,12%)] rounded-xl border border-border/30 shadow-lg overflow-hidden transition-all duration-300 group-hover:shadow-hover group-hover:border-accent/50 group-hover:scale-[1.02]">
                {/* Chat header preview */}
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/30">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={sahbiLogo} className="object-contain" />
                    <AvatarFallback className="bg-accent/20">S</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Sahbi</p>
                    <p className="text-[10px] text-moroccan-green flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-moroccan-green animate-pulse" />
                      {t('sahbiSection.online') || "Online"}
                    </p>
                  </div>
                </div>

                {/* Sample messages */}
                <div className="p-4 space-y-3">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-r from-moroccan-red to-moroccan-gold/90 text-primary-foreground px-3 py-2 rounded-xl rounded-br-sm max-w-[75%]">
                      <p className="text-xs">{t('sahbiSection.sampleQuestion') || "How do I say 'good morning' in Darija?"}</p>
                    </div>
                  </div>

                  {/* Sahbi response */}
                  <div className="flex items-start gap-2">
                    <Avatar className="h-6 w-6 shrink-0">
                      <AvatarImage src={sahbiLogo} className="object-contain" />
                      <AvatarFallback className="bg-accent/20 text-[8px]">S</AvatarFallback>
                    </Avatar>
                    <div className="bg-muted/50 dark:bg-[hsl(225,20%,18%)] border border-border/30 px-3 py-2 rounded-xl rounded-tl-sm max-w-[80%]">
                      <p className="text-xs text-foreground/90">
                        {t('sahbiSection.sampleAnswer') || 
                          'Good morning in Darija is "Sbah lkhir" (صباح الخير). It literally means "morning of goodness"!'} 
                        <span className="ml-1">🇲🇦</span>
                      </p>
                    </div>
                  </div>

                  {/* Typing indicator */}
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <div className="flex gap-0.5 items-center">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-[10px]">{t('sahbiSection.typing') || "Sahbi is typing..."}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
};
