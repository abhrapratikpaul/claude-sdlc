# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: nfr-security.spec.ts >> NFR-003: Security Validation >> AC-029: System validates MIME types (client-side)
- Location: tests\nfr-security.spec.ts:69:7

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
  6   |  * Test Suite: Non-Functional Requirements - Security
  7   |  * Covers: AC-028, AC-029, AC-030 (NFR-003)
  8   |  */
  9   | 
  10  | test.describe('NFR-003: Security Validation', () => {
  11  | 
  12  |   test.beforeAll(() => {
  13  |     const fixturesDir = path.join(__dirname, '../fixtures');
  14  |     if (!fs.existsSync(fixturesDir)) {
  15  |       fs.mkdirSync(fixturesDir, { recursive: true });
  16  |     }
  17  | 
  18  |     // Create test files if they don't exist
  19  |     const validPdf = path.join(fixturesDir, 'valid.pdf');
  20  |     if (!fs.existsSync(validPdf)) {
  21  |       const pdfContent = `%PDF-1.4
  22  | 1 0 obj
  23  | << /Type /Catalog /Pages 2 0 R >>
  24  | endobj
  25  | xref
  26  | 0 2
  27  | 0000000000 65535 f
  28  | 0000000009 00000 n
  29  | trailer
  30  | << /Size 2 /Root 1 0 R >>
  31  | startxref
  32  | 58
  33  | %%EOF`;
  34  |       fs.writeFileSync(validPdf, pdfContent);
  35  |     }
  36  | 
  37  |     // Create executable file with .pdf extension
  38  |     const maliciousPdf = path.join(fixturesDir, 'malicious.pdf');
  39  |     const exeHeader = Buffer.from([0x4D, 0x5A]); // MZ header (Windows executable)
  40  |     fs.writeFileSync(maliciousPdf, exeHeader);
  41  |   });
  42  | 
  43  |   test('AC-028: System validates file extensions (client-side)', async ({ page }) => {
  44  |     await page.goto('/');
  45  | 
  46  |     const fixturesDir = path.join(__dirname, '../fixtures');
  47  | 
  48  |     // Try uploading .txt file
  49  |     const fileChooserPromise = page.waitForEvent('filechooser');
  50  |     await page.locator('#selectFileBtn').click();
  51  |     const fileChooser = await fileChooserPromise;
  52  | 
  53  |     // Create a text file
  54  |     const txtFile = path.join(fixturesDir, 'test.txt');
  55  |     if (!fs.existsSync(txtFile)) {
  56  |       fs.writeFileSync(txtFile, 'Test content');
  57  |     }
  58  | 
  59  |     await fileChooser.setFiles(txtFile);
  60  | 
  61  |     // Verify client-side validation rejects it
  62  |     const messageArea = page.locator('#messageArea');
  63  |     await expect(messageArea).toContainText('Invalid file type');
  64  | 
  65  |     const uploadBtn = page.locator('#uploadBtn');
  66  |     await expect(uploadBtn).toBeDisabled();
  67  |   });
  68  | 
  69  |   test('AC-029: System validates MIME types (client-side)', async ({ page }) => {
  70  |     await page.goto('/');
  71  | 
  72  |     const fixturesDir = path.join(__dirname, '../fixtures');
  73  | 
  74  |     // Create JPEG file
  75  |     const jpegFile = path.join(fixturesDir, 'image.jpg');
  76  |     if (!fs.existsSync(jpegFile)) {
  77  |       const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
  78  |       fs.writeFileSync(jpegFile, jpegHeader);
  79  |     }
  80  | 
  81  |     // Try uploading non-PDF with wrong MIME type
> 82  |     const fileChooserPromise = page.waitForEvent('filechooser');
      |                                     ^ Error: page.waitForEvent: Test timeout of 30000ms exceeded.
  83  |     await page.locator('#selectFileBtn').click();
  84  |     const fileChooser = await fileChooserPromise;
  85  |     await fileChooser.setFiles(jpegFile);
  86  | 
  87  |     // Verify client-side MIME validation
  88  |     const messageArea = page.locator('#messageArea');
  89  |     await expect(messageArea).toContainText('Invalid file type');
  90  |   });
  91  | 
  92  |   test('AC-029: Backend validates MIME types (server-side)', async () => {
  93  |     const context = await request.newContext();
  94  | 
  95  |     // Send file with wrong MIME type but .pdf extension
  96  |     const textContent = Buffer.from('This is plain text, not a PDF');
  97  | 
  98  |     const response = await context.post('http://localhost:5000/upload', {
  99  |       multipart: {
  100 |         file: {
  101 |           name: 'fake.pdf',
  102 |           mimeType: 'text/plain',
  103 |           buffer: textContent
  104 |         }
  105 |       }
  106 |     });
  107 | 
  108 |     // Backend should reject
  109 |     expect(response.status()).toBe(400);
  110 |     const body = await response.json();
  111 |     expect(body.error).toBeTruthy();
  112 |   });
  113 | 
  114 |   test('AC-030: Virus/malware scanning is out of scope', async ({ page }) => {
  115 |     // This is a documentation test - verify no scanning occurs
  116 |     await page.goto('/');
  117 | 
  118 |     const fixturesDir = path.join(__dirname, '../fixtures');
  119 | 
  120 |     // Upload file with .pdf extension but executable content
  121 |     // (Should pass basic validation since virus scanning is out of scope)
  122 |     const maliciousPdf = path.join(fixturesDir, 'malicious.pdf');
  123 | 
  124 |     const fileChooserPromise = page.waitForEvent('filechooser');
  125 |     await page.locator('#selectFileBtn').click();
  126 |     const fileChooser = await fileChooserPromise;
  127 |     await fileChooser.setFiles(maliciousPdf);
  128 | 
  129 |     await page.locator('#uploadBtn').click();
  130 | 
  131 |     // System should accept it (no virus scanning)
  132 |     // This demonstrates the limitation, not a failure
  133 |     const messageArea = page.locator('#messageArea');
  134 |     await expect(messageArea).not.toBeEmpty({ timeout: 10000 });
  135 | 
  136 |     // Note: This test passes whether upload succeeds or fails for other reasons
  137 |     // The point is there's NO virus scanning layer
  138 |   });
  139 | 
  140 |   test('Backend prevents path traversal in filenames', async () => {
  141 |     const context = await request.newContext();
  142 | 
  143 |     // Try uploading file with path traversal in name
  144 |     const pdfContent = Buffer.from('%PDF-1.4\n%%EOF');
  145 | 
  146 |     const response = await context.post('http://localhost:5000/upload', {
  147 |       multipart: {
  148 |         file: {
  149 |           name: '../../../etc/passwd.pdf',
  150 |           mimeType: 'application/pdf',
  151 |           buffer: pdfContent
  152 |         }
  153 |       }
  154 |     });
  155 | 
  156 |     // Backend should sanitize filename (werkzeug.secure_filename)
  157 |     // Should succeed with sanitized name, not traverse paths
  158 |     if (response.status() === 200) {
  159 |       const body = await response.json();
  160 |       expect(body.filename).not.toContain('..');
  161 |       expect(body.filename).not.toContain('/');
  162 |       expect(body.filename).not.toContain('\\');
  163 |     }
  164 |   });
  165 | 
  166 |   test('Backend handles empty filename attacks', async () => {
  167 |     const context = await request.newContext();
  168 | 
  169 |     // Send request with empty filename
  170 |     const response = await context.post('http://localhost:5000/upload', {
  171 |       multipart: {
  172 |         file: {
  173 |           name: '',
  174 |           mimeType: 'application/pdf',
  175 |           buffer: Buffer.from('%PDF-1.4\n%%EOF')
  176 |         }
  177 |       }
  178 |     });
  179 | 
  180 |     // Should reject empty filename
  181 |     expect(response.status()).toBe(400);
  182 |     const body = await response.json();
```