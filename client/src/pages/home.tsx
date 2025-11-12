import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AppHeader from "@/components/AppHeader";
import HeroSection from "@/components/HeroSection";
import ArticleCard from "@/components/ArticleCard";
import EmptyState from "@/components/EmptyState";
import { TopicsWidget, RecentActivityWidget } from "@/components/SidebarWidget";
import { ResearcherProfileCard } from "@/components/ResearcherProfileCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, BookMarked as BookMarkedIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { User, SavedArticle } from "@shared/schema";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const { toast } = useToast();
  const { user, isLoading: isLoadingAuth } = useAuth();
  
  // Get URL parameters for return navigation
  const urlParams = new URLSearchParams(window.location.search);
  const returnUrl = urlParams.get("return") || undefined;
  const returnSite = urlParams.get("site") || "original site";

  // Fetch saved articles
  const { data: savedArticles = [], isLoading: isLoadingSaved } = useQuery<SavedArticle[]>({
    queryKey: ['/api/saved-articles'],
    enabled: !!user,
  });

  // Save article mutation
  const saveArticleMutation = useMutation({
    mutationFn: async (article: any) => {
      const response = await fetch('/api/saved-articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: article.title,
          authors: article.authors,
          journal: article.journal,
          publicationDate: article.publicationDate,
          abstract: article.abstract,
          tags: article.tags,
          externalUrl: article.externalUrl,
        }),
      });
      if (!response.ok) throw new Error('Failed to save article');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Article saved",
        description: "Added to your saved articles",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/saved-articles'] });
    },
    onError: () => {
      toast({
        title: "Failed to save article",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  // todo: remove mock functionality - these would come from recommendation API
  const mockArticles = [
    {
      id: "mock-1",
      title: "CRISPR-Cas9 gene editing in human embryos: Ethical considerations and future directions",
      authors: ["Zhang, Y.", "Liu, H.", "Chen, M."],
      journal: "Nature Biotechnology",
      date: "Nov 2025",
      abstract: "Recent advances in CRISPR-Cas9 technology have opened new possibilities for treating genetic diseases. This study examines the ethical implications and regulatory frameworks necessary for responsible application of gene editing in human embryos, with particular attention to germline modifications and their long-term consequences.",
      tags: ["Gene Editing", "Ethics", "CRISPR"],
      publicationDate: "2025-11",
      externalUrl: "https://example.com/article/crispr-embryos",
    },
    {
      id: "mock-2",
      title: "Machine learning approaches to protein structure prediction: A comparative analysis",
      authors: ["Anderson, K.", "Patel, R.", "Johnson, S."],
      journal: "Science",
      date: "Nov 2025",
      abstract: "We present a comprehensive comparison of recent machine learning approaches for protein structure prediction, including AlphaFold2 and RoseTTAFold. Our analysis demonstrates significant improvements in accuracy and computational efficiency, with implications for drug discovery and understanding protein function.",
      tags: ["Machine Learning", "Protein Structure", "Computational Biology"],
      publicationDate: "2025-11",
      externalUrl: "https://example.com/article/protein-ml",
    },
    {
      id: "mock-3",
      title: "Climate tipping points: Assessing the risk of irreversible changes in Earth systems",
      authors: ["Thompson, M.", "Garcia, L.", "Williams, J."],
      journal: "Nature Climate Change",
      date: "Oct 2025",
      abstract: "This comprehensive review examines current evidence for climate tipping points and their potential cascading effects on global ecosystems. We identify critical thresholds in the Amazon rainforest, Arctic ice sheets, and ocean circulation patterns that require immediate attention from policymakers.",
      tags: ["Climate Change", "Tipping Points", "Earth Systems"],
      publicationDate: "2025-10",
      externalUrl: "https://example.com/article/climate-tipping",
    },
  ];

  // todo: remove mock functionality - topics aligned with actual article tags
  const mockTopics = [
    { name: "Gene Editing", count: 23 },
    { name: "Climate Change", count: 18 },
    { name: "Machine Learning", count: 15 },
    { name: "CRISPR", count: 12 },
    { name: "Ethics", count: 9 },
  ];

  // todo: remove mock functionality
  const mockActivities = [
    { action: "Saved article on CRISPR", time: "2 hours ago" },
    { action: "Viewed paper on climate models", time: "5 hours ago" },
    { action: "Connected ORCID", time: "Yesterday" },
  ];

  const hasConnectedOrcid = !!user?.orcid;
  // Show content if user has ORCID, saved articles, OR if we have recommendations to show
  const showContent = hasConnectedOrcid || savedArticles.length > 0 || mockArticles.length > 0;

  const handleSaveArticle = (article: any) => {
    saveArticleMutation.mutate({
      title: article.title,
      authors: article.authors,
      journal: article.journal,
      publicationDate: article.publicationDate,
      abstract: article.abstract,
      tags: article.tags,
      externalUrl: article.externalUrl,
    });
  };

  // Combine saved articles with mock recommendations (todo: replace with real recommendations API)
  // Deduplicate: exclude mock articles that are already saved (match by title)
  const savedTitles = new Set(savedArticles.map(a => a.title));
  const uniqueMockArticles = mockArticles.filter(mock => !savedTitles.has(mock.title));
  
  const displayArticles = showContent ? [
    // Show saved articles first
    ...savedArticles.map(saved => ({
      id: saved.id,
      title: saved.title,
      authors: saved.authors,
      journal: saved.journal,
      date: saved.publicationDate,
      abstract: saved.abstract,
      tags: saved.tags || [],
      publicationDate: saved.publicationDate,
      externalUrl: saved.externalUrl || undefined,
      isSaved: true,
    })),
    // Then show unique mock recommendations (not already saved)
    ...uniqueMockArticles.map(mock => ({
      ...mock,
      isSaved: false,
    })),
  ] : [];

  // Filter by search query, selected topics, and saved-only view
  const filteredArticles = displayArticles.filter(article => {
    // Filter by saved-only view
    if (showSavedOnly && !article.isSaved) {
      return false;
    }

    // Filter by search query
    const matchesSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by selected topics (if any topics are selected)
    const matchesTopics = selectedTopics.length === 0 || 
      article.tags.some(tag => selectedTopics.includes(tag));
    
    return matchesSearch && matchesTopics;
  });

  // Toggle topic filter
  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader returnUrl={returnUrl} returnSiteName={returnSite} />
      
      <main>
        <HeroSection 
          userName={user?.firstName || undefined}
          savedCount={savedArticles.length}
          recommendationsCount={mockArticles.length}
          onViewSaved={() => setShowSavedOnly(true)}
        />

        <div className="max-w-7xl mx-auto px-6 pb-12">
          {isLoadingAuth || isLoadingSaved ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-6">
                <Skeleton className="h-10 w-full" />
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
              <aside className="space-y-6">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
              </aside>
            </div>
          ) : showContent ? (
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

                {/* Saved Articles Filter Indicator */}
                {showSavedOnly && (
                  <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-lg" data-testid="filter-saved-only-banner">
                    <div className="flex items-center gap-2">
                      <BookMarkedIcon className="w-4 h-4 text-primary" aria-hidden="true" />
                      <span className="font-medium text-sm">Showing saved articles only</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSavedOnly(false)}
                      data-testid="button-clear-saved-filter"
                    >
                      Show all articles
                    </Button>
                  </div>
                )}

                {/* For You Section - Spotify style */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-2xl font-bold" data-testid="heading-for-you">
                      {showSavedOnly ? "Your Saved Articles" : "For You"}
                    </h2>
                    {selectedTopics.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTopics([])}
                        data-testid="button-clear-filters"
                      >
                        Clear filters
                      </Button>
                    )}
                  </div>

                  {/* Topic Filter Pills */}
                  <div className="flex flex-wrap gap-2" data-testid="container-topic-filters">
                    {mockTopics.map((topic) => (
                      <Badge
                        key={topic.name}
                        variant={selectedTopics.includes(topic.name) ? "default" : "secondary"}
                        className="cursor-pointer hover-elevate active-elevate-2 transition-all"
                        onClick={() => toggleTopic(topic.name)}
                        data-testid={`filter-topic-${topic.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {topic.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {filteredArticles.length > 0 ? (
                  <div className="space-y-6">
                    {filteredArticles.map((article) => (
                      <ArticleCard
                        key={article.id}
                        title={article.title}
                        authors={article.authors}
                        journal={article.journal}
                        date={article.date}
                        abstract={article.abstract}
                        tags={article.tags}
                        externalUrl={article.externalUrl}
                        isSaved={article.isSaved}
                        onSave={() => !article.isSaved && handleSaveArticle(article)}
                        onView={() => console.log("View article:", article.title)}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title={showSavedOnly ? "No saved articles yet" : "No articles found"}
                    description={
                      showSavedOnly
                        ? "Start saving articles you're interested in, and they'll appear here for easy access."
                        : selectedTopics.length > 0
                        ? `No articles match the selected topics. Try different filters.`
                        : searchQuery
                        ? `No articles match "${searchQuery}". Try a different search term.`
                        : "No articles available."
                    }
                  />
                )}
              </div>

              <aside className="space-y-6">
                <ResearcherProfileCard
                  userName={user?.firstName ?? null}
                  userEmail={user?.email || undefined}
                  avatarUrl={user?.profileImageUrl || undefined}
                  savedCount={savedArticles.length}
                  readThisWeek={savedArticles.length}
                  topTopics={mockTopics.slice(0, 3).map(t => t.name)}
                  onViewSaved={() => setShowSavedOnly(true)}
                />
                <TopicsWidget 
                  topics={mockTopics}
                  onTopicClick={(topic) => console.log("Filter by topic:", topic)}
                />
                <RecentActivityWidget activities={mockActivities} />
              </aside>
            </div>
          ) : (
            <EmptyState
              title="Welcome to MyScience!"
              description="Start by saving articles you're interested in. Your personalized feed will grow as you engage with research."
              actionLabel="Connect ORCID (Coming Soon)"
              onAction={() => {
                console.log("Connect ORCID clicked - todo: implement ORCID OAuth");
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}
