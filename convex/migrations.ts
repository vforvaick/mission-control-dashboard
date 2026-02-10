import { internalMutation } from "./_generated/server";

// One-time migration: Add layer, source, emoji to existing agents
export const migrateAgentFields = internalMutation({
    args: {},
    handler: async (ctx) => {
        const agents = await ctx.db.query("agents").collect();

        const agentMeta: Record<string, { layer: string; source: string; emoji: string }> = {
            "lelouch": { layer: "strategic", source: "Code Geass", emoji: "♟️" },
            "@lelouch": { layer: "strategic", source: "Code Geass", emoji: "♟️" },
            "cc": { layer: "analyst", source: "Code Geass", emoji: "🍕" },
            "@cc": { layer: "analyst", source: "Code Geass", emoji: "🍕" },
            "lena": { layer: "lead", source: "86", emoji: "💼" },
            "@lena": { layer: "lead", source: "86", emoji: "💼" },
            "shiroe": { layer: "lead", source: "Log Horizon", emoji: "📊" },
            "@shiroe": { layer: "lead", source: "Log Horizon", emoji: "📊" },
            "ainz": { layer: "lead", source: "Overlord", emoji: "💀" },
            "@ainz": { layer: "lead", source: "Overlord", emoji: "💀" },
            "meliodas": { layer: "lead", source: "Seven Deadly Sins", emoji: "⚔️" },
            "@meliodas": { layer: "lead", source: "Seven Deadly Sins", emoji: "⚔️" },
            "killua": { layer: "specialist", source: "Hunter x Hunter", emoji: "⚡" },
            "@killua": { layer: "specialist", source: "Hunter x Hunter", emoji: "⚡" },
            "yor": { layer: "specialist", source: "Spy x Family", emoji: "🌹" },
            "@yor": { layer: "specialist", source: "Spy x Family", emoji: "🌹" },
            "rimuru": { layer: "specialist", source: "That Time I Got Reincarnated as a Slime", emoji: "🔮" },
            "@rimuru": { layer: "specialist", source: "That Time I Got Reincarnated as a Slime", emoji: "🔮" },
            "albedo": { layer: "specialist", source: "Overlord", emoji: "📋" },
            "@albedo": { layer: "specialist", source: "Overlord", emoji: "📋" },
            "kazuma": { layer: "specialist", source: "KonoSuba", emoji: "🎯" },
            "@kazuma": { layer: "specialist", source: "KonoSuba", emoji: "🎯" },
            "senku": { layer: "specialist", source: "Dr. Stone", emoji: "🧪" },
            "@senku": { layer: "specialist", source: "Dr. Stone", emoji: "🧪" },
            "demiurge": { layer: "specialist", source: "Overlord", emoji: "🛡️" },
            "@demiurge": { layer: "specialist", source: "Overlord", emoji: "🛡️" },
        };

        let updated = 0;
        for (const agent of agents) {
            const meta = agentMeta[agent.handle];
            if (meta) {
                // Also strip @ from handle if present
                const cleanHandle = agent.handle.replace(/^@/, "");
                await ctx.db.patch(agent._id, {
                    layer: meta.layer as "strategic" | "analyst" | "lead" | "specialist",
                    source: meta.source,
                    emoji: meta.emoji,
                    handle: cleanHandle,
                });
                updated++;
            }
        }

        console.log(`✅ Migration complete: ${updated} agents updated with layer/source/emoji.`);
        return { success: true, updated };
    },
});
