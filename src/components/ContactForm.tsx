import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send, HelpCircle, Lightbulb, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";
import { useTranslation } from "react-i18next";

const contactSchema = z.object({
  inquiryType: z.enum(["question", "suggestion", "problem"], {
    required_error: "Please select an inquiry type",
  }),
  name: z.string().trim().min(1, { message: "Name is required" }).max(100, { message: "Name must be less than 100 characters" }),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  message: z.string().trim().min(1, { message: "Message is required" }).max(1000, { message: "Message must be less than 1000 characters" }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactFormProps {
  pageSource: string;
}

export const ContactForm = ({ pageSource }: ContactFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      inquiryType: "question",
      name: "",
      email: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from("contact_submissions").insert({
        inquiry_type: data.inquiryType,
        name: data.name,
        email: data.email,
        message: data.message,
        page_source: pageSource,
      });

      if (error) throw error;

      // Trigger confetti effect
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981'],
      });

      toast({
        title: t('contact.success'),
        description: t('contact.successDescription'),
      });

      form.reset();
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast({
        title: t('contact.error'),
        description: t('contact.errorDescription'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border/50 shadow-elegant bg-card/50 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/20 rounded-xl">
            <Send className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl sm:text-2xl">{t('contact.formTitle')}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {t('contact.formDescription')}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="inquiryType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>{t('contact.inquiryType')}</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="question" />
                        </FormControl>
                        <FormLabel className="flex items-center gap-2 font-normal cursor-pointer">
                          <HelpCircle className="w-4 h-4 text-primary" />
                          {t('contact.general')}
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="suggestion" />
                        </FormControl>
                        <FormLabel className="flex items-center gap-2 font-normal cursor-pointer">
                          <Lightbulb className="w-4 h-4 text-primary" />
                          {t('contact.feedback')}
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="problem" />
                        </FormControl>
                        <FormLabel className="flex items-center gap-2 font-normal cursor-pointer">
                          <AlertCircle className="w-4 h-4 text-primary" />
                          {t('contact.support')}
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('contact.name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('contact.namePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('contact.email')}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder={t('contact.emailPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => {
                const currentLength = field.value?.length || 0;
                const maxLength = 1000;
                const remaining = maxLength - currentLength;
                
                return (
                  <FormItem>
                    <FormLabel>{t('contact.message')}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t('contact.messagePlaceholder')} 
                        className="min-h-[120px] resize-none"
                        maxLength={maxLength}
                        {...field} 
                      />
                    </FormControl>
                    <div className="flex items-center justify-between">
                      <FormMessage />
                      <p className={`text-xs ${remaining < 100 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {remaining} / {maxLength} characters remaining
                      </p>
                    </div>
                  </FormItem>
                );
              }}
            />
            <Button 
              type="submit" 
              className="w-full gap-2" 
              disabled={isSubmitting}
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? t('contact.sending') : t('contact.send')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
