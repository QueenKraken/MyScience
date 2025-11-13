import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AppHeader from "@/components/AppHeader";
import HeroSection from "@/components/HeroSection";
import ArticleCard from "@/components/ArticleCard";
import { HorizontalCarousel } from "@/components/HorizontalCarousel";
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

// Format timestamp to relative time (e.g., "2 hours ago")
function formatActivityTime(timestamp: string | null | undefined): string {
  if (!timestamp) return "Recently";
  
  const now = new Date();
  const activityTime = new Date(timestamp);
  const diffMs = now.getTime() - activityTime.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return activityTime.toLocaleDateString();
}

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

  // Fetch real activity feed
  const { data: activities = [] } = useQuery<any[]>({
    queryKey: ['/api/activity-feed'],
    enabled: !!user,
  });

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

  // Handle entering saved-only mode: clear all filters
  const handleViewSavedOnly = () => {
    setShowSavedOnly(true);
    setSelectedTopics([]); // Clear topic filters
    setSearchQuery(""); // Clear search query
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
          featuredArticle={mockArticles[0] ? {
            id: mockArticles[0].id,
            title: mockArticles[0].title,
            authors: mockArticles[0].authors,
            journal: mockArticles[0].journal,
            category: mockArticles[0].tags[0] || "Research",
            externalUrl: mockArticles[0].externalUrl,
          } : undefined}
          onViewSaved={handleViewSavedOnly}
          onSaveFeatured={() => mockArticles[0] && handleSaveArticle(mockArticles[0])}
          onReadFeatured={() => {
            if (mockArticles[0]?.externalUrl) {
              window.open(mockArticles[0].externalUrl, '_blank', 'noopener,noreferrer');
            }
          }}
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
              <div className="lg:col-span-3 space-y-12">
                {/* Saved Articles Filter Banner */}
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

                {/* Topic Filter Pills - Sticky filter bar */}
                {!showSavedOnly && (
                  <div className="sticky top-16 z-10 bg-background/95 backdrop-blur-sm py-4 -mx-6 px-6 border-b border-border/50">
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
                      {selectedTopics.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTopics([])}
                          data-testid="button-clear-filters"
                          className="ml-auto"
                        >
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Netflix-style Carousel Sections */}
                {(showSavedOnly ? savedArticles.length > 0 : filteredArticles.length > 0) ? (
                  <div className="space-y-10">
                    {showSavedOnly ? (
                      <HorizontalCarousel title="Your Saved Articles">
                        {savedArticles.map((article) => (
                          <ArticleCard
                            key={article.id}
                            articleId={article.id}
                            title={article.title}
                            authors={article.authors}
                            journal={article.journal}
                            date={article.publicationDate}
                            abstract={article.abstract}
                            tags={article.tags || []}
                            externalUrl={article.externalUrl || undefined}
                            isSaved={true}
                            onSave={() => console.log("Already saved")}
                            onView={() => console.log("View article:", article.title)}
                          />
                        ))}
                      </HorizontalCarousel>
                    ) : (
                      <>
                        {/* Continue Reading (Saved Articles) */}
                        {savedArticles.length > 0 && (
                          <HorizontalCarousel title="Continue Reading">
                            {savedArticles
                              .filter(article => {
                                const matchesTopics = selectedTopics.length === 0 || 
                                  (article.tags || []).some(tag => selectedTopics.includes(tag));
                                return matchesTopics;
                              })
                              .map((article) => (
                            <ArticleCard
                              key={article.id}
                              articleId={article.id}
                              title={article.title}
                              authors={article.authors}
                              journal={article.journal}
                              date={article.publicationDate}
                              abstract={article.abstract}
                              tags={article.tags || []}
                              externalUrl={article.externalUrl || undefined}
                              isSaved={true}
                              onSave={() => console.log("Already saved")}
                              onView={() => console.log("View article:", article.title)}
                            />
                          ))}
                      </HorizontalCarousel>
                    )}

                    {/* Trending in Your Field */}
                    {uniqueMockArticles.length > 0 && (
                      <HorizontalCarousel title="Trending in Your Field">
                        {uniqueMockArticles
                          .filter(article => {
                            const matchesTopics = selectedTopics.length === 0 || 
                              article.tags.some(tag => selectedTopics.includes(tag));
                            return matchesTopics;
                          })
                          .map((article) => (
                            <ArticleCard
                              key={article.id}
                              articleId={article.id}
                              title={article.title}
                              authors={article.authors}
                              journal={article.journal}
                              date={article.date}
                              abstract={article.abstract}
                              tags={article.tags}
                              externalUrl={article.externalUrl}
                              isSaved={false}
                              onSave={() => handleSaveArticle(article)}
                              onView={() => console.log("View article:", article.title)}
                            />
                          ))}
                      </HorizontalCarousel>
                    )}

                    {/* New This Week (duplicate for demo - todo: replace with real data) */}
                    {mockArticles.length > 0 && (
                      <HorizontalCarousel title="New This Week">
                        {mockArticles
                          .filter(article => {
                            const matchesTopics = selectedTopics.length === 0 || 
                              article.tags.some(tag => selectedTopics.includes(tag));
                            return matchesTopics;
                          })
                          .slice()
                          .reverse()
                          .map((article, idx) => (
                            <ArticleCard
                              key={`new-${article.id}-${idx}`}
                              articleId={article.id}
                              title={article.title}
                              authors={article.authors}
                              journal={article.journal}
                              date={article.date}
                              abstract={article.abstract}
                              tags={article.tags}
                              externalUrl={article.externalUrl}
                              isSaved={savedTitles.has(article.title)}
                              onSave={() => !savedTitles.has(article.title) && handleSaveArticle(article)}
                              onView={() => console.log("View article:", article.title)}
                            />
                          ))}
                      </HorizontalCarousel>
                    )}

                    {/* Recommended for You (duplicate for demo - todo: replace with real recommendations) */}
                    {mockArticles.length > 1 && (
                      <HorizontalCarousel title="Recommended for You">
                        {mockArticles
                          .filter(article => {
                            const matchesTopics = selectedTopics.length === 0 || 
                              article.tags.some(tag => selectedTopics.includes(tag));
                            return matchesTopics;
                          })
                          .map((article, idx) => (
                            <ArticleCard
                              key={`rec-${article.id}-${idx}`}
                              articleId={article.id}
                              title={article.title}
                              authors={article.authors}
                              journal={article.journal}
                              date={article.date}
                              abstract={article.abstract}
                              tags={article.tags}
                              externalUrl={article.externalUrl}
                              isSaved={savedTitles.has(article.title)}
                              onSave={() => !savedTitles.has(article.title) && handleSaveArticle(article)}
                              onView={() => console.log("View article:", article.title)}
                            />
                          ))}
                      </HorizontalCarousel>
                    )}
                      </>
                    )}
                  </div>
                ) : (
                  <EmptyState
                    title={showSavedOnly ? "No saved articles yet" : "No articles found"}
                    description={
                      showSavedOnly
                        ? "Start saving articles you're interested in, and they'll appear here for easy access."
                        : selectedTopics.length > 0
                        ? `No articles match the selected topics. Try different filters.`
                        : "No articles available."
                    }
                  />
                )}
              </div>

              <aside className="space-y-6">
                <ResearcherProfileCard
                  userName={user?.firstName ?? null}
                  jobRole={user?.jobRole || undefined}
                  institution={user?.institution || undefined}
                  avatarUrl={user?.profileImageUrl || undefined}
                  savedCount={savedArticles.length}
                  readThisWeek={savedArticles.length}
                  topTopics={mockTopics.slice(0, 3).map(t => t.name)}
                  onViewSaved={handleViewSavedOnly}
                />
                <TopicsWidget 
                  topics={mockTopics}
                  selectedTopics={selectedTopics}
                  onTopicClick={(topic) => toggleTopic(topic)}
                />
                <RecentActivityWidget activities={activities.slice(0, 10).map((activity: any) => ({
                  action: activity.action,
                  time: formatActivityTime(activity.timestamp),
                  link: activity.externalUrl || (activity.userId ? `/profiles/${activity.userId}` : undefined),
                }))} />
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
