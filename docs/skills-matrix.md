# Skills Matrix

Agent-to-Tool permissions. Each agent has access to specific skills based on their role.

## Skill Categories

| Category | Skills | Description |
|----------|--------|-------------|
| **Core** | Shell, File, HTTP | Basic execution capabilities |
| **Research** | Browser, Google | Web research and reading |
| **Development** | GitHub | Code repository operations |
| **Security** | Audit, Scan, Guardrails | Security verification |

## Agent Permissions

### Strategic Layer

| Agent | Handle | Core | Research | Development | Security |
|-------|--------|------|----------|-------------|----------|
| Lelouch | @lelouch | ✓ | ✓ | ✓ | Read-only |
| C.C. | @cc | ✓ | ✓ | - | - |

### Tactical Layer (Area Leads)

| Agent | Handle | Core | Research | Development | Security |
|-------|--------|------|----------|-------------|----------|
| Lena | @lena | ✓ | - | - | - |
| Shiroe | @shiroe | ✓ | ✓ | - | - |
| Ainz | @ainz | ✓ | ✓ | - | - |
| Meliodas | @meliodas | ✓ | - | ✓ | - |

### Operational Layer (Specialists)

| Agent | Handle | Core | Research | Development | Security |
|-------|--------|------|----------|-------------|----------|
| Killua | @killua | ✓ | - | ✓ | - |
| Yor | @yor | ✓ | - | ✓ | - |
| Rimuru | @rimuru | ✓ | ✓ | - | - |
| Albedo | @albedo | ✓ | - | - | - |
| Kazuma | @kazuma | ✓ | - | ✓ | - |
| Senku | @senku | ✓ | ✓ | ✓ | - |
| Demiurge | @demiurge | ✓ | - | - | ✓ |

## Skill Invocation

Skills are invoked via the `SKILL:TOOL_NAME` pattern in task execution:

```
GITHUB:CREATE_ISSUE
GOOGLE:SEARCH
BROWSER:READ_URL
SECURITY:SCAN_FILE
```

## Adding New Skills

1. Create skill file in `vps-skills/skills-library/[name].js`
2. Export tool functions with standard signature
3. Register in skills loader
4. Update this matrix with agent permissions
