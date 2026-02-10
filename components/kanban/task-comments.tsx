"use client";

import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquareReply, Send } from "lucide-react";

interface TaskCommentsProps {
    taskId: Id<"tasks">;
}

function formatAgo(timestamp: number) {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export function TaskComments({ taskId }: TaskCommentsProps) {
    const comments = useQuery(api.comments.listByTask, { taskId }) ?? [];
    const rawAgents = useQuery(api.agents.list);
    const createComment = useMutation(api.comments.create);
    type AgentRow = NonNullable<typeof rawAgents>[number];

    const [content, setContent] = useState("");
    const [replyToId, setReplyToId] = useState<Id<"comments"> | undefined>(undefined);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const agentByHandle = useMemo(() => {
        const map = new Map<string, AgentRow>();
        for (const agent of rawAgents ?? []) {
            map.set(agent.handle.replace(/^@/, ""), agent);
        }
        return map;
    }, [rawAgents]);

    const agentById = useMemo(() => {
        const map = new Map<string, AgentRow>();
        for (const agent of rawAgents ?? []) {
            map.set(String(agent._id), agent);
        }
        return map;
    }, [rawAgents]);

    const sortedComments = [...comments].sort((a, b) => a.createdAt - b.createdAt);
    const rootComments = sortedComments.filter((c) => !c.parentId);
    const childrenByParent = new Map<string, typeof comments>();
    for (const c of sortedComments) {
        if (!c.parentId) continue;
        const key = String(c.parentId);
        const arr = childrenByParent.get(key) ?? [];
        arr.push(c);
        childrenByParent.set(key, arr);
    }

    const resolveAuthor = (comment: (typeof comments)[number]) => {
        if (comment.authorType === "agent") {
            const byId = agentById.get(comment.authorId);
            if (byId) return byId.handle.replace(/^@/, "");
        }
        return comment.authorId.replace(/^@/, "");
    };

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        const trimmed = content.trim();
        if (!trimmed) return;

        const mentionedHandles = [...trimmed.matchAll(/@([a-zA-Z0-9_]+)/g)].map((m) => m[1].toLowerCase());
        const mentions = mentionedHandles
            .map((h) => agentByHandle.get(h)?._id)
            .filter((id): id is Id<"agents"> => Boolean(id));

        setSubmitting(true);
        try {
            await createComment({
                taskId,
                parentId: replyToId,
                authorType: "human",
                authorId: "human",
                content: trimmed,
                mentions: mentions.length ? mentions : undefined,
            });
            setContent("");
            setReplyToId(undefined);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add comment");
        } finally {
            setSubmitting(false);
        }
    }

    const renderComment = (comment: (typeof comments)[number], nested = false) => {
        const author = resolveAuthor(comment);
        return (
            <div key={comment._id} className={`rounded-lg border border-border/60 bg-muted/20 p-3 ${nested ? "ml-6 mt-2" : ""}`}>
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={author === "human" ? undefined : `/avatars/${author}.png`} />
                            <AvatarFallback className="text-[10px]">
                                {author.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium truncate">@{author}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{formatAgo(comment.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm whitespace-pre-wrap break-words">{comment.content}</p>
                {!nested && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 mt-2 text-xs"
                        onClick={() => setReplyToId(comment._id)}
                    >
                        <MessageSquareReply className="h-3.5 w-3.5 mr-1" />
                        Reply
                    </Button>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-3">
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {rootComments.length === 0 && (
                    <p className="text-xs text-muted-foreground">No comments yet.</p>
                )}
                {rootComments.map((root) => (
                    <div key={root._id}>
                        {renderComment(root)}
                        {(childrenByParent.get(String(root._id)) ?? []).slice(0, 2).map((child) => renderComment(child, true))}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-2">
                {replyToId && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Replying in thread</span>
                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs"
                            onClick={() => setReplyToId(undefined)}
                        >
                            Cancel
                        </Button>
                    </div>
                )}
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Add a comment... (supports @mentions)"
                    maxLength={5000}
                    rows={3}
                />
                {error && <p className="text-xs text-red-400">{error}</p>}
                <div className="flex justify-end">
                    <Button type="submit" size="sm" disabled={submitting || !content.trim()}>
                        <Send className="h-3.5 w-3.5 mr-1" />
                        {submitting ? "Sending..." : "Send"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
