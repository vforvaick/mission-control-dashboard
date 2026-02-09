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
└── public/avatars/         # Agent portraits
```

## Agent Roster

| Layer | Agent | Role |
|-------|-------|------|
| Strategic | @lelouch | Supreme Strategist |
| Secretary | @cc | Chief of Staff |
| Tactical | @lena | Office Lead |
| Tactical | @shiroe | Trading Lead |
| Tactical | @ainz | Personal Lead |
| Tactical | @meliodas | Deployment Lead |
| Operational | @killua | Backend Specialist |
| Operational | @yor | Frontend Specialist |
| Operational | @rimuru | Data Analyst |
| Operational | @albedo | Admin Specialist |
| Operational | @kazuma | QA Specialist |
| Operational | @senku | Research Specialist |
| Operational | @demiurge | Security Auditor |

## Deployment

1. Push to GitHub
2. Import to [Vercel](https://vercel.com)
3. Add environment variable: `NEXT_PUBLIC_CONVEX_URL`
4. Deploy

## References

- Backend Reference: `mission-control-reference/`
- Convex Dashboard: https://dashboard.convex.dev/d/ceaseless-bullfrog-373
