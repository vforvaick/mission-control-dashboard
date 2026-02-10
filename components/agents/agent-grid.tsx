"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AgentCard } from "./agent-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Agent, AgentLayer, AgentStatus } from "@/lib/types";

const layerMap: Record<string, { label: string; color: string }> = {
    strategic: { label: "Strategic", color: "bg-primary text-primary-foreground" },
    analyst: { label: "Analyst", color: "bg-accent text-accent-foreground" },
    lead: { label: "Lead", color: "bg-purple-500 text-white" },
    specialist: { label: "Specialist", color: "bg-blue-500 text-white" },
};

// Map Convex agent status to dashboard status
function mapStatus(status: string): AgentStatus {
    switch (status) {
        case "online": return "online";
        case "working": return "busy";
        case "idle": return "idle";
        case "sleeping": return "offline";
        case "offline": return "offline";
        default: return "offline";
    }
}

// Derive layer from role name if not in DB
function deriveLayer(role: string): AgentLayer {
    const r = role.toLowerCase();
    if (r.includes("strategist") || r.includes("supreme")) return "strategic";
    if (r.includes("chief") || r.includes("staff") || r.includes("analyst")) return "analyst";
    if (r.includes("lead")) return "lead";
    return "specialist";
}

export function AgentGrid() {
    const agents = useQuery(api.agents.list);
    const boards = useQuery(api.boards.list);

    if (!agents || !boards) {
        return (
            <div className="space-y-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-4">
                        <Skeleton className="h-8 w-48" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {[1, 2].map((j) => (
                                <Skeleton key={j} className="h-48 w-full rounded-xl" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Build board name map for domain display
    const boardNameMap: Record<string, string> = {};
    for (const b of boards) {
        boardNameMap[b._id] = b.name.replace(/ (Operations|Console|Center|Life)$/, "");
    }

    // Map Convex agents to dashboard Agent type
    const mappedAgents: Agent[] = agents.map((a) => ({
        _id: a._id,
        handle: a.handle.replace(/^@/, ""), // Strip @ if present
        name: a.name,
        source: a.source ?? "Unknown",
        role: a.role,
        layer: a.layer ?? deriveLayer(a.role),
        status: mapStatus(a.status),
        currentTaskId: a.currentTaskId ? String(a.currentTaskId) : undefined,
        lastHeartbeat: a.lastHeartbeat ? new Date(a.lastHeartbeat).toISOString() : undefined,
        skills: [] as string[], // Could be extended later
        domains: a.boardIds.map((id) => boardNameMap[id] || "Unknown"),
        personality: a.personality,
        emoji: a.emoji ?? "🤖",
    }));

    // Group by layer
    const layerOrder: AgentLayer[] = ["strategic", "analyst", "lead", "specialist"];
    const grouped: Record<string, Agent[]> = {};
    for (const agent of mappedAgents) {
        if (!grouped[agent.layer]) grouped[agent.layer] = [];
        grouped[agent.layer].push(agent);
    }

    return (
        <div className="space-y-8">
            {layerOrder.map((layer) => {
                const layerAgents = grouped[layer];
                if (!layerAgents || layerAgents.length === 0) return null;
                const info = layerMap[layer] || { label: layer, color: "bg-zinc-500 text-white" };
                return (
                    <div key={layer} className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${info.color}`}>
                                {info.label} Layer
                            </span>
                            <span className="text-sm text-muted-foreground">
                                {layerAgents.length} {layerAgents.length === 1 ? "agent" : "agents"}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {layerAgents.map((agent) => (
                                <AgentCard key={agent._id} agent={agent} />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
