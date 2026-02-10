import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ═══════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════

export const listByTask = query({
    args: { taskId: v.id("tasks") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("comments")
            .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
            .collect();
    },
});

// ═══════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════

export const create = mutation({
    args: {
        taskId: v.id("tasks"),
        parentId: v.optional(v.id("comments")),
        authorType: v.union(v.literal("agent"), v.literal("human")),
        authorId: v.string(),
        content: v.string(),
        mentions: v.optional(v.array(v.id("agents"))),
    },
    handler: async (ctx, args) => {
        const commentId = await ctx.db.insert("comments", {
            ...args,
            createdAt: Date.now(),
        });

        // Create subscriptions for mentioned agents
        if (args.mentions && args.mentions.length > 0) {
            for (const agentId of args.mentions) {
                await ctx.db.insert("subscriptions", {
                    agentId,
                    taskId: args.taskId,
                    commentId,
                    mentionedAt: Date.now(),
                    acknowledged: false,
                });
            }
        }

        return commentId;
    },
});
