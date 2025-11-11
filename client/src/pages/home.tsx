import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import HeroSection from "@/components/HeroSection";
import ArticleCard from "@/components/ArticleCard";
import EmptyState from "@/components/EmptyState";
import { TopicsWidget, RecentActivityWidget } from "@/components/SidebarWidget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function HomePage() {
  // todo: remove mock functionality
  const [hasConnectedOrcid, setHasConnectedOrcid] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get return URL from query params (simulated for prototype)
  const urlParams = new URLSearchParams(window.location.search);
  const returnUrl = urlParams.get("return") || undefined;
  const returnSite = urlParams.get("site") || "original site";

  // todo: remove mock functionality
  const mockArticles = [
    {
      title: "CRISPR-Cas9 gene editing in human embryos: Ethical considerations and future directions",
      authors: ["Zhang, Y.", "Liu, H.", "Chen, M."],
      journal: "Nature Biotechnology",
      date: "Nov 2025",
      abstract: "Recent advances in CRISPR-Cas9 technology have opened new possibilities for treating genetic diseases. This study examines the ethical implications and regulatory frameworks necessary for responsible application of gene editing in human embryos, with particular attention to germline modifications and their long-term consequences.",
      tags: ["Gene Editing", "Ethics", "CRISPR"],
    },
    {
      title: "Machine learning approaches to protein structure prediction: A comparative analysis",
      authors: ["Anderson, K.", "Patel, R.", "Johnson, S."],
      journal: "Science",
      date: "Nov 2025",
      abstract: "We present a comprehensive comparison of recent machine learning approaches for protein structure prediction, including AlphaFold2 and RoseTTAFold. Our analysis demonstrates significant improvements in accuracy and computational efficiency, with implications for drug discovery and understanding protein function.",
      tags: ["Machine Learning", "Protein Structure", "Computational Biology"],
    },
    {
      title: "Climate tipping points: Assessing the risk of irreversible changes in Earth systems",
      authors: ["Thompson, M.", "Garcia, L.", "Williams, J."],
      journal: "Nature Climate Change",
      date: "Oct 2025",
      abstract: "This comprehensive review examines current evidence for climate tipping points and their potential cascading effects on global ecosystems. We identify critical thresholds in the Amazon rainforest, Arctic ice sheets, and ocean circulation patterns that require immediate attention from policymakers.",
      tags: ["Climate Change", "Tipping Points", "Earth Systems"],
    },
  ];

  // todo: remove mock functionality
  const mockTopics = [
    { name: "Gene Editing", count: 23 },
    { name: "Climate Science", count: 18 },
    { name: "Neuroscience", count: 15 },
    { name: "Quantum Computing", count: 12 },
    { name: "Immunology", count: 9 },
  ];

  // todo: remove mock functionality
  const mockActivities = [
    { action: "Saved article on CRISPR", time: "2 hours ago" },
    { action: "Viewed paper on climate models", time: "5 hours ago" },
    { action: "Connected ORCID", time: "Yesterday" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader returnUrl={returnUrl} returnSiteName={returnSite} />
      
      <main>
        <HeroSection 
          userName="Dr. Smith"
          savedCount={42}
          recommendationsCount={mockArticles.length}
        />

        <div className="max-w-7xl mx-auto px-6 pb-12">
          {hasConnectedOrcid ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>

                <div className="space-y-6">
                  {mockArticles.map((article, idx) => (
                    <ArticleCard
                      key={idx}
                      {...article}
                      onSave={() => console.log("Saved article:", article.title)}
                      onView={() => console.log("View article:", article.title)}
                    />
                  ))}
                </div>
              </div>

              <aside className="space-y-6">
                <TopicsWidget 
                  topics={mockTopics}
                  onTopicClick={(topic) => console.log("Filter by topic:", topic)}
                />
                <RecentActivityWidget activities={mockActivities} />
              </aside>
            </div>
          ) : (
            <EmptyState
              title="No recommendations yet"
              description="Connect your ORCID to get personalized research recommendations tailored to your interests and reading history."
              actionLabel="Connect ORCID"
              onAction={() => {
                console.log("Connect ORCID clicked");
                setHasConnectedOrcid(true);
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}
