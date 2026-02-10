import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ═══════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════

export const listUnacknowledged = query({
    args: { agentId: v.id("agents") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("subscriptions")
            .withIndex("by_agent_unacked", (q) =>
                q.eq("agentId", args.agentId).eq("acknowledged", false)
            )
            .collect();
    },
});

// ═══════════════════════════════════════════════════════════
// MUTATIONS
// ═══════════════════════════════════════════════════════════

export const acknowledge = mutation({
    args: { id: v.id("subscriptions") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { acknowledged: true });
        return { success: true };
    },
});
