import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, Edit2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

interface ForumPostComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

interface ForumPostCommentsProps {
  postId: string;
}

export function ForumPostComments({ postId }: ForumPostCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  const commentsKey = ["/api/forum-posts", postId, "comments"] as const;

  const { data: comments = [], isLoading } = useQuery<ForumPostComment[]>({
    queryKey: commentsKey,
  });

  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", `/api/forum-posts/${postId}/comments`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsKey });
      queryClient.invalidateQueries({ queryKey: ["/api/forum-posts"] });
      setNewComment("");
      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to post comment",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      return apiRequest("PUT", `/api/forum-posts/comments/${commentId}`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsKey });
      setEditingId(null);
      setEditContent("");
      toast({
        title: "Comment updated",
        description: "Your comment has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update comment",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      return apiRequest("DELETE", `/api/forum-posts/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsKey });
      queryClient.invalidateQueries({ queryKey: ["/api/forum-posts"] });
      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete comment",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (newComment.trim()) {
      createCommentMutation.mutate(newComment);
    }
  };

  const handleEdit = (commentId: string) => {
    if (editContent.trim()) {
      updateCommentMutation.mutate({ commentId, content: editContent });
    }
  };

  const handleDelete = (commentId: string) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  const startEdit = (comment: ForumPostComment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  return (
    <div className="space-y-4 pt-4 border-t">
      {/* New comment form */}
      <div className="flex gap-3" data-testid={`form-new-comment-${postId}`}>
        {user && (
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarImage src={user.profileImageUrl || undefined} />
            <AvatarFallback>
              {user.firstName && user.lastName
                ? `${user.firstName[0]}${user.lastName[0]}`
                : user.email?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
        )}
        <div className="flex-1 space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={2}
            className="resize-none"
            data-testid={`textarea-new-comment-${postId}`}
          />
          <Button
            onClick={handleSubmit}
            disabled={!newComment.trim() || createCommentMutation.isPending}
            size="sm"
            data-testid={`button-post-comment-${postId}`}
          >
            {createCommentMutation.isPending ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      </div>

      {/* Comments list */}
      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-sm text-muted-foreground" data-testid={`empty-comments-${postId}`}>
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isOwnComment = user?.id === comment.userId;
            const displayName =
              comment.user?.firstName && comment.user?.lastName
                ? `${comment.user.firstName} ${comment.user.lastName}`
                : comment.user?.email || "Anonymous";
            const initials =
              comment.user?.firstName && comment.user?.lastName
                ? `${comment.user.firstName[0]}${comment.user.lastName[0]}`
                : comment.user?.email?.[0].toUpperCase() || "?";

            return (
              <div
                key={comment.id}
                className="flex gap-3"
                data-testid={`comment-${comment.id}`}
              >
                <Link href={`/profiles/${comment.userId}`}>
                  <Avatar className="w-8 h-8 flex-shrink-0 cursor-pointer hover-elevate">
                    <AvatarImage src={comment.user?.profileImageUrl || undefined} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </Link>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/profiles/${comment.userId}`}>
                      <span className="text-sm font-medium hover:underline cursor-pointer">
                        {displayName}
                      </span>
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                    {comment.editedAt && (
                      <span className="text-xs text-muted-foreground italic">(edited)</span>
                    )}
                  </div>

                  {editingId === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={2}
                        className="resize-none text-sm"
                        data-testid={`textarea-edit-comment-${comment.id}`}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(comment.id)}
                          disabled={!editContent.trim() || updateCommentMutation.isPending}
                          size="sm"
                          data-testid={`button-save-comment-${comment.id}`}
                        >
                          {updateCommentMutation.isPending ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          onClick={cancelEdit}
                          variant="outline"
                          size="sm"
                          data-testid={`button-cancel-edit-comment-${comment.id}`}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {comment.content}
                      </p>
                      {isOwnComment && (
                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(comment)}
                            className="h-7 text-xs"
                            data-testid={`button-edit-comment-${comment.id}`}
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(comment.id)}
                            disabled={deleteCommentMutation.isPending}
                            className="h-7 text-xs text-destructive hover:text-destructive"
                            data-testid={`button-delete-comment-${comment.id}`}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
