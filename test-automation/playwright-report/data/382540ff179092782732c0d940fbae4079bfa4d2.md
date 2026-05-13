# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: file-validation.spec.ts >> FR-003: File Size Validation >> AC-007: File exceeding limit shows specific error message
- Location: tests\file-validation.spec.ts:184:7

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator:  locator('#messageArea')
Expected: "File size exceeds 50 MB limit. Please select a smaller file."
Received: ""
Timeout:  2000ms

Call log:
  - Expect "toHaveText" with timeout 2000ms
  - waiting for locator('#messageArea')
    19 × locator resolved to <div role="alert" id="messageArea" class="message-area" aria-live="assertive"></div>
       - unexpected value ""

```

```yaml
- main:
  - heading "PDF Document Upload" [level=1]
  - button "Choose PDF File"
  - status
  - button "Upload File" [disabled]
  - alert
```

# Test source

```ts
  94  | 
  95  |   test('AC-003: System checks file extension matches .pdf (case-insensitive)', async ({ page }) => {
  96  |     await page.goto('/');
  97  | 
  98  |     const fixturesDir = path.join(__dirname, '../fixtures');
  99  | 
  100 |     // Test with .txt file - should show error
  101 |     await page.setInputFiles('#fileInput', path.join(fixturesDir, 'document.txt'));
  102 | 
  103 |     // Verify error message appears
  104 |     const messageArea = page.locator('#messageArea');
  105 |     await expect(messageArea).toContainText('Invalid file type. Please select a PDF document.', { timeout: 2000 });
  106 |   });
  107 | 
  108 |   test('AC-004: System verifies MIME type is application/pdf', async ({ page }) => {
  109 |     await page.goto('/');
  110 | 
  111 |     const fixturesDir = path.join(__dirname, '../fixtures');
  112 | 
  113 |     // Select JPEG file
  114 |     await page.setInputFiles('#fileInput', path.join(fixturesDir, 'image.jpg'));
  115 | 
  116 |     // Verify error message
  117 |     const messageArea = page.locator('#messageArea');
  118 |     await expect(messageArea).toContainText('Invalid file type. Please select a PDF document.', { timeout: 2000 });
  119 |   });
  120 | 
  121 |   test('AC-005: Invalid file type displays error message', async ({ page }) => {
  122 |     await page.goto('/');
  123 | 
  124 |     const fixturesDir = path.join(__dirname, '../fixtures');
  125 | 
  126 |     // Select non-PDF file
  127 |     await page.setInputFiles('#fileInput', path.join(fixturesDir, 'document.txt'));
  128 | 
  129 |     // Verify exact error message
  130 |     const messageArea = page.locator('#messageArea');
  131 |     await expect(messageArea).toHaveText('Invalid file type. Please select a PDF document.', { timeout: 2000 });
  132 | 
  133 |     // Verify upload button remains disabled
  134 |     const uploadButton = page.locator('#uploadBtn');
  135 |     await expect(uploadButton).toBeDisabled();
  136 |   });
  137 | 
  138 |   test('Valid PDF file passes client-side validation', async ({ page }) => {
  139 |     await page.goto('/');
  140 | 
  141 |     const fixturesDir = path.join(__dirname, '../fixtures');
  142 | 
  143 |     // Select valid PDF
  144 |     await page.setInputFiles('#fileInput', path.join(fixturesDir, 'valid.pdf'));
  145 | 
  146 |     // Verify filename displays
  147 |     const filenameDisplay = page.locator('#selectedFileName');
  148 |     await expect(filenameDisplay).toContainText('Selected: valid.pdf', { timeout: 2000 });
  149 | 
  150 |     // Verify upload button is enabled
  151 |     const uploadButton = page.locator('#uploadBtn');
  152 |     await expect(uploadButton).toBeEnabled();
  153 |   });
  154 | });
  155 | 
  156 | test.describe('FR-003: File Size Validation', () => {
  157 | 
  158 |   test.beforeAll(() => {
  159 |     const fixturesDir = path.join(__dirname, '../fixtures');
  160 | 
  161 |     // Create a small valid PDF (already created in FR-002)
  162 |     // Create a large file (simulating >50MB)
  163 |     const largePdf = path.join(fixturesDir, 'large.pdf');
  164 |     const size51MB = 51 * 1024 * 1024; // 51 MB
  165 |     const buffer = Buffer.alloc(size51MB);
  166 |     // Add minimal PDF header
  167 |     buffer.write('%PDF-1.4\n', 0);
  168 |     fs.writeFileSync(largePdf, buffer);
  169 |   });
  170 | 
  171 |   test('AC-006: System rejects files larger than 50 MB', async ({ page }) => {
  172 |     await page.goto('/');
  173 | 
  174 |     const fixturesDir = path.join(__dirname, '../fixtures');
  175 | 
  176 |     // Select large file
  177 |     await page.setInputFiles('#fileInput', path.join(fixturesDir, 'large.pdf'));
  178 | 
  179 |     // Verify error message appears
  180 |     const messageArea = page.locator('#messageArea');
  181 |     await expect(messageArea).toContainText('File size exceeds 50 MB limit', { timeout: 2000 });
  182 |   });
  183 | 
  184 |   test('AC-007: File exceeding limit shows specific error message', async ({ page }) => {
  185 |     await page.goto('/');
  186 | 
  187 |     const fixturesDir = path.join(__dirname, '../fixtures');
  188 | 
  189 |     // Select large file
  190 |     await page.setInputFiles('#fileInput', path.join(fixturesDir, 'large.pdf'));
  191 | 
  192 |     // Verify exact error message
  193 |     const messageArea = page.locator('#messageArea');
> 194 |     await expect(messageArea).toHaveText('File size exceeds 50 MB limit. Please select a smaller file.', { timeout: 2000 });
      |                               ^ Error: expect(locator).toHaveText(expected) failed
  195 | 
  196 |     // Verify upload button remains disabled
  197 |     const uploadButton = page.locator('#uploadBtn');
  198 |     await expect(uploadButton).toBeDisabled();
  199 |   });
  200 | });
  201 | 
```