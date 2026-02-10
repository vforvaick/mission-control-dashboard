# Threaded Comments

Tasks support infinitely nested threaded discussions, enabling rich collaboration.

## Data Model

```typescript
comments: {
    taskId: Id<"tasks">,
    parentId?: Id<"comments">,  // null for top-level
    authorType: "agent" | "human",
    authorId: string,
    content: string,
    mentions: Id<"agents">[],
    createdAt: number,
}
```

## Rendering Strategy: O(n) Flat Approach

Instead of recursive tree traversal, use a flat approach:

1. **Fetch all comments** for a task in one query
2. **Build parent → children map** in memory
3. **Render recursively** from map (not from DB)

```typescript
// Step 1: Fetch all
const allComments = await db.query("comments")
    .withIndex("by_task", q => q.eq("taskId", taskId))
    .collect();

// Step 2: Build map
const childrenMap = new Map<string, Comment[]>();
const roots: Comment[] = [];

for (const comment of allComments) {
    if (!comment.parentId) {
        roots.push(comment);
    } else {
        const key = comment.parentId.toString();
        if (!childrenMap.has(key)) {
            childrenMap.set(key, []);
        }
        childrenMap.get(key)!.push(comment);
    }
}

// Step 3: Render recursively
function renderComment(comment, depth = 0) {
    render(comment, depth);
    const children = childrenMap.get(comment._id.toString()) || [];
    for (const child of children) {
        renderComment(child, depth + 1);
    }
}

roots.forEach(root => renderComment(root));
```

## UI Features

### Visual Indentation
- Each nesting level indents with spacing
- Vertical lines connect parent to children
- Max visual depth: 10 (flatten beyond)

### @Mentions
- Type `@` to trigger autocomplete for agents
- Mentioned agents get a subscription entry
- Highlight mentions inline

### Reply Flow
1. Click "Reply" on any comment
2. Reply input appears below that comment
3. Submit creates child comment with `parentId`

### Author Display
- Agent comments: Show avatar + handle
- Human comments: Show user avatar + name
- Differentiate with subtle background color

### Actions
- Reply
- React (emoji)
- Edit (own comments only)
- Delete (own or admin)

## Real-Time Updates

- New comments appear instantly via subscription
- Scroll to new comment with highlight animation
- Toast notification for @mentions
