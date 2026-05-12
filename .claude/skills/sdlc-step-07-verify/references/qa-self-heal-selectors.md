# QA Patterns — Self-heal (Selectors Only)

This reference captures the *useful selector healing* approach from prior self-healing agents, adapted to Playwright.

## Prime directive
Heal selectors, not behavior

## Required Input

Check the failure logs for error due to "locator" or "selector" issues.

1. The failure snippet (console log / CI log) that includes:
   - failing test or scenario name
   - the broken selector or locator call (if present)
   - stack trace lines (preferred)
2. Some common locator specific exceptions example in Playwright are:
 - Timeout 30000ms exceeded while waiting for selector
 - Error: strict mode violation: locator("button") resolved to 2 elements
 - Error: Element is not attached to the DOM
 - Error: Target page, context or browser has been closed

If the log does not include the URL/page, ask the user for:
- the page/screen name and URL path to open
- any minimal preconditions (e.g., "user is logged in")

Never request or echo secrets. If login is required, ask the user to run the tests with a pre-authenticated state (storageState) or provide a non-sensitive test account flow.

## Workflow

### Step 1 — Gate on Issue Type

1. Scan the provided text for the exact issue type:
2. If not present:
   - STOP and ask the user whether this is a selector-healing task.
   - Do not attempt self-healing.

### Step 2 — Extract Context From the Error Log

From the failure snippet, extract (best effort, in this order):

- failing scenario/test name
- failing step text (if Cucumber)
- broken locator text (e.g., `page.locator('...')`, `getByRole(...)`)
- page object identifier:
  - a **file path** (best)
  - or a **class/module name + method** from stack trace
- any line number / frame pointing to the locator definition

### Step 3 — Identify the POM Class File Path

**Goal:** Find the *exact* Page Object Model class/module that owns the failing locator.

Use the following strict discovery order:

1. **Direct file path in the stack trace**
   - Examples:
     - `.../pages/LoginPage.ts:42:13`
     - `.../pageObjects/LoginPage.js:42`
     - `.../LoginPage.java:42`
   - If present, treat that as the POM file path.

2. **Class/module name from stack trace** (no file path)
   - Example frames:
     - `at LoginPage.clickSignIn (...)`
     - `at com.acme.pages.LoginPage.clickSignIn(LoginPage.java:42)`
   - Search the codebase to resolve the class/module to a single file.

3. **If resolution fails**
   - Prompt the user:
     - *"I can’t uniquely locate the POM file from this log. Please provide the Page Object folder path (e.g., `src/pages`, `src/page-objects`, `tests/pages`)."*
   - Then search only within that folder.

If multiple candidate files match, ask the user to choose one (show the list of paths).

### Step 4 — Discover an Updated Locator (Prefer Playwright CLI)

Use this strict tooling order:

1) **Playwright CLI (first try)**

- Open and navigate:
   - `playwright-cli open <baseUrl>` (or `playwright-cli open` then `playwright-cli goto <url>`)
- Reproduce minimal UI state (click/fill as needed), then snapshot:
   - `playwright-cli snapshot`
- Generate candidate locator(s) for the target element:
   - `playwright-cli generate-locator <ref> --raw`

Validate the candidate is unique and stable (no indexes/dynamic IDs). If the snapshot does not include the target element, you are not in the right UI state yet.

2) **Playwright MCP / browser tools (fallback only)**

Use Playwright MCP/browser automation tools only if Playwright CLI is unavailable, cannot attach/open, or cannot yield a stable unique locator.

In fallback mode:
1. Open the application page relevant to the failure.
2. Reproduce the minimal UI state needed for the element to exist.
3. Generate and validate locator candidates for the target element.

#### Locator Strategy (STRICT PRIORITY ORDER)

Always prefer **Playwright-native resilient locators** in this exact order:

1. `page.getByRole()`
2. `page.getByText()`
3. `page.getByLabel()`
4. `page.getByPlaceholder()`
5. `page.getByTitle()`
6. `page.getByTestId()`
7. `page.getByAltText()`

Fallback only if necessary:
- `page.locator('css=...')`
- `page.locator('xpath=...')`
- `page.locator('#submit')`
- `page.locator('.submit-btn')`
- `page.locator('button[type="submit"]')`
- `page.locator('input[name="email"]')`

#### Locator Acceptance Rules

A candidate locator is acceptable only if:

- **Unique:** resolves to exactly one element (`count() == 1`).
- **Stable:** avoids dynamic ids/attributes and avoids index-based selectors.
- **Readable:** uses user-facing semantics (role/name/label/text) when possible.
- **Correct:** targets the intended element (not a nearby container).

If you cannot find a unique and stable locator, stop and ask the user for additional element context (label text, button name, screenshot, or DOM snippet).

### Step 5 — Patch the Locator (Minimal Blast Radius)

1. Edit only the impacted POM file (or its locator constant) unless the framework requires centralised selectors.
2. Preserve:
   - existing method names and signatures
   - page object structure
   - calling code contracts
3. Replace the broken locator with the chosen locator expression.

### Step 6 — Verify

Preferred verification:
- rerun the smallest scoped test (single spec / single scenario / `-g` / tag filter) that proves the locator works.

If you cannot run tests (missing command or environment), provide:
- the exact file changed
- the old locator
- the new locator
- the rationale for why it’s stable and unique

## Output Format (Always)

Print a short summary:

```
=== SELF-HEALING COMPLETE ===
Issue type: Test issue — bad selector
POM file: <path>
Element: <brief description>
Old locator: <...>
New locator: <...>
Verification: <rerun command + pass/fail OR not run + why>
```

## Example Transformation (Illustrative)

❌ Before:
```ts
await page.locator("//button[@id='submit123']").click();
```

✅ After (preferred):
```ts
await page.getByRole('button', { name: 'Submit' }).click();
```

✅ After (fallback only):
```ts
await page.locator("css=button[type='submit']").click();
```