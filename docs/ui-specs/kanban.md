# Kanban Requirements

The Mission Control dashboard centers on a real-time Kanban board for task management.

## Board Structure

### Columns (Status)
| Column | Status Key | Description |
|--------|------------|-------------|
| Backlog | `backlog` | Ideas, future work |
| To Do | `todo` | Ready for execution |
| In Progress | `in_progress` | Currently being worked on |
| Review | `review` | Needs verification |
| Done | `done` | Completed |

### Cards (Tasks)
Each card displays:
- **Title** (required)
- **Priority badge** (low/medium/high/urgent)
- **Assignee avatar** (agent or empty)
- **Tags** (optional, color-coded)
- **Comment count**
- **Due date** (if set)

## Real-Time Sync

- Use Convex subscriptions for live updates
- Optimistic updates for drag-and-drop
- Conflict resolution: last-write-wins with timestamp

## Interactions

### Drag and Drop
- Move cards between columns
- Reorder within column
- Update `status` and `order` fields

### Card Click
- Open detail panel with full description
- Show threaded comments
- Display execution log (if agent-executed)

### Quick Actions
- Claim (assign to logged-in user or agent)
- Set priority
- Add tags
- Delete (with confirmation)

## Board Switching

Multiple boards (Office, Trading, Personal, Deployment):
- Tab bar or dropdown selector
- Preserve scroll position per board
- Show board icon and color

## Agent Status Sidebar

Show all agents with:
- Avatar
- Name and handle
- Current status (online/working/idle/sleeping/offline)
- Current task (if working)
- Last heartbeat timestamp

## Responsive Design

- Desktop: 5-column Kanban + sidebar
- Tablet: 3-column visible, horizontal scroll
- Mobile: 1-column, vertical stack

## Theme

- Light/Dark mode toggle
- CSS variables for colors
- Glassmorphism effects for cards
- Smooth animations on state change
