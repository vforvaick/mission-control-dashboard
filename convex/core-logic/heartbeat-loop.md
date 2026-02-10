# Heartbeat Loop

The heartbeat loop is the core lifecycle for every agent. It runs on a schedule (default: 20 minutes for general, 1 minute for Priority Scan).

## 8-Phase Protocol

```
┌─────────────────────────────────────────────────────────────────┐
│                         HEARTBEAT LOOP                          │
├─────────────────────────────────────────────────────────────────┤
│ Phase 1: WAKE UP                                                │
│   - Update status to 'online'                                   │
│   - Load board-specific resources from Knowledge Library        │
│   - Fetch working memory from previous session                  │
├─────────────────────────────────────────────────────────────────┤
│ Phase 2: CHECK MENTIONS                                         │
│   - Query subscriptions table for unacknowledged mentions       │
│   - Process each mention with hierarchical system prompt        │
│   - Mark as acknowledged after response                         │
├─────────────────────────────────────────────────────────────────┤
│ Phase 3: CHECK MESSAGES                                         │
│   - Query agentMessages for unacknowledged messages             │
│   - Process orders/reports/questions from other agents          │
│   - Generate responses and mark as acknowledged                 │
├─────────────────────────────────────────────────────────────────┤
│ Phase 4: ROUTE                                                  │
│   - Calculate priority score for each assigned board            │
│   - Consider: urgency, pending tasks, expertise match           │
│   - Select the "winning" board for this cycle                   │
├─────────────────────────────────────────────────────────────────┤
│ Phase 5: PRE-CLAIM CHECK                                        │
│   - Evaluate candidate tasks for "Information Readiness"        │
│   - If task lacks SOP/context, flag for Lead instead            │
│   - Only proceed with well-documented tasks                     │
├─────────────────────────────────────────────────────────────────┤
│ Phase 6: CLAIM                                                  │
│   - Lock and claim the selected task                            │
│   - Update task status to 'in_progress'                         │
│   - Set currentTaskId on agent record                           │
├─────────────────────────────────────────────────────────────────┤
│ Phase 7: EXECUTE                                                │
│   - Analyze task requirements via LLM                           │
│   - Generate execution plan (commands, actions)                 │
│   - Run sandboxed commands via task-executor                    │
│   - Log all output to executionLog                              │
│   - Check for irreversible actions → Approval Gate              │
├─────────────────────────────────────────────────────────────────┤
│ Phase 8: SLEEP                                                  │
│   - Update task status (done/failed)                            │
│   - Save reflections to workingMemory                           │
│   - Update agent status to 'idle' or 'sleeping'                 │
│   - Log activity to activity table                              │
└─────────────────────────────────────────────────────────────────┘
```

## Standby Optimization

For high-frequency agents (like Lelouch @ 1 minute):
- Skip Phase 4 (Route) if no inbox work AND full routing done recently (<15min)
- This prevents unnecessary board scanning on frequent cycles

## Key Functions

### Priority Score Calculation
```
score = (urgency_weight * urgency) + 
        (expertise_weight * expertise_match) + 
        (pending_weight * pending_task_count)
```

### Expertise Match (0.0 - 1.0)
Calculated by analyzing task requirements against agent's:
- Role keywords
- Personality specializations
- Historical task completion in similar areas

## Error Handling

- Use exponential backoff with jitter for LLM retries
- Log all errors to `errors` table
- Track `errorCount` in workingMemory
- After 3 consecutive errors, enter "cool-off" mode
