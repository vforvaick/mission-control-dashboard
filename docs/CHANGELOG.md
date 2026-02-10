# Changelog

## [2026-02-10] - Context Integration
### Added
- `docs/database.md`: Detailed Convex schema documentation.
- `docs/logic/`: New directory for core system logic specs.
- `docs/logic/inter-agent-comms.md`: 8-phase heartbeat and messaging specs.
- `docs/logic/sandboxed-execution.md`: Command execution and approval gate specs.

### Changed
- `docs/architecture.md`: Integrated 4-Layer Memory model and added documentation index.

### Files Modified
- docs/architecture.md
- docs/database.md
- docs/logic/inter-agent-comms.md
- docs/logic/sandboxed-execution.md

---

## [2026-02-10] - Production Recovery & Turing Test
### Fixed
- **Agent Model Mapping**: All agents re-mapped to `openai-codex/gpt-5.3-codex` on `fight-uno` to resolve "Unknown model" errors.
- **Heartbeat Timeout**: Increased `agentTurn` timeout in `jobs.json` to 300s to allow C.C. to finish comprehensive system analysis.
- **Analyst Reporting**: Restored C.C.'s ability to generate `squad-status.md` and `scaling-recs.md`.
- **Telegram Heartbeat**: Temporarily disabled outbound Telegram notifications for heartbeats (set to `mode: none`) to prevent `chat not found` errors.
- **Gateway Stability**: Resync'd `openclaw-gateway` configuration and restarted service.

### Added/Changed
- **Manual Verification**: Successfully ran Turing Test with Lelouch; he identified the model mismatch autonomously.
- **Reference Doc Sync**: Migrated core architecture, personas, and protocol docs from `mission-control-reference` to `docs/`.

### Discovered Issues
- **Telegram Chat ID**: Placeholder `@heartbeat` failed; needs real ID for proactive alerting.
- **Model Availability**: `opus-4.6-thinking` was requested but not yet successfully scanned on `fight-uno`'s default profile.

### Reference
- Session: f396858d-a7ea-43c7-990e-6fd6e880d9c1

---

## [2026-02-10] - Security & Type Safety Audit Repairs
### Added
- **Convex Auth**: Secured dashboard with GitHub OAuth (`@convex-dev/auth`)
- **Security Headers**: Added CSP, X-Frame-Options, HSTS, etc. to `next.config.ts`
- **Input Validation**: Added max length checks to `tasks.ts`, `comments.ts`, and `activity.ts` mutations
- **Auth Guard**: Wrapped application in `AuthGuard` component to enforce login

### Changed
- **Type Safety**:
  - Fixed `Agent.layer` union type (`strategic` | `analyst` | `lead` | `specialist`)
  - Removed all `as any` casts in `agent-grid.tsx`
  - Fixed `deriveLayer` return type
- **Security**:
  - Converted `seed.ts`, `seedTasks.ts`, `migrations.ts` to `internalMutation` (no public access)
  - Capped `activity.list` query at 200 items

### Verified
- Build: `npx next build` ✅ (Zero errors)
- Type Check: `tsc` ✅

### Files Modified
- `convex/auth.ts`, `convex/http.ts`, `convex/schema.ts`
- `components/auth/auth-guard.tsx`
- `app/layout.tsx`
- `lib/convex.tsx`, `lib/types.ts`
- All mutations in `convex/` directory

## [2026-02-10] - Convex Integration (Live Data)
### Added
- Consolidated `convex/` directory from VPS `isekai-legion` project into dashboard
- Live agent data via `useQuery(api.agents.list)` in `agent-grid.tsx`
- Live task data via `useQuery(api.tasks.list)` in `board.tsx`
- Real-time drag-and-drop persists via `useMutation(api.tasks.move)`
- Live activity feed via `useQuery(api.activity.list)` in `activity-feed.tsx`
- Live stats panel (completed, in-progress, new tasks, active agents) derived from real data
- Loading skeletons for all 3 data-driven components
- Support for all Convex `actionType` values in activity feed icons/colors
- `layer`, `source`, `emoji` fields added to agent schema
- Migration script to backfill existing 13 agents with new fields
- Task seeder: 14 sample tasks across 4 boards with agent assignments
- Board → domain mapping for task cards
- `convex/migrations.ts` for one-time agent field migration
- `convex/seedTasks.ts` for idempotent task seeding

### Changed
- Removed mock data from `agent-grid.tsx`, `board.tsx`, `activity-feed.tsx`
- Updated `.env.local` with `CONVEX_DEPLOYMENT` for type generation
- Agent status mapping: Convex `working` → dashboard `busy`, `sleeping` → `offline`
- Activity feed `formatTimeAgo` now accepts numeric timestamps (Convex format)
- Stripped `@` prefix from agent handles in DB via migration

