# Changelog

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

### Changed
- Removed mock data from `agent-grid.tsx`, `board.tsx`, `activity-feed.tsx`
- Updated `.env.local` with `CONVEX_DEPLOYMENT` for type generation
- Agent status mapping: Convex `working` → dashboard `busy`, `sleeping` → `offline`
- Activity feed `formatTimeAgo` now accepts numeric timestamps (Convex format)

### Files Modified
- `components/agents/agent-grid.tsx`
- `components/kanban/board.tsx`
- `components/activity/activity-feed.tsx`
- `.env.local`
- `convex/` (new directory — copied from VPS)

### Reference
- Convex deployment: `dev:ceaseless-bullfrog-373`
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
