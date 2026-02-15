import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, Send, User, 
  MessageSquarePlus, Loader2, Copy, Check, Settings2, Volume2, VolumeX,
  GraduationCap, MessageCircle, Sparkles
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
import { Textarea } from "@/components/ui/textarea";
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
  const [showWelcome, setShowWelcome] = useState(false);
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
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Get Darija script preference
  const [darijaScript, setDarijaScript] = useState<'latin' | 'arabic' | 'both'>(() => {
    const saved = localStorage.getItem('sahbiDarijaScript');
    return (saved as 'latin' | 'arabic' | 'both') || 'both';
  });
  
  // Translation in response toggle
  const [includeTranslation, setIncludeTranslation] = useState<boolean>(() => {
    const saved = localStorage.getItem('sahbiIncludeTranslation');
    return saved !== 'false';
  });

  // Sahbi mode: 'learn' or 'chat'
  const [sahbiMode, setSahbiMode] = useState<'learn' | 'chat'>(() => {
    const saved = localStorage.getItem('sahbiMode');
    return (saved as 'learn' | 'chat') || 'learn';
  });

  // Welcome animation on first load or login
  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('sahbiWelcomeSeen');
    if (!hasSeenWelcome && !isLoadingConversations) {
      setShowWelcome(true);
      sessionStorage.setItem('sahbiWelcomeSeen', 'true');
      const timer = setTimeout(() => setShowWelcome(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [isLoadingConversations]);

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
    
    if (sahbiMode === 'learn') {
      instruction = "MODE: You are in LEARNING mode. Focus on teaching Darija language. Explain vocabulary, grammar, pronunciation, and cultural context. Provide examples and encourage practice. Be educational but friendly.\n\n";
    } else {
      instruction = "MODE: You are in CHAT mode. Respond DIRECTLY and NATURALLY in Darija only - like a real Moroccan friend chatting. DO NOT teach, explain, or give language lessons. DO NOT add translations. Just have a normal conversation in Darija. Answer any question directly without making it a language lesson. Be casual, natural, and friendly.\n\n";
    }
    
    if (darijaScript === 'latin') {
      instruction += "SCRIPT: Respond ONLY in Latin script Darija (like 'Salam', 'Labas', 'Wakha'). Do NOT include Arabic script.";
    } else if (darijaScript === 'arabic') {
      instruction += "SCRIPT: Respond ONLY in Arabic script Darija (like 'سلام', 'لاباس', 'واخا'). Do NOT include Latin script.";
    } else {
      instruction += "SCRIPT: Format your responses with both Latin and Arabic script sections clearly labeled.";
    }
    
    if (sahbiMode === 'learn' && includeTranslation) {
      instruction += "\n\nTRANSLATION: After your Darija response, add a clear '📖 Translation:' section with the English meaning. Keep it concise but helpful for learners.";
    } else if (sahbiMode === 'learn') {
      instruction += "\n\nTRANSLATION: Do NOT include English translations unless explicitly asked. The user wants to practice immersively.";
    } else {
      instruction += "\n\nTRANSLATION: NEVER include translations. Respond purely in Darija. This is a natural conversation, not a lesson.";
    }
    
    instruction += "\n\nFORMAT: Keep responses clear and natural. Be conversational and friendly, not formal.";
    
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

      // Get user's session token for authenticated requests
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession?.access_token) {
        toast.error("Please sign in to use Sahbi chat");
        setIsStreaming(false);
        return;
      }

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentSession.access_token}`,
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
          <strong key={idx} className="font-semibold text-foreground">
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

  const handleModeChange = (mode: 'learn' | 'chat') => {
    setSahbiMode(mode);
    localStorage.setItem('sahbiMode', mode);
  };

  // Empty state - show centered welcome
  const showEmptyState = messages.length <= 1 && !isStreaming;

  // Show sign-in prompt for unauthenticated users
  if (!user) {
    return (
      <>
        <Helmet>
          <title>{t('sahbi.pageTitle')} - Tarjama</title>
          <meta name="description" content={t('sahbi.pageDescription')} />
        </Helmet>
        <div className="h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="relative inline-block">
              <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-moroccan-red/15 via-moroccan-gold/20 to-moroccan-green/15 blur-2xl" />
              <img src={sahbiLogo} alt="Sahbi" className="w-24 h-24 rounded-full relative z-10 ring-2 ring-moroccan-gold/30" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Sign in to chat with Sahbi</h1>
            <p className="text-muted-foreground">
              Sahbi is your Darija learning companion. Sign in to start practicing Moroccan Arabic! 🇲🇦
            </p>
            <div className="flex flex-col gap-3 items-center">
              <Link to="/auth">
                <Button size="lg" className="bg-moroccan-red hover:bg-moroccan-red/90 text-white px-8">
                  Sign In
                </Button>
              </Link>
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                <span className="flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> Back to home</span>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('sahbi.pageTitle')} - Tarjama</title>
        <meta name="description" content={t('sahbi.pageDescription')} />
      </Helmet>

      {/* Welcome Animation Overlay */}
      {showWelcome && (
        <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center animate-welcome-fade-out">
          {/* Layered morphing background orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-moroccan-red/8 via-transparent to-moroccan-green/8 blur-3xl animate-[spin_8s_linear_infinite]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-moroccan-gold/12 via-moroccan-red/6 to-transparent blur-3xl animate-welcome-glow" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] rounded-full bg-gradient-to-bl from-moroccan-green/10 to-moroccan-gold/8 blur-2xl animate-welcome-glow" style={{ animationDelay: '0.4s' }} />
          </div>
          
          {/* Orbiting dots */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            {[...Array(12)].map((_, i) => (
              <span
                key={i}
                className="absolute rounded-full animate-float-particle"
                style={{
                  width: `${4 + (i % 3) * 2}px`,
                  height: `${4 + (i % 3) * 2}px`,
                  background: i % 3 === 0 ? '#c1272d' : i % 3 === 1 ? '#006233' : '#d4a017',
                  opacity: 0.7,
                  animationDelay: `${i * 0.12}s`,
                  animationDuration: `${1.2 + (i % 4) * 0.3}s`,
                  left: `${Math.cos((i * Math.PI * 2) / 12) * 80}px`,
                  top: `${Math.sin((i * Math.PI * 2) / 12) * 80}px`,
                }}
              />
            ))}
          </div>

          <div className="text-center space-y-8 relative z-10">
            {/* Logo with layered glow rings */}
            <div className="relative inline-block">
              <div className="absolute -inset-10 rounded-full bg-gradient-to-r from-moroccan-red/15 via-moroccan-gold/20 to-moroccan-green/15 blur-3xl animate-welcome-glow" />
              <div className="absolute -inset-5 rounded-full border border-moroccan-gold/20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
              <div className="absolute -inset-3 rounded-full border border-moroccan-red/15 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: '0.5s' }} />
              <img 
                src={sahbiLogo} 
                alt="Sahbi" 
                className="w-32 h-32 mx-auto animate-welcome-logo drop-shadow-[0_0_30px_rgba(212,160,23,0.3)] relative z-10"
              />
            </div>

            {/* Text with staggered wave animation */}
            <div className="space-y-4">
              <h1 className="text-5xl font-bold animate-welcome-text" style={{ animationDelay: '0.3s', opacity: 0 }}>
                <span className="bg-gradient-to-r from-moroccan-red via-moroccan-gold to-moroccan-green bg-clip-text text-transparent bg-[length:200%_100%] animate-[gradient-shift_3s_ease_infinite]">
                  {userName ? `Merhba, ${userName}!` : 'Merhba!'}
                </span>
              </h1>
              <p className="text-lg text-muted-foreground/80 animate-welcome-text font-medium tracking-wide" style={{ animationDelay: '0.55s', opacity: 0 }}>
                {t('sahbi.welcomeMessage') || "Ready to learn Darija?"}
              </p>
              <div className="flex items-center justify-center gap-3 animate-welcome-text" style={{ animationDelay: '0.75s', opacity: 0 }}>
                <span className="text-2xl">🇲🇦</span>
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <Sparkles key={i} className="h-4 w-4 text-moroccan-gold animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
                <span className="text-2xl">🇲🇦</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-background flex flex-col">
        {/* Minimal Header */}
        <header className="border-b border-border/30 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Left - Back + Logo */}
              <div className="flex items-center gap-3">
                <Link 
                  to="/" 
                  className="text-muted-foreground hover:text-foreground transition-colors p-1.5 -ml-1.5 rounded-lg hover:bg-muted/50"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex items-center gap-2">
                  <img src={sahbiLogo} alt="Sahbi" className="w-7 h-7" />
                  <span className="font-semibold text-foreground">Sahbi</span>
                </div>
              </div>
              
              {/* Right - Actions */}
              <div className="flex items-center gap-1">
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
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
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
                      className="h-9 w-9 text-muted-foreground hover:text-foreground"
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

        {/* Main Content */}
        <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
          {/* Messages Area */}
          <ScrollArea 
            ref={scrollRef} 
            className="flex-1 px-4"
          >
            <div className="py-6 space-y-6">
              {isLoadingConversations ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : showEmptyState ? (
                /* Gemini-style centered welcome */
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-8 animate-in fade-in duration-500">
                  <div className="space-y-4">
                    <div className="relative inline-block">
                      <img src={sahbiLogo} alt="Sahbi" className="w-16 h-16 mx-auto" />
                      <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-moroccan-gold animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-semibold text-foreground">
                      {userName ? `Salam, ${userName}!` : 'Salam!'}
                    </h2>
                    <p className="text-muted-foreground max-w-sm">
                      {sahbiMode === 'learn' 
                        ? (t('sahbi.learnWelcome') || "I'm here to help you learn Moroccan Darija. Ask me anything!")
                        : (t('sahbi.chatWelcome') || "Let's chat! Ask me anything or just have a conversation.")}
                    </p>
                  </div>
                  
                  {/* Suggestion chips */}
                  <div className="flex flex-wrap gap-2 justify-center max-w-md">
                    {[
                      { label: "How do I greet someone?", icon: "👋" },
                      { label: "Teach me numbers", icon: "🔢" },
                      { label: "Common phrases", icon: "💬" },
                    ].map((suggestion) => (
                      <button
                        key={suggestion.label}
                        onClick={() => {
                          setInput(suggestion.label);
                          inputRef.current?.focus();
                        }}
                        className="px-4 py-2.5 rounded-full border border-border/60 bg-background hover:bg-muted/50 hover:border-border transition-all text-sm text-foreground flex items-center gap-2"
                      >
                        <span>{suggestion.icon}</span>
                        <span>{suggestion.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <div
                      key={msg.id || i}
                      className={cn(
                        "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                        msg.role === "user" ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      {/* Avatar */}
                      {msg.role === "assistant" ? (
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={sahbiLogo} className="object-contain" />
                          <AvatarFallback className="bg-muted text-xs">S</AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-8 w-8 shrink-0 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      
                      {/* Message Content */}
                      <div
                        className={cn(
                          "group/message max-w-[85%] space-y-1",
                          msg.role === "user" ? "flex flex-col items-end" : ""
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-3",
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted/60"
                          )}
                        >
                          <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
                            {renderMessageContent(msg.content)}
                          </div>
                        </div>
                        
                        {/* Message Actions */}
                        <div className={cn(
                          "flex items-center gap-1 opacity-0 group-hover/message:opacity-100 transition-opacity",
                          msg.role === "user" ? "flex-row-reverse" : ""
                        )}>
                          <span className="text-[11px] text-muted-foreground px-1">
                            {formatTime(msg.timestamp)}
                          </span>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(msg.content, msg.id || String(i))}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          >
                            {copiedId === (msg.id || String(i)) ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          
                          {msg.role === "assistant" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => speakText(msg.content)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            >
                              {isSpeaking ? (
                                <VolumeX className="h-3.5 w-3.5" />
                              ) : (
                                <Volume2 className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing indicator */}
                  {isStreaming && messages[messages.length - 1]?.role === "user" && (
                    <div className="flex gap-3 animate-in fade-in">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={sahbiLogo} className="object-contain" />
                        <AvatarFallback className="bg-muted text-xs">S</AvatarFallback>
                      </Avatar>
                      <div className="bg-muted/60 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>

          {/* Input Area - ChatGPT/Gemini style */}
          <div className="p-4 pb-6">
            <div className="max-w-3xl mx-auto space-y-3">
              {/* Input container */}
              <div className="relative">
                <div className="flex items-end gap-2 p-2 rounded-2xl border border-border/60 bg-muted/30 focus-within:border-border focus-within:bg-background transition-all shadow-sm">
                  <Textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={sahbiMode === 'learn' 
                      ? (t('sahbi.learnPlaceholder') || "Ask me anything about Darija...")
                      : (t('sahbi.chatPlaceholder') || "Message Sahbi...")}
                    className="flex-1 min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent p-2 text-[15px] placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0"
                    disabled={isStreaming || !currentConversation}
                    rows={1}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isStreaming || !currentConversation}
                    size="icon"
                    className="h-10 w-10 rounded-xl shrink-0 bg-foreground hover:bg-foreground/90 text-background disabled:opacity-30"
                  >
                    {isStreaming ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Mode toggle - clean pill style */}
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center gap-1 p-1 rounded-full bg-muted/50 border border-border/40">
                  <button
                    onClick={() => handleModeChange('learn')}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                      sahbiMode === 'learn' 
                        ? "bg-background text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>{t('sahbi.learnMode') || 'Learn'}</span>
                  </button>
                  <button
                    onClick={() => handleModeChange('chat')}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                      sahbiMode === 'chat' 
                        ? "bg-background text-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>{t('sahbi.chatMode') || 'Chat'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Sahbi;
