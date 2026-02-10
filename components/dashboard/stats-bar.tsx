"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ClipboardList, Loader2, PlayCircle, Users } from "lucide-react";

export function StatsBar() {
    const tasks = useQuery(api.tasks.list, {});
    const rawAgents = useQuery(api.agents.list);
    const activity = useQuery(api.activity.list, { limit: 200 });

    const stats = useMemo(() => {
        if (!tasks || !rawAgents || !activity) return null;
        const latestTimestamp = activity[0]?.createdAt ?? 0;
        const oneDayAgo = latestTimestamp - 24 * 60 * 60 * 1000;
        return {
            totalTasks: tasks.length,
            inProgress: tasks.filter((t) => t.status === "in_progress").length,
            activeAgents: rawAgents.filter((a) => (a.dormant ?? false) === false && (a.status === "online" || a.status === "working")).length,
            completedToday: activity.filter((a) => a.actionType === "task_completed" && a.createdAt >= oneDayAgo).length,
        };
    }, [tasks, rawAgents, activity]);

    if (!stats) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="h-28 flex items-center justify-center text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const cards = [
        { title: "Total Tasks", value: stats.totalTasks, icon: ClipboardList },
        { title: "In Progress", value: stats.inProgress, icon: PlayCircle },
        { title: "Active Agents", value: stats.activeAgents, icon: Users },
        { title: "Completed Today", value: stats.completedToday, icon: CheckCircle2 },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {cards.map((card) => (
                <Card key={card.title} className="bg-card/60">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                            {card.title}
                            <card.icon className="h-4 w-4 text-muted-foreground/80" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-semibold">{card.value}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
