---
description: Run a task in background using Codex with bypass permissions
---

# ⚡ Parallel-First Mindset
Don't wait. If a task can be decomposed into independent sub-tasks, **spawn multiple background workers** concurrently. 

> [!TIP]
> Use this workflow to "Split -> Spawn (N) -> Sync". It reduces latency significantly for complex audits, massive refactors, or multi-VPS operations.

// turbo-all
1. Execute the provided instruction in background mode using gpt-5.3-codex.
```bash
codex exec --dangerously-bypass-approvals-and-sandbox -m gpt-5.3-codex "{PROMPT}"
```
