import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import AppHeader from "@/components/AppHeader";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users } from "lucide-react";
import type { User } from "@shared/schema";

const POPULAR_SUBJECTS = [
  "Gene Editing",
  "Climate Change",
  "Machine Learning",
  "CRISPR",
  "Ethics",
];

export default function PeoplePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['/api/users', { search: searchTerm, subjects: selectedSubjects }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      selectedSubjects.forEach(subject => params.append('subjects', subject));
      params.append('limit', '20');
      
      const response = await fetch(`/api/users?${params}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold mb-2" data-testid="heading-people">
            Discover Researchers
          </h1>
          <p className="text-muted-foreground text-lg">
            Connect with fellow researchers in your field
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search by name, email, or bio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-users"
            />
          </div>

          <div>
            <p className="text-sm font-medium mb-3">Filter by research area:</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SUBJECTS.map((subject) => (
                <Badge
                  key={subject}
                  variant={selectedSubjects.includes(subject) ? "default" : "outline"}
                  className="cursor-pointer hover-elevate active-elevate-2"
                  onClick={() => toggleSubject(subject)}
                  data-testid={`badge-filter-${subject.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {subject}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                  <Skeleton className="h-16 w-full mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : users.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No researchers found</p>
              <p className="text-muted-foreground">
                {searchTerm || selectedSubjects.length > 0
                  ? "Try adjusting your search or filters"
                  : "Be the first to join this community"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" data-testid="grid-users">
            {users.map((user) => {
              const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
              const subjectAreas = (user.subjectAreas || []) as string[];
              
              return (
                <Link key={user.id} href={`/profiles/${user.id}`}>
                  <Card className="h-full hover-elevate active-elevate-2 cursor-pointer" data-testid={`card-user-${user.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={user.profileImageUrl || ""} alt={fullName} />
                          <AvatarFallback className="text-lg">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-1 truncate" data-testid={`text-user-name-${user.id}`}>
                            {fullName}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      {user.bio && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3" data-testid={`text-bio-${user.id}`}>
                          {user.bio}
                        </p>
                      )}

                      {subjectAreas.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {subjectAreas.slice(0, 3).map((subject) => (
                            <Badge key={subject} variant="secondary" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                          {subjectAreas.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{subjectAreas.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
