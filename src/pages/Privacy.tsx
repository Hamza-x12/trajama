import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ZelligeCorners } from "@/components/ZelligeCorners";
import tarjamaLogo from "@/assets/tarjama-logo.png";

const Privacy = () => {
  const lastUpdated = "March 4, 2026";

  return (
    <>
      <Helmet>
        <title>Privacy Policy - Tarjama Darija Translator</title>
        <meta name="description" content="Privacy Policy for Tarjama Darija Translator. Learn how we collect, use, and protect your information." />
        <link rel="canonical" href="https://trajama.lovable.app/privacy" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img src={tarjamaLogo} alt="Tarjama" className="w-8 h-8" />
              <span className="font-bold text-lg">Tarjama</span>
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to home
            </Button>
          </Link>

          <Card className="relative overflow-hidden">
            <ZelligeCorners />
            <CardContent className="p-6 md:p-10 space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
                <p className="text-muted-foreground text-sm">Last updated: {lastUpdated}</p>
              </div>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Welcome to Tarjama ("we," "our," or "us"). Tarjama is a Darija (Moroccan Arabic) translation web application available at <a href="https://trajama.lovable.app" className="text-primary underline">trajama.lovable.app</a>. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">2. Information We Collect</h2>
                <h3 className="text-lg font-medium mt-4">2.1 Information you provide</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                  <li><strong>Account information:</strong> When you sign up or sign in (including via Google), we receive your name, email address, and profile picture.</li>
                  <li><strong>Translation content:</strong> Text, images, or audio you submit for translation.</li>
                  <li><strong>Contact form submissions:</strong> Your name, email, and message when you contact us.</li>
                </ul>
                <h3 className="text-lg font-medium mt-4">2.2 Information collected automatically</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                  <li><strong>Usage data:</strong> Pages visited, features used, and interaction patterns.</li>
                  <li><strong>Device data:</strong> Browser type, operating system, and device identifiers.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">3. How We Use Your Information</h2>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                  <li>Provide, maintain, and improve our translation services.</li>
                  <li>Authenticate your identity and manage your account.</li>
                  <li>Save your translation history and learning progress.</li>
                  <li>Respond to your inquiries and support requests.</li>
                  <li>Analyze usage to improve the user experience.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">4. Google User Data</h2>
                <p className="text-muted-foreground leading-relaxed">
                  When you sign in with Google, we access your basic profile information (name, email, and profile picture) solely for authentication purposes. We do not request access to any other Google services or data. We do not share your Google user data with third parties except as necessary to provide the service (e.g., authentication infrastructure).
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">5. Data Sharing and Disclosure</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We do not sell your personal information. We may share information with:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                  <li><strong>Service providers:</strong> Third-party services that help us operate (e.g., hosting, AI translation processing). These providers are contractually bound to protect your data.</li>
                  <li><strong>Legal requirements:</strong> When required by law or to protect our rights.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">6. Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement industry-standard security measures to protect your information, including encryption in transit (HTTPS) and at rest. However, no method of electronic transmission or storage is 100% secure.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">7. Data Retention</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We retain your account information and translation history for as long as your account is active. You can delete your translation history at any time through the app. If you wish to delete your account entirely, please contact us.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">8. Your Rights</h2>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                  <li>Access, correct, or delete your personal data.</li>
                  <li>Export your translation history.</li>
                  <li>Withdraw consent for data processing at any time.</li>
                  <li>Request information about how your data is used.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">9. Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our service is not directed to children under 13. We do not knowingly collect personal information from children under 13.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">10. Changes to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-xl font-semibold">11. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have questions about this Privacy Policy, please <Link to="/contact" className="text-primary underline">contact us</Link>.
                </p>
              </section>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
};

export default Privacy;
