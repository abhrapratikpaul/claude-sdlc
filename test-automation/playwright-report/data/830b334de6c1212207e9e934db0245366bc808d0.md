# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: file-validation.spec.ts >> FR-002: File Type Validation >> Valid PDF file passes client-side validation
- Location: tests\file-validation.spec.ts:141:7

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
  47  | >>
  48  | /MediaBox [0 0 612 792]
  49  | /Contents 4 0 R
  50  | >>
  51  | endobj
  52  | 4 0 obj
  53  | <<
  54  | /Length 44
  55  | >>
  56  | stream
  57  | BT
  58  | /F1 12 Tf
  59  | 100 700 Td
  60  | (Test PDF) Tj
  61  | ET
  62  | endstream
  63  | endobj
  64  | xref
  65  | 0 5
  66  | 0000000000 65535 f
  67  | 0000000009 00000 n
  68  | 0000000058 00000 n
  69  | 0000000115 00000 n
  70  | 0000000317 00000 n
  71  | trailer
  72  | <<
  73  | /Size 5
  74  | /Root 1 0 R
  75  | >>
  76  | startxref
  77  | 409
  78  | %%EOF`;
  79  |     fs.writeFileSync(validPdf, pdfContent);
  80  | 
  81  |     // Create a JPEG file
  82  |     const jpegFile = path.join(fixturesDir, 'image.jpg');
  83  |     const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
  84  |     fs.writeFileSync(jpegFile, jpegHeader);
  85  | 
  86  |     // Create a text file
  87  |     const txtFile = path.join(fixturesDir, 'document.txt');
  88  |     fs.writeFileSync(txtFile, 'This is a text file, not a PDF');
  89  | 
  90  |     // Create a file with .pdf extension but wrong content
  91  |     const fakePdf = path.join(fixturesDir, 'fake.pdf');
  92  |     fs.writeFileSync(fakePdf, 'This is not really a PDF');
  93  |   });
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
  144 |     const fileChooserPromise = page.waitForEvent('filechooser');
  145 |     await page.locator('#selectFileBtn').click();
  146 |     const fileChooser = await fileChooserPromise;
> 147 |     await fileChooser.setFiles(path.join(fixturesDir, 'valid.pdf'));
      |                                     ^ Error: page.waitForEvent: Test timeout of 30000ms exceeded.
  148 | 
  149 |     // Verify filename displays
  150 |     const filenameDisplay = page.locator('#selectedFileName');
  151 |     await expect(filenameDisplay).toContainText('Selected: valid.pdf');
  152 | 
  153 |     // Verify upload button is enabled
  154 |     const uploadButton = page.locator('#uploadBtn');
  155 |     await expect(uploadButton).toBeEnabled();
  156 |   });
  157 | });
  158 | 
  159 | test.describe('FR-003: File Size Validation', () => {
  160 | 
  161 |   test.beforeAll(() => {
  162 |     const fixturesDir = path.join(__dirname, '../fixtures');
  163 | 
  164 |     // Create a small valid PDF (already created in FR-002)
  165 |     // Create a large file (simulating >50MB)
  166 |     const largePdf = path.join(fixturesDir, 'large.pdf');
  167 |     const size51MB = 51 * 1024 * 1024; // 51 MB
  168 |     const buffer = Buffer.alloc(size51MB);
  169 |     // Add minimal PDF header
  170 |     buffer.write('%PDF-1.4\n', 0);
  171 |     fs.writeFileSync(largePdf, buffer);
  172 |   });
  173 | 
  174 |   test('AC-006: System rejects files larger than 50 MB', async ({ page }) => {
  175 |     await page.goto('/');
  176 | 
  177 |     const fixturesDir = path.join(__dirname, '../fixtures');
  178 | 
  179 |     // Select large file
  180 |     const fileChooserPromise = page.waitForEvent('filechooser');
  181 |     await page.locator('#selectFileBtn').click();
  182 |     const fileChooser = await fileChooserPromise;
  183 |     await fileChooser.setFiles(path.join(fixturesDir, 'large.pdf'));
  184 | 
  185 |     // Verify error message appears
  186 |     const messageArea = page.locator('#messageArea');
  187 |     await expect(messageArea).toContainText('File size exceeds 50 MB limit');
  188 |   });
  189 | 
  190 |   test('AC-007: File exceeding limit shows specific error message', async ({ page }) => {
  191 |     await page.goto('/');
  192 | 
  193 |     const fixturesDir = path.join(__dirname, '../fixtures');
  194 | 
  195 |     // Select large file
  196 |     const fileChooserPromise = page.waitForEvent('filechooser');
  197 |     await page.locator('#selectFileBtn').click();
  198 |     const fileChooser = await fileChooserPromise;
  199 |     await fileChooser.setFiles(path.join(fixturesDir, 'large.pdf'));
  200 | 
  201 |     // Verify exact error message
  202 |     const messageArea = page.locator('#messageArea');
  203 |     await expect(messageArea).toHaveText('File size exceeds 50 MB limit. Please select a smaller file.');
  204 | 
  205 |     // Verify upload button remains disabled
  206 |     const uploadButton = page.locator('#uploadBtn');
  207 |     await expect(uploadButton).toBeDisabled();
  208 |   });
  209 | });
  210 | 
```