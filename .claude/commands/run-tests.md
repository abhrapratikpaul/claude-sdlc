---
name: run-tests
description: Run verification tests for any application type
usage: "Run tests" or "Run verification tests"
---

# Run Verification Tests

Execute verification tests to verify acceptance criteria. The test framework is determined by `architecture.md`.

## Usage

Natural language:
```
Run all tests
Run verification tests
Test the implementation
Execute test suite
```

Skill invocation:
```
/sdlc-step-07-verify
```

## What It Does

1. Reads `architecture.md` to determine the test framework and test folder
2. Checks if tests exist in the declared test folder
3. If no tests: generates tests from acceptance criteria using the declared framework
4. Runs all tests using the framework-specific command
5. Produces test report with results
6. Triages failures (test issue vs implementation issue)

## Test Generation

If tests don't exist, Claude will:
- Read `requirements.md` for acceptance criteria
- Read `architecture.md` for framework and test folder
- Generate test specs in the declared test folder
- Configure the test runner if needed

## Test Execution

The run command is derived from `architecture.md`. Examples by framework:

| Framework | Command |
|-----------|---------|
| Playwright (TS) | `cd <test-folder> && npx playwright test` |
| pytest | `cd <test-folder> && pytest` |
| Jest | `cd <test-folder> && npx jest` |
| Vitest | `cd <test-folder> && npx vitest run` |

## Failure Handling

If tests fail:
1. **Test Issue** (bad selector, timing issue, bad assertion)
   - For Playwright: use self-healing agent to fix selector issues
   - Command: `"Run self-healing agent on failing test"`

2. **Implementation Issue** (bug in source code)
   - Fix implementation in the declared source folder
   - Re-run tests

## Test Report

Shows:
- Passed tests
- Failed tests
- Skipped tests
- Error messages and stack traces
- Screenshots (if configured for UI tests)

## Self-Healing (Playwright only)

If the project uses Playwright and selectors are failing:
```
Run self-healing agent for Playwright
Fix failing test selectors
Debug selector issues
```

This automatically:
1. Detects failing selectors
2. Uses Playwright CLI first to discover resilient locators (falls back to Playwright MCP if needed)
3. Updates POM classes
4. Re-runs tests

> Note: Self-healing agent only applies when Playwright is the declared test framework in `architecture.md`.
