# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: nfr-security.spec.ts >> NFR-003: Security Validation >> Backend handles empty filename attacks
- Location: tests\nfr-security.spec.ts:166:7

# Error details

```
TypeError: apiRequestContext.post: stream3.on is not a function
```

# Test source

```ts
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
  82  |     const fileChooserPromise = page.waitForEvent('filechooser');
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
> 170 |     const response = await context.post('http://localhost:5000/upload', {
      |                                    ^ TypeError: apiRequestContext.post: stream3.on is not a function
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
  183 |     expect(body.error).toBeTruthy();
  184 |   });
  185 | 
  186 |   test('Backend limits file size to prevent DoS', async () => {
  187 |     const context = await request.newContext();
  188 | 
  189 |     // Try uploading file larger than 50MB
  190 |     const size51MB = 51 * 1024 * 1024;
  191 |     const largeBuffer = Buffer.alloc(size51MB);
  192 |     largeBuffer.write('%PDF-1.4\n', 0);
  193 | 
  194 |     const response = await context.post('http://localhost:5000/upload', {
  195 |       multipart: {
  196 |         file: {
  197 |           name: 'large.pdf',
  198 |           mimeType: 'application/pdf',
  199 |           buffer: largeBuffer
  200 |         }
  201 |       },
  202 |       timeout: 30000 // 30s timeout for large upload
  203 |     });
  204 | 
  205 |     // Should reject (413 or 400)
  206 |     expect([400, 413]).toContain(response.status());
  207 |   });
  208 | 
  209 |   test('Backend returns safe error messages (no stack traces)', async () => {
  210 |     const context = await request.newContext();
  211 | 
  212 |     // Trigger various errors
  213 |     const response1 = await context.post('http://localhost:5000/upload');
  214 |     const body1 = await response1.json();
  215 | 
  216 |     // Error message should be user-friendly, not expose internals
  217 |     expect(body1.error).toBeTruthy();
  218 |     expect(body1.error.toLowerCase()).not.toContain('traceback');
  219 |     expect(body1.error.toLowerCase()).not.toContain('exception');
  220 |     expect(JSON.stringify(body1)).not.toContain('File "');
  221 |   });
  222 | 
  223 |   test('CORS headers are present for cross-origin requests', async () => {
  224 |     const context = await request.newContext();
  225 | 
  226 |     const response = await context.get('http://localhost:5000/', {
  227 |       headers: {
  228 |         'Origin': 'http://example.com'
  229 |       }
  230 |     });
  231 | 
  232 |     const headers = response.headers();
  233 |     expect(headers['access-control-allow-origin']).toBeTruthy();
  234 |   });
  235 | });
  236 | 
```