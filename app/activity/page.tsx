import { ActivityFeed } from "@/components/activity/activity-feed";

export default function ActivityPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Activity Feed</h2>
                    <p className="text-muted-foreground">Live stream of all agent and task activities</p>
                </div>
            </div>
            <ActivityFeed />
        </div>
    );
}
