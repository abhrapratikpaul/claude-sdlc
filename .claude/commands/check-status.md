---
name: check-status
description: Check current SDLC phase and project status
usage: "What's the status?" or "Check SDLC progress"
---

# Check SDLC Status

Check which phase you're currently in and what's been completed.

## Usage

Natural language:
```
What's the current SDLC status?
Check project progress
Where are we in the pipeline?
What phase am I in?
Show SDLC progress
What's been completed?
```

## What It Shows

1. **Current Phase**: Which phase is active or was last completed
2. **Completed Phases**: List of phases that have finished
3. **Pending Phases**: What still needs to be done
4. **Artifacts Generated**: Which documents/code files exist
5. **Next Steps**: What to do next

## Example Output

```
Current Phase: Implementation (5/8)

Completed:
✅ Phase 1: Requirements (requirements.md)
✅ Phase 2: Architecture (architecture.md)
✅ Phase 3: Design Review (design-review.md)
✅ Phase 4: Implementation Plan (impl-plan.md)
🔄 Phase 5: Implementation (in progress)

Pending:
⏳ Phase 6: Review
⏳ Phase 7: Verify
⏳ Phase 8: PR

Next Step: Complete implementation, then run /sdlc-step-06-review
```

## Related Commands

- Check git status: `"Show git status"`
- Check test results: `"Show test results"`
- Check recent changes: `"What changed recently?"`
