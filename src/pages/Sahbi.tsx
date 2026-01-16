import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, Send, Bot, User, Sparkles, 
  MessageCircle, Heart, Star, Zap, Volume2, VolumeX, 
  MessageSquarePlus, Loader2, Copy, Check, Settings2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { ZelligeCorners } from "@/components/ZelligeCorners";
import sahbiLogo from "@/assets/sahbi-logo.png";
import { toast } from "sonner";
import { SahbiSidebar } from "@/components/SahbiSidebar";
import { useSahbiConversations, Message } from "@/hooks/useSahbiConversations";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/darija-chat`;

const Sahbi = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [userName, setUserName] = useState<string | null>(null);
  const {
    conversations,
    currentConversation,
    messages,
    setMessages,
    isLoading: isLoadingConversations,
    createConversation,
    addMessage,
    saveAssistantMessage,
    updateTitle,
    deleteConversation,
    selectConversation
  } = useSahbiConversations();

  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get Darija script preference
  const [darijaScript, setDarijaScript] = useState<'latin' | 'arabic' | 'both'>(() => {
    const saved = localStorage.getItem('sahbiDarijaScript');
    return (saved as 'latin' | 'arabic' | 'both') || 'both';
  });
  
  // Translation in response toggle
  const [includeTranslation, setIncludeTranslation] = useState<boolean>(() => {
    const saved = localStorage.getItem('sahbiIncludeTranslation');
    return saved !== 'false'; // Default true
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('sahbiDarijaScript');
      if (saved) {
        setDarijaScript(saved as 'latin' | 'arabic' | 'both');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  // Fetch user's display name
  useEffect(() => {
    const fetchUserName = async () => {
      if (!user) {
        setUserName(null);
        return;
      }

      // Try to get display name from user metadata first
      const metaName = user.user_metadata?.display_name || user.user_metadata?.full_name || user.user_metadata?.name;
      if (metaName) {
        setUserName(metaName);
        return;
      }

      // Fallback to profile table
      try {
        const { data } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single();
        
        if (data?.display_name) {
          setUserName(data.display_name);
        } else {
          // Use email prefix as fallback
          setUserName(user.email?.split('@')[0] || null);
        }
      } catch {
        setUserName(user.email?.split('@')[0] || null);
      }
    };

    fetchUserName();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentConversation]);

  const getGreeting = () => {
    const nameGreeting = userName ? ` ${userName}` : '';
    
    if (darijaScript === 'latin') {
      return `Salam${nameGreeting}! Ana Sahbi, sahbek li ghadi y3awnek t3elem Darija! Kifash rak lyoum?

Yallah, goul liya shnu bghiti t3elem! 🇲🇦`;
    } else if (darijaScript === 'arabic') {
      return `سلام${nameGreeting}! أنا صاحبي، صاحبك لي غادي يعاونك تعلم الدارجة! كيفاش راك اليوم؟

يلاه، قول ليا شنو بغيتي تعلم! 🇲🇦`;
    } else {
      return `**Darija (Latin):** Salam${nameGreeting}! Ana Sahbi, sahbek li ghadi y3awnek t3elem Darija! Kifash rak lyoum?

**Darija (Arabic):** سلام${nameGreeting}! أنا صاحبي، صاحبك لي غادي يعاونك تعلم الدارجة! كيفاش راك اليوم؟

**Translation:** Hello${nameGreeting}! I'm Sahbi, your friend who will help you learn Darija! How are you today?

