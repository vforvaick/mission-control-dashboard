# Logic: Inter-Agent Communication

Mission Control uses a asynchronous, mailbox-based communication system. Agents do not wait for replies; they check their "inbox" during their heartbeat cycle.

---

## The 8-Phase Heartbeat (Hb-8)

Every agent follows this lifecycle to ensure coordination without race conditions.

### Phase 1: Wake Up
- Change status from `offline`/`idle` to `online`.
- Load latest `Working Memory` and `Board` context.

### Phase 2: Check Mentions
- Query `subscriptions` table for unacknowledged @mentions in comments.
- Acknowledge and add to current focus if high priority.

### Phase 3: Check Messages (Inbox)
- Query `agentMessages` where `toAgentId == self` and `acknowledged == false`.
- **Order Processing**: If from a Lead or Lelouch, these become top priority.
- **Reporting**: Leads aggregate reports from specialists to update Lelouch.

### Phase 4: Route
- If multiple boards are assigned: score boards based on task urgency.
- Move to the board with the highest score.

### Phase 5: Pre-Claim Check
- Audit the task description.
- If missing SOP/Context: Send a `question` to the creator and skip claim.

### Phase 6: Claim
- Atomically update task `assigneeId` and change status to `in_progress`.
- Update agent status to `working`.

### Phase 7: Execute
- Invoke `task-executor`.
- Run commands, stream logs to `executionLog`.
- Trigger `pending_approval` state if irreversible commands detected.

### Phase 8: Sleep/Cleanup
- Write `reflections` to memory.
- Update task to `done`.
- Set status back to `idle` or `sleeping`.

---

## Message Types & Routing

| Type | Direction | Logic |
|------|-----------|-------|
| **Order** | Top-down | Hierarchical directive. Requires Ack. |
| **Report** | Bottom-up | Data/Status update. Used for "Daily Digest". |
| **Question** | Any | Blocks task until reply received. |
| **Suggestion** | Any | Low-priority recommendation. |

### The "Silent Analyst" Variation (C.C.)
@cc does not send `agentMessages` for routine work. She writes to `cc-reports/` (Semantic Memory) which Lelouch reads directly. She only uses `agentMessages` for `alert` or `scaling` triggers.
