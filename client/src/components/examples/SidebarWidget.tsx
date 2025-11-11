import { TopicsWidget, RecentActivityWidget } from "../SidebarWidget";

export default function SidebarWidgetExample() {
  const topics = [
    { name: "Gene Editing", count: 23 },
    { name: "Climate Science", count: 18 },
    { name: "Neuroscience", count: 15 },
    { name: "Quantum Computing", count: 12 },
  ];

  const activities = [
    { action: "Saved article on CRISPR", time: "2 hours ago" },
    { action: "Viewed paper on climate models", time: "5 hours ago" },
    { action: "Connected ORCID", time: "Yesterday" },
  ];

  return (
    <div className="w-80 space-y-6">
      <TopicsWidget 
        topics={topics}
        onTopicClick={(topic) => console.log("Topic clicked:", topic)}
      />
      <RecentActivityWidget activities={activities} />
    </div>
  );
}
