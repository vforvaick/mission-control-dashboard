import { internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const seedTasks = internalMutation({
    args: {},
    handler: async (ctx) => {
        // Check if tasks already exist
        const existingTasks = await ctx.db.query("tasks").collect();
        if (existingTasks.length > 0) {
            console.log(`⚠️ Database already has ${existingTasks.length} tasks. Skipping.`);
            return { skipped: true, existingTasks: existingTasks.length };
        }

        // Get boards
        const boards = await ctx.db.query("boards").collect();
        const boardMap: Record<string, Id<"boards">> = {};
        for (const b of boards) {
            boardMap[b.slug] = b._id;
        }

        if (Object.keys(boardMap).length === 0) {
            console.log("❌ No boards found. Run seed:defaultSeed first.");
            return { error: "No boards" };
        }

        // Get agents for assignment
        const agents = await ctx.db.query("agents").collect();
        const agentMap: Record<string, Id<"agents">> = {};
        for (const a of agents) {
            agentMap[a.handle] = a._id;
        }

        const tasks = [
            // Deployment board
            {
                boardId: boardMap["deployment"],
                title: "Set up CI/CD pipeline",
                description: "Configure GitHub Actions for auto-deploy to VPS on push to main",
                status: "done" as const,
                priority: "high" as const,
                order: 0,
                assigneeId: agentMap["killua"],
            },
            {
                boardId: boardMap["deployment"],
                title: "Security audit on production services",
                description: "Run vulnerability scan on all exposed endpoints and review access controls",
                status: "in_progress" as const,
                priority: "high" as const,
                order: 1,
                assigneeId: agentMap["demiurge"],
            },
            {
                boardId: boardMap["deployment"],
                title: "Connect dashboard to Convex",
                description: "Wire up real-time data from Convex backend to all dashboard components",
                status: "done" as const,
                priority: "high" as const,
                order: 2,
                assigneeId: agentMap["yor"],
            },
            {
                boardId: boardMap["deployment"],
                title: "Implement smart LLM router",
                description: "Build intelligent model selection based on query complexity tiers",
                status: "review" as const,
                priority: "medium" as const,
                order: 3,
                assigneeId: agentMap["senku"],
            },
            {
                boardId: boardMap["deployment"],
                title: "Set up monitoring dashboard",
                description: "Configure PM2 monitoring and health checks for VPS services",
                status: "todo" as const,
                priority: "medium" as const,
                order: 4,
            },
            {
                boardId: boardMap["deployment"],
                title: "Containerize agent services",
                description: "Dockerize the agent heartbeat and executor services for portability",
                status: "backlog" as const,
                priority: "low" as const,
                order: 5,
            },
            // Trading board
            {
                boardId: boardMap["trading"],
                title: "Implement market data feed",
                description: "Set up real-time market data ingestion from exchange APIs",
                status: "todo" as const,
                priority: "urgent" as const,
                order: 0,
                assigneeId: agentMap["shiroe"],
            },
            {
                boardId: boardMap["trading"],
                title: "Build portfolio tracker",
                description: "Create real-time portfolio value tracking with P&L calculations",
                status: "in_progress" as const,
                priority: "high" as const,
                order: 1,
                assigneeId: agentMap["rimuru"],
            },
            {
                boardId: boardMap["trading"],
                title: "Backtest trading strategies",
                description: "Historical data analysis and strategy validation framework",
                status: "backlog" as const,
                priority: "medium" as const,
                order: 2,
            },
            // Office board  
            {
                boardId: boardMap["office"],
                title: "Complete API documentation",
                description: "Document all REST and Convex endpoints with request/response examples",
                status: "review" as const,
                priority: "medium" as const,
                order: 0,
                assigneeId: agentMap["albedo"],
            },
            {
                boardId: boardMap["office"],
                title: "Create onboarding guide",
                description: "Write comprehensive getting-started guide for new team members",
                status: "todo" as const,
                priority: "medium" as const,
                order: 1,
                assigneeId: agentMap["lena"],
            },
            {
                boardId: boardMap["office"],
                title: "Quarterly report generation",
                description: "Compile and format Q1 performance metrics and agent activity report",
                status: "in_progress" as const,
                priority: "high" as const,
                order: 2,
                assigneeId: agentMap["cc"],
            },
            // Personal board
            {
                boardId: boardMap["personal"],
                title: "Set up learning dashboard",
                description: "Track personal development goals and skill acquisition progress",
                status: "backlog" as const,
                priority: "low" as const,
                order: 0,
            },
            {
                boardId: boardMap["personal"],
                title: "Daily wellness tracker",
                description: "Implement health metrics logging and trend analysis",
                status: "todo" as const,
                priority: "medium" as const,
                order: 1,
                assigneeId: agentMap["ainz"],
            },
        ];

        let created = 0;
        for (const task of tasks) {
            await ctx.db.insert("tasks", {
                ...task,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            });
            created++;
        }

        // Log activity
        await ctx.db.insert("activity", {
            actorType: "system",
            actionType: "task_created",
            message: `🌱 System seeded with ${created} tasks across 4 boards`,
            createdAt: Date.now(),
        });

        console.log(`✅ Seeded ${created} tasks.`);
        return { success: true, tasks: created };
    },
});
