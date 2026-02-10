"use client";

import Link from "next/link";
import { Agent, agentColors, agentStatusColors } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Zap,
    Briefcase,
    ExternalLink
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { HeartbeatIndicator } from "./heartbeat-indicator";

interface AgentCardProps {
    agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
    const statusLabel = {
        online: "Online",
        busy: "Working",
        idle: "Idle",
        offline: "Offline",
    };

    return (
        <Card className="group hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        <Avatar className="h-14 w-14 border-2 border-border group-hover:border-primary/50 transition-colors">
                            <AvatarImage src={`/avatars/${agent.handle}.png`} alt={agent.name} />
                            <AvatarFallback
                                className="text-lg font-bold text-white"
                                style={{ backgroundColor: agentColors[agent.handle] || "#6366f1" }}
                            >
                                {agent.emoji || agent.handle.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div
                            className={cn(
                                "absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-card",
                                agentStatusColors[agent.status]
                            )}
                        />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                            <Link href={`/agents/${agent.handle}`} className="font-semibold text-foreground truncate hover:text-primary transition-colors">
                                {agent.name}
                            </Link>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Link href={`/agents/${agent.handle}`} className="hover:text-primary transition-colors">
                                @{agent.handle}
                            </Link>
                            <span className="text-muted-foreground/30">•</span>
                            <span className="truncate">{agent.source}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{agent.role}</p>
                    </div>
                </div>

                {/* Status & Current Task */}
                <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                    <div className="flex items-center justify-between">
                        <Badge
                            variant="outline"
                            className={cn(
                                "text-xs gap-1",
                                agent.status === "online" && "text-green-400 border-green-400/30",
                                agent.status === "busy" && "text-yellow-400 border-yellow-400/30",
                                agent.status === "idle" && "text-zinc-400 border-zinc-400/30",
                                agent.status === "offline" && "text-zinc-600 border-zinc-600/30"
                            )}
                        >
                            <div className={cn("h-1.5 w-1.5 rounded-full", agentStatusColors[agent.status])} />
                            {statusLabel[agent.status]}
                        </Badge>

                        {agent.lastHeartbeat ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <HeartbeatIndicator lastHeartbeat={new Date(agent.lastHeartbeat).getTime()} />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Last heartbeat</p>
                                </TooltipContent>
                            </Tooltip>
                        ) : null}
                    </div>

                    {/* Current Task */}
                    {agent.currentTaskId && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-xs">
                            <Briefcase className="h-3.5 w-3.5 text-yellow-400 flex-shrink-0" />
                            <span className="text-muted-foreground truncate">Working on task...</span>
                            <ExternalLink className="h-3 w-3 text-muted-foreground/50 ml-auto flex-shrink-0" />
                        </div>
                    )}

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1">
                        {agent.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-[10px] px-1.5 py-0">
                                {skill}
                            </Badge>
                        ))}
                        {agent.skills.length > 3 && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                +{agent.skills.length - 3}
                            </Badge>
                        )}
                    </div>

                    {/* Domains */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Zap className="h-3 w-3" />
                        <span>{agent.domains.join(", ")}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
