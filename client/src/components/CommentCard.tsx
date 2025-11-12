import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Reply, Edit, Trash2, Send, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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

interface CommentCardProps {
  comment: Comment;
  articleId: string;
  allComments: Comment[];
  depth?: number;
}

export function CommentCard({ comment, articleId, allComments, depth = 0 }: CommentCardProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [editContent, setEditContent] = useState(comment.content);
  const { toast } = useToast();
  const { user } = useAuth();

  const isOwnComment = user?.id === comment.userId;
  const maxDepth = 3;
  const replies = allComments.filter(
    c => c.parentCommentId === comment.id && !c.deletedAt
  );

  const commentsKey = [`/api/comments/${articleId}`] as const;

  const replyMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", `/api/comments`, {
        articleId,
        content,
        parentCommentId: comment.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsKey });
      setReplyContent("");
      setIsReplying(false);
      toast({
        title: "Reply posted",
        description: "Your reply has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post reply",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("PUT", `/api/comments/${comment.id}`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsKey });
      setIsEditing(false);
      toast({
        title: "Comment updated",
        description: "Your comment has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update comment",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/comments/${comment.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: commentsKey });
      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete comment",
        variant: "destructive",
      });
    },
  });

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyContent.trim()) {
      replyMutation.mutate(replyContent);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editContent.trim() && editContent !== comment.content) {
      updateMutation.mutate(editContent);
    }
  };

  const userName = comment.user
    ? `${comment.user.firstName || ""} ${comment.user.lastName || ""}`.trim() ||
      comment.user.email.split("@")[0]
    : "Anonymous";

  const userInitials = comment.user
    ? (comment.user.firstName?.[0] || "") + (comment.user.lastName?.[0] || "") ||
      comment.user.email[0].toUpperCase()
    : "A";

  return (
    <div className={`${depth > 0 ? "ml-8 mt-4" : ""}`} data-testid={`comment-${comment.id}`}>
      <div className="flex gap-3">
        <Avatar className="w-8 h-8 flex-shrink-0">
          {comment.user?.profileImage && (
            <AvatarImage src={comment.user.profileImage} alt={userName} />
          )}
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm" data-testid="text-commenter-name">
              {userName}
            </span>
            <span className="text-xs text-muted-foreground" data-testid="text-comment-time">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {comment.updatedAt !== comment.createdAt && (
              <span className="text-xs text-muted-foreground italic">(edited)</span>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[80px]"
                data-testid="input-edit-comment"
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={!editContent.trim() || updateMutation.isPending}
                  data-testid="button-save-edit"
                >
                  Save
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <>
              <p className="text-sm leading-relaxed mb-2" data-testid="text-comment-content">
                {comment.content}
              </p>

              <div className="flex items-center gap-2">
                {depth < maxDepth && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsReplying(!isReplying)}
                    data-testid="button-reply"
                  >
                    <Reply className="w-3 h-3 mr-1" />
                    Reply
                  </Button>
                )}

                {isOwnComment && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" data-testid="button-comment-menu">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setIsEditing(true)}
                        data-testid="button-edit-comment"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteMutation.mutate()}
                        className="text-destructive"
                        data-testid="button-delete-comment"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </>
          )}

          {isReplying && (
            <form onSubmit={handleReplySubmit} className="mt-3 space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                className="min-h-[80px]"
                data-testid="input-reply"
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={!replyContent.trim() || replyMutation.isPending}
                  data-testid="button-submit-reply"
                >
                  <Send className="w-3 h-3 mr-1" />
                  Reply
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent("");
                  }}
                  data-testid="button-cancel-reply"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {replies.map((reply) => (
                <CommentCard
                  key={reply.id}
                  comment={reply}
                  articleId={articleId}
                  allComments={allComments}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
