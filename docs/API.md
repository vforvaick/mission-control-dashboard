# Convex API Endpoints

Key mutations and queries for frontend-backend communication.

## Tasks

### Queries
```typescript
// Get all tasks for a board
tasks.getByBoard({ boardId: Id<"boards"> })

// Get tasks for a specific status
tasks.getByStatus({ boardId, status: "todo" | "in_progress" | ... })

// Get task details with comments
tasks.getWithComments({ taskId: Id<"tasks"> })
```

### Mutations
```typescript
// Create a task
tasks.create({
    boardId,
    title: string,
    description?: string,
    priority: "low" | "medium" | "high" | "urgent",
    tags?: string[],
})

// Move task (change status or order)
tasks.move({
    taskId,
    newStatus: string,
    newOrder: number,
})

// Assign to agent or unassign
tasks.assign({ taskId, assigneeId?: Id<"agents"> })

// Complete task
tasks.complete({ taskId })

// Log execution step
tasks.logExecution({ taskId, type: "command" | "output" | "error", content: string })
```

## Agents

### Queries
```typescript
// List all agents
agents.list()

// Get agent by handle
agents.getByHandle({ handle: "@lelouch" })

// Get agent's working memory
agents.getWorkingMemory({ agentId })
```

### Mutations
```typescript
// Update heartbeat status
agents.heartbeat({ agentId, status: "online" | "working" | "idle" | ... })

// Update working memory
agents.updateWorkingMemory({ agentId, memory: { ... } })

// Claim a task
agents.claimTask({ agentId, taskId })
```

## Comments

### Queries
```typescript
// Get all comments for a task (flat)
comments.getByTask({ taskId })
```

### Mutations
```typescript
// Create comment
comments.create({
    taskId,
    parentId?: Id<"comments">,  // For replies
    content: string,
    authorType: "agent" | "human",
    authorId: string,
    mentions?: Id<"agents">[],
})
```

## Subscriptions (Mentions)

### Queries
```typescript
// Get unacknowledged mentions for an agent
subscriptions.getPending({ agentId })
```

### Mutations
```typescript
// Mark mention as acknowledged
subscriptions.acknowledge({ subscriptionId })
```

## Notifications

### Queries
```typescript
// Get pending notifications
notifications.getPending()
```

### Mutations
```typescript
// Queue a notification
notifications.queue({
    type: "milestone" | "risk_alert" | "daily_brief" | "decision_pending",
    title: string,
    message: string,
    boardId?: Id<"boards">,
    agentId?: Id<"agents">,
})

// Mark as sent
notifications.markSent({ notificationId, telegramMessageId?: string })
```

## Boards

### Queries
```typescript
// List all boards
boards.list()

// Get board by slug
boards.getBySlug({ slug: "office" })
```

## Activity

### Queries
```typescript
// Get recent activity for live feed
activity.getRecent({ limit: 50 })

// Get activity for a specific board
activity.getByBoard({ boardId, limit: 50 })
```
