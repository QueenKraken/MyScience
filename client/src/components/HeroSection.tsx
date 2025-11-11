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
        <h2 className="font-serif text-4xl md:text-5xl font-bold" data-testid="text-welcome">
          {userName ? `Welcome back, ${userName}` : "Welcome to Your Research Feed"}
        </h2>
        <p className="text-xl text-muted-foreground leading-relaxed" data-testid="text-tagline">
          Your personalized research feed
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
