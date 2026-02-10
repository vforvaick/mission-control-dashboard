/**
 * Mission Control - Convex Database Schema (Distilled Reference)
 * 
 * This is the CLEAN, reference-only schema with core tables.
 * Implement this in a fresh Convex project.
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
    ...authTables,
    // ═══════════════════════════════════════════════════════════
    // BOARDS - Domain areas (Office, Trading, Personal, Deployment)
    // ═══════════════════════════════════════════════════════════
    boards: defineTable({
        name: v.string(),
        slug: v.string(),
        description: v.optional(v.string()),
        icon: v.optional(v.string()),
        color: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
    }).index("by_slug", ["slug"]),

    // ═══════════════════════════════════════════════════════════
    // TASKS - Kanban tasks per board
    // ═══════════════════════════════════════════════════════════
    tasks: defineTable({
        boardId: v.id("boards"),
        title: v.string(),
        description: v.optional(v.string()),
        status: v.union(
            v.literal("backlog"),
            v.literal("todo"),
            v.literal("in_progress"),
            v.literal("review"),
            v.literal("done")
        ),
        priority: v.union(
            v.literal("low"),
            v.literal("medium"),
            v.literal("high"),
            v.literal("urgent")
        ),
        assigneeId: v.optional(v.id("agents")),
        createdAt: v.number(),
        updatedAt: v.number(),
        claimedAt: v.optional(v.number()),
        completedAt: v.optional(v.number()),
        dueDate: v.optional(v.number()),
        tags: v.optional(v.array(v.string())),
        order: v.number(),
        // Execution tracking
        executionLog: v.optional(v.array(v.object({
            timestamp: v.number(),
            type: v.union(v.literal("command"), v.literal("output"), v.literal("error"), v.literal("info")),
            content: v.string(),
        }))),
        executionStatus: v.optional(v.union(
            v.literal("pending"),
            v.literal("running"),
            v.literal("pending_approval"),
            v.literal("completed"),
            v.literal("failed")
        )),
    })
        .index("by_board", ["boardId"])
        .index("by_board_status", ["boardId", "status"])
        .index("by_assignee", ["assigneeId"])
        .index("by_status", ["status"]),

    // ═══════════════════════════════════════════════════════════
    // COMMENTS - Threaded discussions on tasks
    // ═══════════════════════════════════════════════════════════
    comments: defineTable({
        taskId: v.id("tasks"),
        parentId: v.optional(v.id("comments")), // For nesting
        authorType: v.union(v.literal("agent"), v.literal("human")),
        authorId: v.string(),
        content: v.string(),
        mentions: v.optional(v.array(v.id("agents"))),
        createdAt: v.number(),
    })
        .index("by_task", ["taskId"])
        .index("by_parent", ["parentId"]),

    // ═══════════════════════════════════════════════════════════
    // AGENTS - Autonomous AI agents
    // ═══════════════════════════════════════════════════════════
    agents: defineTable({
        name: v.string(),
        handle: v.string(), // lelouch, cc, etc.
        avatar: v.optional(v.string()),
        role: v.string(),
        layer: v.optional(v.union(
            v.literal("strategic"),
            v.literal("analyst"),
            v.literal("lead"),
            v.literal("specialist")
        )),
        source: v.optional(v.string()), // Anime origin
        emoji: v.optional(v.string()),
        personality: v.optional(v.string()),
        boardIds: v.array(v.id("boards")), // Assigned domains
        leadBoardId: v.optional(v.id("boards")), // For Area Leads
        status: v.union(
            v.literal("online"),
            v.literal("working"),
            v.literal("idle"),
            v.literal("sleeping"),
            v.literal("offline")
        ),
        lastHeartbeat: v.number(),
        currentTaskId: v.optional(v.id("tasks")),
        // Session memory for context continuity
        workingMemory: v.optional(v.object({
            lastContext: v.optional(v.string()),
            currentFocus: v.optional(v.string()),
            recentTasks: v.optional(v.array(v.string())),
            reflections: v.optional(v.array(v.string())),
            updatedAt: v.number(),
        })),
        createdAt: v.number(),
    })
        .index("by_handle", ["handle"])
        .index("by_status", ["status"]),

    // ═══════════════════════════════════════════════════════════
    // ACTIVITY - Live feed for all events
    // ═══════════════════════════════════════════════════════════
    activity: defineTable({
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
        createdAt: v.number(),
    })
        .index("by_board", ["boardId"])
        .index("by_time", ["createdAt"]),

    // ═══════════════════════════════════════════════════════════
    // SUBSCRIPTIONS - @mention tracking
    // ═══════════════════════════════════════════════════════════
    subscriptions: defineTable({
        agentId: v.id("agents"),
        taskId: v.optional(v.id("tasks")),
        commentId: v.optional(v.id("comments")),
        mentionedAt: v.number(),
        acknowledged: v.boolean(),
    })
        .index("by_agent", ["agentId"])
        .index("by_agent_unacked", ["agentId", "acknowledged"]),

    // ═══════════════════════════════════════════════════════════
    // AGENT MESSAGES - Direct agent-to-agent communication
    // ═══════════════════════════════════════════════════════════
    agentMessages: defineTable({
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
        acknowledged: v.boolean(),
        response: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("by_recipient", ["toAgentId", "acknowledged"])
        .index("by_sender", ["fromAgentId"]),

    // ═══════════════════════════════════════════════════════════
    // RESOURCES - Long-term knowledge per board
    // ═══════════════════════════════════════════════════════════
    resources: defineTable({
        boardId: v.id("boards"),
        title: v.string(),
        content: v.string(),
        category: v.union(
            v.literal("sop"),
            v.literal("credential"),
            v.literal("documentation"),
            v.literal("general")
        ),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_board", ["boardId"]),

    // ═══════════════════════════════════════════════════════════
    // NOTIFICATION QUEUE - Outbound messages for Telegram
    // ═══════════════════════════════════════════════════════════
    notificationQueue: defineTable({
        type: v.union(
            v.literal("milestone"),
            v.literal("risk_alert"),
            v.literal("daily_brief"),
            v.literal("decision_pending")
        ),
        boardId: v.optional(v.id("boards")),
        agentId: v.optional(v.id("agents")),
        title: v.string(),
        message: v.string(),
        status: v.union(v.literal("pending"), v.literal("sent"), v.literal("failed")),
        createdAt: v.number(),
        sentAt: v.optional(v.number()),
    })
        .index("by_status", ["status"]),

    // ═══════════════════════════════════════════════════════════
    // TELEGRAM INBOX - Inbound messages from Telegram
    // ═══════════════════════════════════════════════════════════
    telegramInbox: defineTable({
        telegramUserId: v.string(),
        telegramUsername: v.string(),
        telegramChatId: v.string(),
        message: v.string(),
        targetAgentHandle: v.string(),
        processed: v.boolean(),
        agentResponse: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("by_agent_unprocessed", ["targetAgentHandle", "processed"]),
});
