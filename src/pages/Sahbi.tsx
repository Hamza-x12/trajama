import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, Send, User, 
  MessageSquarePlus, Loader2, Copy, Check, Settings2, Volume2, VolumeX,
  GraduationCap, MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
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

  // Sahbi mode: 'learn' or 'chat'
  const [sahbiMode, setSahbiMode] = useState<'learn' | 'chat'>(() => {
    const saved = localStorage.getItem('sahbiMode');
    return (saved as 'learn' | 'chat') || 'learn';
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

      const metaName = user.user_metadata?.display_name || user.user_metadata?.full_name || user.user_metadata?.name;
      if (metaName) {
        setUserName(metaName);
        return;
      }

      try {
        const { data } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', user.id)
          .single();
        
        if (data?.display_name) {
          setUserName(data.display_name);
        } else {
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
    
    // Mode-specific instructions
    if (sahbiMode === 'learn') {
      instruction = "MODE: You are in LEARNING mode. Focus on teaching Darija language. Explain vocabulary, grammar, pronunciation, and cultural context. Provide examples and encourage practice. Be educational but friendly.\n\n";
    } else {
      instruction = "MODE: You are in CHAT mode. Have a natural, casual conversation. Answer questions on any topic. You can still use Darija naturally but don't force lessons. Be helpful, friendly, and conversational like a real Moroccan friend.\n\n";
    }
    
    if (darijaScript === 'latin') {
      instruction += "SCRIPT: Respond ONLY in Latin script Darija (like 'Salam', 'Labas', 'Wakha'). Do NOT include Arabic script.";
    } else if (darijaScript === 'arabic') {
      instruction += "SCRIPT: Respond ONLY in Arabic script Darija (like 'سلام', 'لاباس', 'واخا'). Do NOT include Latin script.";
    } else {
      instruction += "SCRIPT: Format your responses with both Latin and Arabic script sections clearly labeled.";
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

      if (assistantContent) {
        saveAssistantMessage(assistantContent);
        
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

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Link 
                to="/" 
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
              >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline text-sm">{t('navigation.backToTranslator')}</span>
              </Link>
              
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={sahbiLogo} className="object-contain" />
                  <AvatarFallback className="bg-accent/20">S</AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-base font-semibold text-foreground">Sahbi</h1>
                  <p className="text-[10px] text-moroccan-green flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-moroccan-green animate-pulse" />
                    {t('sahbiSection.online') || "Online"}
                  </p>
                </div>
                
                {/* Mode Toggle */}
                <div className="flex items-center bg-muted/50 rounded-full p-0.5 border border-border/50">
                  <button
                    onClick={() => {
                      setSahbiMode('learn');
                      localStorage.setItem('sahbiMode', 'learn');
                      toast.success(t('sahbi.learnModeEnabled') || 'Learning mode enabled');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      sahbiMode === 'learn' 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t('sahbi.learnMode') || 'Learn'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setSahbiMode('chat');
                      localStorage.setItem('sahbiMode', 'chat');
                      toast.success(t('sahbi.chatModeEnabled') || 'Chat mode enabled');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      sahbiMode === 'chat' 
                        ? 'bg-accent text-accent-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t('sahbi.chatMode') || 'Chat'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
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
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  title={t('sahbi.newConversation') || 'New Conversation'}
                >
                  <MessageSquarePlus className="h-4 w-4" />
                </Button>
                
                {/* Settings Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      title={t('settings.sahbiSettings') || 'Sahbi Settings'}
                    >
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72" align="end">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <img src={sahbiLogo} alt="Sahbi" className="w-5 h-5" />
                        <h4 className="font-semibold text-sm">{t('settings.sahbiSettings')}</h4>
                      </div>
                      
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
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                        />
                      </div>
                      
                      <div className="border-t pt-3">
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
              </div>
            </div>
          </div>
        </header>

        {/* Chat Container */}
        <main className="container mx-auto max-w-3xl">
          {/* Messages Area */}
          <ScrollArea 
            ref={scrollRef} 
            className="h-[calc(100vh-140px)] px-4"
          >
            <div className="py-6 space-y-4">
              {isLoadingConversations ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <div
                      key={msg.id || i}
                      className={cn(
                        "flex gap-2.5 animate-in slide-in-from-bottom-2 duration-200",
                        msg.role === "user" ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      {/* Avatar */}
                      {msg.role === "assistant" ? (
                        <Avatar className="h-8 w-8 shrink-0 ring-2 ring-border/30">
                          <AvatarImage src={sahbiLogo} className="object-contain" />
                          <AvatarFallback className="bg-accent/20 text-xs">S</AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-moroccan-red to-moroccan-gold flex items-center justify-center">
                          <User className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                      
                      {/* Message Bubble */}
                      <div
                        className={cn(
                          "group/message max-w-[80%]",
                          msg.role === "user" ? "flex flex-col items-end" : ""
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-2.5 shadow-sm",
                            msg.role === "user"
                              ? "bg-gradient-to-r from-moroccan-red to-moroccan-gold/90 text-white rounded-br-md"
                              : "bg-muted/50 dark:bg-[hsl(225,20%,18%)] border border-border/30 rounded-tl-md text-foreground"
                          )}
                        >
                          <div className="whitespace-pre-wrap leading-relaxed text-sm">
                            {renderMessageContent(msg.content)}
                          </div>
                        </div>
                        
                        {/* Message Actions */}
                        <div className={cn(
                          "flex items-center gap-1.5 mt-1 opacity-0 group-hover/message:opacity-100 transition-opacity",
                          msg.role === "user" ? "flex-row-reverse" : ""
                        )}>
                          <span className="text-[10px] text-muted-foreground">
                            {formatTime(msg.timestamp)}
                          </span>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(msg.content, msg.id || String(i))}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
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
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
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
                  
                  {/* Typing indicator */}
                  {isStreaming && messages[messages.length - 1]?.role === "user" && (
                    <div className="flex gap-2.5 animate-in slide-in-from-bottom-2">
                      <Avatar className="h-8 w-8 shrink-0 ring-2 ring-border/30">
                        <AvatarImage src={sahbiLogo} className="object-contain" />
                        <AvatarFallback className="bg-accent/20 text-xs">S</AvatarFallback>
                      </Avatar>
                      <div className="bg-muted/50 dark:bg-[hsl(225,20%,18%)] border border-border/30 rounded-2xl rounded-tl-md px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{t('sahbi.thinking')}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="sticky bottom-0 bg-background border-t border-border/50 p-4">
            <div className="flex gap-2 max-w-4xl mx-auto">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('sahbi.inputPlaceholder')}
                className="flex-1 rounded-xl border-border/50 bg-muted/30 h-12 px-5 text-base focus:border-primary/50 transition-all"
                disabled={isStreaming || !currentConversation}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming || !currentConversation}
                size="icon"
                className="h-12 w-12 rounded-xl bg-gradient-to-r from-moroccan-red to-moroccan-gold hover:opacity-90 shadow-md transition-all shrink-0"
              >
                {isStreaming ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            
            {/* Quick Phrases */}
            <div className="flex flex-wrap gap-2 mt-3 justify-center">
              {[
                { label: "Salam! 👋", value: "Salam!" },
                { label: "Labas? 🤔", value: "Labas? How do I respond to this?" },
                { label: "Shukran ❤️", value: "How do I say thank you in Darija?" },
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
                  className="rounded-full px-3 py-1 text-xs h-7 hover:bg-accent/10 hover:text-accent hover:border-accent/40 transition-all"
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
