# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: backend-api.spec.ts >> FR-008: File Storage >> AC-019: System overwrites file if same name exists
- Location: tests\backend-api.spec.ts:68:7

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
  1   | import { test, expect, request } from '@playwright/test';
  2   | import path from 'path';
  3   | import fs from 'fs';
  4   | 
  5   | /**
  6   |  * Test Suite: Backend API and Storage
  7   |  * Covers: AC-018, AC-019 (FR-008), AC-020, AC-021, AC-022 (FR-009)
  8   |  */
  9   | 
  10  | test.describe('FR-008: File Storage', () => {
  11  | 
  12  |   test.beforeAll(() => {
  13  |     const fixturesDir = path.join(__dirname, '../fixtures');
  14  |     if (!fs.existsSync(fixturesDir)) {
  15  |       fs.mkdirSync(fixturesDir, { recursive: true });
  16  |     }
  17  | 
  18  |     const testPdf = path.join(fixturesDir, 'storage-test.pdf');
  19  |     if (!fs.existsSync(testPdf)) {
  20  |       const pdfContent = `%PDF-1.4
  21  | 1 0 obj
  22  | << /Type /Catalog /Pages 2 0 R >>
  23  | endobj
  24  | xref
  25  | 0 2
  26  | 0000000000 65535 f
  27  | 0000000009 00000 n
  28  | trailer
  29  | << /Size 2 /Root 1 0 R >>
  30  | startxref
  31  | 58
  32  | %%EOF`;
  33  |       fs.writeFileSync(testPdf, pdfContent);
  34  |     }
  35  |   });
  36  | 
  37  |   test('AC-018: Uploaded files stored in upload directory', async ({ page }) => {
  38  |     await page.goto('/');
  39  | 
  40  |     const fixturesDir = path.join(__dirname, '../fixtures');
  41  |     const uploadDir = path.join(__dirname, '../../dev/upload');
  42  | 
  43  |     // Clean upload directory before test
  44  |     if (fs.existsSync(uploadDir)) {
  45  |       const files = fs.readdirSync(uploadDir);
  46  |       for (const file of files) {
  47  |         fs.unlinkSync(path.join(uploadDir, file));
  48  |       }
  49  |     }
  50  | 
  51  |     // Upload file
  52  |     const fileChooserPromise = page.waitForEvent('filechooser');
  53  |     await page.locator('#selectFileBtn').click();
  54  |     const fileChooser = await fileChooserPromise;
  55  |     await fileChooser.setFiles(path.join(fixturesDir, 'storage-test.pdf'));
  56  | 
  57  |     await page.locator('#uploadBtn').click();
  58  | 
  59  |     // Wait for success
  60  |     const messageArea = page.locator('#messageArea');
  61  |     await expect(messageArea).toContainText('File uploaded successfully', { timeout: 10000 });
  62  | 
  63  |     // Verify file exists in upload directory
  64  |     const uploadedFile = path.join(uploadDir, 'storage-test.pdf');
  65  |     expect(fs.existsSync(uploadedFile)).toBe(true);
  66  |   });
  67  | 
  68  |   test('AC-019: System overwrites file if same name exists', async ({ page }) => {
  69  |     await page.goto('/');
  70  | 
  71  |     const fixturesDir = path.join(__dirname, '../fixtures');
  72  |     const uploadDir = path.join(__dirname, '../../dev/upload');
  73  | 
  74  |     // Create test file with unique content
  75  |     const testFile = path.join(fixturesDir, 'overwrite-test.pdf');
  76  |     const content1 = '%PDF-1.4\nFirst version\n%%EOF';
  77  |     fs.writeFileSync(testFile, content1);
  78  | 
  79  |     // First upload
> 80  |     let fileChooserPromise = page.waitForEvent('filechooser');
      |                                   ^ Error: page.waitForEvent: Test timeout of 30000ms exceeded.
  81  |     await page.locator('#selectFileBtn').click();
  82  |     let fileChooser = await fileChooserPromise;
  83  |     await fileChooser.setFiles(testFile);
  84  |     await page.locator('#uploadBtn').click();
  85  | 
  86  |     const messageArea = page.locator('#messageArea');
  87  |     await expect(messageArea).toContainText('File uploaded successfully', { timeout: 10000 });
  88  | 
  89  |     // Modify test file
  90  |     const content2 = '%PDF-1.4\nSecond version\n%%EOF';
  91  |     fs.writeFileSync(testFile, content2);
  92  | 
  93  |     // Reload page for second upload
  94  |     await page.reload();
  95  | 
  96  |     // Second upload (same filename)
  97  |     fileChooserPromise = page.waitForEvent('filechooser');
  98  |     await page.locator('#selectFileBtn').click();
  99  |     fileChooser = await fileChooserPromise;
  100 |     await fileChooser.setFiles(testFile);
  101 |     await page.locator('#uploadBtn').click();
  102 | 
  103 |     await expect(messageArea).toContainText('File uploaded successfully', { timeout: 10000 });
  104 | 
  105 |     // Verify file was overwritten
  106 |     const uploadedFile = path.join(uploadDir, 'overwrite-test.pdf');
  107 |     const uploadedContent = fs.readFileSync(uploadedFile, 'utf8');
  108 |     expect(uploadedContent).toBe(content2);
  109 |   });
  110 | });
  111 | 
  112 | test.describe('FR-009: Backend API Endpoint', () => {
  113 | 
  114 |   test('AC-020: Backend exposes /upload endpoint accepting POST', async () => {
  115 |     const context = await request.newContext();
  116 | 
  117 |     // Try GET request - should fail or return method not allowed
  118 |     const getResponse = await context.get('http://localhost:5000/upload');
  119 |     expect(getResponse.status()).not.toBe(200); // Should not accept GET
  120 | 
  121 |     // POST request without file - should return 400
  122 |     const postResponse = await context.post('http://localhost:5000/upload');
  123 |     expect(postResponse.status()).toBe(400);
  124 |   });
  125 | 
  126 |   test('AC-021: Endpoint accepts multipart/form-data with file field', async () => {
  127 |     const context = await request.newContext();
  128 |     const fixturesDir = path.join(__dirname, '../fixtures');
  129 | 
  130 |     // Create form data with file
  131 |     const filePath = path.join(fixturesDir, 'storage-test.pdf');
  132 |     const fileContent = fs.readFileSync(filePath);
  133 | 
  134 |     const response = await context.post('http://localhost:5000/upload', {
  135 |       multipart: {
  136 |         file: {
  137 |           name: 'storage-test.pdf',
  138 |           mimeType: 'application/pdf',
  139 |           buffer: fileContent
  140 |         }
  141 |       }
  142 |     });
  143 | 
  144 |     // Should return 200 with success message
  145 |     expect(response.status()).toBe(200);
  146 |     const responseBody = await response.json();
  147 |     expect(responseBody.message).toContain('uploaded successfully');
  148 |     expect(responseBody.filename).toBeTruthy();
  149 |   });
  150 | 
  151 |   test('AC-022: Backend implemented using Python Flask', async ({ page }) => {
  152 |     // Verify Flask server is running and serving expected responses
  153 |     await page.goto('/');
  154 | 
  155 |     // Check for Flask-specific response headers or behavior
  156 |     const response = await page.goto('http://localhost:5000/');
  157 |     expect(response?.status()).toBe(200);
  158 | 
  159 |     // Verify HTML is served (Flask serves static files)
  160 |     const content = await page.content();
  161 |     expect(content).toContain('PDF Document Upload');
  162 |   });
  163 | 
  164 |   test('Backend returns JSON responses', async () => {
  165 |     const context = await request.newContext();
  166 | 
  167 |     // Test error response format
  168 |     const response = await context.post('http://localhost:5000/upload');
  169 |     expect(response.status()).toBe(400);
  170 | 
  171 |     const contentType = response.headers()['content-type'];
  172 |     expect(contentType).toContain('application/json');
  173 | 
  174 |     const body = await response.json();
  175 |     expect(body.error).toBeTruthy();
  176 |   });
  177 | 
  178 |   test('Backend handles missing file field', async () => {
  179 |     const context = await request.newContext();
  180 | 
```