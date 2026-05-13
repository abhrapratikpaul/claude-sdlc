# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: file-validation.spec.ts >> FR-002: File Type Validation >> AC-004: System verifies MIME type is application/pdf
- Location: tests\file-validation.spec.ts:111:7

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
  17  |     }
  18  | 
  19  |     // Create a valid PDF test file (minimal PDF structure)
  20  |     const validPdf = path.join(fixturesDir, 'valid.pdf');
  21  |     const pdfContent = `%PDF-1.4
  22  | 1 0 obj
  23  | <<
  24  | /Type /Catalog
  25  | /Pages 2 0 R
  26  | >>
  27  | endobj
  28  | 2 0 obj
  29  | <<
  30  | /Type /Pages
  31  | /Kids [3 0 R]
  32  | /Count 1
  33  | >>
  34  | endobj
  35  | 3 0 obj
  36  | <<
  37  | /Type /Page
  38  | /Parent 2 0 R
  39  | /Resources <<
  40  | /Font <<
  41  | /F1 <<
  42  | /Type /Font
  43  | /Subtype /Type1
  44  | /BaseFont /Helvetica
  45  | >>
  46  | >>
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
  101 |     const fileChooserPromise = page.waitForEvent('filechooser');
  102 |     await page.locator('#selectFileBtn').click();
  103 |     const fileChooser = await fileChooserPromise;
  104 |     await fileChooser.setFiles(path.join(fixturesDir, 'document.txt'));
  105 | 
  106 |     // Verify error message appears
  107 |     const messageArea = page.locator('#messageArea');
  108 |     await expect(messageArea).toContainText('Invalid file type. Please select a PDF document.');
  109 |   });
  110 | 
  111 |   test('AC-004: System verifies MIME type is application/pdf', async ({ page }) => {
  112 |     await page.goto('/');
  113 | 
  114 |     const fixturesDir = path.join(__dirname, '../fixtures');
  115 | 
  116 |     // Select JPEG file
> 117 |     const fileChooserPromise = page.waitForEvent('filechooser');
      |                                     ^ Error: page.waitForEvent: Test timeout of 30000ms exceeded.
  118 |     await page.locator('#selectFileBtn').click();
  119 |     const fileChooser = await fileChooserPromise;
  120 |     await fileChooser.setFiles(path.join(fixturesDir, 'image.jpg'));
  121 | 
  122 |     // Verify error message
  123 |     const messageArea = page.locator('#messageArea');
  124 |     await expect(messageArea).toContainText('Invalid file type. Please select a PDF document.');
  125 |   });
  126 | 
  127 |   test('AC-005: Invalid file type displays error message', async ({ page }) => {
  128 |     await page.goto('/');
  129 | 
  130 |     const fixturesDir = path.join(__dirname, '../fixtures');
  131 | 
  132 |     // Select non-PDF file
  133 |     const fileChooserPromise = page.waitForEvent('filechooser');
  134 |     await page.locator('#selectFileBtn').click();
  135 |     const fileChooser = await fileChooserPromise;
  136 |     await fileChooser.setFiles(path.join(fixturesDir, 'document.txt'));
  137 | 
  138 |     // Verify exact error message
  139 |     const messageArea = page.locator('#messageArea');
  140 |     await expect(messageArea).toHaveText('Invalid file type. Please select a PDF document.');
  141 | 
  142 |     // Verify upload button remains disabled
  143 |     const uploadButton = page.locator('#uploadBtn');
  144 |     await expect(uploadButton).toBeDisabled();
  145 |   });
  146 | 
  147 |   test('Valid PDF file passes client-side validation', async ({ page }) => {
  148 |     await page.goto('/');
  149 | 
  150 |     const fixturesDir = path.join(__dirname, '../fixtures');
  151 | 
  152 |     // Select valid PDF
  153 |     const fileChooserPromise = page.waitForEvent('filechooser');
  154 |     await page.locator('#selectFileBtn').click();
  155 |     const fileChooser = await fileChooserPromise;
  156 |     await fileChooser.setFiles(path.join(fixturesDir, 'valid.pdf'));
  157 | 
  158 |     // Verify filename displays
  159 |     const filenameDisplay = page.locator('#selectedFileName');
  160 |     await expect(filenameDisplay).toContainText('Selected: valid.pdf');
  161 | 
  162 |     // Verify upload button is enabled
  163 |     const uploadButton = page.locator('#uploadBtn');
  164 |     await expect(uploadButton).toBeEnabled();
  165 |   });
  166 | });
  167 | 
  168 | test.describe('FR-003: File Size Validation', () => {
  169 | 
  170 |   test.beforeAll(() => {
  171 |     const fixturesDir = path.join(__dirname, '../fixtures');
  172 | 
  173 |     // Create a small valid PDF (already created in FR-002)
  174 |     // Create a large file (simulating >50MB)
  175 |     const largePdf = path.join(fixturesDir, 'large.pdf');
  176 |     const size51MB = 51 * 1024 * 1024; // 51 MB
  177 |     const buffer = Buffer.alloc(size51MB);
  178 |     // Add minimal PDF header
  179 |     buffer.write('%PDF-1.4\n', 0);
  180 |     fs.writeFileSync(largePdf, buffer);
  181 |   });
  182 | 
  183 |   test('AC-006: System rejects files larger than 50 MB', async ({ page }) => {
  184 |     await page.goto('/');
  185 | 
  186 |     const fixturesDir = path.join(__dirname, '../fixtures');
  187 | 
  188 |     // Select large file
  189 |     const fileChooserPromise = page.waitForEvent('filechooser');
  190 |     await page.locator('#selectFileBtn').click();
  191 |     const fileChooser = await fileChooserPromise;
  192 |     await fileChooser.setFiles(path.join(fixturesDir, 'large.pdf'));
  193 | 
  194 |     // Verify error message appears
  195 |     const messageArea = page.locator('#messageArea');
  196 |     await expect(messageArea).toContainText('File size exceeds 50 MB limit');
  197 |   });
  198 | 
  199 |   test('AC-007: File exceeding limit shows specific error message', async ({ page }) => {
  200 |     await page.goto('/');
  201 | 
  202 |     const fixturesDir = path.join(__dirname, '../fixtures');
  203 | 
  204 |     // Select large file
  205 |     const fileChooserPromise = page.waitForEvent('filechooser');
  206 |     await page.locator('#selectFileBtn').click();
  207 |     const fileChooser = await fileChooserPromise;
  208 |     await fileChooser.setFiles(path.join(fixturesDir, 'large.pdf'));
  209 | 
  210 |     // Verify exact error message
  211 |     const messageArea = page.locator('#messageArea');
  212 |     await expect(messageArea).toHaveText('File size exceeds 50 MB limit. Please select a smaller file.');
  213 | 
  214 |     // Verify upload button remains disabled
  215 |     const uploadButton = page.locator('#uploadBtn');
  216 |     await expect(uploadButton).toBeDisabled();
  217 |   });
```