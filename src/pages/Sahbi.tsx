import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, Send, Bot, User, Loader2, Sparkles, 
  MessageCircle, Heart, Star, Zap, Volume2, VolumeX
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import moroccoFlag from "@/assets/flags/morocco.png";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/darija-chat`;

const Sahbi = () => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get Darija script preference
  const [darijaScript, setDarijaScript] = useState<'latin' | 'arabic' | 'both'>(() => {
    const saved = localStorage.getItem('sahbiDarijaScript');
    return (saved as 'latin' | 'arabic' | 'both') || 'both';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('sahbiDarijaScript');
      if (saved) {
        setDarijaScript(saved as 'latin' | 'arabic' | 'both');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    // Also check on focus
    window.addEventListener('focus', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Send initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      const greeting: Message = {
        role: "assistant",
        content: getGreeting()
      };
      setMessages([greeting]);
    }
  }, [messages.length, darijaScript]);

  const getGreeting = () => {
    if (darijaScript === 'latin') {
      return `Salam! Ana Sahbi, sahbek li ghadi y3awnek t3elem Darija! Kifash rak lyoum?

Yallah, goul liya shnu bghiti t3elem! 🇲🇦`;
    } else if (darijaScript === 'arabic') {
      return `سلام! أنا صاحبي، صاحبك لي غادي يعاونك تعلم الدارجة! كيفاش راك اليوم؟

يلاه، قول ليا شنو بغيتي تعلم! 🇲🇦`;
    } else {
      return `**Darija (Latin):** Salam! Ana Sahbi, sahbek li ghadi y3awnek t3elem Darija! Kifash rak lyoum?

**Darija (Arabic):** سلام! أنا صاحبي، صاحبك لي غادي يعاونك تعلم الدارجة! كيفاش راك اليوم؟

**Translation:** Hello! I'm Sahbi, your friend who will help you learn Darija! How are you today?

