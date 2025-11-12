import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Plus, MessageSquare, Users, Lock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateSpaceDialog } from "@/components/CreateSpaceDialog";
import { formatDistanceToNow } from "date-fns";

type DiscussionSpace = {
  id: string;
  creatorId: string;
  name: string;
  description: string | null;
  linkedArticleId: string | null;
  subjectArea: string | null;
  isPrivate: number;
  createdAt: Date;
  updatedAt: Date;
};

export default function DiscussionSpacesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: spaces, isLoading, error } = useQuery<DiscussionSpace[]>({
    queryKey: ["/api/discussion-spaces"],
  });

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Discussion Spaces</h1>
            <p className="text-muted-foreground mt-1">
              Private spaces for focused research discussions
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error loading spaces</CardTitle>
            <CardDescription>
              Failed to load discussion spaces. Please try again.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const isEmpty = !spaces || spaces.length === 0;

  return (
    <div className="container max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-spaces">
            Discussion Spaces
          </h1>
          <p className="text-muted-foreground mt-1">
            Private spaces for focused research discussions
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          data-testid="button-create-space"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Space
        </Button>
      </div>

      {isEmpty ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No discussion spaces yet</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Create a private space to discuss research topics with colleagues, or wait for an invitation to join an existing space.
            </p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              data-testid="button-create-first-space"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Space
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {spaces.map((space) => (
            <Link
              key={space.id}
              href={`/spaces/${space.id}`}
              data-testid={`link-space-${space.id}`}
            >
              <Card className="hover-elevate active-elevate-2 h-full cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg" data-testid={`text-space-name-${space.id}`}>
                        {space.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {space.isPrivate === 1 ? (
                          <span className="inline-flex items-center gap-1 text-xs">
                            <Lock className="w-3 h-3" />
                            Private
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs">
                            <Globe className="w-3 h-3" />
                            Public
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {space.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {space.description}
                    </p>
                  )}
                  {space.subjectArea && (
                    <div className="inline-block px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium mb-3">
                      {space.subjectArea}
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Members
                    </span>
                    <span>
                      Updated {formatDistanceToNow(new Date(space.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <CreateSpaceDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}
