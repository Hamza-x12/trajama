import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle } from "lucide-react";
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

  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-2xl mx-auto">
        {/* Minimalist Chat Preview Card */}
        <div className="bg-card/95 dark:bg-[hsl(225,25%,12%)] rounded-2xl shadow-2xl overflow-hidden border border-border/30">
          {/* Chat Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border/30">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={sahbiLogo} className="object-contain" />
                <AvatarFallback className="bg-accent/20">S</AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base">Sahbi</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-moroccan-green animate-pulse" />
                <span className="text-xs text-moroccan-green">{t('sahbiSection.online') || "Online"}</span>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="p-5 space-y-4 min-h-[180px]">
            {/* User Message */}
            <div className="flex justify-end">
              <div className="flex items-end gap-2">
                <div className="bg-gradient-to-r from-moroccan-red to-moroccan-gold/90 text-primary-foreground px-4 py-2.5 rounded-2xl rounded-br-md max-w-xs shadow-lg">
                  <p className="text-sm font-medium">
                    {t('sahbiSection.sampleQuestion') || "How do I say 'good morning' in Darija?"}
                  </p>
                </div>
                {isLoggedIn && (
                  <Avatar className="h-6 w-6 shrink-0 ring-2 ring-moroccan-red/30">
                    <AvatarImage src={userAvatarUrl} />
                    <AvatarFallback className="bg-moroccan-red/20 text-foreground text-[10px]">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>

            {/* Sahbi Response */}
            <div className="flex items-start gap-2.5">
              <Avatar className="h-8 w-8 shrink-0 ring-2 ring-border/30">
                <AvatarImage src={sahbiLogo} className="object-contain" />
                <AvatarFallback className="bg-accent/20">S</AvatarFallback>
              </Avatar>
              <div className="bg-muted/50 dark:bg-[hsl(225,20%,18%)] border border-border/30 px-4 py-2.5 rounded-2xl rounded-tl-md max-w-sm">
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {t('sahbiSection.sampleAnswer') || 
                    'Good morning in Darija is "Sbah lkhir" (صباح الخير). It literally means "morning of goodness"!'} 
                  <span className="ml-1">🇲🇦</span>
                </p>
              </div>
            </div>

            {/* Typing Indicator */}
            <div className="flex items-center gap-2 text-muted-foreground pt-2">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs">{t('sahbiSection.typing') || "Sahbi is typing..."}</span>
            </div>
          </div>
        </div>

        {/* CTA Below Card */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/sahbi">
            <Button 
              size="lg"
              className="group gap-3 px-8 py-6 rounded-xl bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{t('sahbiSection.cta') || "Chat with Sahbi"}</span>
            </Button>
          </Link>
          
          {/* User sync indicator when logged in */}
          {isLoggedIn && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Avatar className="h-7 w-7 ring-2 ring-accent/50">
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
    </section>
  );
};
