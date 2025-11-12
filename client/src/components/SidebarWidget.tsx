import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SidebarWidgetProps {
  title: string;
  children: React.ReactNode;
}

export function SidebarWidget({ title, children }: SidebarWidgetProps) {
  return (
    <Card className="p-6 animate-fade-in shadow-sm" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <h3 className="font-heading font-semibold text-lg mb-5" data-testid="text-widget-title">
        {title}
      </h3>
      {children}
    </Card>
  );
}

interface TopicItem {
  name: string;
  count: number;
}

interface TopicsWidgetProps {
  topics: TopicItem[];
  selectedTopics?: string[];
  onTopicClick?: (topic: string) => void;
}

export function TopicsWidget({ topics, selectedTopics = [], onTopicClick }: TopicsWidgetProps) {
  return (
    <SidebarWidget title="Topics">
      <div className="space-y-2">
        {topics.map((topic, idx) => {
          const isSelected = selectedTopics.includes(topic.name);
          return (
            <button
              key={idx}
              onClick={() => onTopicClick?.(topic.name)}
              className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-md hover-elevate active-elevate-2 transition-colors ${
                isSelected ? 'bg-primary/10 border border-primary/20' : ''
              }`}
              data-testid={`button-topic-${idx}`}
              aria-pressed={isSelected}
            >
              <span className={`text-sm ${isSelected ? 'font-medium' : ''}`}>{topic.name}</span>
              <Badge 
                variant={isSelected ? "default" : "secondary"} 
                data-testid={`badge-topic-count-${idx}`}
              >
                {topic.count}
              </Badge>
            </button>
          );
        })}
      </div>
    </SidebarWidget>
  );
}

interface ActivityItem {
  action: string;
  time: string;
}

interface RecentActivityWidgetProps {
  activities: ActivityItem[];
}

export function RecentActivityWidget({ activities }: RecentActivityWidgetProps) {
  return (
    <SidebarWidget title="Recent Activity">
      <div className="space-y-3">
        {activities.map((activity, idx) => (
          <div key={idx} className="text-sm" data-testid={`activity-${idx}`}>
            <div className="font-medium">{activity.action}</div>
            <div className="text-muted-foreground text-xs">{activity.time}</div>
          </div>
        ))}
      </div>
    </SidebarWidget>
  );
}
