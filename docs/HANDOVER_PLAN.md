# Mission Control Dashboard — Technical Handover Plan

> **Last Updated**: 2026-02-10
> **Author**: Antigravity Agent
> **Target Audience**: Junior Engineers
> **Reference Repo**: [`mission-control-reference`](file:///Users/faiqnau/fight/mission-control-reference)

---

## Table of Contents

1. [Project Context](#1-project-context)
2. [Current State](#2-current-state)
3. [Pre-Work: Environment Setup](#3-pre-work-environment-setup)
4. [Phase 1: GitHub Auth Activation](#4-phase-1-github-auth-activation)
5. [Phase 2: Schema Alignment](#5-phase-2-schema-alignment)
6. [Phase 3: Agent Roster Cleanup](#6-phase-3-agent-roster-cleanup)
7. [Phase 4: Task CRUD UI](#7-phase-4-task-crud-ui)
8. [Phase 5: Board Filtering](#8-phase-5-board-filtering)
9. [Phase 6: Agent Detail Pages](#9-phase-6-agent-detail-pages)
10. [Phase 7: Threaded Comments](#10-phase-7-threaded-comments)
11. [Phase 8: Agent Messages Viewer](#11-phase-8-agent-messages-viewer)
12. [Phase 9: Heartbeat Visualization](#12-phase-9-heartbeat-visualization)
13. [Phase 10: Dashboard Overview Widgets](#13-phase-10-dashboard-overview-widgets)
14. [Phase 11: Polish & UX](#14-phase-11-polish--ux)
15. [Verification Checklist](#15-verification-checklist)

---

## 1. Project Context

**What is this?**
A real-time Kanban dashboard for the "Isekai Crossover Legion" — a multi-agent AI system where anime-inspired personas manage tasks across 4 domains: Office, Trading, Personal, Deployment.

**Tech Stack**:
| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 + React 19 + TypeScript |
| UI Library | shadcn/ui (Radix primitives) |
| Styling | Tailwind CSS v4 |
| Backend | Convex (real-time DB + serverless functions) |
| Auth | @convex-dev/auth (GitHub OAuth) |
| Hosting | Vercel (auto-deploy on push to `main`) |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |

**Key URLs**:
- **Live Dashboard**: https://mission-control-dashboard-amber.vercel.app
- **Convex Dashboard**: https://dashboard.convex.dev (project: `ceaseless-bullfrog-373`)
- **GitHub Repo**: https://github.com/vforvaick/mission-control-dashboard

---

## 2. Current State

### ✅ What's Done
- Full Kanban board with live drag-and-drop (persists to Convex)
- Agent grid grouped by layer (Strategic → Specialist)
- Activity feed with live stats
- Convex Auth (GitHub OAuth) — code is deployed, needs env vars
- Security headers, input validation, internalMutation guards
- Build is green (`npx next build` → 0 errors)

### ❌ What's Missing
| Feature | Estimated Effort | Phase |
|---------|-----------------|-------|
| GitHub Auth env vars | 10 min | Phase 1 |
| Schema alignment with reference | 30 min | Phase 2 |
| Agent roster cleanup (13 → 7+6 dormant) | 20 min | Phase 3 |
| Task Create/Edit/Delete UI | 3-4 hours | Phase 4 |
| Board filtering in Kanban | 1-2 hours | Phase 5 |
| Agent detail pages | 2-3 hours | Phase 6 |
| Threaded comments | 2-3 hours | Phase 7 |
| Agent messages viewer | 1-2 hours | Phase 8 |
| Heartbeat visualization | 1-2 hours | Phase 9 |
| Dashboard overview widgets | 2-3 hours | Phase 10 |
| Polish (avatars, theme, notifications) | 2-4 hours | Phase 11 |

---

## 3. Pre-Work: Environment Setup

### Step 1: Clone and install
```bash
git clone https://github.com/vforvaick/mission-control-dashboard.git
cd mission-control-dashboard
npm install
```

### Step 2: Set up Convex locally
```bash
npx convex login      # Follow browser prompt to authenticate
npx convex dev         # Starts local Convex dev server + type generation
```

### Step 3: Verify `.env.local` has:
```env
NEXT_PUBLIC_CONVEX_URL=https://ceaseless-bullfrog-373.convex.cloud
CONVEX_DEPLOYMENT=dev:ceaseless-bullfrog-373
```

### Step 4: Run dev server
```bash
npm run dev            # Starts Next.js at http://localhost:3000
```

### Step 5: Verify build
```bash
npx next build         # Must pass with zero errors
```

---

## 4. Phase 1: GitHub Auth Activation

> **Estimated**: 10 minutes | **Priority**: CRITICAL
> **Why**: Auth code is deployed but env vars are missing. Dashboard will show sign-in page but GitHub button will fail.

### Steps:

1. **Create GitHub OAuth App**:
   - Go to: https://github.com/settings/developers → "New OAuth App"
   - **Application name**: `Mission Control Dashboard`
   - **Homepage URL**: `https://mission-control-dashboard-amber.vercel.app`
   - **Authorization callback URL**: `https://ceaseless-bullfrog-373.convex.site/api/auth/callback/github`
   - Click "Register application"

2. **Copy credentials**:
   - Copy the **Client ID** 
   - Click "Generate a new client secret" → copy it

3. **Set env vars in Convex**:
   ```bash
   npx convex env set AUTH_GITHUB_ID <your_client_id>
   npx convex env set AUTH_GITHUB_SECRET <your_client_secret>
   ```

4. **Push schema** (deploys auth tables):
   ```bash
   npx convex dev --once
   ```

5. **Verify**: Open the dashboard → should see GitHub sign-in button → click → redirects to GitHub → returns authenticated.

### Files involved:
- [convex/auth.ts](file:///Users/faiqnau/fight/mission-control-dashboard/convex/auth.ts) — GitHub provider config
- [convex/http.ts](file:///Users/faiqnau/fight/mission-control-dashboard/convex/http.ts) — Auth HTTP routes
- [convex/schema.ts](file:///Users/faiqnau/fight/mission-control-dashboard/convex/schema.ts) — `authTables` spread
- [components/auth/auth-guard.tsx](file:///Users/faiqnau/fight/mission-control-dashboard/components/auth/auth-guard.tsx) — Sign-in UI + guard
- [lib/convex.tsx](file:///Users/faiqnau/fight/mission-control-dashboard/lib/convex.tsx) — `ConvexAuthProvider`

---

## 5. Phase 2: Schema Alignment

> **Estimated**: 30 minutes | **Priority**: HIGH
> **Why**: The dashboard schema is missing fields from the reference spec that agents will need.

### What's Missing (dashboard vs reference):

| Table | Missing Fields | Purpose |
|-------|---------------|---------|
| `agents` | `skills`, `behavior`, `dormant`, `healthMetrics` | Agent capabilities + C.C. monitoring |
| `tasks` | `createdBy`, `parentTaskId`, `acceptanceCriteria`, `requiredSkills` | Task decomposition + origin tracking |
| `tasks` | Indexes: `by_parent`, `by_creator` | Query performance |

### Steps:

1. **Edit** `convex/schema.ts`:

   **In the `agents` table**, add after `emoji`:
   ```typescript
   skills: v.optional(v.array(v.string())),
   behavior: v.optional(v.string()),
   dormant: v.optional(v.boolean()),
   healthMetrics: v.optional(v.object({
       tasksCompleted: v.number(),
       tasksFailed: v.number(),
       avgCompletionTime: v.number(),
       contextResets: v.number(),
       lastErrorAt: v.optional(v.number()),
       updatedAt: v.number(),
   })),
   ```

   **In the `tasks` table**, add after `assigneeId`:
   ```typescript
   createdBy: v.optional(v.union(v.id("agents"), v.literal("human"))),
   parentTaskId: v.optional(v.id("tasks")),
   acceptanceCriteria: v.optional(v.string()),
   requiredSkills: v.optional(v.array(v.string())),
   ```

   **Add indexes to `tasks`**:
   ```typescript
   .index("by_parent", ["parentTaskId"])
   .index("by_creator", ["createdBy"])
   ```

2. **Push schema**:
   ```bash
   npx convex dev --once
   ```

3. **Verify**: No errors in Convex dashboard. Existing data is unaffected because all new fields are `v.optional()`.

---

## 6. Phase 3: Agent Roster Cleanup

> **Estimated**: 20 minutes | **Priority**: HIGH
> **Why**: DB has 13 agents, reference spec defines 7 active + 6 dormant.

### Reference Spec (from PERSONAS.md):

**Active (7)**:
| Handle | Layer | Role |
|--------|-------|------|
| `lelouch` | Strategic | Supreme Strategist |
| `cc` | Analyst | Silent Analyst |
| `meliodas` | Lead | DevOps Lead |
| `shiroe` | Lead | Trading Architect |
| `demiurge` | Specialist | Security Auditor |
| `rimuru` | Specialist | Data Engineer |
| `senku` | Specialist | Research Specialist |

**Dormant (6)** — keep in DB, mark as `dormant: true`:
| Handle | Layer | Role | Spawn Trigger |
|--------|-------|------|---------------|
| `killua` | Specialist | Backend | Meliodas overwhelmed |
| `yor` | Specialist | Frontend | Meliodas overwhelmed |
| `lena` | Lead | Office Lead | Office board grows |
| `ainz` | Lead | Personal Lead | Personal board grows |
| `albedo` | Specialist | Admin | Documentation needs |
| `kazuma` | Specialist | QA | Testing needs |

### Steps:

1. **Create migration** `convex/migrations/markDormantAgents.ts`:
   ```typescript
   import { internalMutation } from "../_generated/server";

   export const markDormant = internalMutation({
       args: {},
       handler: async (ctx) => {
           const dormantHandles = ["killua", "yor", "lena", "ainz", "albedo", "kazuma"];
           const agents = await ctx.db.query("agents").collect();

           let updated = 0;
           for (const agent of agents) {
               if (dormantHandles.includes(agent.handle)) {
                   await ctx.db.patch(agent._id, {
                       dormant: true,
                       status: "sleeping",
                   });
                   updated++;
               } else {
                   // Explicitly mark active agents as non-dormant
                   await ctx.db.patch(agent._id, { dormant: false });
               }
           }
           return { updated };
       },
   });
   ```

2. **Run migration** from Convex dashboard → Functions → `migrations/markDormant` → Run

3. **Update `agent-grid.tsx`**: Add a toggle or separate section for dormant agents:
   ```typescript
   // Filter out dormant agents from main view
   const activeAgents = agents.filter((a) => !a.dormant);
   const dormantAgents = agents.filter((a) => a.dormant);
   ```

4. **Add UI**: Show dormant agents in a collapsed section with a "Dormant" badge

---

## 7. Phase 4: Task CRUD UI

> **Estimated**: 3-4 hours | **Priority**: HIGH
> **Why**: Currently tasks can only be created via seed scripts. Users can't add/edit/delete from UI.

### Components to Create:

#### A. `components/kanban/create-task-dialog.tsx`

**Purpose**: Modal dialog for creating new tasks.

**UI Elements**:
- Title input (required, max 200 chars)
- Description textarea (optional, max 5000 chars)
- Priority selector (dropdown: low, medium, high, urgent)
- Board selector (dropdown from `useQuery(api.boards.list)`)
- Tags input (comma-separated)
- Due date picker (optional)
- "Create Task" button

**Backend**: Uses existing `api.tasks.create` mutation.

```tsx
// Key logic:
const createTask = useMutation(api.tasks.create);

async function handleSubmit() {
    await createTask({
        boardId: selectedBoard,
        title,
        description,
        priority,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        dueDate: dueDate ? dueDate.getTime() : undefined,
    });
    onClose();
}
```

#### B. `components/kanban/edit-task-dialog.tsx`

**Purpose**: Edit existing tasks (opened by clicking a task card).

**UI Elements**: Same as create, pre-filled with current values.

**Backend**: Uses existing `api.tasks.update` mutation.

#### C. `convex/tasks.ts` — Add delete mutation

```typescript
export const remove = mutation({
    args: { id: v.id("tasks") },
    handler: async (ctx, args) => {
        const task = await ctx.db.get(args.id);
        if (!task) throw new Error("Task not found");
        await ctx.db.delete(args.id);
        return { success: true };
    },
});
```

#### D. Wire up to `board.tsx`

- Add a "+" button in each column header → opens `CreateTaskDialog`
- Make task cards clickable → opens `EditTaskDialog`
- Add delete button inside edit dialog (with confirmation)

### shadcn/ui components you'll need:

```bash
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add calendar
npx shadcn@latest add popover
```

---

## 8. Phase 5: Board Filtering

> **Estimated**: 1-2 hours | **Priority**: HIGH

### Current behavior:
- Kanban shows ALL tasks from ALL boards in one view
- No way to filter by domain

### Target behavior:
- Tab bar / dropdown above the Kanban board: `All | Office | Trading | Personal | Deployment`
- Selecting a board filters tasks shown in columns
- URL updates: `/kanban?board=trading`

### Steps:

1. **Add state to `board.tsx`**:
   ```typescript
   const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
   
   // Use board-specific query when filtered
   const rawTasks = useQuery(api.tasks.list, 
       selectedBoardId ? { boardId: selectedBoardId as Id<"boards"> } : {}
   );
   ```

2. **Add filter UI** above columns:
   ```tsx
   <div className="flex gap-2 mb-4">
       <Button 
           variant={!selectedBoardId ? "default" : "outline"}
           onClick={() => setSelectedBoardId(null)}
       >
           All Domains
       </Button>
       {boards?.map((board) => (
           <Button
               key={board._id}
               variant={selectedBoardId === board._id ? "default" : "outline"}
               onClick={() => setSelectedBoardId(board._id)}
           >
               {board.icon} {board.name.split(" ")[0]}
           </Button>
       ))}
   </div>
   ```

3. **Update badge count**: Show filtered count, not total.

---

## 9. Phase 6: Agent Detail Pages

> **Estimated**: 2-3 hours | **Priority**: HIGH

### URL: `/agents/[handle]`

### Steps:

1. **Create route**: `app/agents/[handle]/page.tsx`

2. **Add Convex query** `convex/agents.ts`:
   ```typescript
   export const getWithTasks = query({
       args: { handle: v.string() },
       handler: async (ctx, args) => {
           const agent = await ctx.db
               .query("agents")
               .withIndex("by_handle", (q) => q.eq("handle", args.handle))
               .first();
           if (!agent) return null;

           const tasks = agent.currentTaskId
               ? [await ctx.db.get(agent.currentTaskId)]
               : [];

           const assignedTasks = await ctx.db
               .query("tasks")
               .withIndex("by_assignee", (q) => q.eq("assigneeId", agent._id))
               .collect();

           const recentActivity = await ctx.db
               .query("activity")
               .filter((q) => q.eq(q.field("actorId"), agent._id))
               .order("desc")
               .take(20);

           return { agent, tasks: assignedTasks, activity: recentActivity };
       },
   });
   ```

3. **UI Layout**:
   ```
   ┌─────────────────────────────────────────────┐
   │  [Avatar]  @handle — Name                   │
   │  Role • Layer • Source                       │
   │  Status: ● Online                            │
   ├─────────────────────────────────────────────┤
   │  📋 Assigned Tasks (3)                       │
   │  ┌─────────────────────────────────────────┐ │
   │  │ Task Card • Priority • Status           │ │
   │  │ Task Card • Priority • Status           │ │
   │  └─────────────────────────────────────────┘ │
   ├─────────────────────────────────────────────┤
   │  📊 Health Metrics                           │
   │  Completed: 12 | Failed: 1 | Avg Time: 4m  │
   ├─────────────────────────────────────────────┤
   │  📜 Recent Activity (20)                     │
   │  • Completed "Set up CI/CD" — 2h ago        │
   │  • Heartbeat — 5m ago                       │
   └─────────────────────────────────────────────┘
   ```

4. **Link from agent card**: In `agent-card.tsx`, wrap name in `<Link href={/agents/${agent.handle}}>`.

---

## 10. Phase 7: Threaded Comments

> **Estimated**: 2-3 hours | **Priority**: MEDIUM
> **Why**: Comments table already exists in schema and backend. Just needs UI.

### Steps:

1. **Create** `components/kanban/task-comments.tsx`

2. **Key queries/mutations** (already exist in `convex/comments.ts`):
   - `api.comments.listByTask` — get comments for a task
   - `api.comments.create` — add a comment

3. **UI**: Render inside `EditTaskDialog` or a slide-over panel:
   ```
   ┌──────────────────────────────────┐
   │ Comments (3)                     │
   │ ┌──────────────────────────────┐ │
   │ │ @lelouch • 5m ago           │ │
   │ │ This task needs more detail  │ │
   │ │   └─ @cc • 2m ago           │ │
   │ │      Updated requirements.   │ │
   │ └──────────────────────────────┘ │
   │ ┌──────────────────────────────┐ │
   │ │ [Type a comment...]  [Send] │ │
   │ └──────────────────────────────┘ │
   └──────────────────────────────────┘
   ```

4. **Threading**: Use `parentId` to render nested replies. Limit to 2 levels deep.

5. **@mentions**: Parse `@handle` in comment text and pass to `mentions` field.

---

## 11. Phase 8: Agent Messages Viewer

> **Estimated**: 1-2 hours | **Priority**: MEDIUM

### Steps:

1. **Create** `app/messages/page.tsx`

2. **Add sidebar link** in `components/layout/sidebar.tsx`

3. **Use existing queries** from `convex/agentMessages.ts`:
   - `api.agentMessages.listUnacknowledged`
   - `api.agentMessages.listSent`

4. **UI**: Two-column layout:
   ```
   ┌──────────────┬───────────────────────────┐
   │ Conversations│ Message Thread             │
   │              │                            │
   │ @lelouch→    │ From: @lelouch             │
   │   @shiroe    │ To: @shiroe                │
   │              │ Type: order                │
   │ @cc→         │                            │
   │   @lelouch   │ "Analyze Q1 performance    │
   │              │  and report to @rimuru"     │
   │              │                            │
   │              │ Response: "Acknowledged.    │
   │              │  Starting analysis now."    │
   └──────────────┴───────────────────────────┘
   ```

---

## 12. Phase 9: Heartbeat Visualization

> **Estimated**: 1-2 hours | **Priority**: MEDIUM

### Current behavior:
- Agent card shows static "1m ago" text for heartbeat

### Target behavior:
- Show a live countdown since last heartbeat
- Green pulse animation when within HB interval
- Yellow when overdue (1.5x interval)
- Red when stale (3x interval)

### Steps:

1. **Create** `components/agents/heartbeat-indicator.tsx`:
   ```typescript
   function HeartbeatIndicator({ lastHeartbeat }: { lastHeartbeat: number }) {
       const [elapsed, setElapsed] = useState(0);

       useEffect(() => {
           const timer = setInterval(() => {
               setElapsed(Date.now() - lastHeartbeat);
           }, 1000);
           return () => clearInterval(timer);
       }, [lastHeartbeat]);

       const minutes = Math.floor(elapsed / 60000);
       const isHealthy = minutes < 10;
       const isWarning = minutes >= 10 && minutes < 30;
       const isStale = minutes >= 30;

       return (
           <div className="flex items-center gap-1 text-xs">
               <div className={cn(
                   "h-2 w-2 rounded-full",
                   isHealthy && "bg-green-500 animate-pulse",
                   isWarning && "bg-yellow-500",
                   isStale && "bg-red-500"
               )} />
               <span>{minutes}m ago</span>
           </div>
       );
   }
   ```

2. **Replace** the static "1m ago" text in `agent-card.tsx` with this component.

---

## 13. Phase 10: Dashboard Overview Widgets

> **Estimated**: 2-3 hours | **Priority**: LOW

### Target: Make the home page (`app/page.tsx`) a rich dashboard

### Current:
`app/page.tsx` just renders the `KanbanBoard` component.

### Target layout:
```
┌──────────────────────────────────────────────────────┐
│ Dashboard Overview                                    │
├────────────┬────────────┬────────────┬───────────────┤
│ Total Tasks│ In Progress│ Active     │ Completed     │
│    14      │     3      │ Agents: 7  │ Today: 0      │
├────────────┴────────────┴────────────┴───────────────┤
│ Kanban Board (with filtering)                         │
│ [All] [Office] [Trading] [Personal] [Deployment]      │
│ ┌─Backlog─┬──Todo──┬──InProg──┬──Review──┬──Done──┐  │
│ │         │        │          │          │         │  │
│ └─────────┴────────┴──────────┴──────────┴─────────┘  │
├──────────────────────────────────────────────────────┤
│ Recent Activity (5 most recent)                       │
└──────────────────────────────────────────────────────┘
```

### Steps:

1. **Create** `components/dashboard/stats-bar.tsx` — 4 number cards
2. **Create** `components/dashboard/recent-activity.tsx` — compact feed (5 items)
3. **Update** `app/page.tsx` to compose these with `KanbanBoard`

---

## 14. Phase 11: Polish & UX

> **Estimated**: 2-4 hours | **Priority**: LOW

### A. Agent Avatars
- Generate pixel-art anime avatars using AI image generation
- Save to `/public/avatars/[handle].png`
- Dimensions: 128x128px, transparent background
- **Reference**: PERSONAS.md describes each character's anime source

### B. Dark/Light Theme Toggle
- Add `ThemeProvider` from `next-themes`
- Add toggle button in header
- Update `globals.css` to support both modes

### C. Notification Center
- Show a bell icon in header with unread count
- Pull from `notificationQueue` table
- Use `useQuery(api.notifications.listPending)`

### D. Loading States
- Already have Skeleton loaders ✅
- Add error boundaries for failed queries
- Add empty states for zero-data scenarios

---

## 15. Verification Checklist

After completing each phase, verify:

```bash
# 1. Type check
npx next build                    # Must pass with zero errors

# 2. Convex schema sync
npx convex dev --once             # Must push without errors

# 3. Manual checks
# - Open dashboard in browser
# - Verify the specific feature works
# - Check Convex dashboard for data consistency

# 4. Git workflow
git add .
git commit -m "feat: <phase description>"
git push origin main              # Auto-deploys to Vercel
```

### Critical invariants:
- ❌ Never commit with build errors
- ❌ Never push schema changes without testing locally first
- ❌ Never expose `internalMutation` as public `mutation`
- ✅ Always add input validation to new mutations
- ✅ Always test drag-and-drop after Kanban changes
- ✅ Always check mobile responsiveness

---

## Appendix: File Map

```
mission-control-dashboard/
├── app/
│   ├── layout.tsx          ← Root layout (ConvexProvider + AuthGuard)
│   ├── page.tsx            ← Home (currently just KanbanBoard)
│   ├── activity/page.tsx   ← Activity feed page
│   └── agents/page.tsx     ← Agent grid page
│       └── [handle]/page.tsx  ← (Phase 6: Agent detail)
├── components/
│   ├── auth/
│   │   └── auth-guard.tsx  ← Sign-in gate
│   ├── agents/
│   │   ├── agent-card.tsx  ← Individual agent card
│   │   └── agent-grid.tsx  ← Grid with layer grouping
│   ├── kanban/
│   │   ├── board.tsx       ← Main board + DnD
│   │   ├── column.tsx      ← Single column
│   │   └── task-card.tsx   ← Task card
│   ├── activity/
│   │   └── activity-feed.tsx ← Feed + stats
│   ├── layout/
│   │   ├── sidebar.tsx     ← Navigation
│   │   └── header.tsx      ← Top bar
│   └── ui/                 ← shadcn/ui primitives
├── convex/
│   ├── schema.ts           ← Database schema
│   ├── auth.ts             ← GitHub OAuth config
│   ├── http.ts             ← Auth HTTP routes
│   ├── agents.ts           ← Agent queries/mutations
│   ├── tasks.ts            ← Task queries/mutations
│   ├── activity.ts         ← Activity feed
│   ├── boards.ts           ← Board queries/mutations
│   ├── comments.ts         ← Comment queries/mutations
│   ├── agentMessages.ts    ← Inter-agent messages
│   ├── subscriptions.ts    ← @mention tracking
│   ├── seed.ts             ← Initial data (internalMutation)
│   ├── seedTasks.ts        ← Task data (internalMutation)
│   └── migrations.ts       ← Schema migrations (internalMutation)
├── lib/
│   ├── convex.tsx          ← ConvexAuthProvider wrapper
│   ├── types.ts            ← TypeScript interfaces
│   └── utils.ts            ← Utility functions
├── docs/
│   ├── CHANGELOG.md
│   ├── ROADMAP.md
│   ├── architecture.md
│   └── HANDOVER_PLAN.md    ← This file
└── next.config.ts          ← Security headers
```
