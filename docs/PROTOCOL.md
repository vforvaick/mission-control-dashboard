# Interaction Protocol

This document defines the communication rules between agents within the Mission Control hierarchy.

---

## Core Principle: User-North-Star

> Agents cannot hallucinate strategic context. All Vision/Taste/Why gaps escalate to User.

The User (Faiq) is the ultimate source of truth for:
- Vision (Why we do things)
- Taste (How things should feel/look)
- Priority (What matters most right now)

---

## Escalation Chain

```
Specialist → Lead → Lelouch → User
```

### When to Escalate:
| Situation | Action |
|-----------|--------|
| Missing SOP/documentation | Specialist → Lead |
| Strategic ambiguity | Lead → Lelouch |
| Vision/Taste gap | Lelouch → User |
| Critical blocker | Direct to User via Telegram |

---

## Inter-Agent Messaging

### Message Types:
1. **Order** — Top-down directive (Lelouch → Lead → Specialist)
2. **Report** — Bottom-up status update (Specialist → Lead → Lelouch)
3. **Question** — Clarification request (any direction)
4. **Suggestion** — Proactive recommendation (any direction)

### Processing Flow:
```
Sender → agentMessages table → Receiver's Heartbeat Phase 3 → Process → Ack
```

---

## The "Commander's Intent" Pattern

When Lelouch delegates to Leads:
1. **Mission**: What needs to be achieved
2. **Constraints**: What must NOT happen
3. **Resources**: What's available
4. **Freedom**: Lead determines the tactics

Example:
> "Shiroe, we need the trading dashboard live by Friday. Must not break existing API. You have @rimuru. Go."

---

## Approval Gate

Irreversible actions require User approval:
- Keywords: `rm`, `delete`, `force`, `drop`, `reset`
- Task status transitions to `pending_approval`
- User receives Telegram notification with:
  - Goal
  - Plan
  - Irreversible command details

---

## Reflection System

After completing any task, agents write a "reflection":
- What went well
- What went wrong
- Lessons learned

Stored in `workingMemory.reflections` for iterative learning.
