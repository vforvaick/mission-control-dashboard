# Roadmap

## Vision
A real-time mission control dashboard for the Isekai Crossover Legion — monitoring AI agents, managing tasks, and tracking activity across all operational domains.

## Planned Features

### High Priority
- [ ] Align agent roster with reference spec (7 active agents vs 13 in DB)
  - **Addresses:** Agent count mismatch from CHANGELOG 2026-02-10
- [ ] Individual agent detail pages
- [ ] Task creation/editing from dashboard UI  
- [ ] Drag-and-drop across boards (domain filtering)
- [ ] **Telegram Integration**: Direct approval flow and notifications for the User.
- [ ] **C.C. Daily Digest**: Automated daily status report via Telegram.

### Medium Priority
- [ ] Agent heartbeat visualization (live pulse indicators)
- [ ] Inter-agent message viewer (agentMessages table)
- [ ] Threaded comments on tasks
- [ ] Board switching/filtering in Kanban view
- [ ] **Agent Memory Expansion**: Knowledge Base (KB) for persistent learning across sessions.
- [ ] **Model Tiering Dashboard**: Visual indicator of which model each agent is using.
- [ ] **Autonomous Trading Loop**: End-to-end research → backtest → validate loop without human intervention.


### Low Priority
- [ ] Agent avatar images (AI-generated anime portraits)
- [ ] Dark/light theme toggle
- [ ] Notification center
- [ ] Dashboard overview widgets (charts, trends)

## Known Issues

### Non-Critical
- **Agent count mismatch** — Reference defines 7 active agents, DB contains 13 (6 legacy from old VPS seed). Extra agents display as offline/sleeping. No functional impact.
  - Discovered: 2026-02-10
  - Impact: Visual clutter in Agent Grid
  - Fix: Either mark legacy agents as inactive or align DB with reference spec
- **Node.js Compatibility** — Convex CLI requires Node.js v20+ for certain RegExp features.
  - Discovered: 2026-02-10
  - Impact: Deployments fail on default Node 18 environments.
  - Workaround: Use NVM to switch to Node 20.2.0+.
  - Fix: Update `setup.md` to mandate Node 20+.


## Technical Debt

### Medium Priority
- **Convex auth not configured locally** — `npx convex dev` requires browser login, schema changes must be pushed via VPS
  - Discovered: 2026-02-10
  - Effort: 10 min (run `npx convex login` on dev machine)
- **Manual Seed Process** — Database seeding currently requires manual execution of `seed:defaultSeed`.
  - Goal: Implement automatic migrations/seeding.
- **Hardcoded Snippets** — Some persona logic is duplicated between `PERSONAS.md` and `identity.md` on VPS.
  - Goal: Create a single source of truth for agent prompts.


### Low Priority
- **Domain type hardcoded** — `lib/types.ts` has `Domain = "Office" | "Trading" | "Personal" | "Deployment"` but boards can be any name
  - Effort: Small refactor to derive from boards query

## Recently Completed
- **Security & Type Safety Audit Repairs** (2026-02-10) — GitHub Auth, Input Validation, Security Headers, Strict Types
- Convex integration — all mock data replaced with live queries (2026-02-10)
- Agent migration — layer, source, emoji fields added (2026-02-10)
- Task seeding — 14 tasks across 4 boards (2026-02-10)
- Initial dashboard build — Next.js + shadcn/ui + dnd-kit (2026-02-09)
