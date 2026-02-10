# Inter-Agent Communication

Agents communicate via the `agentMessages` table. This enables hierarchical coordination without direct coupling.

## Message Types

| Type | Direction | Purpose |
|------|-----------|---------|
| `order` | Down (Superior → Subordinate) | Command to perform action |
| `report` | Up (Subordinate → Superior) | Status update, completion notice |
| `question` | Any | Request for clarification |
| `suggestion` | Peer | Proactive recommendation |

## Processing Flow

```
┌─────────────┐   createMessage()   ┌─────────────────┐
│   Sender    │ ──────────────────► │  agentMessages  │
│   Agent     │                     │     table       │
└─────────────┘                     └────────┬────────┘
                                             │
                                             │ Receiver's Phase 3
                                             ▼
┌─────────────┐   acknowledgeMessage()  ┌─────────────────┐
│  Receiver   │ ◄────────────────────── │   Process &     │
│   Agent     │                         │   Respond       │
└─────────────┘                         └─────────────────┘
```

## Hierarchy Rules

### Lelouch (Strategic) → Lead (Tactical)
- Sends: `order` with Commander's Intent
- Expects: `report` on execution + variances

### Lead (Tactical) → Specialist (Operational)
- Sends: `order` with specific task assignment
- Expects: `report` on completion or `question` if blocked

### Specialist → Lead
- Sends: `question` (SOP Gap) or `report` (completion)
- Never sends `order` upward

### Lead → Lelouch
- Sends: `report` (domain status) or `question` (strategic ambiguity)
- `suggestion` for cross-domain opportunities

## Acknowledgment Protocol

1. Message created with `acknowledged: false`
2. Receiver's heartbeat Phase 3 queries unacknowledged messages
3. After processing, receiver calls `acknowledgeMessage(id, response)`
4. Original sender can see response in next heartbeat

## Key Functions

```typescript
// Send a message
await ctx.db.insert("agentMessages", {
    fromAgentId,
    toAgentId,
    messageType: "order",
    content: "Deploy feature X by EOD",
    taskId: optionalTaskRef,
    acknowledged: false,
    createdAt: Date.now(),
});

// Acknowledge with response
await ctx.db.patch(messageId, {
    acknowledged: true,
    acknowledgedAt: Date.now(),
    response: "Understood. ETA 4 hours.",
});
```

## Conflict Resolution

When multiple agents claim the same task or send conflicting orders:
1. Higher hierarchy wins (Lelouch > Lead > Specialist)
2. Earlier timestamp wins within same level
3. Conflicts logged to `activity` table for visibility
