import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import AppHeader from "@/components/AppHeader";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, UserMinus, Mail, Briefcase, ExternalLink, Users } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";
import type { UserSummary } from "server/storage";

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const { data: profileData, isLoading } = useQuery<UserSummary>({
    queryKey: ['/api/users', userId],
    enabled: !!userId,
  });

  const { data: followers = [], isLoading: isLoadingFollowers } = useQuery<User[]>({
    queryKey: ['/api/social/followers', userId],
    enabled: !!userId,
  });

  const { data: following = [], isLoading: isLoadingFollowing } = useQuery<User[]>({
    queryKey: ['/api/social/following', userId],
    enabled: !!userId,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("No user ID");
      return apiRequest('POST', '/api/social/follows', { followingId: userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/social/followers', userId] });
      toast({
        title: "Following",
        description: `You are now following ${profileData?.firstName} ${profileData?.lastName}`,
      });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("No user ID");
      return apiRequest('DELETE', '/api/social/follows', { followingId: userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/social/followers', userId] });
      toast({
        title: "Unfollowed",
        description: `You are no longer following ${profileData?.firstName} ${profileData?.lastName}`,
      });
    },
  });

  const isOwnProfile = currentUser?.id === userId;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex items-start gap-8 mb-8">
            <Skeleton className="w-32 h-32 rounded-full" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="max-w-5xl mx-auto px-6 py-12">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">User not found</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const fullName = `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || 'User';

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-start gap-8 mb-8">
          <Avatar className="w-32 h-32" data-testid="avatar-profile">
            <AvatarImage src={profileData.profileImageUrl || ""} alt={fullName} />
            <AvatarFallback className="text-4xl">
              {profileData.firstName?.[0]}{profileData.lastName?.[0]}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <div>
              <h1 className="font-heading text-4xl font-bold mb-2" data-testid="heading-user-name">
                {fullName}
              </h1>
              {profileData.email && (
                <p className="text-muted-foreground flex items-center gap-2" data-testid="text-email">
                  <Mail className="w-4 h-4" />
                  {profileData.email}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {!isOwnProfile && (
                profileData.isFollowedByViewer ? (
                  <Button
                    variant="secondary"
                    onClick={() => unfollowMutation.mutate()}
                    disabled={unfollowMutation.isPending}
                    data-testid="button-unfollow"
                  >
                    <UserMinus className="w-4 h-4 mr-2" />
                    Unfollow
                  </Button>
                ) : (
                  <Button
                    onClick={() => followMutation.mutate()}
                    disabled={followMutation.isPending}
                    data-testid="button-follow"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Follow
                  </Button>
                )
              )}
              {isOwnProfile && (
                <Button variant="outline" asChild data-testid="button-edit-profile">
                  <Link href="/profile">Edit Profile</Link>
                </Button>
              )}
            </div>

            <div className="flex gap-6 text-sm">
              <div data-testid="stat-followers">
                <span className="font-semibold">{profileData.followersCount}</span>
                <span className="text-muted-foreground ml-1">Followers</span>
              </div>
              <div data-testid="stat-following">
                <span className="font-semibold">{profileData.followingCount}</span>
                <span className="text-muted-foreground ml-1">Following</span>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full" data-testid="tabs-profile">
          <TabsList className="mb-6">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="followers" data-testid="tab-followers">
              Followers ({profileData.followersCount})
            </TabsTrigger>
            <TabsTrigger value="following" data-testid="tab-following">
              Following ({profileData.followingCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {profileData.bio && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    About
                  </h3>
                  <p className="text-muted-foreground leading-relaxed" data-testid="text-bio">
                    {profileData.bio}
                  </p>
                </CardContent>
              </Card>
            )}

            {profileData.subjectAreas && profileData.subjectAreas.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Research Interests</h3>
                  <div className="flex flex-wrap gap-2" data-testid="container-interests">
                    {profileData.subjectAreas.map((subject: string) => (
                      <Badge key={subject} variant="secondary" data-testid={`badge-interest-${subject}`}>
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {(profileData.orcid || profileData.scietyId) && (
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-3">Research Profiles</h3>
                  <div className="space-y-2">
                    {profileData.orcid && (
                      <a
                        href={`https://orcid.org/${profileData.orcid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover-elevate active-elevate-2 p-2 rounded-md"
                        data-testid="link-orcid"
                      >
                        <ExternalLink className="w-4 h-4" />
                        ORCID: {profileData.orcid}
                      </a>
                    )}
                    {profileData.scietyId && (
                      <a
                        href={`https://sciety.org/users/${profileData.scietyId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover-elevate active-elevate-2 p-2 rounded-md"
                        data-testid="link-sciety"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Sciety: {profileData.scietyId}
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {!profileData.bio && (!profileData.subjectAreas || profileData.subjectAreas.length === 0) && !profileData.orcid && !profileData.scietyId && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {isOwnProfile ? "Complete your profile to help others discover your research" : "This user hasn't completed their profile yet"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="followers">
            {isLoadingFollowers ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : followers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {isOwnProfile ? "No followers yet" : "This user has no followers yet"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2" data-testid="list-followers">
                {followers.map((follower) => (
                  <Link key={follower.id} href={`/profiles/${follower.id}`}>
                    <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid={`card-follower-${follower.id}`}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={follower.profileImageUrl || ""} alt={follower.firstName || "User"} />
                          <AvatarFallback>
                            {follower.firstName?.[0]}{follower.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{follower.firstName} {follower.lastName}</p>
                          <p className="text-sm text-muted-foreground">{follower.email}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="following">
            {isLoadingFollowing ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : following.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {isOwnProfile ? "You're not following anyone yet" : "This user isn't following anyone yet"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2" data-testid="list-following">
                {following.map((followedUser) => (
                  <Link key={followedUser.id} href={`/profiles/${followedUser.id}`}>
                    <Card className="hover-elevate active-elevate-2 cursor-pointer" data-testid={`card-following-${followedUser.id}`}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={followedUser.profileImageUrl || ""} alt={followedUser.firstName || "User"} />
                          <AvatarFallback>
                            {followedUser.firstName?.[0]}{followedUser.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{followedUser.firstName} {followedUser.lastName}</p>
                          <p className="text-sm text-muted-foreground">{followedUser.email}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
