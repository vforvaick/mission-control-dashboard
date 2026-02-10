import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ═══════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════

export const list = query({
    args: { boardId: v.optional(v.id("boards")) },
    handler: async (ctx, args) => {
        if (args.boardId) {
            return await ctx.db
                .query("tasks")
                .withIndex("by_board", (q) => q.eq("boardId", args.boardId!))
                .collect();
        }
        return await ctx.db.query("tasks").collect();
    },
});

export const get = query({
    args: { id: v.id("tasks") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const getByStatus = query({
    args: {
        status: v.union(
            v.literal("backlog"),
            v.literal("todo"),
            v.literal("in_progress"),
            v.literal("review"),
            v.literal("done")
        ),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("tasks")
            .withIndex("by_status", (q) => q.eq("status", args.status))
            .collect();
    },
});

// ═══════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════

export const create = mutation({
    args: {
        boardId: v.id("boards"),
        title: v.string(),
        description: v.optional(v.string()),
        priority: v.union(
            v.literal("low"),
            v.literal("medium"),
            v.literal("high"),
            v.literal("urgent")
        ),
        tags: v.optional(v.array(v.string())),
        dueDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const existingTasks = await ctx.db
            .query("tasks")
            .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
            .collect();

        const order = existingTasks.length;

        const taskId = await ctx.db.insert("tasks", {
            boardId: args.boardId,
            title: args.title,
            description: args.description,
            status: "backlog",
            priority: args.priority,
            order,
            tags: args.tags,
            dueDate: args.dueDate,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        return taskId;
    },
});

export const update = mutation({
    args: {
        id: v.id("tasks"),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        priority: v.optional(v.union(
            v.literal("low"),
            v.literal("medium"),
            v.literal("high"),
            v.literal("urgent")
        )),
        tags: v.optional(v.array(v.string())),
        dueDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
        return { success: true };
    },
});

export const move = mutation({
    args: {
        id: v.id("tasks"),
        status: v.union(
            v.literal("backlog"),
            v.literal("todo"),
            v.literal("in_progress"),
            v.literal("review"),
            v.literal("done")
        ),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            status: args.status,
            updatedAt: Date.now(),
        });
        return { success: true };
    },
});

export const claim = mutation({
    args: {
        id: v.id("tasks"),
        agentId: v.id("agents"),
    },
    handler: async (ctx, args) => {
        const task = await ctx.db.get(args.id);
        if (!task) throw new Error("Task not found");
        if (task.assigneeId) throw new Error("Task already claimed");

        await ctx.db.patch(args.id, {
            assigneeId: args.agentId,
            status: "in_progress",
            claimedAt: Date.now(),
            updatedAt: Date.now(),
            executionStatus: "pending",
        });

        return { success: true };
    },
});

export const complete = mutation({
    args: {
        id: v.id("tasks"),
        success: v.boolean(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            status: args.success ? "done" : "review",
            completedAt: Date.now(),
            updatedAt: Date.now(),
            executionStatus: args.success ? "completed" : "failed",
        });
        return { success: true };
    },
});

export const appendExecutionLog = mutation({
    args: {
        id: v.id("tasks"),
        logEntry: v.object({
            timestamp: v.number(),
            type: v.union(v.literal("command"), v.literal("output"), v.literal("error"), v.literal("info")),
            content: v.string(),
        }),
    },
    handler: async (ctx, args) => {
        const task = await ctx.db.get(args.id);
        if (!task) throw new Error("Task not found");

        const existingLog = task.executionLog ?? [];
        // Ring buffer limit: 1000 entries
        const newLog = [...existingLog, args.logEntry].slice(-1000);

        await ctx.db.patch(args.id, { executionLog: newLog });
        return { success: true };
    },
});

export const setExecutionStatus = mutation({
    args: {
        id: v.id("tasks"),
        executionStatus: v.union(
            v.literal("pending"),
            v.literal("running"),
            v.literal("pending_approval"),
            v.literal("completed"),
            v.literal("failed")
        ),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            executionStatus: args.executionStatus,
            updatedAt: Date.now(),
        });
        return { success: true };
    },
});
