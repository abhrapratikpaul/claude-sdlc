---
name: sdlc-workflow
description: Enforces 8-phase SDLC workflow rules for the capstone project
priority: high
paths: [
  "**/*.md",
  "**/*.py",
  "**/*.ts",
  "**/*.json"
]
---

# SDLC Workflow Rules

## Phase Sequence (Mandatory)
Execute phases in strict order:
1. **Requirements** → `requirements.md`
2. **Architecture** → `architecture.md`
3. **Design Review** → `design-review.md`
4. **Implementation Plan** → `impl-plan.md`
5. **Implementation** → `dev/**/*.py`
6. **Review** → self-review findings
7. **Verify** → `test-automation/**/*.spec.ts`
8. **PR** → GitHub PR with checklist

## File Location Constraints
- **Python code**: ONLY in `dev/` (never in root or test-automation/)
- **TypeScript tests**: ONLY in `test-automation/` (never in dev/)
- **Documentation**: Root level (user-story.md, requirements.md, etc.)
- **No mixing**: Never add Python tooling to test-automation/ or TS config to dev/

## Documentation Consistency
- `user-story.md` is the source of truth (immutable input)
- `requirements.md` derives from `user-story.md`
- `architecture.md` derives from `requirements.md`
- `design-review.md` reviews `architecture.md`
- `impl-plan.md` synthesizes requirements + architecture + design-review
- Keep all docs mutually consistent
- Prefer small, auditable diffs when updating

## Phase Transition Rules
- NEVER skip phases
- NEVER implement code before completing impl-plan.md
- NEVER create PR before passing verification
- NEVER proceed to next phase with failing tests
- Each phase MUST update its corresponding document

## Agent Invocation
- Use `/sdlc` skill or `@sdlc` agent for full pipeline
- Use `@sdlc-step-XX-<phase>` for individual phases
- Use `@sdlc from=<phase>` to resume from specific phase
- Agents must read previous phase outputs before starting

## Git Workflow
- Keep commits scoped to current SDLC phase
- Commit message format: `phase: brief description`
- Example: `requirements: add FR-003 for Confluence sync`
- Never mix changes from multiple phases in one commit

## Quality Gates
Each phase has exit criteria:

### Requirements Gate
- All FR/NFR have stable IDs
- All requirements use "shall" language
- Each requirement has 1+ acceptance criteria
- Priorities assigned (P0/P1/P2)
- No vague/ambiguous statements

### Architecture Gate
- Components identified with clear boundaries
- Data flow documented (diagrams or clear prose)
- Interface contracts defined
- Risks identified with mitigations
- ADR-style decisions recorded

### Design Review Gate
- Verdict rendered (approve/approve_with_concerns/reject)
- All concerns documented with severity
- Risk assessment complete
- Recommendation given with rationale

### Implementation Plan Gate
- Tasks in dependency order
- Each task has clear deliverable
- File paths/modules identified
- No orphaned tasks (all have owners or are pooled)

### Implementation Gate
- Code matches plan
- Type hints on all functions
- Validation at system boundaries
- Error handling for external I/O
- No hardcoded secrets

### Review Gate
- All critical findings resolved
- Major findings have mitigation plan
- Code follows Python dev guidelines
- Tests cover key scenarios

### Verification Gate
- Playwright tests pass
- Acceptance criteria verified
- Test report generated
- Failures triaged (test issue vs impl issue)

### PR Gate
- Branch created
- PR description complete (Summary/Changes/Test Evidence/Limitations/Checklist)
- All files committed
- User approval obtained before push/PR creation

## Forbidden Actions
- Never output or commit secrets
- Never fabricate file paths, endpoints, or data not in requirements
- Never propose breaking changes without explicit approval
- Never auto-merge or auto-approve PRs
- Never delete files without user confirmation
- Never skip verification phase "because tests should pass"

## Error Recovery
- If phase fails: stop, report findings, ask for user decision
- If requirements unclear: ask clarifying questions (don't guess)
- If implementation blocked: update impl-plan.md with blocker details
- If tests fail: triage (test issue vs impl issue) and file findings
