# Mission Control Dashboard

Real-time Kanban dashboard for the **Isekai Crossover Legion** multi-agent AI system.

![Kanban Board](/docs/assets/screenshots/kanban_board.png)

## Features

- **Kanban Board**: Drag-and-drop task management across 5 columns (Backlog, To Do, In Progress, Review, Done)
- **Agent Status**: Grid view of all 13 AI agents with real-time status indicators
- **Activity Feed**: Live stream of agent activities with filtering and statistics
- **Dark Theme**: Premium Isekai Crossover Legion theme with Code Geass red and Overlord gold accents

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 16 (App Router) |
| UI | shadcn/ui + Tailwind CSS |
| Database | Convex (cloud) |
| Drag & Drop | @dnd-kit |
| Icons | Lucide React |

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Add your NEXT_PUBLIC_CONVEX_URL

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Environment Variables

```bash
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

## VPS Canonical Path

Use only this project path on `fight-uno`:

```bash
/home/vforvaick/.openclaw/workspace/mission-control-dashboard
```

Path policy:
- Canonical: `/home/vforvaick/.openclaw/workspace/mission-control-dashboard`
- Legacy path `~/projects/isekai-legion` is retired
- Keep Convex + frontend + docs in the same canonical directory

## Project Structure

```
mission-control-dashboard/
├── app/
│   ├── layout.tsx          # Root + providers
│   ├── page.tsx            # Kanban (home)
│   ├── agents/page.tsx     # Agent grid
│   └── activity/page.tsx   # Activity feed
├── components/
│   ├── ui/                 # shadcn components
│   ├── kanban/             # Board, Column, TaskCard
│   ├── agents/             # AgentGrid, AgentCard
│   ├── activity/           # ActivityFeed
│   └── layout/             # Sidebar, Header
├── lib/
│   ├── convex.tsx          # Convex client
│   ├── types.ts            # TypeScript definitions
│   └── utils.ts            # shadcn utilities
├── docs/                   # Full system documentation (Specs, Architecture, Roadmap)
└── public/avatars/         # Agent portraits

```

## Agent Roster

**Active Roster (7 Agents)**

| Layer | Agent | Role | Status |
|-------|-------|------|--------|
| Strategic | @lelouch | Supreme Strategist + PA | Active |
| Analyst | @cc | Silent Analyst | Active |
| Lead | @meliodas | DevOps Lead | Active |
| Lead | @shiroe | Trading Architect | Active |
| Specialist | @demiurge | Security Auditor | Active |
| Specialist | @rimuru | Data Engineer | Active |
| Specialist | @senku | Research Specialist | Active |

**Dormant (Spawn on Demand)**: @killua, @yor, @lena, @ainz, @albedo, @kazuma


## Deployment

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variable: `NEXT_PUBLIC_CONVEX_URL`
4. Deploy

## References

- Full Documentation: [docs/](docs/)
- Convex Dashboard: https://dashboard.convex.dev/d/ceaseless-bullfrog-373
