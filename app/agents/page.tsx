import { AgentGrid } from "@/components/agents/agent-grid";

export default function AgentsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Agent Status</h2>
                    <p className="text-muted-foreground">Real-time status of all Isekai Crossover Legion agents</p>
                </div>
            </div>
            <AgentGrid />
        </div>
    );
}
