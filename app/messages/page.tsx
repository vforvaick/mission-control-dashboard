"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function formatAgo(timestamp: number) {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export default function MessagesPage() {
    const rawAgents = useQuery(api.agents.list);
    const rawMessages = useQuery(api.agentMessages.listAll, { limit: 300 });

    const agentById = useMemo(() => {
        const map = new Map<string, string>();
        for (const agent of rawAgents ?? []) {
            map.set(String(agent._id), agent.handle.replace(/^@/, ""));
        }
        return map;
    }, [rawAgents]);

    const conversations = useMemo(() => {
        type MessageRow = NonNullable<typeof rawMessages>[number];
        const bucket = new Map<string, MessageRow[]>();
        for (const msg of rawMessages ?? []) {
            const key = `${msg.fromAgentId}->${msg.toAgentId}`;
            const arr = bucket.get(key) ?? [];
            arr.push(msg);
            bucket.set(key, arr);
        }
        return Array.from(bucket.entries())
            .map(([id, thread]) => ({
                id,
                thread: [...thread].sort((a, b) => b.createdAt - a.createdAt),
            }))
            .sort((a, b) => (b.thread[0]?.createdAt ?? 0) - (a.thread[0]?.createdAt ?? 0));
    }, [rawMessages]);

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const selectedConversation = conversations.find((c) => c.id === selectedId) ?? conversations[0];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Agent Messages</h2>
                <p className="text-muted-foreground">Direct communication between agents</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Conversations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {conversations.length === 0 && (
                            <p className="text-sm text-muted-foreground">No messages found.</p>
                        )}
                        {conversations.map((conv) => {
                            const latest = conv.thread[0];
                            const from = latest ? agentById.get(String(latest.fromAgentId)) ?? "unknown" : "unknown";
                            const to = latest ? agentById.get(String(latest.toAgentId)) ?? "unknown" : "unknown";
                            return (
                                <Button
                                    key={conv.id}
                                    variant={selectedConversation?.id === conv.id ? "default" : "outline"}
                                    className="w-full justify-between"
                                    onClick={() => setSelectedId(conv.id)}
                                >
                                    <span className="truncate">@{from} → @{to}</span>
                                    <Badge variant="secondary" className="ml-2 text-[10px]">{conv.thread.length}</Badge>
                                </Button>
                            );
                        })}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Thread</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {!selectedConversation && (
                            <p className="text-sm text-muted-foreground">Select a conversation.</p>
                        )}
                        {selectedConversation?.thread.map((msg) => {
                            const from = agentById.get(String(msg.fromAgentId)) ?? "unknown";
                            const to = agentById.get(String(msg.toAgentId)) ?? "unknown";
                            return (
                                <div key={msg._id} className="rounded-lg border border-border/60 p-3">
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <p className="text-sm font-medium">
                                            From: @{from} → To: @{to}
                                        </p>
                                        <span className="text-xs text-muted-foreground">
                                            {formatAgo(msg.createdAt)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline">{msg.messageType}</Badge>
                                        {!msg.acknowledged && <Badge variant="secondary">Unacknowledged</Badge>}
                                    </div>
                                    <p className="text-sm">{msg.content}</p>
                                    {msg.response && (
                                        <div className="mt-2 rounded-md bg-muted/40 p-2">
                                            <p className="text-xs text-muted-foreground">Response</p>
                                            <p className="text-sm">{msg.response}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
