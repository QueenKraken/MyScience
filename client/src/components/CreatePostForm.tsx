import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export function CreatePostForm() {
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  const forumPostsKey = ["/api/forum-posts"] as const;

  const createMutation = useMutation({
    mutationFn: async (postContent: string) => {
      return apiRequest("POST", "/api/forum-posts", { content: postContent });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumPostsKey });
      setContent("");
      toast({
        title: "Post created",
        description: "Your post has been shared successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      createMutation.mutate(content);
    }
  };

  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.email || "You";

  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.email?.[0].toUpperCase() || "?";

  return (
    <Card className="p-6" data-testid="card-create-post">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10" data-testid="avatar-current-user">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`What's on your mind, ${displayName}?`}
              className="min-h-24 resize-none"
              data-testid="textarea-create-post"
            />
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Button
            type="submit"
            disabled={!content.trim() || createMutation.isPending}
            data-testid="button-submit-post"
          >
            {createMutation.isPending ? (
              "Posting..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Post
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
