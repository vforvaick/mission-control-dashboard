// Type definitions for Mission Control Dashboard

export type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type AgentStatus = "online" | "busy" | "idle" | "offline";

export type Domain = "Office" | "Trading" | "Personal" | "Deployment";

export interface Task {
    _id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    domain: Domain;
    assignedTo?: string;
    createdAt: string;
    updatedAt?: string;
    completedAt?: string;
    executionLog?: string[];
    boardId?: string;
}

export interface Agent {
    _id: string;
    handle: string;
    name: string;
    source: string;
    role: string;
    layer: "strategic" | "secretary" | "tactical" | "operational";
    status: AgentStatus;
    currentTaskId?: string;
    lastHeartbeat?: string;
    skills: string[];
    domains: Domain[];
    personality?: string;
    emoji?: string;
}

export interface Board {
    _id: string;
    name: string;
    domain: Domain;
    description?: string;
    taskCount: number;
}

export interface ActivityItem {
    _id: string;
    type: "task_created" | "task_moved" | "task_completed" | "agent_claimed" | "agent_released" | "comment" | "mention";
    agentHandle?: string;
    taskId?: string;
    taskTitle?: string;
    message: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
}

export interface Comment {
    _id: string;
    taskId: string;
    authorHandle: string;
    content: string;
    createdAt: string;
    mentions?: string[];
}

// Agent persona colors for avatar backgrounds
export const agentColors: Record<string, string> = {
    lelouch: "#8B0000", // Dark red
    cc: "#2F4F4F", // Dark slate
    lena: "#4682B4", // Steel blue
    shiroe: "#9370DB", // Medium purple
    ainz: "#800080", // Purple
    meliodas: "#FFD700", // Gold
    killua: "#4169E1", // Royal blue
    yor: "#DC143C", // Crimson
    rimuru: "#40E0D0", // Turquoise
    albedo: "#FFFAF0", // Floral white
    kazuma: "#32CD32", // Lime green
    senku: "#00FF7F", // Spring green
    demiurge: "#8B0000", // Dark red
};

// Status color utilities
export const statusColors: Record<TaskStatus, string> = {
    backlog: "bg-zinc-500",
    todo: "bg-blue-500",
    in_progress: "bg-yellow-500",
    review: "bg-purple-500",
    done: "bg-green-500",
};

export const priorityColors: Record<TaskPriority, string> = {
    low: "text-zinc-400 bg-zinc-400/10",
    medium: "text-blue-400 bg-blue-400/10",
    high: "text-orange-400 bg-orange-400/10",
    urgent: "text-red-400 bg-red-400/10 animate-pulse",
};

export const agentStatusColors: Record<AgentStatus, string> = {
    online: "status-online",
    busy: "status-busy",
    idle: "status-idle",
    offline: "status-offline",
};
