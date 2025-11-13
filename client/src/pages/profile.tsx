import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { updateUserProfileSchema } from "@shared/schema";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Mail, BookOpen, Link as LinkIcon, X, Building2, Settings, CheckCircle2, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import AppHeader from "@/components/AppHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";

type ProfileFormData = z.infer<typeof updateUserProfileSchema>;

export default function ProfilePage() {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const { toast } = useToast();
  const [subjectInput, setSubjectInput] = useState("");

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      orcid: "",
      scietyId: "",
      bio: "",
      subjectAreas: [],
      institution: "",
      jobRole: "",
      contentPreferences: [],
      profileImageUrl: "",
    },
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        orcid: user.orcid || "",
        scietyId: user.scietyId || "",
        bio: user.bio || "",
        subjectAreas: user.subjectAreas || [],
        institution: user.institution || "",
        jobRole: user.jobRole || "",
        contentPreferences: user.contentPreferences || [],
        profileImageUrl: user.profileImageUrl || "",
      });
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: () => {
      toast({
        title: "Failed to update profile",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const addSubject = () => {
    if (subjectInput.trim()) {
      const currentSubjects = form.getValues("subjectAreas") || [];
      if (!currentSubjects.includes(subjectInput.trim())) {
        form.setValue("subjectAreas", [...currentSubjects, subjectInput.trim()]);
        setSubjectInput("");
      }
    }
  };

  const removeSubject = (subject: string) => {
    const currentSubjects = form.getValues("subjectAreas") || [];
    form.setValue("subjectAreas", currentSubjects.filter(s => s !== subject));
  };

  const handleReset = () => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        orcid: user.orcid || "",
        scietyId: user.scietyId || "",
        bio: user.bio || "",
        subjectAreas: user.subjectAreas || [],
        institution: user.institution || "",
        jobRole: user.jobRole || "",
        contentPreferences: user.contentPreferences || [],
        profileImageUrl: user.profileImageUrl || "",
      });
    }
  };

  // Check Bonfire account connection
  const { data: bonfireAccount, isLoading: isBonfireLoading, isError: isBonfireError } = useQuery({
    queryKey: ['/api/bonfire/account'],
    enabled: !!user,
  });

  const contentPreferenceOptions = [
    { value: "articles", label: "Research Articles" },
    { value: "reviewed_preprints", label: "Reviewed Preprints" },
    { value: "vors", label: "Versions of Record (VORs)" },
    { value: "authors", label: "Specific Authors" },
  ];

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="max-w-4xl mx-auto px-6 py-12">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-96 mt-2" />
              </CardHeader>
              <CardContent className="space-y-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const currentAvatar = form.watch("profileImageUrl");
  const currentSubjects = (form.watch("subjectAreas") || []) as string[];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold mb-2" data-testid="heading-profile">
            Your Profile
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage your MyScience profile and research interests
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Profile Picture Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Picture
                </CardTitle>
                <CardDescription>
                  Your photo helps colleagues recognize you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={currentAvatar || ""} alt={user?.firstName || "User"} />
                    <AvatarFallback className="text-2xl">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <FormField
                      control={form.control}
                      name="profileImageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Avatar URL</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://example.com/avatar.jpg"
                              data-testid="input-avatar-url"
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Paste a URL to your profile picture
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Your name and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Jane"
                            data-testid="input-first-name"
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Doe"
                            data-testid="input-last-name"
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                      data-testid="input-email"
                    />
                  </FormControl>
                  <FormDescription>
                    Email is managed through your authentication provider
                  </FormDescription>
                </FormItem>

                <FormField
                  control={form.control}
                  name="institution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Affiliated Institution
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Stanford University, Max Planck Institute"
                          data-testid="input-institution"
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Your university, research institute, or employer
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="jobRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Role</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Postdoctoral Researcher, PhD Student, Principal Investigator"
                          data-testid="input-job-role"
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Your current position or role in research
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Research Identity - with Connected Accounts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5" />
                  Research Identity & Connected Accounts
                </CardTitle>
                <CardDescription>
                  Connect your research identifiers for personalized recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* ORCID iD with Connection Status */}
                <FormField
                  control={form.control}
                  name="orcid"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>ORCID iD</FormLabel>
                        {field.value ? (
                          <Badge variant="default" className="gap-1" data-testid="badge-orcid-connected">
                            <CheckCircle2 className="w-3 h-3" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1" data-testid="badge-orcid-not-connected">
                            <XCircle className="w-3 h-3" />
                            Not connected
                          </Badge>
                        )}
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="0000-0002-1825-0097"
                          data-testid="input-orcid"
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Your unique researcher identifier (e.g., 0000-0002-1825-0097)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Sciety ID with Connection Status */}
                <FormField
                  control={form.control}
                  name="scietyId"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Sciety ID</FormLabel>
                        {field.value ? (
                          <Badge variant="default" className="gap-1" data-testid="badge-sciety-connected">
                            <CheckCircle2 className="w-3 h-3" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1" data-testid="badge-sciety-not-connected">
                            <XCircle className="w-3 h-3" />
                            Not connected
                          </Badge>
                        )}
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="your-sciety-username"
                          data-testid="input-sciety-id"
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Your Sciety username for enhanced recommendations
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Bonfire Connection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel>Bonfire Account</FormLabel>
                    {isBonfireLoading ? (
                      <Badge variant="secondary" className="gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Checking...
                      </Badge>
                    ) : bonfireAccount ? (
                      <Badge variant="default" className="gap-1" data-testid="badge-bonfire-connected">
                        <CheckCircle2 className="w-3 h-3" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1" data-testid="badge-bonfire-not-connected">
                        <XCircle className="w-3 h-3" />
                        Not connected
                      </Badge>
                    )}
                  </div>
                  
                  {bonfireAccount ? (
                    <div className="p-3 bg-muted/50 rounded-md">
                      <p className="text-sm text-muted-foreground">
                        Your Bonfire account is connected. This enables social features and collaboration.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        data-testid="button-connect-bonfire"
                        disabled
                      >
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Connect Bonfire Account (Coming Soon)
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        Bonfire integration is currently being developed. This will enable social collaboration features.
                      </p>
                    </div>
                  )}
                </div>

                <p className="text-sm text-muted-foreground pt-2 border-t">
                  More integrations coming soon! We're working on connections to bioRxiv, eLife, and other research platforms.
                </p>
              </CardContent>
            </Card>

            {/* Research Interests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Research Interests
                </CardTitle>
                <CardDescription>
                  Tell us about your research focus areas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="I'm a postdoctoral researcher studying computational biology..."
                          rows={4}
                          data-testid="input-bio"
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        A brief description of your research background and interests
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Subject Areas</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      value={subjectInput}
                      onChange={(e) => setSubjectInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSubject();
                        }
                      }}
                      placeholder="e.g., Computational Biology, Machine Learning"
                      data-testid="input-subject-area"
                    />
                    <Button
                      type="button"
                      onClick={addSubject}
                      variant="secondary"
                      data-testid="button-add-subject"
                    >
                      Add
                    </Button>
                  </div>
                  <FormDescription>
                    Add your areas of research interest (press Enter or click Add)
                  </FormDescription>
                  
                  {currentSubjects.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3" data-testid="container-subjects">
                      {currentSubjects.map((subject: string) => (
                        <Badge
                          key={subject}
                          variant="secondary"
                          className="gap-1"
                          data-testid={`badge-subject-${subject.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          {subject}
                          <button
                            type="button"
                            onClick={() => removeSubject(subject)}
                            className="ml-1 hover-elevate rounded-full"
                            data-testid={`button-remove-${subject.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </FormItem>
              </CardContent>
            </Card>

            {/* Content Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Content Preferences
                </CardTitle>
                <CardDescription>
                  Tell us what types of research content you want to prioritize in your feed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="contentPreferences"
                  render={() => (
                    <FormItem>
                      <div className="space-y-3">
                        {contentPreferenceOptions.map((option) => (
                          <FormField
                            key={option.value}
                            control={form.control}
                            name="contentPreferences"
                            render={({ field }) => {
                              const currentPreferences = field.value as string[] || [];
                              return (
                                <FormItem
                                  key={option.value}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={currentPreferences.includes(option.value)}
                                      onCheckedChange={(checked) => {
                                        const updatedPreferences = checked
                                          ? [...currentPreferences, option.value]
                                          : currentPreferences.filter((val) => val !== option.value);
                                        field.onChange(updatedPreferences);
                                      }}
                                      data-testid={`checkbox-preference-${option.value}`}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {option.label}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormDescription className="mt-3">
                        Select all content types you'd like to see in your personalized feed
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={updateProfileMutation.isPending}
                data-testid="button-reset"
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                data-testid="button-save-profile"
              >
                {updateProfileMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Profile
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
