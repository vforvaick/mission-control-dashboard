import { internalMutation } from "../_generated/server";

export const markDormant = internalMutation({
    args: {},
    handler: async (ctx) => {
        const dormantHandles = ["killua", "yor", "lena", "ainz", "albedo", "kazuma"];
        const agents = await ctx.db.query("agents").collect();

        let updated = 0;
        for (const agent of agents) {
            if (dormantHandles.includes(agent.handle)) {
                await ctx.db.patch(agent._id, {
                    dormant: true,
                    status: "sleeping",
                });
                updated++;
            } else {
                await ctx.db.patch(agent._id, { dormant: false });
            }
        }

        return { updated };
    },
});
