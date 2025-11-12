import { useQuery } from "@tanstack/react-query";
import { Flame } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { CreatePostForm } from "@/components/CreatePostForm";
import { ForumPostCard } from "@/components/ForumPostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

interface ForumPost {
  id: string;
  userId: string;
  content: string;
  linkedArticleId: string | null;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  likesCount?: number;
  isLiked?: boolean;
  commentsCount?: number;
  linkedArticle?: {
    id: string;
    title: string;
  };
}

export default function BonfirePage() {
  const forumPostsKey = ["/api/forum-posts"] as const;

  const { data: posts, isLoading, isError, error } = useQuery<ForumPost[]>({
    queryKey: forumPostsKey,
  });

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Flame className="w-8 h-8 text-primary" />
            <h1 className="font-heading text-4xl font-bold" data-testid="heading-bonfire">
              Bonfire
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Connect with fellow researchers, share insights, and spark discussions
          </p>
        </div>

        <div className="space-y-6">
          <CreatePostForm />

          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-6">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-20 w-full" />
                      <div className="flex gap-4">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <Card className="p-8 text-center" data-testid="error-posts-fetch">
              <p className="text-destructive font-medium mb-2">Failed to load posts</p>
              <p className="text-muted-foreground text-sm">
                {error instanceof Error ? error.message : "An error occurred while fetching posts"}
              </p>
            </Card>
          ) : posts && posts.length === 0 ? (
            <Card className="p-12 text-center" data-testid="empty-posts">
              <Flame className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold text-lg mb-2">No posts yet</h3>
              <p className="text-muted-foreground">
                Be the first to share your thoughts and start a conversation!
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {posts?.map((post) => (
                <ForumPostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
