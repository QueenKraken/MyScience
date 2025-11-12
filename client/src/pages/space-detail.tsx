import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import { ArrowLeft, Users, Send, Settings, UserPlus, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { SpaceMemberList } from "@/components/SpaceMemberList";
import { AddMemberDialog } from "@/components/AddMemberDialog";
import AppHeader from "@/components/AppHeader";

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

type Message = {
  id: string;
  spaceId: string;
  userId: string;
  content: string;
  editedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  } | null;
};

export default function SpaceDetailPage() {
  const { spaceId } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const [messageContent, setMessageContent] = useState("");
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);

  const { data: space, isLoading: spaceLoading, error: spaceError } = useQuery<DiscussionSpace>({
    queryKey: [`/api/discussion-spaces/${spaceId}`],
  });

  const { data: messages, isLoading: messagesLoading, refetch } = useQuery<Message[]>({
    queryKey: [`/api/discussion-spaces/${spaceId}/messages`],
    enabled: !!spaceId,
    refetchInterval: 10000, // Poll every 10 seconds
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return await fetch(`/api/discussion-spaces/${spaceId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      }).then(res => {
        if (!res.ok) throw new Error("Failed to send message");
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/discussion-spaces/${spaceId}/messages`] });
      setMessageContent("");
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send message",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageContent.trim()) {
      sendMessageMutation.mutate(messageContent.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (spaceLoading || !space) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="container max-w-6xl mx-auto p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-96 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (spaceError) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="container max-w-6xl mx-auto p-6">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Error loading space</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  const isEmpty = !messages || messages.length === 0;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Space Header */}
        <div className="border-b bg-card">
        <div className="container max-w-6xl mx-auto p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/spaces">
              <Button variant="ghost" size="icon" data-testid="button-back">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold" data-testid="text-space-name">
                {space.name}
              </h1>
              {space.description && (
                <p className="text-sm text-muted-foreground">{space.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              data-testid="button-refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            {/* Mobile member drawer */}
            <div className="md:hidden">
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="outline" size="icon" data-testid="button-members-mobile">
                    <Users className="w-4 h-4" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Members</DrawerTitle>
                  </DrawerHeader>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground">Member management UI to be implemented</p>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <div className="container max-w-6xl mx-auto h-full flex gap-4 p-4">
          {/* Messages area */}
          <div className="flex-1 flex flex-col min-w-0">
            <Card className="flex-1 flex flex-col">
              {/* Message list */}
              <CardContent className="flex-1 overflow-y-auto p-4" role="log" aria-live="polite" aria-label="Messages">
                {isEmpty ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Send className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                    <p className="text-muted-foreground max-w-md">
                      Start the conversation by sending the first message in this discussion space.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => {
                      const previousMessage = index > 0 ? messages[index - 1] : null;
                      const showAvatar = !previousMessage || previousMessage.userId !== message.userId;
                      
                      const userName = message.user
                        ? `${message.user.firstName || ''} ${message.user.lastName || ''}`.trim() || message.user.email
                        : 'Unknown User';
                      const userInitials = message.user
                        ? `${message.user.firstName?.[0] || ''}${message.user.lastName?.[0] || ''}`.toUpperCase() || message.user.email[0].toUpperCase()
                        : 'U';

                      return (
                        <div
                          key={message.id}
                          className={showAvatar ? "pt-2" : ""}
                          data-testid={`message-${message.id}`}
                        >
                          <div className="flex gap-3">
                            {showAvatar ? (
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={message.user?.profileImageUrl || undefined} />
                                <AvatarFallback>{userInitials}</AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="w-8" />
                            )}
                            <div className="flex-1 min-w-0">
                              {showAvatar && (
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm">{userName}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                  </span>
                                </div>
                              )}
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {message.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>

              {/* Message input */}
              <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Textarea
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                    rows={2}
                    className="resize-none"
                    data-testid="input-message"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!messageContent.trim() || sendMessageMutation.isPending}
                    data-testid="button-send"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </div>

          {/* Desktop member sidebar */}
          <div className="hidden md:block w-64">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Members</span>
                  {user && space.creatorId === user.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsAddMemberDialogOpen(true)}
                      data-testid="button-add-member"
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user && (
                  <SpaceMemberList
                    spaceId={spaceId!}
                    creatorId={space.creatorId}
                    currentUserId={user.id}
                  />
                )}
              </CardContent>
            </Card>
          </div>
          
          {user && (
            <AddMemberDialog
              spaceId={spaceId!}
              open={isAddMemberDialogOpen}
              onOpenChange={setIsAddMemberDialogOpen}
            />
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
