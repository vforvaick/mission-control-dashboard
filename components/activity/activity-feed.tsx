"use client";

import { useState } from "react";
import { ActivityItem, agentColors } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    CheckCircle2,
    ArrowRight,
    Plus,
    MessageSquare,
    AtSign,
    User,
    RefreshCw,
    Filter
} from "lucide-react";

// Mock activity data - will be replaced with Convex real-time data
const mockActivities: ActivityItem[] = [
    {
        _id: "1",
        type: "task_completed",
        agentHandle: "killua",
        taskTitle: "Set up project infrastructure",
        message: "completed task",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
        _id: "2",
        type: "agent_claimed",
        agentHandle: "yor",
        taskTitle: "Design agent avatar system",
        message: "claimed task",
        timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    },
    {
        _id: "3",
        type: "task_moved",
        agentHandle: "lena",
        taskTitle: "Review quarterly report",
        message: "moved task to In Progress",
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    },
    {
        _id: "4",
        type: "comment",
        agentHandle: "shiroe",
        taskTitle: "Analyze market trends",
        message: "Added comment: 'Market volatility detected, adjusting parameters'",
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
    {
        _id: "5",
        type: "mention",
        agentHandle: "demiurge",
        taskTitle: "Security audit",
        message: "mentioned @killua: 'Please review the API endpoints'",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
        _id: "6",
        type: "task_created",
        agentHandle: "lelouch",
        taskTitle: "Strategic planning Q2",
        message: "created new task",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
        _id: "7",
        type: "agent_released",
        agentHandle: "senku",
        taskTitle: "Research new frameworks",
        message: "released task",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
        _id: "8",
        type: "task_completed",
        agentHandle: "albedo",
        taskTitle: "Update documentation",
        message: "completed task",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
        _id: "9",
        type: "task_moved",
        agentHandle: "meliodas",
        taskTitle: "Deploy staging environment",
        message: "moved task to Review",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
        _id: "10",
        type: "comment",
        agentHandle: "cc",
        taskTitle: "Schedule coordination",
        message: "Added comment: 'Pizza delivery scheduled for 3 PM 🍕'",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
];

const filters = [
    { value: "all", label: "All", icon: RefreshCw },
    { value: "task_completed", label: "Completed", icon: CheckCircle2 },
    { value: "task_moved", label: "Moved", icon: ArrowRight },
    { value: "task_created", label: "Created", icon: Plus },
    { value: "comment", label: "Comments", icon: MessageSquare },
    { value: "mention", label: "Mentions", icon: AtSign },
];

const activityIcons = {
    task_completed: CheckCircle2,
    task_moved: ArrowRight,
    task_created: Plus,
    agent_claimed: User,
    agent_released: User,
    comment: MessageSquare,
    mention: AtSign,
};

const activityColors = {
    task_completed: "text-green-400 bg-green-400/10",
    task_moved: "text-blue-400 bg-blue-400/10",
    task_created: "text-purple-400 bg-purple-400/10",
    agent_claimed: "text-yellow-400 bg-yellow-400/10",
    agent_released: "text-zinc-400 bg-zinc-400/10",
    comment: "text-cyan-400 bg-cyan-400/10",
    mention: "text-orange-400 bg-orange-400/10",
};

function formatTimeAgo(timestamp: string): string {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
}

export function ActivityFeed() {
    const [activeFilter, setActiveFilter] = useState("all");

    const filteredActivities = activeFilter === "all"
        ? mockActivities
        : mockActivities.filter((a) => a.type === activeFilter);

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
                                const Icon = activityIcons[activity.type];
                                return (
                                    <div
                                        key={activity._id}
                                        className="flex gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        {/* Activity Icon */}
                                        <div className={cn(
                                            "h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0",
                                            activityColors[activity.type]
                                        )}>
                                            <Icon className="h-4 w-4" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Avatar className="h-5 w-5 border border-border">
                                                    <AvatarImage src={`/avatars/${activity.agentHandle}.png`} />
                                                    <AvatarFallback
                                                        className="text-[8px] font-bold text-white"
                                                        style={{ backgroundColor: agentColors[activity.agentHandle || ""] || "#6366f1" }}
                                                    >
                                                        {(activity.agentHandle || "?").slice(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium text-sm text-foreground">
                                                    @{activity.agentHandle}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatTimeAgo(activity.timestamp)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {activity.message}
                                                {activity.taskTitle && (
                                                    <span className="text-foreground font-medium ml-1">
                                                        &quot;{activity.taskTitle}&quot;
                                                    </span>
                                                )}
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
                                <div className="text-2xl font-bold text-green-400">12</div>
                                <div className="text-xs text-muted-foreground">Tasks Completed</div>
                            </div>
                            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <div className="text-2xl font-bold text-blue-400">8</div>
                                <div className="text-xs text-muted-foreground">In Progress</div>
                            </div>
                            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                <div className="text-2xl font-bold text-purple-400">5</div>
                                <div className="text-xs text-muted-foreground">New Tasks</div>
                            </div>
                            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                <div className="text-2xl font-bold text-yellow-400">10</div>
                                <div className="text-xs text-muted-foreground">Active Agents</div>
                            </div>
                        </div>
                    </div>

                    {/* Top Agents */}
                    <div className="glass-card rounded-xl p-4">
                        <h3 className="font-semibold mb-4">Top Agents Today</h3>
                        <div className="space-y-3">
                            {[
                                { handle: "killua", tasks: 5 },
                                { handle: "albedo", tasks: 4 },
                                { handle: "yor", tasks: 3 },
                                { handle: "senku", tasks: 2 },
                            ].map((agent, i) => (
                                <div key={agent.handle} className="flex items-center gap-3">
                                    <span className="text-xs text-muted-foreground w-4">#{i + 1}</span>
                                    <Avatar className="h-8 w-8 border border-border">
                                        <AvatarImage src={`/avatars/${agent.handle}.png`} />
                                        <AvatarFallback
                                            className="text-xs font-bold text-white"
                                            style={{ backgroundColor: agentColors[agent.handle] || "#6366f1" }}
                                        >
                                            {agent.handle.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="flex-1 text-sm font-medium">@{agent.handle}</span>
                                    <Badge variant="secondary" className="text-xs">
                                        {agent.tasks} tasks
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Mentions */}
                    <div className="glass-card rounded-xl p-4">
                        <h3 className="font-semibold mb-4">Recent Mentions</h3>
                        <div className="space-y-2">
                            {mockActivities
                                .filter((a) => a.type === "mention")
                                .slice(0, 3)
                                .map((activity) => (
                                    <div key={activity._id} className="p-2 rounded-lg bg-muted/30 text-sm">
                                        <span className="text-orange-400">@{activity.agentHandle}</span>
                                        <span className="text-muted-foreground"> {activity.message}</span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
