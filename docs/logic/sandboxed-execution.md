# Logic: Sandboxed Execution

Agents execute work through a dedicated `task-executor` that bridges the Convex backend with the VPS shell environment.

---

## Execution Flow

1.  **Trigger**: Agent claims a task and identifies a command sequence in its plan.
2.  **Environment**: Commands are run in a isolated directory per task (`/tmp/task-[id]/`).
3.  **Logging**: `stdout` and `stderr` are captured in real-time and pushed to the Convex `executionLog` array.
4.  **Completion**: Upon success, artifacts are moved to the `kb/` or project directory.

---

## The "Human-in-the-Loop" (HITL) Gate

To prevent accidents, the system enforces a strict approval gate for high-risk operations.

### Irreversible Command Detection
The `task-executor` scans commands for dangerous keywords:
- `rm -rf`, `drop table`, `delete`, `force-push`, `reset --hard`, `npm uninstall`.

### The `pending_approval` State
If a dangerous command is detected:
1.  Execution **pauses**.
2.  Task status moves to `pending_approval`.
3.  **Telegram Alert**: A bridge sends a message to Faiq:
    - **Agent**: @meliodas
    - **Goal**: "Clean up stale Docker images"
    - **Dangerous Command**: `docker system prune -a --force`
    - **Action**: Reply `Y` to approve or `N` to abort.

---

## Tool Catalog Integration

Tasks can invoke specialized tools using the `SKILL:TOOL` syntax.

- `GITHUB:PULL_REQUEST`: Creates a PR and returns the URL.
- `CONVEX:DEPLOY`: Triggers a schema update.
- `BROWSER:RESEARCH`: Launches a headless browser to extract text from websites.

Each tool provides a structured JSON output that the agent parses to determine the next step in its plan.
