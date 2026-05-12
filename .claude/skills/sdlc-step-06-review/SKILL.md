---
name: sdlc-step-06-review
description: "Checklist-based review of implementation (correctness, security, error handling, tests, clarity, DRY, dependency safety)."
argument-hint: "Optional: focus areas or files"
---

# SDLC Step 06 — Review

## Prime directive

> **Be critical, precise, and constructive.**

Produce actionable review feedback anchored to specific locations (`path:line`).

## Inputs
- Current repo state
- `requirements.md` (source of truth)
- `impl-plan.md` (what was intended)

## Output
- Review notes and safe in-scope fixes.

## Scope boundaries (hard)
- Python dev code only under `dev/`.
- Playwright + TypeScript verification only under `test-automation/`.

## Before you start
1. Identify what changed (or what should be reviewed) and read the relevant files fully.
2. Locate existing tests to understand tested vs untested surface area.
3. Note each file’s role (CLI, library module, doc, Playwright test) to calibrate expectations.

## Procedure
### Review checklist (apply to this repo)

#### 1) Correctness & requirements traceability
- Every implemented behavior maps to `FR-*` / `AC-*`.
- No extra features outside `requirements.md` / `impl-plan.md`.
- Edge cases and failure modes handled (missing files, invalid inputs, empty content).

#### 2) Security & secrets safety
- No hardcoded credentials, tokens, API keys, or `.env` contents.
- Inputs validated before use.
- Logs/errors do not leak secrets or sensitive data.

#### 3) Error handling
- No silent exception swallowing.
- Errors actionable; consistent exit codes for CLI.

#### 4) Code quality (Python)
- Type hints on public functions.
- Small, single-responsibility functions; low nesting.
- Prefer `pathlib.Path` for filesystem operations.
- Avoid duplicated logic.

#### 5) Code quality (Playwright + TypeScript)
- Deterministic tests (no arbitrary sleeps).
- Repo-relative paths.
- Specific assertions.

#### 6) Dependencies & repo hygiene
- No new dependencies without justification.
- Python deps in `dev/`; Node deps in `test-automation/`.

#### 7) Documentation & operability
- Commands to run are documented.
- SDLC docs remain consistent across phases.

## Findings format (required)
Group findings into **Critical**, **Major**, **Minor/Suggestions**.

Each finding must include:
- `path:line` anchor
- Issue summary
- Impact/risk
- Concrete fix suggestion

Always include at least one positive note.

## Fix policy
- Prefer read-only review output first.
- You MAY apply fixes only when they are:
	- clearly correct,
	- minimal and in-scope,
	- low risk.
- Never introduce new features during review.

## Output template
```
## Review — <scope>

### Summary
<one-paragraph overall assessment>

### Critical (must fix before merge)
- path:line — <issue>. Fix: <specific suggestion>

### Major (should fix before merge)
- path:line — <issue>. Fix: <specific suggestion>

### Minor / Suggestions
- path:line — <issue>. Suggestion: <improvement>

### Positives
- <at least one concrete positive>

### Stats
Critical: N | Major: N | Minor: N
```

## Escalation
If you find a **Critical security issue** (secrets, injection risk, auth bypass patterns), call it out as Critical and recommend a dedicated security review; code review does not replace a security scan.
