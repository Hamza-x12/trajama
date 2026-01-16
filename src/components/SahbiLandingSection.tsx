import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Sparkles, Mic, BookOpen, Globe, Zap } from "lucide-react";
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

  const features = [
    {
      icon: MessageCircle,
      title: t('sahbiSection.feature1Title') || "Practice Darija",
      description: t('sahbiSection.feature1Desc') || "Chat naturally and learn Moroccan dialect",
      color: "text-moroccan-red"
    },
    {
      icon: BookOpen,
      title: t('sahbiSection.feature2Title') || "Cultural Insights",
      description: t('sahbiSection.feature2Desc') || "Understand expressions and context",
      color: "text-moroccan-gold"
    },
    {
      icon: Globe,
      title: t('sahbiSection.feature3Title') || "Multilingual",
      description: t('sahbiSection.feature3Desc') || "Get help in your preferred language",
      color: "text-moroccan-green"
    },
    {
      icon: Zap,
      title: t('sahbiSection.feature4Title') || "Instant Answers",
      description: t('sahbiSection.feature4Desc') || "AI-powered responses in seconds",
      color: "text-primary"
    }
  ];

  return (
    <section className="py-8 sm:py-12">
      <Card className="relative overflow-hidden border-accent/30 bg-gradient-to-br from-accent/5 via-background to-primary/5 shadow-elegant hover:shadow-hover transition-all duration-500">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-accent/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative p-6 sm:p-8 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left side - Content */}
            <div className="space-y-6">
              {/* Header with logo */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={sahbiLogo} 
                    alt="Sahbi" 
                    className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-lg animate-float"
                  />
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="w-5 h-5 text-accent animate-pulse" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                      {t('sahbiSection.title') || "Meet Sahbi"}
                    </h2>
                    <Badge className="bg-accent/20 text-accent border-accent/30 hover:bg-accent/30">
                      AI
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm sm:text-base mt-1">
                    {t('sahbiSection.subtitle') || "Your friendly Darija learning companion"}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-base sm:text-lg text-foreground/80 leading-relaxed">
                {t('sahbiSection.description') || 
                  "Sahbi (which means 'my friend' in Darija) is your AI-powered assistant for learning Moroccan Arabic. Ask questions, practice conversations, and discover the rich culture of Morocco."}
              </p>

              {/* Features grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-border/50 hover:border-accent/50 hover:bg-accent/5 transition-all duration-300"
                  >
                    <feature.icon className={`w-5 h-5 ${feature.color} shrink-0 mt-0.5`} />
                    <div>
                      <p className="font-medium text-sm text-foreground">{feature.title}</p>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="flex items-center gap-4 pt-2">
                <Link to="/sahbi" className="flex-1 sm:flex-initial">
                  <Button 
                    size="lg"
                    className="sahbi-button group w-full sm:w-auto gap-3 px-8 py-6 rounded-2xl bg-gradient-to-r from-accent via-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground font-bold text-lg shadow-moroccan hover:shadow-hover transition-all duration-500 hover:scale-105"
                  >
                    <img src={sahbiLogo} alt="" className="w-8 h-8 object-contain" />
                    <span>{t('sahbiSection.cta') || "Chat with Sahbi"}</span>
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </Button>
                </Link>
                
                {/* User avatar indicator when logged in */}
                {isLoggedIn && (
                  <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                    <Avatar className="h-8 w-8 ring-2 ring-accent/50">
                      <AvatarImage src={userAvatarUrl} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                    <span>{t('sahbiSection.syncedMessage') || "Your chats are synced"}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Preview chat */}
            <div className="relative">
              <div className="bg-background/80 backdrop-blur-sm rounded-2xl border border-border/50 shadow-elegant p-4 sm:p-6 space-y-4">
                {/* Chat header preview */}
                <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                  <Avatar className="h-10 w-10 ring-2 ring-accent/30">
                    <AvatarImage src={sahbiLogo} />
                    <AvatarFallback className="bg-accent/20">S</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">Sahbi</p>
                    <p className="text-xs text-green-500 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      {t('sahbiSection.online') || "Online"}
                    </p>
                  </div>
                </div>

                {/* Sample messages */}
                <div className="space-y-3">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="flex items-end gap-2 max-w-[80%]">
                      <div className="bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl rounded-br-sm">
                        <p className="text-sm">{t('sahbiSection.sampleQuestion') || "How do I say 'good morning' in Darija?"}</p>
                      </div>
                      {isLoggedIn && (
                        <Avatar className="h-6 w-6 shrink-0">
                          <AvatarImage src={userAvatarUrl} />
                          <AvatarFallback className="bg-primary/20 text-primary text-[10px]">
                            {userInitial}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>

                  {/* Sahbi response */}
                  <div className="flex items-start gap-2">
                    <Avatar className="h-8 w-8 shrink-0 ring-2 ring-accent/20">
                      <AvatarImage src={sahbiLogo} />
                      <AvatarFallback className="bg-accent/20">S</AvatarFallback>
                    </Avatar>
                    <div className="bg-muted/50 border border-border/50 px-4 py-2.5 rounded-2xl rounded-tl-sm max-w-[85%]">
                      <p className="text-sm text-foreground">
                        {t('sahbiSection.sampleAnswer') || 
                          'Good morning in Darija is "Sbah lkhir" (صباح الخير). It literally means "morning of goodness"! 🌅'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Typing indicator */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs">{t('sahbiSection.typing') || "Sahbi is typing..."}</span>
                </div>
              </div>

              {/* Decorative sparkles */}
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-6 h-6 text-accent/60 animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -left-1">
                <Sparkles className="w-4 h-4 text-primary/60 animate-pulse" style={{ animationDelay: '500ms' }} />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
};
