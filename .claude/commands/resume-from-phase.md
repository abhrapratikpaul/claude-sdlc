---
name: resume-from-phase
description: Resume SDLC pipeline from a specific phase
usage: "Resume from architecture" or "Continue from implementation"
---

# Resume SDLC From Phase

Resume the SDLC pipeline from a specific phase instead of starting from requirements.

## Usage

Natural language:
```
Resume from architecture phase
Continue from implementation
Skip to verification phase
Start from phase 5
```

Skill invocation:
```
/sdlc from=architecture
/sdlc from=implementation
/sdlc from=verify
```

## Available Phases

| Phase Name | Phase Number | Command |
|------------|--------------|---------|
| requirements | 1 | `/sdlc from=requirements` |
| architecture | 2 | `/sdlc from=architecture` |
| design-review | 3 | `/sdlc from=design-review` |
| impl-plan | 4 | `/sdlc from=impl-plan` |
| implementation | 5 | `/sdlc from=implementation` |
| review | 6 | `/sdlc from=review` |
| verify | 7 | `/sdlc from=verify` |
| pr | 8 | `/sdlc from=pr` |

## When to Use

- **Phase failed**: Resume after fixing the issue
- **Work interrupted**: Continue where you left off
- **Skip unnecessary phases**: E.g., skip to implementation if requirements/architecture already done
- **Re-run specific phase**: E.g., re-run verification after fixing tests

## Prerequisites

All prior phase outputs must exist:
- Resuming from architecture → requires requirements.md
- Resuming from implementation → requires requirements.md, architecture.md, design-review.md, impl-plan.md
- Resuming from pr → requires all previous outputs + code + tests

## Example Scenarios

### Scenario 1: Design Review Failed
```
"Resume from design-review phase"
→ Re-runs design review with updated architecture
```

### Scenario 2: Tests Failing
```
"Resume from verify"
→ Re-generates and re-runs Playwright tests
```

### Scenario 3: Skip to Implementation
```
"Resume from implementation"
→ Jumps directly to code writing (if plan exists)
```
