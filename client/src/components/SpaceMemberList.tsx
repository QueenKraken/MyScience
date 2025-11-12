import { useQuery, useMutation } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

type SpaceMember = {
  id: string;
  spaceId: string;
  userId: string;
  role: string;
  joinedAt: Date;
  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  } | null;
};

type Props = {
  spaceId: string;
  creatorId: string;
  currentUserId: string;
};

export function SpaceMemberList({ spaceId, creatorId, currentUserId }: Props) {
  const { toast } = useToast();

  const { data: members, isLoading } = useQuery<SpaceMember[]>({
    queryKey: [`/api/discussion-spaces/${spaceId}/members`],
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      return await fetch(`/api/discussion-spaces/${spaceId}/members/${memberId}`, {
        method: "DELETE",
        credentials: "include",
      }).then(res => {
        if (!res.ok) throw new Error("Failed to remove member");
        return res;
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/discussion-spaces/${spaceId}/members`] });
      toast({
        title: "Member removed",
        description: "The member has been removed from this space.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove member",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-muted" />
            <div className="flex-1">
              <div className="h-4 bg-muted rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const isCreator = currentUserId === creatorId;

  return (
    <div className="space-y-2">
      {members && members.length > 0 ? (
        members.map((member) => {
          const canRemove = isCreator && member.userId !== creatorId;
          const canLeave = member.userId === currentUserId && member.userId !== creatorId;

          return (
            <div
              key={member.id}
              className="flex items-center gap-2 p-2 rounded-lg hover-elevate"
              data-testid={`member-${member.id}`}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={member.user?.profileImageUrl || undefined} />
                <AvatarFallback>
                  {member.user
                    ? `${member.user.firstName?.[0] || ''}${member.user.lastName?.[0] || ''}`.toUpperCase() || member.user.email[0].toUpperCase()
                    : 'M'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">
                  {member.user
                    ? `${member.user.firstName || ''} ${member.user.lastName || ''}`.trim() || member.user.email
                    : 'Unknown User'}
                </div>
                <Badge variant="secondary" className="mt-1 text-xs">
                  {member.role}
                </Badge>
              </div>
              {(canRemove || canLeave) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6"
                  onClick={() => removeMemberMutation.mutate(member.userId)}
                  disabled={removeMemberMutation.isPending}
                  data-testid={`button-remove-${member.id}`}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          );
        })
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          No members yet
        </p>
      )}
    </div>
  );
}
