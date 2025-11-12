import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MessageSquare, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CommentCard } from "./CommentCard";
import { Skeleton } from "@/components/ui/skeleton";

interface Comment {
  id: string;
  articleId: string;
  userId: string;
  content: string;
  parentCommentId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    profileImage: string | null;
  };
}

interface CommentSectionProps {
  articleId: string;
}

export function CommentSection({ articleId }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();

  const commentsKey = [`/api/comments/${articleId}`] as const;

  const { data: comments, isLoading, isError, error } = useQuery<Comment[]>({
    queryKey: commentsKey,
  });

  const createMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", `/api/comments`, { articleId, content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsKey });
      setNewComment("");
      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post comment",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      createMutation.mutate(newComment);
    }
  };

  const rootComments = comments?.filter(c => !c.parentCommentId && !c.deletedAt) || [];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5" />
        <h2 className="font-heading text-xl font-semibold">
          Discussion ({rootComments.length})
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts on this article..."
          className="mb-3 min-h-[100px]"
          data-testid="input-comment"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!newComment.trim() || createMutation.isPending}
            data-testid="button-submit-comment"
          >
            <Send className="w-4 h-4 mr-2" />
            Post Comment
          </Button>
        </div>
      </form>

      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12" data-testid="error-comments-fetch">
            <p className="text-destructive font-medium mb-2">Failed to load comments</p>
            <p className="text-muted-foreground text-sm">
              {error instanceof Error ? error.message : "An error occurred while fetching comments"}
            </p>
          </div>
        ) : rootComments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          rootComments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              articleId={articleId}
              allComments={comments || []}
            />
          ))
        )}
      </div>
    </Card>
  );
}
