---
name: sdlc-step-02-architecture
description: "Propose a high-level component architecture and data flow based on requirements.md. Use when updating architecture.md."
argument-hint: "Optional: hosting/runtime constraints"
---

# SDLC Step 02 — Architecture

## Prime directive

> **Design everything. Code nothing.**

Turn `requirements.md` into a clear, implementable `architecture.md` that tells an implementer:
- what to build,
- where it belongs (repo boundaries), and
- why key choices were made.

Produce **zero implementation code**.

## Inputs
- `requirements.md` (required)
- Existing repo structure (required)
- `design-review.md` (optional, for refinement feedback later)

## Output
- Update `architecture.md` (components, responsibilities, data flow, risks, Mermaid diagram).

## Iron laws
- NEVER write production code or pseudo-code implementations in `architecture.md`.
	- Describing interfaces/contracts is OK (inputs/outputs, error shapes, CLI args), but not algorithmic code.
- NEVER propose adding a dependency without an ADR-style entry including:
	- rationale
	- at least **2 alternatives**
	- consequences
- NEVER leave boundaries vague:
	- call out what belongs in the **source folder** vs the **test folder** (names derived from the chosen tech stack and project type — e.g. `src/`, `app/`, `backend/` for source; `tests/`, `spec/`, `test-automation/` for tests)
- NEVER ignore backward compatibility:
	- if changing an interface/doc structure, describe blast radius and migration path

## Required sections in `architecture.md`
Ensure `architecture.md` contains (at minimum):
- **Goals** (mapped to NFRs)
- **Proposed solution**
	- Components (responsibilities + boundaries)
	- Data flow
	- Tech choices: **language, framework, runtime** chosen for this application type, with rationale (ADR-style)
	- **Folder layout**: explicit source folder name and test folder name (used by all downstream phases)
- **Contracts**
	- CLI/API contract (if any)
	- File inputs/outputs (paths, formats)
	- Error handling strategy
- **Decisions (ADRs)**
	- ADR-001, ADR-002, ...
	- Each ADR includes: context, decision, alternatives (≥2), consequences
- **Testing strategy**
	- unit/integration targets (language-native test runner)
	- verification targets and acceptance criteria checks (framework selected in this doc)
- **Security considerations**
	- external input validation, secrets handling, and least-privilege assumptions
- **Risks** and **Open questions**

## Procedure
### Process (8 phases)
1. **Load requirements**: extract scope, constraints, and acceptance criteria.
2. **Repo scan**: identify existing docs, folders (`dev/`, `test-automation/`), and where changes would land.
3. **Component model**: list components with one responsibility each.
4. **Data flow**: define end-to-end flows that satisfy the acceptance criteria.
5. **Contracts**: define interfaces between components (CLI contract, file formats, inputs/outputs, error handling).
6. **Decisions (ADR-style)**: for each non-trivial decision, document alternatives and why you chose one.
7. **Quality attributes**: address NFRs explicitly (security, reliability, usability, maintainability).
8. **Risks & mitigations**: top risks, mitigations, and open questions.

## Quality gates (before you finish)
- Every major FR/NFR has a clear architectural element that satisfies it.
- Every component has one responsibility and a defined interface.
- No implementation code exists in `architecture.md`.
- Any new dependency has an ADR-style entry with ≥2 alternatives.
- Backward compatibility and migration notes exist if applicable.

## Completion report (in chat)
After updating `architecture.md`, summarize:
- Components: <N>
- ADRs: <N>
- New dependencies proposed: <N>
- Top risks: <N>
- Open questions: <N>