### Verified
- Build: `npx next build` ✅ (1358ms, zero errors)
- Live: `mission-control-dashboard-amber.vercel.app` ✅
- Kanban: 14 tasks visible across 5 columns
- Agents: 13 agents grouped by layer (Strategic → Specialist)
- Activity: Live feed with seed event + real-time stats
- Convex: Schema pushed, agents migrated, tasks seeded on `ceaseless-bullfrog-373`

### Files Modified
- `components/agents/agent-grid.tsx`
- `components/kanban/board.tsx`
- `components/activity/activity-feed.tsx`
- `.env.local`
- `convex/schema.ts` (added layer, source, emoji)
- `convex/seed.ts` (updated with new fields)
- `convex/seedTasks.ts` (new)
- `convex/migrations.ts` (new)

### Reference
- Convex deployment: `dev:ceaseless-bullfrog-373`
- Dashboard URL: https://mission-control-dashboard-amber.vercel.app
- Session: d339887d-4884-4500-bdb6-809a6c662b81

### Discovered Issues
- **Agent count mismatch**: Reference defines 7 active agents, DB has 13 (6 legacy from old VPS seed). Non-critical — extra agents show as offline/sleeping.
  - Severity: Low
  - Tracked: ROADMAP.md

---

## [2026-02-10] - Phase 2 Deployment: Trading Team
### Added
- **Shiroe** (`cliproxy/gemini-3-pro-high`): Trading Architect — orchestrates strategy loops
- **Rimuru** (`cliproxy/gemini-3-flash`): Data Engineer + Backtester — data collection, validation
- **Senku** (`cliproxy/claude-sonnet-4-5-thinking`): Research Specialist — deep research, pattern discovery

### Reference
- Session: d339887d-4884-4500-bdb6-809a6c662b81

## [2026-02-10] - Phase 1 Deployment: Schema + Core Agents
### Added
- **Task Decomposition Schema**: `createdBy`, `parentTaskId`, `acceptanceCriteria`, `requiredSkills` + indexes (`by_parent`, `by_creator`)
- **Agent Health Schema**: `layer`, `skills`, `behavior`, `dormant`, `healthMetrics` (tasksCompleted, tasksFailed, avgCompletionTime, contextResets)
- **Tasks API**: `getSubTasks` query, decomposition args in `create` mutation
- **Agents API**: `getAvailableForSkills`, `getActive` queries, `updateHealthMetrics` mutation
- **Seed**: 7 active + 6 dormant agents with skills/layer/behavior
- **VPS KB**: `kb/trading`, `kb/devops`, `kb/research` directories
- **VPS CC Reports**: `cc-reports/squad-status.md`, `daily-digest.md`, `scaling-recs.md`
- **OpenClaw Agents**: `main` (Lelouch), `cc` (C.C.), `meliodas`, `demiurge` — each with identity + model routing
- **CLIproxy Auth**: `cliproxy:default` profile → fight-dos:8317
- **Cron Heartbeats**: `lelouch-heartbeat` (10m), `cc-heartbeat` (30m, silent)

### Reference
- Session: d339887d-4884-4500-bdb6-809a6c662b81

## [2026-02-10] - Multi-Agent Architecture Redesign
### Changed
- **Agent Structure**: Redesigned from 13-agent full spec to **7 active agents** with 6 dormant (spawn on demand)
- **C.C. Role**: From "Chief of Staff" to **Silent Analyst** — writes living documents (`cc-reports/`), no chat with Lelouch
- **Lelouch Role**: Now also **Personal Assistant** (reminders, scheduling) + Resource Planning
- **Meliodas**: Absorbs ALL dev/devops skills (solo lead, no specialists)
- **Shiroe**: Now **Trading Architect** (orchestrate only, does not execute)
- **Hierarchy**: From 4-layer to **3-layer active** (Strategic → Leads → Specialists)

### Added
- **Knowledge Base (KB)**: Shared `kb/` directory for persistent learning across sessions
- **Model Tiering**: Per-agent LLM model assignment with fallback chains
- **Task Decomposition**: Vision → Strategic Goal → Tactical Tasks → Execution
- **Agent Health Metrics**: `skills`, `behavior`, `healthMetrics` fields on agents table
- **Autonomous Iteration Loop**: Shiroe orchestrates research/backtest loops without human intervention
- **Scaling Decision Matrix**: Trigger-based rules for spawning new agents

### Reference
- Session: d339887d-4884-4500-bdb6-809a6c662b81


## [2026-02-09] - Initial Dashboard Build
### Added
- Next.js 16 project with Turbopack
- shadcn/ui component library (dark theme)
- Kanban board with drag-and-drop (dnd-kit)
- Agent status grid with layer grouping
- Activity feed with filters
- Responsive sidebar + header layout
- Glassmorphism design system
- Mock data for all components
- Deployed to Vercel