Yallah, goul liya shnu bghiti t3elem! 🇲🇦`;
    }
  };

  const getScriptInstruction = () => {
    let instruction = "";
    
    if (darijaScript === 'latin') {
      instruction = "SCRIPT: Respond ONLY in Latin script Darija (like 'Salam', 'Labas', 'Wakha'). Do NOT include Arabic script.";
    } else if (darijaScript === 'arabic') {
      instruction = "SCRIPT: Respond ONLY in Arabic script Darija (like 'سلام', 'لاباس', 'واخا'). Do NOT include Latin script.";
    } else {
      instruction = "SCRIPT: Format your responses with both Latin and Arabic script sections clearly labeled.";
    }
    
    if (includeTranslation) {
      instruction += "\n\nTRANSLATION: After your Darija response, add a clear '📖 Translation:' section with the English meaning. Keep it concise but helpful for learners.";
    } else {
      instruction += "\n\nTRANSLATION: Do NOT include English translations. The user wants to practice immersively. Only provide translations if they explicitly ask.";
    }
    
    instruction += "\n\nFORMAT: Keep responses clear and well-structured. Use short paragraphs. Be conversational and friendly, not formal.";
    
    return instruction;
  };

  const handleNewConversation = async () => {
    const conv = await createConversation();
    if (conv) {
      // Add greeting message
      const greeting: Message = {
        role: "assistant",
        content: getGreeting(),
        timestamp: Date.now()
      };
      setMessages([greeting]);
      addMessage(greeting);
    }
  };

  // Auto-create first conversation with greeting
  useEffect(() => {
    if (!isLoadingConversations && conversations.length === 0) {
      handleNewConversation();
    } else if (!isLoadingConversations && currentConversation && messages.length === 0) {
      const greeting: Message = {
        role: "assistant",
        content: getGreeting(),
        timestamp: Date.now()
      };
      setMessages([greeting]);
    }
  }, [isLoadingConversations, conversations.length, currentConversation]);

  const streamChat = async (userMessages: Message[]) => {
    setIsStreaming(true);
    let assistantContent = "";

    try {
      const messagesWithScript = userMessages.map((msg, idx) => {
        if (idx === 0 && msg.role === 'user') {
          return { ...msg, content: `[Script preference: ${getScriptInstruction()}]\n\n${msg.content}` };
        }
        return { role: msg.role, content: msg.content };
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
                    i === prev.length - 1 ? { ...m, content: assistantContent, timestamp: Date.now() } : m
                  );
                }
                return [...prev, { role: "assistant", content: assistantContent, timestamp: Date.now() }];
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Save the final assistant message
      if (assistantContent) {
        saveAssistantMessage(assistantContent);
        
        // Auto-generate title from first user message if this is a new conversation
        if (currentConversation && currentConversation.message_count === 0 && userMessages.length > 0) {
          const firstUserMsg = userMessages.find(m => m.role === 'user');
          if (firstUserMsg) {
            const title = firstUserMsg.content.length > 40 
              ? firstUserMsg.content.slice(0, 40) + '...' 
              : firstUserMsg.content;
            updateTitle(currentConversation.id, title);
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: darijaScript === 'arabic' 
          ? "سمح ليا! كاين مشكل. عاود جرب! 🙏"
          : "Smeh liya! (Sorry!) I had a problem. Try again! 🙏",
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming || !currentConversation) return;

    const userMessage: Message = { role: "user", content: input.trim(), timestamp: Date.now() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");

    // Save user message to DB only (don't call addMessage which updates state again)
    if (user && currentConversation) {
      try {
        await supabase.from('sahbi_messages').insert({
          id: crypto.randomUUID(),
          conversation_id: currentConversation.id,
          role: 'user',
          content: userMessage.content
        });
      } catch (error) {
        console.error('Error saving user message:', error);
      }
    } else if (currentConversation) {
      // Guest: save to localStorage
      const stored = localStorage.getItem(`sahbi-messages-${currentConversation.id}`);
      const existingMessages: Message[] = stored ? JSON.parse(stored) : [];
      existingMessages.push({ ...userMessage, id: crypto.randomUUID() });
      localStorage.setItem(`sahbi-messages-${currentConversation.id}`, JSON.stringify(existingMessages));
    }

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

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success(t('common.copied') || 'Copied!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
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

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Helmet>
        <title>{t('sahbi.pageTitle')} - Tarjama</title>
        <meta name="description" content={t('sahbi.pageDescription')} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-background dark:via-background dark:to-background">
        <ZelligeCorners size="lg" opacity={0.3} />
        
        {/* Decorative Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-amber-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/20 to-red-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-green-500/10 to-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[length:24px_24px]" />
        </div>

        {/* Header */}
        <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link 
                  to="/" 
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
                >
                  <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  <span className="hidden sm:inline">{t('navigation.backToTranslator')}</span>
                </Link>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#c1272d] via-[#006233] to-[#4a9fd4] rounded-full blur-md opacity-60 group-hover:opacity-100 transition-opacity animate-pulse" />
                  <img 
                    src={sahbiLogo} 
                    alt="Sahbi Logo" 
                    className="relative w-16 h-16 object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-300" 
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-[#c1272d] via-[#006233] to-[#4a9fd4] bg-clip-text text-transparent">
                    صاحبي (Sahbi)
                  </h1>
                  <p className="text-xs text-muted-foreground">{t('sahbi.subtitle')}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <SahbiSidebar
                  conversations={conversations}
                  currentConversation={currentConversation}
                  onSelect={selectConversation}
                  onCreate={handleNewConversation}
                  onRename={updateTitle}
                  onDelete={deleteConversation}
                  isLoading={isLoadingConversations}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNewConversation}
                  className="text-muted-foreground hover:text-primary"
                  title={t('sahbi.newConversation') || 'New Conversation'}
                >
                  <MessageSquarePlus className="h-5 w-5" />
                </Button>
                
                {/* Sahbi Settings Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary"
                      title={t('settings.sahbiSettings') || 'Sahbi Settings'}
                    >
                      <Settings2 className="h-5 w-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72" align="end">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <img src={sahbiLogo} alt="Sahbi" className="w-6 h-6" />
                        <h4 className="font-semibold text-sm">{t('settings.sahbiSettings')}</h4>
                      </div>
                      <p className="text-xs text-muted-foreground">{t('settings.darijaScript')}</p>
                      {/* Translation toggle */}
                      <div className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 transition-colors">
                        <Label htmlFor="include-translation" className="cursor-pointer text-sm flex-1">
                          {t('settings.includeTranslation') || 'Include Translation'}
                        </Label>
                        <input
                          type="checkbox"
                          id="include-translation"
                          checked={includeTranslation}
                          onChange={(e) => {
                            setIncludeTranslation(e.target.checked);
                            localStorage.setItem('sahbiIncludeTranslation', String(e.target.checked));
                            toast.success(e.target.checked 
                              ? (t('settings.translationEnabled') || 'Translation enabled')
                              : (t('settings.translationDisabled') || 'Translation disabled - immersive mode!')
                            );
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        />
                      </div>
                      
                      <div className="border-t pt-3 mt-2">
                        <p className="text-xs text-muted-foreground mb-2">{t('settings.darijaScript')}</p>
                      </div>
                      
                      <RadioGroup
                        value={darijaScript}
                        onValueChange={(value: 'latin' | 'arabic' | 'both') => {
                          setDarijaScript(value);
                          localStorage.setItem('sahbiDarijaScript', value);
                          toast.success(t('settings.sahbiScriptUpdated') || 'Script preference updated');
                        }}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                          <RadioGroupItem value="both" id="sahbi-script-both" />
                          <Label htmlFor="sahbi-script-both" className="flex-1 cursor-pointer text-sm">
                            {t('settings.scriptBoth')}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                          <RadioGroupItem value="latin" id="sahbi-script-latin" />
                          <Label htmlFor="sahbi-script-latin" className="flex-1 cursor-pointer text-sm">
                            {t('settings.scriptLatin')}
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-2 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                          <RadioGroupItem value="arabic" id="sahbi-script-arabic" />
                          <Label htmlFor="sahbi-script-arabic" className="flex-1 cursor-pointer text-sm">
                            {t('settings.scriptArabic')}
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <img src={sahbiLogo} alt="Sahbi" className="w-10 h-10 object-contain drop-shadow-lg" />
              </div>
            </div>
          </div>
        </header>

        {/* Chat Container */}
        <main className="relative z-10 container mx-auto px-4 py-6">
          <div className="max-w-3xl mx-auto">
            {/* Welcome Card */}
            <div className="mb-6 p-6 rounded-3xl bg-gradient-to-r from-[#c1272d]/10 via-[#006233]/10 to-[#4a9fd4]/10 border-2 border-[#c1272d]/20 backdrop-blur-sm shadow-xl shadow-[#c1272d]/5 relative overflow-hidden group hover:border-[#c1272d]/30 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-[#c1272d]/0 via-[#006233]/5 to-[#4a9fd4]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-start gap-4 relative z-10">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c1272d] via-[#006233] to-[#4a9fd4] shadow-xl shadow-[#c1272d]/40 group-hover:scale-105 transition-transform duration-300 p-2.5">
                  <img src={sahbiLogo} alt="Sahbi" className="w-full h-full object-contain" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h2 className="text-xl font-bold">{t('sahbi.welcomeTitle')}</h2>
                    {currentConversation && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                        <MessageCircle className="h-3 w-3" />
                        {currentConversation.title}
                      </span>
                    )}
                    {!user && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs">
                        {t('sahbi.guestMode') || 'Guest Mode'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{t('sahbi.welcomeDescription')}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium shadow-sm hover:shadow-md hover:bg-primary/15 transition-all cursor-default">
                      <Heart className="h-3.5 w-3.5" /> {t('sahbi.tag1')}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium shadow-sm hover:shadow-md hover:bg-amber-500/15 transition-all cursor-default">
                      <Star className="h-3.5 w-3.5" /> {t('sahbi.tag2')}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium shadow-sm hover:shadow-md hover:bg-green-500/15 transition-all cursor-default">
                      <Zap className="h-3.5 w-3.5" /> {t('sahbi.tag3')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="bg-background/90 backdrop-blur-2xl rounded-3xl border-2 border-border/50 shadow-2xl overflow-hidden">
              <ScrollArea 
                ref={scrollRef} 
                className="h-[calc(100vh-420px)] min-h-[380px] p-6"
              >
                {isLoadingConversations ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((msg, i) => (
                      <div
                        key={msg.id || i}
                        className={cn(
                          "flex gap-4 animate-in slide-in-from-bottom-2 duration-300",
                          msg.role === "user" ? "flex-row-reverse" : "flex-row"
                        )}
                        style={{ animationDelay: `${i * 30}ms` }}
                      >
                        <div
                          className={cn(
                            "flex shrink-0 items-center justify-center rounded-2xl shadow-lg transition-transform hover:scale-105 overflow-hidden",
                            msg.role === "user"
                              ? "h-11 w-11 bg-gradient-to-br from-blue-500 to-purple-500 shadow-blue-500/30"
                              : "h-12 w-12 bg-gradient-to-br from-[#c1272d] via-[#006233] to-[#4a9fd4] shadow-[#c1272d]/30 p-2"
                          )}
                        >
                          {msg.role === "user" ? (
                            <User className="h-5 w-5 text-white" />
                          ) : (
                            <img src={sahbiLogo} alt="Sahbi" className="w-full h-full object-contain" />
                          )}
                        </div>
                        <div
                          className={cn(
                            "rounded-3xl px-5 py-4 max-w-[85%] shadow-lg transition-all duration-200 hover:shadow-xl group/message",
                            msg.role === "user"
                              ? "bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-tr-lg"
                              : "bg-card border-2 border-border/50 rounded-tl-lg hover:border-primary/20"
                          )}
                        >
                          <div className="whitespace-pre-wrap leading-relaxed text-sm">
                            {renderMessageContent(msg.content)}
                          </div>
                          
                          <div className={cn(
                            "flex items-center gap-2 mt-3 pt-2 border-t",
                            msg.role === "user" ? "border-white/20" : "border-border/50"
                          )}>
                            <span className={cn(
                              "text-[10px]",
                              msg.role === "user" ? "text-white/70" : "text-muted-foreground"
                            )}>
                              {formatTime(msg.timestamp)}
                            </span>
                            
                            <div className="flex-1" />
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(msg.content, msg.id || String(i))}
                              className={cn(
                                "h-7 px-2 text-xs opacity-0 group-hover/message:opacity-100 transition-opacity",
                                msg.role === "user" 
                                  ? "text-white/80 hover:text-white hover:bg-white/10" 
                                  : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                              )}
                            >
                              {copiedId === (msg.id || String(i)) ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                            
                            {msg.role === "assistant" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => speakText(msg.content)}
                                className="h-7 px-2 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-0 group-hover/message:opacity-100 transition-opacity"
                              >
                                {isSpeaking ? (
                                  <VolumeX className="h-3 w-3" />
                                ) : (
                                  <Volume2 className="h-3 w-3" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isStreaming && messages[messages.length - 1]?.role === "user" && (
                      <div className="flex gap-4 animate-in slide-in-from-bottom-2">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#c1272d] via-[#006233] to-[#4a9fd4] shadow-lg shadow-[#c1272d]/30 p-2">
                          <img src={sahbiLogo} alt="Sahbi" className="w-full h-full object-contain" />
                        </div>
                        <div className="rounded-3xl rounded-tl-lg bg-card border-2 border-border/50 px-5 py-4 shadow-lg">
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                              <span className="h-2 w-2 rounded-full bg-[#c1272d] animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="h-2 w-2 rounded-full bg-[#006233] animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="h-2 w-2 rounded-full bg-[#4a9fd4] animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            <span className="text-sm text-muted-foreground">{t('sahbi.thinking')}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              <div className="border-t-2 border-border/50 p-5 bg-gradient-to-t from-muted/50 to-transparent">
                <div className="flex gap-3">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('sahbi.inputPlaceholder')}
                    className="flex-1 rounded-2xl border-2 border-border/50 bg-background/90 h-14 px-6 text-base focus:border-primary/50 focus:ring-primary/20 transition-all"
                    disabled={isStreaming || !currentConversation}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isStreaming || !currentConversation}
                    size="lg"
                    className="rounded-2xl h-14 w-14 bg-gradient-to-r from-[#c1272d] via-[#006233] to-[#4a9fd4] hover:opacity-90 shadow-xl shadow-[#c1272d]/30 hover:shadow-2xl hover:shadow-[#c1272d]/40 hover:scale-105 transition-all duration-300"
                  >
                    {isStreaming ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-2">
                  <span className="text-lg">🇲🇦</span>
                  <span className="font-medium">{t('sahbi.encouragement')}</span>
                  <span className="text-lg">🇲🇦</span>
                </p>
              </div>
            </div>

            {/* Quick Phrases */}
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              {[
                { label: "Salam! 👋", value: "Salam!" },
                { label: "Labas? 🤔", value: "Labas? How do I respond to this?" },
                { label: "Shukran ❤️", value: "How do I say thank you in Darija?" },
                { label: "Numbers 🔢", value: "Teach me numbers 1-10 in Darija" },
                { label: "Greetings 🙋", value: "Teach me common Darija greetings" }
              ].map((phrase) => (
                <Button
                  key={phrase.label}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInput(phrase.value);
                    inputRef.current?.focus();
                  }}
                  disabled={!currentConversation}
                  className="rounded-full px-5 py-2 text-sm hover:bg-gradient-to-r hover:from-[#c1272d]/10 hover:via-[#006233]/10 hover:to-[#4a9fd4]/10 hover:text-[#c1272d] hover:border-[#c1272d]/40 shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <span className="group-hover:scale-110 transition-transform inline-block">{phrase.label}</span>
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
