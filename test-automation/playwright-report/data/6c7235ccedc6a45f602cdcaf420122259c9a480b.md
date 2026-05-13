# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: nfr-accessibility.spec.ts >> NFR-006: Browser Compatibility >> JavaScript is enabled and functional
- Location: tests\nfr-accessibility.spec.ts:258:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForEvent: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for event "filechooser"
============================================================
```

# Page snapshot

```yaml
- main [ref=e2]:
  - heading "PDF Document Upload" [level=1] [ref=e3]
  - generic [ref=e4]:
    - button "Choose PDF File" [active] [ref=e5]
    - status
    - button "Upload File" [disabled] [ref=e6]
  - alert
```

# Test source

```ts
  162 |     await expect(page.locator('#selectFileBtn')).toBeVisible();
  163 |     await expect(page.locator('#uploadBtn')).toBeVisible();
  164 |     await expect(page.locator('#messageArea')).toBeVisible();
  165 |   });
  166 | 
  167 |   test('AC-032: Drag-and-drop is out of scope', async ({ page }) => {
  168 |     await page.goto('/');
  169 | 
  170 |     // Verify no drag-and-drop zone or instructions
  171 |     const content = await page.content();
  172 |     expect(content.toLowerCase()).not.toContain('drag');
  173 |     expect(content.toLowerCase()).not.toContain('drop');
  174 | 
  175 |     // File input should not have multiple attribute
  176 |     const fileInput = page.locator('#fileInput');
  177 |     const isMultiple = await fileInput.evaluate(el => (el as HTMLInputElement).multiple);
  178 |     expect(isMultiple).toBe(false);
  179 |   });
  180 | 
  181 |   test('UI contains only essential elements', async ({ page }) => {
  182 |     await page.goto('/');
  183 | 
  184 |     // Count total interactive elements
  185 |     const buttons = await page.locator('button').count();
  186 |     expect(buttons).toBe(3); // select, upload, retry
  187 | 
  188 |     const inputs = await page.locator('input').count();
  189 |     expect(inputs).toBe(1); // file input only
  190 |   });
  191 | });
  192 | 
  193 | test.describe('NFR-005: Performance', () => {
  194 | 
  195 |   test('AC-033: UI interactions respond within 200ms', async ({ page }) => {
  196 |     await page.goto('/');
  197 | 
  198 |     // Test button click responsiveness
  199 |     const startTime = Date.now();
  200 |     const fileChooserPromise = page.waitForEvent('filechooser');
  201 |     await page.locator('#selectFileBtn').click();
  202 |     await fileChooserPromise;
  203 |     const elapsed = Date.now() - startTime;
  204 | 
  205 |     expect(elapsed).toBeLessThan(200);
  206 |   });
  207 | 
  208 |   test('Validation feedback appears within 200ms', async ({ page }) => {
  209 |     await page.goto('/');
  210 | 
  211 |     const fixturesDir = require('path').join(__dirname, '../fixtures');
  212 | 
  213 |     // Select invalid file
  214 |     const fileChooserPromise = page.waitForEvent('filechooser');
  215 |     await page.locator('#selectFileBtn').click();
  216 |     const fileChooser = await fileChooserPromise;
  217 | 
  218 |     const startTime = Date.now();
  219 |     await fileChooser.setFiles(require('path').join(fixturesDir, 'document.txt'));
  220 | 
  221 |     // Wait for error message
  222 |     const messageArea = page.locator('#messageArea');
  223 |     await expect(messageArea).not.toBeEmpty({ timeout: 500 });
  224 | 
  225 |     const elapsed = Date.now() - startTime;
  226 |     expect(elapsed).toBeLessThan(200);
  227 |   });
  228 | 
  229 |   test('Page loads quickly', async ({ page }) => {
  230 |     const startTime = Date.now();
  231 |     await page.goto('/');
  232 |     const elapsed = Date.now() - startTime;
  233 | 
  234 |     // Page should load in under 2 seconds
  235 |     expect(elapsed).toBeLessThan(2000);
  236 |   });
  237 | });
  238 | 
  239 | test.describe('NFR-006: Browser Compatibility', () => {
  240 | 
  241 |   test('AC-034: Application works in modern browsers', async ({ page, browserName }) => {
  242 |     await page.goto('/');
  243 | 
  244 |     // Verify core functionality loads
  245 |     await expect(page.locator('#selectFileBtn')).toBeVisible();
  246 |     await expect(page.locator('#uploadBtn')).toBeVisible();
  247 | 
  248 |     // Test basic interaction
  249 |     const fileChooserPromise = page.waitForEvent('filechooser');
  250 |     await page.locator('#selectFileBtn').click();
  251 |     const fileChooser = await fileChooserPromise;
  252 |     expect(fileChooser).toBeTruthy();
  253 | 
  254 |     // Log browser for verification
  255 |     console.log(`Test passed in browser: ${browserName}`);
  256 |   });
  257 | 
  258 |   test('JavaScript is enabled and functional', async ({ page }) => {
  259 |     await page.goto('/');
  260 | 
  261 |     // Verify JavaScript event handlers work
> 262 |     const fileChooserPromise = page.waitForEvent('filechooser');
      |                                     ^ Error: page.waitForEvent: Test timeout of 30000ms exceeded.
  263 |     await page.locator('#selectFileBtn').click();
  264 |     const fileChooser = await fileChooserPromise;
  265 |     expect(fileChooser).toBeTruthy();
  266 |   });
  267 | 
  268 |   test('CSS styles are applied', async ({ page }) => {
  269 |     await page.goto('/');
  270 | 
  271 |     // Check that button has styling
  272 |     const selectBtn = page.locator('#selectFileBtn');
  273 |     const backgroundColor = await selectBtn.evaluate(el => {
  274 |       return window.getComputedStyle(el).backgroundColor;
  275 |     });
  276 | 
  277 |     // Should have some background color (not default transparent)
  278 |     expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  279 |   });
  280 | });
  281 | 
```