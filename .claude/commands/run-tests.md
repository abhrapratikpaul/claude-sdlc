---
name: run-tests
description: Run Playwright verification tests
usage: "Run tests" or "Run verification tests"
---

# Run Verification Tests

Execute Playwright tests to verify acceptance criteria.

## Usage

Natural language:
```
Run all tests
Run verification tests
Run Playwright tests
Test the implementation
Execute test suite
```

Skill invocation:
```
/sdlc-step-07-verify
```

## What It Does

1. Checks if tests exist in test-automation/
2. If no tests: generates Playwright tests from acceptance criteria
3. Runs all tests with Playwright
4. Produces test report with results
5. Triages failures (test issue vs implementation issue)

## Test Generation

If tests don't exist, Claude will:
- Read requirements.md for acceptance criteria
- Generate TypeScript test specs under test-automation/tests/
- Create Page Object Model (POM) classes if needed
- Configure Playwright test runner

## Test Execution

Runs tests with:
```bash
cd test-automation
npx playwright test
```

## Failure Handling

If tests fail:
1. **Test Issue** (bad selector, timing issue)
   - Use self-healing agent to fix
   - Command: `"Run self-healing agent on failing test"`

2. **Implementation Issue** (bug in code)
   - Fix implementation in dev/
   - Re-run tests

## Test Report

Shows:
- ✅ Passed tests
- ❌ Failed tests
- ⏭️ Skipped tests
- Error messages and stack traces
- Screenshots (if configured)

## Self-Healing Tests

If selectors are failing:
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
