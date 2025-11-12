import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Search } from "lucide-react";

const addMemberSchema = z.object({
  userId: z.string().min(1, "User is required"),
  role: z.enum(["member", "moderator"]).default("member"),
});

type AddMemberForm = z.infer<typeof addMemberSchema>;

type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
};

type Props = {
  spaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AddMemberDialog({ spaceId, open, onOpenChange }: Props) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const form = useForm<AddMemberForm>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      userId: "",
      role: "member",
    },
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const filteredUsers = users?.filter((user) => {
    const query = searchQuery.toLowerCase();
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return (
      fullName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }) || [];

  const addMemberMutation = useMutation({
    mutationFn: async (data: AddMemberForm) => {
      return await fetch(`/api/discussion-spaces/${spaceId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      }).then(res => {
        if (!res.ok) {
          if (res.status === 409) throw new Error("User is already a member");
          throw new Error("Failed to add member");
        }
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/discussion-spaces/${spaceId}/members`] });
      toast({
        title: "Member added",
        description: "The user has been added to this space.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add member",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddMemberForm) => {
    addMemberMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-add-member">
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
          <DialogDescription>
            Invite a user to join this discussion space.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-users"
          />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-user">
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredUsers.map((user) => {
                        const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
                        const userInitials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || user.email[0].toUpperCase();
                        
                        return (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={user.profileImageUrl || undefined} />
                                <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
                              </Avatar>
                              <span>{userName}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-role">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={addMemberMutation.isPending}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addMemberMutation.isPending}
                data-testid="button-submit-member"
              >
                {addMemberMutation.isPending ? "Adding..." : "Add Member"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
