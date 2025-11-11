import EmptyState from "../EmptyState";

export default function EmptyStateExample() {
  return (
    <EmptyState
      title="No recommendations yet"
      description="Connect your ORCID to get personalized research recommendations tailored to your interests and reading history."
      actionLabel="Connect ORCID"
      onAction={() => console.log("Connect ORCID clicked")}
    />
  );
}
