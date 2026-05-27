---
name: sdlc-step-07-verify
description: "Generate and run verification tests for any application type based on acceptance criteria. Framework is derived from architecture.md."
argument-hint: "What to verify (UI flows, API endpoints, CLI commands, etc.)"
---

# SDLC Step 07 — Verify

## Prime directive
Verify **acceptance criteria** (AC-*) — not implementation details.

## Inputs
- `architecture.md` (determines test framework, test folder, application type)
- `requirements.md` (AC-* are the source of truth)
- `impl-plan.md` (what should exist and how to verify)
- Repo state (source + test code)

## Framework selection (mandatory first step)
Read `architecture.md` and determine the verification approach:

| Application type | Preferred framework |
|---|---|
| Web UI (browser-based) | Playwright TypeScript (`playwright-cli` skill) |
| REST API / backend service | API-level tests (pytest+requests, Jest+supertest, RestAssured, etc.) |
| CLI tool / Python library | pytest or language-native runner |
| Data pipeline | pytest with fixture data |
| Mobile | Note limitation; ask user for tooling |

When `architecture.md` explicitly names a test framework, use that; the table is a default only.

## Output
- Test files in the **test folder declared in `architecture.md`**.

## Constraints (hard)
- Test automation code must stay in the test folder from `architecture.md`.
- Prefer deterministic checks (no arbitrary sleeps; stable assertions; repo-relative paths).
- Do not change production/source code during verification; report implementation issues instead.

## Tooling preference (UI / locator work)
When verification requires UI inspection (e.g., selector/locator healing):
1. **Playwright CLI skill (`playwright-cli`)** — first try.
2. **Playwright MCP / browser tools** — fallback only if CLI is unavailable or can't produce a stable locator.

## Reference playbooks (kept inside this skill)
- Generate patterns: [qa-generate-patterns.md](./references/qa-generate-patterns.md)
- Verify + triage patterns: [qa-verify-triage.md](./references/qa-verify-triage.md)
- Selector-only self-healing: [qa-self-heal-selectors.md](./references/qa-self-heal-selectors.md)

## Procedure
1. **Detect framework** — read `architecture.md`; select test approach from table above.
2. Map targeted `AC-*` items to verification checks.
3. Implement deterministic tests in the declared test folder.
4. Run the smallest scope first (single spec/test), then full suite.
5. Triage failures as **test issue** vs **implementation issue**:
   - Fix test issues in the test folder.
   - Report implementation issues with `AC-*` + expected vs actual.
6. If selector/locator failures exist (UI only), apply selector-only healing; prefer Playwright CLI first.
7. Rerun once after test fixes.
8. Report status and coverage summary.

## Output report (in chat)
```
Verification complete — <test folder>
- Framework: <framework used>
- Status: passed | passed_with_warnings | failed
- AC covered: <list of AC-*>
- Failures: <N> (test issues <n>, impl issues <m>)
- Rerun: <performed/not performed>
- Next actions: <what dev should fix if impl issues exist>
```
