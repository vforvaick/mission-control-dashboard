import { KanbanBoard } from "@/components/kanban/board";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { StatsBar } from "@/components/dashboard/stats-bar";

export default function Home() {
  return (
    <div className="space-y-6">
      <StatsBar />
      <KanbanBoard />
      <RecentActivity />
    </div>
  );
}
