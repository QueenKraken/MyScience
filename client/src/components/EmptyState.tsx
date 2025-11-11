import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="rounded-full bg-muted p-6 mb-6">
        <FileQuestion className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="font-heading text-2xl font-semibold mb-2" data-testid="text-empty-title">
        {title}
      </h3>
      <p className="text-muted-foreground max-w-md mb-6 leading-relaxed" data-testid="text-empty-description">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} data-testid="button-empty-action">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
