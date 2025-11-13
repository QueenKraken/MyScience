import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, BookmarkPlus, ExternalLink } from "lucide-react";
import heroImage from "@assets/stock_images/abstract_scientific__97927e18.jpg";

interface FeaturedArticle {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  category: string;
  externalUrl?: string;
}

interface HeroSectionProps {
  userName?: string;
  savedCount?: number;
  recommendationsCount?: number;
  featuredArticle?: FeaturedArticle;
  onViewSaved?: () => void;
  onSaveFeatured?: () => void;
  onReadFeatured?: () => void;
}

export default function HeroSection({
  userName,
  savedCount = 0,
  recommendationsCount = 0,
  featuredArticle,
  onViewSaved,
  onSaveFeatured,
  onReadFeatured,
}: HeroSectionProps) {
  // Default featured article if none provided
  const article = featuredArticle || {
    id: "default-featured",
    title: "CRISPR-Cas9 gene editing in human embryos: Ethical considerations and future directions",
    authors: ["Zhang, Y.", "Liu, H.", "Chen, M."],
    journal: "Nature Biotechnology",
    category: "Gene Editing",
  };

  return (
    <section 
      className="relative min-h-[80vh] flex items-end overflow-hidden"
      data-testid="section-hero"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
        aria-hidden="true"
      />
      
      {/* Gradient Overlay - from transparent to black */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"
        aria-hidden="true"
      />
      
      {/* Content - positioned in lower-third */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 pb-20 pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-end">
          {/* Left: Featured Article */}
          <div className="lg:col-span-3 space-y-6">
            {/* Category Badge */}
            <Badge 
              variant="secondary" 
              className="backdrop-blur-md bg-background/30 border-background/50 text-foreground"
              data-testid="badge-category"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              {article.category}
            </Badge>
            
            {/* Featured Article Title */}
            <h1 
              className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight"
              data-testid="text-hero-headline"
            >
              {article.title}
            </h1>
            
            {/* Article Metadata */}
            <div className="flex flex-wrap gap-2 text-sm text-white/80">
              <span>{article.authors.join(", ")}</span>
              <span>•</span>
              <span className="font-medium">{article.journal}</span>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 pt-4">
              <Button
                size="lg"
                onClick={onSaveFeatured}
                className="backdrop-blur-md"
                data-testid="button-save-featured"
              >
                <BookmarkPlus className="w-4 h-4 mr-2" />
                Save Article
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                onClick={onReadFeatured}
                className="backdrop-blur-md bg-white/10 border-white/30 text-white"
                data-testid="button-read-featured"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Read Now
              </Button>
            </div>
          </div>
          
          {/* Right: User Stats & Navigation */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personalized Greeting */}
            <div className="text-white space-y-2">
              <h2 className="text-2xl font-bold" data-testid="text-welcome">
                {userName ? `Welcome back, ${userName}` : "Welcome to MyScience"}
              </h2>
              <p className="text-white/80">
                Your personalized research discovery feed
              </p>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="backdrop-blur-md bg-background/20 border border-white/20 rounded-lg p-4">
                <div className="text-3xl font-bold text-white" data-testid="text-saved-count">
                  {savedCount}
                </div>
                <div className="text-sm text-white/70">Saved</div>
              </div>
              
              <div className="backdrop-blur-md bg-background/20 border border-white/20 rounded-lg p-4">
                <div className="text-3xl font-bold text-white" data-testid="text-recommendations-count">
                  {recommendationsCount}
                </div>
                <div className="text-sm text-white/70">New</div>
              </div>
            </div>
            
            {/* Main CTA */}
            <Button
              size="lg"
              onClick={onViewSaved}
              disabled={savedCount === 0}
              variant="secondary"
              className="w-full backdrop-blur-md"
              data-testid="button-view-saved"
            >
              View Saved Articles
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Bottom Fade for smooth transition */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none"
        aria-hidden="true"
      />
    </section>
  );
}
