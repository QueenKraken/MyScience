import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

const createSpaceSchema = z.object({
  name: z.string().min(1, "Space name is required").max(100),
  description: z.string().optional(),
  subjectArea: z.string().optional(),
  isPrivate: z.boolean().default(true),
});

type CreateSpaceForm = z.infer<typeof createSpaceSchema>;

type CreateSpaceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateSpaceDialog({ open, onOpenChange }: CreateSpaceDialogProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<CreateSpaceForm>({
    resolver: zodResolver(createSpaceSchema),
    defaultValues: {
      name: "",
      description: "",
      subjectArea: "",
      isPrivate: true,
    },
  });

  const createSpaceMutation = useMutation({
    mutationFn: async (data: CreateSpaceForm) => {
      const payload = {
        name: data.name,
        description: data.description || undefined,
        subjectArea: data.subjectArea || undefined,
        isPrivate: data.isPrivate ? 1 : 0,
      };
      return await fetch("/api/discussion-spaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      }).then(res => {
        if (!res.ok) throw new Error("Failed to create space");
        return res.json();
      });
    },
    onSuccess: (newSpace: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/discussion-spaces"] });
      toast({
        title: "Space created",
        description: "Your discussion space has been created successfully.",
      });
      form.reset();
      onOpenChange(false);
      setLocation(`/spaces/${newSpace.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create space",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateSpaceForm) => {
    createSpaceMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-create-space">
        <DialogHeader>
          <DialogTitle>Create Discussion Space</DialogTitle>
          <DialogDescription>
            Create a private space for focused discussions with colleagues.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Space Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., CRISPR Research Discussion"
                      data-testid="input-space-name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What will this space be about?"
                      rows={3}
                      data-testid="input-space-description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subjectArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Area (optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-subject-area">
                        <SelectValue placeholder="Select a subject area" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Molecular Biology">Molecular Biology</SelectItem>
                      <SelectItem value="Neuroscience">Neuroscience</SelectItem>
                      <SelectItem value="Genetics">Genetics</SelectItem>
                      <SelectItem value="Immunology">Immunology</SelectItem>
                      <SelectItem value="Cell Biology">Cell Biology</SelectItem>
                      <SelectItem value="Bioinformatics">Bioinformatics</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isPrivate"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Private Space</FormLabel>
                    <FormDescription>
                      Only invited members can access this space
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-private"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createSpaceMutation.isPending}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createSpaceMutation.isPending}
                data-testid="button-submit-space"
              >
                {createSpaceMutation.isPending ? "Creating..." : "Create Space"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
