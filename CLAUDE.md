# Claude Code Workspace Instructions

## Project Overview
**AI-Powered SDLC Pipeline for Automated Documentation Sync**

This repository implements a complete 8-phase Software Development Life Cycle (SDLC) using Claude Code agents, skills, and MCP integrations. The project demonstrates best practices for AI-assisted software engineering with automated requirements gathering, architecture design, implementation, testing, and PR creation.

## Project Goal
Build an intelligent, agentic SDLC pipeline that:
- Fetches requirements from EPAM Jira/Confluence via MCP
- Generates testable requirements and architecture documents
- Implements Python-based documentation sync CLI tool
- Verifies implementation with Playwright tests
- Creates production-ready PRs with comprehensive checklists

## Hard Constraints

### Code Organization
- **Python dev code lives ONLY under `dev/`** - never in root or test-automation/
- **Playwright + TypeScript tests live ONLY under `test-automation/`** - never in dev/
- **No mixing**: Never add TS tooling/config to dev/ or Python tooling/config to test-automation/
- **Documentation**: Root level (user-story.md, requirements.md, architecture.md, etc.)

### SDLC Phase Rules
- Execute phases in strict sequence (1→2→3→4→5→6→7→8)
- Never skip phases or implement code before completing impl-plan.md
- Never create PR before passing verification tests
- Keep commits scoped to current SDLC phase

### Documentation Workflow
- `user-story.md` is the immutable source of truth (input only)
- `requirements.md` derives from user-story.md
- `architecture.md` derives from requirements.md
- `design-review.md` reviews architecture.md
- `impl-plan.md` synthesizes all above
- Keep all docs mutually consistent
- Prefer small, auditable diffs when updating

### Security & Safety
- **NEVER** output or commit secrets (.env, tokens, API keys)
- **ALWAYS** use environment variables: `${env:VAR_NAME}`
- **NEVER** skip git hooks (--no-verify, --no-gpg-sign)
- **NEVER** use destructive git commands without explicit user approval

## Claude Code Best Practices

### Tool Selection (Critical!)
- Use `Read` instead of `cat/head/tail`
- Use `Grep` instead of `grep/rg` commands
- Use `Glob` instead of `find/ls -R`
- Use `Edit` instead of `sed/awk`
- Use `Write` only for new files, `Edit` for existing files
- Reserve Bash for actual shell operations only

### Agent Usage
- Use `/sdlc` skill for full pipeline
- Use `@sdlc-step-XX-<phase>` agents for individual phases
- Use `@sdlc from=<phase>` to resume from specific phase
- Spawn agents in parallel for independent tasks
- Use `run_in_background: true` for long-running operations

### Memory & Context
- Save cross-session knowledge to `.claude/projects/*/memory/`
- Memory types: user, feedback, project, reference
- Verify memory relevance before using (may be stale)
- Keep responses ≤100 words unless detail required

## 8-Phase SDLC Pipeline

### Phase 1: Requirements
**Skill**: `/sdlc-step-01-requirements`  
**Agent**: `@sdlc-step-01-requirements`  
**Output**: `requirements.md`

- Fetches Jira ticket via epam-jira MCP server
- Extracts FR (Functional Requirements), NFR (Non-Functional Requirements), AC (Acceptance Criteria)
- Uses "shall" language with P0/P1/P2 priorities
- Asks clarifying questions if story is ambiguous

### Phase 2: Architecture
**Skill**: `/sdlc-step-02-architecture`  
**Agent**: `@sdlc-step-02-architecture`  
**Output**: `architecture.md`

- Designs component structure and boundaries
- Documents data flow and interface contracts
- Identifies risks with mitigations
- Records ADR-style decisions

### Phase 3: Design Review
**Skill**: `/sdlc-step-03-design-review`  
**Agent**: `@sdlc-step-03-design-review`  
**Output**: `design-review.md`

- Reviews architecture.md against requirements.md
- Produces verdict: approve/approve_with_concerns/reject
- Lists concerns with severity ratings
- Read-only (never modifies source artifacts)

### Phase 4: Implementation Plan
**Skill**: `/sdlc-step-04-impl-plan`  
**Agent**: `@sdlc-step-04-impl-plan`  
**Output**: `impl-plan.md`

- Creates dependency-ordered task list
- Identifies file paths and modules to create/modify
- Self-contained, actionable tasks
- No orphaned tasks

### Phase 5: Implementation
**Skill**: `/sdlc-step-05-implementation`  
**Agent**: `@sdlc-step-05-implementation`  
**Output**: Python code under `dev/`

- Implements features following impl-plan.md
- Production-ready code with type hints
- Validates inputs at system boundaries
- Error handling for external I/O
- No hardcoded secrets

