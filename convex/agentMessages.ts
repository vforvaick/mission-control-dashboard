import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ═══════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════

export const listUnacknowledged = query({
    args: { toAgentId: v.id("agents") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("agentMessages")
            .withIndex("by_recipient", (q) =>
                q.eq("toAgentId", args.toAgentId).eq("acknowledged", false)
            )
            .collect();
    },
});

export const listSent = query({
    args: { fromAgentId: v.id("agents") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("agentMessages")
            .withIndex("by_sender", (q) => q.eq("fromAgentId", args.fromAgentId))
            .collect();
    },
});

// ═══════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════

export const send = mutation({
    args: {
        fromAgentId: v.id("agents"),
        toAgentId: v.id("agents"),
        messageType: v.union(
            v.literal("order"),
            v.literal("report"),
            v.literal("question"),
            v.literal("suggestion")
        ),
        content: v.string(),
        taskId: v.optional(v.id("tasks")),
    },
    handler: async (ctx, args) => {
        const messageId = await ctx.db.insert("agentMessages", {
            ...args,
            acknowledged: false,
            createdAt: Date.now(),
        });

        return messageId;
    },
});

export const acknowledge = mutation({
    args: {
        id: v.id("agentMessages"),
        response: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            acknowledged: true,
            response: args.response,
        });

        return { success: true };
    },
});
