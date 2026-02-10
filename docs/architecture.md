# Architecture

## System Overview

OpenClaw Mission Control is a real-time, multi-agent task management platform. It consists of:
1. **React Dashboard** (Vercel) — Real-time Kanban with agent integration
2. **Convex Backend** (Cloud) — Serverless database + functions
3. **Agent Gateway** (VPS) — Autonomous agent heartbeat manager
4. **LLM Provider** (VPS) — CLIproxy for model access

**VPS canonical workspace**: `/home/vforvaick/.openclaw/workspace/mission-control-dashboard`

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  React Dashboard│◄───►│  Convex Cloud   │◄───►│  VPS Gateway    │
│  (Vercel)       │     │  (Database+API) │     │  (PM2 Agents)   │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                ┌────────▼────────┐
                                                │  LLM Provider   │
                                                │  (CLIproxy)     │
                                                └─────────────────┘
```

---

## The 8-Phase Heartbeat Protocol

Every agent follows this loop on each wake cycle:

| Phase | Name | Action |
|-------|------|--------|
| 1 | Wake Up | Update status to `online`, load board-specific resources |
| 2 | Check Mentions | Process pending @mentions with hierarchical prompt |
| 3 | Check Messages | Handle agent-to-agent communication |
| 4 | Route | Select best board context (priority scoring) |
| 5 | Pre-Claim Check | Verify task has sufficient documentation/SOP |
| 6 | Claim | Lock and claim high-priority tasks |
| 7 | Execute | Run sandboxed commands via task-executor |
| 8 | Sleep | Update status to `idle`, report completion |

> **Standby Optimization**: High-frequency agents (like Lelouch @ 1min) skip Phase 4 if no inbox work and routing was done recently (<15min).

---

## 3-Layer Active Hierarchy (7 Agents)

```
                        FAIQ (Vision)
                             │
                     ┌───────▼───────┐
                     │   @lelouch    │  5min HB | gpt-5.3-codex
                     │  STRATEGIC    │  PA + Brainstorm + Decide
                     └───────┬───────┘
                             │ reads cc-reports/ (no chat)
                     ┌───────▼───────┐
                     │     @cc       │  30min HB | gemini-3-pro-high
                     │  OPERATIONAL  │  Silent Analyst, writes reports
                     └───────┬───────┘
                             │
           ┌─────────────────┼─────────────────┐
           ▼                 ▼                 ▼
       @meliodas         @shiroe          @demiurge
       DevOps Lead       Trading Arch     Security
       opus-think        gpt-5.3          opus-think
       10min HB          10min HB         30min HB
                             │
                     ┌───────┴───────┐
                     ▼               ▼
                 @rimuru          @senku
                 Data/Backtest    Research
                 pro-high         opus-think
                 15min HB         On-demand
```

### Layer Responsibilities:
- **Strategic (@lelouch)**: Personal assistant, brainstorm with Faiq, resource planning, assign to Leads, crisis decisions
- **Analyst (@cc)**: Agent health monitoring, resource reports (living documents), daily digest, scaling alerts. Does NOT chat with Lelouch — writes `cc-reports/` files that Lelouch reads instantly
- **Leads (@meliodas, @shiroe)**: Domain execution. Meliodas handles all DevOps solo. Shiroe orchestrates Trading loops via specialists
- **Specialists (@rimuru, @senku, @demiurge)**: Execute research, backtests, security audits. Write results to KB

### Task Decomposition Flow:
```
Faiq (vision) → @lelouch (strategic goal) → Lead (tactical tasks) → Specialist (execution)
```

### Dormant Agents (Spawn on demand):
- @killua (Backend), @yor (Frontend) — when Meliodas overwhelmed
- @lena (Office Lead), @ainz (Personal Lead) — if workload demands
- @[executor] — when trading strategy proven for live market

---

## Knowledge Base (KB)

Shared persistent library at `~/.openclaw/workspace/kb/`:

```
kb/
├── trading/strategies, backtests, market-notes, failed-experiments
├── devops/runbooks, incident-log.md, infra-inventory.md
└── research/papers, findings.md
```

**Rules**: Read before work. Write after work. Version strategies. Cross-reference.

---

## Model Tiering + Fallbacks

| Agent | HB Scan | Primary | Fallback Chain |
|-------|---------|---------|---------------|
| @lelouch | gemini-3-flash | gpt-5.3-codex | → pro-high → 5.2 |
| @cc | gemini-3-flash | gemini-3-pro-high | → 5.2 → 5.1-mini |
| @meliodas | gemini-3-flash | opus-4.5-thinking | → 5.3 → pro-high |
| @shiroe | gemini-3-flash | gpt-5.3-codex | → pro-high → 5.2 |
| @demiurge | gemini-3-flash | opus-4.5-thinking | → 5.3 → pro-high |
| @rimuru | gemini-3-flash | gemini-3-pro-high | → 5.2 → 5.1-mini |
| @senku | - | opus-4.5-thinking | → 5.3 → pro-high |

**Providers**: Codex (fight-uno), CLIproxy (fight-dos:8317)

---

## Key VPS Gateway Components

| Component | Purpose |
|-----------|---------|
| `cron-manager.js` | Dynamic agent scheduling with Priority Scan |
| `heartbeat.js` | 8-phase agent lifecycle |
| `task-executor.js` | Sandboxed command execution |
| `agent-coordinator.js` | Inter-agent messaging |
| `multi-board-router.js` | Board priority routing |
| `telegram-webhook.js` | Real-time Telegram integration |

---

## The 4-Layer Memory Architecture

Agents use four distinct memory layers to maintain context and improve over time.

| Layer | Type | Location | Persistence |
|-------|------|----------|-------------|
| **Working** | Short-term | `agents.workingMemory` | Ephemeral (Session) |
| **Episodic** | Experience | `tasks.executionLog` | Permanent (Audit) |
| **Semantic** | Knowledge | `kb/`, `docs/`, `cc-reports/` | Shared (Global) |
| **Archive** | History | Git history, Done tasks | Historical |

---

## Detailed Documentation Index

For deeper technical dives, refer to:

- [**Database Schema**](file:///Users/faiqnau/fight/mission-control-dashboard/docs/database.md) — Convex table structures and relationships.
- [**Inter-Agent Comms**](file:///Users/faiqnau/fight/mission-control-dashboard/docs/logic/inter-agent-comms.md) — Heartbeat phases and messaging flow.
- [**Sandboxed Execution**](file:///Users/faiqnau/fight/mission-control-dashboard/docs/logic/sandboxed-execution.md) — Command execution and approval gates.
- [**Interaction Protocol**](file:///Users/faiqnau/fight/mission-control-dashboard/docs/PROTOCOL.md) — Social rules and hierarchy.

---

## Escalation Flow

```
Specialist → Lead → Lelouch → Faiq
Demiurge (Security) ────────→ Faiq (Critical bypass)
C.C. (Health Alert) → Lelouch → Faiq (if scaling needed)
```
