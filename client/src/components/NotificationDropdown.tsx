import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, CheckCheck } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import type { Notification } from "@shared/schema";

export default function NotificationDropdown() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();

  // All hooks must be called unconditionally - use enabled flag to gate queries
  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ['/api/notifications/unread-count'],
    enabled: !!user,
    refetchInterval: 30000,
    retry: false,
  });

  const { data: notifications = [], isError: notificationsError, isLoading: notificationsLoading } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    enabled: !!user && open,
    retry: false,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return await apiRequest('PUT', `/api/notifications/${notificationId}/read`);
    },
    onMutate: async (notificationId) => {
      // Optimistically update the cache
      await queryClient.cancelQueries({ queryKey: ['/api/notifications'] });
      await queryClient.cancelQueries({ queryKey: ['/api/notifications/unread-count'] });

      const previousNotifications = queryClient.getQueryData<Notification[]>(['/api/notifications']);
      const previousCount = queryClient.getQueryData<{ count: number }>(['/api/notifications/unread-count']);

      if (previousNotifications) {
        queryClient.setQueryData<Notification[]>(['/api/notifications'], 
          previousNotifications.map(n => 
            n.id === notificationId ? { ...n, read: new Date() } : n
          )
        );
      }

      if (previousCount && previousCount.count > 0) {
        queryClient.setQueryData<{ count: number }>(['/api/notifications/unread-count'], 
          { count: previousCount.count - 1 }
        );
      }

      return { previousNotifications, previousCount };
    },
    onError: (err, notificationId, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(['/api/notifications'], context.previousNotifications);
      }
      if (context?.previousCount) {
        queryClient.setQueryData(['/api/notifications/unread-count'], context.previousCount);
      }
      toast({
        title: "Failed to mark as read",
        description: "Please try again",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('PUT', '/api/notifications/mark-all-read');
    },
    onMutate: async () => {
      // Optimistically update the cache
      await queryClient.cancelQueries({ queryKey: ['/api/notifications'] });
      await queryClient.cancelQueries({ queryKey: ['/api/notifications/unread-count'] });

      const previousNotifications = queryClient.getQueryData<Notification[]>(['/api/notifications']);
      const previousCount = queryClient.getQueryData<{ count: number }>(['/api/notifications/unread-count']);

      if (previousNotifications) {
        queryClient.setQueryData<Notification[]>(['/api/notifications'], 
          previousNotifications.map(n => ({ ...n, read: new Date() }))
        );
      }

      queryClient.setQueryData<{ count: number }>(['/api/notifications/unread-count'], { count: 0 });

      return { previousNotifications, previousCount };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(['/api/notifications'], context.previousNotifications);
      }
      if (context?.previousCount) {
        queryClient.setQueryData(['/api/notifications/unread-count'], context.previousCount);
      }
      toast({
        title: "Failed to mark all as read",
        description: "Please try again",
        variant: "destructive",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
  });

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'new_follower':
        return 'started following you';
      case 'article_like':
        return 'liked your article';
      case 'new_comment':
        return 'commented on your article';
      default:
        return 'sent you a notification';
    }
  };

  const count = unreadCount?.count ?? 0;

  // Don't render if not authenticated (return after all hooks)
  if (!user) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          data-testid="button-notifications"
          aria-label="Notifications"
          className="relative"
        >
          <Bell className="w-5 h-5" />
          {count > 0 && (
            <Badge
              variant="default"
              className="absolute -top-1.5 left-3 h-5 min-w-5 flex items-center justify-center p-0 px-1 text-xs"
              data-testid="badge-notification-count"
            >
              {count > 9 ? '9+' : count}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" data-testid="popover-notifications">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              data-testid="button-mark-all-read"
              className="gap-1 text-xs"
            >
              <CheckCheck className="w-3 h-3" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notificationsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <div className="w-12 h-12 mb-3 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              <p className="text-sm">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="w-12 h-12 mb-3 opacity-20" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y" role="list">
              {notifications.map((notification) => {
                const handleClick = () => {
                  if (!notification.read) {
                    markAsReadMutation.mutate(notification.id);
                  }
                  if (notification.actorId) {
                    setLocation(`/profiles/${notification.actorId}`);
                    setOpen(false);
                  }
                };

                return (
                  <button
                    key={notification.id}
                    className={`w-full px-4 py-3 hover-elevate transition-colors text-left ${
                      !notification.read ? 'bg-accent/10' : ''
                    }`}
                    onClick={handleClick}
                    data-testid={`notification-item-${notification.id}`}
                    role="listitem"
                    aria-label={`${getNotificationText(notification)} ${notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">User</span>{' '}
                          <span className="text-muted-foreground">
                            {getNotificationText(notification)}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {notification.createdAt && formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5" data-testid="indicator-unread" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