Yallah, goul liya shnu bghiti t3elem! 🇲🇦`;
    }
  };

  const getScriptInstruction = () => {
    if (darijaScript === 'latin') {
      return "IMPORTANT: Respond ONLY in Latin script Darija (like 'Salam', 'Labas', 'Wakha'). Do NOT include Arabic script.";
    } else if (darijaScript === 'arabic') {
      return "IMPORTANT: Respond ONLY in Arabic script Darija (like 'سلام', 'لاباس', 'واخا'). Do NOT include Latin script.";
    }
    return "Format your responses with both Latin and Arabic script sections clearly labeled.";
  };

  const streamChat = async (userMessages: Message[]) => {
    setIsLoading(true);
    let assistantContent = "";

    try {
      const messagesWithScript = userMessages.map((msg, idx) => {
        if (idx === 0 && msg.role === 'user') {
          return { ...msg, content: `[Script preference: ${getScriptInstruction()}]\n\n${msg.content}` };
        }
        return msg;
      });

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: messagesWithScript,
          scriptPreference: darijaScript
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg?.role === "assistant" && prev.length > 1) {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: darijaScript === 'arabic' 
            ? "سمح ليا! كاين مشكل. عاود جرب! 🙏"
            : "Smeh liya! (Sorry!) I had a problem. Try again! 🙏",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");

    await streamChat(newMessages);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const speakText = (text: string) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Clean markdown and extract plain text
    const cleanText = text
      .replace(/\*\*[^*]+\*\*/g, '')
      .replace(/\n/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-MA';
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const renderMessageContent = (content: string) => {
    return content.split(/(\*\*[^*]+\*\*)/).map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={idx} className="font-bold text-primary">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <>
      <Helmet>
        <title>{t('sahbi.pageTitle')} - Tarjama</title>
        <meta name="description" content={t('sahbi.pageDescription')} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-background dark:via-background dark:to-background">
        {/* Decorative Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-amber-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/20 to-red-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-green-500/10 to-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Header */}
        <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">{t('navigation.backToTranslator')}</span>
              </Link>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-amber-500 to-red-500 rounded-full blur animate-pulse" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-primary to-amber-500">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-amber-500 to-red-500 bg-clip-text text-transparent">
                    صاحبي (Sahbi)
                  </h1>
                  <p className="text-xs text-muted-foreground">{t('sahbi.subtitle')}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <img src={moroccoFlag} alt="Morocco" className="w-8 h-8 rounded-full object-cover shadow-lg" />
              </div>
            </div>
          </div>
        </header>

        {/* Chat Container */}
        <main className="relative z-10 container mx-auto px-4 py-6">
          <div className="max-w-3xl mx-auto">
            {/* Welcome Card */}
            <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-amber-500/10 to-red-500/10 border border-primary/20 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-amber-500 shadow-lg shadow-primary/30">
                  <MessageCircle className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold mb-1">{t('sahbi.welcomeTitle')}</h2>
                  <p className="text-sm text-muted-foreground">{t('sahbi.welcomeDescription')}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      <Heart className="h-3 w-3" /> {t('sahbi.tag1')}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium">
                      <Star className="h-3 w-3" /> {t('sahbi.tag2')}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium">
                      <Zap className="h-3 w-3" /> {t('sahbi.tag3')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="bg-background/80 backdrop-blur-xl rounded-3xl border border-border/50 shadow-2xl overflow-hidden">
              <ScrollArea 
                ref={scrollRef} 
                className="h-[calc(100vh-400px)] min-h-[400px] p-6"
              >
                <div className="space-y-6">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex gap-4 animate-in slide-in-from-bottom-2 duration-300",
                        msg.role === "user" ? "flex-row-reverse" : "flex-row"
                      )}
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-lg",
                          msg.role === "user"
                            ? "bg-gradient-to-br from-blue-500 to-purple-500"
                            : "bg-gradient-to-br from-primary via-amber-500 to-red-500"
                        )}
                      >
                        {msg.role === "user" ? (
                          <User className="h-5 w-5 text-white" />
                        ) : (
                          <Bot className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div
                        className={cn(
                          "rounded-3xl px-5 py-4 max-w-[80%] shadow-lg",
                          msg.role === "user"
                            ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-tr-lg"
                            : "bg-card border border-border/50 rounded-tl-lg"
                        )}
                      >
                        <div className="whitespace-pre-wrap leading-relaxed text-sm">
                          {renderMessageContent(msg.content)}
                        </div>
                        {msg.role === "assistant" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => speakText(msg.content)}
                            className="mt-2 h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                          >
                            {isSpeaking ? (
                              <VolumeX className="h-4 w-4 mr-1" />
                            ) : (
                              <Volume2 className="h-4 w-4 mr-1" />
                            )}
                            {isSpeaking ? t('audio.stop') : t('audio.play')}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <div className="flex gap-4 animate-in slide-in-from-bottom-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-amber-500 to-red-500 shadow-lg">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                      <div className="rounded-3xl rounded-tl-lg bg-card border border-border/50 px-5 py-4 shadow-lg">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">{t('sahbi.thinking')}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t border-border/50 p-4 bg-muted/30">
                <div className="flex gap-3">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('sahbi.inputPlaceholder')}
                    className="flex-1 rounded-2xl border-border/50 bg-background/80 h-12 px-5 text-base"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    size="lg"
                    className="rounded-2xl h-12 w-12 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 shadow-lg shadow-primary/30"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3 flex items-center justify-center gap-2">
                  <span>🇲🇦</span>
                  <span>{t('sahbi.encouragement')}</span>
                  <span>🇲🇦</span>
                </p>
              </div>
            </div>

            {/* Quick Phrases */}
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {[
                { label: "Salam!", value: "Salam!" },
                { label: "Labas?", value: "Labas? How do I respond to this?" },
                { label: "Shukran", value: "How do I say thank you in Darija?" },
                { label: "Numbers", value: "Teach me numbers 1-10 in Darija" }
              ].map((phrase) => (
                <Button
                  key={phrase.label}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInput(phrase.value);
                    inputRef.current?.focus();
                  }}
                  className="rounded-full text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                >
                  {phrase.label}
                </Button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Sahbi;
