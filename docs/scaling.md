# Scaling Notes

Bottlenecks, limits, and strategies for scaling Mission Control.

## Current Architecture Limits

| Component | Limit | Bottleneck |
|-----------|-------|------------|
| Convex Cloud | 1M doc reads/month (free) | High-frequency subscriptions |
| VPS (fight-uno) | 4 vCPU, 24GB RAM | LLM call latency |
| LLM Provider | Rate limits vary by model | Quota exhaustion |
| PM2 Agents | 11 concurrent | Memory per agent (~100MB) |

## Identified Bottlenecks

### 1. LLM Call Latency
- **Problem**: Each heartbeat requires 1-3 LLM calls
- **Impact**: 11 agents × 3 calls × 30s each = ~5.5 min theoretical max
- **Mitigation**: Staggered scheduling, Priority Scan for urgent agents

### 2. Convex Subscription Volume
- **Problem**: Real-time subscriptions for each open dashboard
- **Impact**: Multiple users = multiplied reads
- **Mitigation**: Aggregate queries, reduce subscription granularity

### 3. Single VPS Point
- **Problem**: All agents on one VPS
- **Impact**: VPS down = all agents offline
- **Mitigation**: Distributed agent pools (future)

## Horizontal Scaling Strategy

### Phase 1: Agent Pool Distribution
```
VPS-1 (fight-uno): Lelouch, C.C., Lena, Shiroe
VPS-2 (fight-dos): Ainz, Meliodas, Specialists
```

### Phase 2: Regional Deployment
- Deploy VPS in different regions for redundancy
- Use Tailscale mesh for secure inter-VPS communication

### Phase 3: Kubernetes Migration (Future)
- Each agent as a pod
- Horizontal pod autoscaler based on queue depth

## Vertical Scaling Options

| Upgrade | Impact | Cost |
|---------|--------|------|
| VPS RAM 24→48GB | More concurrent agents | ~$20/mo |
| Convex Pro | 10M reads, priority support | $25/mo |
| Dedicated LLM | No rate limits | Variable |

## Monitoring Checklist

- [ ] PM2 metrics (CPU, memory per agent)
- [ ] Convex dashboard (read/write counts)
- [ ] LLM quota tracker
- [ ] Error rate per agent (errors table)
