# QA Patterns — Verify + Triage

This reference captures the *useful patterns* from prior QA verification agents, adapted to this repo.

## Prime directive
Run the tests, trust the results, and triage failures correctly.

## Triage categories
- **Test issue** (fix under `test-automation/`):
  - wrong paths to repo-root docs
  - flaky timing / non-determinism
  - incorrect assumptions about environment
  - selector/locator breakages (UI)
- **Implementation issue** (report; do not fix in Step 07):
  - behavior contradicts `requirements.md` / `AC-*`
  - missing output/doc section required by plan
  - CLI exit codes or messages are wrong

## One-iteration policy
- Fix *test issues* first.
- Rerun once (smallest scope).
- If failures are implementation issues, stop and report actionable details.

## What to report for impl issues
- Failing `AC-*`
- Expected vs actual
- Minimal reproduction command (if available)
- Relevant file(s) and location(s)
