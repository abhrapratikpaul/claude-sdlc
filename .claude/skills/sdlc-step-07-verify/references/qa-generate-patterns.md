# QA Patterns — Generate (AC-driven)

This reference captures the *useful patterns* from prior QA generation agents, adapted to this repo.

## Prime directive
Generate verification that checks **acceptance criteria** and business rules — not implementation details.

## Coverage order
1. Preconditions / environment
2. Happy path (positive)
3. Negative: input validation
4. Edge cases
5. Access control (if applicable)
6. Error handling and recovery

## Tagging / traceability
- Every test case should cite one or more `AC-*` IDs in its title or comments.
- Prefer one test per AC for clarity; combine only when tightly coupled.

## Determinism rules
- No time-based sleeps.
- Prefer stable selectors and file-based assertions.
- Avoid dependence on external network unless required.

## Output checklist
- Each targeted `AC-*` has at least one deterministic verification method.
- Docs quality gates exist (headings/required sections/non-empty).
