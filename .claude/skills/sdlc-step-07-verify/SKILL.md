---
name: sdlc-step-07-verify
description: "Generate and run verification using Playwright + TypeScript under test-automation/. Includes doc content quality checks."
argument-hint: "What to verify (docs only, CLI flows, etc.)"
---

# SDLC Step 07 — Verify

## Prime directive
Verify **acceptance criteria** (AC-*) and doc quality — not implementation details.

## Inputs
- `requirements.md` (AC-* are the source of truth)
- `impl-plan.md` (what should exist and how to verify)
- Repo state (docs + `dev/` implementation)

## Output
- Playwright TypeScript tests under `test-automation/`.

## Constraints (hard)
- Test automation code must stay in `test-automation/`.
- Prefer deterministic checks (no arbitrary sleeps; stable assertions; repo-relative paths).
- Do not change production code under `dev/` during verification; report implementation issues instead.

## Tooling preference (UI / locator work)
When verification requires UI inspection (e.g., selector/locator healing), follow this strict order:
1. **Playwright CLI skill (`playwright-cli`)** — first try. Use it to open the app, snapshot, and generate resilient locators.
2. **Playwright MCP / browser tools** — fallback only if Playwright CLI is unavailable, cannot attach/open, or cannot produce a stable unique locator.

## Reference playbooks (kept inside this skill)
- Generate patterns: [qa-generate-patterns.md](./references/qa-generate-patterns.md)
- Verify + triage patterns: [qa-verify-triage.md](./references/qa-verify-triage.md)
- Selector-only self-healing: [qa-self-heal-selectors.md](./references/qa-self-heal-selectors.md)

## Procedure
1. Map targeted `AC-*` items to verification checks.
2. Implement deterministic Playwright+TS tests under `test-automation/`:
	- doc quality gates (headings/required sections/non-empty)
	- CLI/system checks when stable and feasible
3. Run the smallest scope first (single spec), then full suite.
4. Triage failures as **test issue** vs **implementation issue**:
	- Fix test issues under `test-automation/`.
	- Report implementation issues with `AC-*` + expected vs actual.
5. If selector/locator failures exist, apply selector-only healing (strict) and prefer Playwright CLI first.
6. Rerun once after test fixes.
7. Report status and coverage summary.

## Output report (in chat)
```
Verification complete — test-automation/
- Status: passed | passed_with_warnings | failed
- AC covered: <list of AC-*>
- Failures: <N> (test issues <n>, impl issues <m>)
- Rerun: <performed/not performed>
- Next actions: <what dev should fix if impl issues exist>
```