### Phase 6: Review
**Skill**: `/sdlc-step-06-review`  
**Agent**: `@sdlc-step-06-review`  
**Output**: Review findings report

- Structured self-review before PR
- Findings grouped: Critical/Major/Minor
- Checks: correctness, security, error handling, tests, clarity, DRY
- Line-anchored findings with fix suggestions

### Phase 7: Verification
**Skill**: `/sdlc-step-07-verify`  
**Agent**: `@sdlc-step-07-verify`  
**Output**: Playwright tests under `test-automation/`

- Generates TypeScript tests from acceptance criteria
- Runs tests and captures results
- Triages failures (test issue vs impl issue)
- Self-healing agent for selector fixes
- Produces verification report

### Phase 8: Pull Request
**Skill**: `/sdlc-step-08-pr`  
**Agent**: `@sdlc-step-08-pr`  
**Output**: GitHub PR via MCP

- Creates feature branch
- Generates PR description (Summary/Changes/Test Evidence/Limitations/Checklist)
- Uses GitHub MCP to open PR (after user confirmation)
- Lists all changed files
- Includes reviewer checklist

## MCP Integration

### Configured Servers (`.mcp.json`)
1. **github** - GitHub API (PRs, issues, repos)
2. **epam-jira** - Jira ticket management
3. **epam-confluence** - Confluence documentation

### Environment Variables Required
```bash
export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_..."
export EPAM_JIRA_API_TOKEN="..."
export EPAM_CONFLUENCE_API_TOKEN="..."
```

### MCP Usage Examples
```bash
# GitHub (prefer gh CLI)
gh pr view 123
gh pr create --title "feat: xyz" --body "..."

# Jira (via MCP)
epam-jira/getIssue PROJ-1234

# Confluence (via MCP)
epam-confluence/getPage page-id
```

## Quick Start Commands

### Full Pipeline
```
/sdlc
```

### Individual Phases
```
/sdlc-step-01-requirements
/sdlc-step-02-architecture
/sdlc-step-03-design-review
/sdlc-step-04-impl-plan
/sdlc-step-05-implementation
/sdlc-step-06-review
/sdlc-step-07-verify
/sdlc-step-08-pr
```

### Resume from Phase
```
/sdlc from=architecture
/sdlc from=implementation
/sdlc from=verify
```

### Natural Language
```
"Fetch Jira ticket PROJ-1234 and start SDLC"
"Run all verification tests"
"Review the implementation"
"Create PR for this feature"
```

## Project Structure
```
.
├── .claude/
│   ├── agents/          # 8 SDLC phase agents + qa-self-healing
│   ├── commands/        # Quick-start, workflows, example prompts
│   ├── hooks/           # Hook configuration
│   ├── rules/           # Claude Code best practices, SDLC workflow, MCP rules
│   └── skills/          # 8 SDLC phase skills
├── dev/                 # Python implementation code
├── test-automation/     # Playwright TypeScript tests
├── .mcp.json           # MCP server configuration
├── CLAUDE.md           # This file
├── user-story.md       # Input: feature requirements
├── requirements.md     # Phase 1 output
├── architecture.md     # Phase 2 output
├── design-review.md    # Phase 3 output
└── impl-plan.md        # Phase 4 output
```

## Rules & Guidelines

See `.claude/rules/` for detailed rules:
- `claude-code-best-practices.md` - Core Claude Code patterns
- `sdlc-workflow.md` - 8-phase workflow enforcement
- `mcp-integration.md` - MCP server usage rules

See `.claude/commands/` for available commands (one per file):
- `run-full-pipeline.md` - Execute complete 8-phase SDLC
- `resume-from-phase.md` - Resume from specific phase
- `check-status.md` - Check current progress
- `run-tests.md` - Run verification tests
- `fetch-jira-ticket.md` - Fetch Jira ticket via MCP
- `create-pr.md` - Create GitHub PR

## Getting Help

### In Claude Code
```
/help                    # Claude Code help
What should I do next?   # Context-aware guidance
Show SDLC status         # Current pipeline state
List available commands  # See all SDLC commands
```

### External Resources
- Claude Code: https://claude.ai/code
- GitHub Issues: https://github.com/anthropics/claude-code/issues
- Documentation: https://claude.ai/docs

## Key Principles

1. **Phase Discipline**: Never skip phases or mix phase concerns
2. **Tool Hygiene**: Use dedicated tools (Read/Edit/Grep/Glob), not Bash equivalents
3. **Agent Specialization**: Each agent has clear boundaries and responsibilities
4. **MCP First**: Prefer MCP servers over manual data entry
5. **Security by Default**: Never commit secrets, always use env vars
6. **Test Everything**: Every feature needs verification tests
7. **Review Before PR**: Always run phase 6 review before opening PR
8. **Clear Communication**: Brief updates at key moments, concise summaries
