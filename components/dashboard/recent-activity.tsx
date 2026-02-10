"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function formatTimeAgo(timestamp: number): string {
    const diffMs = Date.now() - timestamp;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export function RecentActivity() {
    const rawActivity = useQuery(api.activity.list, { limit: 5 });
    const rawAgents = useQuery(api.agents.list);
    const activity = rawActivity ?? [];

    const agentHandleById = useMemo(() => {
        const map = new Map<string, string>();
        for (const agent of rawAgents ?? []) {
            map.set(String(agent._id), agent.handle.replace(/^@/, ""));
        }
        return map;
    }, [rawAgents]);

    return (
        <Card className="bg-card/60">
            <CardHeader>
                <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {activity.length === 0 && (
                    <p className="text-sm text-muted-foreground">No recent activity.</p>
                )}
                {activity.map((item) => {
                    const actor = item.actorId
                        ? (agentHandleById.get(item.actorId) ?? item.actorId.replace(/^@/, ""))
                        : "system";
                    return (
                        <div key={item._id} className="flex items-start justify-between gap-3 rounded-lg border border-border/60 p-3">
                            <div className="min-w-0">
                                <p className="text-sm font-medium truncate">@{actor}</p>
                                <p className="text-sm text-muted-foreground">{item.message}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <Badge variant="outline" className="text-[10px]">
                                    {item.actionType}
                                </Badge>
                                <span className="text-[11px] text-muted-foreground">{formatTimeAgo(item.createdAt)}</span>
                            </div>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
