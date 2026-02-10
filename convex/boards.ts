import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ═══════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════

export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("boards").collect();
    },
});

export const get = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("boards")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();
    },
});

export const getById = query({
    args: { id: v.id("boards") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// ═══════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════

export const create = mutation({
    args: {
        name: v.string(),
        slug: v.string(),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
        color: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("boards")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();

        if (existing) throw new Error(`Board with slug '${args.slug}' already exists`);

        const boardId = await ctx.db.insert("boards", {
            ...args,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        return boardId;
    },
});

export const update = mutation({
    args: {
        id: v.id("boards"),
        name: v.optional(v.string()),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
        color: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
        return { success: true };
    },
});
