import { Badge } from "@/components/ui/badge";

interface HeroSectionProps {
  userName?: string;
  savedCount?: number;
  recommendationsCount?: number;
  onViewSaved?: () => void;
}

export default function HeroSection({
  userName,
  savedCount = 0,
  recommendationsCount = 0,
  onViewSaved,
}: HeroSectionProps) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground" data-testid="text-welcome">
          {userName ? `Welcome back, ${userName}` : "Welcome to YourScience Feed"}
        </h2>
        <p className="text-xl text-foreground/80 leading-relaxed max-w-2xl mx-auto" data-testid="text-tagline">
          Discover research that matters to you
        </p>
        
        <div className="flex flex-wrap justify-center gap-6 pt-6">
          <button 
            onClick={onViewSaved}
            disabled={savedCount === 0}
            className="text-center hover-elevate active-elevate-2 rounded-lg p-4 -m-4 transition-all disabled:cursor-not-allowed disabled:opacity-50"
            data-testid="button-view-saved"
            aria-label={savedCount > 0 ? "View saved articles" : "No saved articles yet"}
          >
            <div className="text-3xl font-bold" data-testid="text-saved-count">
              {savedCount}
            </div>
            <div className="text-sm text-muted-foreground">Articles saved</div>
          </button>
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
