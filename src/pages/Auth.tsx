import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { Loader2, Languages, Mail, Phone, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Helmet } from "react-helmet-async";
import tarjamaLogo from "@/assets/tarjama-logo.png";
import { z } from "zod";
import { ZelligeCorners } from "@/components/ZelligeCorners";
import { Separator } from "@/components/ui/separator";

const emailSchema = z.string().trim().email({ message: "Invalid email address" });
const passwordSchema = z.string().min(6, { message: "Password must be at least 6 characters" });
const phoneSchema = z.string().regex(/^\+?[1-9]\d{6,14}$/, { message: "Invalid phone number (include country code)" });

declare global {
  interface Window {
    grecaptcha: any;
    onRecaptchaLoaded: () => void;
  }
}

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  
  // Email auth state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Phone auth state
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  
  // reCAPTCHA state
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaReady, setCaptchaReady] = useState(false);
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const captchaContainerRef = useRef<HTMLDivElement>(null);
  const captchaWidgetId = useRef<number | null>(null);
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
      setCheckingAuth(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Fetch reCAPTCHA site key and load script
  useEffect(() => {
    const loadCaptcha = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('verify-captcha', {
          body: { action: 'get_site_key' }
        });
        if (error || !data?.siteKey) {
          console.error('Failed to load captcha site key:', error);
          return;
        }
        setSiteKey(data.siteKey);

        // Load reCAPTCHA script
        if (!document.querySelector('script[src*="recaptcha"]')) {
          const script = document.createElement('script');
          script.src = `https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoaded&render=explicit`;
          script.async = true;
          script.defer = true;
          window.onRecaptchaLoaded = () => setCaptchaReady(true);
          document.head.appendChild(script);
        } else if (window.grecaptcha) {
          setCaptchaReady(true);
        }
      } catch (err) {
        console.error('Error loading captcha:', err);
      }
    };
    loadCaptcha();
  }, []);

  // Render reCAPTCHA widget when ready
  useEffect(() => {
    if (captchaReady && siteKey && captchaContainerRef.current && captchaWidgetId.current === null) {
      captchaWidgetId.current = window.grecaptcha.render(captchaContainerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => setCaptchaToken(token),
        'expired-callback': () => setCaptchaToken(null),
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      });
    }
  }, [captchaReady, siteKey]);

  const resetCaptcha = useCallback(() => {
    if (window.grecaptcha && captchaWidgetId.current !== null) {
      window.grecaptcha.reset(captchaWidgetId.current);
      setCaptchaToken(null);
    }
  }, []);

  const verifyCaptcha = async (): Promise<boolean> => {
    if (!captchaToken) {
      toast.error("Please complete the CAPTCHA verification");
      return false;
    }
    try {
      const { data, error } = await supabase.functions.invoke('verify-captcha', {
        body: { token: captchaToken }
      });
      if (error || !data?.success) {
        toast.error("CAPTCHA verification failed. Please try again.");
        resetCaptcha();
        return false;
      }
      return true;
    } catch {
      toast.error("CAPTCHA verification error. Please try again.");
      resetCaptcha();
      return false;
    }
  };

  const handleEmailSignIn = async () => {
    const captchaValid = await verifyCaptcha();
    if (!captchaValid) return;

    try {
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) {
        toast.error(emailResult.error.errors[0].message);
        return;
      }
      
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        toast.error(passwordResult.error.errors[0].message);
        return;
      }

      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: emailResult.data,
        password
      });

      if (error) throw error;
      toast.success("Signed in successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
      resetCaptcha();
    }
  };

  const handleEmailSignUp = async () => {
    const captchaValid = await verifyCaptcha();
    if (!captchaValid) return;

    try {
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) {
        toast.error(emailResult.error.errors[0].message);
        return;
      }
      
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        toast.error(passwordResult.error.errors[0].message);
        return;
      }

      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: emailResult.data,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("This email is already registered. Please sign in instead.");
        } else {
          throw error;
        }
        return;
      }
      
      toast.success("Account created! You can now sign in.");
      setAuthMode("signin");
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
      resetCaptcha();
    }
  };

  const handleSendOtp = async () => {
    const captchaValid = await verifyCaptcha();
    if (!captchaValid) return;

    try {
      const phoneResult = phoneSchema.safeParse(phone);
      if (!phoneResult.success) {
        toast.error(phoneResult.error.errors[0].message);
        return;
      }

      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneResult.data
      });

      if (error) throw error;
      
      setOtpSent(true);
      toast.success("OTP sent to your phone!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
      resetCaptcha();
    }
  };

  const handleVerifyOtp = async () => {
    try {
      if (otp.length !== 6) {
        toast.error("Please enter a 6-digit OTP");
        return;
      }

      setLoading(true);
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms'
      });

      if (error) throw error;
      toast.success("Phone verified successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };


  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Sign In | Tarjama - Learn Darija</title>
        <meta name="description" content="Sign in to Tarjama to save your progress and continue learning Moroccan Darija" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5 p-4">
        <ZelligeCorners size="lg" opacity={0.35} />
        <Card className="w-full max-w-md p-6 bg-card/80 backdrop-blur-sm border-border/50 shadow-elegant">
          <div className="flex flex-col items-center space-y-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src={tarjamaLogo} alt="Tarjama Logo" className="w-10 h-10" />
              <div className="flex items-center gap-2">
                <Languages className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Tarjama
                </h1>
              </div>
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-foreground">
                {authMode === "signin" ? "Welcome back!" : "Create Account"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {authMode === "signin" 
                  ? "Sign in to sync your translation history" 
                  : "Sign up to save your progress"}
              </p>
            </div>

            {/* Auth Method Tabs */}
            <Tabs value={authMethod} onValueChange={(v) => setAuthMethod(v as "email" | "phone")} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {authMode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                )}

                <Button
                  onClick={authMode === "signin" ? handleEmailSignIn : handleEmailSignUp}
                  disabled={loading}
                  className="w-full"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {authMode === "signin" ? "Sign In" : "Create Account"}
                </Button>
              </TabsContent>

              <TabsContent value="phone" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={otpSent}
                  />
                  <p className="text-xs text-muted-foreground">Include country code (e.g., +1 for US)</p>
                </div>

                {otpSent && (
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="123456"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                )}

                <Button
                  onClick={otpSent ? handleVerifyOtp : handleSendOtp}
                  disabled={loading}
                  className="w-full"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {otpSent ? "Verify Code" : "Send Code"}
                </Button>

                {otpSent && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                    }}
                    className="w-full text-muted-foreground"
                  >
                    Change phone number
                  </Button>
                )}
              </TabsContent>
            </Tabs>

            {/* reCAPTCHA Widget */}
            <div className="w-full flex flex-col items-center gap-2">
              {siteKey ? (
                <div ref={captchaContainerRef} className="flex justify-center" />
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Loading security verification...</span>
                </div>
              )}
            </div>

            {/* Google Sign In */}
            <div className="w-full flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">or</span>
              <Separator className="flex-1" />
            </div>

            <Button
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                {authMode === "signin" ? "Don't have an account? " : "Already have an account? "}
              </span>
              <Button
                variant="link"
                className="p-0 h-auto font-semibold"
                onClick={() => {
                  setAuthMode(authMode === "signin" ? "signup" : "signin");
                  setPassword("");
                  setConfirmPassword("");
                }}
              >
                {authMode === "signin" ? "Sign up" : "Sign in"}
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              Continue without signing in
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
};

export default Auth;