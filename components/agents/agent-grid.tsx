"use client";

import { AgentCard } from "./agent-card";
import { Agent } from "@/lib/types";

// Mock agent data - will be replaced with Convex real-time data
const agents: Agent[] = [
    {
        _id: "1",
        handle: "lelouch",
        name: "Lelouch vi Britannia",
        source: "Code Geass",
        role: "Supreme Strategist",
        layer: "strategic",
        status: "online",
        skills: ["strategy", "orchestration", "crisis-management"],
        domains: ["Office", "Trading", "Personal", "Deployment"],
        personality: "Commanding charisma, strategic brilliance",
        emoji: "♟️",
    },
    {
        _id: "2",
        handle: "cc",
        name: "C.C.",
        source: "Code Geass",
        role: "Chief of Staff",
        layer: "secretary",
        status: "online",
        skills: ["logistics", "data-fetching", "memory"],
        domains: ["Office", "Personal"],
        personality: "Mysterious accomplice, efficient",
        emoji: "🍕",
    },
    {
        _id: "3",
        handle: "lena",
        name: "Vladilena Milizé",
        source: "86",
        role: "Office Lead",
        layer: "tactical",
        status: "busy",
        currentTaskId: "task-123",
        skills: ["office-ops", "coordination", "documentation"],
        domains: ["Office"],
        personality: "Dedicated, empathetic leader",
        emoji: "💼",
    },
    {
        _id: "4",
        handle: "shiroe",
        name: "Shiroe",
        source: "Log Horizon",
        role: "Trading Lead",
        layer: "tactical",
        status: "idle",
        skills: ["trading", "analysis", "market-research"],
        domains: ["Trading"],
        personality: "Calculating strategist",
        emoji: "📊",
    },
    {
        _id: "5",
        handle: "ainz",
        name: "Ainz Ooal Gown",
        source: "Overlord",
        role: "Personal Lead",
        layer: "tactical",
        status: "online",
        skills: ["personal-ops", "learning", "project-management"],
        domains: ["Personal"],
        personality: "Supreme being, cautious ruler",
        emoji: "💀",
    },
    {
        _id: "6",
        handle: "meliodas",
        name: "Meliodas",
        source: "Seven Deadly Sins",
        role: "Deployment Lead",
        layer: "tactical",
        status: "busy",
        currentTaskId: "task-456",
        skills: ["infrastructure", "deployment", "devops"],
        domains: ["Deployment"],
        personality: "Fearless, unstoppable",
        emoji: "⚔️",
    },
    {
        _id: "7",
        handle: "killua",
        name: "Killua Zoldyck",
        source: "Hunter x Hunter",
        role: "Backend Specialist",
        layer: "operational",
        status: "online",
        skills: ["backend", "apis", "databases"],
        domains: ["Deployment", "Office"],
        personality: "Lightning fast executor",
        emoji: "⚡",
    },
    {
        _id: "8",
        handle: "yor",
        name: "Yor Forger",
        source: "Spy x Family",
        role: "Frontend Specialist",
        layer: "operational",
        status: "busy",
        currentTaskId: "task-789",
        skills: ["frontend", "ui-ux", "design"],
        domains: ["Deployment"],
        personality: "Elegant assassin, precise",
        emoji: "🌹",
    },
    {
        _id: "9",
        handle: "rimuru",
        name: "Rimuru Tempest",
        source: "That Time I Got Reincarnated as a Slime",
        role: "Data Analyst",
        layer: "operational",
        status: "idle",
        skills: ["data-analysis", "visualization", "etl"],
        domains: ["Trading"],
        personality: "Adaptable, absorbs knowledge",
        emoji: "🔮",
    },
    {
        _id: "10",
        handle: "albedo",
        name: "Albedo",
        source: "Overlord",
        role: "Admin Specialist",
        layer: "operational",
        status: "online",
        skills: ["documentation", "admin", "organization"],
        domains: ["Office"],
        personality: "Devoted, perfectionist",
        emoji: "📋",
    },
    {
        _id: "11",
        handle: "kazuma",
        name: "Kazuma Satou",
        source: "KonoSuba",
        role: "QA Specialist",
        layer: "operational",
        status: "offline",
        skills: ["testing", "quality-assurance", "debugging"],
        domains: ["Deployment"],
        personality: "Pessimistic but lucky",
        emoji: "🎯",
    },
    {
        _id: "12",
        handle: "senku",
        name: "Senku Ishigami",
        source: "Dr. Stone",
        role: "Research Specialist",
        layer: "operational",
        status: "busy",
        currentTaskId: "task-research",
        skills: ["research", "experiments", "science"],
        domains: ["Office", "Trading", "Personal", "Deployment"],
        personality: "Ten billion percent genius",
        emoji: "🧪",
    },
    {
        _id: "13",
        handle: "demiurge",
        name: "Demiurge",
        source: "Overlord",
        role: "Security Auditor",
        layer: "operational",
        status: "online",
        skills: ["security", "auditing", "vulnerability-scanning"],
        domains: ["Deployment"],
        personality: "Paranoid, detail-oriented",
        emoji: "🛡️",
    },
];

const layerLabels = {
    strategic: { label: "Strategic", color: "bg-primary text-primary-foreground" },
    secretary: { label: "Secretary", color: "bg-accent text-accent-foreground" },
    tactical: { label: "Tactical", color: "bg-purple-500 text-white" },
    operational: { label: "Operational", color: "bg-blue-500 text-white" },
};

export function AgentGrid() {
    const groupedAgents = {
        strategic: agents.filter((a) => a.layer === "strategic"),
        secretary: agents.filter((a) => a.layer === "secretary"),
        tactical: agents.filter((a) => a.layer === "tactical"),
        operational: agents.filter((a) => a.layer === "operational"),
    };

    return (
        <div className="space-y-8">
            {Object.entries(groupedAgents).map(([layer, layerAgents]) => (
                <div key={layer} className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${layerLabels[layer as keyof typeof layerLabels].color}`}>
                            {layerLabels[layer as keyof typeof layerLabels].label} Layer
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
            ))}
        </div>
    );
}
