"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { agentColors } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
    CheckCircle2,
    ArrowRight,
    Plus,
    MessageSquare,
    AtSign,
    User,
    RefreshCw,
    Filter,
    Zap,
    Shield,
    AlertTriangle,
} from "lucide-react";

// Map Convex actionType to dashboard filter types
type FilterType = "all" | "task_completed" | "task_moved" | "task_created" | "task_claimed" | "comment_added" | "agent_mentioned" | "agent_heartbeat";

const filters: { value: FilterType; label: string; icon: typeof CheckCircle2 }[] = [
    { value: "all", label: "All", icon: RefreshCw },
    { value: "task_completed", label: "Completed", icon: CheckCircle2 },
    { value: "task_moved", label: "Moved", icon: ArrowRight },
    { value: "task_created", label: "Created", icon: Plus },
    { value: "task_claimed", label: "Claimed", icon: User },
    { value: "comment_added", label: "Comments", icon: MessageSquare },
    { value: "agent_mentioned", label: "Mentions", icon: AtSign },
    { value: "agent_heartbeat", label: "Heartbeats", icon: Zap },
];

const activityIcons: Record<string, typeof CheckCircle2> = {
    task_completed: CheckCircle2,
    task_moved: ArrowRight,
    task_created: Plus,
    task_claimed: User,
    task_executing: Zap,
    task_failed: AlertTriangle,
    comment_added: MessageSquare,
    agent_mentioned: AtSign,
    agent_heartbeat: Zap,
    agent_woke_up: Zap,
    agent_sleeping: User,
    agent_message_sent: MessageSquare,
    agent_message_received: MessageSquare,
    agent_spawned: Plus,
    command_executed: Shield,
    praise_given: CheckCircle2,
    refute_posted: AlertTriangle,
    standup: User,
};

const activityColors: Record<string, string> = {
    task_completed: "text-green-400 bg-green-400/10",
    task_moved: "text-blue-400 bg-blue-400/10",
    task_created: "text-purple-400 bg-purple-400/10",
    task_claimed: "text-yellow-400 bg-yellow-400/10",
    task_executing: "text-orange-400 bg-orange-400/10",
    task_failed: "text-red-400 bg-red-400/10",
    comment_added: "text-cyan-400 bg-cyan-400/10",
    agent_mentioned: "text-orange-400 bg-orange-400/10",
    agent_heartbeat: "text-emerald-400 bg-emerald-400/10",
    agent_woke_up: "text-green-400 bg-green-400/10",
    agent_sleeping: "text-zinc-400 bg-zinc-400/10",
    agent_message_sent: "text-blue-400 bg-blue-400/10",
    agent_message_received: "text-cyan-400 bg-cyan-400/10",
    agent_spawned: "text-purple-400 bg-purple-400/10",
    command_executed: "text-yellow-400 bg-yellow-400/10",
    praise_given: "text-pink-400 bg-pink-400/10",
    refute_posted: "text-red-400 bg-red-400/10",
    standup: "text-blue-400 bg-blue-400/10",
};

function formatTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
}

