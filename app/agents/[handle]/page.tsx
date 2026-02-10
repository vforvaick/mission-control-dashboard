"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft } from "lucide-react";

function formatTimeAgo(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export default function AgentDetailPage() {
    const params = useParams<{ handle: string }>();
    const handle = (params?.handle ?? "").replace(/^@/, "");
    const data = useQuery(api.agents.getWithTasks, handle ? { handle } : "skip");

    if (!data) {
        return (
            <div className="space-y-4">
                <Link href="/agents">
                    <Button variant="outline" size="sm">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to Agents
                    </Button>
                </Link>
                <Card>
                    <CardContent className="p-6 text-sm text-muted-foreground">
                        Loading agent details...
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { agent, tasks, activity } = data;
    const metrics = agent.healthMetrics ?? {
        tasksCompleted: 0,
        tasksFailed: 0,
        avgCompletionTime: 0,
        contextResets: 0,
        lastErrorAt: undefined,
    };

    return (
        <div className="space-y-6">
            <div>
                <Link href="/agents">
                    <Button variant="outline" size="sm">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back to Agents
                    </Button>
                </Link>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <Avatar className="h-16 w-16 border border-border">
                            <AvatarImage src={`/avatars/${agent.handle}.png`} alt={agent.name} />
                            <AvatarFallback>{agent.handle.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1 min-w-0">
                            <h2 className="text-2xl font-bold truncate">@{agent.handle} - {agent.name}</h2>
                            <p className="text-sm text-muted-foreground">{agent.role}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                                {agent.layer && <Badge variant="outline">{agent.layer}</Badge>}
                                {agent.source && <Badge variant="outline">{agent.source}</Badge>}
                                <Badge variant={agent.status === "online" || agent.status === "working" ? "default" : "secondary"}>
                                    {agent.status}
                                </Badge>
                                {agent.dormant && <Badge variant="secondary">Dormant</Badge>}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Assigned Tasks ({tasks.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {tasks.length === 0 && (
                        <p className="text-sm text-muted-foreground">No assigned tasks.</p>
                    )}
                    {tasks.map((task) => (
                        <div key={task._id} className="rounded-lg border border-border/60 p-3">
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-muted-foreground">
                                {task.status} • {task.priority}
                            </p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Health Metrics</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="rounded-lg border border-border/60 p-3">
                        <p className="text-xs text-muted-foreground">Completed</p>
                        <p className="text-lg font-semibold">{metrics.tasksCompleted}</p>
                    </div>
                    <div className="rounded-lg border border-border/60 p-3">
                        <p className="text-xs text-muted-foreground">Failed</p>
                        <p className="text-lg font-semibold">{metrics.tasksFailed}</p>
                    </div>
                    <div className="rounded-lg border border-border/60 p-3">
                        <p className="text-xs text-muted-foreground">Avg Time</p>
                        <p className="text-lg font-semibold">{metrics.avgCompletionTime}m</p>
                    </div>
                    <div className="rounded-lg border border-border/60 p-3">
                        <p className="text-xs text-muted-foreground">Context Resets</p>
                        <p className="text-lg font-semibold">{metrics.contextResets}</p>
                    </div>
                    <div className="rounded-lg border border-border/60 p-3">
                        <p className="text-xs text-muted-foreground">Last Error</p>
                        <p className="text-lg font-semibold">
                            {metrics.lastErrorAt ? formatTimeAgo(metrics.lastErrorAt) : "-"}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {activity.length === 0 && (
                        <p className="text-sm text-muted-foreground">No recent activity for this agent.</p>
                    )}
                    {activity.map((entry) => (
                        <div key={entry._id} className="rounded-lg border border-border/60 p-3">
                            <p className="text-sm">{entry.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {entry.actionType} • {formatTimeAgo(entry.createdAt)}
                            </p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
