import { Badge } from "@/components/ui/badge";

interface HeroSectionProps {
  userName?: string;
  savedCount?: number;
  recommendationsCount?: number;
}

export default function HeroSection({
  userName,
  savedCount = 0,
  recommendationsCount = 0,
}: HeroSectionProps) {
  return (
    <section className="py-12 px-6">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <h2 className="font-serif text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent" data-testid="text-welcome">
          {userName ? `Welcome back, ${userName}` : "Welcome to Your Research Feed"}
        </h2>
        <p className="text-xl text-foreground/80 leading-relaxed" data-testid="text-tagline">
          Discover research that matters to you
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <div className="text-center">
            <div className="text-3xl font-bold" data-testid="text-saved-count">
              {savedCount}
            </div>
            <div className="text-sm text-muted-foreground">Articles saved</div>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <div className="text-3xl font-bold" data-testid="text-recommendations-count">
              {recommendationsCount}
            </div>
            <div className="text-sm text-muted-foreground">New recommendations</div>
          </div>
        </div>
      </div>
    </section>
  );
}
