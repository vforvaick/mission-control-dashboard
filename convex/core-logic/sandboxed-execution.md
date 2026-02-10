# Sandboxed Execution

The task-executor handles command execution with security controls.

## Whitelist Approach

Only pre-approved commands are allowed. Everything else is rejected.

### Safe Commands (Auto-Run)
```javascript
const SAFE_COMMANDS = [
    'ls', 'cat', 'grep', 'find', 'head', 'tail', 'wc',
    'echo', 'pwd', 'date', 'whoami', 'env',
    'npm run', 'npm test', 'npm build',
    'git status', 'git log', 'git diff', 'git branch',
    'curl', 'wget', // Read-only HTTP
];
```

### Requires Approval
```javascript
const IRREVERSIBLE_KEYWORDS = [
    'rm', 'delete', 'drop', 'truncate',
    'force', 'reset', 'purge', 'destroy',
    'sudo', 'chmod', 'chown',
];
```

## Execution Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. ANALYZE TASK                                                 │
│    - LLM generates execution plan from task description         │
│    - Output: list of commands + expected outcomes               │
├─────────────────────────────────────────────────────────────────┤
│ 2. VALIDATE COMMANDS                                            │
│    - Check each command against whitelist                       │
│    - Scan for irreversible keywords                             │
│    - If any irreversible: HALT → Approval Gate                  │
├─────────────────────────────────────────────────────────────────┤
│ 3. EXECUTE (if approved)                                        │
│    - Run commands sequentially                                  │
│    - Capture stdout/stderr                                      │
│    - Log to task.executionLog                                   │
├─────────────────────────────────────────────────────────────────┤
│ 4. EVALUATE RESULT                                              │
│    - Check exit codes                                           │
│    - Compare output to expected outcomes                        │
│    - Mark task as completed or failed                           │
└─────────────────────────────────────────────────────────────────┘
```

## Approval Gate

When irreversible action detected:
1. Task status → `pending_approval`
2. Create notification with:
   - Goal (what we're trying to achieve)
   - Plan (steps we will take)
   - Irreversible Command (the specific danger)
3. Send to User via Telegram
4. Wait for explicit approval before continuing

## Execution Logging

Every command logs to `task.executionLog`:
```typescript
{
    timestamp: Date.now(),
    type: "command", // or "output", "error", "info"
    content: "npm run build",
}
```

Ring buffer limit: 1000 lines per task.

## Resource Limits

| Resource | Limit |
|----------|-------|
| Command timeout | 60 seconds |
| Output buffer | 10KB per command |
| Concurrent executions | 1 per agent |
| Retry attempts | 3 (with exponential backoff) |

## Environment

- Working directory: Project root
- Shell: `/bin/bash`
- Environment variables: Inherited from PM2 process
- Network: Tailscale-secured LAN access only
