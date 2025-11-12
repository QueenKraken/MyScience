import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Heart, Trash2, Edit2, MessageSquare, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { ForumPostComments } from "./ForumPostComments";

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

interface ForumPostCardProps {
  post: ForumPost;
}

export function ForumPostCard({ post }: ForumPostCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [areCommentsOpen, setAreCommentsOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const isOwnPost = user?.id === post.userId;

  const forumPostsKey = ["/api/forum-posts"] as const;

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (post.isLiked) {
        return apiRequest("DELETE", `/api/forum-posts/${post.id}/like`);
      } else {
        return apiRequest("POST", `/api/forum-posts/${post.id}/like`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumPostsKey });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update like",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("PUT", `/api/forum-posts/${post.id}`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumPostsKey });
      setIsEditing(false);
      toast({
        title: "Post updated",
        description: "Your post has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update post",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/forum-posts/${post.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumPostsKey });
      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    if (editContent.trim()) {
      updateMutation.mutate(editContent);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this post?")) {
      deleteMutation.mutate();
    }
  };

  const displayName = post.user?.firstName && post.user?.lastName
    ? `${post.user.firstName} ${post.user.lastName}`
    : post.user?.email || "Anonymous";

  const initials = post.user?.firstName && post.user?.lastName
    ? `${post.user.firstName[0]}${post.user.lastName[0]}`
    : post.user?.email?.[0].toUpperCase() || "?";

  return (
    <Card className="p-6" data-testid={`card-forum-post-${post.id}`}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Link href={`/profiles/${post.userId}`}>
              <Avatar className="w-10 h-10 cursor-pointer hover-elevate" data-testid={`avatar-user-${post.userId}`}>
                <AvatarImage src={post.user?.profileImageUrl || undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Link>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link href={`/profiles/${post.userId}`}>
                  <h3 className="font-medium hover:underline cursor-pointer" data-testid={`text-author-${post.id}`}>
                    {displayName}
                  </h3>
                </Link>
                <span className="text-sm text-muted-foreground" data-testid={`text-timestamp-${post.id}`}>
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
                {post.editedAt && (
                  <span className="text-sm text-muted-foreground italic">
                    (edited)
                  </span>
                )}
              </div>

              {isEditing ? (
                <div className="mt-3 space-y-3">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="What's on your mind?"
                    className="min-h-24 resize-none"
                    data-testid={`textarea-edit-post-${post.id}`}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleEdit}
                      disabled={!editContent.trim() || updateMutation.isPending}
                      size="sm"
                      data-testid={`button-save-edit-${post.id}`}
                    >
                      {updateMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        setEditContent(post.content);
                      }}
                      variant="outline"
                      size="sm"
                      data-testid={`button-cancel-edit-${post.id}`}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mt-3 text-foreground whitespace-pre-wrap break-words" data-testid={`text-content-${post.id}`}>
                    {post.content}
                  </p>

                  {post.linkedArticle && (
                    <Link href={`/articles/${post.linkedArticleId}`}>
                      <div className="mt-3 p-3 rounded-md bg-muted hover-elevate cursor-pointer" data-testid={`link-article-${post.id}`}>
                        <div className="flex items-center gap-2 text-sm">
                          <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium truncate">{post.linkedArticle.title}</span>
                        </div>
                      </div>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          {isOwnPost && !isEditing && (
            <div className="flex items-center gap-1 ml-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                data-testid={`button-edit-${post.id}`}
                aria-label="Edit post"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                data-testid={`button-delete-${post.id}`}
                aria-label="Delete post"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {!isEditing && (
          <div className="flex items-center gap-6 pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => likeMutation.mutate()}
              disabled={likeMutation.isPending}
              className="gap-2"
              data-testid={`button-like-${post.id}`}
            >
              <Heart className={`w-4 h-4 ${post.isLiked ? "fill-current text-red-500" : ""}`} />
              <span data-testid={`text-likes-count-${post.id}`}>
                {post.likesCount || 0}
              </span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAreCommentsOpen(!areCommentsOpen)}
              className="gap-2"
              data-testid={`button-comments-${post.id}`}
            >
              <MessageSquare className="w-4 h-4" />
              <span data-testid={`text-comments-count-${post.id}`}>
                {post.commentsCount || 0} {post.commentsCount === 1 ? "comment" : "comments"}
              </span>
            </Button>
          </div>
        )}

        {/* Comments section */}
        {areCommentsOpen && <ForumPostComments postId={post.id} />}
      </div>
    </Card>
  );
}
