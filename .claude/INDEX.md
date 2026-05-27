# Claude Code Configuration Index

## 📚 Quick Navigation

### Getting Started
- **[../CLAUDE.md](../CLAUDE.md)** - Complete workspace instructions
- **[../README.md](../README.md)** - Project overview and usage guide
- **[commands/run-full-pipeline.md](commands/run-full-pipeline.md)** - Run complete SDLC pipeline

### For Users
- **[commands/run-full-pipeline.md](commands/run-full-pipeline.md)** - Run complete SDLC
- **[commands/check-status.md](commands/check-status.md)** - Check progress
- **[commands/run-tests.md](commands/run-tests.md)** - Run verification tests

### For Developers
- **[rules/](rules/)** - Enforcement rules
- **[instructions/](instructions/)** - Code guidelines

## 🤖 Agents (10)

Located in `agents/`

### SDLC Orchestrator
- **[sdlc.agent.md](agents/sdlc.agent.md)** - Runs full 8-phase pipeline

### SDLC Phase Agents (8)
1. **[sdlc-step-01-requirements.agent.md](agents/sdlc-step-01-requirements.agent.md)** - Requirements extraction
2. **[sdlc-step-02-architecture.agent.md](agents/sdlc-step-02-architecture.agent.md)** - System design
3. **[sdlc-step-03-design-review.agent.md](agents/sdlc-step-03-design-review.agent.md)** - Critical review
4. **[sdlc-step-04-impl-plan.agent.md](agents/sdlc-step-04-impl-plan.agent.md)** - Implementation planning
5. **[sdlc-step-05-implementation.agent.md](agents/sdlc-step-05-implementation.agent.md)** - Code writing
6. **[sdlc-step-06-review.agent.md](agents/sdlc-step-06-review.agent.md)** - Code review
7. **[sdlc-step-07-verify.agent.md](agents/sdlc-step-07-verify.agent.md)** - Test generation/execution
8. **[sdlc-step-08-pr.agent.md](agents/sdlc-step-08-pr.agent.md)** - PR creation

### Specialized Agents
- **[sdlc-qa-self-healing.agent.md](agents/sdlc-qa-self-healing.agent.md)** - Auto-fix Playwright selectors

## 🎯 Skills (8)

Located in `skills/`

Each skill has a `SKILL.md` file:
1. **[sdlc-step-01-requirements/](skills/sdlc-step-01-requirements/)** - `/sdlc-step-01-requirements`
2. **[sdlc-step-02-architecture/](skills/sdlc-step-02-architecture/)** - `/sdlc-step-02-architecture`
3. **[sdlc-step-03-design-review/](skills/sdlc-step-03-design-review/)** - `/sdlc-step-03-design-review`
4. **[sdlc-step-04-impl-plan/](skills/sdlc-step-04-impl-plan/)** - `/sdlc-step-04-impl-plan`
5. **[sdlc-step-05-implementation/](skills/sdlc-step-05-implementation/)** - `/sdlc-step-05-implementation`
6. **[sdlc-step-06-review/](skills/sdlc-step-06-review/)** - `/sdlc-step-06-review`
7. **[sdlc-step-07-verify/](skills/sdlc-step-07-verify/)** - `/sdlc-step-07-verify`
8. **[sdlc-step-08-pr/](skills/sdlc-step-08-pr/)** - `/sdlc-step-08-pr`

## 📜 Rules (3)

Located in `rules/`

1. **[claude-code-best-practices.md](rules/claude-code-best-practices.md)**
   - Tool selection (Read/Edit/Grep/Glob vs bash)
   - Bash command safety
   - Agent usage patterns
   - Context management
   - Security & code quality

2. **[sdlc-workflow.md](rules/sdlc-workflow.md)**
   - 8-phase sequence enforcement
   - File location constraints
   - Documentation consistency
   - Quality gates per phase
   - Git workflow standards
   - Forbidden actions

3. **[mcp-integration.md](rules/mcp-integration.md)**
   - MCP server usage (GitHub, Jira, Confluence)
   - Authentication patterns
   - Tool selection priority
   - Error handling
   - Fallback strategies

## 💻 Commands (6)

Located in `commands/` - one command per file

1. **[run-full-pipeline.md](commands/run-full-pipeline.md)**
   - Execute complete 8-phase SDLC pipeline
   - Usage: `/sdlc` or "Run full SDLC pipeline"

2. **[resume-from-phase.md](commands/resume-from-phase.md)**
   - Resume SDLC from specific phase
   - Usage: `/sdlc from=<phase>` or "Resume from architecture"

3. **[check-status.md](commands/check-status.md)**
   - Check current SDLC phase and progress
   - Usage: "What's the status?" or "Check SDLC progress"

4. **[run-tests.md](commands/run-tests.md)**
   - Run verification tests (framework from architecture.md)
   - Usage: `/sdlc-step-07-verify` or "Run tests"

5. **[fetch-jira-ticket.md](commands/fetch-jira-ticket.md)**
   - Fetch EPAM Jira ticket via MCP
   - Usage: "Fetch Jira ticket PROJ-1234"

6. **[create-pr.md](commands/create-pr.md)**
   - Create GitHub PR with description
   - Usage: `/sdlc-step-08-pr` or "Create PR"

## 🔧 Hooks

Hook is wired via `.claude/settings.json` (project-level) using a `PreToolUse` handler.

