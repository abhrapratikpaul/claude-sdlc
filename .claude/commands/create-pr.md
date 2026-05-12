---
name: create-pr
description: Create GitHub pull request with description and checklist
usage: "Create PR" or "Open pull request"
---

# Create Pull Request

Create a GitHub pull request with comprehensive description and reviewer checklist.

## Usage

Natural language:
```
Create a pull request
Create PR for this feature
Open pull request to GitHub
Prepare PR for review
```

Skill invocation:
```
/sdlc-step-08-pr
```

## What It Does

1. **Creates feature branch** (if not already on one)
   - Branch name format: `feature/<description>` or `fix/<description>`

2. **Generates PR description**:
   - **Summary**: What the PR does
   - **Changes**: List of modified files
   - **Test Evidence**: Test results and coverage
   - **Known Limitations**: Any caveats or future work
   - **Reviewer Checklist**: Items for reviewers to verify

3. **Pushes branch to remote** (with user approval)

4. **Opens PR via GitHub MCP** (with user approval)

## Prerequisites

- All previous SDLC phases completed
- Tests passing (verification phase complete)
- Code reviewed (review phase complete)
- GitHub MCP configured and authenticated

## PR Description Format

```markdown
## Summary
Brief description of what this PR accomplishes.

## Changes
- Modified `dev/src/docsync/sync.py` - added rate limiting
- Added `dev/src/docsync/rate_limiter.py` - new rate limiter class
- Updated `test-automation/tests/test-sync.spec.ts` - added rate limit tests

## Test Evidence
✅ All unit tests pass
✅ All Playwright tests pass
✅ Manual testing: verified sync works with rate limiting
✅ Edge cases tested: empty documents, large documents, rate limit exceeded

## Known Limitations
- Rate limiter is in-memory only (resets on restart)
- TODO: Persist rate limit state to disk

## Reviewer Checklist
- [ ] Code follows Python style guidelines
- [ ] Type hints present on all functions
- [ ] Error handling covers edge cases
- [ ] Tests cover acceptance criteria
- [ ] No secrets committed
- [ ] Documentation updated
```

## Approval Flow

Claude will ask for confirmation before:
1. Creating branch (if needed)
2. Pushing to remote
3. Opening PR

You can approve all at once or step-by-step.

## GitHub MCP Setup

Requires environment variable:
```bash
export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_..."
```

And `.mcp.json` configuration:
```json
{
  "servers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${env:GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}
```

## Related Commands

- Check git status: `"Show git status"`
- Review changes: `"Review my changes"`
- Show diff: `"Show diff since main"`
