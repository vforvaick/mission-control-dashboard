import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ═══════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════

export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("agents").collect();
    },
});

export const get = query({
    args: { handle: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("agents")
            .withIndex("by_handle", (q) => q.eq("handle", args.handle))
            .first();
    },
});

export const getById = query({
    args: { id: v.id("agents") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// ═══════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════

export const heartbeat = mutation({
    args: {
        handle: v.string(),
        status: v.optional(v.union(
            v.literal("online"),
            v.literal("working"),
            v.literal("idle"),
            v.literal("sleeping"),
            v.literal("offline")
        )),
    },
    handler: async (ctx, args) => {
        const agent = await ctx.db
            .query("agents")
            .withIndex("by_handle", (q) => q.eq("handle", args.handle))
            .first();

        if (!agent) throw new Error(`Agent ${args.handle} not found`);

        await ctx.db.patch(agent._id, {
            status: args.status ?? "online",
            lastHeartbeat: Date.now(),
        });

        return { success: true, agentId: agent._id };
    },
});

export const updateStatus = mutation({
    args: {
        handle: v.string(),
        status: v.union(
            v.literal("online"),
            v.literal("working"),
            v.literal("idle"),
            v.literal("sleeping"),
            v.literal("offline")
        ),
    },
    handler: async (ctx, args) => {
        const agent = await ctx.db
            .query("agents")
            .withIndex("by_handle", (q) => q.eq("handle", args.handle))
            .first();

        if (!agent) throw new Error(`Agent ${args.handle} not found`);

        await ctx.db.patch(agent._id, { status: args.status });
        return { success: true };
    },
});

export const updateWorkingMemory = mutation({
    args: {
        handle: v.string(),
        workingMemory: v.object({
            lastContext: v.optional(v.string()),
            currentFocus: v.optional(v.string()),
            recentTasks: v.optional(v.array(v.string())),
            reflections: v.optional(v.array(v.string())),
            updatedAt: v.number(),
        }),
    },
    handler: async (ctx, args) => {
        const agent = await ctx.db
            .query("agents")
            .withIndex("by_handle", (q) => q.eq("handle", args.handle))
            .first();

        if (!agent) throw new Error(`Agent ${args.handle} not found`);

        await ctx.db.patch(agent._id, { workingMemory: args.workingMemory });
        return { success: true };
    },
});

export const claimTask = mutation({
    args: {
        handle: v.string(),
        taskId: v.id("tasks"),
    },
    handler: async (ctx, args) => {
        const agent = await ctx.db
            .query("agents")
            .withIndex("by_handle", (q) => q.eq("handle", args.handle))
            .first();

        if (!agent) throw new Error(`Agent ${args.handle} not found`);

        await ctx.db.patch(agent._id, {
            currentTaskId: args.taskId,
            status: "working",
        });

        return { success: true };
    },
});

export const releaseTask = mutation({
    args: { handle: v.string() },
    handler: async (ctx, args) => {
        const agent = await ctx.db
            .query("agents")
            .withIndex("by_handle", (q) => q.eq("handle", args.handle))
            .first();

        if (!agent) throw new Error(`Agent ${args.handle} not found`);

        await ctx.db.patch(agent._id, {
            currentTaskId: undefined,
            status: "idle",
        });

        return { success: true };
    },
});
