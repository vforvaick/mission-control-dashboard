import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ═══════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════

export const list = query({
    args: {
        boardId: v.optional(v.id("boards")),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        let q = ctx.db.query("activity").withIndex("by_time");

        if (args.boardId) {
            q = ctx.db
                .query("activity")
                .withIndex("by_board", (q) => q.eq("boardId", args.boardId!));
        }

        const limit = args.limit ?? 50;
        return await q.order("desc").take(limit);
    },
});

// ═══════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════

export const log = mutation({
    args: {
        boardId: v.optional(v.id("boards")),
        actorType: v.union(v.literal("agent"), v.literal("human"), v.literal("system")),
        actorId: v.optional(v.string()),
        actionType: v.union(
            v.literal("task_created"),
            v.literal("task_claimed"),
            v.literal("task_completed"),
            v.literal("task_moved"),
            v.literal("comment_added"),
            v.literal("agent_mentioned"),
            v.literal("agent_heartbeat")
        ),
        message: v.string(),
    },
    handler: async (ctx, args) => {
        const activityId = await ctx.db.insert("activity", {
            ...args,
            createdAt: Date.now(),
        });

        return activityId;
    },
});
