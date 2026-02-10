import { mutation } from "./_generated/server";

export const defaultSeed = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existingAgents = await ctx.db.query("agents").collect();
    if (existingAgents.length > 0) {
      console.log("⚠️ Database already has agents. Skipping seed.");
      return { skipped: true, existingAgents: existingAgents.length };
    }

    // 1. Create Boards
    const officeBoard = await ctx.db.insert("boards", {
      name: "Office Operations",
      slug: "office",
      description: "Admin, Finance, Legal, HR",
      icon: "🏢",
      color: "#3b82f6",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const tradingBoard = await ctx.db.insert("boards", {
      name: "Trading Console",
      slug: "trading",
      description: "Crypto, Forex, Strategy, Analysis",
      icon: "📈",
      color: "#10b981",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const personalBoard = await ctx.db.insert("boards", {
      name: "Personal Life",
      slug: "personal",
      description: "Health, Learning, Travel, Family",
      icon: "🏠",
      color: "#f59e0b",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const deploymentBoard = await ctx.db.insert("boards", {
      name: "Deployment Center",
      slug: "deployment",
      description: "DevOps, Coding, Infrastructure, CI/CD",
      icon: "🚀",
      color: "#6366f1",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 2. Create Agents (with layer, source, emoji)
    const agents = [
      // Strategic Layer
      {
        name: "Lelouch Lamperouge",
        handle: "lelouch",
        role: "Supreme Strategist",
        layer: "strategic" as const,
        source: "Code Geass",
        emoji: "♟️",
        boardIds: [officeBoard, tradingBoard, personalBoard, deploymentBoard],
        status: "online" as const,
      },
      {
        name: "C.C.",
        handle: "cc",
        role: "Chief of Staff",
        layer: "analyst" as const,
        source: "Code Geass",
        emoji: "🍕",
        boardIds: [officeBoard, tradingBoard, personalBoard, deploymentBoard],
        status: "idle" as const,
      },
      // Lead Layer
      {
        name: "Vladilena Milizé",
        handle: "lena",
        role: "Office Lead",
        layer: "lead" as const,
        source: "86",
        emoji: "💼",
        boardIds: [officeBoard],
        leadBoardId: officeBoard,
        status: "idle" as const,
      },
      {
        name: "Shiroe",
        handle: "shiroe",
        role: "Trading Lead",
        layer: "lead" as const,
        source: "Log Horizon",
        emoji: "📊",
        boardIds: [tradingBoard],
        leadBoardId: tradingBoard,
        status: "idle" as const,
      },
      {
        name: "Ainz Ooal Gown",
        handle: "ainz",
        role: "Personal Lead",
        layer: "lead" as const,
        source: "Overlord",
        emoji: "💀",
        boardIds: [personalBoard],
        leadBoardId: personalBoard,
        status: "idle" as const,
      },
      {
        name: "Meliodas",
        handle: "meliodas",
        role: "Deployment Lead",
        layer: "lead" as const,
        source: "Seven Deadly Sins",
        emoji: "⚔️",
        boardIds: [deploymentBoard],
        leadBoardId: deploymentBoard,
        status: "idle" as const,
      },
      // Specialist Layer
      {
        name: "Killua Zoldyck",
        handle: "killua",
        role: "Backend Specialist",
        layer: "specialist" as const,
        source: "Hunter x Hunter",
        emoji: "⚡",
        boardIds: [deploymentBoard, officeBoard],
        status: "sleeping" as const,
      },
      {
        name: "Yor Forger",
        handle: "yor",
        role: "Frontend Specialist",
        layer: "specialist" as const,
        source: "Spy x Family",
        emoji: "🌹",
        boardIds: [deploymentBoard],
        status: "sleeping" as const,
      },
      {
        name: "Rimuru Tempest",
        handle: "rimuru",
        role: "Data Analyst",
        layer: "specialist" as const,
        source: "That Time I Got Reincarnated as a Slime",
        emoji: "🔮",
        boardIds: [tradingBoard],
        status: "sleeping" as const,
      },
      {
        name: "Albedo",
        handle: "albedo",
        role: "Admin Specialist",
        layer: "specialist" as const,
        source: "Overlord",
        emoji: "📋",
        boardIds: [officeBoard],
        status: "sleeping" as const,
      },
      {
        name: "Satou Kazuma",
        handle: "kazuma",
        role: "QA Specialist",
        layer: "specialist" as const,
        source: "KonoSuba",
        emoji: "🎯",
        boardIds: [deploymentBoard],
        status: "sleeping" as const,
      },
      {
        name: "Ishigami Senku",
        handle: "senku",
        role: "Research Specialist",
        layer: "specialist" as const,
        source: "Dr. Stone",
        emoji: "🧪",
        boardIds: [deploymentBoard, tradingBoard, officeBoard, personalBoard],
        status: "sleeping" as const,
      },
      {
        name: "Demiurge",
        handle: "demiurge",
        role: "Security Auditor",
        layer: "specialist" as const,
        source: "Overlord",
        emoji: "🛡️",
        boardIds: [deploymentBoard],
        status: "sleeping" as const,
      },
    ];

    for (const agent of agents) {
      await ctx.db.insert("agents", {
        ...agent,
        createdAt: Date.now(),
        lastHeartbeat: Date.now(),
      });
    }

    // 3. Create sample tasks
    const sampleTasks = [
      {
        boardId: deploymentBoard,
        title: "Set up CI/CD pipeline",
        description: "Configure GitHub Actions for auto-deploy to VPS",
        status: "done" as const,
        priority: "high" as const,
        order: 0,
      },
      {
        boardId: deploymentBoard,
        title: "Security audit on production services",
        description: "Run vulnerability scan on all exposed endpoints",
        status: "in_progress" as const,
        priority: "high" as const,
        order: 1,
      },
      {
        boardId: tradingBoard,
        title: "Implement market data feed",
        description: "Set up real-time market data ingestion",
        status: "todo" as const,
        priority: "urgent" as const,
        order: 0,
      },
      {
        boardId: officeBoard,
        title: "Complete API documentation",
        description: "Document all REST and Convex endpoints",
        status: "review" as const,
        priority: "medium" as const,
        order: 0,
      },
      {
        boardId: personalBoard,
        title: "Set up learning dashboard",
        description: "Track personal development goals and progress",
        status: "backlog" as const,
        priority: "low" as const,
        order: 0,
      },
      {
        boardId: deploymentBoard,
        title: "Connect dashboard to Convex",
        description: "Wire up real-time data from Convex backend",
        status: "done" as const,
        priority: "high" as const,
        order: 2,
      },
    ];

    for (const task of sampleTasks) {
      await ctx.db.insert("tasks", {
        ...task,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // 4. Log seed activity
    await ctx.db.insert("activity", {
      actorType: "system",
      actionType: "task_created",
      message: "🌱 System seeded with 4 boards, 13 agents, and 6 tasks",
      createdAt: Date.now(),
    });

    console.log("✅ Seed complete: 4 Boards, 13 Agents, 6 Tasks created.");
    return { success: true, boards: 4, agents: 13, tasks: 6 };
  },
});
