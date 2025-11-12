import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, BookOpen, Users, Zap } from "lucide-react";
import AppHeader from "@/components/AppHeader";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-heading font-bold">
            Your personalized research discovery platform
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            MyScience is Netflix for Science. Discover cutting-edge research tailored to your interests, 
            save articles for later, and connect with the scientific community.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleLogin}
              data-testid="button-get-started"
            >
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="p-6 space-y-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-heading font-semibold">Personalized Discovery</h3>
            <p className="text-muted-foreground">
              Get article recommendations tailored to your research interests and subject areas.
            </p>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-heading font-semibold">Save & Organize</h3>
            <p className="text-muted-foreground">
              Build your personal research library with easy saving and organization tools.
            </p>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-heading font-semibold">Connect with Researchers</h3>
            <p className="text-muted-foreground">
              Link your ORCID and Sciety profiles to showcase your work and connect with peers.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 mb-16">
        <Card className="p-12 text-center space-y-6 max-w-3xl mx-auto bg-gradient-to-br from-primary/5 to-accent/5">
          <Zap className="h-12 w-12 text-primary mx-auto" />
          <h3 className="text-3xl font-heading font-bold">
            Ready to transform your research discovery?
          </h3>
          <p className="text-lg text-muted-foreground">
            Join MyScience and start exploring research that matters to you.
          </p>
          <Button 
            size="lg" 
            onClick={handleLogin}
            data-testid="button-cta-login"
          >
            Sign In to Get Started
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>MyScience &copy; 2025 - A Netflix for Science</p>
        </div>
      </footer>
    </div>
  );
}