- **[settings.json](../settings.json)** — registers the PreToolUse hook
- **[hooks/hooks.json](hooks/hooks.json)** — legacy hook config (reference only; not auto-loaded)
- **[../scripts/hooks/pretooluse.ps1](../scripts/hooks/pretooluse.ps1)** — scans tool inputs for hardcoded secrets

## 🔌 MCP Configuration

Located at project root: `../.mcp.json`

Configured servers:
- **github** - GitHub API (PRs, issues, repos)
- **epam-jira** - EPAM Jira ticket management
- **epam-confluence** - EPAM Confluence documentation

## 📖 Documentation Hierarchy

```
📁 Project Root
├── 📄 CLAUDE.md                    # Workspace instructions (START HERE)
├── 📄 README.md                    # Project overview
├── 📄 .mcp.json                    # MCP server config
├── 📄 user-story.md                # Phase 1 input (from Jira)
├── 📄 requirements.md              # Phase 1 output
├── 📄 architecture.md              # Phase 2 output (declares tech stack + folders)
├── 📄 design-review.md             # Phase 3 output
├── 📄 impl-plan.md                 # Phase 4 output
│
├── 📁 .claude/
│   ├── 📄 INDEX.md                 # This file
│   ├── 📄 settings.json            # Hook registration (PreToolUse)
│   │
│   ├── 📁 agents/                  # 10 specialized agents
│   │   ├── sdlc.agent.md
│   │   ├── sdlc-step-01-requirements.agent.md
│   │   ├── ... (8 phase agents)
│   │   └── sdlc-qa-self-healing.agent.md
│   │
│   ├── 📁 commands/                # Usage guides
│   │   ├── run-full-pipeline.md
│   │   ├── resume-from-phase.md
│   │   ├── check-status.md
│   │   ├── run-tests.md
│   │   ├── fetch-jira-ticket.md
│   │   └── create-pr.md
│   │
│   ├── 📁 rules/                   # Enforcement rules
│   │   ├── claude-code-best-practices.md
│   │   ├── sdlc-workflow.md
│   │   └── mcp-integration.md
│   │
│   ├── 📁 skills/                  # 8 reusable skills
│   │   ├── sdlc-step-01-requirements/SKILL.md
│   │   ├── ... (8 phase skills)
│   │   └── sdlc-step-08-pr/SKILL.md
│   │
│   └── 📁 hooks/                   # Legacy hook config (reference only)
│       └── hooks.json
│
├── 📁 scripts/hooks/               # Hook scripts
│   └── pretooluse.ps1              # Scans for hardcoded secrets
│
└── 📁 <source-folder>/             # Implementation code (name from architecture.md)
└── 📁 <test-folder>/               # Verification tests (name from architecture.md)
```

## 🎯 Common Tasks

### Start New Feature
```
/sdlc
```

### Run Individual Phase
```
/sdlc-step-01-requirements
/sdlc-step-05-implementation
/sdlc-step-07-verify
```

### Resume from Phase
```
/sdlc from=architecture
/sdlc from=verify
```

### Natural Language
```
"Fetch Jira ticket PROJ-1234 and start SDLC"
"Run all verification tests"
"Review the implementation"
"Create PR for this feature"
```

### Check Status
```
"What phase am I in?"
"Show SDLC status"
"List remaining tasks"
```

### Troubleshoot
```
"Check MCP server status"
"Debug failing test"
"Why is the test failing?"
```

## 📚 Learning Path

### 1. First Time Users
1. Read **[../README.md](../README.md)** - Project overview
2. Read **[commands/run-full-pipeline.md](commands/run-full-pipeline.md)** - Getting started
3. Try `/sdlc` - Run full pipeline
4. Browse **[commands/](commands/)** - See available commands

### 2. Regular Users
1. Use **[commands/resume-from-phase.md](commands/resume-from-phase.md)** - Resume work
2. Use **[commands/check-status.md](commands/check-status.md)** - Track progress
3. Understand **[rules/sdlc-workflow.md](rules/sdlc-workflow.md)** - Phase rules

### 3. Power Users
1. Study **[agents/](agents/)** - Agent definitions
2. Study **[rules/claude-code-best-practices.md](rules/claude-code-best-practices.md)** - Best practices
3. Study **[skills/](skills/)** - Skill implementations
4. Customize agents/rules for your needs

## 🔗 External Resources

- **Claude Code**: https://claude.ai/code
- **MCP Specification**: https://modelcontextprotocol.io
- **GitHub Issues**: https://github.com/anthropics/claude-code/issues
- **EPAM Jira**: https://jiraeu.epam.com
- **EPAM Confluence**: https://kb.epam.com

## 🎉 Quick Reference

| I want to... | Command/File |
|--------------|--------------|
| Start new feature | `/sdlc` |
| Get requirements | `/sdlc-step-01-requirements` |
| Design architecture | `/sdlc-step-02-architecture` |
| Review design | `/sdlc-step-03-design-review` |
| Create plan | `/sdlc-step-04-impl-plan` |
| Write code | `/sdlc-step-05-implementation` |
| Review code | `/sdlc-step-06-review` |
| Run tests | `/sdlc-step-07-verify` |
| Create PR | `/sdlc-step-08-pr` |
| Learn commands | [commands/](commands/) |
| Check status | "What's the status?" |
| Understand rules | [rules/](rules/) |
| Understand project | [../README.md](../README.md) |

---

**Last Updated**: 2026-05-27  
**Version**: 1.1  
**Status**: Production Ready
