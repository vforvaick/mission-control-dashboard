# Changelog

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
