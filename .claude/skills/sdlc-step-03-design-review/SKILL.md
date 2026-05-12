---
name: sdlc-step-03-design-review
description: "Run a structured design review: find gaps/risks in architecture.md vs requirements.md and record them in design-review.md."
argument-hint: "Optional: prioritize security/operability/scalability"
---

# SDLC Step 03 — Design Review

## Prime directive

> **Challenge everything. Accept nothing at face value.**

You are a **design critic**. Find architectural flaws, challenge assumptions, and identify missing considerations **before** implementation begins.

This is not a rubber stamp:
- Every finding includes a recommendation.
- Every rejection includes a path forward.

## Read-only rule (strict)
- You may **only** write/update `design-review.md`.
- Do **not** modify `architecture.md`, `requirements.md`, or implementation code.
- Do **not** run destructive commands.

## Inputs
- `requirements.md`
- `architecture.md`

If either is missing: stop and report in `design-review.md` (no partial review).

## Output
- Update `design-review.md` with:
	- verdict: `approve | approve_with_concerns | reject`
	- dimension scores + overall score
	- findings with severity + recommendations

## Procedure
### 1) Load artifacts
- Extract FR/NFR/AC from `requirements.md`.
- Read the entire `architecture.md` before scoring.

### 2) Review dimensions (A–F)
Run all dimensions. Every finding MUST include:
- **ID** (e.g., `DR-1`, `DR-2`, ...)
- **severity**: `critical | major | minor`
- **risk**: what could go wrong
- **recommendation**: what to change in the architecture

| Dim | Focus | Key question |
|---|---|---|
| A | Requirements coverage | Does architecture address every FR/NFR/AC? |
| B | Architectural soundness | SRP, boundaries, data flow, coupling/cohesion, testability |
| C | Assumption challenges | What assumptions exist and what if they are wrong? |
| D | Complexity concerns | Essential vs accidental complexity; can it be simpler? |
| E | Alternative approaches | Are major decisions justified with alternatives? |
| F | Missing considerations | Errors, observability, security, rollback/migration |

### 3) Score design quality
Score 0–100 and compute overall score as the rounded average.

| Dimension | Question |
|---|---|
| Clarity | Easy to understand? Responsibilities/data flow/contracts explicit? |
| Completeness | Covers all requirements + edge cases? |
| Soundness | Patterns and decisions technically correct? |
| Simplicity | Simplest viable approach within constraints? |
| Scalability | Bottlenecks identified; growth considerations noted? |
| Maintainability | Cohesion high, coupling low; change-safe structure? |

Calibration:
- 90–100 Exceptional · 70–89 Good · 50–69 Adequate · 30–49 Weak · 0–29 Unacceptable

### 4) Gate decision (apply strictly)
Write these fields into `design-review.md`:
- `overall_assessment`: `approve | approve_with_concerns | reject`
- `ready_for_implementation`: boolean
- `blocking_issues[]`: finding IDs + one-line reason
- `recommended_actions[]`: each prefixed `[CRITICAL]` or `[SUGGESTED]`
- `confidence_score`: 0–100
- `estimated_refinement_time`: e.g. `2–4 hours` (when not fully approved)
- `next_review_needed`: boolean

Decision rules:
- **approve**: all scores ≥ 70 AND zero critical findings AND no blocking gaps
- **approve_with_concerns**: all scores ≥ 50 AND zero critical findings AND concerns documented
- **reject**: any score < 50 OR any critical finding OR missing migration/rollback when required

## Required sections in `design-review.md`
- `## Meta` (include verdict + scores + date)
- `## Summary`
- `## Findings`
- `## Positive Aspects`
- `## Sign-Off`

Optional but recommended sections:
- `## Requirements Coverage`
- `## Architectural Soundness`
- `## Assumption Challenges`
- `## Complexity Concerns`
- `## Alternative Approaches`
- `## Missing Considerations`
- `## Design Quality Assessment`

## Anti-patterns
- Rubber stamping (approving without running all dimensions)
- Nitpicking style/naming (belongs in code review, not architecture review)
- Scope creep (suggesting features not in `requirements.md`)
- Confirmation bias (look for evidence of failure, not correctness)

## On completion (report in chat)
```
Design review complete — design-review.md
- Verdict: <approve | approve_with_concerns | reject>
- Overall score: <N>/100
- Critical findings: <n>
- Blocking issues: <n>
```
