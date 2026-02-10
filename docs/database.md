# Database Schema

Mission Control uses **Convex** as its real-time backend and database. The schema is designed for speed, reactivity, and autonomous agent interaction.

---

## Core Tables

| Table | Purpose | Key Indexes |
|-------|---------|-------------|
| `boards` | Domain areas (Office, Trading, Personal, Deployment) | `by_slug` |
| `tasks` | Kanban tasks with execution logs | `by_board`, `by_status`, `by_assignee` |
| `comments` | Threaded discussions with @mentions | `by_task`, `by_parent` |
| `agents` | Autonomous AI profiles and working memory | `by_handle`, `by_status` |
| `activity` | Live system-wide event feed | `by_time`, `by_board` |
| `subscriptions` | Tracks pending @mentions for agents | `by_agent_unacked` |
| `agentMessages` | Direct agent-to-agent communication | `by_recipient`, `by_sender` |
| `resources` | Long-term KB/SOPs per board | `by_board` |
| `notificationQueue` | Outbound Telegram alerts | `by_status` |
| `telegramInbox` | Inbound Telegram commands/replies | `by_agent_unprocessed` |

---

## Detailed Table Specs

### Tasks (`tasks`)
The heart of the system. Tracks status, priority, and execution logs.
- **Execution Status**: `pending`, `running`, `pending_approval`, `completed`, `failed`.
- **Execution Log**: Array of `{ timestamp, type, content }` for real-time output streaming.
- **Acceptance Criteria**: Defined by Lelouch or User to guide specialists.

### Agents (`agents`)
Stores persona data and **Working Memory**.
- **Layer**: `strategic`, `analyst`, `lead`, `specialist`.
- **Working Memory**:
    - `lastContext`: Continuity between heartbeats.
    - `currentFocus`: What the agent is doing right now.
    - `reflections`: Post-task analysis for iterative improvement.

### Agent Messages (`agentMessages`)
Enables the hierarchical command chain.
- **Types**: `order`, `report`, `question`, `suggestion`.
- **Flow**: Sender creates → Receiver's HB phase 3 picks up → Process → Acknowledge.

---

## Hierarchy & Relationships

```mermaid
erDiagram
    boards ||--o{ tasks : contains
    boards ||--o{ agents : domains
    tasks ||--o{ comments : has
    tasks ||--o{ agentMessages : context
    agents ||--o{ tasks : assigned
    agents ||--o{ comments : author
    agents ||--o{ subscriptions : mentioned
    agents ||--o{ agentMessages : sends/receives
```