export function ActivityFeed() {
    const [activeFilter, setActiveFilter] = useState<FilterType>("all");
    const rawActivities = useQuery(api.activity.list, { limit: 100 });
    const agents = useQuery(api.agents.list);
    const tasks = useQuery(api.tasks.list, {});

    // Build maps for display
    const agentHandleMap = useMemo(() => {
        const map: Record<string, string> = {};
        if (agents) {
            for (const a of agents) {
                map[a._id] = a.handle;
            }
        }
        return map;
    }, [agents]);

    const taskTitleMap = useMemo(() => {
        const map: Record<string, string> = {};
        if (tasks) {
            for (const t of tasks) {
                map[t._id] = t.title;
            }
        }
        return map;
    }, [tasks]);

    // Derive stats from live data
    const stats = useMemo(() => {
        if (!rawActivities || !agents || !tasks) return null;
        const now = Date.now();
        const today = now - 24 * 60 * 60 * 1000;
        const todayActivities = rawActivities.filter((a) => a.createdAt > today);

        return {
            completed: todayActivities.filter((a) => a.actionType === "task_completed").length,
            inProgress: tasks.filter((t) => t.status === "in_progress").length,
            newTasks: todayActivities.filter((a) => a.actionType === "task_created").length,
            activeAgents: agents.filter((a) => a.status === "online" || a.status === "working").length,
        };
    }, [rawActivities, agents, tasks]);

    if (!rawActivities) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-8 w-24" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Skeleton className="h-[600px] rounded-xl" />
                    <div className="space-y-4">
                        <Skeleton className="h-48 rounded-xl" />
                        <Skeleton className="h-48 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    const filteredActivities = activeFilter === "all"
        ? rawActivities
        : rawActivities.filter((a) => a.actionType === activeFilter);

    return (
        <div className="space-y-4">
            {/* Filter chips */}
            <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-4 w-4 text-muted-foreground" />
                {filters.map((filter) => {
                    const Icon = filter.icon;
                    return (
                        <Button
                            key={filter.value}
                            variant={activeFilter === filter.value ? "default" : "outline"}
                            size="sm"
                            className={cn(
                                "h-8 text-xs gap-1.5",
                                activeFilter === filter.value && "bg-primary text-primary-foreground"
                            )}
                            onClick={() => setActiveFilter(filter.value)}
                        >
                            <Icon className="h-3 w-3" />
                            {filter.label}
                        </Button>
                    );
                })}
            </div>

            {/* Activity list */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Live Feed */}
                <div className="glass-card rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <h3 className="font-semibold">Live Feed</h3>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                            {filteredActivities.length} events
                        </Badge>
                    </div>

                    <ScrollArea className="h-[600px]">
                        <div className="space-y-3 pr-4">
                            {filteredActivities.map((activity, index) => {
                                const Icon = activityIcons[activity.actionType] || Zap;
                                const handle = activity.actorId
                                    ? agentHandleMap[activity.actorId] || activity.actorId
                                    : "system";

                                return (
                                    <div
                                        key={activity._id}
                                        className="flex gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        {/* Activity Icon */}
                                        <div className={cn(
                                            "h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0",
                                            activityColors[activity.actionType] || "text-zinc-400 bg-zinc-400/10"
                                        )}>
                                            <Icon className="h-4 w-4" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Avatar className="h-5 w-5 border border-border">
                                                    <AvatarImage src={`/avatars/${handle}.png`} />
                                                    <AvatarFallback
                                                        className="text-[8px] font-bold text-white"
                                                        style={{ backgroundColor: agentColors[handle] || "#6366f1" }}
                                                    >
                                                        {handle.slice(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium text-sm text-foreground">
                                                    @{handle}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatTimeAgo(activity.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {activity.message}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}

                            {filteredActivities.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                        <RefreshCw className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">No activities match the filter</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Stats Panel */}
                <div className="space-y-4">
                    {/* Today's Summary */}
                    <div className="glass-card rounded-xl p-4">
                        <h3 className="font-semibold mb-4">Today&apos;s Summary</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                                <div className="text-2xl font-bold text-green-400">{stats?.completed ?? 0}</div>
                                <div className="text-xs text-muted-foreground">Tasks Completed</div>
                            </div>
                            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <div className="text-2xl font-bold text-blue-400">{stats?.inProgress ?? 0}</div>
                                <div className="text-xs text-muted-foreground">In Progress</div>
                            </div>
                            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                <div className="text-2xl font-bold text-purple-400">{stats?.newTasks ?? 0}</div>
                                <div className="text-xs text-muted-foreground">New Tasks</div>
                            </div>
                            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                <div className="text-2xl font-bold text-yellow-400">{stats?.activeAgents ?? 0}</div>
                                <div className="text-xs text-muted-foreground">Active Agents</div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Mentions */}
                    <div className="glass-card rounded-xl p-4">
                        <h3 className="font-semibold mb-4">Recent Mentions</h3>
                        <div className="space-y-2">
                            {rawActivities
                                .filter((a) => a.actionType === "agent_mentioned")
                                .slice(0, 5)
                                .map((activity) => {
                                    const handle = activity.actorId
                                        ? agentHandleMap[activity.actorId] || activity.actorId
                                        : "system";
                                    return (
                                        <div key={activity._id} className="p-2 rounded-lg bg-muted/30 text-sm">
                                            <span className="text-orange-400">@{handle}</span>
                                            <span className="text-muted-foreground"> {activity.message}</span>
                                        </div>
                                    );
                                })}
                            {rawActivities.filter((a) => a.actionType === "agent_mentioned").length === 0 && (
                                <p className="text-sm text-muted-foreground">No mentions yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
