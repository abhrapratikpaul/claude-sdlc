---
name: run-full-pipeline
description: Execute the complete 8-phase SDLC pipeline from requirements to PR
usage: "Run full SDLC pipeline" or "Execute complete pipeline"
---

# Run Full SDLC Pipeline

Executes all 8 phases in sequence:
1. Requirements extraction from Jira/user-story.md
2. Architecture design
3. Design review
4. Implementation planning
5. Code implementation
6. Code review
7. Verification testing
8. Pull request creation

## Usage

Natural language:
```
Run the full SDLC pipeline
Execute complete pipeline from requirements to PR
Start full development cycle
```

Skill invocation:
```
/sdlc
```

## What It Does

1. **Requirements Phase**
   - Fetches Jira ticket via MCP (if provided)
   - Reads user-story.md
   - Generates requirements.md with FR/NFR/AC

2. **Architecture Phase**
   - Reads requirements.md
   - Designs component structure
   - Generates architecture.md

3. **Design Review Phase**
   - Reviews architecture.md
   - Produces design-review.md with verdict

4. **Implementation Plan Phase**
   - Synthesizes requirements + architecture + design review
   - Generates impl-plan.md with task breakdown

5. **Implementation Phase**
   - Writes Python code under dev/
   - Follows impl-plan.md

6. **Review Phase**
   - Self-reviews code for quality/security
   - Produces findings report

7. **Verification Phase**
   - Generates Playwright tests under test-automation/
   - Runs tests and produces report

8. **PR Phase**
   - Creates feature branch
   - Generates PR description
   - Opens GitHub PR (with user approval)

## Prerequisites

- `user-story.md` exists at project root
- OR Jira ticket ID provided
- Environment variables set (GITHUB_PERSONAL_ACCESS_TOKEN, EPAM_JIRA_API_TOKEN)

## Expected Duration

~10-15 minutes for a typical feature

## Output

- requirements.md
- architecture.md
- design-review.md
- impl-plan.md
- dev/**/*.py (implementation)
- Review findings
- test-automation/**/*.spec.ts (tests)
- GitHub PR
